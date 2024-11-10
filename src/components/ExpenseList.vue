<template>
    <div class="expense-list">
      <h1>Expense List</h1>
  
      <!-- [Day-6:Filter by Date] - Date Filter Section -->
      <div class="filter">
        <label>Start Date:</label>
        <input type="date" v-model="startDate" />
        <label>End Date:</label>
        <input type="date" v-model="endDate" />
        <button @click="applyFilter">Apply Filter</button>
        <button @click="clearFilter">Clear Filter</button>
      </div>
  
      <ul v-if="filteredExpenses.length">
        <li v-for="(expense, index) in filteredExpenses" :key="index" class="expense-item">
          <span>{{ expense.date }}</span> - <span>{{ expense.category }}</span>: <span>${{ expense.amount }}</span>
          
          <!-- [Day-6:Delete Expense] - Delete Button for Each Expense -->
          <button @click="deleteExpense(index)">Delete</button>
        </li>
      </ul>
      <p v-else>No expenses found for the selected date range.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: "ExpenseList",
    data() {
      return {
        expenses: [],         // All expenses from localStorage
        startDate: "",        // [Day-6:Filter by Date] - Start date for filtering
        endDate: ""           // [Day-6:Filter by Date] - End date for filtering
      };
    },
    computed: {
      // [Day-6:Filter by Date] - Computed property to filter expenses by date range
      filteredExpenses() {
        if (!this.startDate && !this.endDate) return this.expenses;
  
        return this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date).getTime();
          const start = this.startDate ? new Date(this.startDate).getTime() : null;
          const end = this.endDate ? new Date(this.endDate).getTime() : null;
  
          return (!start || expenseDate >= start) && (!end || expenseDate <= end);
        });
      }
    },
    created() {
      // Load saved expenses from localStorage when component is created
      const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
      this.expenses = savedExpenses;
    },
    methods: {
      // [Day-6:Delete Expense] - Method to delete an expense and update localStorage
      deleteExpense(index) {
        this.expenses.splice(index, 1);  // Remove expense from array
        localStorage.setItem("expenses", JSON.stringify(this.expenses));  // Update localStorage
      },
  
      // [Day-6:Filter by Date] - Method to apply the filter (triggers computed property recalculation)
      applyFilter() {
        // No action needed; filteredExpenses will update automatically based on startDate and endDate
      },
  
      // [Day-6:Filter by Date] - Method to clear the date filter
      clearFilter() {
        this.startDate = "";  // Reset start date
        this.endDate = "";    // Reset end date
      }
    }
  };
  </script>
  
  <style scoped>
  .expense-list {
    padding: 20px;
  }
  
  .filter {
    margin-bottom: 20px;
  }
  
  .expense-item {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    background-color: #ff4d4f;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #ff7875;
  }
  </style>
  