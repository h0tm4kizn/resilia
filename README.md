# RESILIA prototype

RESILIA is a frontend-only academic prototype for connecting Philippine community climate concerns with university research workflows. It uses realistic fictional records and clearly labels simulated functionality.

## Run locally

```bash
npm install
npm run dev
```

Production verification: `npm run build`.

## Routes

- `/` — public landing page
- `/login` — demo role selector
- `/app` — role-aware dashboard
- `/app/submissions` — searchable barangay submissions
- `/app/matching`, `/app/explore`, `/app/workspace`, `/app/queue`, `/app/projects` — dashboard destinations currently represented through the shared demo overview shell

## Demo roles

Barangay Representative, Student / Researcher, University Coordinator, and Platform Administrator. The selected role is stored in `localStorage` to keep the demo consistent across the workspace.

## Included

- Responsive editorial landing page with original CSS illustration, brand tokens, motion reveals, reduced-motion support, and accessible mobile navigation.
- Simulated role-based workspace with dashboard stats, statuses, project progress, activity rows, search, and responsive layout.
- Barangay concern form with required title validation, consent control, confirmation toast, and localStorage persistence.
- Submission search/filter surface and prototype disclaimers.

## Limitations

There is no backend, database, real authentication, AI inference, SMS delivery, remote file upload, or confirmed institutional partnership. Matching and project records are deterministic demo data only; the UI is not a security or accessibility audit result.
