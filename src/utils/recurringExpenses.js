// src/utils/recurringExpenses.js

export function generateRecurringExpenses(expenses) {
    const today = new Date();
    const updatedExpenses = [...expenses];
  
    expenses.forEach((expense) => {
      if (expense.isRecurring && expense.startDate && expense.frequency) {
        let nextDate = getNextDate(new Date(expense.startDate), expense.frequency);
  
        // Generate new recurring expenses until the next date is in the future
        while (nextDate <= today) {
          const newExpense = { ...expense, date: nextDate.toISOString().split("T")[0] };
          updatedExpenses.push(newExpense);
  
          // Update the start date for the next occurrence
          nextDate = getNextDate(nextDate, expense.frequency);
        }
      }
    });
  
    // Update the expenses array in localStorage
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    return updatedExpenses;
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