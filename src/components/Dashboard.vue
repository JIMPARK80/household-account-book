<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <!-- Monthly Summary -->
    <h3>Monthly Summary</h3>
    <ul>
      <li v-for="(total, month) in monthlySummary" :key="month">
        {{ month }}: ${{ total }}
      </li>
    </ul>

    <!-- Category Summary -->
    <h3>Category Summary</h3>
    <ul>
      <li v-for="(total, category) in categorySummary" :key="category">
        {{ category }}: ${{ total }}
      </li>
    </ul>

    <!-- Filter by Category -->
    <div class="filter">
      <label>Filter by Category:</label>
      <select v-model="selectedCategory" @change="applyCategoryFilter">
        <option value="">All Categories</option>
        <option
          v-for="(total, category) in categorySummary"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Filtered Expense List -->
    <h3>Filtered Expenses by Category</h3>
    <ul v-if="filteredByCategory.length">
      <li v-for="(expense, index) in filteredByCategory" :key="index">
        {{ expense.date }} - {{ expense.category }}: ${{ expense.amount }}
      </li>
    </ul>
    <p v-else>No expenses found for the selected category.</p>
  </div>
</template>

<script>
import { generateRecurringExpenses } from "@/utils/recurringExpenses"; // Adjust the path if needed
// Adjust the path if needed


export default {
  name: "DashboardView",
  data() {
    return {
      expenses: [],
      selectedCategory: "", // Selected category for filtering
    };
  },
  created() {
    // Load expenses from localStorage and generate recurring ones on component creation
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    this.expenses = generateRecurringExpenses(savedExpenses);
  },
  computed: {
    // Calculate total expenses for each month
    monthlySummary() {
      const monthlyTotals = {};
      this.expenses.forEach((expense) => {
        const month = new Date(expense.date).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (!monthlyTotals[month]) {
          monthlyTotals[month] = 0;
        }
        monthlyTotals[month] += Number(expense.amount);
      });
      return monthlyTotals;
    },

    // Calculate total expenses for each category
    categorySummary() {
      const categoryTotals = {};
      this.expenses.forEach((expense) => {
        const category = expense.category;
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += Number(expense.amount);
      });
      return categoryTotals;
    },

    // Filter expenses by selected category
    filteredByCategory() {
      if (!this.selectedCategory) return this.expenses;
      return this.expenses.filter(
        (expense) => expense.category === this.selectedCategory
      );
    }
  },
  methods: {
    applyCategoryFilter() {
      // Method is triggered when a category is selected from the dropdown
      // Computed property 'filteredByCategory' handles the filtering
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.filter {
  margin: 20px 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px 0;
}
</style>
