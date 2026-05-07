# Tasks: Seguridad y Liquidación

## Fase 1: auth-service
- [x] [MODIFY] `controllers/paymentController.js`: Añadir método `creditWallet`.
- [x] [MODIFY] `index.js`: Registrar ruta `POST /wallet/credit`.

## Fase 2: auction-service
- [x] [MODIFY] `controllers/pujaController.js`: Validar `winner_id` en `processPayment`.
- [x] [MODIFY] `controllers/pujaController.js`: Implementar abono al vendedor en `markPaid`.

## Fase 3: Verificación
- [/] Intentar pagar una subasta ganada por otro usuario (debe fallar).
- [/] Realizar un pago legítimo y verificar que el saldo del vendedor aumenta.
