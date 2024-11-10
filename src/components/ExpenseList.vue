<template>
  <div class="expense-list">
    <h2>Expense List</h2>

    <!-- Filter by Category -->
    <div class="filters">
      <label for="category-filter">Filter by Category:</label>
      <select v-model="selectedCategory" @change="applyFilters">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <!-- Sort Options -->
      <label for="sort-by">Sort By:</label>
      <select v-model="sortBy" @change="sortEntries">
        <option value="date">Date</option>
        <option value="amount">Amount</option>
      </select>
    </div>

    <!-- List of Entries -->
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in filteredEntries" :key="index">
          <td>{{ entry.date }}</td>
          <td :class="{ income: entry.type === 'income', expense: entry.type === 'expense' }">
            {{ formatCurrency(entry.amount) }}
          </td>
          <td>{{ entry.category }}</td>
          <td>{{ entry.type }}</td>
          <td><button @click="deleteEntry(index)">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entries: [],
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
    applyFilters() {
      // Trigger the computed property to update
    },
    sortEntries() {
      // Trigger the computed property to update
    },
    deleteEntry(index) {
      // Remove entry from entries array and update localStorage
      this.entries.splice(index, 1);
      localStorage.setItem('entries', JSON.stringify(this.entries));
    },
    formatCurrency(value) {
      return `$${parseFloat(value).toFixed(2)}`;
    },
  },
};
</script>

<style scoped>
.expense-list {
  max-width: 800px;
  margin: auto;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.income {
  color: green;
}

.expense {
  color: red;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
