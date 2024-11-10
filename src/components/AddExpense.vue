<template>
    <div class="add-expense">
      <h2>Add {{ type === 'expense' ? 'Expense' : 'Income' }}</h2>
      
      <!-- Tabs for Expense and Income -->
      <div class="tabs">
        <button @click="setType('expense')" :class="{ active: type === 'expense' }">Expense</button>
        <button @click="setType('income')" :class="{ active: type === 'income' }">Income</button>
      </div>
  
      <!-- Input Form -->
      <form @submit.prevent="addEntry">
        <label>
          Date:
          <input v-model="entry.date" type="date" placeholder="Select a date" required />
        </label>
        <br />
        <label>
          Amount:
          <input v-model="entry.amount" type="number" placeholder="Enter amount" required />
        </label>
        <br />
  
        <!-- Category Selection with Custom Category Option -->
        <div class="category-section">
          <h3>Select Category</h3>
          <div class="category-grid">
            <div
              v-for="category in categories"
              :key="category"
              :class="{ selected: entry.category === category }"
              @click="selectCategory(category)"
              class="category"
            >
              <span>{{ category }}</span>
            </div>
            <!-- Button to Add Custom Category -->
            <div class="category custom-category" @click="addingCustomCategory = true">
              <span>+ Custom</span>
            </div>
          </div>
  
          <!-- Custom Category Input -->
          <div v-if="addingCustomCategory" class="custom-category-input">
            <input v-model="newCategory" placeholder="Enter new category" />
            <button @click="addCustomCategory">Add Category</button>
            <button @click="cancelCustomCategory">Cancel</button>
          </div>
        </div>
  
        <button type="submit">Add {{ type === 'expense' ? 'Expense' : 'Income' }}</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        type: 'expense', // Default to expense
        entry: {
          date: '',
          amount: 0,
          category: '',
        },
        categories: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Others'],
        addingCustomCategory: false, // Track if adding custom category
        newCategory: '', // Stores new category name
      };
    },
    methods: {
      setType(newType) {
        this.type = newType;
        this.entry.amount = 0;
        this.entry.category = '';
      },
      selectCategory(category) {
        this.entry.category = category;
        this.addingCustomCategory = false; // Close custom category input if open
      },
      addCustomCategory() {
        if (this.newCategory && !this.categories.includes(this.newCategory)) {
          this.categories.push(this.newCategory); // Add new category to list
          this.entry.category = this.newCategory; // Set as selected category
          this.newCategory = ''; // Clear input
          this.addingCustomCategory = false;
        }
      },
      cancelCustomCategory() {
        this.addingCustomCategory = false;
        this.newCategory = '';
      },
      addEntry() {
        if (!this.entry.date || !this.entry.amount || !this.entry.category) {
          alert("Please complete all required fields.");
          return;
        }
  
        // Save entry to local storage
        const savedEntries = JSON.parse(localStorage.getItem('entries')) || [];
        savedEntries.push({ ...this.entry, type: this.type });
        localStorage.setItem('entries', JSON.stringify(savedEntries));
  
        // Reset the form after adding
        this.resetForm();
      },
      resetForm() {
        this.entry = {
          date: '',
          amount: 0,
          category: '',
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .add-expense {
    max-width: 600px;
    margin: auto;
  }
  
  .tabs {
    display: flex;
    margin-bottom: 20px;
  }
  
  .tabs button {
    flex: 1;
    padding: 10px;
    cursor: pointer;
    background-color: #f0f0f0;
    border: none;
    outline: none;
    font-size: 1em;
    transition: background-color 0.3s;
    border-radius: 5px 5px 0 0;
  }
  
  .tabs .active {
    background-color: #007bff;
    color: white;
  }
  
  .category-section {
    margin-top: 20px;
  }
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .category {
    padding: 10px;
    cursor: pointer;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 5px;
    transition: background-color 0.2s ease;
  }
  
  .category.selected {
    background-color: #007bff;
    color: white;
  }
  
  .custom-category-input {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  button {
    padding: 5px 10px;
    cursor: pointer;
  }
  </style>
  