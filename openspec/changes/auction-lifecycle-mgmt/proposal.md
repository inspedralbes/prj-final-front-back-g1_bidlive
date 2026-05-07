# Proposal: Gestión del Ciclo de Vida y Cierre de Subastas

## Objetivo
Implementar la lógica necesaria para que las subastas se cierren automáticamente al llegar a su tiempo de fin (US-10) y se determine un ganador de forma fiable (US-11).

## Cambios Principales
1.  **Cierre Automático**: Implementar un proceso en el `auction-service` que verifique periódicamente las subastas que han expirado.
2.  **Determinación de Ganador**: Al cerrar una subasta, identificar la puja más alta y marcar al usuario como ganador (`winner_id`).
3.  **Transiciones de Estado**: Asegurar el flujo `upcoming` -> `live` -> `closed`.
4.  **Actualización de Spec**: Reflejar el `winner_id` y el `final_price` en el contrato de API.

## Valor de Negocio
Sin un cierre automático, el sistema requiere intervención manual, lo que rompe la experiencia de usuario y la confianza en la plataforma.
