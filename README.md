# KFUPM Clubs Platform - React + JavaScript Migration

This version is the JavaScript/React migration of the original KFUPM Clubs Platform project.

## What was migrated

- Converted the codebase from **TypeScript/TSX** to **JavaScript/JSX**.
- Preserved the original page structure, routing, layouts, spacing, typography, colors, and interaction patterns as closely as possible.
- Kept the original Tailwind-based styling system because it was the most reliable way to preserve the original visual fidelity.
- Simplified the toast wrapper so the app no longer depends on theme wiring for notifications.
- Added a dedicated **404 page** for unmatched routes.
- Normalized event mock data used by the student feed so registration counts display correctly.

## Folder structure

```text
src/
  app/
    components/
      layout/
      ui/
    data/
    pages/
    App.jsx
    routes.js
  styles/
  main.jsx
```

## Notes / assumptions / compatibility changes

1. The original project already used React and Tailwind CSS heavily. To preserve the original UI with minimal drift, the migration keeps **Tailwind CSS** as the styling layer while moving the application source to **JavaScript/JSX**.
2. The original project contained many generated UI helper files that were not used by the actual app routes. This migrated version keeps only the files needed for the current product flows.
3. Some original actions were already demo-only and mock-driven (for example create, update, approval, follow, moderation, and export flows). Those behaviors remain demo-oriented and continue to use in-memory/mock state where the original project did the same.
4. The toast wrapper was replaced with a simpler Sonner setup to avoid unnecessary theme dependencies.
5. A dedicated not-found page was added because the original catch-all route did not render a complete fallback screen.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Create a production build:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

## Main routes

- `/`
- `/admin/login`
- `/admin/dashboard`
- `/admin/club-approvals`
- `/admin/reports`
- `/admin/club-management`
- `/admin/announcements`
- `/admin/appeals`
- `/admin/export`
- `/admin/settings`
- `/club/login`
- `/club/dashboard`
- `/club/profile`
- `/club/posts`
- `/club/posts/new`
- `/club/posts/edit/:id`
- `/club/events`
- `/club/events/new`
- `/club/events/edit/:id`
- `/club/registrations/:id`
- `/club/followers`
- `/student/login`
- `/student/dashboard`
- `/student/explore`
- `/student/club/:id`
- `/student/event/:id`
- `/student/settings`
- `/student/my-events`

