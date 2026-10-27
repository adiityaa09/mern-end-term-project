# University Project Submission Form Details

Use this pre-formatted reference sheet to fill out your university or capstone submission portal.

---

### Project Metadata
* **Project Name**: ApplyTrack
* **Tagline**: Intelligent Job & Internship Application Tracker with Smart Reminders & Pipeline Analytics
* **GitHub Repository URL**: https://github.com/adiityaa09/mern-end-term-project.git
* **Deployed Application URL**: *(Insert your Vercel URL e.g. https://applytrack.vercel.app)*
* **Backend API URL**: *(Insert your Render/Railway URL e.g. https://applytrack-api.onrender.com)*
* **Demo Video Link**: *https://drive.google.com/file/d/13iBbNlW3Zcv556MMTwBUWLkuUu7Z3psw/view?usp=sharing*
* **Student Name**: Aditya
* **Tech Stack**: MERN (MongoDB Atlas, Express.js, React 18, Node.js), Tailwind CSS, @dnd-kit, Recharts, Zod, Multer, node-cron, Nodemailer, Jest.

---

### Abstract / Problem Statement
> College students apply to dozens of job and internship openings across diverse platforms during placement season, frequently losing track of application deadlines, recruiter follow-ups, and interview rounds. Traditional spreadsheets lack real-time synchronization, cannot validate application lifecycle transitions, cannot send automated background alerts, and offer no empirical feedback on which tailored resume variant performs best. ApplyTrack provides an end-to-end full-stack solution featuring a drag-and-drop Kanban pipeline with a server-enforced finite state machine, idempotent daily background reminder sweeps via node-cron, multi-version PDF resume management, and native MongoDB aggregation analytics.

---

### 5 Core Implemented Workflows
1. **Authentication & Data Isolation**: Secure registration and login with bcrypt hashing (work factor 12), JWT issued in secure `httpOnly` cookies with `SameSite` flags, route-level authorization guards scoping all operations to `req.user.id`, and rate limiting on auth routes.
2. **Kanban Application Pipeline & Finite State Machine**: Interactive drag-and-drop pipeline with optimistic UI updates and automatic rollback. Enforces a backend state machine transition graph (`Wishlist` ➔ `Applied` ➔ `Online Assessment` ➔ `Interview` ➔ `Offer` ➔ `Rejected`/`Withdrawn`), logs an embedded `StatusHistory` timeline, and prevents duplicate applications via a compound unique index.
3. **Multi-Version Resume Management**: Upload multiple PDF resumes with version labels (e.g., "SDE v2"), set default versions, stream to Cloudinary/local storage with 5MB/PDF MIME guards, attach resumes to applications, and prevent deletion of resumes linked to active applications.
4. **Smart Reminders with Idempotency**: Automated daily background scans using `node-cron` evaluating 48h deadlines, next-day interviews, and 7-day stalled follow-ups. Dispatches transactional emails and in-app notifications guarded by a unique compound idempotency key to prevent duplicate dispatches.
5. **Analytics & Aggregation Pipelines**: Computes recruitment funnels, recruiter response rates, offer rates, average days from application to first response, weekly volume, and conversion performance per resume version using native MongoDB aggregation pipelines with graceful zero-state rendering.
