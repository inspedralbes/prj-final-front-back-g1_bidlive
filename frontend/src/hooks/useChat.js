import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const useChat = (conversationId) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const socketRef = useRef(null);

    // Fetch conversations list
    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    // Fetch messages for a specific conversation
    const fetchMessages = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/chat/conversations/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                // Mark as read when messages are fetched
                await markAsRead(id);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/chat/conversations/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state to clear unread for this conversation
            setConversations(prev => prev.map(c => 
                c.id === Number(id) ? { ...c, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    useEffect(() => {
        if (!user) return;

        // Initialize Socket.io only if not already initialized
        if (!socketRef.current) {
            const token = localStorage.getItem('token');
            socketRef.current = io(API_URL, {
                path: '/chat/socket.io',
                auth: { token },
                transports: ['websocket', 'polling'] // Prefer websocket
            });

            socketRef.current.on('connect', () => {
                console.log('✅ Connected to chat socket');
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('❌ Socket connection error:', err.message);
            });
        }

        const onNewMessage = (message) => {
            // Ensure comparison works by converting both to Number
            if (Number(message.conversation_id) === Number(conversationId)) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            }
            fetchConversations();
        };

        const onNotification = (data) => {
            console.log('New message notification:', data);
            fetchConversations();
        };

        socketRef.current.on('new_message', onNewMessage);
        socketRef.current.on('notification_message', onNotification);

        if (conversationId) {
            socketRef.current.emit('join_conversation', conversationId);
            fetchMessages(conversationId);
        }

        fetchConversations();

        return () => {
            if (socketRef.current) {
                socketRef.current.off('new_message', onNewMessage);
                socketRef.current.off('notification_message', onNotification);
                // We DON'T disconnect here if we want to share the socket, 
                // but since this is a hook, we at least remove listeners.
            }
        };
    }, [user, conversationId]);

    const sendMessage = (recipientId, content) => {
        if (socketRef.current && content.trim()) {
            socketRef.current.emit('send_message', {
                conversationId: Number(conversationId),
                recipientId,
                content
            });
        }
    };

    const startConversation = async (participantId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/chat/conversations`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ participantId })
            });
            if (res.ok) {
                const data = await res.json();
                return data; // returns the conversation object {id, ...}
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    return {
        messages,
        conversations,
        totalUnread,
        loading,
        sendMessage,
        startConversation,
        refreshConversations: fetchConversations
    };
};
