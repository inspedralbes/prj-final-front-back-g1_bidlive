## Context

When an auction concludes and a winning bid is determined, the platform currently updates the database but does not proactively notify the winning user. Providing an immediate confirmation via email is a standard e-commerce practice that ensures users are aware of their success and provides them with next steps (e.g., payment, shipping).

## Goals / Non-Goals

**Goals:**
- Automatically detect when an auction ends with a winning bidder.
- Send a formatted HTML email to the winning user with auction details (item name, winning bid amount, auction ID).
- Integrate a reliable email delivery mechanism (e.g., Nodemailer).

**Non-Goals:**
- Handling payment processing or shipping logistics within this change.
- Notifications for outbid events or auction start events (this focuses purely on the auction win).
- SMS or push notifications.

## Decisions

- **Email Service Integration**: Use Nodemailer as the primary email sending library in the backend (`auction-service` or a dedicated `notification-service`). Nodemailer is robust and supports various transports (SMTP, SendGrid, AWS SES).
- **Trigger Mechanism**: The email sending logic will be triggered exactly when the auction state transitions to "ended" and a winner is computed. If the system uses an event bus (e.g., RabbitMQ, Kafka, or Redis Pub/Sub), the auction service will emit an `AUCTION_WON` event to decouple email sending from core auction logic.

## Risks / Trade-offs

- **[Risk] Email delivery failure** due to invalid email addresses or SMTP issues. → Mitigation: Implement basic error logging and do not block the main auction completion transaction if the email fails to send.
- **[Risk] Duplicate emails** if the end-auction logic runs multiple times. → Mitigation: Ensure the trigger is idempotent (e.g., only send when the status transitions from 'active' to 'ended').
