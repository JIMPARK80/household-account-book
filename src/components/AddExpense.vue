<template>
  <div class="dashboard-view">
    <!-- Summary Section -->
    <div class="summary-grid">
      <div class="summary-item">
        <span class="label">Expense</span>
        <span class="value expense">-{{ totalExpense }} {{ entry.currency }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Income</span>
        <span class="value income">+{{ totalIncome }} {{ entry.currency }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Balance</span>
        <span class="value balance">{{ total }} {{ entry.currency }}</span>
      </div>
    </div>

    <!-- Tabs for Expense and Income -->
    <div class="tabs">
      <button @click="setType('expense')" :class="{ active: type === 'expense' }">Expense</button>
      <button @click="setType('income')" :class="{ active: type === 'income' }">Income</button>
    </div>

    <!-- Input Form -->
    <form @submit.prevent="addOrUpdateEntry" class="form-container">
      <div class="form-group compact">
        <label for="date">Date</label>
        <input id="date" v-model="entry.date" type="date" required />
      </div>
      <div class="form-group compact">
        <label for="note">Note</label>
        <input id="note" v-model="entry.note" type="text" placeholder="Enter value" />
      </div>
      <div class="form-group compact">
        <label for="amount">{{ type === 'expense' ? 'Expense' : 'Income' }}</label>
        <input id="amount" v-model="entry.amount" type="number" placeholder="0.00" required />
      </div>
      <div class="form-group compact">
        <label for="currency">Currency</label>
        <select id="currency" v-model="entry.currency" required>
          <option value="CAD">CAD</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
          <option value="KRW">KRW</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <!-- Categories -->
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

      <!-- Submit Button -->
      <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Submit' }}</button>
    </form>

    <!-- Entered Values List -->
    <div class="expense-list">
      <ul>
        <li v-for="expense in currentEntries" :key="expense.id">
          <div class="expense-details">
            <strong>{{ expense.date }}</strong>: {{ expense.note }} - 
            {{ expense.amount }} {{ expense.currency }}
            <em>({{ expense.category }})</em>
          </div>
          <div class="actions">
            <button @click="editEntry(expense)" class="edit-button">Edit</button>
            <button @click="deleteEntry(expense.id)" class="delete-button">Delete</button>
          </div>
        </li>
      </ul>
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
  max-width: 600px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Summary Section */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.summary-item {
  text-align: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
}

.summary-item .value {
  display: block;
  font-size: 16px;
}

.summary-item .expense {
  color: #e53935;
}

.summary-item .income {
  color: #1e88e5;
}

.summary-item .balance {
  color: #43a047;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  gap: 5px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border: 1px solid #ffa726;
  background-color: #ffffff;
  color: #ffa726;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.tabs button.active {
  background-color: #ffa726;
  color: #ffffff;
}

.tabs button:hover {
  background-color: #ffd54f;
}

/* Form Styling */
.form-container {
  display: grid;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #ffa726;
  outline: none;
}

/* Categories */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.category {
  text-align: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.category:hover,
.category.selected {
  background-color: #ffa726;
  color: #ffffff;
}

/* Buttons */
.submit-button {
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  background-color: #ffa726;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #ff9800;
}

/* Entered Values */
.expense-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.expense-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.expense-details {
  flex: 1;
}

.actions {
  display: flex;
  gap: 5px;
}

.edit-button,
.delete-button {
  padding: 5px 10px;
  font-size: 12px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-button {
  background-color: #4caf50;
  color: #ffffff;
}

.delete-button {
  background-color: #e53935;
  color: #ffffff;
}

.edit-button:hover {
  background-color: #43a047;
}

.delete-button:hover {
  background-color: #d32f2f;
}
</style>
