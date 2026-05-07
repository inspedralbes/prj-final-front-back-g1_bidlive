## ADDED Requirements

### Requirement: Automatic Instant Settlement
When an auction ends with a valid winner, the system must automatically execute the financial settlement between the winner and the seller.

#### Scenario: Auction ends with a winner and sufficient balance
- **WHEN** an auction ends and a winner is identified
- **THEN** the system must immediately deduct the final price from the winner's wallet and credit it to the seller's wallet.
- **AND** the auction status must be set to `ended` and the `payment_status` to `paid`.

#### Scenario: Settlement fails due to insufficient balance (Edge case)
- **WHEN** an auction ends but the winner's balance is insufficient to cover the final price
- **THEN** the system must mark the auction as `cancelled_unpaid` immediately.
- **AND** the winner must be penalized with -10 reputation points for failing the commitment.

### Requirement: Removal of Manual Payment Flow
The 24-hour payment window and manual payment button for wallet-based purchases must be removed.

#### Scenario: Viewing a won auction
- **WHEN** a user views an auction they have won
- **THEN** they should see the status as "Paid" and the transaction details, without a manual payment option.
