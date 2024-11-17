<template>
  <div class="dashboard-view">
    <!-- 수입/지출 요약 -->
    <h3>Expense & Income </h3>
    <div class="income-expense-summary">
      <!-- 지출 요약 -->
      <div class="expense-summary">
        <span>Expense: </span>
        <span class="expense">-{{ totalExpense }}$</span> <!-- 지출 금액 표시 -->
      </div>
      <!-- 수입 요약 -->
      <div class="income-summary">
        <span>Income: </span>
        <span class="income">+{{ totalIncome }}$</span> <!-- 수입 금액 표시 -->
      </div>
      <!-- 총 잔액 -->
      <div class="total-summary">
        <span>Total Balance</span>
        <span class="total">{{ total }}$</span> <!-- 잔액 표시 -->
      </div>
    </div>

    <!-- 입력 폼 -->
    <div class="input-form">
      <!-- 지출과 수입 탭 선택 -->
      <div class="tabs">
        <button @click="setType('expense')" :class="{ active: type === 'expense' }">Expense</button> <!-- 지출 탭 -->
        <button @click="setType('income')" :class="{ active: type === 'income' }">Income</button> <!-- 수입 탭 -->
      </div>

      <!-- 입력 폼 -->
      <form @submit.prevent="addOrUpdateEntry">
        <div class="form-group">
          <label>Date:</label>
          <input v-model="entry.date" type="date" required /> <!-- 날짜 입력 -->
        </div>
        <div class="form-group">
          <label>Note:</label>
          <input v-model="entry.note" type="text" placeholder="Enter value" /> <!-- 메모 입력 -->
        </div>
        <div class="form-group">
          <label>{{ type === 'expense' ? 'Expense' : 'Income' }}:</label>
          <input v-model="entry.amount" type="number" placeholder="0.00" required /> <!-- 금액 입력 -->
        </div>

        <!-- 카테고리 선택 -->
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
              <i :class="category.icon"></i> <!-- 카테고리 아이콘 -->
              <span>{{ category.name }}</span> <!-- 카테고리 이름 -->
            </div>
          </div>
        </div>

        <!-- 제출 버튼 -->
        <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Submit' }}</button> <!-- 제출 또는 수정 -->
      </form>

      <!-- 입력된 값 리스트 -->
      <div class="expense-list">
        <h3>Entered Values</h3>
        <ul>
          <li v-for="expense in currentEntries" :key="expense.id">
            <strong>{{ expense.date }}</strong>: {{ expense.note }} -
            {{ type === 'expense' ? 'Expense' : 'Income' }}: {{ expense.amount }}
            <em>({{ expense.category }})</em>
            <!-- 수정 버튼 -->
            <button @click="editEntry(expense)">Edit</button>
            <!-- 삭제 버튼 -->
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
     isEditing: false, // 항목 수정 여부
     type: "expense", // 기본 탭은 '지출'
     entry: { // 입력된 항목 데이터
       id: null,
       date: new Date().toISOString().split("T")[0], // 현재 날짜
       note: "", // 메모
       amount: 0, // 금액
       category: "", // 카테고리
     },
     expenses: [], // 지출 목록
     income: [], // 수입 목록
     expenseCategories: [ // 지출 카테고리 목록
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
     incomeCategories: [ // 수입 카테고리 목록
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
   this.expenses = await getAllExpenses(db); // 저장된 지출 항목 불러오기
   this.income = await getAllIncome(db); // 저장된 수입 항목 불러오기
 },
 computed: {
   totalExpense() {
     return this.expenses.reduce((total, expense) => total + expense.amount, 0); // 총 지출 계산
   },
   totalIncome() {
     return this.income.reduce((total, income) => total + income.amount, 0); // 총 수입 계산
   },
   total() {
     return this.totalIncome - this.totalExpense; // 총 잔액 계산
   },
   currentCategories() {
     return this.type === "expense" ? this.expenseCategories : this.incomeCategories; // 현재 선택된 탭에 따른 카테고리 목록
   },
   currentEntries() {
     return this.type === "expense" ? this.expenses : this.income; // 현재 선택된 탭에 따른 항목 목록
   },
 },
 methods: {
   setType(newType) {
     this.type = newType; // 탭 변경
     this.entry.amount = 0; // 금액 초기화
     this.entry.category = ""; // 카테고리 초기화
   },
   selectCategory(categoryName) {
     this.entry.category = categoryName; // 카테고리 선택
   },
   async addOrUpdateEntry() {
     if (!this.entry.date || !this.entry.amount || !this.entry.category) {
       alert("Please complete all required fields."); // 필수 입력 항목이 비어있으면 경고
       return;
     }
     const db = await setupDatabase();
     if (this.isEditing) {
       const index = this.expenses.findIndex((expense) => expense.id === this.entry.id); // 수정 중인 항목 찾기
       if (index !== -1) {
         this.expenses.splice(index, 1, { ...this.entry }); // 기존 항목 업데이트
       }
       const transaction = db.transaction(this.type === "expense" ? "expenses" : "income", "readwrite");
       const store = transaction.objectStore(this.type === "expense" ? "expenses" : "income");
       await store.put({ ...this.entry }); // IndexedDB에 저장
     } else {
       this.entry.id = Date.now(); // 고유 ID 생성
       if (this.type === "expense") {
         await addExpense(db, { ...this.entry, type: this.type }); // 지출 항목 추가
         this.expenses.push({ ...this.entry });
       } else {
         await addIncome(db, { ...this.entry, type: this.type }); // 수입 항목 추가
         this.income.push({ ...this.entry });
       }
     }
     this.resetForm(); // 폼 초기화
   },
   resetForm() {
     this.isEditing = false;
     this.entry = { id: null, date: new Date().toISOString().split("T")[0], note: "", amount: 0, category: "" }; // 입력 폼 초기화
   },
   editEntry(entry) {
     this.isEditing = true; // 수정 모드로 전환
     this.entry = { ...entry }; // 선택한 항목을 폼에 로드
     this.type = entry.type; // 항목의 타입 설정
   },
   async deleteEntry(id) {
     if (!confirm("Are you sure you want to delete this entry?")) {
       return; // 삭제 확인
     }
     const index = this.expenses.findIndex((expense) => expense.id === id); // 삭제할 항목 찾기
     if (index !== -1) {
       this.expenses.splice(index, 1); // 로컬 상태에서 삭제
     }
     const db = await setupDatabase();
     const transaction = db.transaction(this.type === "expense" ? "expenses" : "income", "readwrite");
     const store = transaction.objectStore(this.type === "expense" ? "expenses" : "income");
     await store.delete(id); // IndexedDB에서 삭제
   },
 },
};
</script>

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
