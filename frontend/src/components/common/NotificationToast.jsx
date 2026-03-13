import React, { useEffect, useState } from 'react';

/**
 * NotificationToast — A temporary overlay for urgent alerts.
 * Props:
 *   message   string   – The text to show
 *   type      string   – 'success' | 'warning' | 'error'
 *   duration  number   – Time in ms before disappearing
 *   onClose   function – Callback when toast is hidden
 */
export default function NotificationToast({ message, type = 'warning', duration = 3000, onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 500); // Wait for fade-out animation
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message) return null;

    const colors = {
        success: {
            bg: 'rgba(34, 197, 94, 0.95)',
            border: 'rgba(34, 197, 94, 0.5)',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            )
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.95)',
            border: 'rgba(245, 158, 11, 0.5)',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            )
        },
        error: {
            bg: 'rgba(239, 68, 68, 0.95)',
            border: 'rgba(239, 68, 68, 0.5)',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            )
        }
    };

    const config = colors[type] || colors.warning;

    return (
        <div 
            className={`fixed top-20 right-5 z-[100] transition-all duration-500 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
        >
            <div 
                className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md"
                style={{ 
                    background: config.bg, 
                    border: `1px solid ${config.border}`,
                    color: '#08080f',
                    minWidth: '280px'
                }}
            >
                <div className="shrink-0">{config.icon}</div>
                <p className="font-bold text-sm tracking-tight">{message}</p>
            </div>
        </div>
    );
}
