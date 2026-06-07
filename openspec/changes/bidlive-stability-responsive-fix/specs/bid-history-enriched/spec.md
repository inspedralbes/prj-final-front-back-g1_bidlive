## ADDED Requirements

### Requirement: Bid history records winner and price
El historial de pujas persistido en DB SHALL estar sincronizado con el estado final real de la subasta: `winner_id`, `current_price` (precio final), `created_at` y `status`.

#### Scenario: Completed auction appears in buyer history
- **WHEN** un usuario ganó una subasta y esta tiene `status = 'ended'` y `winner_id = userId`
- **THEN** la subasta aparece en la tab "Mis Compras" con precio final y fecha visibles

#### Scenario: Bid history shows correct final price
- **WHEN** la subasta fue pujada varias veces
- **THEN** el historial muestra el `current_price` final (el precio de la última puja ganadora), no el precio de salida

#### Scenario: Bid history status is accurate
- **WHEN** el pago fue completado
- **THEN** el estado aparece como "Pagado" (`payment_status = 'paid'`)
- **WHEN** el pago está pendiente
- **THEN** el estado aparece como "Pendiente" (`payment_status = 'pending'`)
- **WHEN** la subasta fue cancelada por no pago
- **THEN** el estado aparece como "Cancelado" (`status = 'cancelled_unpaid'`)
