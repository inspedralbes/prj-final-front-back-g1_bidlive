## MODIFIED Requirements

### Requirement: Email de ganador con link al chat y logo
El template HTML del email ganador SHALL incluir: el logo de BidLive (texto estilizado o imagen inline), un botón "Ver mi conversación" que apunte a `${appUrl}/messages/${conversationId}` (no a `/auction/video/:id`), el nombre del artículo, el precio final formateado con € y el nombre del vendedor si está disponible. El template SHALL ser responsive con `max-width: 600px` y funcionar correctamente en clientes de email móviles.

#### Scenario: Email enviado con conversación creada
- **WHEN** `sendAuctionWinEmail` recibe un `conversationId` válido
- **THEN** el botón CTA apunta a `/messages/${conversationId}` y el link es clickable en el email

#### Scenario: Email enviado sin conversationId (fallback)
- **WHEN** `sendAuctionWinEmail` recibe `conversationId = null`
- **THEN** el botón CTA apunta a `/messages` (bandeja de mensajes general)

## ADDED Requirements

### Requirement: Parámetro conversationId en sendAuctionWinEmail
La función `sendAuctionWinEmail` SHALL aceptar un quinto parámetro `conversationId` (opcional). Si se proporciona, el link del botón SHALL usar `/messages/${conversationId}`.

#### Scenario: Firma extendida con conversationId
- **WHEN** se llama `sendAuctionWinEmail(email, title, price, auctionId, conversationId)`
- **THEN** el email generado usa `/messages/${conversationId}` en el CTA
