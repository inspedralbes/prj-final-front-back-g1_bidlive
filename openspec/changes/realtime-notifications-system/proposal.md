## Why

Actualmente, los usuarios solo reciben feedback inmediato si están mirando activamente una subasta en vivo (a través de mensajes de sistema en el chat). Sin embargo, carecen de un centro de notificaciones global que les informe de eventos críticos (superación de pujas, subastas ganadas, recargas de saldo) cuando navegan por otras partes de la plataforma o cuando vuelven tras estar offline.

## What Changes

Implementaremos un sistema de notificaciones persistente y en tiempo real:
- **Persistencia**: Almacenamiento en base de datos para consulta diferida.
- **Tiempo Real**: Entrega inmediata vía WebSockets a través del `bidding-service`.
- **Interfaz**: Un centro de notificaciones en el `Header` (campana) y integración con los `toasts` existentes para avisos inmediatos.

## Capabilities

### New Capabilities
- `notifications-center`: Gestión de notificaciones persistentes (creación, listado, marcado como leído).
- `realtime-delivery`: Capacidad de envío selectivo de eventos de notificación a usuarios específicos a través de WebSockets.

### Modified Capabilities
- `bidding-service`: Integración para emitir eventos de notificación cuando un usuario es superado en una puja.
- `auction-service`: Integración para notificar al ganador cuando una subasta expira y se cierra con éxito.

## Impact

- **Backend**: Nuevos modelos y rutas en `auth-service` para la persistencia.
- **WebSocket**: Ampliación del protocolo en `bidding-service` para manejar eventos tipo `NOTIFICATION`.
- **Frontend**: Nuevo componente de campana en `Header.jsx` y hook de escucha global.
