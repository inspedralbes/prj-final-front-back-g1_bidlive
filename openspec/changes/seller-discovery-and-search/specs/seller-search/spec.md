## ADDED Requirements

### Requirement: Search sellers by name
The system must allow users to search for other users/sellers by their username.

#### Scenario: Exact match
- **WHEN** I search for "JohnDoe"
- **THEN** The user with username "JohnDoe" should be displayed in the results.

#### Scenario: Partial match
- **WHEN** I search for "John"
- **THEN** All users whose username contains "John" should be displayed.

### Requirement: Search sellers by bio
The system must allow users to search for sellers by keywords in their biography.

#### Scenario: Bio keyword match
- **WHEN** I search for "vintage"
- **THEN** All sellers with the word "vintage" in their bio should be displayed.
