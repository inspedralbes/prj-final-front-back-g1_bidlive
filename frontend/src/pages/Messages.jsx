import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ChatThread from '../components/chat/ChatThread';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Messages = () => {
    const { id: urlId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { conversations, refreshConversations } = useChat(urlId);

    // Mobile: show thread panel when a conversation is selected
    const [showThread, setShowThread] = useState(!!urlId);

    // When URL changes (e.g. navigating to /messages/:id), show the thread
    useEffect(() => {
        if (urlId) setShowThread(true);
    }, [urlId]);

    // Find active conversation to get other user's info
    const activeConv = conversations.find(c => Number(c.id) === Number(urlId));
    const otherUser = activeConv ? {
        id: activeConv.other_id,
        username: activeConv.other_username,
        avatar_url: activeConv.other_avatar_url
    } : null;

    const handleSelectConversation = (convId) => {
        navigate(`/messages/${convId}`);
        setShowThread(true);
    };

    const handleBack = () => {
        setShowThread(false);
    };

    return (
        <div className="min-h-screen bg-[#08080f] text-white font-sans flex flex-col overflow-hidden h-screen">
            <Header />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-0 sm:px-4 lg:px-8 sm:py-4 md:py-8 overflow-hidden flex min-h-0">
                <div className="w-full bg-white/5 border-0 sm:border border-white/10 sm:rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl flex h-full min-h-0">
                    
                    {/* Sidebar: Conversation List */}
                    {/* On mobile: full width, hidden when thread is showing */}
                    {/* On desktop: always visible, fixed width */}
                    <div className={`
                        ${showThread ? 'hidden md:flex' : 'flex'}
                        flex-col w-full md:w-80 md:flex-shrink-0
                        border-r border-white/10 bg-white/5
                    `}>
                        <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-lg sm:text-xl font-black tracking-tight">Mensajes</h2>
                            <button onClick={refreshConversations} className="p-2 hover:bg-white/10 rounded-xl transition-all" title="Actualizar">
                                <span className="material-symbols-outlined text-sm">refresh</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                            {conversations.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    <p className="text-sm">No tienes mensajes aún.</p>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <div 
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv.id)}
                                        className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-white/5 ${
                                            Number(urlId) === Number(conv.id) 
                                            ? 'bg-amber-500/10 border-l-4 border-l-amber-500' 
                                            : 'hover:bg-white/5 border-l-4 border-l-transparent'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-amber-500/10 border border-white/10 flex-shrink-0">
                                            {conv.other_avatar_url ? (
                                                <img src={conv.other_avatar_url.startsWith('http') ? conv.other_avatar_url : `${API_URL}${conv.other_avatar_url}`} 
                                                     className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-amber-500">
                                                    <span className="material-symbols-outlined">person</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h4 className={`text-sm font-bold truncate ${conv.unread_count > 0 ? 'text-white' : 'text-gray-200'}`}>
                                                        {conv.other_username}
                                                    </h4>
                                                    {conv.unread_count > 0 && (
                                                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                                                    {new Date(conv.last_message_at).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate pr-2 ${conv.unread_count > 0 ? 'text-white font-semibold' : 'text-gray-400'}`}>
                                                {conv.last_message || 'Inicia una conversación...'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main: Chat Thread */}
                    {/* On mobile: full width, shown only when thread is active */}
                    {/* On desktop: always visible, takes remaining space */}
                    <div className={`
                        ${showThread ? 'flex' : 'hidden md:flex'}
                        flex-1 flex-col min-w-0 min-h-0
                    `}>
                        <ChatThread conversationId={urlId} otherUser={otherUser} onBack={handleBack} />
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Messages;
