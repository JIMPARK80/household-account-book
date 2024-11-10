<template>
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p>Total Expenses: ${{ totalExpenses }}</p>
      <router-link to="/expense-list">View Expense List</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: "Dash-board",
    data() {
      return {
        totalExpenses: 0
      };
    },
    created() {
      this.calculateTotalExpenses();
    },
    methods: {
      calculateTotalExpenses() {
        // Retrieve expenses from localStorage
        const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        
        // Calculate total expenses by summing up the 'amount' of each expense
        this.totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    text-align: center;
    padding: 20px;
  }
  </style>
  
  