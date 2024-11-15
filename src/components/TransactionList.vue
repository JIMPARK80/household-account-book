<template>
  <div class="transaction-list-container">
    <h3>Entries</h3>

    <!-- Sort By Filter -->
    <label for="sort">Sort by:</label>
    <select v-model="sortBy" id="sort">
      <option value="date">Date</option>
      <option value="amount">Amount</option>
    </select>

    <!-- Sort Order Toggle -->
    <label for="order">Order:</label>
    <select v-model="sortOrder" id="order">
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>

    <ul class="transaction-list">
      <li v-for="entry in sortedEntries" :key="entry.id" class="transaction-item">
        <div class="transaction-details">
          <span class="transaction-category">{{ entry.category }}</span>
          <span class="transaction-note">{{ entry.note }}</span>
          <span class="transaction-date">{{ formatDate(entry.date) }}</span>
        </div>
        <span class="transaction-amount" :class="{ income: entry.type === 'income', expense: entry.type === 'expense' }">
          {{ formatCurrency(entry.amount) }}
        </span>
        <button @click="editEntry(entry)">Edit</button>
        <button @click="deleteEntry(entry.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns';
import { setupDatabase, getAllExpenses, deleteExpense } from '../database.js';

export default {
  data() {
    return {
      entries: [],
      sortBy: 'date',
      sortOrder: 'asc', // Add sortOrder to control ascending or descending order
    };
  },
  computed: {
    sortedEntries() {
      // Sort entries by date or amount based on sortBy and sortOrder selection
      const sortedEntries = [...this.entries];
      sortedEntries.sort((a, b) => {
        let comparison = 0;
        if (this.sortBy === 'date') {
          comparison = new Date(a.date) - new Date(b.date);
        } else if (this.sortBy === 'amount') {
          comparison = a.amount - b.amount;
        }

        // Adjust for ascending or descending order
        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
      return sortedEntries;
    }
  },
  async created() {
    await this.fetchEntries();
  },
  methods: {
    async fetchEntries() {
      const db = await setupDatabase();
      const savedEntries = await getAllExpenses(db);
      this.entries = savedEntries.map(entry => ({
        ...entry,
        date: parseISO(entry.date),
      }));
    },
    formatDate(date) {
      return format(date, 'yyyy-MM-dd');
    },
    formatCurrency(value) {
      return `${value.toFixed(2)}$`;
    },
    editEntry(entry) {
      this.$emit('edit-entry', entry);
    },
    async deleteEntry(id) {
      const db = await setupDatabase();
      await deleteExpense(db, id);
      this.entries = this.entries.filter(entry => entry.id !== id);
    },
  },
};
</script>

<style scoped>
.transaction-list-container {
  border-top: 1px solid #ddd;
  margin-top: 20px;
  padding-top: 10px;
}

.transaction-list-container h3 {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.transaction-list {
  list-style: none;
  padding: 0;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.transaction-details {
  display: flex;
  flex-direction: column;
}

.transaction-category {
  font-weight: bold;
}

.transaction-date {
  font-size: 0.9em;
  color: gray;
}

.transaction-amount {
  font-size: 1em;
}

.income {
  color: blue;
}

.expense {
  color: red;
}
</style>
