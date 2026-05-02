Improve table horizontal behavior.

Requirement:
The employee table must support horizontal scrolling when columns do not fit the available width.

Rules:

- Do not squeeze columns until text wraps badly.
- Keep column headers on one line where possible.
- Set proper `min-width` for each important column.
- Wrap the table with a horizontal scroll container.
- Use `overflow-x-auto`.
- Keep pagination outside the horizonta
