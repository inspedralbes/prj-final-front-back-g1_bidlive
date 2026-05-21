## ADDED Requirements

### Requirement: Profile page header adapts to mobile
El header del perfil (avatar, username, stats, wallet) SHALL adaptarse a pantallas de 320px–767px sin que el texto, los badges o los botones se corten o solapen.

#### Scenario: Profile header stacks vertically on mobile
- **WHEN** el usuario accede a su perfil en móvil
- **THEN** el avatar, el nombre, la wallet y los stats se apilan verticalmente centrados, sin overflow horizontal

#### Scenario: Username truncated if too long on mobile
- **WHEN** el username tiene más de 20 caracteres y se muestra en móvil
- **THEN** el texto se trunca con `truncate` o `text-ellipsis` y no desborda el contenedor

#### Scenario: Wallet section readable on mobile
- **WHEN** el usuario ve la sección de wallet en móvil
- **THEN** el input de recarga y el botón están en la misma fila y caben sin overflow; si no caben, se apilan verticalmente

### Requirement: Profile edit form usable on mobile
El formulario de edición de perfil SHALL tener inputs con altura táctil mínima de 44px y texto legible en móvil.

#### Scenario: Edit form inputs have proper sizing on mobile
- **WHEN** el formulario de edición está abierto en móvil
- **THEN** todos los inputs y selects tienen `min-height: 44px` y `font-size >= 16px` para evitar zoom en iOS

#### Scenario: Save/Cancel buttons accessible on mobile
- **WHEN** el formulario de edición está activo en móvil
- **THEN** los botones Guardar y Cancelar ocupan el ancho disponible y son táctiles sin scroll adicional

### Requirement: Auction history cards display enriched data
Las tarjetas de historial de compras ("Mis Compras") SHALL mostrar: título, vendedor, precio final, fecha de la subasta y estado del pago.

#### Scenario: Purchase history shows final price and date
- **WHEN** el usuario ve la tab "Mis Compras"
- **THEN** cada tarjeta muestra el precio final (`current_price`), la fecha de creación (`created_at` formateada) y el estado (`Pagado` / `Pendiente` / `Cancelado`)

#### Scenario: Purchase history shows seller username
- **WHEN** la tarjeta de compra tiene `seller_username` disponible
- **THEN** se muestra "Vendedor: <username>" bajo el título

### Requirement: Profile tabs scroll horizontally on mobile
Las tabs del perfil (Mis Subastas / Mis Favoritos / Mis Compras) SHALL ser scrollables horizontalmente en móvil sin text-wrap.

#### Scenario: Tab bar scrolls on narrow screen
- **WHEN** las tabs no caben en el ancho de la pantalla en móvil
- **THEN** se puede hacer scroll horizontal en la barra de tabs sin que el texto se parta
