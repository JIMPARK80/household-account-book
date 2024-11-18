<template>
  <div class="dashboard-view">
    <!-- Expense & Income Summary -->
    <h3>Expense & Income</h3>
    <div class="income-expense-summary">
      <!-- Expense Summary -->
      <div class="expense-summary">
        <span>Expense: </span>
        <span class="expense">-{{ totalExpense }} {{ entry.currency }}</span>
      </div>
      <!-- Income Summary -->
      <div class="income-summary">
        <span>Income: </span>
        <span class="income">+{{ totalIncome }} {{ entry.currency }}</span>
      </div>
      <!-- Total Balance -->
      <div class="total-summary">
        <span>Total Balance: </span>
        <span class="total">{{ total }} {{ entry.currency }}</span>
      </div>
    </div>

    <!-- Input Form -->
    <div class="input-form">
      <!-- Tabs for Expense and Income -->
      <div class="tabs">
        <button @click="setType('expense')" :class="{ active: type === 'expense' }">Expense</button>
        <button @click="setType('income')" :class="{ active: type === 'income' }">Income</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="addOrUpdateEntry">
        <div class="form-group">
          <label>Date:</label>
          <input v-model="entry.date" type="date" required />
        </div>
        <div class="form-group">
          <label>Note:</label>
          <input v-model="entry.note" type="text" placeholder="Enter value" />
        </div>
        <div class="form-group">
          <label>{{ type === 'expense' ? 'Expense' : 'Income' }}:</label>
          <input v-model="entry.amount" type="number" placeholder="0.00" required />
        </div>
        <div class="form-group">
          <label>Currency:</label>
          <select v-model="entry.currency" required>
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
            <option value="KRW">KRW</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <!-- Categories -->
        <div class="category-section">
          <h3>Category</h3>
          <div class="category-grid">
            <div
              v-for="category in currentCategories"
              :key="category.name"
              :class="{ selected: entry.category === category.name }"
              class="category"
              @click="selectCategory(category.name)"
            >
              <i :class="category.icon"></i>
              <span>{{ category.name }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Submit' }}</button>
      </form>

      <!-- Entered Values List -->
      <div class="expense-list">
        <h3>Entered Values</h3>
        <ul>
          <li v-for="expense in currentEntries" :key="expense.id">
            <strong>{{ expense.date }}</strong>: {{ expense.note }} - 
            {{ type === 'expense' ? 'Expense' : 'Income' }}: 
            {{ expense.amount }} {{ expense.currency }}
            <em>({{ expense.category }})</em>
            <button @click="editEntry(expense)">Edit</button>
            <button @click="deleteEntry(expense.id)">Delete</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { setupDatabase, addExpense, getAllExpenses, addIncome, getAllIncome } from "../database.js";

export default {
  data() {
    return {
      isEditing: false,
      type: "expense",
      entry: {
        id: null,
        date: new Date().toISOString().split("T")[0],
        note: "",
        amount: 0,
        category: "",
        currency: "CAD", // Default currency
      },
      expenses: [],
      income: [],
      expenseCategories: [
        { name: "Food", icon: "fas fa-utensils" },
        { name: "Houseware", icon: "fas fa-home" },
        { name: "Clothes", icon: "fas fa-tshirt" },
        { name: "Cosmetic", icon: "fas fa-paint-brush" },
        { name: "Medical", icon: "fas fa-heartbeat" },
        { name: "Education", icon: "fas fa-book" },
        { name: "Electric bill", icon: "fas fa-lightbulb" },
        { name: "Transportation", icon: "fas fa-bus" },
        { name: "Contact fee", icon: "fas fa-phone" },
        { name: "Housing expenses", icon: "fas fa-home" },
      ],
      incomeCategories: [
        { name: "Salary", icon: "fas fa-wallet" },
        { name: "Pocket money", icon: "fas fa-piggy-bank" },
        { name: "Bonus", icon: "fas fa-gift" },
        { name: "Side job", icon: "fas fa-money-bill-alt" },
        { name: "Investment", icon: "fas fa-coins" },
        { name: "Extra", icon: "fas fa-hand-holding-usd" },
      ],
    };
  },
  async mounted() {
    const db = await setupDatabase();
    this.expenses = await getAllExpenses(db);
    this.income = await getAllIncome(db);
  },
  computed: {
    totalExpense() {
      return this.expenses.reduce((total, expense) => total + expense.amount, 0);
    },
    totalIncome() {
      return this.income.reduce((total, income) => total + income.amount, 0);
    },
    total() {
      return this.totalIncome - this.totalExpense;
    },
    currentCategories() {
      return this.type === "expense" ? this.expenseCategories : this.incomeCategories;
    },
    currentEntries() {
      return this.type === "expense" ? this.expenses : this.income;
    },
  },
  methods: {
    setType(newType) {
      this.type = newType;
      this.entry.amount = 0;
      this.entry.category = "";
    },
    selectCategory(categoryName) {
      this.entry.category = categoryName;
    },
    async addOrUpdateEntry() {
      if (!this.entry.date || !this.entry.amount || !this.entry.category || !this.entry.currency) {
        alert("Please complete all required fields.");
        return;
      }
      const db = await setupDatabase();
      if (this.isEditing) {
        const transaction = db.transaction(this.type === "expense" ? "expenses" : "income", "readwrite");
        const store = transaction.objectStore(this.type === "expense" ? "expenses" : "income");
        await store.put({ ...this.entry });
      } else {
        this.entry.id = Date.now();
        if (this.type === "expense") {
          await addExpense(db, { ...this.entry });
          this.expenses.push({ ...this.entry });
        } else {
          await addIncome(db, { ...this.entry });
          this.income.push({ ...this.entry });
        }
      }
      this.resetForm();
    },
    resetForm() {
      this.isEditing = false;
      this.entry = {
        id: null,
        date: new Date().toISOString().split("T")[0],
        note: "",
        amount: 0,
        category: "",
        currency: "CAD",
      };
    },
    editEntry(entry) {
      this.isEditing = true;
      this.entry = { ...entry };
      this.type = entry.type;
    },
    async deleteEntry(id) {
      if (!confirm("Are you sure you want to delete this entry?")) return;

      const db = await setupDatabase();
      const transaction = db.transaction(this.type === "expense" ? "expenses" : "income", "readwrite");
      const store = transaction.objectStore(this.type === "expense" ? "expenses" : "income");
      await store.delete(id);

      if (this.type === "expense") {
        this.expenses = this.expenses.filter((item) => item.id !== id);
      } else {
        this.income = this.income.filter((item) => item.id !== id);
      }
    },
  },
};
</script>


<style scoped>
/* Overall Layout */
.dashboard-view {
  font-family: 'Arial', sans-serif;
  margin: 20px auto;
  max-width: 800px;
  padding: 20px;
  background-color: #f4f4f9; /* Soft background */
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #333;
  line-height: 1.6; /* Spacing adjustment for readability */
}

/* Income & Expense Summary */
.income-expense-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.expense-summary {
  color: red;
  font-size: 20px;
  font-weight: bold;
}

.income-summary {
  color: blue;
  font-size: 20px;
  font-weight: bold;
}

.total-summary {
  font-weight: bold;
  font-size: 24px;
}

.total-summary .total {
  color: green;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tabs button {
  background-color: #ffffff;
  border: 2px solid #ffa726; /* Accent border */
  color: #ffa726;
  padding: 10px 20px;
  font-size: 25px;
  border-radius: 25px; /* Rounded corners */
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.tabs button.active {
  background-color: #ffa726; /* Highlight active tab */
  color: white;
}

.tabs button:hover {
  background-color: #ffcc80;
}

/* Form Styling */
.input-form {
  margin-top: 0px;
}

.form-group {
  margin-bottom: 0px;
}

.form-group label {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 2px solid #ddd;
  border-radius: 10px; /* Rounded corners */
  background-color: #fff8e1; /* Light yellow */
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #ffa726;
  outline: none;
}

/* Expense/Income Input Section */
.expense-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.currency-symbol {
  margin-left: 10px;
  font-size: 16px;
  color: #555;
}

/* Category Section */
.category-section h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 3 columns */
  gap: 5px;
}

.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category:hover {
  background-color: #ffa726; /* Hover effect */
  color: white;
}

.category.selected {
  background-color: #ffa726;
  color: white;
}

.category i {
  font-size: 24px;
  margin-bottom: 5px;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #ffa726;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 25px; /* Rounded button */
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

.submit-button:hover {
  background-color: #ff9800;
}

/* Entered Values List */
.expense-list {
  margin-top: 40px;
}

.expense-list h3 {
  font-size: 18px;
  text-align: center;
  margin-bottom: 10px;
}

.expense-list ul {
  list-style-type: none;
  padding: 0;
}

.expense-list li {
  background-color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-list li strong {
  font-weight: bold;
}

.expense-list li em {
  font-style: italic;
  color: #555;
}

.expense-list button {
  background-color: #f44336;
  color: white;
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.expense-list button:hover {
  background-color: #e53935;
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr); /* Adjust to 2 columns for smaller screens */
  }

  .expense-summary,
  .income-summary,
  .total-summary {
    margin-bottom: 15px;
  }

  .tabs button {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>

