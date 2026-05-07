## 1. Cleanup of Previous System

- [x] 1.1 Delete `backend/auction-service/services/paymentWorker.js`.
- [x] 1.2 Remove `startPaymentWorker()` from `backend/auction-service/index.js`.
- [x] 1.3 Revert `Puja.js` model: remove `payment_deadline` and `payment_reminder_sent` logic if desired, or just stop using them.
- [x] 1.4 Revert `endWithWinner` in `Puja.js` to not set the 24h deadline.

## 2. Automatic Settlement Implementation

- [x] 2.1 Update `backend/auction-service/services/closureService.js` to include the automated wallet transfer logic.
- [x] 2.2 Implement `settleAuction` helper in `closureService.js` or `pujaController.js`.
- [x] 2.3 Ensure notifications correctly inform users about the *automatic* payment.

## 3. Frontend Adjustments

- [x] 3.1 Update `SellerDashboard.jsx` and `Profile.jsx` to reflect that auctions are usually "Paid" immediately upon ending.
- [x] 3.2 Remove the manual payment button if the auction is already paid (it should be).

## 4. Verification

- [x] 4.1 End a live auction and verify the winner's balance is deducted.
- [x] 4.2 Verify the seller's balance is credited.
- [x] 4.3 Verify the auction status is `ended` and `payment_status` is `paid`.
