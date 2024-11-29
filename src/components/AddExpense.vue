<template>
  <div class="dashboard-view">
    <!-- Summary Section -->
      <div class="income-expense-summary">
      <!-- Expense -->
      <div class="summary-item expense">
        <div class="label">지출</div>
        <div class="value">-{{ totalExpense }} CAD</div>
      </div>
      <!-- Income -->
      <div class="summary-item income">
        <div class="label">수입</div>
        <div class="value">+{{ totalIncome }} CAD</div>
      </div>
      <!-- Balance -->
      <div class="summary-item balance">
        <div class="label">잔액</div>
        <div class="value">{{ total }} CAD</div>
      </div>
  </div>

    <!-- Tabs for Expense and Income -->
    <div class="tabs">
      <button @click="setType('expense')" :class="{ active: type === 'expense' }">지출</button>
      <button @click="setType('income')" :class="{ active: type === 'income' }">수입</button>
    </div>

    <!-- Input Form -->
    <form @submit.prevent="addOrUpdateEntry" class="form-container">

      <!-- Category Field -->
      <div class="form-group category-section">
        <label class="category-title">카테고리</label>
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
      

      <div class="form-group compact">
        <label for="date">날짜</label>
        <input id="date" v-model="entry.date" type="date" required />
      </div>
      <div class="form-group compact">
        <label for="note">내용</label>
        <input id="note" v-model="entry.note" type="text" placeholder="Enter value" />
      </div>
      <div class="form-group compact">
        <label for="amount">{{ type === 'expense' ? '지출' : '수입' }}</label>
        <input id="amount" v-model="entry.amount" type="number" placeholder="0.00" required />
      </div>
      <div class="form-group compact">
        <label for="currency">화폐단위</label>
        <select id="currency" v-model="entry.currency" required>
          <option value="CAD">CAD</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
          <option value="KRW">KRW</option>
        </select>
      </div>



      <!-- Submit Button -->
      <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Submit' }}</button>
    </form>

    <!-- Entered Values List -->
    <div class="expense-list">
    <!-- Recent Entries Title in Form-Group Style -->
    <div class="form-group recent-entries-title">
      <label for="recent-entries">최근항목 (Recent Entries)</label>
    </div>
    <ul id="recent-entries">
      <li v-for="expense in currentEntries.slice(0, currentEntries.length)" :key="expense.id">
        <div class="expense-details">
          <strong>{{ expense.date }}</strong>: {{ expense.note }} - 
          {{ expense.amount }} {{ expense.currency }}
          <em>({{ expense.category }})</em>
        </div>
        <div class="actions">
          <button @click="editEntry(expense)" class="edit-button">수정</button>
          <button @click="deleteEntry(expense.id)" class="delete-button">삭제</button>
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
        { name: "Medical", icon: "fas fa-heartbeat" },
        { name: "Education", icon: "fas fa-book" },
        { name: "Electric bill", icon: "fas fa-lightbulb" },
        { name: "Transportation", icon: "fas fa-bus" },
        { name: "Contact fee", icon: "fas fa-phone" },
        { name: "Housing expenses", icon: "fas fa-home" },
      ],
      incomeCategories: [
        { name: "Salary", icon: "fas fa-wallet" },
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
        alert("모든내용 입력해주세요. Please complete all required fields.");
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
  font-family: "Arial", sans-serif;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #333;
}

/* Header Section */
.dashboard-view h1 {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}

/* Expenditure and Income Section */
.income-expense-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.summary-item .value {
  font-size: 16px;
  font-weight: bold;
}

.summary-item.expense .value {
  color: #e53935;
}

.summary-item.income .value {
  color: #1e88e5;
}

.summary-item.balance .value {
  color: #43a047;
}

/* Tabs for switching between Expense and Income */
.tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.tabs button {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: bold;
  color: #555;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tabs button:hover {
  background-color: #ffa726;
  color: #ffffff;
}

.tabs button.active {
  background-color: #ffa726;
  color: #ffffff;
  border-color: #ffa726;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

/* Category Section */
.category-section {
  margin-bottom: 20px;
}

.category-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
}

.category {
  text-align: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category:hover {
  background-color: #ffa726;
  color: #ffffff;
}

.category i {
  font-size: 20px;
  margin-bottom: 5px;
}

.category span {
  font-size: 14px;
  display: block;
}

/* Form Styling */
.form-container {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #ffa726;
  outline: none;
}

/* Submit Button */
.submit-button {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #ffa726;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #ff9800;
}

/* Recent Entries Section */
.expense-list {
  max-height: 140px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.expense-list h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.expense-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.expense-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.expense-list li .expense-details {
  font-size: 14px;
}

.expense-list li .actions {
  display: flex;
  gap: 5px;
}

.actions button {
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.actions .edit-button {
  background-color: #4caf50;
  color: #ffffff;
}

.actions .delete-button {
  background-color: #e53935;
  color: #ffffff;
}

.actions .edit-button:hover {
  background-color: #43a047;
}

.actions .delete-button:hover {
  background-color: #d32f2f;
}

/* Scrollbar Styling */
.expense-list::-webkit-scrollbar {
  width: 6px;
}

.expense-list::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.expense-list::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
</style>

