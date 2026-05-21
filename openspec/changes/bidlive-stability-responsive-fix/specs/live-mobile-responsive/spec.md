## ADDED Requirements

### Requirement: Live auction page adapts to mobile screens
La página LiveAuctionVideo SHALL mostrar correctamente todos sus elementos en pantallas de 320px a 767px de ancho sin desbordamiento horizontal, sin elementos cortados y con interacciones táctiles accesibles.

#### Scenario: Mobile layout — video and bid panel stacked vertically
- **WHEN** el usuario accede al live en un dispositivo con ancho <768px
- **THEN** el vídeo ocupa el ancho completo con `aspect-video` y el panel de puja/chat queda debajo con scroll independiente

#### Scenario: BiddingHUD quick bid buttons readable on mobile
- **WHEN** se renderizan los 4 botones de puja rápida en móvil
- **THEN** cada botón tiene al menos 44px de altura táctil y el texto no se desborda

#### Scenario: Chat input accessible on mobile (no iOS zoom)
- **WHEN** el usuario toca el input del chat en iOS Safari
- **THEN** el input tiene `font-size >= 16px` y no se produce zoom automático

#### Scenario: Auction ended popup fits mobile screen
- **WHEN** se muestra el popup de fin de subasta en móvil
- **THEN** el popup no supera el ancho de la pantalla, tiene `mx-4` de margen y es scrollable si el contenido es largo

### Requirement: Seller live page adapts to mobile screens
La página SellerLiveVideo SHALL mostrar el panel de estadísticas y el chat correctamente en móvil, con el vídeo/preview encima y el panel de control debajo.

#### Scenario: Seller stats panel visible on mobile
- **WHEN** el vendedor accede al live en móvil
- **THEN** los 3 stats (viewers, puja actual, tiempo) se muestran en una fila compacta sin solapamiento

#### Scenario: Go Live button always accessible on mobile
- **WHEN** el vendedor accede antes de iniciar el live en móvil
- **THEN** el botón "Go Live" es visible y táctil sin requerir scroll

### Requirement: No horizontal overflow on any live page
Las páginas de live SHALL tener `overflow-x: hidden` en el contenedor raíz para evitar scroll horizontal accidental en móvil.

#### Scenario: No horizontal scrollbar on mobile
- **WHEN** se renderiza LiveAuctionVideo o SellerLiveVideo en 375px de ancho
- **THEN** no existe ningún elemento que cause scroll horizontal
