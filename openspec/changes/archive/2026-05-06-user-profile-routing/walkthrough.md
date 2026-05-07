# Walkthrough: Dynamic User Profiles

He habilitado la capacidad de visitar perfiles de otros usuarios mediante su ID, resolviendo el error de rutas y mejorando la interacción social.

## Cambios Realizados

### 1. Sistema de Rutas
- **`App.jsx`**: Se ha añadido la ruta dinámica `<Route path="/profile/:id" element={<Profile />} />`. Ahora los enlaces desde las cartas de vendedores o la búsqueda funcionan correctamente.

### 2. Componente de Perfil Inteligente (`Profile.jsx`)
- **Detección de Contexto**: El componente ahora detecta si estás viendo tu propio perfil o el de alguien más comparando el ID de la URL con el ID del usuario en el contexto de autenticación.
- **Privacidad y Seguridad**:
    - Si es el perfil de otro usuario, se oculta la sección de **Monedero (Wallet)** y la gestión de fondos.
    - Se ocultan las pestañas de **Favoritos** y **Compras**, que son datos privados.
    - Se deshabilita la capacidad de **Editar Perfil** y subir un nuevo avatar.
- **Interacción Social**:
    - Se ha integrado el `FollowButton` directamente en la cabecera del perfil cuando visitas a otro usuario.
    - Se muestran las estadísticas de seguidores y reputación del usuario visitado.

## Verificación

- [x] Al hacer clic en un vendedor desde la búsqueda, se navega correctamente a `/profile/:id`.
- [x] Al navegar a `/profile`, se sigue viendo el perfil personal con todas las opciones de edición y monedero.
- [x] Los perfiles ajenos cargan correctamente las subastas creadas por ese usuario.
