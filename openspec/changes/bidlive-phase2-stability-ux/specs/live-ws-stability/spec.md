## ADDED Requirements

### Requirement: WS Heartbeat Ping/Pong
El bidding-service SHALL enviar un frame `{ type: "PING" }` a todos los clientes conectados cada 30 segundos. Si un cliente no responde con `{ type: "PONG" }` en 10 segundos, el servidor SHALL cerrar la conexión con código 1001 y registrar el timeout.

#### Scenario: Cliente activo responde al ping
- **WHEN** el servidor envía `{ type: "PING" }` a un cliente conectado
- **THEN** el cliente responde `{ type: "PONG" }` en menos de 10 segundos y la conexión permanece abierta

#### Scenario: Cliente inactivo no responde
- **WHEN** el servidor envía `{ type: "PING" }` y el cliente no responde en 10 segundos
- **THEN** el servidor cierra la conexión y elimina al cliente de la sala

### Requirement: Sala persiste estado ended con datos del ganador
Cuando se procesa el cierre de una subasta, el bidding-service SHALL persistir en el objeto sala en memoria los campos: `ended: true`, `winnerId`, `winnerUsername`, `finalPrice`, `conversationId`. Estos campos SHALL sobrevivir mientras la sala exista en memoria.

#### Scenario: Viewer reconecta tras fin de subasta
- **WHEN** un viewer hace `JOIN_ROOM` en una sala con `ended = true`
- **THEN** el servidor le envía inmediatamente `{ type: "AUCTION_ENDED", payload: { winnerId, winnerUsername, finalPrice, conversationId } }` y no le añade a la sala como viewer activo

### Requirement: AUCTION_ENDED incluye conversationId
El broadcast `AUCTION_ENDED` enviado a todos los clientes de la sala SHALL incluir el campo `conversationId` que identifica la conversación creada entre el ganador y el vendedor en el chat-service.

#### Scenario: Fin de subasta con ganador y chat creado
- **WHEN** el seller envía `END_AUCTION` y existe un ganador
- **THEN** el payload broadcast incluye `{ winnerId, winnerUsername, finalPrice, conversationId }` donde `conversationId` es el ID de la conversación chat ganador-vendedor
