# Sprint 2 Backlog

## Sprint Dates
- **Start Date**: March 17
- **End Date**: March 31
- **Submission Date**: April 3

## Sprint Goal
Build on foundational features from Sprint 1 to complete:
- A working user dashboard that connects all core features
- A profile page with user-specific info
- Password reset functionality
- Front-end integration with destination suggestions and AI chat
- Basic persistent storage for saved trips

---

## Sprint Backlog Items

| Backlog ID | Title / Feature                | Assigned To | Acceptance Criteria                                                                                                                                                                  | Estimate (Points) | Priority | Status     |
|------------|--------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|----------|------------|
| PB-4       | User Dashboard Navigation      | **Kaleb**   | 1. User dashboard displays buttons linking to major features (AI chat, destination suggestions, saved trips, profile)<br>2. Dashboard says "Welcome, [name]" after login           | 3                 | High     | Completed  |
| PB-5       | Password Reset Integration     | **Kaleb**   | 1. Password reset form available from login<br>2. Error shown if email is not found<br>3. Flash message confirms reset success and redirects to login                                | 2                 | High     | Completed  |
| PB-6       | Profile Page UI                | **Kaleb**   | 1. Display basic user info (email, username, mock preferences)<br>2. Includes link back to dashboard<br>3. Placeholder area for future editable fields                             | 2                 | Medium   | Completed  |
| PB-7       | AI Destination Suggestions     | **Nick**    | 1. Users input preferences (budget, interests)<br>2. Suggestions displayed from Gemini/OpenAI<br>3. Includes error handling for API issues                                           | 5                 | High     | Completed|
| PB-8       | AI Chat Interface              | **Melvin**  | 1. Chatbox renders on page<br>2. Accepts user travel questions<br>3. Displays AI-generated answers<br>4. Graceful fallback if service unavailable                                  | 5                 | High     | Completed|
| PB-9       | Saved Trips Page               | **Zuriel**  | 1. Front-end UI displays saved destinations<br>2. Trip can be added from AI suggestion result<br>3. Data stored temporarily in session or persistent DB                             | 4                 | Medium   | To Do      |

---

### Notes
- Kanban board used to manage PB items from **To Do → In Progress → Testing → Done**
- Team syncs progress and blockers during check-ins and commits regularly to the repo
