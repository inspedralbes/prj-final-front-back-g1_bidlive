📱 BidLife: The Real-Time Auction Revolution

    Donde la adrenalina de la subasta se encuentra con la interacción del streaming.

BidLife es una plataforma mobile-first que transforma el e-commerce tradicional en una experiencia de entretenimiento en vivo. Los usuarios no solo compran; participan en un evento social donde la inmediatez y la competitividad son los protagonistas.

✨ Características Destacadas

    ⚡ Ultra-Low Latency Streaming: Implementación de WebRTC para asegurar que el vídeo y las pujas estén sincronizados al milisegundo. Sin retardo, sin injusticias.

    💸 Pagos Seguros e Instantáneos: Integración con Stripe para la gestión de depósitos de garantía, pagos finales y transferencias automáticas a vendedores (Connect).

    🔨 One-Tap Bidding: Interfaz optimizada para pujar con un solo toque, permitiendo reaccionar al instante ante la competencia.

    💬 Live Interaction: Chat dinámico con WebSockets, alertas visuales de "Puja Superada" y sistema de reacciones en vivo.

    🛡️ Sistema de Confianza: Algoritmo de reputación basado en transacciones completadas y valoraciones de la comunidad.

🛠️ Stack Tecnológico

El proyecto se basa en una arquitectura de microservicios y comunicación en tiempo real.
Frontend (Mobile)

    React Native: UI fluida y cross-platform.

    WebRTC Client: Para la ingesta y visualización de vídeo en tiempo real.

    Stripe SDK: Procesamiento de pagos seguro cumpliendo normativas PCI.

Backend (Infraestructura)

    Node.js & Express: Core de la lógica de negocio.

    Socket.io: Sincronización del "Auction Engine" (pujas y chat).

    Redis: Cache de alta velocidad para gestionar el estado de las subastas activas.

    PostgreSQL: Base de datos relacional para usuarios, inventario y auditoría financiera.

🔄 Flujo de la Subasta (Workflow)

    Registro y Validación: El usuario vincula su método de pago mediante Stripe.

    Live Session: El vendedor inicia el streaming via WebRTC. Los interesados se unen a la "Bid Room".

    Bidding War: Cada puja actualiza el estado global en Redis y se comunica a todos los clientes via WebSockets.

    Cierre y Pago: Al terminar el contador, Stripe procesa el pago automáticamente del ganador y genera la orden de envío.

🧭 Navegación Principal

Pantalla	                    Descripción	                                        Tecnología
🏠 Home	                    Feed de subastas "Trending" y categorías.	        Algoritmo de relevancia.
🔍 Buscar	                Filtros avanzados por proximidad y tiempo.	        Full-text search.
🔴 Bid Room	                Vídeo en vivo, puja rápida y chat.	                WebRTC + Socket.io.
❤️ Favoritos	            Lista de deseos y alertas de inicio.	            Push Notifications.
👤 Perfil	                Wallet, historial y reputación.	                    Stripe API Integration.

👥 Equipo del Proyecto

    Eduard Vilaseca – [Tu Rol]

    Jordi Rocha – [Tu Rol]

    Hugo Córdoba – [Tu Rol]

    Roberto Lotreanu – [Tu Rol]

📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.