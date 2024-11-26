<template>
  <div class="dashboard-view">
    <h1>Dashboard View</h1>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <button @click="previousGraph" class="nav-button">←</button>
      <button @click="nextGraph" class="nav-button">→</button>
    </div>

    <!-- Graphs Displayed Based on Current Selection -->
    <div class="graphs">
      <!-- Monthly Money Flow Graph -->
      <div v-if="currentGraph === 1">
        <h2>Monthly Money Flow</h2>
        <div v-if="hasMonthlyData">
          <Bar :data="moneyFlowChartData" :options="chartOptions" />
        </div>
        <p v-else>No data available for money flow comparison.</p>
      </div>

      <!-- Monthly Expense Summary Graph -->
      <div v-if="currentGraph === 2">
        <h2>Monthly Expense Summary</h2>
        <div v-if="monthlySummary.expenses.length">
          <Pie :data="expenseChartData" :options="pieChartOptions" />
        </div>
        <p v-else>No expense data available for summary.</p>
      </div>

      <!-- Monthly Income Summary Graph -->
      <div v-if="currentGraph === 3">
        <h2>Monthly Income Summary</h2>
        <div v-if="monthlySummary.income.length">
          <Pie :data="incomeChartData" :options="pieChartOptions" />
        </div>
        <p v-else>No income data available for summary.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { setupDatabase, getAllExpenses, getAllIncome } from "../database.js";
import { ref, onMounted, computed } from "vue";
import { Pie, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  BarElement,
  LinearScale,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale, ChartDataLabels);

export default {
  name: "DashboardView",
  components: { Pie, Bar },
  setup() {
    const expenses = ref([]);
    const income = ref([]);
    const currentGraph = ref(1);

    // Compute monthly summary for both expenses and income
    const monthlySummary = computed(() => {
      const expenseSummary = {};
      const incomeSummary = {};

      expenses.value.forEach((expense) => {
        expenseSummary[expense.category] = (expenseSummary[expense.category] || 0) + expense.amount;
      });

      income.value.forEach((inc) => {
        incomeSummary[inc.category] = (incomeSummary[inc.category] || 0) + inc.amount;
      });

      return {
        expenses: Object.entries(expenseSummary).map(([category, amount]) => ({ category, amount })),
        income: Object.entries(incomeSummary).map(([category, amount]) => ({ category, amount })),
      };
    });

    const hasMonthlyData = computed(() => expenses.value.length || income.value.length);

    // Chart Data
    const moneyFlowChartData = computed(() => {
      const totalIncome = income.value.reduce((sum, inc) => sum + inc.amount, 0);
      const totalExpenditure = expenses.value.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        labels: ["Total"],
        datasets: [
          {
            label: "Total Income (CAD)",
            data: [totalIncome],
            backgroundColor: "#4BC0C0",
          },
          {
            label: "Total Expenditure (CAD)",
            data: [totalExpenditure],
            backgroundColor: "#FF6384",
          },
        ],
      };
    });

    const expenseChartData = computed(() => ({
      labels: monthlySummary.value.expenses.map((item) => item.category),
      datasets: [
        {
          label: "Expenses by Category",
          data: monthlySummary.value.expenses.map((item) => item.amount),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    }));

    const incomeChartData = computed(() => ({
      labels: monthlySummary.value.income.map((item) => item.category),
      datasets: [
        {
          label: "Income by Category",
          data: monthlySummary.value.income.map((item) => item.amount),
          backgroundColor: ["#4BC0C0", "#FFCE56"],
        },
      ],
    }));

    // Chart Options
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: "top", labels: { color: "#333" } },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `$${tooltipItem.raw} CAD`,
          },
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          titleColor: "#fff",
          bodyColor: "#fff",
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: "#333" }, grid: { color: "#ddd" } },
        x: { ticks: { color: "#333" }, grid: { color: "#ddd" } },
      },
    };

    const pieChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#333",
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const dataset = tooltipItem.dataset.data;
              const currentValue = dataset[tooltipItem.dataIndex];
              const total = dataset.reduce((sum, value) => sum + value, 0);
              const percentage = ((currentValue / total) * 100).toFixed(2); // Calculate percentage
              return `${tooltipItem.label}: $${currentValue} CAD (${percentage}%)`;
            },
          },
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          titleColor: "#fff",
          bodyColor: "#fff",
        },
        datalabels: {
          color: "#000000",
          formatter: (value, context) => {
            const dataset = context.chart.data.datasets[0].data;
            const total = dataset.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`; // Display percentage on the graph
          },
        },
      },
    };
    // Fetch data
    onMounted(async () => {
      const db = await setupDatabase();
      expenses.value = await getAllExpenses(db);
      income.value = await getAllIncome(db);
    });

    // Graph navigation
    const nextGraph = () => {
      currentGraph.value = currentGraph.value < 3 ? currentGraph.value + 1 : 1;
    };

    const previousGraph = () => {
      currentGraph.value = currentGraph.value > 1 ? currentGraph.value - 1 : 3;
    };

    return {
      monthlySummary,
      moneyFlowChartData,
      expenseChartData,
      incomeChartData,
      chartOptions,
      pieChartOptions,
      currentGraph,
      nextGraph,
      previousGraph,
      hasMonthlyData,
    };
  },
};
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
}

.nav-buttons {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.nav-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.nav-button:hover {
  background-color: #0056b3;
}

.graphs {
  width: 100%;
  max-width: 800px;
}

.graphs h2 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.8em;
}

.graphs p {
  text-align: center;
  font-size: 1.2em;
  color: #666;
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 15px;
  }

  .graphs {
    max-width: 100%;
  }

  .nav-button {
    font-size: 14px;
    padding: 8px 16px;
  }

  .graphs h2 {
    font-size: 1.5em;
  }

  .graphs p {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .dashboard-view h1 {
    font-size: 1.8em;
  }

  .graphs h2 {
    font-size: 1.2em;
  }

  .nav-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
