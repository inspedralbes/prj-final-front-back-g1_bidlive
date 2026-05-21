## MODIFIED Requirements

### Requirement: Auction lifecycle END_AUCTION broadcast
El servidor SHALL, al recibir el evento WS `END_AUCTION` del vendedor, consultar el auction-service para obtener el ganador real (`last_bidder_id`, `winner_username`, `current_price`) y retransmitir `AUCTION_ENDED` con estos datos a todos los clientes de la sala.

#### Scenario: END_AUCTION broadcast with winner data
- **WHEN** el vendedor envía `END_AUCTION` por WebSocket
- **THEN** el bidding-service hace `GET /pujas/:id` al auction-service, extrae `last_bidder_id` y `seller_username`/`last_bidder_username`, y hace broadcast `AUCTION_ENDED` con `{ auctionId, winnerId, winnerUsername, finalPrice }`

#### Scenario: END_AUCTION broadcast without winner
- **WHEN** la subasta finaliza sin pujas (`last_bidder_id = null`)
- **THEN** el broadcast `AUCTION_ENDED` incluye `{ auctionId, winnerId: null, winnerUsername: null, finalPrice: startingPrice }`
