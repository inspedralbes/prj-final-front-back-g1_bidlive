## 1. Backend: Auction Service (Persistencia y Cierre)

- [ ] 1.1 Añadir el método `extendEndTime(id, seconds)` al modelo `Puja.js`.
- [ ] 1.2 Implementar el endpoint `PATCH /pujas/:id/extend` para permitir extensiones por anti-sniping.
- [ ] 1.3 Actualizar `closureService.js` para reducir el intervalo de chequeo de 30s a 5s para un cierre más preciso.

## 2. Backend: Bidding Service (Lógica de Negocio en Tiempo Real)

- [ ] 2.1 Implementar la validación de incrementos dinámicos (+1€, +5€, +10€) en el manejador de `PLACE_BID`.
- [ ] 2.2 Integrar chequeo de saldo síncrono con el `auth-service` antes de aceptar cualquier puja.
- [ ] 2.3 Implementar lógica de anti-sniping: detectar pujas en el último minuto y disparar la extensión en el `auction-service`.
- [ ] 2.4 Reforzar el cierre estricto rechazando pujas si el tiempo ha expirado localmente.

## 3. Frontend: Experiencia de Puja y Notificaciones

- [ ] 3.1 Actualizar el componente de puja para validar el incremento mínimo antes de enviar.
- [ ] 3.2 Deshabilitar/Advertir en el botón de puja si el saldo del usuario es inferior a la puja mínima requerida.
- [ ] 3.3 Asegurar que el temporizador se actualice suavemente cuando se reciba un evento de extensión de tiempo.
- [ ] 3.4 Añadir un mensaje de sistema en el chat cuando la subasta se extienda: "¡Emoción en el último minuto! Tiempo extendido +30s".
