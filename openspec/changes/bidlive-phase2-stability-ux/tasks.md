## 1. Bidding Service — Estabilidad WS y sala ended persistida

- [ ] 1.1 Implementar loop de ping/pong server-side: cada 30s enviar `{ type: "PING" }` a todos los sockets; marcar `ws.isAlive = false` antes de enviar; si `ws.isAlive` sigue `false` en el siguiente tick, cerrar con `ws.terminate()`
- [ ] 1.2 En el case `PING` del switch, responder `{ type: "PONG" }` y marcar `ws.isAlive = true`
- [ ] 1.3 Al conectar un nuevo socket, inicializar `ws.isAlive = true` y en el evento `pong` nativo, también marcar `ws.isAlive = true`
- [ ] 1.4 En el handler `END_AUCTION`, tras obtener los datos del ganador y crear el chat (con `conversationId`), persistir en la sala: `room.ended = true; room.winnerId = winnerId; room.winnerUsername = winnerUsername; room.finalPrice = finalPrice; room.conversationId = conversationId`
- [ ] 1.5 En el case `JOIN_ROOM`, tras añadir al viewer a la sala, verificar `if (room.ended)` y enviar inmediatamente `{ type: "AUCTION_ENDED", payload: { winnerId: room.winnerId, winnerUsername: room.winnerUsername, finalPrice: room.finalPrice, conversationId: room.conversationId } }` (sin añadirle a la sala como viewer activo)
- [ ] 1.6 En `END_AUCTION`, después de obtener `conversationId` del chat-service (ya existe llamada a `/internal/system-message`), extraer el `id` de la conversación de la respuesta y pasarlo al payload del broadcast
- [ ] 1.7 Asegurar que el broadcast `AUCTION_ENDED` incluye `conversationId` en el payload final

## 2. Auction Service — Auto-cierre y pago automático

- [ ] 2.1 En `pujaController.js`, crear función `autoCloseExpiredAuctions()` que ejecuta `SELECT id FROM pujas WHERE status = 'live' AND end_time <= NOW()` y llama `endPuja` internamente para cada resultado
- [ ] 2.2 Iniciar el job: `setInterval(autoCloseExpiredAuctions, 30_000)` al arrancar el servicio (en el `initDB().then(...)` o tras el listen)
- [ ] 2.3 Loguear `[AutoClose] Starting job...` al arrancar y `[AutoClose] Closing auction ${id}` por cada subasta procesada
- [ ] 2.4 Dentro de `endPuja`, tras confirmar `winnerId` y antes de enviar el email, llamar a `POST /wallet/debit` en auth-service con `{ userId: winnerId, amount: finalPrice, secret }` (usando `fetch`)
- [ ] 2.5 Si el debit responde con éxito (`ok`), ejecutar `UPDATE pujas SET payment_status = 'paid' WHERE id = ?` y loguear `[Auction] Auto-payment successful for winner ${winnerId}`
- [ ] 2.6 Si el debit falla (cualquier razón), loguear `[Auction] Auto-payment skipped: ${err.message}` y continuar sin modificar `payment_status`
- [ ] 2.7 Verificar que auth-service tiene el endpoint `POST /wallet/debit` (ya existe como `internalDebitWallet`); si no está expuesto correctamente, asegurar que acepta `{ userId, amount, secret }` y verifica el secret

## 3. Auction Service — conversationId en endPuja

- [ ] 3.1 Tras la llamada a `/internal/system-message` del chat-service, leer `data.conversationId` (o `data.message?.conversation_id` según lo que devuelva el chat-service) de la respuesta JSON
- [ ] 3.2 Almacenar el `conversationId` en una variable local y pasarlo al endpoint de `bidding-service/broadcast` con `{ auctionId, type: 'AUCTION_ENDED', payload: { winnerId, winnerUsername, finalPrice, conversationId } }`
- [ ] 3.3 Actualizar la llamada a `sendAuctionWinEmail` para pasar `conversationId` como quinto argumento: `sendAuctionWinEmail(email, title, price, id, conversationId)`

## 4. Chat Service — devolver conversationId en system-message

- [ ] 4.1 En `POST /internal/system-message`, asegurar que la respuesta incluye `{ success: true, message, conversationId: conversation.id }` para que el auction-service pueda leerlo
- [ ] 4.2 Mejorar el mensaje automático de sistema con formato rico: incluir precio final formateado en €, fecha/hora, estado del pago, y un separador visual usando texto

## 5. Email Service — Winner email mejorado + Welcome email

- [ ] 5.1 Actualizar `sendAuctionWinEmail` para aceptar el quinto parámetro `conversationId`
- [ ] 5.2 Cambiar el link del botón de `${appUrl}/auction/video/${auctionId}` a `${appUrl}/messages/${conversationId || ''}` 
- [ ] 5.3 Actualizar el texto del botón de "Ver Subasta" a "Ver mi conversación con el vendedor"
- [ ] 5.4 Añadir logo de BidLive en el header del email: texto "Bid**Live**" con estilo inline (span amarillo para "Live") — no imagen externa para máxima compatibilidad
- [ ] 5.5 Hacer el template responsive: añadir `@media (max-width: 600px)` con `padding: 20px 16px` al body
- [ ] 5.6 Crear función `sendWelcomeEmail(toEmail, username)` en `emailService.js` con template completo: bienvenida a BidLive, qué es la plataforma (1 párrafo), CTA "Completar mi perfil" → `${appUrl}/profile`, CTA "Explorar subastas" → `${appUrl}/explore`, logo y footer
- [ ] 5.7 Exportar `sendWelcomeEmail` en `module.exports`

## 6. Auth Service — Welcome email al registrar

- [ ] 6.1 En `authController.js`, importar `emailService`: `const { sendWelcomeEmail } = require('../services/emailService')` (verificar que la ruta es correcta, `emailService.js` puede estar en auction-service; si no existe en auth-service, copiar el `emailService.js` o crear uno mínimo)
- [ ] 6.2 En el método `register`, tras `await User.create(username, email, password)` y antes del `res.status(201)`, añadir llamada async fire-and-forget: `sendWelcomeEmail(email, username).catch(err => console.error('[Auth] Welcome email failed:', err.message))`
- [ ] 6.3 En el método `googleLogin`, tras `await User.create(username, email, randomPassword)` (para usuarios nuevos), añadir la misma llamada fire-and-forget
- [ ] 6.4 Verificar que auth-service tiene nodemailer en sus dependencias (`package.json`); si no, añadirlo o usar un HTTP call al auction-service

## 7. Frontend — LiveAuctionVideo: usar conversationId del AUCTION_ENDED

- [ ] 7.1 En el handler del WS `AUCTION_ENDED` en `LiveAuctionVideo.jsx`, extraer `conversationId` del payload: `const { winnerId, winnerUsername, finalPrice, conversationId } = msg.payload`
- [ ] 7.2 Llamar `setEndData({ winnerId, winnerUsername, finalPrice, conversationId })` para que el popup reciba el `conversationId`
- [ ] 7.3 En el popup `showEndedPopup`, el botón "Contactar con vendedor" debe navegar a `/messages/${endData.conversationId}` si `conversationId` está disponible, con fallback a `navigate('/messages')`
- [ ] 7.4 En el fallback REST de timer (viewerFallbackFiredRef), si `data.conversationId` está disponible, incluirlo en `setEndData`

## 8. Frontend — Messages.jsx responsive mobile-first

- [ ] 8.1 Añadir estado `const [showThread, setShowThread] = useState(!!urlId)` para controlar qué panel es visible en móvil
- [ ] 8.2 Cuando el usuario navega a `/messages/:id` (urlId cambia), ejecutar `setShowThread(true)` en un `useEffect`
- [ ] 8.3 El sidebar SHALL tener clase `${showThread ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80` (visible en móvil solo si no hay thread activo)
- [ ] 8.4 El ChatThread SHALL tener clase `${showThread ? 'flex' : 'hidden md:flex'} flex-1 flex-col`
- [ ] 8.5 Al hacer clic en una conversación (onClick del item), además de `navigate`, llamar `setShowThread(true)`
- [ ] 8.6 Pasar prop `onBack={() => setShowThread(false)}` al `ChatThread` para el botón "← Volver"
- [ ] 8.7 En `ChatThread`, si recibe `onBack`, mostrar un `<button onClick={onBack}>` con "← Volver" en el header, visible solo en `md:hidden`
- [ ] 8.8 Cambiar el contenedor principal de `flex` a `flex overflow-hidden max-w-full` y añadir `overflow-x: hidden` al wrapper exterior

## 9. Verificación y Testing

- [ ] 9.1 Comprobar logs del bidding-service: buscar `[Ping]` y `[Pong]` cada 30s en producción
- [ ] 9.2 Simular desconexión del viewer ganador → reconectar → verificar que recibe `AUCTION_ENDED` inmediatamente con datos correctos
- [ ] 9.3 Esperar que una subasta expire sin acción del vendedor → verificar logs `[AutoClose] Closing auction ${id}`
- [ ] 9.4 Con ganador con saldo → verificar logs `[Auction] Auto-payment successful` y `payment_status = 'paid'` en DB
- [ ] 9.5 Registrar usuario nuevo → verificar en logs el Ethereal preview URL del welcome email
- [ ] 9.6 Finalizar subasta → verificar que el email ganador contiene el link `/messages/:id` correcto (no `/auction/video/:id`)
- [ ] 9.7 Abrir Messages en Chrome DevTools modo móvil (375px) → verificar que solo se ve el sidebar, sin overflow horizontal
- [ ] 9.8 Seleccionar conversación en móvil → verificar que el thread ocupa 100% y aparece botón "← Volver"
