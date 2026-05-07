## 1. Backend: Persistencia de Notificaciones (auth-service)

- [x] 1.1 Crear el modelo `Notification.js` y la migración para la tabla `notifications`.
- [x] 1.2 Implementar `notificationController.js` con métodos `getNotifications`, `markAsRead` y `createInternal`.
- [x] 1.3 Registrar las rutas en `index.js` (incluyendo el endpoint interno protegido).

## 2. Real-time: Infraestructura de Mensajería (bidding-service)

- [x] 2.1 Actualizar el servidor de WebSockets para manejar el registro de usuarios global (`REGISTER_USER`).
- [x] 2.2 Implementar el sistema de emisión de eventos `NOTIFICATION` a Sockets específicos por `userId`.
- [x] 2.3 Añadir un endpoint interno para que otros servicios soliciten el envío de una notificación en tiempo real.

## 3. Integración de Eventos de Negocio

- [x] 3.1 **Subastas**: En `auction-service`, disparar una notificación al ganador cuando la subasta termina.
- [x] 3.2 **Pujas**: En `bidding-service`, disparar una notificación de "superado" al postor anterior cuando entra una puja mayor.

## 4. Frontend: Centro de Control de Notificaciones

- [x] 4.1 Crear el componente `NotificationBell.jsx` con el dropdown de notificaciones.
- [x] 4.2 Implementar un hook `useNotifications.js` que se conecte al WebSocket global y maneje el estado de las notificaciones.
- [x] 4.3 Integrar la campana en el `Header.jsx` y asegurar que los avisos activen el `NotificationToast`.
