<template>
  <div class="expense-list">
    <h2>Expense List</h2>

    <!-- Calendar View Component (Only View) -->
    <CalendarView :events="filteredEntries" />
  </div>
</template>

<script>
import CalendarView from './CalendarView.vue';

export default {
  components: {
    CalendarView
  },
  data() {
    return {
      entries: [], // Expense and income entries
      selectedCategory: '',
      sortBy: 'date',
      categories: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Others'],
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
    }
  },
  created() {
    this.fetchEntries();
  },
  methods: {
    fetchEntries() {
      // Fetch entries from localStorage
      const savedEntries = JSON.parse(localStorage.getItem('entries')) || [];
      this.entries = savedEntries;
    }
  }
};
</script>

<style scoped>
.expense-list {
  max-width: 800px;
  margin: auto;
}
</style>
