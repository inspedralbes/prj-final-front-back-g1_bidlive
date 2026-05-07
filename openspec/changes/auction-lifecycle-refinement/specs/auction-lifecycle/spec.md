## ADDED Requirements

### Requirement: Anti-sniping (Extensión de tiempo)
Para evitar el "sniping" de último segundo, las subastas deben extenderse automáticamente si hay actividad reciente.

#### Scenario: Puja en el último minuto
- **WHEN** se recibe una puja válida y faltan menos de 60 segundos para el fin de la subasta (`end_time` - `now` < 60s).
- **THEN** se añaden automáticamente 30 segundos al `end_time` de la subasta.

### Requirement: Cierre Estricto en el Servidor
La subasta debe finalizar de forma autoritativa en el servidor para evitar discrepancias con el cliente.

#### Scenario: Intento de puja tras el fin del tiempo
- **WHEN** se recibe una puja y la hora actual es mayor o igual al `end_time` (`now` >= `end_time`).
- **THEN** el sistema rechaza la puja y asegura que el estado de la subasta sea 'ended'.

### Requirement: Incrementos de Puja Dinámicos
Las pujas deben seguir una escala de incrementos mínimos para asegurar una progresión significativa del precio.

#### Scenario: Validación de incremento según precio actual
- **WHEN** el `current_price` es < 100€, la nueva puja debe ser al menos 1€ superior.
- **WHEN** el `current_price` está entre 100€ y 500€, la nueva puja debe ser al menos 5€ superior.
- **WHEN** el `current_price` es > 500€, la nueva puja debe ser al menos 10€ superior.

### Requirement: Validación de Saldo Previa a la Puja
El sistema debe garantizar que el usuario tiene capacidad de pago antes de aceptar su compromiso de compra.

#### Scenario: Puja con saldo insuficiente
- **WHEN** un usuario intenta realizar una puja.
- **THEN** el sistema verifica el `wallet_balance` del usuario en el `auth-service`.
- **IF** el saldo es menor que el monto de la puja, se rechaza la puja con un mensaje de error solicitando recarga.
