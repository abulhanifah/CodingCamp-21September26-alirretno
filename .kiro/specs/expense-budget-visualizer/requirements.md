# Expense & Budget Visualizer — Requirements Specification

**Version:** 1.0  
**Date:** 2025  
**Status:** Draft

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Goals](#2-goals)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Constraints](#6-technical-constraints)

---

## 1. Introduction

### 1.1 Purpose

This document defines the requirements for the **Expense & Budget Visualizer**, a standalone client-side web application that enables individuals to set a monthly budget, record expenses, and visualize spending patterns — all without any server infrastructure or third-party dependencies.

### 1.2 Scope

The application is a single-page web app (SPA) delivered as static files (`index.html`, `css/style.css`, `js/app.js`). It runs entirely in the user's browser, persists all data via the browser's `localStorage` API, and requires no build tools, network connection, or backend service to function.

### 1.3 Background

Many personal finance tools require account registration, cloud connectivity, or native app installation. This application targets users who want a lightweight, zero-setup tool that works immediately in a browser — on desktop or mobile — without surrendering any data to a third party.

### 1.4 Definitions & Abbreviations

| Term | Definition |
|------|-----------|
| **Expense** | A single recorded spending transaction with description, amount, category, and date |
| **Budget** | A user-defined monetary ceiling for spending within the current month |
| **Category** | A predefined classification tag for an expense (e.g., Food, Transport) |
| **LocalStorage** | Browser-native key-value persistence API (`window.localStorage`) |
| **Canvas API** | Browser-native 2D drawing API (`<canvas>` element + `CanvasRenderingContext2D`) |
| **Toast** | A transient, non-blocking notification message shown in the corner of the screen |
| **SPA** | Single-Page Application — all UI rendered in one HTML document |

---

## 2. Goals

### 2.1 Primary Goals

1. **Frictionless budget tracking** — allow users to set a monthly budget and add expenses in seconds, with no account required.
2. **At-a-glance financial awareness** — surface key metrics (total budget, total spent, remaining balance, transaction count) as summary cards visible on page load.
3. **Visual spending insight** — render a donut chart (spending by category) and a bar chart (daily spending trend over the last 14 days) using only the browser's native Canvas API.
4. **Full data ownership** — store all data exclusively in `localStorage`; no data is ever transmitted to a server.
5. **Universal device access** — deliver a fully responsive layout that works on mobile phones, tablets, and desktop browsers.

### 2.2 Secondary Goals

- Keep the codebase simple and dependency-free so any developer can read and modify it without a build step.
- Provide clear user feedback through toast notifications and confirmation modals for every destructive action.
- Maintain a clean, minimal UI aesthetic with consistent visual hierarchy and readable typography.

### 2.3 Out of Scope

- User authentication or multi-user support
- Cloud synchronization or remote data backup
- Multi-month or annual budget views
- Currency conversion or multi-currency support
- Import/export of expense data (CSV, JSON)
- Recurring expenses or automatic transaction entry
- Third-party charting libraries (Chart.js, D3.js, etc.)

---

## 3. User Stories & Acceptance Criteria

### US-1 — Set Monthly Budget

**As a** user,  
**I want to** enter a monthly spending budget,  
**so that** the app can track how much of my budget I have consumed.

**Acceptance Criteria:**

- **AC-1.1** The budget input field accepts positive numeric values (including decimals).
- **AC-1.2** Clicking "Set Budget" or pressing `Enter` in the input field saves the budget to `localStorage`.
- **AC-1.3** After saving, all summary cards and the progress bar update immediately to reflect the new budget without a page reload.
- **AC-1.4** If the user enters a non-numeric value or a negative number, a toast notification with type `error` is displayed and the budget is not updated.
- **AC-1.5** The input field is cleared after a successful budget save.
- **AC-1.6** A success toast showing the newly set budget amount is displayed after a successful save.
- **AC-1.7** The budget persists across page reloads (loaded from `localStorage` on init).

---

### US-2 — Add an Expense

**As a** user,  
**I want to** add an expense with a description, amount, category, and date,  
**so that** I can keep a record of where my money goes.

**Acceptance Criteria:**

- **AC-2.1** The add-expense form contains four fields: Description (text), Amount (number), Category (dropdown), and Date (date picker).
- **AC-2.2** Description is required; submitting with an empty description shows a validation error and focuses the description field.
- **AC-2.3** Amount must be a positive number greater than 0; an invalid or zero amount shows a validation error and focuses the amount field.
- **AC-2.4** Date is required; submitting without a date shows a validation error and focuses the date field.
- **AC-2.5** On successful submission, the expense is saved to `localStorage` and prepended to the expense list.
- **AC-2.6** The form is reset to its default state after a successful submission; the date field defaults to today's date.
- **AC-2.7** A success toast "Expense added!" is displayed after a successful submission.
- **AC-2.8** All summary cards, progress bar, and both charts update immediately after the expense is added.
- **AC-2.9** Validation error messages are cleared on the next successful submission.
- **AC-2.10** Category defaults to "Food" if no selection is made.
- **AC-2.11** Description is capped at 60 characters.

---

### US-3 — View Summary Dashboard

**As a** user,  
**I want to** see a dashboard with key financial metrics,  
**so that** I can quickly understand my budget status at a glance.

**Acceptance Criteria:**

- **AC-3.1** Four summary cards are always visible: Total Budget, Total Spent, Remaining, and Transactions.
- **AC-3.2** All monetary values are formatted as USD with two decimal places (e.g., `$1,234.56`).
- **AC-3.3** The Remaining value is displayed in green when positive, yellow/orange when zero, and red when negative (over budget).
- **AC-3.4** Transaction count displays the total number of recorded expenses.
- **AC-3.5** All card values update in real time whenever expenses or the budget change.

---

### US-4 — Track Budget via Progress Bar

**As a** user,  
**I want to** see a progress bar that shows how much of my budget I have spent,  
**so that** I can quickly gauge if I am approaching my limit.

**Acceptance Criteria:**

- **AC-4.1** The progress bar width represents the percentage of budget consumed (capped at 100% visually).
- **AC-4.2** The bar displays in the default primary color (blue) when spending is below 80% of budget.
- **AC-4.3** The bar changes to a warning color (amber/yellow gradient) when spending reaches 80%–99% of budget.
- **AC-4.4** The bar changes to a danger color (red gradient) when spending reaches or exceeds 100% of budget.
- **AC-4.5** A text label below the bar shows:
  - "Set a budget to track your spending." when no budget is set.
  - The remaining amount and percentage left when spending is below 80%.
  - The percentage consumed when spending is 80%–99%.
  - An over-budget warning with the overage amount when spending exceeds the budget.
- **AC-4.6** Labels above the bar display current spent amount on the left and the total budget on the right.
- **AC-4.7** The bar width transitions smoothly (CSS transition) when values change.

---

### US-5 — View Spending Breakdown (Donut Chart)

**As a** user,  
**I want to** see a donut chart of my spending broken down by category,  
**so that** I can identify which categories consume the most of my budget.

**Acceptance Criteria:**

- **AC-5.1** A donut chart is rendered on the `<canvas>` element using the Canvas 2D API — no external charting libraries.
- **AC-5.2** Each slice represents one category; slice size is proportional to the category's total spending.
- **AC-5.3** Each category is assigned a distinct color from a predefined color palette.
- **AC-5.4** The donut center displays the total spending amount.
- **AC-5.5** A color-coded legend is displayed alongside the chart, showing the category name, emoji icon, and percentage of total spending.
- **AC-5.6** When there are no expenses, the canvas is hidden and a placeholder message ("No expenses yet.") is shown.
- **AC-5.7** The chart re-renders whenever expenses are added or deleted.

---

### US-6 — View Daily Spending Trend (Bar Chart)

**As a** user,  
**I want to** see a bar chart of my daily spending over the last 14 days,  
**so that** I can spot days with unusually high spending.

**Acceptance Criteria:**

- **AC-6.1** A bar chart is rendered on the `<canvas>` element using the Canvas 2D API — no external charting libraries.
- **AC-6.2** The chart displays only days that have at least one expense, up to the 14 most recent expense dates.
- **AC-6.3** Each bar is labeled on the x-axis with the date in `MM/DD` format.
- **AC-6.4** The y-axis displays evenly spaced grid lines with dollar-value labels (values ≥ $1000 are abbreviated as `$Xk`).
- **AC-6.5** Bars have rounded top corners.
- **AC-6.6** A dollar value label appears inside bars tall enough to accommodate it.
- **AC-6.7** When there are no expenses, the canvas is hidden and a placeholder message is shown.
- **AC-6.8** The chart re-renders and re-sizes responsively when the browser window is resized.
- **AC-6.9** The chart re-renders whenever expenses are added or deleted.

---

### US-7 — Filter and Sort Expense List

**As a** user,  
**I want to** filter expenses by category and sort them by date or amount,  
**so that** I can quickly find specific transactions.

**Acceptance Criteria:**

- **AC-7.1** A category filter dropdown allows the user to select "All Categories" or any individual category.
- **AC-7.2** When a category is selected, only expenses in that category are shown; other categories are hidden.
- **AC-7.3** A sort dropdown provides four options: Newest First, Oldest First, Highest Amount, Lowest Amount.
- **AC-7.4** The list re-renders immediately when either the filter or sort selection changes.
- **AC-7.5** If no expenses match the current filter, the message "No expenses match the current filter." is shown.
- **AC-7.6** Each expense item shows: category emoji icon, description, category name, date (formatted as `Mon DD, YYYY`), and amount.
- **AC-7.7** Long descriptions are truncated with an ellipsis and the full text is accessible via the `title` attribute.
- **AC-7.8** Amounts are displayed in red to indicate money spent.

---

### US-8 — Delete an Expense

**As a** user,  
**I want to** delete an expense after confirming my intent,  
**so that** I can remove incorrect or unwanted entries without accidental data loss.

**Acceptance Criteria:**

- **AC-8.1** Each expense item has a delete button (trash icon).
- **AC-8.2** Clicking the delete button opens a confirmation modal before any deletion occurs.
- **AC-8.3** The modal displays the expense description and amount to help the user confirm the correct item.
- **AC-8.4** Clicking "Cancel" closes the modal without deleting anything.
- **AC-8.5** Clicking outside the modal (on the overlay) also closes it without deleting anything.
- **AC-8.6** Clicking "Delete" in the modal removes the expense from `localStorage` and dismisses the modal.
- **AC-8.7** An info toast "Expense deleted." is displayed after successful deletion.
- **AC-8.8** All summary cards, progress bar, and both charts update immediately after deletion.

---

### US-9 — Reset All Data

**As a** user,  
**I want to** reset all expenses and the budget in one action,  
**so that** I can start fresh at the beginning of a new month.

**Acceptance Criteria:**

- **AC-9.1** A "Reset" button is visible in the page header at all times.
- **AC-9.2** Clicking "Reset" opens the confirmation modal with a clear warning that all data will be permanently deleted.
- **AC-9.3** Clicking "Cancel" closes the modal without resetting any data.
- **AC-9.4** Clicking "Reset" in the modal clears all expenses and the budget from `localStorage`.
- **AC-9.5** All UI elements (summary cards, progress bar, charts, expense list) revert to their empty/zero state immediately.
- **AC-9.6** An info toast "All data cleared." is displayed after the reset.

---

### US-10 — Receive Toast Notifications

**As a** user,  
**I want to** receive brief, non-blocking notifications when I perform an action,  
**so that** I always know whether an action succeeded or failed.

**Acceptance Criteria:**

- **AC-10.1** Toast notifications appear in the bottom-right corner of the screen.
- **AC-10.2** Toasts auto-dismiss after 3 seconds.
- **AC-10.3** A new toast replaces any existing visible toast immediately (no queuing).
- **AC-10.4** Toast appearance reflects type: success (green), error (red), info (primary blue).
- **AC-10.5** Toasts appear with a slide-up animation.
- **AC-10.6** Toast text is set as `role="alert"` with `aria-live="assertive"` for screen reader accessibility.

---

### US-11 — Use the App on Any Device

**As a** user,  
**I want to** use the app comfortably on mobile, tablet, and desktop,  
**so that** I can log expenses from any device.

**Acceptance Criteria:**

- **AC-11.1** The layout adapts to three breakpoints: desktop (≥ 901px), tablet (601px–900px), and mobile (≤ 600px).
- **AC-11.2** On desktop, the summary grid shows 4 columns; on tablet and mobile, it collapses to 2 columns.
- **AC-11.3** On desktop, the charts are side-by-side (donut left, bar right); on tablet and mobile, they stack vertically.
- **AC-11.4** The add-expense form uses a 4-column row on desktop, 2-column on tablet, and 1-column on mobile.
- **AC-11.5** The budget input row stacks vertically on mobile with the "Set Budget" button spanning full width.
- **AC-11.6** The bar chart canvas resizes to fit its container width on viewport resize.

---

## 4. Functional Requirements

### FR-1 — Budget Management

**FR-1.1** The application shall allow the user to input a non-negative numeric budget value.  
**FR-1.2** The application shall save the budget value to `localStorage` under the key `ebv_budget` as a JSON-serialized number.  
**FR-1.3** The application shall load the budget from `localStorage` on initialization.  
**FR-1.4** The application shall recalculate and re-render all budget-dependent UI immediately after a budget change.  
**FR-1.5** The application shall validate the budget input and reject non-numeric or negative values with an error toast.

---

### FR-2 — Expense Creation

**FR-2.1** The application shall provide a form with four fields: Description (text, max 60 chars), Amount (positive number), Category (select), and Date (date input).  
**FR-2.2** The application shall validate all fields on submission and display inline error messages for any failed validation.  
**FR-2.3** The application shall generate a unique ID for each expense using a combination of `Date.now()` and a random alphanumeric suffix.  
**FR-2.4** The application shall store each expense as a JSON object with properties: `id`, `desc`, `amount`, `category`, and `date` (ISO 8601 `YYYY-MM-DD` string).  
**FR-2.5** The application shall prepend new expenses to the in-memory array so the most recent expense appears first in the default list view.  
**FR-2.6** The application shall persist the full expenses array to `localStorage` under the key `ebv_expenses` after every add or delete operation.  
**FR-2.7** The date input shall default to today's date on page load and after each successful form submission.

---

### FR-3 — Expense Deletion

**FR-3.1** The application shall provide a delete action for each expense in the list.  
**FR-3.2** The application shall display a confirmation modal before executing any deletion, showing the expense description and amount.  
**FR-3.3** The application shall support cancellation of the delete action via a "Cancel" button or clicking outside the modal overlay.  
**FR-3.4** The application shall remove the expense from the in-memory array and persist the updated array to `localStorage` upon confirmation.

---

### FR-4 — Data Reset

**FR-4.1** The application shall provide a "Reset" button accessible from the page header.  
**FR-4.2** The application shall display a confirmation modal before executing a reset, warning that the action cannot be undone.  
**FR-4.3** Upon confirmed reset, the application shall clear the expenses array and set the budget to `0`, persisting both empty states to `localStorage`.  
**FR-4.4** The application shall update all UI elements to reflect the empty state immediately after reset.

---

### FR-5 — Summary Cards

**FR-5.1** The application shall display four summary metric cards: Total Budget, Total Spent, Remaining, and Transactions.  
**FR-5.2** Total Budget shall display the currently set budget, formatted as USD.  
**FR-5.3** Total Spent shall display the sum of all expense amounts, formatted as USD.  
**FR-5.4** Remaining shall display `budget − totalSpent`, formatted as USD.  
**FR-5.5** Remaining shall render in green when positive, a neutral/warning color when zero, and red when negative.  
**FR-5.6** Transactions shall display the count of all recorded expenses as a plain integer.

---

### FR-6 — Progress Bar

**FR-6.1** The application shall render a horizontal progress bar showing the ratio of `totalSpent / budget` as a percentage.  
**FR-6.2** The bar fill shall not visually exceed 100% width even if spending exceeds the budget.  
**FR-6.3** The bar fill color shall follow this scheme:
  - `< 80%` → primary/blue gradient
  - `80%–99%` → warning/amber gradient
  - `≥ 100%` → danger/red gradient  

**FR-6.4** A status label below the bar shall describe the current spending state in human-readable text as specified in AC-4.5.  
**FR-6.5** Labels above the bar shall show the spent amount on the left and the total budget on the right.

---

### FR-7 — Donut Chart (Category Breakdown)

**FR-7.1** The application shall render a donut chart on a `<canvas>` element using the Canvas 2D API exclusively.  
**FR-7.2** The chart shall aggregate expense amounts by category and render one arc slice per category.  
**FR-7.3** Slice angles shall be proportional to each category's share of the total spending.  
**FR-7.4** Each slice shall be rendered in a distinct color from the predefined eight-color palette: `[#4f6ef7, #ef4444, #22c55e, #f59e0b, #a855f7, #06b6d4, #f97316, #64748b]`.  
**FR-7.5** The chart shall include a circular hole (donut style) with the total spending amount rendered at the center.  
**FR-7.6** A legend shall be rendered alongside the chart showing: color dot, category emoji + name, and percentage of total.  
**FR-7.7** When no expenses exist, the canvas shall be hidden and a placeholder message ("No expenses yet.") shall be shown.  
**FR-7.8** The chart shall re-render after every add/delete operation.

---

### FR-8 — Bar Chart (Daily Spending)

**FR-8.1** The application shall render a bar chart on a `<canvas>` element using the Canvas 2D API exclusively.  
**FR-8.2** The chart shall display up to 14 of the most recent expense dates with aggregated daily totals.  
**FR-8.3** The x-axis shall label each bar with the date in `MM/DD` format.  
**FR-8.4** The y-axis shall display evenly spaced horizontal grid lines with dollar labels; amounts ≥ $1,000 shall be abbreviated (e.g., `$1.5k`).  
**FR-8.5** Bars shall be drawn with rounded top corners (radius 4px).  
**FR-8.6** A dollar label shall appear inside each bar when the bar height exceeds 18px.  
**FR-8.7** The canvas width shall match its parent container and re-render on window resize (debounced at 120ms).  
**FR-8.8** When no expenses exist, the canvas shall be hidden and a placeholder message shall be shown.  
**FR-8.9** The chart shall re-render after every add/delete operation.

---

### FR-9 — Expense List with Filter and Sort

**FR-9.1** The application shall render the expense list from the in-memory expenses array, applying the current filter and sort selections.  
**FR-9.2** A category filter dropdown shall include "All Categories" and one option per predefined category.  
**FR-9.3** A sort dropdown shall support four sort orders: date descending, date ascending, amount descending, amount ascending.  
**FR-9.4** Filter and sort shall be applied in combination (filter first, then sort).  
**FR-9.5** Each expense item shall display: category emoji icon in a color-coded background chip, description, `category · date` metadata line, amount, and delete button.  
**FR-9.6** The empty state message shall differentiate between "no expenses at all" and "no expenses match the current filter".  
**FR-9.7** All user-supplied text rendered in the list shall be HTML-escaped to prevent XSS injection.

---

### FR-10 — Toast Notification System

**FR-10.1** The application shall provide a single toast element positioned fixed at the bottom-right of the viewport.  
**FR-10.2** Toast messages shall be triggered for the following events: budget set (success), expense added (success), expense deleted (info), data reset (info), invalid budget input (error).  
**FR-10.3** Each toast shall auto-hide after 3,000ms via a clearable `setTimeout`.  
**FR-10.4** If a new toast is triggered while another is visible, the timer resets and the new message replaces the old one.  
**FR-10.5** The toast element shall carry `role="alert"` and `aria-live="assertive"` attributes for assistive technology compatibility.

---

### FR-11 — Confirmation Modal

**FR-11.1** A single reusable modal overlay shall be used for both expense deletion and data reset confirmations.  
**FR-11.2** The modal shall display a title, a descriptive message, and two action buttons (Cancel / primary action).  
**FR-11.3** The modal shall be dismissed without side effects by clicking the Cancel button or clicking on the overlay outside the modal box.  
**FR-11.4** The modal shall be accessible with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the modal title.

---

### FR-12 — Data Persistence

**FR-12.1** The application shall use `localStorage` as the sole persistence mechanism.  
**FR-12.2** Expenses shall be serialized as a JSON array and stored under the key `ebv_expenses`.  
**FR-12.3** The budget shall be serialized as a JSON number and stored under the key `ebv_budget`.  
**FR-12.4** On initialization, the application shall attempt to load both keys from `localStorage`, defaulting to `[]` and `0` respectively if parsing fails.  
**FR-12.5** Corrupted or unparseable `localStorage` data shall be gracefully handled (try/catch), falling back to empty defaults without throwing a runtime error.

---

### FR-13 — Categories

**FR-13.1** The application shall support exactly eight expense categories: Food, Transport, Housing, Health, Entertainment, Shopping, Utilities, Other.  
**FR-13.2** Each category shall be associated with a fixed emoji icon used across the form, list, and donut chart legend.  
**FR-13.3** Each category shall be associated with a distinct background color for the icon chip in the expense list.

---

## 5. Non-Functional Requirements

### NFR-1 — Usability & Aesthetics

**NFR-1.1** The UI shall follow a clean, minimal design aesthetic with ample whitespace and no extraneous decoration.  
**NFR-1.2** Visual hierarchy shall be established through font weight, font size, and color contrast — not through complex layout patterns.  
**NFR-1.3** Interactive elements (buttons, inputs, selects) shall have clearly visible focus states for keyboard navigation accessibility.  
**NFR-1.4** All monetary values displayed to the user shall be formatted with a `$` prefix, thousands separators, and exactly two decimal places.  
**NFR-1.5** Typography shall use the system sans-serif font stack (`'Segoe UI', system-ui, -apple-system, sans-serif`) for fast, native rendering with no font download latency.  
**NFR-1.6** Color usage shall maintain sufficient contrast ratios to meet WCAG 2.1 AA guidelines for text on background combinations.

---

### NFR-2 — Performance

**NFR-2.1** The application shall load and become interactive in under 1 second on a modern desktop browser with a local filesystem load (no network).  
**NFR-2.2** All UI updates (summary cards, charts, list) after any user action shall complete within a single animation frame (< 16ms render time for typical datasets of ≤ 500 expenses).  
**NFR-2.3** Chart redraws triggered by window resize events shall be debounced at 120ms to prevent layout thrashing.  
**NFR-2.4** `localStorage` read/write operations shall occur synchronously but be confined to discrete save/load functions to minimize blocking.  
**NFR-2.5** The total uncompressed payload (HTML + CSS + JS) shall not exceed 100 KB.

---

### NFR-3 — Reliability & Data Integrity

**NFR-3.1** The application shall not lose user data due to page refresh or tab closure.  
**NFR-3.2** Any `localStorage` parse error shall be caught and handled gracefully, reverting to safe defaults without crashing the application.  
**NFR-3.3** All user-supplied string data rendered in HTML shall be HTML-escaped to prevent cross-site scripting (XSS) vulnerabilities.  
**NFR-3.4** Expense IDs shall be unique across the session to prevent rendering or deletion collisions.

---

### NFR-4 — Maintainability

**NFR-4.1** The JavaScript source shall be organized into clearly labeled logical sections using comment banners (e.g., Constants, State, LocalStorage Helpers, DOM References, etc.).  
**NFR-4.2** All DOM element references shall be declared as named `const` variables at the top of the script to avoid repeated `querySelector` calls.  
**NFR-4.3** A single `updateAll()` function shall orchestrate all dependent UI refresh operations to prevent stale state.  
**NFR-4.4** CSS shall use custom properties (design tokens) for all colors, radii, shadows, and transitions, making theme changes a single-point update.

---

## 6. Technical Constraints

| ID | Constraint | Rationale |
|----|-----------|-----------|
| **TC-1** | The application must be implemented using HTML, CSS, and Vanilla JavaScript only. No JavaScript frameworks, UI component libraries, or compile-to-JS languages (React, Vue, Angular, TypeScript, etc.) are permitted. | Zero-dependency requirement; the app must run as-is from the filesystem with no build step. |
| **TC-2** | All data persistence must use the browser `localStorage` API exclusively. No `sessionStorage`, `IndexedDB`, cookies, or any form of server-side storage may be used. | Client-side only; no backend infrastructure. |
| **TC-3** | The application must be compatible with the latest stable versions of Chrome, Firefox, Edge, and Safari. No polyfills for legacy browsers (IE11, pre-Chromium Edge) are required. | Target modern browsers that natively support ES6+, Canvas API, and LocalStorage. |
| **TC-4** | All styling must reside in a single CSS file located at `css/style.css`. No inline styles (except dynamically applied via JavaScript for chart rendering and progress bar width), no CSS-in-JS, no external style sheets. | Single-file constraint; project structure limitation. |
| **TC-5** | All application logic must reside in a single JavaScript file located at `js/app.js`. No ES module imports/exports, no bundlers, no additional script files. | Single-file constraint; must load as a plain `<script src="js/app.js">` tag. |
| **TC-6** | Charts must be drawn using the native Canvas 2D API (`CanvasRenderingContext2D`). No external charting libraries (Chart.js, D3.js, Highcharts, etc.) may be used. | No external dependencies permitted. |
| **TC-7** | The `index.html` entry point must load the app without any server-side rendering or HTTP server; it must work when opened directly from the filesystem via `file://` protocol. | Zero-setup; user can double-click the HTML file and it works immediately. |

---

*End of Requirements Specification*
