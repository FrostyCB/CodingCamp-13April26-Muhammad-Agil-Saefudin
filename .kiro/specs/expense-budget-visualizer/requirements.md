# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses by category. Users can add and delete transactions, view a running total balance, and see a pie chart of spending distribution by category. The app uses browser Local Storage for persistence and requires no backend or build tooling.

## Glossary

- **App**: The Expense & Budget Visualizer web application
- **Transaction**: A single expense entry consisting of a name, amount, and category
- **Category**: One of three predefined spending groups: Food, Transport, or Fun
- **Balance**: The sum of all transaction amounts currently stored
- **Chart**: A pie chart rendered via Chart.js showing spending distribution by category
- **Local_Storage**: The browser's built-in client-side key-value storage API
- **Input_Form**: The HTML form containing fields for item name, amount, and category
- **Transaction_List**: The scrollable UI element displaying all stored transactions
- **Validator**: The client-side logic responsible for checking form field completeness

---

## Requirements

### Requirement 1: Input Form

**User Story:** As a user, I want to fill out a form with an item name, amount, and category, so that I can record a new expense transaction.

#### Acceptance Criteria

1. THE Input_Form SHALL contain a text field for item name, a numeric field for amount, and a dropdown selector for category with options: Food, Transport, and Fun.
2. WHEN the user submits the Input_Form with all fields filled, THE App SHALL add the transaction to the Transaction_List and persist it to Local_Storage.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty, the amount field contains a positive numeric value, and a category is selected.
4. IF the Validator detects one or more empty or invalid fields, THEN THE Input_Form SHALL display an inline error message identifying the missing or invalid fields and SHALL NOT add the transaction.
5. WHEN a transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded transactions in a scrollable list, so that I can review and manage my expenses.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored transactions, each showing the item name, amount, and category.
2. WHILE transactions exist in Local_Storage, THE Transaction_List SHALL render all of them on page load.
3. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
4. WHEN the user clicks the delete control on a transaction, THE App SHALL remove that transaction from the Transaction_List and from Local_Storage.

---

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE App SHALL display the total balance as the sum of all transaction amounts at the top of the page.
2. WHEN a transaction is added, THE App SHALL recalculate and update the displayed balance without requiring a page reload.
3. WHEN a transaction is deleted, THE App SHALL recalculate and update the displayed balance without requiring a page reload.
4. WHILE no transactions exist, THE App SHALL display a balance of 0.

---

### Requirement 4: Visual Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand how my expenses are distributed.

#### Acceptance Criteria

1. THE Chart SHALL display spending distribution as a pie chart with one segment per category that has at least one transaction.
2. WHEN a transaction is added or deleted, THE Chart SHALL update automatically to reflect the new category totals without requiring a page reload.
3. WHILE no transactions exist, THE Chart SHALL display an empty or placeholder state.
4. THE App SHALL render the Chart using Chart.js loaded via CDN.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I do not lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a transaction is added, THE App SHALL serialize and write the full transaction list to Local_Storage.
2. WHEN a transaction is deleted, THE App SHALL serialize and write the updated transaction list to Local_Storage.
3. WHEN the App initializes, THE App SHALL read and deserialize the transaction list from Local_Storage and restore all previously saved transactions.
4. IF Local_Storage is unavailable or returns malformed data, THEN THE App SHALL initialize with an empty transaction list and continue normal operation.

---

### Requirement 6: Technical Constraints

**User Story:** As a developer, I want the app built with plain HTML, CSS, and Vanilla JavaScript, so that it requires no build tools, frameworks, or backend server.

#### Acceptance Criteria

1. THE App SHALL be implemented using a single HTML file, one CSS file located in `css/`, and one JavaScript file located in `js/`.
2. THE App SHALL function correctly in current stable versions of Chrome, Firefox, Edge, and Safari without polyfills or transpilation.
3. THE App SHALL require no backend server, build step, or package installation to run.
4. THE App SHALL load and render within a perceptible time on a standard broadband connection, with no noticeable lag during transaction add or delete interactions.
