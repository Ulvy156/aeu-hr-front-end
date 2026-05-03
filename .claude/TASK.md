Implement the Attendance frontend using the completed backend Attendance API.

Read the existing frontend instruction files first and follow the current project structure, reusable helpers, services, components, permission helper, API envelope pattern, and UI guidelines.

Backend API contract:
D:\AEU\Thesis\HR\aeu-hr-back-end\.claude\api\ATTENDANCE_API.md

Endpoints:

- POST /api/attendance/clock-in
- POST /api/attendance/clock-out
- GET /api/attendance
- PUT /api/attendance/{attendance}/correction
- POST /api/attendance/mark-absent

Important backend rules:

- Frontend only sends latitude and longitude for clock-in/out.
- Backend calculates GPS validation, status, late status, and server time.
- Do not calculate attendance status on frontend.
- Do not calculate is_late on frontend.
- Do not allow GPS correction on frontend.
- Do not send is_late in correction payload.
- Correction payload may only include:
  - clock_in_time
  - clock_out_time
  - status
  - correction_reason
- correction_reason is required.
- Mark absent supports:
  - no payload = today
  - attendance_date = selected date
- If user has no linked employee profile, backend returns 403:
  “No employee profile is linked to this user account.”

Required UI:

- Attendance page
- Clock In / Clock Out card
- Attendance filters
- Attendance table
- Attendance correction dialog
- Mark absent dialog

Clock In / Clock Out:

- Use browser geolocation.
- Show loading while getting location and submitting.
- Send only latitude and longitude.
- Show readable error if location permission is denied/unavailable.
- Show readable backend errors for outside radius, duplicate clock-in/out, or missing office GPS settings.
- Do not send frontend time.

Attendance list:

- Use only filters documented in ATTENDANCE_API.md.
- Show readable date/time.
- Use status badges:
  - present = success
  - late = warning
  - absent = danger
  - missing_clock_out = info
- Show correction action only with attendance.correct permission.

Correction dialog:

- Fields:
  - clock_in_time
  - clock_out_time
  - status
  - correction_reason
- No GPS fields.
- No is_late field.
- Show backend validation errors inline.
- Refresh list after success.

Mark absent:

- Show only with attendance.mark_absent permission.
- Optional date picker.
- If date is empty, backend marks today.
- Show created count if backend returns it.
- Refresh list after success.

UX:

- Keep consistent with current app UI.
- Use visual accents/icons so page does not look plain.
- Use loading, empty, and error states.
- Do not expose raw backend errors.

After implementation:

- Run npx vue-tsc --noEmit
- Run npm run build if available
- Fix all errors
- Summarize changed files
