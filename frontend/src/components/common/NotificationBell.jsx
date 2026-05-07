import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (n) => {
        if (!n.is_read) markAsRead(n.id);
        if (n.link) {
            setIsOpen(false);
            navigate(n.link);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success': return 'text-emerald-400';
            case 'warning': return 'text-amber-400';
            case 'error': return 'text-rose-400';
            case 'outbid': return 'text-orange-400';
            default: return 'text-blue-400';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'warning': return 'warning';
            case 'error': return 'error';
            case 'outbid': return 'trending_up';
            default: return 'notifications';
        }
    };

    return (
        <div className="relative font-inter" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
                <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0d0d12] animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-[#0d0d12]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-fade-in-up">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-gray-500 text-[10px] font-bold uppercase tracking-wider hover:text-amber-400 transition-colors"
                            >
                                Marcar todo como leído
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[380px] scrollbar-thin scrollbar-thumb-white/10">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-gray-600">notifications_off</span>
                                </div>
                                <p className="text-gray-500 text-xs font-medium">No tienes notificaciones aún</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n.id || Math.random()} 
                                    onClick={() => handleNotificationClick(n)}
                                    className={`p-4 border-b border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer relative group ${!n.is_read ? 'bg-white/[0.02]' : ''}`}
                                >
                                    {!n.is_read && (
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-full" />
                                    )}
                                    <div className="flex gap-3">
                                        <div className={`shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${getTypeColor(n.type)}`}>
                                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                {getTypeIcon(n.type)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-xs truncate mb-0.5">{n.title}</p>
                                            <p className="text-gray-400 text-[11px] leading-relaxed mb-1 line-clamp-2">{n.message}</p>
                                            <span className="text-[9px] text-gray-600 font-medium">
                                                {new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 bg-white/[0.02] text-center border-t border-white/10">
                        <button className="text-gray-500 text-[10px] font-bold hover:text-white transition-colors">
                            Ver todo el historial
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
