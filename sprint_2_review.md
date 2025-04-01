# Sprint 2 Review

**Date**: April 1  
**Sprint Duration**: March 17 – March 31  
**Submission Date**: April 3

---

## Attendees
- Kaleb
- Melvin
- Nick
- Zuriel

---

## Agenda
1. Demonstrate new and enhanced features
2. Confirm acceptance criteria for Sprint 2 items
3. Discuss incomplete or deferred features
4. Identify improvements for Sprint 3

---

## Completed Items

- **PB-4: User Dashboard Navigation** *(Kaleb)*  
  ✅ Dashboard created with welcoming message and buttons linking to AI chat, suggestions, profile, saved trips, and password reset.

- **PB-5: Password Reset Integration** *(Kaleb)*  
  ✅ Added form for resetting password with validation and flash messages; redirects to login upon success.

- **PB-6: Profile Page UI** *(Kaleb)*  
  ✅ New `/profile` route and page that displays basic user info and future placeholders for editing preferences.

- **PB-7: AI Destination Suggestions** *(Nick)*  
  ✅ Users input budget/interests and receive intelligent suggestions from Gemini/OpenAI. Error handling in place for API failure.

- **PB-8: AI Chat Interface** *(Melvin)*  
  ✅ Chat UI implemented using front-end component and Gemini/OpenAI backend integration. AI answers travel questions.

---

## Incomplete or Deferred Items

- **PB-9: Saved Trips Page** *(Zuriel)*  
   In Progress: UI to view saved trips is partially complete. Back-end logic for saving destinations still needs implementation.

---

## Review Feedback

-  **Improved UX**: Flash messages, background image, and responsive styling made the site feel more polished.
- **AI Features Functional**: Destination and chat suggestions are working, though suggestions could still be more diverse.
-  **Auth Flow Solid**: Password reset, session tracking, and logout work well.
-  **Data Handling**: In-memory storage worked for testing, but persistent DB integration will be important next.

---

## Next Steps for Sprint 3

1. **PB-9 Completion**  
   Finalize saving destinations to session or DB; render in `/saved_trips`.

2. **Database Integration (PB-10)**  
   Move user data and saved trips from memory to persistent database (e.g., SQLite).

3. **UI/UX Enhancements (PB-11)**  
   Add animations, transition effects, and mobile responsiveness across all pages.

4. **Testing & Validation**  
   Start unit testing for key flows like login, registration, and API responses.

---

**Sprint 2 Summary**  
 Major UI improvements and core features are now functional. Focus will now shift toward backend integration and deeper AI enhancement in Sprint 3.
