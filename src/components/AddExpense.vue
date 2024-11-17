<template>
  <div class="input-form">
    <!-- Tabs for Expense and Income | 지출 및 수입을 선택할 탭 -->
    <div class="tabs">
      <button @click="setType('expense')" :class="{ active: type === 'expense' }">Expense</button>
      <button @click="setType('income')" :class="{ active: type === 'income' }">Income</button>
    </div>

    <!-- Input Form | 입력 폼 -->
    <form @submit.prevent="addOrUpdateEntry">
      <!-- Date Input | 날짜 입력 -->
      <div class="form-group">
        <label>Date:</label>
        <input v-model="entry.date" type="date" required />
      </div>

      <!-- Note Input | 메모 입력 -->
      <div class="form-group">
        <label>Note:</label>
        <input v-model="entry.note" type="text" placeholder="Enter value" />
      </div>

      <!-- Amount Input | 금액 입력 -->
      <div class="form-group">
        <label>{{ type === 'expense' ? 'Expense' : 'Income' }}:</label>
        <input v-model="entry.amount" type="number" placeholder="0.00" required />
      </div>

      <!-- Category Section | 카테고리 섹션 -->
      <div class="category-section">
        <h3>Category</h3> <!-- Title for Category Section | 카테고리 섹션 제목 -->

        <!-- Category Grid | 카테고리 목록 -->
        <div class="category-grid">
          <div
            v-for="category in currentCategories"
            :key="category.name"
            :class="{ selected: entry.category === category.name }"
            class="category"
            @click="selectCategory(category.name)"
          >
            <!-- Category Icon | 카테고리 아이콘 -->
            <i :class="category.icon"></i>
            <!-- Category Name | 카테고리 이름 -->
            <span>{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- Submit Button | 제출 버튼 -->
      <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Submit' }}</button>
    </form>

    <!-- Display Entered Values | 입력된 값 표시 -->
    <div class="expense-list">
      <h3>Entered Values</h3> <!-- Title for Entered Values Section | 입력된 값 섹션 제목 -->
      <ul>
        <li v-for="expense in currentEntries" :key="expense.id">
          <strong>{{ expense.date }}</strong>: {{ expense.note }} -
          {{ type === 'expense' ? 'Expense' : 'Income' }}: {{ expense.amount }}
          <em>({{ expense.category }})</em>
          <!-- Edit Button -->
          <button @click="editEntry(expense)">Edit</button>
          <!-- Delete Button -->
          <button @click="deleteEntry(expense.id)">Delete</button>
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
      isEditing: false, // Whether we are editing an entry | 항목을 수정 중인지 여부
      type: "expense", // Default tab is 'expense' | 기본 탭은 '지출'
      entry: {
        id: null, // Entry ID | 항목 ID
        date: new Date().toISOString().split("T")[0], // Today's date | 오늘 날짜
        note: "", // Note for the entry | 항목에 대한 메모
        amount: 0, // Amount for the entry | 항목의 금액
        category: "", // Selected category | 선택된 카테고리
      },
      expenses: [], // List of entered expenses | 입력된 지출 목록
      income: [], // List of entered income | 입력된 수입 목록
      expenseCategories: [
        { name: "Food", icon: "fas fa-utensils" }, // 기본 카테고리: 음식
        { name: "Houseware", icon: "fas fa-home" }, // 기본 카테고리: 가구
        { name: "Clothes", icon: "fas fa-tshirt" }, // 기본 카테고리: 의류
        { name: "Cosmetic", icon: "fas fa-paint-brush" }, // 기본 카테고리: 화장품
        { name: "Medical", icon: "fas fa-heartbeat" }, // 기본 카테고리: 의료
        { name: "Education", icon: "fas fa-book" }, // 기본 카테고리: 교육
        { name: "Electric bill", icon: "fas fa-lightbulb" }, // 기본 카테고리: 전기 요금
        { name: "Transportation", icon: "fas fa-bus" }, // 기본 카테고리: 교통
        { name: "Contact fee", icon: "fas fa-phone" }, // 기본 카테고리: 통신비
        { name: "Housing expenses", icon: "fas fa-home" }, // 기본 카테고리: 주거비
      ],
      incomeCategories: [
        { name: "Salary", icon: "fas fa-wallet" }, // 기본 카테고리: 월급
        { name: "Pocket money", icon: "fas fa-piggy-bank" }, // 기본 카테고리: 용돈
        { name: "Bonus", icon: "fas fa-gift" }, // 기본 카테고리: 보너스
        { name: "Side job", icon: "fas fa-money-bill-alt" }, // 기본 카테고리: 부업
        { name: "Investment", icon: "fas fa-coins" }, // 기본 카테고리: 투자
        { name: "Extra", icon: "fas fa-hand-holding-usd" }, // 기본 카테고리: 기타 수익
      ],
    };
  },
  async mounted() {
    // Initialize the database and load saved categories and expenses | 데이터베이스 초기화 및 저장된 카테고리와 지출 로드
    const db = await setupDatabase();

    // Load saved expenses and income | 저장된 지출 항목 로드
    this.expenses = await getAllExpenses(db);
    this.income = await getAllIncome(db);
  },
  computed: {
    // Return categories based on selected tab (expense or income) | 선택된 탭(지출 또는 수입)에 따라 카테고리 반환
    currentCategories() {
      return this.type === "expense" ? this.expenseCategories : this.incomeCategories;
    },
    // Return entries based on selected tab (expense or income) | 선택된 탭에 따라 항목 반환
    currentEntries() {
      return this.type === "expense" ? this.expenses : this.income;
    },
  },
  methods: {
    // Switch between Expense and Income tabs | 지출 및 수입 탭 전환
    setType(newType) {
      this.type = newType;
      this.entry.amount = 0;
      this.entry.category = "";
    },
    // Select a category | 카테고리 선택
    selectCategory(categoryName) {
      this.entry.category = categoryName; // Set selected category | 선택된 카테고리 설정
    },
    // Add or update an entry | 항목 추가 또는 업데이트
    async addOrUpdateEntry() {
      if (!this.entry.date || !this.entry.amount || !this.entry.category) {
        alert("Please complete all required fields.");
        return;
      }

      const db = await setupDatabase();

      if (this.isEditing) {
        // Update the existing entry
        const index = this.expenses.findIndex((expense) => expense.id === this.entry.id);
        if (index !== -1) {
          this.expenses.splice(index, 1, { ...this.entry }); // Update the local state
        }

        const transaction = db.transaction(this.type === 'expense' ? "expenses" : "income", "readwrite");
        const store = transaction.objectStore(this.type === 'expense' ? "expenses" : "income");
        await store.put({ ...this.entry }); // Update IndexedDB
      } else {
        // Add a new entry
        this.entry.id = Date.now(); // Generate a unique ID
        if (this.type === 'expense') {
          await addExpense(db, { ...this.entry, type: this.type }); // Save to IndexedDB
          this.expenses.push({ ...this.entry }); // Update the local state for expenses
        } else {
          await addIncome(db, { ...this.entry, type: this.type }); // Save to IndexedDB
          this.income.push({ ...this.entry }); // Update the local state for income
        }
      }

      this.resetForm(); // Reset the form
    },
    // Reset the form | 입력 필드 초기화
    resetForm() {
      this.isEditing = false;
      this.entry = {
        id: null,
        date: new Date().toISOString().split("T")[0],
        note: "",
        amount: 0,
        category: "",
      };
    },
    editEntry(entry) {
      this.isEditing = true;
      this.entry = { ...entry };
      this.type = entry.type; // Set the type (expense or income)
    },
    async deleteEntry(id) {
      if (!confirm("Are you sure you want to delete this entry?")) {
        return;
      }

      // Remove from local state
      const index = this.expenses.findIndex((expense) => expense.id === id);
      if (index !== -1) {
        this.expenses.splice(index, 1);
      }

      // Remove from IndexedDB
      const db = await setupDatabase();
      const transaction = db.transaction(this.type === 'expense' ? "expenses" : "income", "readwrite");
      const store = transaction.objectStore(this.type === 'expense' ? "expenses" : "income");
      await store.delete(id);
    },
  },
};
</script>

<style scoped>
/* Grid layout for categories | 카테고리를 위한 그리드 레이아웃 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* Style for individual categories | 각 카테고리의 스타일 */
.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 10px;
  border: 2px solid transparent; /* 기본 테두리 */
  border-radius: 8px;
}

.category.selected {
  border-color: #ffa500; /* Highlight selected category | 선택된 카테고리 강조 */
  background-color: #fff8e1; /* 선택된 배경색 */
  color: black;
}

.category:hover {
  border-color: #ccc; /* Hover border color | 호버 시 테두리 색상 */
}

.category i {
  font-size: 24px; /* Icon size | 아이콘 크기 */
  margin-bottom: 5px;
}
</style>
