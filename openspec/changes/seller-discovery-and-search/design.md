## Context

Currently, the `Search.jsx` page only handles auctions, and the `auth-service` lacks a public search endpoint for users. Users want to find sellers to follow them and stay updated on their auctions.

## Goals / Non-Goals

**Goals:**
- Provide a responsive search interface for finding sellers by username or bio.
- Implement a discovery view for "Top Sellers" based on reputation and sales.
- Ensure seamless integration with the existing `FollowButton`.
- Create a reusable `SellerCard` component.

**Non-Goals:**
- Real-time search suggestions (autocomplete) in the first iteration.
- Advanced filtering for sellers (by location, etc.) - only keyword-based for now.

## Decisions

- **Backend Endpoint**: Add `GET /profile/search` in `auth-service`. It will use `LIKE %query%` on `username` and `bio`.
- **Frontend Tabs**: Modify `Search.jsx` to have a toggle between "Auctions" and "Sellers". This avoids creating a completely new page and leverages the existing search input.
- **Data Fetching**: Create a `useSellers` hook in the frontend to handle search logic for users.

## Risks / Trade-offs

- **Performance**: Keyword search with `LIKE` on a large user table might be slow. *Mitigation*: Implement pagination from the start.
- **UI Complexity**: Mixing two search types in one page might clutter the UI. *Mitigation*: Use a clean tab-based design with distinct card styles for each type.
