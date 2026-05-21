## ADDED Requirements

### Requirement: Messages.jsx responsive mobile-first
La página `Messages.jsx` SHALL implementar un layout de columna única en pantallas < `md` (768px). En móvil, el sidebar de conversaciones SHALL ocupar el 100% del ancho y el `ChatThread` SHALL estar oculto. Al seleccionar una conversación, el sidebar SHALL ocultarse y el `ChatThread` SHALL mostrarse con un botón `← Volver` que restaura el sidebar. En desktop (≥ `md`), el layout de dos columnas actual SHALL mantenerse.

#### Scenario: Usuario abre Messages en móvil sin conversación activa
- **WHEN** el usuario navega a `/messages` en un viewport < 768px
- **THEN** ve el sidebar con la lista de conversaciones a pantalla completa sin overflow horizontal

#### Scenario: Usuario selecciona una conversación en móvil
- **WHEN** el usuario toca una conversación de la lista
- **THEN** el sidebar se oculta, el ChatThread se muestra a pantalla completa con botón "← Volver"

#### Scenario: Usuario pulsa Volver en el chat thread
- **WHEN** el usuario pulsa "← Volver" en el ChatThread
- **THEN** el sidebar se vuelve a mostrar y el ChatThread se oculta

#### Scenario: Layout desktop inalterado
- **WHEN** el viewport es ≥ 768px
- **THEN** el sidebar (ancho fijo ~20rem) y el ChatThread son visibles simultáneamente

### Requirement: Overflow horizontal eliminado en Messages
El contenedor raíz de `Messages.jsx` SHALL tener `overflow-x: hidden` y todos los elementos hijos SHALL tener anchos de max 100vw para evitar scroll horizontal en dispositivos móviles.

#### Scenario: Sin scroll horizontal en móvil
- **WHEN** el usuario abre Messages en un viewport de 375px
- **THEN** no existe scroll horizontal en la página
