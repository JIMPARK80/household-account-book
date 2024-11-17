<template>
  <div class="dashboard-view">
    <!-- 수입/지출 요약 -->
    <h3>수입/지출 요약</h3>
    <div class="income-expense-summary">
      <div class="expense-summary">
        <span>지출</span>
        <span class="expense">-{{ totalExpense }}$</span>
      </div>
      <div class="income-summary">
        <span>수입:</span>
        <span class="income">+{{ totalIncome }}$</span>
      </div>
      <div class="total-summary">
        <span>수입과 지출</span>
        <span class="total">{{ total }}$</span>
      </div>
    </div>

    <div class="input-form">
      <!-- Tabs for Expense and Income -->
      <div class="tabs">
        <button @click="setType('expense')" :class="{ active: type === 'expense' }">Expense</button>
        <button @click="setType('income')" :class="{ active: type === 'income' }">Income</button>
      </div>

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

        <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Submit' }}</button>
      </form>

      <!-- Display Entered Values -->
      <div class="expense-list">
        <h3>Entered Values</h3>
        <ul>
          <li v-for="expense in currentEntries" :key="expense.id">
            <strong>{{ expense.date }}</strong>: {{ expense.note }} -
            {{ type === 'expense' ? 'Expense' : 'Income' }}: {{ expense.amount }}
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
      if (!this.entry.date || !this.entry.amount || !this.entry.category) {
        alert("Please complete all required fields.");
        return;
      }
      const db = await setupDatabase();
      if (this.isEditing) {
        const index = this.expenses.findIndex((expense) => expense.id === this.entry.id);
        if (index !== -1) {
          this.expenses.splice(index, 1, { ...this.entry });
        }
        const transaction = db.transaction(this.type === "expense" ? "expenses" : "income", "readwrite");
        const store = transaction.objectStore(this.type === "expense" ? "expenses" : "income");
        await store.put({ ...this.entry });
      } else {
        this.entry.id = Date.now();
        if (this.type === "expense") {
          await addExpense(db, { ...this.entry, type: this.type });
          this.expenses.push({ ...this.entry });
        } else {
          await addIncome(db, { ...this.entry, type: this.type });
          this.income.push({ ...this.entry });
        }
      }
      this.resetForm();
    },
    resetForm() {
      this.isEditing = false;
      this.entry = { id: null, date: new Date().toISOString().split("T")[0], note: "", amount: 0, category: "" };
    },
    editEntry(entry) {
      this.isEditing = true;
      this.entry = { ...entry };
      this.type = entry.type;
    },
    async deleteEntry(id) {
      if (!confirm("Are you sure you want to delete this entry?")) {
        return;
      }
      const index = this.expenses.findIndex((expense) => expense.id === id);
      if (index !== -1) {
        this.expenses.splice(index, 1);
      }
      const db = await setupDatabase();
      const transaction = db.transaction(this.type === "expense" ? "expenses" : "income", "readwrite");
      const store = transaction.objectStore(this.type === "expense" ? "expenses" : "income");
      await store.delete(id);
    },
  },
};
</script>

<style>
/* General Layout */
.dashboard-view {
  font-family: 'Arial', sans-serif;
  margin: 20px auto;
  max-width: 800px;
  padding: 20px;
  background-color: #f4f4f9;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Income and Expense Summary Section */
.income-expense-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.expense-summary, .income-summary, .total-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
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

/* Tabs for Expense and Income */
.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tabs button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s ease;
  width: 48%;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

.tabs button:hover {
  background-color: #e1e1e1;
}

/* Form Input Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 16px;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

/* Category Section */
.category-section {
  margin-top: 20px;
}

.category-section h3 {
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.category:hover {
  background-color: #f0f8ff;
}

.category.selected {
  background-color: #e6f7ff;
  border-color: #007bff;
}

.category i {
  font-size: 30px;
  margin-bottom: 10px;
}

.category span {
  font-size: 16px;
  font-weight: bold;
}

/* Submit Button */
.submit-button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  width: 100%;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #0056b3;
}

/* Entered Values List */
.expense-list {
  margin-top: 20px;
}

.expense-list h3 {
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
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
    grid-template-columns: repeat(2, 1fr);
  }

  .expense-summary, .income-summary, .total-summary {
    margin-bottom: 15px;
  }

  .tabs button {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>