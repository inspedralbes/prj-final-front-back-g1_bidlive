## Context

The current system allows for a 24-hour payment window after an auction ends. However, since we validate balances at bid time, we can automate the settlement to improve seller security and simplify the code.

## Goals / Non-Goals

**Goals:**
- Automate the debit/credit flow during auction closure.
- Eliminate the 24-hour grace period for wallet-based wins.
- Clean up the `paymentWorker` and related database fields.

**Non-Goals:**
- Instant settlement for Stripe/External payments (these still require user interaction for 3DS, etc., but since we primarily use wallet for bids, this is the main focus).

## Decisions

- **Direct Integration**: The `closureService.js` will now call the Internal Auth API to perform `debit` on the winner and `credit` on the seller.
- **Immediate Cancellation**: If the wallet transfer fails, the auction is immediately cancelled.
- **Decommissioning**: 
    - Delete `paymentWorker.js`.
    - Remove `startPaymentWorker()` from `index.js`.
    - Revert `statusColor` and filters in frontend to handle "Paid" as the default state for ended auctions.

## Risks / Trade-offs

- **Consistency**: We must ensure that if the debit fails, the credit doesn't happen, and the auction status is updated correctly. We'll use try/catch blocks for the API calls.
- **Concurrency**: If multiple auctions end at the exact same millisecond for the same winner, we rely on the Auth Service's wallet logic to handle atomic balance updates.
