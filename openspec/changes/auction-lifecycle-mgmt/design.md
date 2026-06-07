# Design: Ciclo de Vida de Subastas

## Cambios en Especificación (OpenAPI)
Modificaremos `auction-spec.yaml`:
- Añadir `winner_id` (integer) al esquema `Auction`.
- Añadir `final_price` (number) al esquema `Auction`.

## Backend (auction-service)
- **Modelo Auction**: Añadir columnas `winner_id` y `final_price` a la base de datos.
- **Worker de Cierre**: 
    - Implementaremos un `setInterval` (o un CronJob ligero) en `index.js` que se ejecute cada 30 segundos.
    - Buscará subastas con `status = 'live'` y `end_time < NOW()`.
    - Para cada una, buscará la puja más alta en la tabla `bids`.
    - Actualizará la subasta con el `winner_id`, `final_price` y cambiará el estado a `closed`.
- **Integración**: Notificar al `bidding-service` (vía Redis o evento) que la sala se ha cerrado.

## Frontend
- **Auction Detail**: Mostrar un banner de "Subasta Finalizada" y el nombre del ganador si la subasta está cerrada.
- **My Purchases**: Asegurar que las subastas ganadas aparezcan en la sección correspondiente del perfil.

## Seguridad
Solo el sistema puede ejecutar el cierre. El `winner_id` es inmutable una vez cerrada la subasta.
