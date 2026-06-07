import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/bidding/';

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const resp = await fetch(`${API_URL}/auth/notifications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.close();
                setSocket(null);
            }
            return;
        }

        fetchNotifications();

        // Establish Global WebSocket connection for notifications
        const ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log('[Notifications] Connected to global WS');
            ws.send(JSON.stringify({
                type: 'REGISTER_USER',
                payload: { userId: user.id }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data);
                if (type === 'NOTIFICATION') {
                    // Add new notification to state
                    setNotifications(prev => [payload, ...prev].slice(0, 50));
                    setUnreadCount(prev => prev + 1);
                    
                    // Dispatch a custom event for global toasts
                    window.dispatchEvent(new CustomEvent('new_notification', { detail: payload }));
                }
            } catch (err) {
                console.error('[Notifications] WS message error:', err);
            }
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const resp = await fetch(`${API_URL}/auth/notifications/${id}/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (resp.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const resp = await fetch(`${API_URL}/auth/notifications/read-all`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (resp.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications };
}
