## Why

La plataforma carece de una forma para que los usuarios sigan a sus vendedores favoritos y reciban notificaciones automáticas sobre el ciclo de vida de las subastas (inicio de live, superación de puja, ganador de subasta). Implementar este sistema aumentará la retención de usuarios, el compromiso con los vendedores y la transparencia en el proceso de cierre y pago.

## What Changes

1.  **Sistema de Seguimiento**: Nueva funcionalidad para que los usuarios sigan a vendedores.
2.  **Notificaciones de Ciclo de Vida**:
    *   Notificar a seguidores cuando un vendedor inicia un live.
    *   Notificar a usuarios que marcaron una subasta como favorita cuando esta inicie.
    *   Notificar automáticamente al ganador y al vendedor al finalizar la subasta.
    *   Notificar al vendedor cuando se procesa un pago.
3.  **Integración de Backend**: Coordinación entre `auth-service` (seguidores/notificaciones persistentes), `auction-service` (eventos de subasta) y `bidding-service` (entrega en tiempo real).

## Capabilities

### New Capabilities
- `seller-following`: Permite a los usuarios seguir/dejar de seguir a otros usuarios (vendedores) y consultar estadísticas de seguidores.
- `lifecycle-notifications`: Sistema de orquestación de notificaciones automáticas para eventos clave de la subasta (inicio, fin, pago).

### Modified Capabilities
- `bidding-notifications`: Ampliar el sistema de notificaciones de pujas para soportar múltiples destinatarios y nuevos tipos de eventos globales.

## Impact

*   **auth-service**: Nueva tabla `followers`, nuevos controladores y endpoints de seguimiento.
*   **auction-service**: Inyección de lógica de notificación en `closureService` y `pujaController`.
*   **bidding-service**: Nuevos endpoints internos para envíos masivos de notificaciones vía WebSocket.
*   **Frontend**: Botón de "Seguir" en perfiles, integración de notificaciones de inicio de live.
