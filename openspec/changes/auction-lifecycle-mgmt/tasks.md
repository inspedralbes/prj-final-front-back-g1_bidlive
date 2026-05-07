# Tasks: Gestión de Ciclo de Vida

## Fase 1: Especificación
- [x] [MODIFY] [auction-spec.yaml](file:///c:/Users/HUGO06/Desktop/REPOS%20PERSONALES%20GITHUB/PROYECTOS/prj-final-front-back-g1_bidlive/openspec/specs/auction-spec.yaml): Añadir `winner_id` y `final_price`.
- [x] [RUN] `npm run spec:lint`
- [x] [RUN] `npm run frontend:gen`

## Fase 2: Backend (auction-service)
- [x] [MODIFY] `models/Puja.js`: Añadir columnas y método `closeAuction`.
- [x] [NEW] `services/closureService.js`: Lógica del worker para escanear subastas expiradas.
- [x] [MODIFY] `index.js`: Inicializar el worker al arrancar.
- [x] [MODIFY] `bidding-service/index.js`: Sincronización de pujas con auction-service.

## Fase 3: Frontend
- [x] [MODIFY] `src/pages/LiveAuctionVideo.jsx`: Mostrar el ganador si el estado es `closed`.

## Fase 4: Verificación
- [ ] Crear una subasta que dure 1 minuto.
- [ ] Realizar un par de pujas.
- [ ] Esperar al cierre y verificar que el ganador se asigna correctamente en la DB.
