## Why

El sistema de pujas BidLive presenta bugs críticos en la integridad del estado del ganador (el líder queda marcado como "superado" al reconectarse), fallos en el envío de emails al ganador, y una experiencia móvil deficiente en el live de puja y el perfil de usuario. Estos problemas afectan directamente la confianza del usuario y la fiabilidad del sistema en producción.

## What Changes

- **BUG FIX**: El estado `isWinning` en el frontend se calcula solo desde mensajes WS en memoria; al reconectarse, la lista de mensajes se reinicia y el usuario que iba ganando recibe el toast "¡Has sido superado!" aunque nadie haya pujado más.
- **BUG FIX**: El `endPuja` consulta `last_bidder_id` de la DB correctamente, pero la UI del viewer puede mostrar "Subasta Desierta" porque el fallback de timer dispara sin `endData` (el usuario reconectado no tiene el historial de BID_PLACED en memoria).
- **BUG FIX**: El email al ganador falla silenciosamente; la query `SELECT email FROM users WHERE id = ?` puede estar usando la tabla equivocada si el auction-service tiene su propia BD sin tabla `users`, o el `[userRows]` destructuring es incorrecto para el driver mysql2 configurado.
- **MEJORA**: Responsive del live de puja (LiveAuctionVideo + SellerLiveVideo): el layout grid `md:grid-cols-[1fr_380px]` es correcto en desktop pero en móvil la columna derecha (BiddingHUD + Chat) queda cortada sin scroll propio.
- **MEJORA**: Responsive del perfil de usuario (Profile.jsx): el header de perfil, la sección wallet, y las tarjetas de subastas tienen paddings y tamaños fijos que desbordan en pantallas pequeñas.
- **MEJORA**: El historial de pujas (tab "Mis Compras") no muestra el comprador ganador ni la fecha de la subasta.

## Capabilities

### New Capabilities
- `winner-state-sync`: Sincronización del estado ganador al reconectarse — al hacer JOIN_ROOM, el server envía el `last_bidder_id` actual de la puja junto al historial de mensajes, y el frontend lo compara con el `userId` del usuario para inicializar `isWinning` correctamente sin depender del historial de mensajes WS.
- `email-winner-fix`: Corrección del pipeline de email al ganador con logging explícito y query DB robusta.
- `live-mobile-responsive`: CSS/JSX responsive completo para LiveAuctionVideo, SellerLiveVideo, ChatSidebar y BiddingHUD en móvil y tablet.
- `profile-mobile-responsive`: CSS/JSX responsive completo para Profile.jsx — header, wallet, tabs y grids de subastas.
- `bid-history-enriched`: Enriquecimiento del historial de pujas con ganador, precio final, fecha y estado de la subasta.

### Modified Capabilities
- `auction-lifecycle`: El evento JOIN_ROOM ahora incluye `currentBidder` en la respuesta, y el AUCTION_ENDED broadcast incluye siempre `winnerId` + `winnerUsername` consultados desde DB.

## Impact

- **Backend (bidding-service/index.js)**: JOIN_ROOM handler — añadir fetch de `last_bidder_id` y `winner_username` de la puja para enviarlo al nuevo cliente.
- **Backend (auction-service/controllers/pujaController.js)**: `endPuja` — verificar destructuring de `db.query` para email, añadir logs detallados. `recordBid` broadcast — incluir `winnerId` + `winnerUsername` en AUCTION_ENDED.
- **Backend (auction-service/services/emailService.js)**: Añadir verificación de transporter y manejo de errores más robusto.
- **Frontend (hooks/useWebSocket.js)**: Manejar nuevo mensaje `BIDDER_STATE` para inicializar `isWinning`.
- **Frontend (pages/LiveAuctionVideo.jsx)**: Inicializar `isWinning` desde el estado de la DB al cargar, no solo desde mensajes WS. Responsive layout móvil.
- **Frontend (pages/SellerLiveVideo.jsx)**: Responsive layout móvil.
- **Frontend (components/auction/ChatSidebar.jsx)**: Responsive para móvil.
- **Frontend (components/auction/BiddingHUD.jsx)**: Responsive para móvil.
- **Frontend (pages/Profile.jsx)**: Responsive completo. Historial de compras enriquecido con más datos.
- **Frontend (index.css)**: Media queries adicionales para garantizar no overflow horizontal.
