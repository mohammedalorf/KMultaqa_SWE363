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

For local frontend-to-backend integration, create a project-root `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## Back-end setup and run

1. Go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `backend/.env` using the example values above, then update:
- `MONGODB_URI` and `MONGODB_DB_NAME` for your database.
- `JWT_SECRET` with a strong secret value.
- `CORS_ORIGIN` to include your frontend origin.
- Optional email/cloud upload variables if you need those features.

4. Start the backend in development mode:

```bash
npm run dev
```

5. Start the backend in production mode:

```bash
npm run start
```

6. Run backend syntax checks:

```bash
npm run check
```

From the project root, run `npm run build` to verify the frontend production build.

The backend listens on `PORT` (default `5000`) and serves API routes under `/api`.

## API documentation

Base URL (local): `http://localhost:5000/api`  
Base URL (frontend in production): `/api`

Authentication:
- Protected endpoints require `Authorization: Bearer <token>`.
- Token is returned by `POST /auth/login` and `POST /auth/verify-email`.

Common error response format:

```json
{
  "message": "Human-readable error message"
}
```

### Health

`GET /health`

Example response (`200`):

```json
{
  "message": "KMultaqa backend is running"
}
```

### Auth

`POST /auth/register`

Example request:

```json
{
  "name": "Student Name",
  "email": "s202300001@kfupm.edu.sa",
  "password": "StrongPass123",
  "studentId": "s202300001",
  "role": "student"
}
```

Example response (`201`):

```json
{
  "message": "Student registered successfully. Verify your email before logging in.",
  "user": {
    "id": "6639d6d89e1a0f2d1f3b4567",
    "name": "Student Name",
    "fullName": "Student Name",
    "email": "s202300001@kfupm.edu.sa",
    "role": "student",
    "studentId": "s202300001",
    "isVerified": false,
    "isEmailVerified": false
  }
}
```

`POST /auth/login`

Example request:

```json
{
  "email": "s202300001@kfupm.edu.sa",
  "password": "StrongPass123",
  "role": "student"
}
```

Example response (`200`):

```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "6639d6d89e1a0f2d1f3b4567",
    "name": "Student Name",
    "email": "s202300001@kfupm.edu.sa",
    "role": "student",
    "studentId": "s202300001",
    "isVerified": true,
    "isEmailVerified": true
  }
}
```

`POST /auth/verify-email`

Example request:

```json
{
  "code": "123456"
}
```

Example response (`200`):

```json
{
  "message": "Email verified successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "6639d6d89e1a0f2d1f3b4567",
    "role": "student",
    "email": "s202300001@kfupm.edu.sa",
    "isVerified": true
  }
}
```

`GET /auth/me`

Required header:

```text
Authorization: Bearer <token>
```

Example response (`200`):

```json
{
  "user": {
    "id": "6639d6d89e1a0f2d1f3b4567",
    "name": "Student Name",
    "role": "student",
    "email": "s202300001@kfupm.edu.sa"
  }
}
```

### Notifications (student)

`GET /notifications`

Example response (`200`):

```json
{
  "notifications": [
    {
      "id": "6640a53a9e1a0f2d1f3b9999",
      "message": "Your registration was approved",
      "type": "event-registration",
      "targetId": "663f10009e1a0f2d1f3b8888",
      "targetModel": "Event",
      "isRead": false,
      "createdAt": "2026-05-02T10:30:00.000Z"
    }
  ],
  "unreadCount": 1
}
```

`PATCH /notifications/read`

Example response (`200`):

```json
{
  "message": "Notifications marked as read",
  "updatedCount": 3
}
```

### Uploads (club/admin)

`POST /uploads/image` (multipart/form-data)

Form fields:
- `image`: image file (`jpg`, `png`, `webp`, or `gif`, up to 5MB).
- `folder` (optional): `clubs`, `events`, or `posts`.

Example response (`201`):

```json
{
  "message": "Image uploaded",
  "imageUrl": "https://res.cloudinary.com/.../image/upload/v123/example.png",
  "publicId": "kmultaqa/posts/example"
}
```

### Additional API modules

- Admin routes: `/api/admin/*`
- Club routes: `/api/club/*`
- Student routes: `/api/student/*`

Main implemented routes:
- Admin: `GET /admin/dashboard`, `GET /admin/club-requests`, `PATCH /admin/club-requests/:requestId`, `GET /admin/clubs`, `PATCH /admin/clubs/:clubId/status`, `GET /admin/reports`, `PATCH /admin/reports/:reportId`, `GET|POST|DELETE /admin/announcements`, `GET /admin/exports/:type`.
- Club: `POST /club/requests`, `GET /club/dashboard`, `GET|PATCH /club/profile`, `GET|POST /club/posts`, `GET|PATCH|DELETE /club/posts/:postId`, `GET|POST /club/events`, `GET|PATCH|DELETE /club/events/:eventId`, `GET|PATCH /club/events/:eventId/registrations`, `GET /club/followers`.
- Student: `GET /student/dashboard`, `GET|PATCH /student/settings`, `GET /student/clubs`, `GET /student/clubs/:clubId`, `POST|DELETE /student/clubs/:clubId/follow`, `PATCH /student/clubs/:clubId/notifications`, `POST|DELETE /student/posts/:postId/like`, `POST /student/reports`, `GET /student/events/registrations`, `GET /student/events/:eventId`, `POST /student/events/:eventId/register`, `DELETE /student/events/:eventId/registration`.

Quick API checks can be run with:

```bash
curl http://localhost:5000/api/health
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/student/dashboard
```

For complete route coverage, see:
- `backend/src/modules/admin/admin.routes.js`
- `backend/src/modules/club/club.routes.js`
- `backend/src/modules/student/student.routes.js`
- `backend/src/modules/auth/auth.routes.js`
- `backend/src/modules/notifications/notification.routes.js`
- `backend/src/modules/uploads/upload.routes.js`

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
- Abdulaziz Mahmoud
- Eyad Alkhalifa
- Mohammed Alorf
