## ADDED Requirements

### Requirement: Automated Winning Message
The system must automatically send a message when an auction is successfully won.

#### Scenario: Auction ends with winner
- **WHEN** an auction is marked as "ended" and has a winner
- **THEN** the system automatically creates a conversation between the winner and the seller (if none exists) and sends a pre-defined message with auction details.

### Requirement: Auction Details in Message
The automated message must include the auction title and final price.

#### Scenario: Content of automated message
- **WHEN** the automated message is generated
- **THEN** it contains: "¡Enhorabuena! Has ganado la subasta '[Title]' por [Price]€. Contacta con el vendedor para los detalles del pago y envío."
