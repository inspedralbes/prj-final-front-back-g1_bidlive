## 1. Backend — Bidding Service: AUCTION_ENDED con datos de ganador

- [x] 1.1 En `bidding-service/index.js`, en el case `END_AUCTION`, añadir fetch a `${AUCTION_SERVICE_URL}/pujas/${ws.auctionId}` para obtener `last_bidder_id`, `current_price`, y `starting_price`
- [x] 1.2 Hacer un segundo fetch a `${AUTH_SERVICE_URL}/profile/${last_bidder_id}` (o usar el campo `seller_username` del auction) para obtener el `username` del ganador
- [x] 1.3 Incluir `{ winnerId, winnerUsername, finalPrice }` en el payload del broadcast `AUCTION_ENDED` a todos los clientes de la sala
- [x] 1.4 Manejar el caso `last_bidder_id = null` → `winnerId: null, winnerUsername: null`
- [x] 1.5 Añadir try/catch alrededor del fetch para que un fallo no bloquee el broadcast

## 2. Backend — Auction Service: Email del ganador robusto

- [x] 2.1 En `pujaController.js`, dentro del bloque `endPuja`, cambiar `const [userRows]` por `const userRows` (sin destructuring) en la query del email del ganador
- [x] 2.2 Verificar con `Array.isArray(userRows) && userRows.length > 0` antes de acceder a `userRows[0].email`
- [x] 2.3 Añadir log `[Auction] Looking up winner email for userId ${winnerId}` antes de la query
- [x] 2.4 Añadir log `[Auction] Winner email found: ${email}` si se encuentra, o `[Auction] Winner ${winnerId} not found in DB — email not sent` si no
- [x] 2.5 En el catch del email, loguear el error completo: `console.error('[Auction] Email error:', emailErr)` (no solo `.message`)
- [x] 2.6 En `emailService.js`, añadir log de warning al inicio de `getTransporter()` si `!process.env.SMTP_USER`: `console.warn('[EmailService] SMTP_USER not set — using Ethereal test account')`

## 3. Frontend — Hook: Estado ganador inicializado desde DB

- [x] 3.1 En `LiveAuctionVideo.jsx`, en el `useEffect` del fetch inicial de la puja, tras recibir `data`, comparar `data.last_bidder_id` con `user?.id` y llamar `setIsWinning(Number(data.last_bidder_id) === Number(user?.id))` si hay `last_bidder_id`
- [x] 3.2 Asegurar que el `useEffect` de `latestBidMsg` no sobreescriba `isWinning` con `false` si `latestBidMsg` es undefined (añadir guard `if (!latestBidMsg) return;` — ya existe, verificar que esté correcto)
- [x] 3.3 Verificar que el toast "¡Has sido superado!" solo se dispara si `wasWinning && !nowWinning` Y hay un `latestBidMsg` real (no solo al montar)

## 4. Frontend — Popup de fin de subasta con fallback REST

- [x] 4.1 En `LiveAuctionVideo.jsx`, en el fallback de timer (`viewerFallbackFiredRef`), en lugar de solo llamar `setShowEndedPopup(true)`, hacer `fetch GET /auction/pujas/${id}` para obtener el estado final
- [x] 4.2 Con la respuesta del fetch, extraer `winner_id` y (si está disponible) hacer fetch a `/auth/profile/${winner_id}` para obtener `username`, o usar un campo `winner_username` si se añade al endpoint
- [x] 4.3 Llamar `setEndData({ winnerId: data.winner_id, winnerUsername: ..., finalPrice: data.current_price })` antes de `setShowEndedPopup(true)` en el fallback
- [x] 4.4 Añadir `winner_username` al `findById` del modelo Puja: incluir JOIN a `users` para obtener el username del ganador en la respuesta REST de `GET /pujas/:id`

## 5. Frontend — Responsive del Live de Puja (Viewer + Seller)

- [x] 5.1 En `LiveAuctionVideo.jsx`, cambiar el `<main>` a `flex flex-col overflow-hidden` en móvil y `md:grid md:grid-cols-[1fr_380px]` en desktop
- [x] 5.2 La columna del vídeo en móvil SHALL usar `aspect-video w-full` en lugar de `min-h-[300px]` fija
- [x] 5.3 La columna derecha en móvil SHALL tener `max-h-[50vh] overflow-y-auto` para que BiddingHUD y Chat sean accesibles sin que la página entera haga scroll
- [x] 5.4 En `BiddingHUD.jsx`, los 4 botones de puja rápida en móvil (`grid-cols-2`) deben tener `min-h-[44px]` y `text-xs` en móvil
- [x] 5.5 En `ChatSidebar.jsx`, el input del chat SHALL tener `fontSize: '16px'` explícito en el estilo para evitar zoom en iOS Safari
- [x] 5.6 En `SellerLiveVideo.jsx`, aplicar el mismo patrón `flex flex-col / md:grid` para el layout principal
- [x] 5.7 En los modales (popup de fin de subasta) en ambas páginas, añadir `max-h-[90vh] overflow-y-auto` al contenedor del modal y `mx-4` garantizado
- [x] 5.8 En `index.css`, añadir `overflow-x: hidden` al selector del contenedor raíz de las páginas de live o directamente en el `body`

## 6. Frontend — Responsive del Perfil de Usuario

- [x] 6.1 En `Profile.jsx`, el header principal cambiar de `gap-8` a `gap-4 sm:gap-8` y el avatar de `w-40 h-40` a `w-28 h-28 sm:w-40 sm:h-40`
- [x] 6.2 El `h1` del username cambiar de `text-5xl` a `text-3xl sm:text-5xl` y añadir `truncate max-w-full`
- [x] 6.3 La sección wallet: el contenedor MAX width cambiar a `w-full max-w-md`. El flex de input+botón cambiar a `flex flex-col sm:flex-row gap-3` para que en móvil muy estrecho se apilen
- [x] 6.4 Los stats inferiores (`flex flex-wrap`) agregar `gap-4` en móvil y reducir el tamaño de los números si es necesario
- [x] 6.5 Los botones de acción del header (Editar Perfil / Crear Subasta) asegurar que tienen `w-full sm:w-auto` en móvil
- [x] 6.6 Todos los inputs del formulario de edición: verificar `style={{ fontSize: '16px' }}` para evitar zoom iOS
- [x] 6.7 Las tabs de navegación: el contenedor `flex items-center gap-6 border-b` añadir `overflow-x-auto pb-1 scrollbar-hide` y `whitespace-nowrap` en cada botón (ya tiene `whitespace-nowrap`, verificar que funcione)

## 7. Frontend — Historial de Compras Enriquecido

- [x] 7.1 En la tab `payments` de `Profile.jsx`, añadir la fecha de la subasta formateada: `new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })`
- [x] 7.2 Asegurar que el símbolo de moneda es `€` (no `$`) en el precio final de la tarjeta de compra (línea 694: cambiar `$` por `€`)
- [x] 7.3 Añadir una línea con la fecha de la puja en cada tarjeta de historial, bajo el vendedor
- [ ] 7.4 Si `winner_username` está disponible en el objeto de pago (requiere que el endpoint `/payments/:userId` lo incluya), mostrarlo como "Comprador: <username>"

## 8. Verificación y Testing

- [ ] 8.1 Probar reconexión al live: salir y volver a entrar como usuario ganador → verificar que el badge "GANANDO" aparece correctamente
- [ ] 8.2 Probar fin de subasta sin reconexión: verificar que el popup muestra el ganador correcto
- [ ] 8.3 Probar fin de subasta con reconexión del ganador: verificar que el popup muestra "¡Has Ganado!" y no "Subasta Desierta"
- [ ] 8.4 Verificar en los logs del auction-service que el email del ganador se procesa (Ethereal URL visible si no hay SMTP)
- [ ] 8.5 Abrir el live en Chrome DevTools → modo móvil (375px) y verificar ausencia de scroll horizontal
- [ ] 8.6 Abrir el perfil en modo móvil y verificar que la sección wallet, las tabs y las tarjetas son accesibles
- [ ] 8.7 Verificar que la tab "Mis Compras" muestra fecha, precio en €, y estado correcto
