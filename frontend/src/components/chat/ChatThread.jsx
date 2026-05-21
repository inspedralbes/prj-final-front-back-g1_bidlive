import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ChatThread = ({ conversationId, otherUser, onBack }) => {
    const { user } = useAuth();
    const { messages, loading, sendMessage } = useChat(conversationId);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(otherUser?.id, input);
        setInput('');
    };

    if (!conversationId) {
        return (
            <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl">
                {onBack && (
                    <div className="md:hidden p-4 border-b border-white/10">
                        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            <span className="text-sm font-bold">Volver</span>
                        </button>
                    </div>
                )}
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">forum</span>
                    <p className="text-lg font-medium opacity-40">Selecciona una conversación para empezar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0a14] border-l border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-3">
                {/* Mobile back button — only visible on mobile */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white flex-shrink-0"
                        aria-label="Volver a conversaciones"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/10 border border-white/10 flex-shrink-0">
                    {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url.startsWith('http') ? otherUser.avatar_url : `${API_URL}${otherUser.avatar_url}`} 
                             className="w-full h-full object-cover" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-500">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="text-white font-bold truncate">{otherUser?.username || 'Usuario'}</h3>
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">En línea</p>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = Number(msg.sender_id) === Number(user?.id);
                        const isSystem = msg.is_system_message;

                        if (isSystem) {
                            return (
                                <div key={msg.id || i} className="flex justify-center">
                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200/70 text-[11px] px-4 py-2 rounded-2xl max-w-md text-center italic">
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                    isMe 
                                    ? 'bg-amber-500 text-black font-medium rounded-tr-none' 
                                    : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                }`}>
                                    {msg.content}
                                    <div className={`text-[9px] mt-1 opacity-50 ${isMe ? 'text-black' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white/5 backdrop-blur-md border-t border-white/10 flex gap-2 sm:gap-3">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-[#08080f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                    style={{ fontSize: '16px', minHeight: '44px' }}
                />
                <button type="submit" className="w-11 h-11 sm:w-12 sm:h-12 bg-amber-500 rounded-xl flex items-center justify-center text-black hover:bg-amber-400 transition-all shadow-lg active:scale-95 flex-shrink-0">
                    <span className="material-symbols-outlined">send</span>
                </button>
            </form>
        </div>
    );
};

export default ChatThread;
