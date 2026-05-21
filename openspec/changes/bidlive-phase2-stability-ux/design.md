## Context

BidLive es una plataforma de subastas en vivo basada en microservicios (auction-service, auth-service, bidding-service, chat-service, gateway). En producción se detectaron 4 fallos de alta gravedad:

1. **Desconexiones del live**: Nginx/proxies de producción tienen idle timeouts (60–75s) que cierran conexiones WebSocket inactivas si no hay heartbeat. El bidding-service no implementa ping/pong activo, causando que los viewers (especialmente el ganador) sean desconectados.

2. **AUCTION_ENDED sin datos de ganador**: El handler `END_AUCTION` en el deployed `bidding-service` todavía emite el payload original sin `winnerId`/`winnerUsername`, porque el fix anterior no se desplegó correctamente. Además, los viewers que reconectan tras el cierre no reciben el `AUCTION_ENDED`.

3. **Correos con links rotos**: El botón "Ver Subasta" apunta a `/auction/video/:id`, que redirige a inicio si la subasta ya finalizó. Debe apuntar a la conversación chat ganador-vendedor.

4. **Correos de bienvenida ausentes**: No existe email de bienvenida en el registro, reduciendo la activación de usuarios.

5. **Responsive incompleto en Messages.jsx**: La página de mensajes usa un layout de dos columnas fijas (`w-80 + flex-1`) que en móvil produce overflow horizontal visible en la screenshot aportada.

## Goals / Non-Goals

**Goals:**
- Implementar ping/pong heartbeat en bidding-service para evitar desconexiones por idle timeout
- Persistir en memoria el estado `ended` de la sala con `winner_id` para que reconectores reciban `AUCTION_ENDED`
- Crear job de auto-cierre de subastas expiradas en auction-service
- Implementar pago automático del wallet al finalizar la subasta (si saldo suficiente)
- Incluir `conversationId` en el broadcast `AUCTION_ENDED` y en el email ganador
- Añadir `sendWelcomeEmail` al registro de usuarios
- Rediseñar template de email ganador con logo y link correcto al chat
- Hacer `Messages.jsx` responsive (sidebar toggle en móvil)

**Non-Goals:**
- Migrar a Redis para persistencia de salas entre reinicios del bidding-service
- Implementar pago con tarjeta manual si el wallet no tiene saldo (ya existe Stripe para esto)
- Cambiar la arquitectura de microservicios

## Decisions

### D1: Heartbeat ping/pong en bidding-service
**Decisión**: El servidor envía un `PING` WebSocket cada 30s a todos los clientes. Si un cliente no responde en 10s, se cierra la conexión manualmente. El cliente frontend ya tiene lógica de reconexión automática.

**Alternativa descartada**: Configurar Nginx keep-alive — requiere acceso a la config de producción y no está en manos del equipo de app.

### D2: Estado `ended` persistido en la sala en memoria
**Decisión**: Cuando se procesa `END_AUCTION`, se añade `room.ended = true`, `room.winnerId`, `room.winnerUsername`, `room.finalPrice`, `room.conversationId` a la sala en memoria. Cuando un viewer se conecta a una sala `ended`, se le envía inmediatamente `AUCTION_ENDED` con los datos completos.

**Alternativa descartada**: Fetch a auction-service en cada reconexión — introduce latencia y dependencia de red en el JOIN_ROOM crítico.

### D3: Job de auto-cierre en auction-service
**Decisión**: Cron job cada 30s que ejecuta `SELECT id FROM pujas WHERE status = 'live' AND end_time <= NOW()` y llama internamente a `endPuja()` para cada una. Esto garantiza que las subastas se cierren incluso si el vendedor pierde conexión antes de hacer clic en "Finalizar".

**Alternativa descartada**: Timer en el frontend del vendedor — no es autoritativo; puede fallar si el vendedor cierra la pestaña.

### D4: Pago automático del wallet
**Decisión**: Dentro de `endPuja()`, si `winnerId` existe y el wallet balance >= `finalPrice`, se llama a `debit` en auth-service y se actualiza `payment_status = 'paid'`. Si no hay saldo suficiente, queda `payment_status = 'pending'` como actualmente.

### D5: `conversationId` en el broadcast
**Decisión**: El `endPuja` crea (o recupera) la conversación del chat vía `POST /internal/system-message`, que devuelve el `conversation.id`. Este ID se incluye en el payload de `AUCTION_ENDED` que el bidding-service difunde, y en el email del ganador.

### D6: Responsive de Messages.jsx
**Decisión**: En móvil (< `md`), el sidebar de conversaciones ocupa el 100% del ancho y el `ChatThread` está oculto. Al seleccionar una conversación, se oculta el sidebar y se muestra el thread con un botón de "volver". En desktop (≥ `md`), layout de dos columnas como actualmente.

### D7: Welcome email en auth-service
**Decisión**: Importar `emailService` en `authController.js` (auth-service) y llamar `sendWelcomeEmail(email, username)` tras `User.create()` exitoso. El email es async fire-and-forget (no bloquea el registro).

## Risks / Trade-offs

- **[Risk] El job de auto-cierre puede ejecutarse concurrentemente con el END_AUCTION manual del vendedor** → Mitigation: La lógica `endPuja` ya tiene un guard de idempotencia (`if (puja.status === 'ended') return early`). El job usará el mismo controller.

- **[Risk] El debit del wallet puede fallar (auth-service caído)** → Mitigation: Wrappear en try/catch; si falla, el `payment_status` queda `pending` y el usuario paga manualmente vía el flujo existente.

- **[Risk] El ping/pong puede interactuar con la lógica de mensajes** → Mitigation: El servidor envía `{ type: "PING" }` y el cliente responde `{ type: "PONG" }`. Ya existe el case `PING` en el switch; sólo hace falta el loop server-side.

- **[Risk] La sala en memoria se pierde si el bidding-service se reinicia** → Mitigation: El auto-close job de auction-service + el fetch REST al montar del frontend recuperan el estado desde DB. Es aceptable.

## Migration Plan

1. Deploy auction-service (job auto-cierre + pago automático + conversationId)
2. Deploy auth-service (welcome email)
3. Deploy bidding-service (heartbeat + sala ended state)
4. Deploy frontend (Messages responsive + conversationId CTA)
5. Verificar logs: `[AutoClose]`, `[Auction] Auto-closed`, `[EmailService] Welcome`
