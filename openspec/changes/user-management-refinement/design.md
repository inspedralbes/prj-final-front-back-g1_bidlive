# Design: Refinamiento de Gestión de Usuarios

## Cambios en Especificación (OpenAPI)
Modificaremos `auth-spec.yaml`:
- Añadir `bio` (string) al esquema `User`.
- Añadir `reputation` (number) al esquema `User`.
- Añadir `total_sales` y `total_bids` para contexto.

## Backend (auth-service)
- **Modelo Sequelize**: Actualizar `User.js` para incluir `bio` y `reputation`.
- **Controlador de Perfil**: Actualizar `getUserProfile` para devolver estos nuevos campos.
- **Lógica de Reputación**: Por ahora, el campo será persistente en la DB, pero crearemos un helper para actualizarlo cuando ocurra un evento de pago (en el futuro se activará vía Webhook).

## Frontend
- **Componente Profile**: Actualizar la interfaz para mostrar la biografía y las estrellas de reputación.
- **Formulario de Edición**: Añadir el campo de biografía.

## Seguridad
Solo el dueño del perfil puede editar su `bio`. La `reputation` es de solo lectura para el usuario (calculada por el sistema).
