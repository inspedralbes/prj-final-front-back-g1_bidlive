## Why

Actualmente, el sistema de subastas carece de reglas estrictas para el cierre y las pujas, lo que genera incertidumbre ("vagueza") y puede ser injusto para los participantes (sniping de último milisegundo, pujas de céntimos irrelevantes, o pujas sin fondos). Necesitamos profesionalizar el núcleo de BidLive para asegurar competitividad, fluidez y confianza.

## What Changes

Implementaremos un conjunto de reglas robustas en el servidor para gestionar el ciclo de vida de la subasta:
- **Anti-sniping**: Extensión automática de +30s si se recibe una puja en los últimos momentos.
- **Cierre Estricto**: El servidor liquidará la subasta exactamente en el segundo 0, rechazando cualquier puja posterior.
- **Incrementos Dinámicos**: Obligatoriedad de superar la puja actual por un margen escalonado (1€, 5€, 10€) según el precio.
- **Validación de Fondos**: Bloqueo de pujas si el usuario no tiene saldo suficiente en su billetera.
- **Feedback en Tiempo Real**: Notificaciones emergentes (toasts) inmediatas cuando un usuario es superado.

## Capabilities

### New Capabilities
- `auction-lifecycle`: Define las reglas de transición de estados, anti-sniping, validación de incrementos y verificación de fondos durante el proceso de puja activa.

### Modified Capabilities
<!-- No requirement changes to existing base specs, just refining implementation logic within the new lifecycle capability -->

## Impact

- **bidding-service**: Lógica central de validación de pujas y comunicación con auth-service.
- **auction-service**: Gestión de tiempos de fin y cierre automático (closureService).
- **auth-service**: Endpoint de consulta rápida de saldo para validación pre-puja.
- **frontend**: Actualización de temporizadores, validaciones en el formulario de puja y sistema de toasts.
