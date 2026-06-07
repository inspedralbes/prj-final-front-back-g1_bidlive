## Context
The BidLive frontend was initially built with a desktop-first approach. Many components (like the Navbar, Auction cards grid, and Dashboard tables) overflow or become unusable on mobile devices (screens < 768px). We need to refactor the UI using Tailwind CSS's mobile-first responsive utilities.

## Goals / Non-Goals

**Goals:**
- Make all core pages (Home, Auction Detail, Dashboard, Auth) fully responsive.
- Implement a mobile navigation drawer or hamburger menu.
- Ensure all forms and inputs are usable on touch devices without zooming.

**Non-Goals:**
- Changing the overall color scheme or branding.
- Adding new features or pages.
- Writing custom CSS media queries (we will rely entirely on Tailwind utility classes).

## Decisions
- **Mobile-First Approach**: We will update components to have mobile styles by default, and use `md:` and `lg:` prefixes for larger screens.
- **Tailwind Grid/Flexbox**: Replace static widths with Flexbox (`flex-col md:flex-row`) and CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) to handle layout shifts automatically.
- **Navigation**: The desktop Navbar will hide links on mobile (`hidden md:flex`) and show a hamburger icon that toggles a mobile dropdown menu.

## Risks / Trade-offs
- **[Risk] Complex tables in Dashboard breaking the layout** → Mitigation: Wrap tables in an `overflow-x-auto` container so users can swipe horizontally instead of breaking the page width.
