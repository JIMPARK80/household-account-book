<template>
    <div class="expense-list">
      <h1>Expense List</h1>
  
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
        expenses: [],        
        startDate: "",        
        endDate: ""          
      };
    },
    computed: {
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
      const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
      this.expenses = savedExpenses;
    },
    methods: {
      deleteExpense(index) {
        this.expenses.splice(index, 1);  
        localStorage.setItem("expenses", JSON.stringify(this.expenses)); 
      },
  
      applyFilter() {
      },
  
      clearFilter() {
        this.startDate = "";  
        this.endDate = "";    
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
  