## Context

Actualmente, el `bidding-service` actúa como el motor de WebSockets para las subastas en vivo, pero está limitado a una "sala" (room) por subasta. El `auth-service` gestiona el perfil del usuario pero no tiene noción de eventos en tiempo real. Necesitamos un puente para que cualquier servicio pueda disparar notificaciones persistentes y entregarlas en tiempo real.

## Goals / Non-Goals

**Goals:**
- Centralizar el almacenamiento de notificaciones en el `auth-service`.
- Permitir la entrega en tiempo real en cualquier página (no solo en la sala de subasta).
- Proporcionar una interfaz de usuario intuitiva (campana con contador de no leídas).
- Soporte para diferentes tipos de notificaciones (info, success, warning, outbid).

**Non-Goals:**
- Notificaciones vía Email o SMS (fuera de alcance por ahora).
- Notificaciones Push de navegador (Service Workers).
- Historial infinito de notificaciones (limitaremos el listado a las últimas 50).

## Decisions

1. **Almacenamiento (Backend)**:
   - Nueva tabla `notifications` en `auth-service`.
   - Campos: `id`, `user_id`, `title`, `message`, `type` (enum), `is_read` (bool), `link` (optional), `created_at`.
   - Endpoint interno `POST /notifications/internal` (con `INTERNAL_SECRET`) para que otros servicios creen notificaciones.

2. **Entrega en Tiempo Real (WebSocket)**:
   - El `bidding-service` mantendrá una conexión global opcional para notificaciones.
   - Cuando un usuario inicia sesión, el frontend se conectará a un namespace `/notifications` o enviará un mensaje de registro de usuario al WS.
   - El `bidding-service` mantendrá un mapeo `userId -> socketId`.

3. **Arquitectura de Eventos**:
   - `Bidding Service`: Si un bid supera al anterior, crea una notificación persistente para el `last_bidder_id` y emite el evento WS si está conectado.
   - `Auction Service`: Al cerrar una subasta, crea una notificación para el `winner_id`.

## Risks / Trade-offs

- **Carga en el Bidding Service**: El mapeo de todos los usuarios conectados puede aumentar el consumo de memoria. Usaremos una estructura de datos eficiente.
- **Sincronización**: Si el usuario tiene múltiples pestañas abiertas, todas recibirán la notificación. Es deseable pero requiere manejo de estado en el cliente.
- **Latencia de DB**: Insertar en DB antes de enviar vía WS añade latencia, pero garantiza que la notificación no se pierda si el socket falla justo en ese momento.
