# Demonstration Walkthrough & PR Verification

## Video Demonstration Recording

The complete end-to-end demonstration recording verifying institutional settings persistence, quiz default propagation, and the unified operations hub is accessible below:

🔗 **Walkthrough Video**: [https://github.com/user-attachments/assets/f33b08ba-963a-435d-8c65-393d3b20232f](https://github.com/user-attachments/assets/f33b08ba-963a-435d-8c65-393d3b20232f)

---

## PR Summary & File Diff Inventory

This pull request implements the **Institutional Settings Workspace** and the **Unified Quiz Operations Hub** for the frontend application.

### Changed & Added Files in this PR Diff:

| File Path | Change Type | Description |
| :--- | :--- | :--- |
| `components/admin/dashboard/forms/SettingsForm.tsx` | **Added** | Full institutional settings form managing 5 defaults (Name, Timezone, Duration, Pass %, Integrity threshold) with Zod validation, dirty state detection, and status notifications. |
| `app/admin/dashboard/settings/page.tsx` | **Modified** | Dedicated institutional configuration page hosting `SettingsForm`. |
| `components/admin/dashboard/AdminSidebar.tsx` | **Modified** | Removed the placeholder "Soon" badge and linked `/admin/dashboard/settings` directly. |
| `app/admin/dashboard/quizzes/[id]/page.tsx` | **Added** | Dynamic operations hub page with server-side authentication check, admin role enforcement, and live data wiring. |
| `app/admin/dashboard/view/[id]/page.tsx` | **Modified** | Refactored legacy stub to mount `QuizOperationsHub` with server-side auth validation. |
| `components/admin/dashboard/QuizOperationsHub.tsx` | **Added** | Master operations coordinator orchestrating status actions, delivery telemetry, integrity flags, and candidate results. |
| `components/admin/dashboard/QuizStatusActions.tsx` | **Added** | Contextual lifecycle actions (`Publish`, `Revert to Draft`, `Close Quiz`, `Reopen`, `Archive`, `Restore`, edit metadata, manage questions). |
| `components/admin/dashboard/QuizInviteTelemetry.tsx` | **Added** | Real-time 4-card dispatch breakdown (Total Invited, Sent & Delivered, Pending, Failed) and student invite modal. |
| `components/admin/dashboard/QuizIntegrityFlags.tsx` | **Added** | Proctoring violation telemetry, suspicious attempts list, and console link. |
| `components/admin/dashboard/forms/CreateQuizForm.tsx` | **Modified** | Auto-populates duration and pass threshold on mount from institutional settings; tags scheduling with named timezone label. |
| `lib/api/admin/settings.ts` | **Added** | Typed API client for `GET /api/admin/settings`, `PATCH /api/admin/settings`, and `GET /api/settings/public`. |
| `lib/validation.ts` | **Modified** | Added Zod schema for institutional settings validation. |
| `app/(student)/student/quiz/[quizId]/page.tsx` | **Modified** | Displays configured institutional timezone label alongside assessment timestamps. |

---

## Live Walkthrough & Demonstration Flow

1. **Institutional Settings Persistence**:
   - Navigated to `/admin/dashboard/settings` via the updated sidebar link (no "Soon" badge).
   - Configured institutional values:
     - Organization Display Name: `"Global Assessment Academy"`
     - Named Timezone Label: `"Africa/Cairo (EET)"`
     - Default Duration: `90 minutes`
     - Default Pass Threshold: `75%`
     - Integrity Review Threshold: `5 events`
   - Submitted form and verified success notification banner.
   - Performed hard browser reload (F5 / Ctrl+Shift+R) demonstrating that all 5 values persisted from PostgreSQL.

2. **Quiz Default Inheritance**:
   - Opened `/admin/dashboard/create` (`CreateQuizForm`).
   - Verified Duration automatically pre-filled to `90` and Passing Score pre-filled to `75%`.
   - Verified Start and End date pickers display the configured timezone label `(Africa/Cairo (EET))`.

3. **Live Operations Hub Walkthrough**:
   - Opened `/admin/dashboard/quizzes/[id]` (and `/admin/dashboard/view/[id]`).
   - Verified live **Published** status pill with contextual operational actions (`Revert to Draft`, `Close Quiz`, `Edit Metadata`, `Manage Questions`).
   - Verified schedule window tagged with named timezone badge.
   - Verified live aggregated KPI metric cards (Duration, Pass Threshold, Question Count, Total Submissions, Pass Rate %, Average Score %).
   - Verified real-time dispatch telemetry cards (Total Invited, Sent, Pending, Failed) with modal invite trigger.
   - Verified integrity and proctoring metrics with suspicious attempt table and direct console link.
   - Verified candidate submission and grading table showing recorded attempts, scores, and pass/fail states.

4. **Student Assessment Timezone**:
   - Opened `/student/quiz/[quizId]`.
   - Verified candidate portal displays the configured timezone label next to start and deadline dates.

---

## Verification Commands for Reviewers

```bash
# 1. Install dependencies
npm install

# 2. Run ESLint across frontend components (0 errors)
npm run lint

# 3. Verify Next.js production route compilation (all 15 routes compiled)
npm run build

# 4. Start local development server
npm run dev
```
