## ADDED Requirements

### Requirement: Automated Winning Notification
El sistema debe notificar al ganador y al vendedor inmediatamente después del cierre de una subasta.

#### Scenario: Auction End with Winner
- **WHEN** El cron de cierre detecta una subasta expirada con pujas.
- **THEN** Se envía una notificación persistente al ganador y al vendedor, y se notifica vía WebSocket si están conectados.

### Requirement: Live Starting Notification
Los seguidores y usuarios interesados deben ser alertados cuando una subasta comienza su fase de streaming.

#### Scenario: Seller goes Live
- **WHEN** Un vendedor pulsa "Go Live" y el estado de la subasta cambia a `live`.
- **THEN** Se envía una notificación a todos los seguidores del vendedor y a todos los usuarios que tienen la subasta en favoritos.
