# Proposal: Seguridad en Pagos y Liquidación al Vendedor

## Objetivo
Garantizar que solo los ganadores legítimos puedan pagar sus subastas y que el dinero llegue automáticamente a los vendedores tras la transacción.

## Cambios Principales
1.  **Validación de Identidad**: En `auction-service`, verificar que el usuario que intenta pagar es el `winner_id` de la subasta.
2.  **Liquidación al Vendedor**: Implementar una transferencia interna desde el sistema a la billetera del vendedor una vez que el pago del comprador es confirmado.
3.  **Nueva Ruta Interna**: Crear en `auth-service` un endpoint `/wallet/credit` protegido por secreto interno para realizar abonos.

## Valor de Negocio
Previene fraudes de suplantación en el pago y asegura que los vendedores reciban su compensación de forma inmediata, incentivando la participación en la plataforma.
