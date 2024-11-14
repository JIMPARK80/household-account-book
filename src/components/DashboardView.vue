<template>
  <div class="dashboard-view">
    <h1>Dashboard View</h1>

    <!-- Summary of Monthly Expenses -->
    <div v-if="monthlySummary.length">
      <h2>Monthly Summary</h2>
      <ul>
        <li v-for="summary in monthlySummary" :key="summary.category">
          {{ summary.category }}: {{ summary.amount }}$
        </li>
      </ul>
    </div>
    <p v-else>No expenses available for summary.</p>
  </div>
</template>

<script>
import { setupDatabase, getAllExpenses } from '../database.js';

export default {
  name: 'DashboardView',
  data() {
    return {
      expenses: [], // Initialize as an empty array
    };
  },
  computed: {
    monthlySummary() {
      // Ensure `this.expenses` is an array before processing
      if (!Array.isArray(this.expenses)) return [];

      // Example monthly summary logic: group by category and calculate totals
      const summary = {};
      this.expenses.forEach((expense) => {
        if (expense.category in summary) {
          summary[expense.category] += expense.amount;
        } else {
          summary[expense.category] = expense.amount;
        }
      });

      // Convert the summary object to an array of category-amount pairs
      return Object.keys(summary).map((category) => ({
        category,
        amount: summary[category],
      }));
    },
  },
  mounted() {
    // Load expenses from IndexedDB when the component is mounted
    this.loadExpenses();
  },
  methods: {
    async loadExpenses() {
      // Initialize the database and fetch all expenses
      const db = await setupDatabase();
      this.expenses = await getAllExpenses(db) || []; // Ensure it defaults to an array
    },
  },
};
</script>

<style scoped>
.dashboard-view {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

h2 {
  font-size: 20px;
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  font-size: 16px;
  padding: 5px 0;
}
</style>
