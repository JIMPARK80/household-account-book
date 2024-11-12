<template>
  <div class="transaction-list-container">
    <h3>Entries</h3>
    <ul class="transaction-list">
      <li v-for="entry in entries" :key="entry.id" class="transaction-item">
        <div class="transaction-details">
          <span class="transaction-category">{{ entry.category }}</span>
          <span class="transaction-note">{{ entry.note }}</span>
          <span class="transaction-date">{{ formatDate(entry.date) }}</span>
        </div>
        <span class="transaction-amount" :class="{ income: entry.type === 'income', expense: entry.type === 'expense' }">
          {{ formatCurrency(entry.amount) }}
        </span>
        <!-- Edit and Delete Buttons -->
        <button @click="editEntry(entry)">Edit</button>
        <button @click="deleteEntry(entry.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns';

export default {
  data() {
    return {
      entries: []
    };
  },
  created() {
    this.fetchEntries();
  },
  methods: {
    fetchEntries() {
      // Retrieve entries from localStorage and parse dates to ensure local timezone consistency
      const savedEntries = JSON.parse(localStorage.getItem('entries')) || [];
      this.entries = savedEntries.map(entry => ({
        ...entry,
        date: parseISO(entry.date) // Parse date string to Date object
      }));
    },
    formatDate(date) {
      // Format the date as 'YYYY-MM-DD' for display
      return format(date, 'yyyy-MM-dd');
    },
    formatCurrency(value) {
      return `${value.toFixed(2)}$`;
    },
    editEntry(entry) {
      // Emit an event to open the AddExpense form with the selected entry's data
      this.$emit('edit-entry', entry);
    },
    deleteEntry(id) {
      // Filter out the entry to be deleted and update localStorage
      this.entries = this.entries.filter(entry => entry.id !== id);
      localStorage.setItem('entries', JSON.stringify(this.entries));
    }
  }
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
