# Phase 3 Requirements Gap Checklist

Source checked against `phase3-REQ.pdf`.

## Backend

- [ ] Implement appeals backend support for FR-7.
  - [ ] Add appeal model/schema.
  - [x] Add admin appeals list/detail endpoints.
  - [x] Support decisions: uphold, overturn, modify.
  - [x] Validate appeal time window, original decision reference, and attachments if used.
  - [x] Notify requester and log final outcome.

- [x] Expand reports moderation actions for FR-2 and FR-4.
  - [x] Support remove post.
  - [x] Support hide content.
  - [x] Support warn club.
  - [x] Support suspend club.
  - [x] Require valid report state before action.
  - [x] Require reason/category for hide/remove.
  - [x] Apply action to the target content/account, not only the report record.

- [ ] Implement warnings/notices for FR-5.
  - [ ] Add warning records/history for clubs.
  - [x] Require warning type.
  - [x] Require warning message.
  - [x] Support optional evidence/report reference.
  - [x] Notify club by in-app and/or email.

- [ ] Complete club status management for FR-3.
  - [ ] Add `restricted` status, if required.
  - [ ] Support duration for suspend/restrict.
  - [ ] Store status history.
  - [x] Enforce transition rules.
  - [x] Notify clubs on status changes.
  - [ ] Add audit log for admin status changes.

- [x] Implement real admin export backend for FR-8.
  - [x] Add export endpoint.
  - [x] Support clubs/events/reports datasets.
  - [x] Validate date range and filters server-side.
  - [x] Enforce export size limits server-side.
  - [x] Generate CSV and/or PDF files.
  - [x] Provide download response/link.
  - [x] Log export activity.

- [ ] Complete platform announcements backend for FR-6.
  - [ ] Support scheduled publish date.
  - [ ] Validate scheduled publish time is in the future.
  - [ ] Track announcement edits.
  - [x] Dispatch optional notifications to selected audience.

- [x] Complete follower email notification delivery for FR-16 and FR-18.
  - [x] Send emails for new posts/events when follower preference allows it.
  - [x] Enforce verified university email requirement.
  - [x] Store delivery status/logs.
  - [x] Return publish notification summary to club publishing endpoints.

- [x] Strengthen event registration validation for FR-21.
  - [x] Validate student ID format when a registration field asks for student ID.
  - [x] Keep duplicate-registration and deadline checks server-side.

- [x] Fix club search relevance for FR-19.
  - [x] Enforce minimum query behavior server-side if required.
  - [x] Sort/rank by relevance instead of only club name.
  - [x] Optionally include follower count as secondary sort.

## Frontend

- [ ] Add admin appeals UI for FR-7.
  - [ ] Add `/admin/appeals` route.
  - [ ] Add appeals queue page.
  - [ ] Add appeal detail review dialog/page.
  - [ ] Support uphold, overturn, and modify decisions.

- [ ] Expand reports moderation UI for FR-2 and FR-4.
  - [ ] Add action selector: remove, hide, warn, suspend, dismiss.
  - [ ] Require reason/category for hide/remove.
  - [ ] Require warning type/message for warn.
  - [ ] Require suspension reason/duration for suspend.
  - [ ] Show disabled state for reports that are not actionable.

- [ ] Add club status history/timeline UI for FR-3.
  - [ ] Show previous status changes.
  - [ ] Show transition guidance.
  - [ ] Support restrict/suspend duration if backend supports it.

- [ ] Connect export UI to real backend for FR-8.
  - [ ] Call export endpoint instead of only showing a toast.
  - [ ] Download generated CSV/PDF.
  - [ ] Show backend size-limit errors.
  - [ ] Show export success/failure state.

- [ ] Complete announcement UI for FR-6.
  - [ ] Add preview action.
  - [ ] Add scheduled publish controls.
  - [ ] Validate future scheduled publish date in UI.
  - [ ] Show notification dispatch result if applicable.

- [ ] Fix student event registration form validation for FR-21.
  - [ ] Detect student ID fields.
  - [ ] Show explicit student ID format errors.

- [ ] Align club search UI with actual backend behavior for FR-19.
  - [ ] Either implement the stated relevance sort in backend or remove the claim from UI.
  - [ ] Keep minimum-input guidance consistent with backend.

## Architecture / Requirement Mismatch

- [ ] Resolve database/auth stack mismatch.
  - [ ] Requirements specify Supabase/PostgreSQL.
  - [ ] Current implementation uses MongoDB/Mongoose and custom JWT auth.
  - [ ] Decide whether to migrate or document instructor-approved deviation.

## Docs

- [ ] Update README route list.
  - [ ] Remove `/admin/appeals` until implemented, or implement it.
  - [ ] Remove `/admin/settings` until implemented, or implement it.
  - [ ] Document backend setup, required env vars, and database choice accurately.

## Verification

- [ ] Run backend syntax check: `npm.cmd --prefix backend run check`.
- [ ] Reinstall frontend dependencies if needed.
- [ ] Run frontend build: `npm.cmd run build`.
- [ ] Smoke test admin, club, and student flows after changes.
