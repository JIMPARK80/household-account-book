<template>
    <div class="expense-list">
      <h1>Expense List</h1>
      <ul v-if="expenses.length">
        <li v-for="(expense, index) in expenses" :key="index">
          {{ expense.date }} - {{ expense.category }}: ${{ expense.amount }}
        </li>
      </ul>
      <p v-else>No expenses recorded yet.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: "ExpenseList",
    data() {
      return {
        expenses: []
      };
    },
    created() {
      // Retrieve expenses from localStorage when component is created
      const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
      this.expenses = savedExpenses;
    }
  };
  </script>
  
  <style scoped>
  .expense-list {
    padding: 20px;
  }
  </style>
  