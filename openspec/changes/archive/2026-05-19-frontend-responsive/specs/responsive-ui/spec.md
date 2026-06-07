## ADDED Requirements

### Requirement: Responsive Navigation
The system SHALL provide a navigation bar that adapts to screen sizes.

#### Scenario: Viewing on mobile
- **WHEN** the viewport is less than 768px wide
- **THEN** the main navigation links are hidden behind a hamburger menu toggle

#### Scenario: Viewing on desktop
- **WHEN** the viewport is 768px or wider
- **THEN** the main navigation links are fully visible horizontally

### Requirement: Responsive Layouts
The system SHALL stack content vertically on mobile and horizontally on larger screens.

#### Scenario: Auction Grid on mobile
- **WHEN** viewing the auction list on a mobile device
- **THEN** the auctions are displayed in a single column

#### Scenario: Auction Grid on desktop
- **WHEN** viewing the auction list on a desktop device
- **THEN** the auctions are displayed in a multi-column grid

### Requirement: Responsive Tables
The system SHALL ensure data tables do not break the viewport width on small screens.

#### Scenario: Viewing wide tables on mobile
- **WHEN** a table is wider than the mobile screen
- **THEN** the table container allows horizontal scrolling without affecting the rest of the page layout
