# Integration Tasks

Review of existing API services and UI usage identified the following discrepancies requiring additional integration work.

## Missing Endpoints

- **Change User Password**: Endpoint documented in API specification but not implemented in services or UI (`POST /api/users/change-password`).
- **Maintenance Records**:
  - Specification exposes `/api/maintenance` (GET, POST) and `/api/maintenance/{id}` (GET, PUT, DELETE), while current frontend only posts to `/equipment/{id}/maintenance` for creation.
- **Notifications Management**:
  - Endpoints `/api/notifications/{id}/read` (PUT) and `/api/notifications/{id}` (DELETE) lack corresponding service functions and UI actions.

## Proposed Tasks

1. Add service methods and UI workflows for changing a user's password.
2. Align maintenance record operations with the API specification and implement missing list, detail, update and delete functionality.
3. Implement notification management features (mark as read, delete) in services and user interface.

