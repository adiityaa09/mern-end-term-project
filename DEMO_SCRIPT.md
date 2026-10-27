# ApplyTrack — 3-5 Minute Viva & Video Demo Script

This script is structured for a live presentation or screen-recording submission. It covers the core requirements: problem statement, target audience, 5 core workflows, architectural defense, and technical depth.

---

### Segment 1: Introduction & Problem Context (0:00 – 0:45)
* **Visual**: Show the ApplyTrack login and register screen.
* **Speaker**:
  > *"Hello everyone and respected professors. Today I am presenting **ApplyTrack**, a full-stack MERN application designed to solve the job and internship application management crisis faced by university students and fresh graduates.
  >
  > During placement season, students apply to dozens or hundreds of positions across LinkedIn, company career portals, and campus referrals. Traditional spreadsheets fail because they cannot send automated reminders, cannot enforce application lifecycle integrity, and cannot correlate which tailored resume version is actually getting interview callbacks. ApplyTrack addresses this with an end-to-end engineered recruitment control center."*

---

### Segment 2: Authentication & Ownership Workflow (0:45 – 1:15)
* **Visual**: Log in with an account, show browser DevTools ➔ Application tab ➔ Cookies (`httpOnly` flag checked).
* **Speaker**:
  > *"Starting with Workflow 1: Authentication and Security.
  >
  > Notice that when we authenticate, our JSON Web Token is stored in a secure `httpOnly` cookie with `SameSite` flags rather than `localStorage`. This eliminates client-side token theft via Cross-Site Scripting (XSS).
  >
  > On the backend, every route is guarded by an authentication middleware, and all database queries are strictly scoped to the authenticated user ID. In addition, we have implemented rate limiting with `express-rate-limit` on all auth endpoints and strict input validation powered by Zod."*

---

### Segment 3: Kanban Application Pipeline & Finite State Machine (1:15 – 2:30)
* **Visual**: Open the main Dashboard. Drag an application card from *Applied* to *Online Assessment*. Show the card moving smoothly. Then click on a card to show the Status History Timeline.
* **Speaker**:
  > *"Moving to Workflow 2: The Application Pipeline and State Machine.
  >
  > Here is our interactive Kanban board built with `@dnd-kit`. It provides full CRUD operations, live search across companies and roles, and filtering by source.
  >
  > But ApplyTrack is not just a UI mock or basic CRUD. It enforces a strict **Finite State Machine** on the server. For instance, an application cannot jump illegally from 'Wishlist' directly to 'Offer'. If someone attempts an invalid transition, the server returns a 422 Unprocessable Entity error and our UI automatically rolls back the card to its original position.
  >
  > Furthermore, when we inspect an application, we see an embedded `StatusHistory` timeline. Every single stage movement is timestamped with optional notes, giving students a complete audit trail of their interview process. We also have a compound unique index on `(userId, company, role)` to prevent accidental duplicate applications."*

---

### Segment 4: Multi-Version Resume Management (2:30 – 3:15)
* **Visual**: Navigate to `/resumes`. Show uploaded resume cards with version labels (*SDE Backend*, *Frontend React*). Click "View PDF".
* **Speaker**:
  > *"Workflow 3 covers Resume Versioning.
  >
  > Most students maintain 2 to 4 resume variants. In ApplyTrack, students can upload PDF resumes with custom labels, set a default version, and attach specific resumes to individual applications.
  >
  > The backend uses Multer with strict PDF validation and a 5MB limit, streaming to Cloudinary or falling back cleanly to local disk storage.
  >
  > Crucially, we enforce **referential integrity**: if a student attempts to delete a resume that is currently backing active applications, the server blocks deletion with a 409 Conflict error, instructing them to reassign those applications first."*

---

### Segment 5: Smart Background Reminders & Idempotency (3:15 – 4:00)
* **Visual**: Show the Notification bell dropdown with unread counts. Open email client or console log showing simulated/actual email dispatch.
* **Speaker**:
  > *"Workflow 4 is our Smart Reminder Engine.
  >
  > In the background, a `node-cron` worker runs daily and evaluates three automated triggers:
  > 1. Applications with deadlines approaching within 48 hours.
  > 2. Interviews scheduled for tomorrow.
  > 3. Applications sitting in 'Applied' for 7 or more days with no recruiter updates, nudging the student to follow up.
  >
  > The key technical highlight here is **Idempotency**. We generate a deterministic compound key combining `userId + applicationId + reminderType + targetDate`. If the cron task restarts or runs twice in a day, MongoDB's unique index catches code 11000 and silently skips duplicate dispatches, ensuring users never receive duplicate spam emails."*

---

### Segment 6: Pipeline Analytics & Closing (4:00 – 4:45)
* **Visual**: Navigate to `/analytics`. Show KPI cards, Recharts Funnel chart, Weekly velocity chart, and the Resume Version comparison table.
* **Speaker**:
  > *"Finally, Workflow 5: Pipeline Analytics.
  >
  > Using native MongoDB aggregation pipelines, we compute:
  > - An interactive recruitment funnel.
  > - Recruiter response and offer conversion rates.
  > - The average time in days from application submission to first response.
  > - And most importantly: a conversion rate table per resume version, letting students empirically know which resume is winning them interviews.
  >
  > The entire project is backed by comprehensive unit and integration test suites covering the state machine and reminder idempotency. Thank you!"*
