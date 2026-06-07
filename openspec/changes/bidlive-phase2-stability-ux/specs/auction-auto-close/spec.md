## ADDED Requirements

### Requirement: Auto-cierre de subastas expiradas
El auction-service SHALL ejecutar un job periódico cada 30 segundos que busque subastas con `status = 'live'` y `end_time <= NOW()`, y las cierre llamando al proceso `endPuja` para cada una. El job SHALL loguear `[AutoClose] Closing auction ${id}` para cada subasta procesada.

#### Scenario: Subasta expira sin que el vendedor cierre manualmente
- **WHEN** una subasta tiene `status = 'live'` y `end_time <= NOW()`
- **THEN** el job la cierra, actualiza el status a 'ended', y notifica a todos los participantes

#### Scenario: Subasta ya cerrada no se procesa dos veces
- **WHEN** el job encuentra una subasta con `status = 'ended'`
- **THEN** el job la ignora (idempotencia garantizada por el guard existente en `endPuja`)

### Requirement: Pago automático del wallet al finalizar
Cuando `endPuja` se ejecuta y existe un `winnerId`, el auction-service SHALL intentar debitar el `finalPrice` del wallet del ganador llamando al endpoint interno `POST /wallet/debit` del auth-service. Si el débito es exitoso, SHALL actualizar `payment_status = 'paid'` en la puja. Si falla (saldo insuficiente u otro error), SHALL loguear la razón y dejar `payment_status = 'pending'`.

#### Scenario: Ganador tiene saldo suficiente
- **WHEN** `endPuja` se ejecuta con un `winnerId` y el wallet del ganador >= `finalPrice`
- **THEN** el sistema debita el importe, actualiza `payment_status = 'paid'` y logua `[Auction] Auto-payment successful for winner ${winnerId}`

#### Scenario: Ganador no tiene saldo suficiente
- **WHEN** `endPuja` se ejecuta pero el wallet del ganador < `finalPrice`
- **THEN** el sistema deja `payment_status = 'pending'` y logua `[Auction] Auto-payment skipped: insufficient balance for winner ${winnerId}`

### Requirement: conversationId devuelto al finalizar la subasta
La función `endPuja` SHALL retornar el `conversationId` de la conversación chat creada (o recuperada) entre el ganador y el vendedor, para incluirlo en el broadcast WS y en el email.

#### Scenario: Fin de subasta con ganador
- **WHEN** `endPuja` crea el mensaje de sistema en el chat-service
- **THEN** el `conversationId` devuelto por el chat-service se persiste en la respuesta de `endPuja` y se pasa al bidding-service para el broadcast
