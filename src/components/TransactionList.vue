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
import { setupDatabase, getAllExpenses, deleteExpense, updateExpense } from '../database.js'; // Add updateExpense import

export default {
  data() {
    return {
      entries: []
    };
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
    async editEntry(entry) {
      const newAmount = prompt("Enter new amount:", entry.amount);
      if (newAmount !== null) {
        entry.amount = parseFloat(newAmount);
        
        // Update the entry in IndexedDB
        const db = await setupDatabase();
        await updateExpense(db, entry);
        
        // Refresh the entries list
        await this.fetchEntries();
      }
    },
    async deleteEntry(id) {
      const db = await setupDatabase();
      await deleteExpense(db, id); // Delete the entry from IndexedDB
      this.entries = this.entries.filter(entry => entry.id !== id); // Update the local list
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
