## Context

Actualmente, BidLive cuenta con un sistema básico de pujas en tiempo real y favoritos de subasta, pero la interacción social es limitada. Los usuarios no reciben alertas cuando un vendedor al que aprecian inicia un directo, ni hay una comunicación automática persistente sobre los resultados de las subastas una vez finalizadas por el servidor.

## Goals / Non-Goals

**Goals:**
*   Implementar una relación de seguimiento (Follow) entre usuarios.
*   Automatizar las notificaciones de "Auction Won" y "Auction Sold" desde el servidor.
*   Implementar alertas de "Live Starting" para seguidores y usuarios con la subasta en favoritos.
*   Garantizar la persistencia de las notificaciones en la base de datos para consulta diferida.

**Non-Goals:**
*   Implementar un "feed" social de actividades.
*   Implementar mensajería privada entre usuarios.
*   Cambiar la arquitectura de microservicios existente.

## Decisions

1.  **Persistencia en Auth-Service**: La tabla `followers` y el almacenamiento de `notifications` residirán en `auth-service` por ser el dueño de la entidad Usuario.
2.  **Orquestación en Auction-Service**: El servicio de subastas detectará los cambios de estado (live/ended) y disparará las peticiones de notificación a los otros servicios.
3.  **Entrega en tiempo real vía Bidding-Service**: Se usará el socket global del `bidding-service` para la entrega instantánea de notificaciones.
4.  **Endpoint interno /notify-user**: Se estandarizará un endpoint interno protegido por `INTERNAL_SECRET` para que los servicios soliciten el envío de notificaciones WS a usuarios específicos.

## Risks / Trade-offs

*   **Riesgo**: Sobrecarga de notificaciones si un vendedor tiene miles de seguidores.
*   **Trade-off**: Las notificaciones masivas de "Live Starting" se procesarán de forma secuencial inicialmente; si el volumen crece, se requerirá una cola de mensajes (RabbitMQ/Redis).
*   **Riesgo**: Latencia en la actualización del contador de seguidores.
