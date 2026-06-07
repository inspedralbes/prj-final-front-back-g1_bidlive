## Why

Currently, users have no way to find specific sellers or discover new top-rated creators on BidLive. This limits the platform's social growth and makes it difficult for followers to find the streams they are interested in. A search and discovery system for sellers will improve user engagement and help creators build their audience.

## What Changes

- **Backend**: Implement a search endpoint in the `auth-service` to query users by username or bio.
- **Frontend**: 
    - Introduce a "Sellers" tab in the `Search` page.
    - Implement a seller listing view with statistics (followers, reputation, active auctions).
    - Add navigation links to discovery sections.

## Capabilities

### New Capabilities
- `seller-search`: API and UI for searching sellers by name or description.
- `top-sellers-discovery`: Logic and UI to highlight the most active or highest-rated sellers.

### Modified Capabilities
- `search-system`: Extending the existing auction search to include user/seller discovery.

## Impact

- **auth-service**: New controller and routes for user search.
- **frontend**: Updates to `Search.jsx`, new components for seller cards, and state management for switching between "Auctions" and "Sellers".
