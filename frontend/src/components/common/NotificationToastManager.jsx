import React, { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';

const NotificationToastManager = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const handleNewNotification = (event) => {
            const { title, message, type } = event.detail;
            setToast({ title, message, type });
        };

        window.addEventListener('new_notification', handleNewNotification);
        return () => window.removeEventListener('new_notification', handleNewNotification);
    }, []);

    if (!toast) return null;

    return (
        <NotificationToast 
            message={`${toast.title}: ${toast.message}`}
            type={toast.type === 'outbid' ? 'warning' : toast.type}
            onClose={() => setToast(null)}
        />
    );
};

export default NotificationToastManager;
