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
        <span>Total Balance</span>
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
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
            <option value="INR">INR</option>
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
        currency: "USD", // Default currency
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
        currency: "USD",
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
/* Add any required styling adjustments if necessary */
</style>


<style>
/* 전반적인 레이아웃 */
.dashboard-view {
  font-family: 'Arial', sans-serif;  /* Use a simple, clean font */
  margin: 20px auto;
  max-width: 800px;
  padding: 20px;
  background-color: #f4f4f9;  /* Soft background */
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #333;  /* Default text color */
  line-height: 1.6;  /* Adjust line height for better spacing */
}

/* 수입 및 지출 요약 섹션 */
.income-expense-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 지출, 수입, 총 요약 */
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

/* 탭 버튼 */
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

/* 입력 폼 스타일 */
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

/* 카테고리 섹션 */
.category-section {
  margin-top: 50px;
}

.category-section h3 {
  font-size: 20px;
  margin-bottom: 10px;
  text-align: center;
  font-weight: bold; /* Stronger heading */
  color: #333; /* Darker text color */
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(131, 131, 131, 0.938); /* Black border added */
  border-radius: 5px;
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
  color: #333; /* Ensure the text inside the category is easily readable */
}

/* 제출 버튼 */
.submit-button {
  margin-top: 30px;
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

/* 입력된 값 리스트 */
.expense-list {
  margin-top: 50px;
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr); /* 작은 화면에서 카테고리 그리드를 두 열로 변경 */
  }

  .expense-summary, .income-summary, .total-summary {
    margin-bottom: 15px;
  }

  .tabs button {
    width: 100%;
    margin-bottom: 10px; /* 버튼을 전체 너비로 설정 */
  }
}
</style>
