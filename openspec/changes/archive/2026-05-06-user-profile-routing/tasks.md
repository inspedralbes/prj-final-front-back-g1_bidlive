# Tareas: Implementación de Perfiles

## 1. Frontend: Rutas
- [x] Registrar la ruta `/profile/:id` en `App.jsx`.

## 2. Frontend: Componente Profile
- [x] Importar `useParams` y capturar el ID de la URL.
- [x] Modificar `fetchUserAuctions` para usar el ID de la URL si está presente.
- [x] Implementar estados condicionales (`isOwnProfile`).
- [x] Ocultar elementos privados cuando `!isOwnProfile`.
- [x] Integrar `FollowButton` en la cabecera del perfil cuando es ajeno.

## 3. Verificación
- [x] Probar acceso a `/profile` (perfil propio).
- [x] Probar acceso desde la búsqueda de vendedores a `/profile/:id`.
- [x] Verificar que no se puede editar el perfil de otros usuarios.
