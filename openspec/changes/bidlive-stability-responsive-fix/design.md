## Context

BidLive es una plataforma de subastas en tiempo real con arquitectura de microservicios: `auction-service` (REST, gestión de pujas), `bidding-service` (WebSocket, señalización WebRTC y chat), `auth-service` (usuarios, wallet), `chat-service` (mensajes privados) y `gateway` (Nginx). El frontend es una SPA React/Vite.

**Bugs identificados:**

1. **Bug crítico de estado ganador**: `useWebSocket.js` inicializa `messages: []` en cada montaje. `LiveAuctionVideo.jsx` calcula `isWinning` solo desde mensajes WS en memoria (`latestBidMsg`). Al reconectarse, `messages` está vacío → `latestBidMsg = undefined` → `isWinning = false` → el usuario ve el badge "SUPERADO" aunque siga siendo el máximo pujador en DB. También el fallback de timer (viewerFallbackFiredRef) activa `showEndedPopup` sin `endData` (que viene solo del evento WS `AUCTION_ENDED`), mostrando "Subasta Desierta" aunque exista ganador en DB.

2. **Bug email al ganador**: En `pujaController.js` línea 235: `const [userRows] = await db.query(...)`. El driver `mysql2` con `promise()` retorna `[rows, fields]`, así que `userRows` es el array de filas, lo cual es correcto. Sin embargo si el auction-service usa `mysql` sin promise wrapper (como sugiere `db.query` siendo directamente awaitable en el modelo Puja), el destructuring `[userRows]` devuelve la primera fila, no el array. Adicionalmente falta `secure: false` / `tls: rejectUnauthorized: false` cuando se usa SMTP externo en algunos entornos Docker.

3. **Responsive móvil**: Los layouts usan `flex flex-col md:grid md:grid-cols-[1fr_380px]`. En móvil la columna derecha (BiddingHUD + Chat) puede quedar con altura colapsada o sin scroll. La columna `min-h-[300px]` del vídeo en móvil empuja el panel de pujas fuera de la vista. Profile.jsx tiene el header con `gap-8` y textos de `text-5xl` que desbordan en pantallas <375px.

## Goals / Non-Goals

**Goals:**
- Corregir el estado `isWinning` para que persista correctamente al reconectarse.
- Garantizar que `showEndedPopup` muestre siempre el ganador real (desde DB) cuando el WS event se pierde.
- Corregir el envío de email al ganador con logging robusto.
- Entregar un layout mobile-first para LiveAuctionVideo, SellerLiveVideo, ChatSidebar, BiddingHUD y Profile.
- Enriquecer el historial de compras con comprador, precio final, fecha y estado.

**Non-Goals:**
- Rediseño visual completo de la plataforma.
- Cambiar el protocolo WebRTC de señalización.
- Migrar base de datos.
- Implementar reconexión automática de WebSocket (el hook ya reconecta al desmontar/montar).

## Decisions

### D1: Inicializar `isWinning` desde DB al montar, no solo desde WS

**Decision**: En `LiveAuctionVideo.jsx`, al recibir `auctionData` del fetch inicial, comparar `auctionData.last_bidder_id` con `user.id`. Si coinciden, inicializar `isWinning = true`.

**Rationale**: Es la solución más simple y sin cambios en el backend. El fetch de `GET /pujas/:id` ya retorna `last_bidder_id`. Esto soluciona el bug en O(1) sin protocolo adicional.

**Alternativa descartada**: Nuevo mensaje WS `BIDDER_STATE` enviado en JOIN_ROOM — añade complejidad en el servidor y no es necesario dado que el fetch REST ya ocurre.

### D2: Popup de fin de subasta con fallback REST

**Decision**: Cuando el fallback de timer activa `showEndedPopup` (el WS `AUCTION_ENDED` no llegó), hacer un fetch REST `GET /pujas/:id` para obtener `winner_id` y `winner_username` desde DB y mostrarlos en el popup, en lugar de mostrar "Subasta Desierta" directamente.

**Rationale**: Garantiza que el popup sea siempre correcto sin duplicar la lógica del servidor. El endpoint ya existe.

### D3: Email — verificar el destructuring del driver DB

**Decision**: En `pujaController.js` cambiar `const [userRows] = await db.query(...)` por `const userRows = await db.query(...)` y verificar `Array.isArray(userRows) && userRows.length > 0`. Añadir logging del error completo (no solo `error.message`) para diagnosticar en producción. Añadir log de confirmación previo al envío.

**Rationale**: El driver `mysql2` en modo pool con `promise()` retorna directamente el array de filas (no `[rows, fields]`) según la configuración del proyecto (`db.query` ya awaitable). Verificar con `Array.isArray` es seguro para ambas variantes.

### D4: Responsive — layout mobile-first con panel inferior deslizable

**Decision**: En móvil (<768px) el layout de live es `flex flex-col` con el vídeo en proporción `aspect-video` (no altura fija) y el panel derecho con `max-h-[50vh] overflow-y-auto`. BiddingHUD colapsa los 4 botones rápidos en una fila de 2×2 con texto más pequeño. ChatSidebar input tiene `font-size: 16px` mínimo para evitar zoom iOS.

**Alternativa descartada**: Bottom sheet / drawer nativo — demasiada complejidad de estado para el tiempo disponible.

### D5: AUCTION_ENDED broadcast enriquecido

**Decision**: En `bidding-service/index.js`, cuando el vendedor envía `END_AUCTION`, el servidor consulta la DB para obtener `last_bidder_id` y el username del ganador antes de hacer el broadcast, incluyendo `{ winnerId, winnerUsername, finalPrice }` en el payload. Esto garantiza que el popup del viewer siempre tenga datos correctos.

**Alternativa descartada**: Que el vendedor envíe los datos del ganador en el payload — no es autoritative, el vendedor no conoce estos datos.

## Risks / Trade-offs

- **[Race condition en endPuja]** → El `endPuja` es idempotente (chequea `puja.status === 'ended'`), y el fallback solo hace fetch REST, no llama a end. Riesgo mitigado.
- **[Email en producción sin SMTP configurado]** → El servicio cae en Ethereal (dev). Se documenta en los logs. Si `SMTP_USER` no está en producción el email nunca llega. Mitigación: log de warning explícito si no hay SMTP configurado.
- **[Responsive en iOS Safari]** → El `100vh` en iOS incluye la barra de navegación. Usar `dvh` o `calc(var(--vh, 1vh) * 100)`. Alternativa pragmática: `min-h-screen` con overflow-y en body. Se usará `h-[100dvh]` donde esté disponible con fallback `h-screen`.
- **[AUCTION_ENDED con DB fetch en bidding-service]** → El bidding-service ya hace fetch al auction-service en `PLACE_BID`. Añadir un fetch más en `END_AUCTION` introduce latencia mínima (<100ms local). Aceptable.

## Migration Plan

1. Aplicar cambios en backend (bidding-service, auction-service).
2. Aplicar cambios en frontend (hooks, pages, components, CSS).
3. Verificar en local con `docker-compose up`.
4. No requiere migración de base de datos (columnas `last_bidder_id`, `winner_id` ya existen).
5. Rollback: `git revert` de los commits correspondientes.

## Open Questions

- ¿El `db.query` del auction-service retorna `rows` directamente o `[rows, fields]`? Verificar el archivo `config/db.js` del auction-service para confirmar el wrapper. → La implementación usará la forma defensiva `Array.isArray`.
- ¿`SMTP_USER` está configurado en el entorno de producción? Si no, el email nunca llegará aunque el código sea correcto.
