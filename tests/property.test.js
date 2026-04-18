// Feature: expense-budget-visualizer, Property 8: Serialization round-trip
// Validates: Requirements 5.1, 5.2, 5.3

import { describe, it, beforeEach, expect } from "vitest";
import * as fc from "fast-check";
import { loadFromStorage, saveToStorage, STORAGE_KEY } from "../js/app.js";

// --- Arbitraries ---

const categoryArb = fc.constantFrom("Food", "Transport", "Fun");

const transactionArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  amount: fc.float({ min: 0.01, max: 100_000, noNaN: true, noDefaultInfinity: true })
    .map(n => Math.round(n * 100) / 100)
    .filter(n => n > 0),
  category: categoryArb,
});

const transactionArrayArb = fc.array(transactionArb, { minLength: 0, maxLength: 20 });

// --- Tests ---

describe("Property 8: LocalStorage serialization round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadFromStorage after saveToStorage deep-equals the original array", () => {
    fc.assert(
      fc.property(transactionArrayArb, (transactions) => {
        saveToStorage(transactions);
        const loaded = loadFromStorage();
        expect(loaded).toEqual(transactions);
      }),
      { numRuns: 100 }
    );
  });
});
