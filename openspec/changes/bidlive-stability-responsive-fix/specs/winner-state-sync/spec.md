## ADDED Requirements

### Requirement: Winning state initialized from DB on mount
El frontend SHALL inicializar el estado `isWinning` comparando `auctionData.last_bidder_id` con `user.id` al recibir los datos del auction en el fetch inicial, antes de que llegue cualquier mensaje WebSocket.

#### Scenario: User rejoins as current leader
- **WHEN** un usuario que tiene el `last_bidder_id` en DB vuelve a la página del live
- **THEN** el badge "GANANDO" se muestra inmediatamente al cargar, sin esperar mensajes WS

#### Scenario: User joins and is not the leader
- **WHEN** un usuario cuyo `id` no coincide con `last_bidder_id` entra al live
- **THEN** `isWinning` se inicializa como `false` y no se muestra ningún badge erróneo

#### Scenario: Toast "superado" NOT triggered on reconnect
- **WHEN** el usuario que va ganando cierra y vuelve a abrir la página del live
- **THEN** el sistema NO muestra el toast "¡Has sido superado!" si nadie ha pujado más durante su ausencia

### Requirement: Auction ended popup always shows real winner
El sistema SHALL consultar la API REST al detectar fin de subasta por timer (fallback) para obtener el ganador real desde DB, y mostrarlo en el popup en lugar de "Subasta Desierta".

#### Scenario: WS AUCTION_ENDED message missed by reconnecting viewer
- **WHEN** el timer del viewer llega a 0 y no se recibió el evento WS `AUCTION_ENDED`
- **THEN** el frontend hace `GET /pujas/:id` y muestra el popup con `winner_id` y `winner_username` de la DB

#### Scenario: Auction ended with valid winner after reconnect
- **WHEN** existe un `winner_id` en la respuesta REST tras el fin de subasta
- **THEN** el popup muestra "¡Tenemos Ganador!" con el nombre del ganador y el precio final

#### Scenario: Auction ended with no bids
- **WHEN** `winner_id` es null en la respuesta REST
- **THEN** el popup muestra "Subasta Desierta"

### Requirement: AUCTION_ENDED WS broadcast includes winner data
El bidding-service SHALL enriquecer el broadcast `AUCTION_ENDED` con `{ winnerId, winnerUsername, finalPrice }` consultando el auction-service al procesar el evento `END_AUCTION` del vendedor.

#### Scenario: Seller triggers end auction
- **WHEN** el vendedor emite el evento WS `END_AUCTION`
- **THEN** el servidor consulta `GET /pujas/:id` del auction-service y retransmite `AUCTION_ENDED` con `winnerId`, `winnerUsername` y `finalPrice` a todos los clientes

#### Scenario: Auction ends with no bids
- **WHEN** `last_bidder_id` es null en la DB al terminar
- **THEN** el broadcast `AUCTION_ENDED` incluye `winnerId: null`
