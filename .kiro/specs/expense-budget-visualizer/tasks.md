# Expense & Budget Visualizer — Implementation Tasks

> **Status Legend**
> - ✅ Completed — implemented and verified in the current codebase
> - 🔲 Not started — not yet implemented

All tasks below are **✅ Completed** because the application is fully built. The document reflects the logical implementation order so it can serve as a post-hoc audit trail and a baseline for future work.

---

## Task Index

| ID | Title | Status |
|----|-------|--------|
| [T-01](#t-01-project-scaffold) | Project Scaffold | ✅ |
| [T-02](#t-02-css-design-tokens--reset) | CSS Design Tokens & Reset | ✅ |
| [T-03](#t-03-localstorage-persistence-layer) | LocalStorage Persistence Layer | ✅ |
| [T-04](#t-04-in-memory-state--utility-functions) | In-Memory State & Utility Functions | ✅ |
| [T-05](#t-05-header--reset-button-markup) | Header & Reset Button Markup | ✅ |
| [T-06](#t-06-budget-input--set-budget-logic) | Budget Input & Set Budget Logic | ✅ |
| [T-07](#t-07-progress-bar) | Progress Bar | ✅ |
| [T-08](#t-08-summary-cards) | Summary Cards | ✅ |
| [T-09](#t-09-expense-form--validation) | Expense Form & Validation | ✅ |
| [T-10](#t-10-expense-crud-operations) | Expense CRUD Operations | ✅ |
| [T-11](#t-11-expense-list-rendering) | Expense List Rendering | ✅ |
| [T-12](#t-12-filter--sort-controls) | Filter & Sort Controls | ✅ |
| [T-13](#t-13-donut-chart) | Donut Chart | ✅ |
| [T-14](#t-14-bar-chart) | Bar Chart | ✅ |
| [T-15](#t-15-confirmation-modal) | Confirmation Modal | ✅ |
| [T-16](#t-16-toast-notification-system) | Toast Notification System | ✅ |
| [T-17](#t-17-reset-all-data-flow) | Reset All Data Flow | ✅ |
| [T-18](#t-18-master-update-orchestration) | Master Update Orchestration | ✅ |
| [T-19](#t-19-responsive-layout) | Responsive Layout | ✅ |
| [T-20](#t-20-accessibility-attributes--keyboard-support) | Accessibility Attributes & Keyboard Support | ✅ |
| [T-21](#t-21-app-initialization) | App Initialization | ✅ |
| [T-22](#t-22-final-integration--testing-checklist) | Final Integration & Testing Checklist | ✅ |

---

## T-01 — Project Scaffold

**Status:** ✅ Completed

### Description
Create the three-file project structure (`index.html`, `css/style.css`, `js/app.js`) with correct linking, metadata, and document outline. This is the foundational task everything else builds on.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** TC-1, TC-4, TC-5, TC-7
- `index.html` has `<!DOCTYPE html>`, `lang="en"`, UTF-8 charset, viewport meta tag, and a meaningful `<title>`.
- `css/style.css` is linked via `<link rel="stylesheet" href="css/style.css">` in `<head>`.
- `js/app.js` is loaded via `<script src="js/app.js">` at the bottom of `<body>`.
- The page renders without console errors when opened via `file://`.
- No build step or server is required.

### Dependencies
None (first task)

---

## T-02 — CSS Design Tokens & Reset

**Status:** ✅ Completed

### Description
Define the full CSS custom-property system (design tokens) in `:root` and apply a box-sizing / margin / padding reset. Establish base `body` typography. These tokens act as the single source of truth for all visual constants — colors, radii, shadows, fonts, and the transition duration.

### Files Affected
- `css/style.css`

### Acceptance Criteria
- **AC-mapping:** NFR-1.4, NFR-1.5, NFR-1.6, NFR-4.4
- `:root` declares all color tokens: `--color-bg`, `--color-surface`, `--color-primary`, `--color-primary-dark`, `--color-danger`, `--color-danger-dark`, `--color-success`, `--color-warning`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-budget`, `--color-spent`, `--color-remaining`.
- `:root` declares all shape tokens: `--radius-sm`, `--radius-md`, `--radius-lg`.
- `:root` declares all shadow tokens: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- `:root` declares `--font-sans` and `--transition`.
- Universal selector applies `box-sizing: border-box` and zeroes margins/padding.
- `body` uses `--font-sans`, `--color-bg`, `--color-text`, `min-height: 100vh`.
- No hardcoded color values appear outside `:root` (all component styles use `var(--...)`).

### Dependencies
- T-01

---

## T-03 — LocalStorage Persistence Layer

**Status:** ✅ Completed

### Description
Implement the two storage keys as constants and write the three persistence functions: `loadData()`, `saveExpenses()`, and `saveBudget()`. Include try/catch error handling in `loadData()` so corrupted storage falls back to safe defaults.

### Files Affected
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** FR-12.1, FR-12.2, FR-12.3, FR-12.4, FR-12.5, AC-1.7, NFR-3.1, NFR-3.2
- Constants `STORAGE_KEY_EXPENSES = 'ebv_expenses'` and `STORAGE_KEY_BUDGET = 'ebv_budget'` are defined at the top of the file.
- `saveExpenses()` calls `localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses))`.
- `saveBudget()` calls `localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget))`.
- `loadData()` parses both keys inside a `try/catch`; on failure, `expenses` defaults to `[]` and `budget` to `0`.
- Budget is read back with `parseFloat(JSON.parse(rawBudget))` to guard against string coercion.
- Data survives page reload (manual browser test).

### Dependencies
- T-01

---

## T-04 — In-Memory State & Utility Functions

**Status:** ✅ Completed

### Description
Declare the four module-level state variables and implement the three pure utility functions used throughout the app.

### Files Affected
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** FR-2.3, FR-2.4, NFR-4.1, NFR-4.2
- `let expenses = []`, `let budget = 0`, `let pendingDeleteId = null`, `let toastTimer = null` are declared at module scope.
- `formatCurrency(amount)` returns a string with `$` prefix, thousands separator, and exactly two decimal places (uses `Number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`).
- `generateId()` returns a collision-resistant string combining `Date.now().toString(36)` and a random alphanumeric suffix.
- `totalSpent()` returns the sum of all `expense.amount` values in the `expenses` array using `Array.reduce`.
- `CATEGORY_ICONS` object maps each of the 8 category keys to its emoji string.
- `CHART_COLORS` array contains exactly 8 hex color strings in the specified order.

### Dependencies
- T-01, T-03

---

## T-05 — Header & Reset Button Markup

**Status:** ✅ Completed

### Description
Build the sticky page header with the brand name and the Reset button. Style it with correct sticky positioning, border, and shadow. The Reset button's click logic is implemented in T-17.

### Files Affected
- `index.html`
- `css/style.css`

### Acceptance Criteria
- **AC-mapping:** AC-9.1, FR-4.1
- `<header class="header">` contains `.header-inner` as a centered max-width container.
- `.header-inner` uses flexbox with `justify-content: space-between` for brand-left, button-right layout.
- The brand section shows a 💰 emoji icon and an `<h1>` with text "Budget Visualizer".
- `#btn-reset` button is always visible in the header; it has class `btn btn-ghost`.
- `.header` is `position: sticky; top: 0; z-index: 100` so it stays visible during scroll.

### Dependencies
- T-01, T-02

---

## T-06 — Budget Input & Set Budget Logic

**Status:** ✅ Completed

### Description
Build the Monthly Budget card with the currency-prefixed number input and "Set Budget" button. Implement `setBudget()` with validation, persistence, and UI update.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, AC-1.7, FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-1.5
- `#input-budget` is a `type="number"` input with `min="0"` and `step="0.01"`, wrapped in `.input-prefix` showing `$`.
- `#btn-set-budget` triggers `setBudget()` on click; pressing `Enter` in `#input-budget` also triggers `setBudget()`.
- `setBudget()` rejects `NaN` or negative values with an `error` toast; the budget state is unchanged.
- On valid input: `budget` is updated, `saveBudget()` is called, the input is cleared, `updateAll()` is called, and a `success` toast shows the formatted budget.
- All budget-dependent UI (summary cards, progress bar) reflects the new value without a page reload.

### Dependencies
- T-02, T-03, T-04, T-05, T-16

---

## T-07 — Progress Bar

**Status:** ✅ Completed

### Description
Add the progress bar section inside the budget card and implement `updateSummary()`'s progress bar logic: width calculation, color-state classes, and the status text below the bar.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-4.1, AC-4.2, AC-4.3, AC-4.4, AC-4.5, AC-4.6, AC-4.7, FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5
- `.progress-bar-track` wraps `#progress-bar` (`.progress-bar-fill`).
- `#progress-bar` width is set to `min(pct, 100)%` via `style.width`.
- CSS `transition: width 0.4s ease` provides a smooth animated fill.
- `< 80%` → default class only (blue gradient).
- `80%–99%` → `.warning` class added (amber gradient).
- `≥ 100%` → `.danger` class added (red gradient).
- `#label-spent` and `#label-budget` above the bar show the current spent amount and total budget respectively.
- `#progress-status` text follows the four-case logic defined in AC-4.5:
  - No budget set → "Set a budget to track your spending."
  - Spent < 80% → remaining amount and percentage left.
  - Spent 80%–99% → percentage consumed.
  - Over budget → "⚠️ Over budget by $X.XX" in red (`.over` class).

### Dependencies
- T-02, T-04, T-06

---

## T-08 — Summary Cards

**Status:** ✅ Completed

### Description
Build the four KPI summary cards and wire them to the `updateSummary()` function. Each card has a left-border accent color, a label, and a value element.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5, FR-5.1, FR-5.2, FR-5.3, FR-5.4, FR-5.5, FR-5.6
- `.summary-grid` renders four `.summary-card` elements in a 4-column CSS Grid.
- Cards: `#sum-budget` (blue border), `#sum-spent` (red border), `#sum-remaining` (green border), `#sum-count` (amber border).
- All monetary values use `formatCurrency()` (e.g., `$1,234.56`).
- `#sum-remaining` color: green when positive, `--color-warning` when zero, `--color-danger` when negative.
- `#sum-count` shows a plain integer (number of expenses).
- All four values update on every call to `updateSummary()`.

### Dependencies
- T-02, T-04, T-07

---

## T-09 — Expense Form & Validation

**Status:** ✅ Completed

### Description
Build the Add Expense form with four fields (description, amount, category, date) and implement inline client-side validation logic inside `addExpense()`.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.9, AC-2.10, AC-2.11, FR-2.1, FR-2.2, NFR-3.3
- `#form-expense` uses `<form novalidate>` to disable browser native validation in favor of custom logic.
- `#input-desc` is `type="text"` with `maxlength="60"` and `required`.
- `#input-amount` is `type="number"` with `min="0.01"` and `step="0.01"`, wrapped in `.input-prefix` showing `$`.
- `#input-category` is a `<select>` with exactly 8 options matching `CATEGORY_ICONS` keys; defaults to "Food".
- `#input-date` is `type="date"`.
- `#form-error` has `aria-live="polite"` and shows inline error text.
- Validation order: description first, then amount, then date; each failure sets `#form-error` text, focuses the offending field, and returns early.
- On successful submission, `#form-error` is cleared.

### Dependencies
- T-02, T-04, T-05

---

## T-10 — Expense CRUD Operations

**Status:** ✅ Completed

### Description
Implement `addExpense()`, `deleteExpense()`, and `confirmDelete()` — the core create and delete operations for expenses.

### Files Affected
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-2.5, AC-2.6, AC-2.7, AC-2.8, AC-8.2, AC-8.3, AC-8.6, AC-8.7, AC-8.8, FR-2.3, FR-2.4, FR-2.5, FR-2.6, FR-2.7, FR-3.1, FR-3.2, FR-3.4, NFR-3.3, NFR-3.4
- `addExpense(e)` calls `e.preventDefault()`, runs validation (T-09), constructs an expense object with `generateId()`, calls `expenses.unshift(expense)`, `saveExpenses()`, `formExpense.reset()`, `setDefaultDate()`, `updateAll()`, and `showToast('Expense added!', 'success')`.
- `deleteExpense(id)` filters the expense out of `expenses`, calls `saveExpenses()`, `updateAll()`, and `showToast('Expense deleted.', 'info')`.
- `confirmDelete(id)` sets `pendingDeleteId`, populates the modal message with the expense's `desc` and `formatCurrency(amount)`, and removes the `hidden` class from `#modal-overlay`.
- `setDefaultDate()` sets `#input-date` to today's `YYYY-MM-DD` string.
- Expense object shape: `{ id, desc, amount, category, date }` where `date` is `YYYY-MM-DD`.
- All string data in the expense object is untransformed (HTML escaping happens at render time in T-11).

### Dependencies
- T-03, T-04, T-09, T-15, T-16, T-18

---

## T-11 — Expense List Rendering

**Status:** ✅ Completed

### Description
Implement `renderExpenseList()` and the `escapeHtml()` helper. Generate the expense item HTML structure via template literals, including the category icon chip, description with ellipsis, metadata line, amount, and delete button.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-7.5, AC-7.6, AC-7.7, AC-7.8, FR-9.1, FR-9.5, FR-9.6, FR-9.7, NFR-3.3
- Each rendered expense item has the structure: `.expense-item[data-id]` → `.expense-cat-icon.cat-{Category}[aria-hidden]` + `.expense-info` (`.expense-desc` + `.expense-meta`) + `.expense-amount` + `.btn-icon.expense-delete[aria-label][data-id]`.
- `.expense-cat-icon` applies `.cat-{Category}` for the background color and shows the emoji.
- `.expense-desc` shows the HTML-escaped description with `title` attribute for overflow tooltip; CSS truncates with `text-overflow: ellipsis`.
- `.expense-meta` shows `{Category} · {formatted date}` using `toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`.
- `.expense-amount` is colored `--color-danger` (red).
- Delete button `aria-label` is `"Delete expense {desc}"` (unique per item).
- Empty state: "No expenses yet. Add one above!" when `expenses.length === 0`; "No expenses match the current filter." when filter hides all items.
- `escapeHtml()` replaces `&`, `<`, `>`, and `"` with their HTML entities.

### Dependencies
- T-02, T-04, T-09, T-10, T-12

---

## T-12 — Filter & Sort Controls

**Status:** ✅ Completed

### Description
Add the category filter and sort dropdowns to the expense list section. Implement `getFilteredSorted()` and wire both selects to trigger `renderExpenseList()` on change.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-7.1, AC-7.2, AC-7.3, AC-7.4, AC-7.5, FR-9.2, FR-9.3, FR-9.4
- `#filter-category` has "All Categories" (`value="all"`) plus one option per category (8 total).
- `#sort-expenses` has four options: `date-desc` (Newest First), `date-asc` (Oldest First), `amount-desc` (Highest Amount), `amount-asc` (Lowest Amount).
- `getFilteredSorted()` applies category filter first (shallow copy of `expenses` when "all"), then applies sort.
- Date sort uses `localeCompare` on the ISO date string (sorts correctly without `Date` parsing).
- Amount sort uses numeric subtraction.
- Both selects fire `renderExpenseList()` directly on their `change` events (charts and summary are unaffected by filter/sort changes alone).

### Dependencies
- T-02, T-04, T-11

---

## T-13 — Donut Chart

**Status:** ✅ Completed

### Description
Implement `drawDonut()` using the Canvas 2D API. Aggregates expenses by category, draws arc slices with gap separators, draws the donut hole with a center total label, and renders an HTML legend alongside the canvas.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5, AC-5.6, AC-5.7, FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-7.5, FR-7.6, FR-7.7, FR-7.8
- `#chart-donut` is a `<canvas width="260" height="260">` with `role="img"` and `aria-label="Donut chart of spending by category"`.
- `drawDonut()` calls `ctx.clearRect()` before each draw.
- Expenses are aggregated by category into a `totals` map; entries are sorted descending by value.
- Each slice is drawn as an `arc()` from the 12 o'clock position (`-Math.PI / 2`), proportional to `val / grand * 2π`.
- A 1px white gap arc is drawn over each slice boundary to visually separate slices.
- Inner circle (`innerR = outerR * 0.55`) is filled white to create the donut hole.
- `formatCurrency(grand)` is drawn centered in the donut hole.
- Colors cycle through `CHART_COLORS` (8 colors, wraps via modulo).
- `#chart-legend` is populated with one `.legend-item` per category: colored dot, emoji + name, percentage.
- When no expenses exist: canvas is hidden (`display: none`), `#chart-empty` is shown (`display: block`).

### Dependencies
- T-02, T-04, T-10

---

## T-14 — Bar Chart

**Status:** ✅ Completed

### Description
Implement `drawBar()` using the Canvas 2D API. Aggregates expenses by date, selects the 14 most recent dates, draws grid lines, rounded-top bars, x-axis date labels, y-axis value labels, and in-bar value labels. Canvas width is dynamic; `roundRect()` helper handles rounded top corners.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-6.1, AC-6.2, AC-6.3, AC-6.4, AC-6.5, AC-6.6, AC-6.7, AC-6.8, AC-6.9, FR-8.1, FR-8.2, FR-8.3, FR-8.4, FR-8.5, FR-8.6, FR-8.7, FR-8.8, FR-8.9
- `#chart-bar` is a `<canvas>` with `role="img"` and `aria-label="Bar chart of daily spending"`.
- `drawBar()` sets `canvasBar.width = container.clientWidth || 400` and `canvasBar.height = 220` before each draw (dynamic width).
- Dates are sorted ascending; only the last 14 with data are shown.
- Four evenly spaced horizontal grid lines are drawn; y-axis labels use `$Xk` format for values ≥ 1000.
- Bar width: `max(8, floor(gap * 0.6))`; bars are centered within their slot.
- `roundRect(ctx, x, y, w, h, r)` draws a rectangle with rounded top corners only; `r` is clamped to `min(r, h/2, w/2)`; returns early when `h <= 0`.
- Dollar value label appears inside bars with `barH > 18`.
- X-axis labels are `M/D` format (month/day, no zero-padding).
- When no expenses exist: canvas is hidden, `#bar-empty` is shown.
- `window.resize` triggers a debounced (120ms) `drawDonut()` + `drawBar()` redraw via `clearTimeout`.

### Dependencies
- T-02, T-04, T-10, T-13

---

## T-15 — Confirmation Modal

**Status:** ✅ Completed

### Description
Build the reusable confirmation modal overlay and implement `closeModal()`. The modal is shared by the delete expense and reset all flows. Style includes the entrance animation.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-8.2, AC-8.3, AC-8.4, AC-8.5, AC-9.2, AC-9.3, FR-11.1, FR-11.2, FR-11.3, FR-11.4
- `#modal-overlay` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`, and starts with class `hidden` (`display: none`).
- `.modal` contains `#modal-title` (`<h3>`), `#modal-message` (`<p>`), and `.modal-actions` with `#modal-cancel` (`.btn-ghost`) and `#modal-confirm` (`.btn-danger`).
- `@keyframes modal-in` animates opacity from 0 and scale from 0.95 on open.
- `closeModal()` adds class `hidden` back to `#modal-overlay` and sets `pendingDeleteId = null`.
- `#modal-cancel` click → `closeModal()`.
- Clicking directly on `#modal-overlay` (not on `.modal`) → `closeModal()` (overlay backdrop dismiss).
- `#modal-confirm` click → calls `deleteExpense(pendingDeleteId)` then `closeModal()` (for the delete flow).

### Dependencies
- T-02, T-04, T-05

---

## T-16 — Toast Notification System

**Status:** ✅ Completed

### Description
Build the toast element and implement `showToast(message, type)`. Supports three types: `success`, `error`, `info`. Includes slide-up animation and 3-second auto-dismiss with timer replacement.

### Files Affected
- `index.html`
- `css/style.css`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-10.1, AC-10.2, AC-10.3, AC-10.4, AC-10.5, AC-10.6, FR-10.1, FR-10.2, FR-10.3, FR-10.4, FR-10.5
- `#toast` is `position: fixed; bottom: 24px; right: 24px` with `role="alert"` and `aria-live="assertive"`; starts with class `hidden`.
- `showToast(message, type)` sets `toast.textContent = message` and `toast.className = 'toast ' + type` (removes `hidden`).
- `@keyframes toast-in` animates `opacity` and `translateY` on show.
- `.toast.success` background `#15803d` (green), `.toast.error` background `var(--color-danger)`, `.toast.info` background `var(--color-primary)`.
- If `toastTimer` is active, it is cleared before setting the new 3000ms timer.
- After 3000ms, class is reset to `'toast hidden'`.
- A new toast call replaces the previous message and resets the timer (no queuing).

### Dependencies
- T-02, T-05

---

## T-17 — Reset All Data Flow

**Status:** ✅ Completed

### Description
Wire the Reset button to the confirmation modal with a custom message, then implement `resetAll()`. The modal is temporarily reconfigured for the reset action (title, message, button label, and `onclick` override), then restored after confirmation.

### Files Affected
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-9.1, AC-9.2, AC-9.3, AC-9.4, AC-9.5, AC-9.6, FR-4.1, FR-4.2, FR-4.3, FR-4.4
- `#btn-reset` click listener sets `pendingDeleteId = null`, updates `#modal-title` to "Reset All Data", updates `#modal-message` to the irreversibility warning, sets `#modal-confirm.textContent = 'Reset'`, and temporarily overrides `modalConfirm.onclick`.
- `resetAll()` sets `expenses = []` and `budget = 0`, calls `saveExpenses()` and `saveBudget()`, then `updateAll()`, `closeModal()`, and `showToast('All data cleared.', 'info')`.
- After `resetAll()` completes, `#modal-confirm.textContent` is restored to `"Delete"` and `modalConfirm.onclick` is set back to `null`.
- All UI elements (summary cards, progress bar, charts, expense list) revert to their zero/empty state immediately.

### Dependencies
- T-03, T-04, T-06, T-08, T-10, T-15, T-16, T-18

---

## T-18 — Master Update Orchestration

**Status:** ✅ Completed

### Description
Implement `updateAll()` as the single function that calls all four UI-refresh functions in sequence. This ensures the DOM is always fully in sync with in-memory state after any mutation.

### Files Affected
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** NFR-4.3, FR-1.4, FR-2.6, FR-3.4, FR-4.4
- `updateAll()` calls exactly: `updateSummary()`, `renderExpenseList()`, `drawDonut()`, `drawBar()` — in that order.
- Every state-mutation path (add expense, delete expense, set budget, reset all) calls `updateAll()` after persisting to localStorage.
- Filter/sort changes call only `renderExpenseList()` directly (charts and summary remain unchanged).
- No stale-state bugs: all four display areas reflect in-memory state after each `updateAll()` invocation.

### Dependencies
- T-07, T-08, T-11, T-13, T-14

---

## T-19 — Responsive Layout

**Status:** ✅ Completed

### Description
Add the two responsive breakpoints (≤ 900px and ≤ 600px) to style.css. Adjust grid columns, padding, and flex directions so the app is fully usable on mobile, tablet, and desktop.

### Files Affected
- `css/style.css`

### Acceptance Criteria
- **AC-mapping:** AC-11.1, AC-11.2, AC-11.3, AC-11.4, AC-11.5, AC-11.6, NFR-2.3
- **≤ 900px:** `summary-grid` collapses to `repeat(2, 1fr)`; `charts-grid` collapses to `1fr` (stacked vertically); `form-row` becomes `1fr 1fr`.
- **≤ 600px:** `main` and `header-inner` padding reduced; `form-row` becomes `1fr` (fully stacked); `budget-row` becomes `flex-direction: column` with button `width: 100%`; `list-header` becomes `flex-direction: column`; `list-controls` becomes full-width with selects using `flex: 1`.
- Bar chart canvas resizes on viewport resize (handled by the debounced resize listener in T-14).
- All content remains accessible and readable at viewport widths ≥ 320px.

### Dependencies
- T-02, T-05, T-07, T-08, T-09, T-12, T-13, T-14

---

## T-20 — Accessibility Attributes & Keyboard Support

**Status:** ✅ Completed

### Description
Apply all ARIA roles, attributes, and `aria-label` values to the modal, toast, canvas elements, form error region, and expense delete buttons. Implement the keyboard `Enter` shortcut for the budget input.

### Files Affected
- `index.html`
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** NFR-1.3, FR-10.5, FR-11.4, design §9.1–§9.3
- `#modal-overlay` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`.
- `#chart-donut` has `role="img"` and `aria-label="Donut chart of spending by category"`.
- `#chart-bar` has `role="img"` and `aria-label="Bar chart of daily spending"`.
- `#form-error` has `aria-live="polite"`.
- `#toast` has `role="alert"` and `aria-live="assertive"`.
- `.expense-cat-icon` has `aria-hidden="true"` (decorative emoji).
- Each rendered delete button has `aria-label="Delete expense {desc}"` (unique per item, HTML-escaped).
- `#input-budget` keydown listener fires `setBudget()` when `event.key === 'Enter'`.
- `<form>` submit semantics allow Enter-key submission from any form field.
- All interactive elements are reachable via Tab navigation in DOM order.

### Dependencies
- T-05, T-06, T-09, T-11, T-13, T-14, T-15, T-16

---

## T-21 — App Initialization

**Status:** ✅ Completed

### Description
Implement `init()` — the entry point that bootstraps the application on page load. Chains `loadData()`, `setDefaultDate()`, and `updateAll()`.

### Files Affected
- `js/app.js`

### Acceptance Criteria
- **AC-mapping:** AC-1.7, AC-2.6, FR-12.4, NFR-2.1
- `init()` calls `loadData()` first, then `setDefaultDate()`, then `updateAll()`.
- `init()` is called as the last statement in `app.js` (after all function definitions and event listener registrations).
- On first visit (empty localStorage), all UI displays zero/empty state with no console errors.
- On subsequent visits, all data (expenses and budget) is restored from localStorage and the full UI renders correctly.
- `#input-date` defaults to today's date (`YYYY-MM-DD`) immediately on page load.
- Total time from page open to interactive state is under 1 second on a local filesystem load.

### Dependencies
- T-03, T-04, T-06, T-07, T-08, T-10, T-11, T-12, T-13, T-14, T-18

---

## T-22 — Final Integration & Testing Checklist

**Status:** ✅ Completed

### Description
End-to-end integration review confirming all features work together as a cohesive application. Cross-reference every functional requirement, run through all user story flows, and verify the app works on multiple viewport sizes.

### Files Affected
- `index.html`, `css/style.css`, `js/app.js` (read-only review, fixes applied as needed)

### Acceptance Criteria
- All previous task acceptance criteria pass simultaneously.
- No console errors or warnings on initial load or during normal use.
- XSS: entering `<script>alert(1)</script>` as a description does not execute JavaScript.
- LocalStorage: all data survives hard page reload (`Ctrl+F5` / `Cmd+Shift+R`).
- Payload: combined size of all three files is under 100 KB uncompressed (NFR-2.5).

### Dependencies
- T-01 through T-21 (all tasks)

---

## Verification Checklist

Use this checklist for manual end-to-end testing. Open `index.html` directly in the browser (no server needed).

### Budget

- [ ] Page loads with zero state (no errors in console)
- [ ] Entering a negative number or text and clicking "Set Budget" shows a red error toast; budget does not change
- [ ] Entering `1500` and clicking "Set Budget" shows a green success toast: "Budget set to $1,500.00"
- [ ] After setting budget: Total Budget card shows `$1,500.00`; progress bar labels update
- [ ] Pressing Enter in the budget input also triggers Set Budget
- [ ] Budget input is cleared after successful save
- [ ] Refreshing the page restores the budget (LocalStorage persists)

### Add Expense

- [ ] Submitting the form with an empty description shows error: "Description is required." and focuses the description field
- [ ] Submitting with amount `0` or `-5` shows error: "Please enter a valid amount greater than 0."
- [ ] Submitting with no date shows error: "Please select a date."
- [ ] Adding a valid expense shows "Expense added!" toast
- [ ] New expense appears at the top of the expense list
- [ ] Summary cards (Total Spent, Remaining, Transactions) update immediately
- [ ] Progress bar width and color update immediately
- [ ] Donut chart gains or resizes a slice
- [ ] Bar chart gains or resizes a bar for today's date
- [ ] Form resets to empty state after submit; date defaults back to today
- [ ] Adding expense with description `<b>bold</b>` shows raw text (not bold formatting) — XSS safe

### Progress Bar States

- [ ] With $0 spent: bar is empty; status reads "Set a budget to track your spending." (if no budget) or remaining amount (if budget set)
- [ ] At ~40% spent: bar is blue gradient
- [ ] At ~85% spent: bar turns amber/yellow gradient; status shows percentage consumed
- [ ] At ≥ 100% spent: bar turns red gradient; status shows "⚠️ Over budget by $X.XX" in red text

### Summary Cards

- [ ] Total Budget, Total Spent, Remaining, and Transactions cards all show correct values
- [ ] Remaining is green when positive, amber/yellow when zero, red when negative
- [ ] All monetary values show two decimal places and thousands separator (e.g., `$1,234.56`)

### Donut Chart

- [ ] Chart shows "No expenses yet." placeholder when expense list is empty
- [ ] Each category gets a distinct color slice proportional to its total
- [ ] Donut center shows the total spending amount
- [ ] Legend shows emoji, category name, and percentage for each slice
- [ ] Chart updates immediately after adding or deleting an expense

### Bar Chart

- [ ] Chart shows "No expenses yet." placeholder when expense list is empty
- [ ] Bars render for each date that has expenses
- [ ] X-axis labels are in `M/D` format (e.g., `9/21`)
- [ ] Y-axis grid lines show dollar values; values ≥ $1000 appear as `$Xk`
- [ ] Bars have rounded top corners
- [ ] Dollar value labels appear inside taller bars
- [ ] Chart redraws correctly after browser window resize (no distortion)

### Expense List — Filter & Sort

- [ ] All 8 category options appear in the filter dropdown
- [ ] Selecting a category hides expenses from other categories
- [ ] With a category filter active and no matching expenses, shows "No expenses match the current filter."
- [ ] Removing filter ("All Categories") restores all expenses
- [ ] "Newest First" sort: most recent date at the top
- [ ] "Oldest First" sort: oldest date at the top
- [ ] "Highest Amount" sort: largest amount at the top
- [ ] "Lowest Amount" sort: smallest amount at the top

### Expense Item

- [ ] Category icon chip uses the correct emoji and background color for each category
- [ ] Description is truncated with ellipsis if long; full text visible on hover (`title` attribute)
- [ ] Metadata line shows `{Category} · {Mon DD, YYYY}` format
- [ ] Amount is displayed in red

### Delete Expense

- [ ] Clicking the trash icon opens the confirmation modal
- [ ] Modal shows the expense description and formatted amount
- [ ] Clicking "Cancel" closes the modal; expense is not deleted
- [ ] Clicking outside the modal (on the dark overlay) closes it; expense is not deleted
- [ ] Clicking "Delete" removes the expense; shows "Expense deleted." info toast
- [ ] All summary cards, progress bar, and both charts update after deletion

### Toast Notifications

- [ ] Toast appears in the bottom-right corner
- [ ] Success toast is green, error toast is red, info toast is blue
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Triggering a new action while a toast is visible replaces it immediately and resets the timer
- [ ] Toast uses slide-up animation on appearance

### Reset All Data

- [ ] "Reset" button is visible in the header at all times
- [ ] Clicking "Reset" opens the modal with title "Reset All Data" and irreversibility warning
- [ ] Clicking "Cancel" closes the modal; all data is preserved
- [ ] Clicking "Reset" in the modal clears all data; shows "All data cleared." info toast
- [ ] After reset: all cards show zero, charts show empty state, expense list shows empty state
- [ ] After reset: refreshing the page still shows zero state (LocalStorage cleared)
- [ ] After reset: modal title and button label revert to "Confirm Delete" / "Delete" for next expense deletion

### Responsive Layout

- [ ] At ≥ 901px: summary grid is 4 columns; charts side-by-side; form is 4 columns
- [ ] At 601px–900px: summary grid is 2 columns; charts stacked; form is 2 columns
- [ ] At ≤ 600px: form is 1 column (fully stacked); budget row stacks vertically; "Set Budget" button is full-width; list controls are full-width
- [ ] No horizontal scroll at any tested viewport width

### Accessibility

- [ ] Tab key navigates through all interactive elements in a logical order
- [ ] Pressing Enter in the budget input sets the budget
- [ ] Pressing Enter / Space on modal buttons activates them
- [ ] Form validation errors are announced by screen reader (via `aria-live="polite"` on `#form-error`)
- [ ] Toast notifications are announced by screen reader (via `role="alert"` and `aria-live="assertive"`)
- [ ] Delete buttons have descriptive labels (not just "Delete") — verifiable via browser accessibility inspector

### Data Integrity

- [ ] Adding 10+ expenses and refreshing the page restores all of them correctly
- [ ] LocalStorage key `ebv_expenses` contains a valid JSON array after adding an expense
- [ ] LocalStorage key `ebv_budget` contains a valid JSON number after setting a budget
- [ ] Manually corrupting a LocalStorage value (set to `"INVALID"`) and reloading the page does not crash the app; it falls back to empty defaults
