## 1. Backend: Búsqueda de Usuarios (auth-service)

- [x] 1.1 Implementar `searchUsers` en `profileController.js`.
- [x] 1.2 Registrar ruta `GET /profile/search` en `profileRoutes.js`.
- [x] 1.3 Asegurar que la búsqueda sea insensible a mayúsculas/minúsculas y soporte paginación básica.

## 2. Frontend: Hooks y Componentes

- [x] 2.1 Crear hook `useSellers.js` para consumir el nuevo endpoint de búsqueda.
- [x] 2.2 Crear componente `SellerCard.jsx` para mostrar información resumida del vendedor (Avatar, Nick, Reputación, Seguidores).
- [x] 2.3 Refactorizar `Search.jsx` para incluir tabs de navegación entre "Subastas" y "Vendedores".

## 3. Frontend: Integración y Refinamiento

- [x] 3.1 Implementar la lógica de cambio de estado en `Search.jsx` para alternar entre resultados de subastas y vendedores.
- [x] 3.2 Asegurar que el input de búsqueda global funcione correctamente para ambos contextos.
- [x] 3.3 Añadir botón de "Seguir" en cada `SellerCard` (reutilizando `FollowButton.jsx`).

## 4. Verificación

- [x] 4.1 Probar búsqueda por nombre parcial.
- [x] 4.2 Verificar que el contador de seguidores se actualiza al interactuar desde la búsqueda.
- [x] 4.3 Validar el ordenamiento por reputación en la vista de descubrimiento inicial.
