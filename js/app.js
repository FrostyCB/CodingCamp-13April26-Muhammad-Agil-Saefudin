// app.js

// --- State ---

/** @type {Array<{id: string, name: string, amount: number, category: string}>} */
export let transactions = [];

/** @type {string[]} */
let customCategories = [];

/** @type {string} */
let currentSort = "";

// --- Constants ---

export const STORAGE_KEY = "expense-tracker-transactions";
export const CUSTOM_CATEGORIES_KEY = "expense-tracker-custom-categories";
export const THEME_KEY = "expense-tracker-theme";

export const VALID_CATEGORIES = ["Food", "Transport", "Fun"];

const CATEGORY_COLORS = {
  Food:      "#FF6384",
  Transport: "#36A2EB",
  Fun:       "#FFCE56"
};

/** Returns all categories (built-in + custom) */
function allCategories() {
  return [...VALID_CATEGORIES, ...customCategories];
}

/**
 * Generates a deterministic hex color for a custom category name.
 * @param {string} name
 * @returns {string}
 */
function colorForCategory(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return "#" + ((hash >>> 0) & 0xFFFFFF).toString(16).padStart(6, "0");
}

// --- Validation ---

/**
 * Validates form inputs before adding a transaction.
 * @param {string} name
 * @param {string|number} amount
 * @param {string} category
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateForm(name, amount, category) {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Item name is required.");
  }

  const parsedAmount = Number(amount);
  if (amount === "" || amount === null || amount === undefined || isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push("Amount must be a positive number.");
  }

  if (!category || !allCategories().includes(category)) {
    errors.push("Please select a valid category.");
  }

  return { valid: errors.length === 0, errors };
}

// --- Rendering ---

/**
 * Sums all transaction amounts and displays the total in #balance.
 */
function renderBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const el = document.getElementById("balance");
  if (el) {
    el.textContent = "Total: $" + total.toFixed(2);
  }
}

// --- State Mutations ---

/**
 * Adds a new transaction to the in-memory array, persists it, and re-renders.
 * @param {string} name
 * @param {number|string} amount
 * @param {string} category
 */
function addTransaction(name, amount, category) {
  const id = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

  transactions.push({
    id,
    name: name.trim(),
    amount: Math.round(Number(amount) * 100) / 100,
    category
  });

  saveToStorage(transactions);
  renderAll();

  // Reset form fields to default empty state
  const nameEl = document.getElementById("item-name");
  const amountEl = document.getElementById("item-amount");
  const categoryEl = document.getElementById("item-category");
  if (nameEl) nameEl.value = "";
  if (amountEl) amountEl.value = "";
  if (categoryEl) categoryEl.value = "";
}

// --- Persistence ---

/**
 * Reads and deserializes transactions from localStorage.
 * Falls back to [] on missing key, parse error, or SecurityError.
 * @returns {Array<{id: string, name: string, amount: number, category: string}>}
 */
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(t =>
      t !== null && typeof t === "object" &&
      typeof t.id === "string" && t.id !== "" &&
      typeof t.name === "string" && t.name.trim() !== "" &&
      typeof t.amount === "number" && t.amount > 0 &&
      allCategories().includes(t.category)
    );
  } catch (e) {
    return [];
  }
}

/**
 * Serializes and writes transactions to localStorage.
 * Silently catches QuotaExceededError / SecurityError.
 * @param {Array} txns
 */
export function saveToStorage(txns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch (e) {
    // continue in-memory if storage is unavailable
  }
}

/**
 * Loads custom categories from localStorage.
 * @returns {string[]}
 */
export function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(c => typeof c === "string" && c.trim() !== "");
  } catch (e) {
    return [];
  }
}

/**
 * Persists custom categories to localStorage.
 * @param {string[]} cats
 */
export function saveCustomCategories(cats) {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(cats));
  } catch (e) {
    // continue in-memory
  }
}

/**
 * Adds a new custom category if valid and not a duplicate.
 * @param {string} name
 * @returns {{ success: boolean, error?: string }}
 */
export function addCustomCategory(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return { success: false, error: "Category name is required." };
  if (allCategories().map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
    return { success: false, error: "Category already exists." };
  }
  customCategories.push(trimmed);
  // Assign a color so renderChart picks it up
  if (!CATEGORY_COLORS[trimmed]) {
    CATEGORY_COLORS[trimmed] = colorForCategory(trimmed);
  }
  saveCustomCategories(customCategories);
  renderCategoryOptions();
  return { success: true };
}

// --- Rendering ---

/** @type {import('chart.js').Chart|null} */
let chartInstance = null;

/**
 * Repopulates the #item-category <select> from allCategories().
 */
function renderCategoryOptions() {
  const select = document.getElementById("item-category");
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">Select category</option>';
  allCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  if (allCategories().includes(current)) select.value = current;
}

/**
 * Returns a sorted copy of transactions based on currentSort.
 * @returns {Array}
 */
function getSortedTransactions() {
  const copy = [...transactions];
  if (currentSort === "amount-desc") return copy.sort((a, b) => b.amount - a.amount);
  if (currentSort === "amount-asc")  return copy.sort((a, b) => a.amount - b.amount);
  if (currentSort === "category-asc") return copy.sort((a, b) => a.category.localeCompare(b.category));
  return copy;
}

/**
 * Clears and re-renders the transaction list.
 */
function renderList() {
  const list = document.getElementById("transaction-list");
  if (!list) return;
  list.innerHTML = "";
  getSortedTransactions().forEach(t => {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    li.dataset.category = t.category;
    li.innerHTML =
      `<span class="t-name">${t.name}</span>` +
      `<span class="t-amount">$${t.amount.toFixed(2)}</span>` +
      `<span class="t-category">${t.category}</span>` +
      `<button class="delete-btn" aria-label="Delete ${t.name}">Delete</button>`;
    li.querySelector(".delete-btn").addEventListener("click", () => deleteTransaction(t.id));
    list.appendChild(li);
  });
}

/**
 * Destroys and recreates the Chart.js pie chart.
 */
function renderChart() {
  const canvas = document.getElementById("expense-chart");
  if (!canvas) return;

  if (!window.Chart) {
    canvas.parentElement.textContent = "Chart unavailable (CDN failed to load).";
    return;
  }

  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const data = labels.map(l => totals[l]);
  const colors = labels.map(l => CATEGORY_COLORS[l] || colorForCategory(l));

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (labels.length === 0) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  chartInstance = new window.Chart(canvas, {
    type: "pie",
    data: { labels, datasets: [{ data, backgroundColor: colors }] }
  });
}

/**
 * Re-renders balance, list, and chart.
 */
function renderAll() {
  renderBalance();
  renderList();
  renderChart();
}

// --- Theme ---

/**
 * Reads saved theme from localStorage and applies it.
 */
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const btn = document.getElementById("theme-toggle");
  if (saved === "dark") {
    document.body.classList.add("dark");
    if (btn) btn.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    if (btn) btn.textContent = "🌙";
  }
}

/**
 * Toggles dark/light mode and persists the preference.
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch (e) {
    // ignore
  }
}

// --- State Mutations (continued) ---

/**
 * Removes a transaction by id, persists, and re-renders.
 * @param {string} id
 */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage(transactions);
  renderAll();
}

// --- Initialization ---

/**
 * Bootstraps the app: loads storage, wires form, paints initial state.
 */
function init() {
  loadTheme();

  customCategories = loadCustomCategories();
  // Assign colors for any persisted custom categories
  customCategories.forEach(cat => {
    if (!CATEGORY_COLORS[cat]) CATEGORY_COLORS[cat] = colorForCategory(cat);
  });

  transactions = loadFromStorage();

  renderCategoryOptions();

  const form = document.getElementById("transaction-form");
  const errorEl = document.getElementById("form-error");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("item-name").value;
      const amount = document.getElementById("item-amount").value;
      const category = document.getElementById("item-category").value;

      const { valid, errors } = validateForm(name, amount, category);

      if (!valid) {
        if (errorEl) errorEl.textContent = errors.join(" ");
        return;
      }

      if (errorEl) errorEl.textContent = "";
      addTransaction(name, amount, category);
    });
  }

  // Custom category button
  const addCatBtn = document.getElementById("add-category-btn");
  const catInput = document.getElementById("new-category");
  const catError = document.getElementById("category-error");
  if (addCatBtn && catInput) {
    addCatBtn.addEventListener("click", function () {
      const result = addCustomCategory(catInput.value);
      if (result.success) {
        catInput.value = "";
        if (catError) catError.textContent = "";
      } else {
        if (catError) catError.textContent = result.error;
      }
    });
  }

  // Sort select
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      currentSort = this.value;
      renderList();
    });
  }

  // Theme toggle
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }

  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
