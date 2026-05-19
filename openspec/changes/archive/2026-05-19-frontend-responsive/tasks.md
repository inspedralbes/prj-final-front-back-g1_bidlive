## 1. Global Navigation

- [x] 1.1 Update `Navbar` component to hide main links on mobile and display a hamburger menu icon.
- [x] 1.2 Implement the mobile dropdown menu functionality to show links when the hamburger icon is toggled.

## 2. Core Layouts & Grids

- [x] 2.1 Refactor the Auction Grid in `Home.jsx` to display a single column on mobile (`grid-cols-1`) and multiple columns on tablet/desktop (`md:grid-cols-2`, `lg:grid-cols-3`).
- [x] 2.2 Adjust `AuctionDetail.jsx` layout so image and details stack vertically on mobile and horizontally on desktop (`flex-col md:flex-row`).
- [ ] 2.3 Ensure general containers (e.g., `<main>`, `<section>`) have proper padding on mobile so content doesn't touch the screen edges (`px-4 sm:px-6 md:px-8`).

## 3. Dashboard & Data Tables

- [x] 3.1 Wrap data tables in `Dashboard.jsx` (or related admin components) with `overflow-x-auto` to allow horizontal scrolling on small screens without breaking the page layout.
- [x] 3.2 Optimize sidebar/menu in the Dashboard for mobile (e.g., hidden behind a toggle or stacked horizontally at the top).

## 4. Verification

- [x] 4.1 Verify layout across all pages using Chrome DevTools (simulating Mobile and Tablet sizes).
- [x] 4.2 Verify touch targets (buttons, inputs) are at least 44x44px or have sufficient padding for mobile users.
