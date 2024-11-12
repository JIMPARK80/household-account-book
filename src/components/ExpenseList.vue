<template>
  <div class="expense-list">
    <h2 class="center-title">== Expense List - Calendar (가계부-달력) ==</h2>


    <!-- Calendar View Component (Only View) -->
    <CalendarView :events="filteredEntries" />


    <!-- Category Filter and Sort Options -->
    <h3 class="center-title">-- Detail History (상세이력) -- </h3>

    <div class="filter-sort-controls">
      <label>
        Category:
        <select v-model="selectedCategory">
          <option value="">All</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </label>

      <label>
        Sort by:
        <select v-model="sortBy">
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
      </label>
    </div>


    <!-- Transaction List Component (Detailed List) -->
    <div class="transaction-list-container">
      <TransactionList
        :entries="filteredEntries"
        @edit-entry="editEntry"
        @delete-entry="deleteEntry"
      />
    </div>

    <!-- Add Expense Component for Adding or Editing -->
    <AddExpense
      v-if="showAddExpense"
      :editingEntry="editingEntry"
      @updateList="fetchEntries"
      @close="closeAddExpense"
    />
  </div>
</template>

<script>
import CalendarView from './CalendarView.vue';
import TransactionList from './TransactionList.vue';
import AddExpense from './AddExpense.vue';

export default {
  components: {
    CalendarView,
    TransactionList,
    AddExpense,
  },
  data() {
    return {
      entries: [], // Expense and income entries
      selectedCategory: '',
      sortBy: 'date',
      categories: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Others'],
      showAddExpense: false, // Controls AddExpense component visibility
      editingEntry: null, // Stores the entry being edited
    };
  },
  computed: {
    filteredEntries() {
      let filtered = this.entries;

      // Apply category filter
      if (this.selectedCategory) {
        filtered = filtered.filter(entry => entry.category === this.selectedCategory);
      }

      // Sort entries
      if (this.sortBy === 'date') {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (this.sortBy === 'amount') {
        filtered.sort((a, b) => b.amount - a.amount);
      }

      return filtered;
    },
  },
  created() {
    this.fetchEntries();
  },
  methods: {
    fetchEntries() {
      // Fetch entries from localStorage
      const savedEntries = JSON.parse(localStorage.getItem('entries')) || [];
      this.entries = savedEntries;
    },
    editEntry(entry) {
      // Open the AddExpense component in edit mode
      this.editingEntry = entry;
      this.showAddExpense = true;
    },
    deleteEntry(id) {
      // Delete the entry from entries array and update localStorage
      this.entries = this.entries.filter(entry => entry.id !== id);
      localStorage.setItem('entries', JSON.stringify(this.entries));
    },
    closeAddExpense() {
      // Close AddExpense component and reset editing entry
      this.showAddExpense = false;
      this.editingEntry = null;
    },
  },
};
</script>

<style scoped>
.expense-list {
  max-width: 800px;
  margin: auto;
  align-items: center;
}
.center-title {
  text-align: center;
}

.filter-sort-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.transaction-list-container {
  margin-top: 20px;
}
</style>
