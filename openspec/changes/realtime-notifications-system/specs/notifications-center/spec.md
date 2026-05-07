## ADDED Requirements

### Requirement: Persistence of user notifications
The system must store all system-generated notifications in a database to ensure they are available even if the user is offline.

#### Scenario: Successful storage of a notification
- **WHEN** a service triggers a notification for a user (e.g., outbid, auction won).
- **THEN** the notification must be saved in the `notifications` table with status `is_read = false`.

### Requirement: Listing and Reading notifications
Users must be able to retrieve their notifications and mark them as read.

#### Scenario: User fetches notification list
- **WHEN** the user accesses the notification center.
- **THEN** the system must return the list of notifications sorted by date (newest first).

#### Scenario: Mark notification as read
- **WHEN** the user clicks on a notification or the "mark all as read" button.
- **THEN** the system must update the `is_read` status to `true`.
