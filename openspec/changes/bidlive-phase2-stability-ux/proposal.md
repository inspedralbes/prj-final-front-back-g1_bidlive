## Why

La plataforma BidLive presenta fallos críticos en producción: los usuarios ganadores son expulsados o desconectados del live, el END_AUCTION sigue enviando el broadcast sin datos del ganador (el fix anterior no se propagó al deployed), y el sistema de mensajes post-subasta, correos de bienvenida y el responsive en chats/historial están incompletos. Esto provoca estados inconsistentes, pérdida de confianza del usuario y flujos de pago manuales.

## What Changes

- **Estabilidad del live**: Eliminar el broadcast `END_AUCTION` sin enriquecer del deployed `bidding-service`, añadir ping/pong con heartbeat para evitar desconexiones por timeout de Nginx/proxy, y persistir el `winner_id` en la sala en memoria para que los viewers que reconectan reciban el `AUCTION_ENDED` correcto.
- **Auto-cierre + pago automático**: El `auction-service` hará trigger automático del cierre al expirar `end_time` sin depender del vendedor, debitará el wallet del ganador y actualizará `payment_status = 'paid'` si el saldo es suficiente.
- **Chat post-subasta enriquecido**: El mensaje automático creado en el chat al finalizar una subasta incluirá nombre del artículo, precio final, fecha/hora y estado del pago. Se devolverá el `conversationId` en el `AUCTION_ENDED` broadcast para que el botón "Ver Chat" del email y del popup redirija directamente.
- **Correo de ganador mejorado**: Logo de BidLive, botón que apunta a `/messages/:conversationId` (no a `/auction/video/:id`), diseño responsive.
- **Correo de bienvenida**: Email automático al registrar un nuevo usuario (normal y Google) con branding BidLive, CTA a explorar subastas y completar perfil.
- **Responsive completo**: `Messages.jsx` layout de columna única en móvil con toggle sidebar, historial de pujas scrollable, modales y paneles adaptados.

## Capabilities

### New Capabilities

- `auction-auto-close`: El `auction-service` ejecuta un job periódico que cierra las subastas cuyo `end_time` ha expirado y `status = 'live'`, debitando el wallet del ganador automáticamente.
- `welcome-email`: Email de bienvenida enviado desde `auth-service` al completar el registro (normal + Google).
- `auction-ended-chat-link`: El broadcast `AUCTION_ENDED` incluye `conversationId` para deep-link directo al chat ganador-vendedor.
- `messages-responsive`: Layout de `Messages.jsx` mobile-first con panel lateral oculto/visible por toggle.

### Modified Capabilities

- `winner-email-template`: Rediseño del template HTML del correo ganador con logo, botón a chat, responsive.
- `auction-lifecycle`: `END_AUCTION` WS handler enriquece el broadcast con datos del ganador desde DB + expone `conversationId`.

## Impact

- `backend/bidding-service/index.js`: Heartbeat ping/pong, persistir `endedAuctions` en memoria con `winner_id`, enviar `AUCTION_ENDED` a reconectores.
- `backend/auction-service/`: Nuevo job de auto-cierre, pago automático en `endPuja`, actualización de `winner_username` y `conversationId` en el response.
- `backend/auth-service/controllers/authController.js`: Llamada a `emailService.sendWelcomeEmail` tras registro exitoso.
- `backend/auction-service/services/emailService.js`: `sendWelcomeEmail()` nuevo, `sendAuctionWinEmail()` actualizado con logo y link al chat.
- `frontend/src/pages/Messages.jsx`: Responsive mobile-first con sidebar toggle.
- `frontend/src/pages/LiveAuctionVideo.jsx`: Usar `conversationId` del `AUCTION_ENDED` para botón CTA directo.
