# Design: Seguridad y Liquidación

## Flujo de Pago Seguro
1.  El usuario solicita pagar una subasta.
2.  `auction-service` comprueba: `if (auction.winner_id !== req.user.userId) throw Error("Unauthorized")`.
3.  Si el pago es exitoso (Stripe o Wallet):
    - Se llama a `markPaid(id)`.
    - `markPaid` recupera los datos de la subasta (`seller_id` y `final_price`).
    - `markPaid` hace una llamada interna a `auth-service`: `POST /wallet/credit` con el `seller_id` y el `amount`.

## Cambios en auth-service
- **Endpoint**: `POST /wallet/credit`
- **Payload**: `{ userId, amount, secret }`
- **Lógica**: Utiliza `User.addMoney(userId, amount)`.

## Cambios en auction-service
- **Controller**: `pujaController.js`
    - Actualizar `processPayment` con validación de ganador.
    - Actualizar `markPaid` para incluir la lógica de abono al vendedor.

## Seguridad
- El secreto interno (`INTERNAL_SECRET`) se comparte entre servicios para evitar que usuarios externos inflen sus billeteras llamando directamente al endpoint de crédito.
