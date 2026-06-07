# Walkthrough: Seller Discovery and Search

He implementado un sistema completo de búsqueda y descubrimiento de vendedores para profesionalizar el ecosistema de BidLive.

## Cambios Realizados

### 1. Backend (auth-service)
- **Modelo de Usuario**: Añadidos métodos `search` y `getTopSellers` con soporte para búsqueda por `username`/`bio`, paginación y cálculo en tiempo real de seguidores.
- **Controlador**: Implementado `searchUsers` en `profileController.js`.
- **Rutas**: Registrada la ruta `/profile/search` (antes de las rutas dinámicas por ID).
- **Especificaciones**: Actualizado `auth-spec.yaml` para reflejar el nuevo endpoint en la documentación OpenAPI.

### 2. Frontend (Hooks y Componentes)
- **`useSellers.js`**: Nuevo hook para gestionar la comunicación con el endpoint de búsqueda de usuarios.
- **`SellerCard.jsx`**: Componente visual premium que muestra:
    - Avatar y Username.
    - Reputación (estrellas).
    - Biografía (con estilo itálico y limitación de líneas).
    - Estadísticas (Ventas totales y Seguidores).
    - **Botón de Follow** integrado.

### 3. Integración de UI (`Search.jsx`)
- **Pestañas de Navegación**: Añadido un selector de pestañas entre "Subastas" y "Vendedores".
- **Búsqueda Dinámica**: El input de búsqueda ahora cambia su placeholder y su lógica según la pestaña activa.
- **Estados Vacíos**: Mensajes personalizados para cuando no hay resultados en cada categoría.
- **Navegación Global**: Actualizado el `Header.jsx` para incluir un acceso directo a la sección de "Sellers".

## Verificación Visual

- [x] Pestaña "Vendedores" muestra a los top sellers por defecto (ordenados por reputación).
- [x] Búsqueda por palabras clave (ej: "vintage") filtra correctamente por bio/username.
- [x] El botón de seguir en las cartas actualiza el contador de seguidores instantáneamente.

---
El sistema está listo para ser usado por la comunidad. Los usuarios ahora pueden encontrar y seguir a sus creadores favoritos fácilmente.
