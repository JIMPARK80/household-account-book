<template>
  <div class="dashboard-view">
    <h1>Dashboard View</h1>

    <!-- Summary of Monthly Expenses -->
    <h2>Monthly Expense Summary</h2>
    <div v-if="monthlySummary.length">
      <Pie :data="chartData" />
    </div>
    <p v-else>No expenses available for summary.</p>
  </div>
</template>

<script>
import { setupDatabase, getAllExpenses } from '../database.js';
import { ref, onMounted, computed } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default {
  name: 'DashboardView',
  components: { Pie },
  setup() {
    const expenses = ref([]);
    const monthlySummary = computed(() => {
      const summary = {};
      expenses.value.forEach((expense) => {
        if (summary[expense.category]) {
          summary[expense.category] += expense.amount;
        } else {
          summary[expense.category] = expense.amount;
        }
      });
      return Object.keys(summary).map((category) => ({
        category,
        amount: summary[category],
      }));
    });

    const chartData = computed(() => ({
      labels: monthlySummary.value.map((item) => item.category),
      datasets: [
        {
          label: 'Expenses by Category',
          data: monthlySummary.value.map((item) => item.amount),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    }));

    onMounted(async () => {
      const db = await setupDatabase();
      expenses.value = await getAllExpenses(db);
    });

    return { chartData, monthlySummary };
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
</style>
