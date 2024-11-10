<template>
    <div class="expense-list">
      <h1>Expense List</h1>
  
      <!-- Date Filter Section -->
      <div class="filter">
        <label>Start Date:</label>
        <input type="date" v-model="startDate" />
        <label>End Date:</label>
        <input type="date" v-model="endDate" />
        <button @click="applyFilter">Apply Filter</button>
        <button @click="clearFilter">Clear Filter</button>
      </div>
  
      <!-- Expense List -->
      <ul v-if="filteredExpenses.length">
        <li v-for="(expense, index) in filteredExpenses" :key="index" class="expense-item">
          <span>{{ expense.date }}</span> - <span>{{ expense.category }}</span>: <span>${{ expense.amount }}</span>
          <button @click="editExpense(index)">Edit</button> <!-- Edit Button -->
          <button @click="deleteExpense(index)">Delete</button>
        </li>
      </ul>
      <p v-else>No expenses found for the selected date range.</p>
  
      <!-- Edit Form Modal (Visible only when editing) -->
      <div v-if="isEditing" class="modal">
        <div class="modal-content">
          <h3>Edit Expense</h3>
          <form @submit.prevent="saveExpense">
            <label>Amount:</label>
            <input type="number" v-model="editedExpense.amount" required />
            <label>Category:</label>
            <input type="text" v-model="editedExpense.category" required />
            <label>Date:</label>
            <input type="date" v-model="editedExpense.date" required />
            <button type="submit">Save</button>
            <button @click="cancelEdit">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ExpenseList",
    data() {
      return {
        expenses: [],
        startDate: "",
        endDate: "",
        isEditing: false,           // Controls visibility of the edit form
        editedIndex: null,          // Index of the expense being edited
        editedExpense: {            // Temporary object to hold edited data
          amount: 0,
          category: "",
          date: ""
        }
      };
    },
    computed: {
      // Filters expenses based on selected date range
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
      // Load expenses from localStorage on component creation
      const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
      this.expenses = savedExpenses;
    },
    methods: {
      // Open the edit form with the selected expense's data
      editExpense(index) {
        this.editedIndex = index;
        this.editedExpense = { ...this.expenses[index] }; // Clone data to avoid direct mutation
        this.isEditing = true;
      },
      
      // Save the edited expense data to the array and update localStorage
      saveExpense() {
        if (this.editedIndex !== null) {
          // Replace the original expense with the edited data
          this.expenses.splice(this.editedIndex, 1, this.editedExpense);
          
          // Update localStorage with the modified expenses array
          localStorage.setItem("expenses", JSON.stringify(this.expenses));
          
          // Close the edit form and reset editing state
          this.isEditing = false;
          this.editedIndex = null;
        }
      },
      
      // Cancel editing and reset the edit form
      cancelEdit() {
        this.isEditing = false;
        this.editedIndex = null;
        this.editedExpense = { amount: 0, category: "", date: "" };
      },
      
      // Delete an expense and update localStorage
      deleteExpense(index) {
        this.expenses.splice(index, 1);
        localStorage.setItem("expenses", JSON.stringify(this.expenses));
      },
      
      // Apply filter (already managed by computed property)
      applyFilter() {
        // No additional code required here as filtering is handled in computed property
      },
      
      // Clear filter by resetting start and end dates
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
  
  /* Modal styling */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    text-align: center;
  }
  </style>
  