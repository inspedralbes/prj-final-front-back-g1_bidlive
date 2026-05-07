## ADDED Requirements

### Requirement: User Following
Los usuarios deben poder seguir y dejar de seguir a otros usuarios (vendedores) para recibir actualizaciones de su actividad.

#### Scenario: Follow a Seller
- **WHEN** Un usuario autenticado solicita seguir a un vendedor desde su perfil.
- **THEN** Se crea un registro en la tabla `followers` y el contador de seguidores del vendedor aumenta.

#### Scenario: Unfollow a Seller
- **WHEN** Un usuario que ya sigue a un vendedor solicita dejar de seguirlo.
- **THEN** Se elimina el registro de la tabla `followers`.

#### Scenario: Self-Following Prevention
- **WHEN** Un usuario intenta seguirse a sí mismo.
- **THEN** El sistema devuelve un error de validación.
