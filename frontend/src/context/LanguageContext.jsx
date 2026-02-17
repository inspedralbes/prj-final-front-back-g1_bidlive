import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        nav: {
            live: 'Live Auctions',
            upcoming: 'Upcoming',
            auctioneers: 'Auctioneers',
            searchPlaceholder: 'Search sneakers, art, cards...',
            goLive: 'Go Live',
            login: 'Login',
            logout: 'Logout',
            profile: 'My Profile',
            notifications: 'Notifications'
        },
        home: {
            heroTitle: 'Live Auctions. Real Time.',
            heroSubtitle: 'The excitement of a live auction, from anywhere.',
            trending: 'Trending Now'
        },
        profile: {
            title: 'My Profile',
            stats: 'My Stats',
            activity: 'Recent Activity',
            edit: 'Edit Profile'
        },
        auctioneers: {
            title: 'Top Auctioneers',
            subtitle: 'Discover the best sellers on BidLive.'
        }
    },
    es: {
        nav: {
            live: 'En Vivo',
            upcoming: 'Próximos',
            auctioneers: 'Subastadores',
            searchPlaceholder: 'Buscar zapatillas, arte, cartas...',
            goLive: 'Crear Subasta',
            login: 'Iniciar Sesión',
            logout: 'Cerrar Sesión',
            profile: 'Mi Perfil',
            notifications: 'Notificaciones'
        },
        home: {
            heroTitle: 'Subastas en Vivo. Tiempo Real.',
            heroSubtitle: 'La emoción de una subasta en vivo, desde cualquier lugar.',
            trending: 'Tendencias'
        },
        profile: {
            title: 'Mi Perfil',
            stats: 'Mis Estadísticas',
            activity: 'Actividad Reciente',
            edit: 'Editar Perfil'
        },
        auctioneers: {
            title: 'Mejores Subastadores',
            subtitle: 'Descubre los mejores vendedores en BidLive.'
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // Default to English

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
            if (!value) return key; // Fallback to key if not found
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
