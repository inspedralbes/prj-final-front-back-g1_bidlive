📱 BidLife

    La evolución de las subastas: eBay se encuentra con Twitch.

📌 Descripción del Proyecto

BidLife es una aplicación móvil de subastas en directo que fusiona la mecánica de compra-venda tradicional con el entretenimiento del streaming en tiempo real.

La aplicación permite a los vendedores subastar productos en vivo, mientras que los usuarios pueden pujar en tiempo real, interactuar mediante un chat y seguir la evolución de la subasta de manera inmediata. El proyecto pone el foco principal en la experiencia live, la rapidez de las pujas y la sensación de evento en tiempo real ("FOMO").
🎯 Objetivo

Crear una plataforma que:

    Centralice subastas en tiempo real.

    Permita la interacción directa entre compradores y vendedores.

    Priorice la inmediatez y la competitividad.

    Ofrezca una experiencia visual moderna y fluida.

🔴 Tipos de Subasta en Directo

La aplicación admite dos modalidades:

1. Subasta Live (Con cámara)

   El vendedor transmite el producto mediante streaming de vídeo.

   Los usuarios ven el producto en tiempo real, ideal para resolver dudas al instante.

   Incluye chat en directo, historial de pujas y cuenta atrás.

   Indicador visual: “EN DIRECTO 🔴”.

2. Subasta Rápida (Sin cámara)

   No hay transmisión de vídeo.

   Se muestra una imagen estática o carrusel del producto.

   Mantiene el sistema de pujas en tiempo real, chat y contador.

   Pensada para subastas ágiles de productos ya conocidos.

Ambos tipos comparten la misma lógica de "motor de subastas", adaptando únicamente el componente visual.
🧭 Navegació y Pantallas Principales

La aplicación utiliza una navegación moderna (Bottom Tab Bar) con cinco secciones:

    🏠 Home: Feed de subastas activas, próximas y destacadas. Categorías y subastadores populares.

    🔍 Buscar: Buscador con filtros por categoría, precio, tiempo restante y tipo de subasta.

    🔴 Directo (Bid Room): El núcleo de la app. Incluye vídeo/foto, precio actual, botón de "PUJAR" (One-tap bidding), chat y alertas de "Te han superado".

    ❤️ Favoritos: Subastas guardadas y notificaciones de inicio.

    👤 Perfil: Gestión de usuario, historial de pujas, compras, métodos de pago y reputación.

🛠️ Stack Tecnológico

El proyecto sigue una arquitectura modular centrada en el bajo tiempo de latencia.
Frontend

    Framework: React / React Native

    Diseño: Componentes reutilizables, estilo minimalista y moderno.

    Gestión de Estado: Optimizado para actualizaciones frecuentes (pujas).

Backend (Arquitectura Prevista)

    Servidor: Node.js

    Base de Datos: Estructura relacional para usuarios/ventas y NoSQL/Redis para el tiempo real.

    Tiempo Real: WebSockets (Socket.io) para sincronizar pujas y chat al milisegundo.

👥 Equipo del Proyecto

    Eduard Vilaseca

    Jordi Rocha

    Hugo Córdoba

    Roberto Lotrenau

📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
