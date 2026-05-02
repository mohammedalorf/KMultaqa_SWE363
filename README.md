# KFUPM Multaqa Platform

KFUPM Multaqa Platform is a web platform for managing student clubs, events, announcements, approvals, and student engagement. It provides separate dashboards for admins, clubs, and students.

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

## Usage instructions and examples

Admin logs in at /admin/login to manage clubs, reports, and announcements.
Club representatives log in at /club/login to create posts, manage events, and track followers.
Students log in at /student/login to explore clubs, view events, and manage their registrations.

## Main routes

- `/`
- `/admin/login`
- `/admin/dashboard`
- `/admin/club-approvals`
- `/admin/reports`
- `/admin/club-management`
- `/admin/announcements`
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

## Team Members
- Abdulmalik Al AlShaikh
- ABDULAZIZ MAHMOUD
- EYAD ALKHALIFA
- MOHAMMED ALORF
