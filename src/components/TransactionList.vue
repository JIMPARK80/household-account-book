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
        <button @click="openEditForm(entry)">Edit</button>
        <button @click="deleteEntry(entry.id)">Delete</button>
      </li>
    </ul>

    <!-- Edit Form -->
    <div v-if="editingEntry" class="edit-form">
      <h3>Edit Entry</h3>
      <form @submit.prevent="updateEntry">
        <label for="date">Date:</label>
        <input type="date" v-model="selectedEntry.date" />

        <label for="note">Note:</label>
        <input type="text" v-model="selectedEntry.note" />

        <label for="amount">Amount:</label>
        <input type="number" v-model.number="selectedEntry.amount" />

        <label for="category">Category:</label>
        <input type="text" v-model="selectedEntry.category" />

        <button type="submit">Save</button>
        <button @click="cancelEdit">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns';
import { setupDatabase, getAllExpenses, deleteExpense, updateExpense } from '../database.js';

export default {
  data() {
    return {
      entries: [],
      editingEntry: false, // Track if an entry is being edited
      selectedEntry: null // Store the entry being edited
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
      return format(date, 'yyyy-MM-dd');
    },
    formatCurrency(value) {
      return `${value.toFixed(2)}$`;
    },
    openEditForm(entry) {
      // Set up the form for editing
      this.selectedEntry = { ...entry };
      this.editingEntry = true;
    },
    async updateEntry() {
      const db = await setupDatabase();
      await updateExpense(db, this.selectedEntry); // Update the entry in IndexedDB
      await this.fetchEntries(); // Refresh the list after updating
      this.editingEntry = false; // Close the edit form
    },
    cancelEdit() {
      // Reset the edit form
      this.editingEntry = false;
      this.selectedEntry = null;
    },
    async deleteEntry(id) {
      const db = await setupDatabase();
      await deleteExpense(db, id);
      this.entries = this.entries.filter(entry => entry.id !== id);
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

/* Edit form styling */
.edit-form {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
}

.edit-form label {
  display: block;
  margin-top: 10px;
}

.edit-form input {
  width: 100%;
  padding: 5px;
  margin-top: 5px;
  box-sizing: border-box;
}

.edit-form button {
  margin-top: 10px;
}
</style>
