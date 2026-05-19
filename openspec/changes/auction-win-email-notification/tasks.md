## 1. Setup and Dependencies

- [x] 1.1 Add `nodemailer` to backend dependencies (auction-service or notification-service).
- [x] 1.2 Configure required environment variables for email sending (e.g., SMTP host, port, user, password) in local and production environments.

## 2. Core Email Implementation

- [x] 2.1 Create a utility or service module for email sending (e.g., `emailService.js`) using `nodemailer`.
- [x] 2.2 Create the HTML email template structure for "Auction Won" containing placeholders for item name, winning bid amount, and auction ID.

## 3. Auction Win Integration

- [x] 3.1 Modify the auction end logic to emit an `AUCTION_WON` event or directly trigger the notification service.
- [x] 3.2 Implement a listener/handler that captures the `AUCTION_WON` event and gathers the necessary user and auction data (winning user's email, item details).
- [x] 3.3 Call the email service from the handler to send the email and handle any errors to prevent blocking the auction state transition.

## 4. Verification

- [x] 4.1 Write integration or unit tests for the email sending logic (mocking `nodemailer`).
- [x] 4.2 Manually test by simulating an auction end and verifying an email is logged/sent.
