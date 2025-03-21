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

| Backlog ID | Title / Feature               | Assigned To | Acceptance Criteria                                                                                                                                                                           | Estimate (Points) |
|------------|-------------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| PB-1       | User Login & Registration    | **Kaleb**   | 1. Users can register with a valid email and password<br>2. System rejects invalid email format<br>3. On successful login, user is taken to a dashboard<br>4. Password reset link sent to user if requested | 3                 |
| PB-2       | Destination Suggestions      | **Nick**    | 1. Users can input budget and interests<br>2. System provides at least two relevant destinations<br>3. Display a warning if no suggestions match criteria<br>4. Optional: Store destination queries/results in DB               | 5                 |
| PB-3       | AI Chat for Travel Queries   | **Melvin**  | 1. Front-end chat interface allows text input<br>2. AI responds with at least one travel-related suggestion (e.g., budget destination)<br>3. Proper error handling if AI service is unavailable<br>4. Store conversation logs (if DB is ready) | 8                 |
| PB-6       | Database Integration         | **Zuriel**  | 1. A relational or NoSQL DB is connected to the back-end (e.g., PostgreSQL/MongoDB/SQLite)<br>2. Database stores user profiles (from PB-1) and can store AI chat logs<br>3. Secure DB credentials via environment variables<br>4. Basic test confirming data is persisted | 3                 |

### Notes
- Each item’s **priority** is assumed High or Medium (as these are core features).
- All tasks start in the **To Do** column on the Kanban board.
- Each team member will move their items from **In Progress** → **Code Review** → **Testing** → **Done** as they work.




