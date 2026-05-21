## ADDED Requirements

### Requirement: Email winner delivery with robust error handling
El sistema SHALL enviar el email de confirmación de victoria al ganador con logging detallado en cada paso (usuario encontrado, email encontrado, envío iniciado, resultado) y SHALL emitir un warning explícito en consola si `SMTP_USER` no está configurado en producción.

#### Scenario: Winner email sent successfully in production
- **WHEN** `endPuja` se ejecuta, existe un `winnerId`, y `SMTP_USER` está configurado
- **THEN** el sistema encuentra el email del usuario en DB, llama a `sendAuctionWinEmail`, y loguea "Email sent to <email> for auction <id>"

#### Scenario: Winner user not found in DB
- **WHEN** la query `SELECT email FROM users WHERE id = ?` retorna un array vacío
- **THEN** el sistema loguea "Winner user <winnerId> not found in DB - email not sent" y NO lanza excepción que rompa el flujo de `endPuja`

#### Scenario: Email sending fails (SMTP error)
- **WHEN** `sendAuctionWinEmail` lanza una excepción
- **THEN** el error completo (stack trace) se loguea en consola y el flujo de `endPuja` continúa (el error de email NO debe impedir que la subasta quede marcada como ended)

#### Scenario: No SMTP configured (development/staging)
- **WHEN** `SMTP_USER` no está en las variables de entorno
- **THEN** el sistema usa Ethereal, loguea la URL de preview del email en consola, y NO falla silenciosamente

### Requirement: Email sent exactly once per auction end
El sistema SHALL garantizar que el email al ganador se envía una sola vez, aprovechando el guard idempotente de `endPuja` (`puja.status === 'ended'`).

#### Scenario: endPuja called twice (idempotency)
- **WHEN** `endPuja` se llama dos veces para la misma subasta
- **THEN** la segunda llamada retorna inmediatamente con "Already ended" y NO envía un segundo email
