## Why

The previous manual payment system introduced unnecessary friction and the risk of non-payment, requiring complex background workers and reputation penalties. Since we already validate that bidders have sufficient balance at the moment of bidding, we can automate the entire settlement process. This guarantees that sellers receive their funds immediately upon auction completion and provides a seamless experience for buyers.

## What Changes

- **Automatic Deduction**: When an auction ends, the system will immediately attempt to deduct the final price from the winner's wallet.
- **Instant Settlement**: Upon successful deduction, the funds will be credited to the seller's wallet instantly.
- **Status Automation**: Auctions will transition directly to `ended` and `paid` status if the settlement is successful.
- **Decommissioning of US-21-A**: The previously implemented 24h cancellation worker and reputation penalties for non-payment are no longer needed and will be removed.

## Capabilities

### New Capabilities
- `instant-auction-settlement`: Logic to process wallet transfers automatically during the auction closure process.

### Modified Capabilities
- `auction-management`: Update auction closure flow to include mandatory payment processing.

## Impact

- **Auction Service**: `closureService.js` will be updated to trigger the payment logic.
- **Auth Service**: `wallet/debit` and `wallet/credit` endpoints will be called during closure.
- **Database**: `payment_deadline` and `payment_reminder_sent` fields will be removed or ignored.
- **Frontend**: Simplified UI where winners don't need a "Pay" button for wallet-based purchases.
