## ADDED Requirements

### Requirement: Email de bienvenida al registrarse
El auth-service SHALL enviar un email de bienvenida al completar el registro de un nuevo usuario (tanto registro normal como Google). El email SHALL incluir: saludo con el username, descripción breve de BidLive, CTA para explorar subastas, CTA para completar el perfil, logo de BidLive y links a secciones principales. El envío SHALL ser asíncrono (fire-and-forget) y no bloquear el registro.

#### Scenario: Registro exitoso de usuario normal
- **WHEN** un usuario completa el registro con email y contraseña válidos
- **THEN** el sistema crea la cuenta, devuelve 201 inmediatamente, y envía el email de bienvenida en background

#### Scenario: Registro exitoso vía Google
- **WHEN** un usuario se registra por primera vez con Google OAuth
- **THEN** el sistema crea la cuenta y envía el email de bienvenida en background

#### Scenario: Fallo al enviar el email no bloquea el registro
- **WHEN** el servidor SMTP no está disponible al registrar
- **THEN** el registro se completa correctamente y el error del email se logua como `[EmailService] Welcome email failed for ${email}:`
