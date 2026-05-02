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

- Current page label or breadcrumb
- User profile dropdown
- Logout action
- Optional notification icon later

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

- Dashboard summary
- Tables
- Forms
- Report filters
- Payroll summary
- Employee profile sections
- Settings sections

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
- Disable button while submitting.
- Show loading state when submitting.
- Do not use too many primary buttons on one page.

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

### Element Plus Is Allowed For

- Inputs
- Selects
- Date pickers
- Upload
- Form validation
- Dialogs
- Drawers

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
- Use drawer for medium forms where user stays in context.
- Use separate page for complex forms.

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
- Use confirmation dialog before delete.
- Do not show actions the user cannot perform.
- Dangerous actions should be red/danger style.
- Keep action column clean.

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
- Explain if action cannot be undone.

### Example Text

```txt
Are you sure you want to delete this item? This action cannot be undone.
```

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

---

## Empty State

Use:

```txt
Icon + text
```

### Empty State Rules

- Use simple outline icon.
- Add short helpful message.
- Add action button if useful.
- Do not leave empty tables blank.

### Example

```txt
No employees found.
Try adjusting your filters or create a new employee.
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
- Use skeleton for dashboard cards.
- Avoid full-page spinner unless first app load.
- Do not block the whole page when only table data is loading.

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

## Page Header Style

Use:

```txt
Title + subtitle + action button on right
```

### Example

```txt
Employees
Manage employee records, departments, positions, and employment status.

[+ Add Employee]
```

### Page Header Rules

- Title should be short.
- Subtitle should explain the page.
- Main action button stays on the right.
- Do not make headers too tall.
- Use consistent spacing below header.

---

## Icon Style

Use:

```txt
Simple outline icons
```

### Use Icons For

- Sidebar menu
- Dashboard cards
- Empty states
- Table actions
- Buttons when useful

### Icon Rules

- Do not overuse icons.
- Keep icon style consistent.
- Avoid filled/duotone icons for MVP.
- Use the same icon library across the app if possible.

---

## Chart Style

Use:

```txt
Emerald-themed charts
```

### Chart Rules

- Charts should be simple and clean.
- Use emerald as main chart color.
- Use muted supporting colors.
- Do not use too many colors.
- Charts should be readable, not decorative.
- Avoid unnecessary 3D charts or heavy effects.

### Use Charts For

- Attendance summary
- Leave summary
- Payroll summary
- Employee status summary

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

## Dashboard Style

Use:

```txt
Cards + charts + recent activity
```

### Dashboard Should Include

- Summary cards
- Simple charts
- Recent activity or latest records
- Role-based content

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

## Animation

Use:

```txt
Small hover/fade animation only
```

### Allowed

- Button hover
- Card hover
- Sidebar transition
- Dropdown fade
- Modal transition

### Avoid

- Heavy animation
- Bouncing effects
- Too many moving elements
- Slow page transitions
- Flashy dashboard effects

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
```

---

# Final Rule

Keep the UI clean, consistent, and easy to understand.

The system is for HR management, so clarity is more important than decoration.
