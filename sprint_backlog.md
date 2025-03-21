# Sprint 1 Backlog

## Sprint Dates
- **Start Date**: Feb 15
- **End Date**: Mar 9
- **Submission Date**: Mar 11

## Sprint Goal
Implement core foundational features so that a user can:
1. Register and log in,
2. Receive destination suggestions,
3. Interact with an AI chat for basic travel queries,
4. Store/retrieve data using a database.

## Sprint Backlog Items

| Backlog ID | Title / Feature               | Assigned To | Acceptance Criteria                                                                                                                                                                           | Estimate (Points) | Status    |
|------------|-------------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|-----------|
| PB-1       | User Login & Registration    | **Kaleb**   | 1. Users can register with a valid email and password<br>2. System rejects invalid email format<br>3. On successful login, user is taken to a dashboard<br>4. Password reset link sent if requested | 3                 | Completed |
| PB-2       | Destination Suggestions      | **Nick**    | 1. Users can input budget and interests<br>2. System provides at least two relevant destinations<br>3. Displays a warning if no suggestions match criteria<br>4. Optionally store queries/results in DB               | 5                 | Completed     |
| PB-3       | AI Chat for Travel Queries   | **Melvin**  | 1. Front-end chat interface allows text input<br>2. AI responds with at least one travel-related suggestion (e.g., budget destination)<br>3. Handles error if AI service is unavailable<br>4. Stores conversation logs if DB is ready | 8                 | Completed     |
| PB-6       | Database Integration         | **Zuriel**  | 1. A relational or NoSQL DB is connected to the back-end (e.g., PostgreSQL/MongoDB/SQLite)<br>2. Database stores user profiles (from PB-1) and AI chat logs<br>3. Secure DB credentials via environment variables<br>4. Basic test confirming data persistence | 3                 | To Do     |

### Notes
- All tasks start in the **To Do** column on the Kanban board, except those marked as Completed.
- Each team member will move their items from **In Progress** → **Code Review** → **Testing** → **Done** as they work.
