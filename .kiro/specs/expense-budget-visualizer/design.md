# Expense & Budget Visualizer — Design Specification

> **Stack:** Vanilla HTML5 · CSS3 · Vanilla JavaScript (ES6+) · Web Storage API · Canvas 2D  
> **Dependencies:** None (zero external libraries)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Model](#2-data-model)
3. [Component / Section Map](#3-component--section-map)
4. [State Management](#4-state-management)
5. [LocalStorage Strategy](#5-localstorage-strategy)
6. [Chart Rendering Design](#6-chart-rendering-design)
7. [UI Interaction Flows](#7-ui-interaction-flows)
8. [CSS Architecture](#8-css-architecture)
9. [Accessibility Considerations](#9-accessibility-considerations)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)

---

## 1. Architecture Overview

### 1.1 File Structure

```
project-root/
├── index.html          # Single HTML document — markup skeleton + semantic structure
├── css/
│   └── style.css       # All styling — design tokens, layout, components, responsive
└── js/
    └── app.js          # All application logic — state, DOM manipulation, charts, storage
```

The application is intentionally a **single-page, zero-build-step** design. There are no modules, bundlers, or frameworks. The three files are strictly separated by concern (structure, presentation, behaviour) and are linked in `index.html` via a `<link>` tag for CSS and a `<script>` tag at the bottom of `<body>` for JS.

### 1.2 How the Three Files Relate

```
index.html  ──────────────────────────────────────────────────────────────────
│  Provides the DOM tree that app.js queries at startup.                      │
│  All element IDs referenced in app.js exist in index.html.                  │
│  CSS classes applied by app.js are defined in style.css.                    │
└────────────────────┬──────────────────────────────────────────────────────┘
                     │ <link rel="stylesheet">        <script src="js/app.js">
                     ▼                                         ▼
             style.css                                      app.js
   Purely presentational.              Queries the DOM, reads/writes localStorage,
   No logic or state.                  manages in-memory state, handles all events,
   Custom properties serve as          and imperatively updates the DOM + canvases
   a design-token contract that        on every state change.
   app.js references by name
   (e.g. var(--color-danger)).
```

### 1.3 Data Flow

```
User Action
    │
    ▼
Event Listener (app.js)
    │
    ├─► Validates input
    │
    ├─► Mutates in-memory state (expenses[] / budget)
    │
    ├─► Persists to localStorage (saveExpenses() / saveBudget())
    │
    └─► updateAll()
            ├─► updateSummary()   → writes text/styles to DOM
            ├─► renderExpenseList() → replaces innerHTML of #expense-list
            ├─► drawDonut()       → repaints canvas #chart-donut
            └─► drawBar()         → repaints canvas #chart-bar
```

On page load, the flow is reversed: `loadData()` reads localStorage → populates `expenses[]` and `budget` → `updateAll()` renders the initial UI state.

---

## 2. Data Model

### 2.1 LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `ebv_expenses` | JSON string | Serialised array of expense objects |
| `ebv_budget` | JSON string | Serialised number (the monthly budget amount) |

The `ebv_` prefix namespaces the keys to avoid collisions with other apps running on the same origin.

### 2.2 Expense Object Schema

```js
{
  id:       string,   // Collision-resistant ID: Date.now().toString(36) + random base-36 suffix
  desc:     string,   // User-provided description, max 60 characters, HTML-escaped on render
  amount:   number,   // Positive float, stored as a JS number (not a string)
  category: string,   // One of the 8 valid category keys (see §2.4)
  date:     string,   // ISO 8601 date string "YYYY-MM-DD" (local, not UTC)
}
```

**Example:**
```json
{
  "id": "lq3k7a2xf",
  "desc": "Weekly groceries",
  "amount": 84.50,
  "category": "Food",
  "date": "2025-09-21"
}
```

### 2.3 Budget Schema

Budget is stored as a plain JSON number:
```json
1500
```
It is read back with `parseFloat(JSON.parse(rawBudget))` to guard against any accidental string coercion.

### 2.4 Valid Category Values

| Key | Display label | Emoji |
|-----|---------------|-------|
| `Food` | Food | 🍔 |
| `Transport` | Transport | 🚗 |
| `Housing` | Housing | 🏠 |
| `Health` | Health | 💊 |
| `Entertainment` | Entertainment | 🎬 |
| `Shopping` | Shopping | 🛍️ |
| `Utilities` | Utilities | ⚡ |
| `Other` | Other | 📦 |

These values are the canonical keys used in the `CATEGORY_ICONS` lookup, the `<select>` option `value` attributes, the filter dropdown, and the `cat-{Category}` CSS modifier classes.

### 2.5 Chart Color Palette

Eight colours are pre-assigned in insertion order for chart rendering (donut slices and implicit categories):

```js
['#4f6ef7', '#ef4444', '#22c55e', '#f59e0b',
 '#a855f7', '#06b6d4', '#f97316', '#64748b']
```

Color assignment wraps modulo the array length if there are more than 8 categories (defensive; the current set is exactly 8).

---

## 3. Component / Section Map

The page is divided into a fixed header, a single `<main>` containing five sections, a modal overlay, and a toast notification element.

### 3.1 High-Level HTML → JS → CSS Map

| HTML Element / ID | Purpose | JS Function(s) | CSS Class(es) |
|---|---|---|---|
| `header.header` | Sticky top bar with brand + reset button | — | `.header`, `.header-inner`, `.header-brand` |
| `#btn-reset` | Triggers reset confirmation modal | `btnReset` listener, `resetAll()` | `.btn`, `.btn-ghost` |
| `section.card.budget-card` | Budget input + progress bar | `setBudget()`, `updateSummary()` | `.budget-card`, `.budget-row` |
| `#input-budget` | Numeric budget input | `setBudget()` | `.input-prefix > input` |
| `#btn-set-budget` | Commits budget | `setBudget()` | `.btn`, `.btn-primary` |
| `#progress-bar` | Visual spend vs. budget bar | `updateSummary()` | `.progress-bar-fill`, `.warning`, `.danger` |
| `#progress-status` | Text status below progress bar | `updateSummary()` | `.progress-status`, `.over` |
| `section.summary-grid` | Four KPI cards | `updateSummary()` | `.summary-grid`, `.summary-card`, `.summary-{variant}` |
| `#sum-budget`, `#sum-spent`, `#sum-remaining`, `#sum-count` | KPI values | `updateSummary()` | `.summary-value` |
| `section.card > form#form-expense` | Add expense form | `addExpense()`, `setDefaultDate()` | `.expense-form`, `.form-row` |
| `#input-desc`, `#input-amount`, `#input-category`, `#input-date` | Expense form fields | `addExpense()` | `.input-group`, `.input-prefix` |
| `#form-error` | Inline form validation message | `addExpense()` | `.form-error` |
| `section.charts-grid` | Donut + bar chart container | — | `.charts-grid`, `.chart-card` |
| `#chart-donut` | Donut canvas | `drawDonut()` | — (canvas element) |
| `#chart-legend` | Donut legend | `drawDonut()` | `.chart-legend`, `.legend-item` |
| `#chart-empty` | Donut empty state | `drawDonut()` | `.chart-empty` |
| `#chart-bar` | Bar chart canvas | `drawBar()` | — (canvas element) |
| `#bar-empty` | Bar empty state | `drawBar()` | `.chart-empty` |
| `section.card > #expense-list` | Rendered expense items | `renderExpenseList()` | `.expense-list`, `.expense-item` |
| `#filter-category`, `#sort-expenses` | Filter/sort controls | `renderExpenseList()` via `getFilteredSorted()` | `.filter-select`, `.list-controls` |
| `#modal-overlay` | Confirmation modal backdrop | `confirmDelete()`, `closeModal()`, `resetAll()` | `.modal-overlay`, `.modal` |
| `#modal-cancel`, `#modal-confirm` | Modal action buttons | `closeModal()`, `deleteExpense()`, `resetAll()` | `.btn`, `.btn-ghost`, `.btn-danger` |
| `#toast` | Transient notification | `showToast()` | `.toast`, `.success`, `.error`, `.info` |

### 3.2 Expense Item DOM Structure (generated)

Each expense in `renderExpenseList()` produces:

```html
<div class="expense-item" data-id="{id}">
  <div class="expense-cat-icon cat-{Category}" aria-hidden="true">{emoji}</div>
  <div class="expense-info">
    <p class="expense-desc" title="{escaped desc}">{escaped desc}</p>
    <p class="expense-meta">{Category} · {formatted date}</p>
  </div>
  <span class="expense-amount">{formatted amount}</span>
  <button class="btn-icon expense-delete"
          aria-label="Delete expense {escaped desc}"
          data-id="{id}"
          title="Delete">🗑️</button>
</div>
```

The `data-id` attribute on both the wrapper `div` and the delete `button` enables event delegation on the parent `#expense-list`.

---

## 4. State Management

### 4.1 In-Memory State Variables

```js
let expenses        = [];   // Array<Expense> — the full expense dataset
let budget          = 0;    // number — current monthly budget (0 = unset)
let pendingDeleteId = null; // string|null — id of expense awaiting modal confirmation
let toastTimer      = null; // ReturnType<setTimeout>|null — handle for clearing the active toast
```

### 4.2 State Ownership

All state is module-scoped at the top of `app.js`. There are no classes, closures, or modules — the file executes as a single script scope.

### 4.3 State Synchronisation Pattern

State is **never mutated silently**. Every mutation follows this contract:

1. Mutate the variable (`expenses.push(…)` / `expenses = expenses.filter(…)` / `budget = val`).
2. Call the relevant persistence function (`saveExpenses()` / `saveBudget()`).
3. Call `updateAll()` to re-render the entire UI from the current state.

`updateAll()` is the single source of truth for DOM freshness:

```js
function updateAll() {
  updateSummary();      // KPI cards + progress bar
  renderExpenseList();  // filtered/sorted expense list
  drawDonut();          // category donut chart
  drawBar();            // daily bar chart
}
```

This "re-render everything on change" approach trades granular DOM diffing for simplicity. With typical expense counts (< 500), full re-render is imperceptible.

### 4.4 `pendingDeleteId` State Machine

```
null  ──(user clicks 🗑️)──► {expense id}  ──(modal confirm)──► null (after deleteExpense)
                                           ──(modal cancel) ──► null
```

For the **Reset** action, `pendingDeleteId` is explicitly set to `null` before opening the modal, and the `modalConfirm.onclick` handler is temporarily overridden to call `resetAll()` instead.

### 4.5 `toastTimer` Lifecycle

Each call to `showToast()` clears any existing timer before setting a new 3-second timeout. This prevents cascading toasts from accumulating and ensures the timer always reflects the most recently shown message.

---

## 5. LocalStorage Strategy

### 5.1 Load Lifecycle

`loadData()` is called once, at startup, inside `init()`:

```js
function loadData() {
  try {
    const rawExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    const rawBudget   = localStorage.getItem(STORAGE_KEY_BUDGET);
    expenses = rawExpenses ? JSON.parse(rawExpenses) : [];
    budget   = rawBudget   ? parseFloat(JSON.parse(rawBudget)) : 0;
  } catch {
    expenses = [];
    budget   = 0;
  }
}
```

- `JSON.parse` is wrapped in a `try/catch` to guard against corrupted or manually edited storage values.
- If either key is absent (first visit, or after a `localStorage.clear()`), safe defaults are used.
- `parseFloat` is applied to the budget after parsing to normalise any edge cases where the stored value might be a numeric string.

### 5.2 Save Lifecycle

Saves are **synchronous** and happen immediately after each mutation — there is no debouncing or batching:

| Trigger | Function called | Key written |
|---------|-----------------|-------------|
| Budget set | `saveBudget()` | `ebv_budget` |
| Expense added | `saveExpenses()` | `ebv_expenses` |
| Expense deleted | `saveExpenses()` | `ebv_expenses` |
| Reset all | `saveExpenses()` + `saveBudget()` | both keys |

### 5.3 Serialisation Format

- `expenses` → `JSON.stringify(expenses)` — produces a JSON array.
- `budget` → `JSON.stringify(budget)` — produces a JSON number (e.g. `"1500"`).

The entire `expenses` array is re-serialised on every save. For typical personal finance use (hundreds of expenses), this is negligible cost. A future optimisation could apply incremental updates, but this would add complexity without measurable benefit at this scale.

### 5.4 Storage Constraints

No explicit size checks are implemented. Browser localStorage limits are typically 5 MB. A rough upper bound: 500 expenses × ~150 bytes/expense ≈ 75 KB — well within limits. If storage quota is exceeded, the `try/catch` in `loadData()` would recover gracefully on the next load, though the failed `setItem` call itself is not caught in the save functions (a potential silent failure point in extreme edge cases).

---

## 6. Chart Rendering Design

Both charts use the **HTML5 Canvas 2D API** and are redrawn imperatively from scratch on every `updateAll()` call. There is no retained-mode chart state; `clearRect()` resets the canvas before each draw.

### 6.1 Donut Chart (`drawDonut()`)

#### Data Preparation

Expenses are aggregated by category into a `totals` map:
```js
{ Food: 320.50, Transport: 95.00, Housing: 1200.00, … }
```
Entries are sorted descending by value so the largest slice starts at the top.

#### Coordinate System

- Canvas dimensions: `260 × 260` px (fixed in the HTML attribute).
- Centre: `cx = W/2 = 130`, `cy = H/2 = 130`.
- Outer radius: `outerR = Math.min(W, H) / 2 - 8` = `122 px`.
- Inner radius (donut hole): `innerR = outerR * 0.55` ≈ `67 px`.
- Start angle: `-Math.PI / 2` (12 o'clock position).

#### Drawing Algorithm

For each category slice:
1. Compute the arc sweep: `slice = (val / grand) * 2π`.
2. Draw a filled `arc()` segment from `angle` to `angle + slice`.
3. Draw a 1 px white gap arc over the slice boundary to visually separate slices.
4. Advance `angle += slice`.

After all slices:
5. Draw a filled white circle of radius `innerR` centred at `(cx, cy)` to create the donut hole.
6. Render centered text (`formatCurrency(grand)`) at `(cx, cy)` for the grand total label.

#### Legend

The legend is rendered as HTML (not canvas) in `#chart-legend`, one `div.legend-item` per category. Each item shows a colored dot (inline `background` style), emoji + category name, and percentage.

### 6.2 Bar Chart (`drawBar()`)

#### Data Preparation

Expenses are aggregated by date into a `dailyMap`:
```js
{ "2025-09-18": 45.00, "2025-09-20": 120.50, … }
```
Dates are sorted ascending and the most recent **14 days with data** are selected (`Object.keys(dailyMap).sort().slice(-14)`). Note: days with no expenses are skipped (the chart only plots days that have at least one transaction).

#### Dynamic Canvas Sizing

Unlike the donut, the bar chart canvas is **dynamically sized** to match its container width:
```js
const W = container.clientWidth || 400;
canvasBar.width  = W;
canvasBar.height = H;   // H = 220 (fixed)
```
This makes the bar chart fully responsive. On `window.resize` (debounced to 120 ms), both charts are redrawn.

#### Padding & Layout Constants

```
padL = 56    Left padding (Y-axis label space)
padR = 16    Right padding
padT = 16    Top padding
padB = 42    Bottom padding (X-axis label space)

chartW = W - padL - padR   Drawable width
chartH = H - padT - padB   Drawable height (= 162 px at H=220)
```

#### Grid Lines & Y-Axis Labels

Four horizontal grid lines are evenly distributed across `chartH`. For each grid line `i` (0 to 4):
- `y = padT + chartH - (i / 4) * chartH`
- Label value: `(maxVal / 4) * i`, formatted as `$X` or `$Xk` for values ≥ 1000.

#### Bar Positioning

```
gap  = chartW / numberOfDates       // slot width per date
barW = max(8, floor(gap * 0.6))     // bar pixel width, min 8px
x    = padL + i * gap + (gap - barW) / 2  // centres the bar within its slot
```

#### Bar Height Calculation

```
barH = maxVal > 0 ? (val / maxVal) * chartH : 0
y    = padT + chartH - barH   // top-left y of the bar
```

#### Rounded Top Corners (`roundRect()`)

The helper `roundRect(ctx, x, y, w, h, r)` draws a path with rounded top corners only (the bottom corners are square, sitting on the axis baseline):
- Top-left and top-right corners use `quadraticCurveTo()`.
- `r` is clamped to `min(r, h/2, w/2)` to prevent negative values on very short bars.
- If `h <= 0`, the function returns early (no path drawn).

#### Value Labels

When a bar is taller than 18 px, a white value label (`$X`) is drawn inside the bar near the top (`textBaseline = 'bottom'`, positioned at `y + barH - 4`).

#### X-Axis Labels

Date labels are formatted as `M/D` (e.g. `9/21`) and drawn below each bar at `y = padT + chartH + 6`.

---

## 7. UI Interaction Flows

### 7.1 Add Expense

```
1. User fills in form fields:
   - #input-desc       (text, max 60 chars)
   - #input-amount     (number, min 0.01)
   - #input-category   (select, defaults to "Food")
   - #input-date       (date, pre-filled with today)

2. User submits form (clicks "+ Add Expense" button or presses Enter in a field).

3. addExpense(e) is called:
   a. e.preventDefault() — prevents page reload.
   b. #form-error is cleared.
   c. Validation:
      - If desc is empty → set #form-error text, focus #input-desc, return.
      - If amount is NaN or ≤ 0 → set #form-error text, focus #input-amount, return.
      - If date is empty → set #form-error text, focus #input-date, return.
   d. Construct expense object with generateId().
   e. expenses.unshift(expense) — new expenses appear at the top of the list.
   f. saveExpenses() — persist to localStorage.
   g. formExpense.reset() — clear all fields.
   h. setDefaultDate() — re-apply today's date to #input-date.
   i. updateAll() — re-render UI.
   j. showToast('Expense added!', 'success').
```

### 7.2 Delete Expense

```
1. User clicks 🗑️ button on an expense item.

2. Event delegation on #expense-list fires:
   a. e.target.closest('.expense-delete') resolves the button.
   b. confirmDelete(btn.dataset.id) is called.

3. confirmDelete(id):
   a. Looks up the expense by id in expenses[].
   b. Sets pendingDeleteId = id.
   c. Populates #modal-message with the expense desc and amount.
   d. Removes 'hidden' class from #modal-overlay → modal appears.

4a. User clicks "Cancel" (or clicks outside the modal):
    - closeModal() sets pendingDeleteId = null, adds 'hidden' back.

4b. User clicks "Delete":
    - modalConfirm click handler calls deleteExpense(pendingDeleteId).
    - deleteExpense(id):
        a. expenses = expenses.filter(e => e.id !== id)
        b. saveExpenses()
        c. updateAll()
        d. showToast('Expense deleted.', 'info')
    - closeModal()
```

### 7.3 Set Budget

```
1. User enters a value in #input-budget.

2. User clicks "Set Budget" or presses Enter.

3. setBudget():
   a. parseFloat(inputBudget.value).
   b. If NaN or < 0 → showToast('Please enter a valid budget amount.', 'error'), return.
   c. budget = val.
   d. saveBudget().
   e. inputBudget.value = '' — clear the input.
   f. updateAll().
   g. showToast('Budget set to $X.XX', 'success').
```

### 7.4 Reset All Data

```
1. User clicks "Reset" in the header.

2. btnReset listener:
   a. Sets pendingDeleteId = null.
   b. Overrides #modal-title text to "Reset All Data".
   c. Overrides #modal-message text to warn about irreversibility.
   d. Overrides #modal-confirm.textContent to "Reset".
   e. Temporarily overrides modalConfirm.onclick to call resetAll() instead of deleteExpense.
   f. Removes 'hidden' from #modal-overlay.

3a. User clicks "Cancel":
    - closeModal() as normal.

3b. User clicks "Reset":
    - resetAll():
        a. expenses = []
        b. budget = 0
        c. saveExpenses() + saveBudget()
        d. updateAll()
        e. closeModal()
        f. showToast('All data cleared.', 'info')
    - Restore modalConfirm.textContent to "Delete".
    - Restore modalConfirm.onclick to null (falls through to the default handler).
```

### 7.5 Filter by Category

```
1. User changes #filter-category select.

2. 'change' event fires → renderExpenseList() is called directly (not updateAll()).

3. getFilteredSorted():
   a. If value is 'all' → list = [...expenses] (shallow copy).
   b. Otherwise → list = expenses.filter(e => e.category === selectedValue).
   c. Apply sort (see §7.6).
   d. Return list.

4. expenseList.innerHTML is replaced with the filtered list.
   (Charts and summary are NOT re-rendered — filter only affects the list display.)
```

### 7.6 Sort Expenses

```
1. User changes #sort-expenses select.

2. 'change' event fires → renderExpenseList() is called.

3. getFilteredSorted() applies sort after filtering:
   - 'date-desc'   → sort by date string descending (b.date.localeCompare(a.date))
   - 'date-asc'    → sort by date string ascending
   - 'amount-desc' → sort by amount descending (b.amount - a.amount)
   - 'amount-asc'  → sort by amount ascending

Note: date strings in ISO "YYYY-MM-DD" format sort correctly as plain strings.
Note: filter and sort operate on the in-memory expenses[] array; localStorage is not touched.
```

---

## 8. CSS Architecture

### 8.1 Custom Properties (Design Tokens)

All visual constants are defined in `:root` and referenced throughout the stylesheet. Organised into semantic groups:

**Color tokens:**
```css
--color-bg:            #f4f6fb   /* page background */
--color-surface:       #ffffff   /* card / input background */
--color-primary:       #4f6ef7   /* brand blue — buttons, focus rings, progress bar */
--color-primary-dark:  #3a56d4   /* primary hover state */
--color-danger:        #ef4444   /* errors, delete, over-budget */
--color-danger-dark:   #dc2626   /* danger hover state */
--color-success:       #22c55e   /* positive states, remaining budget */
--color-warning:       #f59e0b   /* 80%+ budget usage, transaction count */
--color-text:          #1e2330   /* primary body text */
--color-text-muted:    #6b7280   /* labels, secondary text */
--color-border:        #e5e7eb   /* borders, dividers */
--color-budget:        #4f6ef7   /* summary card accent (same as primary) */
--color-spent:         #ef4444   /* summary card accent (same as danger) */
--color-remaining:     #22c55e   /* summary card accent (same as success) */
```

**Spacing / Shape tokens:**
```css
--radius-sm: 6px    /* inputs, buttons, small badges */
--radius-md: 12px   /* summary cards, expense items */
--radius-lg: 16px   /* main cards, modal */
```

**Shadow tokens:**
```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.07)    /* resting elevation */
--shadow-md: 0 4px 16px rgba(0,0,0,0.08)   /* hover elevation */
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12)   /* modal / toast */
```

**Typography:**
```css
--font-sans: 'Segoe UI', system-ui, -apple-system, sans-serif
--transition: 0.18s ease   /* used on interactive elements */
```

### 8.2 Layout System

The page layout uses **CSS Flexbox** and **CSS Grid** exclusively — no floats or positioning hacks.

| Section | Layout | Details |
|---------|--------|---------|
| `header-inner` | Flexbox | `justify-content: space-between` — brand left, reset button right |
| `main` | Flexbox column | `gap: 20px` — sections stack vertically |
| `budget-row` | Flexbox | Input + button side by side, wraps on mobile |
| `summary-grid` | CSS Grid | `repeat(4, 1fr)` → `repeat(2, 1fr)` at 900px |
| `form-row` | CSS Grid | `2fr 1fr 1fr 1fr` → `1fr 1fr` at 900px → `1fr` at 600px |
| `charts-grid` | CSS Grid | `1fr 1.6fr` (donut narrower) → `1fr` stacked at 900px |
| `expense-list` | Flexbox column | `gap: 10px` — expense items stack vertically |
| `expense-item` | Flexbox | Icon · info · amount · delete button in a row |
| `list-header` | Flexbox | Title left, controls right; wraps on mobile |
| `modal-actions` | Flexbox | `justify-content: flex-end` — Cancel · Delete aligned right |

### 8.3 Responsive Breakpoints

Two breakpoints are defined, using `max-width` media queries:

**≤ 900px (Tablet / Large Mobile):**
- `summary-grid` → 2 columns.
- `charts-grid` → single column (donut above bar).
- `form-row` → 2 columns.

**≤ 600px (Small Mobile):**
- `main` padding reduced to `16px 14px`.
- `header-inner` padding reduced to `0 14px`.
- `summary-grid` stays 2 columns, gap reduced.
- `form-row` → 1 column (fully stacked).
- `budget-row` → column direction, button becomes full-width.
- `list-header` → column direction.
- `list-controls` → full-width, selects grow via `flex: 1`.

### 8.4 Naming Convention (BEM-like)

The project uses a **flat BEM-influenced** naming convention. There are no strict BEM blocks, but the pattern follows `block`, `block-element`, and `block--modifier` (with hyphens throughout, no underscores):

| Pattern | Example | Role |
|---------|---------|------|
| Block | `.card`, `.modal`, `.toast` | Standalone component |
| Block-element | `.card-title`, `.modal-title`, `.expense-item` | Child of block |
| Block-element | `.expense-desc`, `.expense-meta`, `.expense-amount` | Deeper child |
| Modifier (append) | `.btn-primary`, `.btn-danger`, `.btn-ghost` | Variant |
| State modifier | `.progress-bar-fill.warning`, `.progress-bar-fill.danger` | Dynamic state class |
| Category modifier | `.cat-Food`, `.cat-Transport`, …  | Data-driven variant |
| Summary variant | `.summary-budget`, `.summary-spent`, `.summary-remaining`, `.summary-count` | Left-border color |
| Toast variant | `.toast.success`, `.toast.error`, `.toast.info` | Notification type |

### 8.5 CSS Animations

| Name | Trigger | Definition |
|------|---------|------------|
| `modal-in` | Modal opens | `opacity: 0 + scale(0.95) translateY(8px)` → `opacity: 1 + scale(1) translateY(0)`, 0.18s ease |
| `toast-in` | Toast shows | `opacity: 0 + translateY(12px)` → `opacity: 1 + translateY(0)`, 0.22s ease |
| Progress bar width | `updateSummary()` writes `style.width` | CSS `transition: width 0.4s ease` provides animated fill |
| Interactive hover | `:hover` / `:active` states | `--transition: 0.18s ease` applied to background, transform, box-shadow |

---

## 9. Accessibility Considerations

### 9.1 Semantic HTML

- The page uses `<header>`, `<main>`, `<section>`, `<form>`, `<h1>`–`<h3>` hierarchy, and native `<button>` and `<input>` elements throughout.
- `<h1>` is in the header; all section headings are `<h2>` inside `.card` sections; the modal heading is `<h3>`.
- Native `<form>` submit semantics allow keyboard submission via Enter.
- Native `<select>` elements are used for category and sort controls.

### 9.2 ARIA Attributes

| Element | Attribute | Value | Purpose |
|---------|-----------|-------|---------|
| `#modal-overlay` | `role` | `"dialog"` | Identifies as a dialog widget |
| `#modal-overlay` | `aria-modal` | `"true"` | Tells screen readers focus is trapped |
| `#modal-overlay` | `aria-labelledby` | `"modal-title"` | Links modal to its heading |
| `#chart-donut` | `role` | `"img"` | Canvas as image landmark |
| `#chart-donut` | `aria-label` | `"Donut chart of spending by category"` | Descriptive text for canvas |
| `#chart-bar` | `role` | `"img"` | Canvas as image landmark |
| `#chart-bar` | `aria-label` | `"Bar chart of daily spending"` | Descriptive text for canvas |
| `#form-error` | `aria-live` | `"polite"` | Announces validation errors without interrupting |
| `#toast` | `role` | `"alert"` | Maps to ARIA live region |
| `#toast` | `aria-live` | `"assertive"` | Announces notifications immediately |
| `.expense-cat-icon` | `aria-hidden` | `"true"` | Decorative emoji not read aloud |
| `.expense-delete` buttons | `aria-label` | `"Delete expense {desc}"` | Unique, descriptive label per button |

### 9.3 Keyboard Support

| Interaction | Keyboard mechanism |
|-------------|-------------------|
| Tab navigation | All interactive elements are focusable in DOM order |
| Budget input | `keydown` listener on `#input-budget` fires `setBudget()` on Enter |
| Form submission | Standard `<form>` submit — Enter in any field submits |
| Modal cancel | Tab to "Cancel" button, press Enter/Space |
| Modal confirm | Tab to "Delete"/"Reset" button, press Enter/Space |
| Modal dismiss | Clicking `#modal-overlay` backdrop closes the modal (mouse only; not keyboard) |
| Filter/sort | Native `<select>` — fully keyboard accessible |

**Known gap:** The modal backdrop click-to-close does not have a keyboard equivalent (e.g., Escape key is not handled). Full keyboard trap within the modal is not implemented.

### 9.4 Focus Indicators

Focus rings are provided by the browser's default `:focus` outline. The CSS adds a custom `box-shadow` focus ring on inputs and selects:
```css
box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.12);
```
Buttons rely on the browser default (the CSS does not suppress `outline: none` on buttons).

### 9.5 Color & Contrast

- Primary text (`#1e2330`) on surface (`#ffffff`): high contrast (exceeds WCAG AA).
- Muted text (`#6b7280`) on white: approximately 4.6:1 — passes AA for normal text.
- Error/danger text (`#ef4444`) on white: approximately 3.9:1 — marginally below AA for small text; acceptable for large or bold text. Error messages use 13px font (borderline).
- White text on `.toast.success` (`#15803d`): high contrast.
- White text on `.btn-primary` (`#4f6ef7`): approximately 3.0:1 — below AA. An accessibility improvement would be a slightly darker primary color.

### 9.6 Screen Reader Support

- Live regions (`aria-live="polite"` on `#form-error`, `aria-live="assertive"` on `#toast`) ensure validation and notification messages are announced.
- Canvas charts have descriptive `aria-label` attributes. However, no textual data table fallback is provided — screen reader users cannot access the underlying chart data. A future enhancement would be a visually hidden `<table>` summarising chart data.
- Expense delete buttons have unique `aria-label` values (`"Delete expense {desc}"`), preventing the ambiguity of multiple identical "Delete" labels.

---

## 10. Error Handling & Edge Cases

### 10.1 Form Validation

Validation is performed **imperatively** in `addExpense()` before any state mutation. Errors are displayed in `#form-error` (aria-live polite) and focus is moved to the offending field:

| Condition | Message | Focus target |
|-----------|---------|--------------|
| Empty description | "Description is required." | `#input-desc` |
| Amount is NaN or ≤ 0 | "Please enter a valid amount greater than 0." | `#input-amount` |
| Missing date | "Please select a date." | `#input-date` |

The form uses `novalidate` to suppress browser-native validation UI and provide a consistent custom experience.

### 10.2 Budget Validation

`setBudget()` checks for NaN or negative values. A budget of `0` is technically allowed (it represents "unset" semantically, as the progress status shows "Set a budget to track your spending.").

### 10.3 LocalStorage Corruption

`loadData()` wraps both `JSON.parse` calls in a single `try/catch`. If either key contains unparseable JSON, the entire state falls back to `expenses = []`, `budget = 0`. The corrupted data is silently discarded and replaced with clean state on the next save.

**Risk:** If only `ebv_budget` is corrupted but `ebv_expenses` is valid, both are reset. A more robust approach would parse them independently in separate try/catch blocks.

### 10.4 Empty States

| Scenario | Display |
|----------|---------|
| No expenses added yet | `#expense-list` shows "No expenses yet. Add one above!" |
| Active filter matches nothing | `#expense-list` shows "No expenses match the current filter." |
| No expenses for donut chart | `#chart-empty` is shown; canvas is hidden |
| No expenses for bar chart | `#bar-empty` is shown; canvas is hidden |

### 10.5 Over-Budget State

When total spent exceeds budget:
- `progressBar` fills to 100% and gains class `danger` (red gradient).
- `#progress-status` shows "⚠️ Over budget by $X.XX" with class `over` (red text, bold).
- `sumRemaining` value is shown in `var(--color-danger)` (negative remaining amounts are allowed — they display as e.g. `-$50.00`).

### 10.6 XSS Prevention

All user-supplied strings rendered into `innerHTML` are passed through `escapeHtml()`:
```js
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```
Applied to `expense.desc` in: the expense item's `<p class="expense-desc">` content, the `title` attribute, and the delete button's `aria-label`.

The `amount`, `category`, and `date` fields are numeric/enum/ISO date values with no free-text user input, so they do not require escaping.

### 10.7 Chart Rendering Edge Cases

| Condition | Behaviour |
|-----------|-----------|
| All expenses in one category | Donut renders a single full ring |
| Single expense date | Bar chart shows one bar |
| Bar with `barH = 0` | `roundRect()` returns early — no path drawn |
| `maxVal = 0` | `barH = 0` for all bars (guarded: `maxVal > 0 ? … : 0`) |
| Window resize | `drawBar()` is redrawn with the new container width after a 120 ms debounce; `drawDonut()` is also redrawn (its size is fixed, but the call is harmless) |
| Very short bar (barH ≤ 18) | Value label on bar is omitted to prevent overflow |

### 10.8 ID Collision

`generateId()` combines `Date.now().toString(36)` with a 5-character random base-36 string. The probability of collision is astronomically low in single-user, single-session usage. No collision detection is implemented, as it would add complexity with no practical benefit.

### 10.9 Date Handling

Dates are stored as ISO strings (`YYYY-MM-DD`). When rendering, they are parsed as:
```js
new Date(date + 'T00:00:00')
```
The explicit `T00:00:00` suffix forces local-timezone parsing, preventing the off-by-one-day bug that occurs when `new Date('YYYY-MM-DD')` is interpreted as UTC midnight (which rolls back one day in timezones behind UTC).

### 10.10 Modal State After Reset

After the Reset modal is confirmed, the `onclick` override is cleaned up:
```js
modalConfirm.textContent = 'Delete';
document.getElementById('modal-title').textContent = 'Confirm Delete';
modalConfirm.onclick = null;
```
This restores the modal to its default delete-confirmation state for subsequent uses. The primary `click` event listener (registered via `addEventListener`) handles the delete path when `modalConfirm.onclick` is `null`.
