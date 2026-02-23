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
        },
        auction: {
            liveChat: 'Live Chat',
            bidHistory: 'Bid History',
            welcome: 'Welcome to the Live Auction',
            currentBid: 'Current Bid',
            timeLeft: 'Time Left',
            endsIn: 'Auction Ends In',
            nextMinBid: 'Next minimum bid',
            heldBy: 'Held by',
            noBids: 'NO BIDS YET',
            placeBid: 'Place bid now',
            custom: 'Custom',
            bid: 'BID',
            minBidAlert: 'Bid must be at least',
            sendMessagePlaceholder: 'Send a message...'
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
        },
        auction: {
            liveChat: 'Chat en Vivo',
            bidHistory: 'Historial',
            welcome: 'Bienvenido a la Subasta en Vivo',
            currentBid: 'Puja Actual',
            timeLeft: 'Tiempo Restante',
            endsIn: 'Termina en',
            nextMinBid: 'Siguiente mínima',
            heldBy: 'Líder',
            noBids: 'SIN PUJAS',
            placeBid: 'Pujar ahora',
            custom: 'Personalizado',
            bid: 'PUJAR',
            minBidAlert: 'La puja debe ser al menos',
            sendMessagePlaceholder: 'Escribe un mensaje...'
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
