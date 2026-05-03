# UI Guidelines

## UI Direction

The HR Management System frontend should use a **Modern HR SaaS Dashboard** style.

The design should feel clean, modern, easy to use, professional, not too colorful, not too playful, and suitable for an internal company HR system.

---

## Theme

Use **light mode only**.

Do not implement dark mode for MVP.

---

## Primary Color

Use **Emerald Green** as the main brand color.

### Color Direction

```txt
Primary: Emerald Green
Background: Light Gray
Main Content: White
Text: Dark Slate
Border: Light Gray
Success: Green
Warning: Amber
Danger: Red
Info: Blue
```

### Suggested Tailwind Colors

```txt
Primary: emerald-600
Primary hover: emerald-700
Primary soft: emerald-50
Primary border: emerald-200

Text primary: slate-900
Text secondary: slate-500
Text muted: slate-400

App background: gray-50
Card background: white
Border: gray-200

Success: green-600
Warning: amber-500
Danger: red-600
Info: blue-600
```

---

## Font

Use **Inter** as the main font.

### CSS Font Rule

```css
font-family: Inter, ui-sans-serif, system-ui, sans-serif;
```

### Font Style

The font should feel clean, readable, modern, not decorative, and not too playful.

---

## Layout

Use:

```txt
Collapsible sidebar
```

### Layout Structure

```txt
DashboardLayout
├── Sidebar
└── Main Content
```

### Layout Rules

- Sidebar should be collapsible.
- Topbar should stay clean and simple.
- Main content should have comfortable spacing.
- Desktop-only layout for MVP.
- No need to optimize heavily for mobile now.
- Keep content aligned and easy to scan.

---

## Sidebar Style

Use:

```txt
White sidebar with emerald active menu
```

### Sidebar Rules

- Sidebar background: white.
- Sidebar border-right: light gray.
- Active menu background: emerald soft.
- Active menu text: emerald dark.
- Icons should use simple outline style.
- Collapsed mode should show icons only.
- Menu should be grouped by module.
- Keep sidebar clean, not crowded.

### Example Menu Groups

```txt
Main
- Dashboard

Organization
- Departments
- Positions
- Employees

Attendance
- Attendance
- Attendance Correction

Leave
- Leave Requests
- Leave Balance

Payroll
- Payroll
- Payslips

Reports
- Payroll Report
- Attendance Report
- Leave Report

Admin
- Company Settings
- Public Holidays
- User Management
- Audit Logs
```

---

## Topbar Style

Use:

```txt
White topbar with bottom border
```

### Topbar Should Include

- Current page label or breadcrumb.
- User profile dropdown.
- Logout action.
- Optional notification icon later.

### Topbar Rules

- Keep topbar minimal.
- Do not use emerald background for topbar.
- Avoid heavy shadow.
- Use light bottom border.
- Keep user actions on the right side.

---

## Page Background

Use:

```txt
White main area + light gray app background
```

### Background Rules

- App background should be light gray.
- Cards and content sections should be white.
- Avoid pure white everywhere because it looks empty.
- Use clear spacing between sections.
- Keep page background calm and clean.

---

## Page Width

Use readable page width based on content type.

### Rules

- Form-heavy pages should not stretch too wide.
- Table/list pages can use full available width.
- Detail pages should use a comfortable centered width.
- Dashboard pages can use full width with grid cards.

### Tailwind Direction

```txt
Form/detail pages: max-w-5xl or max-w-6xl mx-auto
Large data pages: w-full
Dashboard pages: w-full
```

---

## Page Header Style

Use:

```txt
Title + subtitle + action button on right
```

### Page Header Rules

- Title should be short.
- Subtitle should explain the page.
- Main action button stays on the right.
- Do not make headers too tall.
- Use consistent spacing below the header.
- Add a small icon or accent mark where useful.
- Avoid huge banners for MVP.

### Tailwind Direction

```txt
Icon box: h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600
Title: text-2xl font-semibold text-slate-900
Subtitle: text-sm text-slate-500
```

### Example

```txt
Employees
Manage employee records, departments, positions, and employment status.

[+ Add Employee]
```

---

## Visual Accent Usage

The UI should not feel plain black-and-white.

Use subtle visual accents to create hierarchy, improve scanning, and make pages feel more polished.

### Rules

- Use emerald accents for primary sections, active states, and key actions.
- Use soft background colors for icons, summary cards, status areas, and helper notes.
- Avoid large blocks of strong color.
- Do not make pages overly colorful or playful.
- Every page should have visual hierarchy beyond plain white cards and black text.

### Recommended Accent Styles

```txt
Primary soft section: bg-emerald-50 border-emerald-100
Info note: bg-blue-50 border-blue-100 text-blue-700
Warning note: bg-amber-50 border-amber-100 text-amber-700
Danger note: bg-red-50 border-red-100 text-red-700
Success note: bg-green-50 border-green-100 text-green-700
Muted icon box: bg-slate-100 text-slate-600
Primary icon box: bg-emerald-50 text-emerald-600
```

---

## Color Balance

Use color with purpose.

### Rules

- Use emerald for the main brand and primary actions.
- Use blue for informational notes.
- Use amber for warning or pending states.
- Use red only for dangerous or rejected states.
- Use green for success, active, and approved states.
- Use slate and gray for neutral UI.
- Avoid random colors that do not map to meaning.

### Recommended Ratio

```txt
80% neutral: white, gray, slate
15% soft accents: emerald-50, blue-50, amber-50
5% strong colors: emerald-600, red-600, status tags
```

---

## Card Style

Use:

```txt
Rounded cards with border + very soft shadow
```

### Card Rules

```txt
Background: white
Border: gray-200
Radius: 12px
Shadow: very soft
Padding: comfortable
```

### Tailwind Direction

```txt
bg-white border border-gray-200 rounded-xl shadow-sm
```

### Use Cards For

- Dashboard summary.
- Tables.
- Forms.
- Report filters.
- Payroll summary.
- Employee profile sections.
- Settings sections.

---

## Section Header Style

Each major card or section should have a clear header.

### Rules

- Use title + short subtitle for important sections.
- Add a small icon box when the section represents a module or setting group.
- Keep section headers compact.
- Use muted text for descriptions.

### Tailwind Direction

```txt
Header wrapper: flex items-start gap-3
Icon box: h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600
Title: text-base font-semibold text-slate-900
Subtitle: text-sm text-slate-500
```

---

## Border Radius

Use **12px** as the default radius.

### Tailwind Equivalent

```txt
rounded-xl
```

### Radius Rules

```txt
Cards: rounded-xl
Buttons: rounded-lg
Inputs: rounded clean style
Modals/drawers: rounded-xl
Tables/cards: rounded-xl
```

Avoid overly round or pill-shaped UI unless used for tags or badges.

---

## Button Style

Use:

```txt
Solid emerald primary button + outline secondary button
```

### Primary Button

```txt
Background: emerald-600
Hover: emerald-700
Text: white
Radius: rounded-lg
```

### Secondary Button

```txt
Background: white
Border: gray-300
Text: slate-700
Hover: gray-50
```

### Danger Button

```txt
Background: red-600
Hover: red-700
Text: white
```

### Button Rules

- Main action uses emerald button.
- Cancel/back action uses outline button.
- Delete action uses danger button.
- Disable buttons while submitting.
- Show loading state when submitting.
- Do not use too many primary buttons on one page.

---

## Icon Style

Use:

```txt
Simple outline icons
```

### Use Icons For

- Sidebar menu.
- Page headers.
- Card headers.
- Dashboard cards.
- Empty states.
- Table actions.
- Buttons when useful.
- Helper notes.

### Icon Rules

- Use simple outline icons.
- Keep icon style consistent.
- Avoid filled or duotone icons for MVP.
- Use the same icon library across the app if possible.
- Icons should support meaning, not decoration only.
- Do not overuse icons inside every input field.

### Recommended Icon Placements

```txt
Page title: optional icon beside title
Card headers: icon box + title + subtitle
Empty states: larger muted icon
Action buttons: plus/edit/save/download icons when helpful
Table actions: icon buttons with tooltips
Status/helper notes: info/warning/check icons
```

---

## Icon Button Rules

Use icon buttons carefully.

### Rules

- Icon buttons must have tooltips.
- Icon-only buttons need an aria-label where possible.
- Use consistent icons for repeated actions.
- Keep action icons simple and outline-style.
- Use danger color only for destructive actions.
- If there are more than two actions, use a dropdown menu.

---

## Form Field Style

Use:

```txt
Rounded inputs with clean border
```

### Form Rules

- Inputs should feel clean and readable.
- Use clear labels.
- Show required fields clearly.
- Show inline validation errors.
- Do not use underline-only inputs.
- Do not use heavy gray input backgrounds.
- Group related fields together.
- Keep forms easy to scan.
- Clear validation errors after the user edits the field where possible.

### Element Plus Is Allowed For

- Inputs.
- Selects.
- Date pickers.
- Upload.
- Form validation.
- Dialogs.
- Drawers.

---

## Form Layout

Use mixed form style:

```txt
Small form = modal
Medium form = drawer
Large form = separate page
```

### Examples

```txt
Create department = modal
Create position = modal
Create employee = separate page or drawer
Edit employee = separate page or drawer
Attendance correction = modal
Payroll detail/edit = separate page
Company settings = page
```

### Form Layout Rules

- Do not force large forms into small modals.
- Use modal only for short/simple forms.
- Use drawer for medium forms where the user stays in context.
- Use separate page for complex forms.

---

## Form Visual Polish

Forms should not feel like raw inputs stacked on a page.

### Rules

- Group related fields into sections.
- Use section titles and short descriptions.
- Use helper text under fields when needed.
- Use subtle divider lines between large sections.
- Keep inputs aligned in grids.

### Tailwind Direction

```txt
Section gap: gap-6
Field grid: grid grid-cols-1 md:grid-cols-2 gap-4
Divider: border-t border-gray-100
```

---

## Form Required Fields

Required fields must be visually clear.

### Rules

- Use Element Plus required marker when possible.
- Keep labels short and clear.
- Do not use placeholder text as a replacement for labels.
- Show backend validation errors inline.
- Clear validation errors after the user edits the field where possible.

---

## Sticky Actions

Use sticky action bars for long edit forms.

### Rules

- Use sticky bottom actions only for long forms.
- Do not use sticky actions for small modal forms.
- Keep primary action on the right.
- Keep cancel/reset action beside it.
- Show sticky actions only when helpful.

---

## Unsaved Changes State

Edit forms should clearly show when data has changed.

### Rules

- Disable the save button when there are no changes.
- Show a small unsaved changes message when the form is dirty.
- Provide reset/cancel changes action when useful.
- Warn before leaving only for important long forms.

---

## Table Style

Use:

```txt
Clean white table with light borders + hover-highlight rows
```

### Table Rules

- Table should be inside a card.
- Filters should be above the table.
- Pagination should be below the table.
- Rows should have hover highlight.
- Use clear action buttons.
- Use status tags.
- Empty state should show icon + text.
- Avoid too many columns if not needed.
- Use fixed action column if useful.

### Recommended Table Structure

```txt
Card
├── Header / title
├── Filter row
├── Table
└── Pagination
```

---

## Table Visual Polish

Tables should not look like plain spreadsheets.

### Rules

- Use light header background.
- Use hover state on rows.
- Use status tags.
- Use icons/tooltips for actions.
- Keep borders soft.
- Avoid heavy grid borders.

### Tailwind Direction

```txt
Table header: bg-gray-50 text-slate-600
Row hover: hover:bg-gray-50
Card wrapper: bg-white border border-gray-200 rounded-xl shadow-sm
```

---

## Table Actions

Use:

```txt
1–2 actions = icon buttons
3+ actions = dropdown menu
```

### Examples

```txt
View + Edit = icon buttons
View + Edit + Delete + Disable = dropdown menu
```

### Action Rules

- Use tooltips for icon buttons.
- Use confirmation dialog before delete or dangerous actions.
- Do not show actions the user cannot perform.
- Dangerous actions should be red/danger style.
- Keep action column clean.

---

## Long Text in Tables

Prevent long text from breaking table layout.

### Rules

- Truncate long descriptions inside tables.
- Use tooltip or detail view if full text is needed.
- Keep table rows compact and readable.

### Tailwind Direction

```txt
max-w-xs truncate
```

---

## Filter UX

Filters should be simple and easy to reset.

### Rules

- Put filters inside a white card above the table.
- Always include Reset Filters when there is more than one filter.
- Search input should usually be first.
- Status/date filters should sit beside search.
- Avoid too many filters for MVP.
- Use only filters supported by the backend API.

### Recommended Layout

```txt
[Search...] [Status] [Date/Year] [Reset]
```

---

## Pagination UX

Use consistent pagination below tables.

### Rules

- Pagination should be under the table.
- Align pagination to the right.
- Show total count when available.
- Keep page size consistent across modules.
- Recommended default page size: 15.

---

## Status Badge

Use:

```txt
Element Plus tag
```

### Common Statuses

```txt
active
inactive
pending
approved
rejected
present
absent
late
submitted
locked
paid
```

### Suggested Colors

```txt
active = success
inactive = info
pending = warning
approved = success
rejected = danger
present = success
absent = danger
late = warning
submitted = info
locked = info
paid = success
```

### Badge Rules

- Use consistent colors across the app.
- Do not invent new colors for the same status.
- Keep badge text short.
- Use title case or readable labels.
- Do not rely on color only to show status.

---

## Empty State

Use:

```txt
Icon + text
```

### Empty State Rules

- Use simple outline icon.
- Add short helpful message.
- Add action button if useful and the user has permission.
- Do not leave empty tables blank.
- Empty list with filters should suggest resetting filters.

### Examples

```txt
No records found.
Create your first record.

No results found.
Try adjusting your filters.
```

---

## Helper Notes

Use helper notes to explain important business impact.

### Rules

- Use helper notes for settings or actions that affect other modules.
- Keep text short.
- Use soft colored background, not strong alert colors unless needed.
- Do not spam helper notes on every section.

### Examples

```txt
Attendance settings affect clock-in and clock-out validation.
Payroll settings affect salary calculation.
Inactive records are kept for history but are not used in active workflows.
```

### Tailwind Direction

```txt
Info note: rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700
Warning note: rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700
```

---

## Summary Cards

Use summary cards on list and dashboard pages when helpful.

### Rules

- Use 2–4 summary cards max.
- Summary cards should highlight useful counts or statuses.
- Add icons with soft colored backgrounds.
- Do not add summary cards if the data is not useful.

### Examples

```txt
Total Employees
Active Employees
Pending Leaves
This Month Attendance
```

### Tailwind Direction

```txt
Card: bg-white border border-gray-200 rounded-xl shadow-sm p-5
Icon box: h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600
Value: text-2xl font-semibold text-slate-900
Label: text-sm text-slate-500
```

---

## Loading Style

Use mixed loading style:

```txt
Cards/pages = skeleton
Tables/forms = loading overlay
Buttons = loading state
```

### Loading Rules

- Use button loading while submitting forms.
- Use table loading when fetching table data.
- Use skeleton for dashboard cards and first page load.
- Avoid full-page spinner unless it is the first app load.
- Do not block the whole page when only one section is loading.
- Keep old table data visible while refreshing when possible.

---

## Error Style

Use:

```txt
Toast + inline form errors
```

### Error Rules

- API validation errors show inline under fields.
- General API errors show toast message.
- Do not show raw backend stack traces.
- Do not show raw technical database errors.
- Use readable messages.
- 401 should redirect to login when needed.
- 403 should show permission message.

### Example Messages

```txt
Invalid email or password.
You are not allowed to perform this action.
Something went wrong. Please try again.
```

---

## Confirmation Wording

Action wording must match backend behavior.

### Rules

- Use “Disable” when the backend keeps the record but marks it inactive.
- Use “Delete” only when the record is permanently removed or treated as deleted by the system.
- Use “Cancel” for workflow cancellation.
- Use “Reject” for approval workflows.
- Confirmation messages should explain what will happen.

### Examples

```txt
Disable:
Are you sure you want to disable this item? It will no longer be active, but the record will be kept.

Delete:
Are you sure you want to delete this item? This action cannot be undone.

Reject:
Are you sure you want to reject this request? Please provide a reason.
```

---

## Delete Confirmation

Use:

```txt
Element Plus confirm dialog
```

### Delete Rules

- Never use browser confirm.
- Confirm before delete or dangerous action.
- Message should be clear.
- Delete button should use danger style.
- Explain if the action cannot be undone.
- If the backend only disables the record, use “Disable” wording instead of “Delete”.

---

## Action Visibility

Do not show actions that the user cannot perform.

### Rules

- Hide create/edit/delete/disable actions when the user lacks permission.
- Do not show actions that do nothing.
- Do not show Disable action for inactive records unless re-disable is meaningful.
- Do not show Enable action unless backend supports it.
- Prefer hiding unavailable actions over showing disabled buttons, unless the reason helps the user.

---

## Data Refresh Behavior

After create, update, delete, disable, approve, reject, or cancel actions:

### Rules

- Refresh the related list or update local state safely.
- Keep the user on the same page when possible.
- If the current page becomes empty, go back one page.
- Show success toast after the action completes.

---

## Date and Time Display

Use consistent date and time formatting across the app.

### Rules

- API date values should be sent as `YYYY-MM-DD`.
- API datetime values should be sent in the backend-accepted format.
- UI table/detail dates should be readable.
- Keep date format consistent in every module.

### Recommended Formats

```txt
Date display: Jan 01, 2026
Date input/API: YYYY-MM-DD
Time display: 08:00 AM
```

---

## Money Display

Use consistent money formatting.

### Rules

- Show currency beside amount.
- Align money values to the right inside tables.
- Use comma separators for large values.
- Mask salary/payroll values when the user does not have permission.
- Never rely on frontend masking for security.

### Examples

```txt
USD 850.00
KHR 3,400,000
```

---

## Number Display

Use consistent number formatting.

### Rules

- Use comma separators for large numbers.
- Keep decimal places only when needed.
- Percent values should include `%`.
- Day counts should include readable units.

### Examples

```txt
1,250
26 days
98.5%
```

---

## Chart Style

Use:

```txt
Emerald-themed charts
```

### Chart Rules

- Charts should be simple and clean.
- Use emerald as the main chart color.
- Use muted supporting colors.
- Do not use too many colors.
- Charts should be readable, not decorative.
- Avoid unnecessary 3D charts or heavy effects.

### Use Charts For

- Attendance summary.
- Leave summary.
- Payroll summary.
- Employee status summary.

---

## Dashboard Style

Use:

```txt
Cards + charts + recent activity
```

### Dashboard Should Include

- Summary cards.
- Simple charts.
- Recent activity or latest records.
- Role-based content.

### Dashboard Rules

- Do not show unauthorized data.
- Use skeleton loading for dashboard cards.
- Keep charts simple.
- Keep important numbers easy to see.
- Do not overload the dashboard.

---

## Login Page Style

Use:

```txt
Split screen with illustration
```

### Login Layout

```txt
Left side: branding / illustration / short HR system intro
Right side: login form card
```

### Login Rules

- Use emerald accent.
- Keep form clean.
- Show validation errors.
- Show loading state.
- Do not make it too colorful.
- Keep the login page professional.

---

## Component Library Rule

Use:

```txt
Element Plus + Tailwind CSS
```

### Recommended Usage

```txt
Element Plus:
- Forms
- Inputs
- Selects
- Tables
- Dialogs
- Drawers
- Date pickers
- Upload
- Dropdowns
- Tags

Tailwind CSS:
- Layout
- Spacing
- Cards
- Colors
- Page structure
- Custom UI polish
```

### Rule

Do not fight Element Plus too much.

Use Element Plus for complex UI behavior and Tailwind for layout/style polish.

---

## Spacing / Density

Use:

```txt
Comfortable spacing
```

### Spacing Rules

- Not too compact.
- Not too spacious.
- Use enough padding inside cards.
- Keep tables readable.
- Keep form sections clean.

### Tailwind Direction

```txt
Page padding: p-6
Card padding: p-5 or p-6
Section gap: gap-6
Form gap: gap-4
```

---

## Animation

Use:

```txt
Small hover/fade animation only
```

### Allowed

- Button hover.
- Card hover.
- Sidebar transition.
- Dropdown fade.
- Modal transition.

### Avoid

- Heavy animation.
- Bouncing effects.
- Too many moving elements.
- Slow page transitions.
- Flashy dashboard effects.

---

## Salary / Sensitive Data Display

Use:

```txt
Show only to allowed roles and mask by default
```

### Rules

- Salary should only appear for allowed roles.
- Mask salary by default where suitable.
- Add show/hide toggle if needed.
- Never expose salary just because frontend hides it.
- Backend must still protect salary APIs.

### Example

```txt
$ ****
[Show]
```

---

## Accessibility Basics

Keep MVP accessible enough.

### Rules

- Buttons should have clear text or tooltip.
- Icon-only buttons need tooltip or aria-label.
- Form fields must have visible labels.
- Do not rely on color only to show status.
- Text contrast should stay readable.
- Click targets should not be too small.

---

## Desktop Target

For MVP, target:

```txt
Desktop only
```

### Desktop Rules

- Optimize for laptop/desktop screen.
- No need for heavy mobile design now.
- Still avoid layouts that completely break on smaller screens.
- Sidebar collapse is enough for MVP responsiveness.

---

## Final UI Target

The final UI should look like:

```txt
Modern HR SaaS dashboard
```

Not:

```txt
Old admin panel
Over-colorful app
Dark dashboard
Mobile-first app
Flashy landing page
Plain black-and-white CRUD screen
```

---

# Final Rule

Keep the UI clean, consistent, and easy to understand.

The system is for HR management, so clarity is more important than decoration.
