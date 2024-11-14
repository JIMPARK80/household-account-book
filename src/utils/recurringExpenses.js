// src/utils/recurringExpenses.js

import { setupDatabase, clearAllExpenses, addExpense } from '../database.js';

export async function generateRecurringExpenses(expenses) {
  const today = new Date();
  const updatedExpenses = [];
  const MAX_ENTRIES = 100; // Set a limit to avoid excessive data

  // Initialize IndexedDB
  const db = await setupDatabase();

  // Generate recurring expenses
  for (const expense of expenses) {
    if (expense.isRecurring && expense.startDate && expense.frequency) {
      let nextDate = getNextDate(new Date(expense.startDate), expense.frequency);
      let count = 0;

      while (nextDate <= today && count < MAX_ENTRIES) {
        const newExpense = { ...expense, date: nextDate.toISOString().split("T")[0] };
        updatedExpenses.push(newExpense);
        nextDate = getNextDate(nextDate, expense.frequency);
        count++;
      }
    }
  }

  // Clear all expenses in IndexedDB and save new ones
  await clearAllExpenses();
  for (const newExpense of updatedExpenses) {
    await addExpense(db, newExpense);
  }

  console.log("Recurring expenses generated and saved to IndexedDB.");
}

function getNextDate(startDate, frequency) {
  const nextDate = new Date(startDate);
  if (frequency === "weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (frequency === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate;
}
