## Why
The frontend application currently lacks proper responsive design, leading to a degraded user experience on mobile devices and tablets. Implementing a fully responsive layout ensures the platform is accessible, functional, and aesthetically pleasing across all screen sizes, which is critical for a modern web application.

## What Changes
- Apply Tailwind CSS responsive utility classes (e.g., `sm:`, `md:`, `lg:`) across all major components and pages.
- Implement a mobile-friendly navigation menu (e.g., hamburger menu) for smaller screens.
- Refactor grid layouts and data tables to stack vertically or enable horizontal scrolling on mobile devices.
- Ensure touch targets (buttons, links, inputs) are appropriately sized for mobile interaction.

## Capabilities

### New Capabilities
- `responsive-ui`: Capability that defines the responsive behavior and layout adjustments of the frontend UI across mobile, tablet, and desktop viewports.

### Modified Capabilities

## Impact
- **Frontend Codebase**: Extensive stylistic modifications to JSX files in `frontend/src/pages/` and `frontend/src/components/`. No core logic changes are expected, only UI classes.
