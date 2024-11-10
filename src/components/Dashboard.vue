<template>
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="filter">
        <label> Start Date</label>
        <input type="date" v-model="startDate" />
        <label> End Date</label>
        <input type="date" v-model="endDate" />
        <button @click="applyDateFilter">Apply Filter</button>
        <button @click="clearDateFilter">Clear Fitler</button>

        <p>Total Expenses for Selected Range: ${{totalExpenses}}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "Dash-board",
    data() {
      return {
        expenses: [],
        startDate: "",        // Filter start date
        endDate: "",          // Filter end date
        totalExpenses: 0      // Total expenses for the filtered date range
      };
    },
    created() {
      this.loadExpenses();
      this.calculateTotalExpenses();
    },
    methods: {
      loadExpenses() {
        // Retrieve saved expenses from localStorage
        this.expenses = JSON.parse(localStorage.getItem("expenses")) || [];
      },
      calculateTotalExpenses() {
        // Calculate total expenses based on start and end dates
        const filteredExpenses = this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date).getTime();
          const start = this.startDate ? new Date(this.startDate).getTime() : null;
          const end = this.endDate ? new Date(this.endDate).getTime() : null;
  
          return (!start || expenseDate >= start) && (!end || expenseDate <= end);
        });
  
        // Sum up the amounts of filtered expenses
        this.totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      },
      applyDateFilter() {
        // Calculate total expenses for selected date range
        this.calculateTotalExpenses();
      },
      clearFilter() {
        // Reset dates and recalculate total expenses without filtering
        this.startDate = "";
        this.endDate = "";
        this.calculateTotalExpenses();
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    padding: 20px;
    text-align: center;
  }
  
  .filter {
    margin-bottom: 20px;
  }
  
  button {
    padding: 5px 10px;
    margin-left: 10px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #ddd;
  }
  </style>
  
  