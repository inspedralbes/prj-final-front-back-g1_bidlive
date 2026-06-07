## 1. Backend: Sistema de Seguimiento (auth-service)

- [x] 1.1 Crear modelo `Follower.js` con tabla `followers` (follower_id, seller_id).
- [x] 1.2 Implementar `followerController.js` con métodos toggle, check y stats.
- [x] 1.3 Registrar rutas en `auth-service/index.js` e inicializar tabla.
- [x] 1.4 Añadir endpoint interno `GET /follow/internal/followers/:sellerId` para otros servicios.

## 2. Backend: Orquestación de Notificaciones (auction-service)

- [x] 2.1 Modificar `services/closureService.js` para enviar notificaciones de "Auction Won" y "Auction Sold".
- [x] 2.2 Modificar `controllers/pujaController.js` en `startPuja` para disparar notificaciones de "Live Starting".
- [x] 2.3 Modificar `controllers/pujaController.js` en `endPuja` para asegurar notificaciones consistentes.

## 3. Backend: Entrega en Tiempo Real (bidding-service)

- [x] 3.1 Verificar y asegurar que el endpoint `/notify-user` funciona correctamente con `userSockets`.
- [x] 3.2 Implementar helper para envíos masivos (broadcast a una lista de userIds).

## 4. Frontend: Interfaz de Usuario

- [x] 4.1 Implementar botón de "Seguir" en la página de perfil del vendedor/subasta.
- [x] 4.2 Actualizar `useNotifications` para manejar los nuevos tipos de mensaje (`live_starting`, `auction_won`).
- [x] 4.3 Añadir contador de seguidores en el perfil de usuario.

## 5. Verificación

- [x] 5.1 Probar seguimiento entre dos usuarios.
- [x] 5.2 Simular inicio de live y verificar llegada de notificación a seguidores.
- [x] 5.3 Forzar cierre de subasta y verificar llegada de notificación de ganador.
