<template>
  <div class="expense-list">
    <h2 class="center-title">== Expense List - Calendar (가계부-달력) ==</h2>

    <!-- Calendar View Component (Only View) -->
    <CalendarView :events="filteredEntries" @month-change="handleMonthChange" />

    <!-- Display Monthly Income, Expense, and Total -->


    <!-- Transaction List Component (Detailed List) -->
    <h3 class="center-title">-- Detail History (상세이력) -- </h3>
    <div class="transaction-list-container">
      <TransactionList
        :entries="filteredAndSortedEntries"
        :selectedMonth="currentMonth"
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
import AddExpense from './AddExpense.vue';

export default {
  components: {
    CalendarView,
    AddExpense,
  },
  data() {
    return {
      entries: [], // All entries
      selectedCategory: '',
      sortBy: 'date',
      sortOrder: 'asc', // Ascending or descending order for sorting
      categories: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Others'],
      showAddExpense: false, // Controls AddExpense component visibility
      editingEntry: null, // Stores the entry being edited
      currentMonth: new Date(), // Current selected month
      previousBalance: 0, // Total balance carried over from previous months
    };
  },
  computed: {
    filteredEntries() {
      // Apply category filter if needed
      let filtered = this.entries;
      if (this.selectedCategory) {
        filtered = filtered.filter(entry => entry.category === this.selectedCategory);
      }
      return filtered;
    },
    filteredAndSortedEntries() {
      // Filter entries to only show those in the selected month and year
      const monthFilteredEntries = this.filteredEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === this.currentMonth.getMonth() &&
          entryDate.getFullYear() === this.currentMonth.getFullYear()
        );
      });

      // Sort the entries by date or amount based on the selected sort option and order
      const sortedEntries = [...monthFilteredEntries];
      sortedEntries.sort((a, b) => {
        let comparison = 0;
        if (this.sortBy === 'date') {
          comparison = new Date(a.date) - new Date(b.date);
        } else if (this.sortBy === 'amount') {
          comparison = a.amount - b.amount;
        }

        return this.sortOrder === 'asc' ? comparison : -comparison;
      });

      return sortedEntries;
    },
    monthlyIncome() {
      return this.filteredAndSortedEntries
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
    },
    monthlyExpense() {
      return this.filteredAndSortedEntries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
    },
  },
  watch: {
    currentMonth: {
      immediate: true,
      handler() {
        this.calculatePreviousBalance();
      },
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
    handleMonthChange(selectedDate) {
      // Update the selected month whenever the user navigates in the calendar
      this.currentMonth = selectedDate;
    },
    calculatePreviousBalance() {
      // Calculate the total balance up to the end of the previous month
      const previousEntries = this.entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() < this.currentMonth.getFullYear() ||
          (entryDate.getFullYear() === this.currentMonth.getFullYear() &&
            entryDate.getMonth() < this.currentMonth.getMonth())
        );
      });

      // Calculate previous balance
      const totalIncome = previousEntries
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
      const totalExpense = previousEntries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);

      this.previousBalance = totalIncome - totalExpense;
    },
    formatCurrency(value) {
      return `${value.toFixed(2)}$`;
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
  margin-bottom: 40px;
  margin-top: 40px;
}
.transaction-list-container {
  margin-top: 20px;
}
.monthly-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}
.income {
  color: green;
  font-weight: bold;
}
.expense {
  color: red;
  font-weight: bold;
}
.balance {
  font-weight: bold;
}
</style>
