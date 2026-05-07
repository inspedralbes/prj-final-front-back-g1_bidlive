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
    
    // Find active conversation to get other user's info
    const activeConv = conversations.find(c => Number(c.id) === Number(urlId));
    const otherUser = activeConv ? {
        id: activeConv.other_id,
        username: activeConv.other_username,
        avatar_url: activeConv.other_avatar_url
    } : null;

    return (
        <div className="min-h-screen bg-[#08080f] text-white font-sans flex flex-col overflow-hidden h-screen">
            <Header />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 overflow-hidden flex">
                <div className="w-full bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl flex h-full">
                    
                    {/* Sidebar: Conversation List */}
                    <div className="w-80 border-r border-white/10 flex flex-col bg-white/5">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-black tracking-tight">Mensajes</h2>
                            <button onClick={refreshConversations} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <span className="material-symbols-outlined text-sm">refresh</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    <p className="text-sm">No tienes mensajes aún.</p>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <div 
                                        key={conv.id}
                                        onClick={() => navigate(`/messages/${conv.id}`)}
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
                                                <span className="text-[10px] text-gray-500">
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
                    <div className="flex-1">
                        <ChatThread conversationId={urlId} otherUser={otherUser} />
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Messages;
