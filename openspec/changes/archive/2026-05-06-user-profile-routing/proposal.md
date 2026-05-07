# Propuesta: Navegación a Perfiles Públicos

## Problema
Actualmente, la plataforma solo permite visualizar el perfil del usuario autenticado a través de la ruta `/profile`. Al implementar el sistema de búsqueda de vendedores, hemos generado enlaces a `/profile/:id`, los cuales provocan un error 404 en el frontend porque la ruta no existe en `App.jsx`.

## Objetivos
1. Habilitar la ruta dinámica `/profile/:id` en el frontend.
2. Refactorizar el componente `Profile.jsx` para que pueda mostrar tanto el perfil propio (editable) como el perfil de terceros (público).
3. Asegurar que los datos privados (cartera, configuración de pago, favoritos) solo sean visibles para el dueño del perfil.

## Impacto
- **UX**: Los usuarios podrán descubrir vendedores y ver su historial de subastas.
- **Social**: Mejora la tracción del sistema de seguimiento (Follow).
