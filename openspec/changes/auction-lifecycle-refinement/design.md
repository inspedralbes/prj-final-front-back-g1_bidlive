## Context

El sistema actual de BidLive permite pujas libres y el cierre se gestiona mediante un proceso de fondo que corre cada 30 segundos, lo que permite pujas en un estado "limbo" donde el tiempo ha expirado pero el sistema aún no ha cerrado la subasta. Además, no se valida el saldo del usuario antes de pujar, lo que permite compromisos de compra ficticios.

## Goals / Non-Goals

**Goals:**
- Implementar anti-sniping (+30s) en el último minuto de subasta.
- Asegurar que el servidor sea la fuente de verdad absoluta para el cierre (0s).
- Validar incrementos mínimos (1€, 5€, 10€) para evitar spam de pujas.
- Validar saldo del usuario en tiempo real antes de aceptar una puja.
- Notificar instantáneamente al usuario superado vía WebSocket.

**Non-Goals:**
- Implementar un sistema de "Auto-bid" (pujas automáticas hasta un máximo).
- Cambiar la pasarela de pago (Stripe).

## Decisions

- **Anti-sniping**: La lógica residirá en el `bidding-service`. Al recibir una puja válida, si el `end_time` está a menos de 60s, solicitará al `auction-service` una extensión y retransmitirá el nuevo tiempo a todos los clientes.
- **Validación de Saldo**: El `bidding-service` realizará una petición síncrona al `auth-service` para verificar el balance antes de proceder con el registro de la puja.
- **Incrementos Dinámicos**: Se encapsulará la lógica de cálculo en una utilidad compartida o consistente entre el frontend y el backend.
- **Cierre Estricto**: Se reducirá el intervalo del `closureService` a 5 segundos y el `bidding-service` rechazará preventivamente pujas si su reloj local indica que la subasta ha terminado.

## Risks / Trade-offs

- **Latencia**: La validación de saldo añade un salto de red extra en el proceso de puja. Se asume aceptable para garantizar la integridad financiera.
- **Sincronización de Relojes**: Pequeñas discrepancias entre el servidor de subastas y el de pujas podrían causar rechazos de pujas legítimas en el último segundo. Se usará el tiempo del servidor de base de datos como referencia única.
