# Diseño: Perfiles Dinámicos

## Frontend

### 1. Routing (`App.jsx`)
Añadir una nueva ruta:
```jsx
<Route path="/profile/:id" element={<Profile />} />
```

### 2. Componente de Perfil (`Profile.jsx`)
- Utilizar `useParams` de `react-router-dom` para capturar el `id`.
- Lógica de detección:
    - Si `id` existe y es diferente a `currentUser.id` -> **Modo Público**.
    - Si `id` no existe o es igual a `currentUser.id` -> **Modo Privado**.
- **Modo Público**:
    - Ocultar sección de Cartera (Wallet).
    - Ocultar botón de "Editar Perfil".
    - Mostrar botón de "Seguir" (FollowButton).
    - Solo mostrar la pestaña de "Subastas creadas".
    - Deshabilitar las pestañas de "Mis Favoritos" y "Mis Compras".

## Backend
El backend ya soporta `GET /auth/profile/:id`, por lo que no se requieren cambios adicionales en la API, solo asegurar que la respuesta incluya los campos necesarios para la vista pública (bio, reputación, seguidores).
