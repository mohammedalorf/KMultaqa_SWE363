# KFUPM Multaqa Platform

![KMultaqa Logo](public/logos/logo-white-full.png)

KFUPM Multaqa Platform is a web platform for managing student clubs, events, announcements, approvals, and student engagement. It provides separate dashboards for admins, clubs, and students.

## Live deployment

- https://kmultaqa.vercel.app/

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

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- MongoDB (local or hosted)

## Run locally

1. Install frontend dependencies (from project root):

```bash
npm install
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Start the backend server:

```bash
cd backend
npm run dev
```

4. Start the frontend development server:

```bash
npm run dev
```

5. Create a production build:

```bash
npm run build
```

6. Preview the production build:

```bash
npm run preview
```

## Environment variables (example)

Create `backend/.env` and adjust values for your setup:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=kmultaqa
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
APP_BASE_URL=http://localhost:5000
FRONTEND_BASE_URL=http://localhost:5173
SMTP_ENABLED=false
```

## Usage instructions and examples

- Admin:
  Log in at `/admin/login` to manage club approvals, reports, announcements, and exports.
- Club representative:
  Log in at `/club/login` to manage club profile details, posts, events, and follower activity.
- Student:
  Log in at `/student/login` to explore clubs, view events, manage registrations, and update notification settings.

## Main routes

General:
- `/`

Admin:
- `/admin/login`
- `/admin/dashboard`
- `/admin/club-approvals`
- `/admin/reports`
- `/admin/club-management`
- `/admin/announcements`
- `/admin/export`
- `/admin/settings`

Club:
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

Student:
- `/student/login`
- `/student/dashboard`
- `/student/explore`
- `/student/club/:id`
- `/student/event/:id`
- `/student/settings`
- `/student/my-events`

## Troubleshooting

- Port already in use:
  Update `PORT` in `backend/.env` or stop the process using the current port.
- Frontend cannot reach backend:
  Verify `APP_BASE_URL`, `FRONTEND_BASE_URL`, and `CORS_ORIGIN` values in `backend/.env`.
- Database connection errors:
  Confirm `MONGODB_URI` and `MONGODB_DB_NAME` are valid and that MongoDB is running.
- No emails are being sent:
  Set `SMTP_ENABLED=true` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.

## Team Members
- Abdulmalik Al AlShaikh
- ABDULAZIZ MAHMOUD
- EYAD ALKHALIFA
- MOHAMMED ALORF
