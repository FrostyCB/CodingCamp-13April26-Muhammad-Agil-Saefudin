# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a fully client-side expense tracker using plain HTML, CSS, and Vanilla JavaScript. No build tools or backend required. Chart.js is loaded via CDN. All state is persisted to `localStorage`.

## Tasks

- [x] 1. Create project file structure and HTML skeleton
  - Create `index.html` with the full HTML structure: header with `#balance`, form section with `#transaction-form` (fields: `#item-name`, `#item-amount`, `#item-category`, `#form-error`), `#transaction-list`, and `#expense-chart` canvas
  - Add Chart.js CDN `<script>` tag before `js/app.js`
  - Create empty `css/styles.css` and `js/app.js` files at the correct paths
  - _Requirements: 6.1, 6.3_

- [ ] 2. Implement persistence layer
  - [x] 2.1 Implement `loadFromStorage` and `saveToStorage` in `js/app.js`
    - `loadFromStorage`: reads `"expense-tracker-transactions"` from `localStorage`, parses JSON, filters out structurally invalid entries, falls back to `[]` on missing key, parse error, or `SecurityError`
    - `saveToStorage`: serializes the transactions array to JSON and writes it; catches `QuotaExceededError` / `SecurityError` silently so the app continues in-memory
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 2.2 Write property test for LocalStorage serialization round-trip
    - Use fast-check to generate random `Transaction[]` arrays
    - Assert `loadFromStorage()` after `saveToStorage(arr)` deep-equals `arr`
    - `// Feature: expense-budget-visualizer, Property 8: Serialization round-trip`
    - **Property 8: LocalStorage serialization round-trip**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 3. Implement form validation
  - [x] 3.1 Implement `validateForm(name, amount, category)` returning `{ valid, errors }`
    - Reject empty/whitespace-only name, non-positive or non-numeric amount, and missing category
    - Return one human-readable error string per invalid field
    - _Requirements: 1.3, 1.4_

  - [ ] 3.2 Write property test for invalid input rejection
    - Use fast-check to generate random invalid field combinations (empty name, zero/negative amount, no category)
    - Assert `validateForm` returns `valid: false` and at least one error for every invalid combination
    - `// Feature: expense-budget-visualizer, Property 2: Invalid inputs are rejected with error and list is unchanged`
    - **Property 2: Invalid inputs are rejected with error and list is unchanged**
    - **Validates: Requirements 1.3, 1.4**

- [ ] 4. Implement state mutations
  - [x] 4.1 Implement `addTransaction(name, amount, category)`
    - Generate a unique `id` via `crypto.randomUUID()` with fallback to `Date.now() + Math.random()`
    - Push new transaction object onto the in-memory `transactions` array
    - Call `saveToStorage` then `renderAll`
    - Reset form fields to default empty state after successful add
    - _Requirements: 1.2, 1.5, 5.1_

  - [ ] 4.2 Write property test for valid transaction submission
    - Use fast-check to generate random `{name, amount, category}` tuples
    - Assert transaction appears in the DOM list and in deserialized `localStorage` after `addTransaction`
    - `// Feature: expense-budget-visualizer, Property 1: Valid transaction submission adds to list and LocalStorage`
    - **Property 1: Valid transaction submission adds to list and LocalStorage**
    - **Validates: Requirements 1.2, 5.1**

  - [ ] 4.3 Write property test for form reset after submission
    - Use fast-check to generate random valid transactions
    - Assert all form fields are empty/default after `addTransaction` completes
    - `// Feature: expense-budget-visualizer, Property 3: Form resets after successful submission`
    - **Property 3: Form resets after successful submission**
    - **Validates: Requirements 1.5**

  - [x] 4.4 Implement `deleteTransaction(id)`
    - Filter the transaction with the matching `id` out of the in-memory array
    - Call `saveToStorage` then `renderAll`
    - _Requirements: 2.4, 5.2_

  - [ ] 4.5 Write property test for delete removes transaction from list and storage
    - Use fast-check to generate a random transaction list and a random index to delete
    - Assert the deleted item is absent from the DOM and `localStorage`, and all other items remain unchanged
    - `// Feature: expense-budget-visualizer, Property 5: Delete removes transaction from list and LocalStorage`
    - **Property 5: Delete removes transaction from list and LocalStorage**
    - **Validates: Requirements 2.4, 5.2**

- [ ] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement rendering functions
  - [x] 6.1 Implement `renderBalance()`
    - Sum all `transaction.amount` values; display as `$X.XX` in `#balance`
    - Show `$0.00` when the array is empty
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.2 Write property test for balance equals sum of all transaction amounts
    - Use fast-check to generate random `Transaction[]` with known amounts
    - Assert the text content of `#balance` equals the arithmetic sum rounded to two decimal places
    - `// Feature: expense-budget-visualizer, Property 6: Balance equals sum of all transaction amounts`
    - **Property 6: Balance equals sum of all transaction amounts**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 6.3 Implement `renderList()`
    - Clear `#transaction-list` and re-render one `<li>` per transaction showing name, amount, and category
    - Each `<li>` includes a delete button wired to `deleteTransaction(id)`
    - _Requirements: 2.1, 2.2_

  - [ ] 6.4 Write property test for transaction list renders all transactions with correct data
    - Use fast-check to generate random `Transaction[]` arrays
    - Assert every transaction's name, amount, and category are present in the DOM after `renderList`
    - `// Feature: expense-budget-visualizer, Property 4: Transaction list renders all transactions with correct data`
    - **Property 4: Transaction list renders all transactions with correct data**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 6.5 Implement `renderChart()`
    - Build chart data: one entry per category that has at least one transaction, value = sum of amounts for that category, colors from `CATEGORY_COLORS`
    - Destroy and recreate the Chart.js pie chart instance on `#expense-chart`; guard with `if (!window.Chart)` and show fallback text if CDN failed
    - Show empty/placeholder state when no transactions exist
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 6.6 Write property test for chart segments reflect active categories
    - Use fast-check to generate random `Transaction[]`
    - Assert the chart dataset contains exactly one entry per active category and each value equals the sum of amounts for that category
    - `// Feature: expense-budget-visualizer, Property 7: Chart segments reflect active categories`
    - **Property 7: Chart segments reflect active categories**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 6.7 Implement `renderAll()`
    - Call `renderBalance()`, `renderList()`, and `renderChart()` in sequence
    - _Requirements: 3.2, 3.3, 4.2_

- [ ] 7. Implement event wiring and initialization
  - [x] 7.1 Implement `init()`
    - Load transactions from `localStorage` into the in-memory `transactions` array via `loadFromStorage`
    - Attach `submit` event listener on `#transaction-form`: call `validateForm`, show errors in `#form-error` if invalid, otherwise call `addTransaction`
    - Call `renderAll()` to paint initial state
    - Register `init` on `DOMContentLoaded`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 5.3, 5.4_

- [x] 8. Apply CSS styling
  - Define CSS custom properties for category accent colors (`#FF6384` Food, `#36A2EB` Transport, `#FFCE56` Fun)
  - Flexbox column layout for `<main>`; card-style sections with `box-shadow`
  - `#transaction-list`: `max-height` + `overflow-y: auto` for scrollability
  - _Requirements: 2.3, 6.1_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Custom Categories
  - [x] 10.1 Add custom category management to `js/app.js`
    - Add `CUSTOM_CATEGORIES_KEY = "expense-tracker-custom-categories"` storage key
    - Implement `loadCustomCategories()`: reads from localStorage, returns string array, falls back to `[]`
    - Implement `saveCustomCategories(cats)`: serializes and writes to localStorage
    - Implement `addCustomCategory(name)`: validates non-empty/non-duplicate, pushes to in-memory `customCategories` array, persists, and calls `renderCategoryOptions()`
    - Maintain a merged `allCategories` getter combining `VALID_CATEGORIES` and `customCategories`
    - _Requirements: 1.1 (extended)_

  - [x] 10.2 Add custom category UI to `index.html`
    - Add an `<input id="new-category">` text field and `<button id="add-category-btn">Add Category</button>` below the existing form in `#form-section`
    - Add `<div id="category-error" aria-live="polite"></div>` for inline error feedback
    - _Requirements: 1.1 (extended)_

  - [x] 10.3 Implement `renderCategoryOptions()` in `js/app.js`
    - Clear and repopulate `#item-category` `<option>` elements from `allCategories`
    - Preserve the default empty "Select category" option
    - Assign a color from `CATEGORY_COLORS` for known categories; generate and cache a deterministic hex color for custom ones
    - Update `CATEGORY_COLORS` map so `renderChart()` picks up the new color
    - Wire `#add-category-btn` click in `init()`: read `#new-category`, call `addCustomCategory`, clear input, show errors in `#category-error`
    - Call `renderCategoryOptions()` during `init()` after loading custom categories
    - _Requirements: 1.1, 4.1 (extended)_

  - [x] 10.4 Update `loadFromStorage` filter to accept custom categories
    - Replace the hard-coded `VALID_CATEGORIES.includes(t.category)` check with `allCategories.includes(t.category)` so persisted transactions with custom categories survive a page reload
    - _Requirements: 5.3 (extended)_

- [x] 11. Transaction Sorting
  - [x] 11.1 Add sort controls to `index.html`
    - Add a `<select id="sort-select">` inside `#list-section` (above `#transaction-list`) with options: `value=""` "Default order", `value="amount-desc"` "Amount: High → Low", `value="amount-asc"` "Amount: Low → High", `value="category-asc"` "Category: A → Z"
    - _Requirements: 2.1 (extended)_

  - [x] 11.2 Implement sort logic in `js/app.js`
    - Add module-level `let currentSort = ""` variable
    - Implement `getSortedTransactions()`: returns a sorted copy of `transactions` based on `currentSort` (no mutation of source array)
      - `"amount-desc"`: sort by `amount` descending
      - `"amount-asc"`: sort by `amount` ascending
      - `"category-asc"`: sort by `category` alphabetically
      - default: original insertion order
    - Update `renderList()` to iterate `getSortedTransactions()` instead of `transactions`
    - Wire `#sort-select` `change` event in `init()`: set `currentSort`, call `renderList()`
    - _Requirements: 2.1 (extended)_

- [x] 12. Dark/Light Mode
  - [x] 12.1 Add theme toggle button to `index.html`
    - Add `<button id="theme-toggle" aria-label="Toggle dark mode">🌙</button>` in `<header>`, between `<h1>` and `#balance`
    - _Requirements: 6.1 (extended)_

  - [x] 12.2 Add dark theme CSS variables to `css/styles.css`
    - Add `body.dark` rule overriding `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--shadow` with dark-palette values
    - Ensure form inputs, select, buttons, and list items inherit the overridden variables correctly (no hard-coded colors that break in dark mode)
    - _Requirements: 6.1 (extended)_

  - [x] 12.3 Implement theme persistence in `js/app.js`
    - Add `THEME_KEY = "expense-tracker-theme"` storage key
    - Implement `loadTheme()`: reads from localStorage, applies `"dark"` class to `document.body` if stored value is `"dark"`, updates `#theme-toggle` icon accordingly (`☀️` for dark, `🌙` for light)
    - Implement `toggleTheme()`: flips `dark` class on `document.body`, persists new value via `localStorage.setItem(THEME_KEY, ...)`, updates button icon
    - Wire `#theme-toggle` click to `toggleTheme()` in `init()`
    - Call `loadTheme()` at the top of `init()` before `renderAll()`
    - _Requirements: 6.1 (extended)_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use fast-check with a minimum of 100 iterations per property
- Each property test is tagged with `// Feature: expense-budget-visualizer, Property N: <text>`
- Unit tests and property tests are complementary — both are encouraged
- Checkpoints ensure incremental validation before moving to the next phase
