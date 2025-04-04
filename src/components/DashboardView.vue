<template>
  <div class="dashboard-view">
    <!-- Dashboard Summary -->
    <div class="dashboard-summary">
      <div class="summary-title">Budget <Search></Search>ummary</div>
      <div class="summary-box">
        <!-- Expense -->
        <div class="summary-item expense">
          <div class="label">expense</div>
          <div class="value">-{{ totalExpense }} CAD</div>
        </div>
        <!-- Income -->
        <div class="summary-item income">
          <div class="label">income</div>
          <div class="value">+{{ totalIncome }} CAD</div>
        </div>
        <!-- Balance -->
        <div class="summary-item balance">
          <div class="label">total balance</div>
          <div class="value">{{ totalBalance }} CAD</div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <button @click="previousGraph" class="nav-button">←</button>
      <button @click="nextGraph" class="nav-button">→</button>
    </div>

    <!-- Graph Section -->
    <div class="graphs">
      <!-- Graph 1: Monthly Money Flow -->
      <div v-if="currentGraph === 1">
        <h2>income/expense comparison</h2>
        <div v-if="hasMonthlyData">
          <Bar :data="moneyFlowChartData" :options="chartOptions" />
        </div>
        <p v-else>no data</p>
      </div>

      <!-- Graph 2: Expense Summary -->
      <div v-if="currentGraph === 2">
        <h2>monthly expense</h2>
        <div v-if="monthlySummary.expenses.length">
          <Pie :data="expenseChartData" :options="pieChartOptions" />
        </div>
        <p v-else>no expense data</p>
      </div>

      <!-- Graph 3: Income Summary -->
      <div v-if="currentGraph === 3">
        <h2>monthly income</h2>
        <div v-if="monthlySummary.income.length">
          <Pie :data="incomeChartData" :options="pieChartOptions" />
        </div>
        <p v-else>no income data</p>
      </div>
    </div>
  </div>
</template>

<script>
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
import { setupDatabase, getAllExpenses, getAllIncome } from "../database.js";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale);

export default {
  name: "DashboardView",
  components: { Pie, Bar },
  setup() {
    const expenses = ref([]); // Initialize expenses
    const income = ref([]); // Initialize income
    const currentGraph = ref(1); // Current graph index

    const fetchData = async () => {
      try {
        const db = await setupDatabase();
        expenses.value = await getAllExpenses(db) || [];
        income.value = await getAllIncome(db) || [];
      } catch (error) {
        console.error("Error fetching data:", error);
        expenses.value = [];
        income.value = [];
      }
    };

    const totalExpense = computed(() =>
      expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
    );

    const totalIncome = computed(() =>
      income.value.reduce((sum, inc) => sum + inc.amount, 0)
    );

    const totalBalance = computed(() => totalIncome.value - totalExpense.value);

    const hasMonthlyData = computed(() => expenses.value.length > 0 || income.value.length > 0);

    const summarizeData = (data) =>
      Object.entries(
        data.reduce((summary, item) => {
          summary[item.category] = (summary[item.category] || 0) + item.amount;
          return summary;
        }, {})
      ).map(([category, amount]) => ({ category, amount }));

    const monthlySummary = computed(() => ({
      expenses: summarizeData(expenses.value),
      income: summarizeData(income.value),
    }));

    const moneyFlowChartData = computed(() => ({
      labels: ["Total"],
      datasets: [
        {
          label: "Total Income (CAD)",
          data: [totalIncome.value],
          backgroundColor: "#4BC0C0",
        },
        {
          label: "Total Expenditure (CAD)",
          data: [totalExpense.value],
          backgroundColor: "#FF6384",
        },
      ],
    }));

    const createChartData = (summary, label, colors) => ({
      labels: summary.map((item) => item.category),
      datasets: [
        {
          label,
          data: summary.map((item) => item.amount),
          backgroundColor: colors,
        },
      ],
    });

    const expenseChartData = computed(() =>
      createChartData(
        monthlySummary.value.expenses,
        "Expenses by Category",
        ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
      )
    );

    const incomeChartData = computed(() =>
      createChartData(
        monthlySummary.value.income,
        "Income by Category",
        ["#4BC0C0", "#FFCE56"]
      )
    );

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#333",
            font: { size: 14, weight: "bold" },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: (tooltipItem) => `$${tooltipItem.raw} CAD`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#555",
          },
        },
        x: {
          ticks: {
            color: "#555",
          },
        },
      },
    };

    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#333", font: { size: 14, weight: "bold" } },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const dataset = tooltipItem.dataset.data;
              const currentValue = dataset[tooltipItem.dataIndex];
              const total = dataset.reduce((sum, value) => sum + value, 0);
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return `${tooltipItem.label}: $${currentValue} CAD (${percentage}%)`;
            },
          },
        },
      },
    };

    const nextGraph = () => {
      currentGraph.value = currentGraph.value < 3 ? currentGraph.value + 1 : 1;
    };

    const previousGraph = () => {
      currentGraph.value = currentGraph.value > 1 ? currentGraph.value - 1 : 3;
    };

    onMounted(fetchData);

    return {
      expenses,
      income,
      totalExpense,
      totalIncome,
      totalBalance,
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
/* Dashboard Summary Box */
.dashboard-summary {
  margin-bottom: 20px;
  text-align: center;
}

.summary-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.summary-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 800px;
  margin: 0 auto;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.summary-item .value {
  font-size: 16px;
}

.summary-item.expense .value {
  color: #e53935; /* Red for expenses */
}

.summary-item.income .value {
  color: #1e88e5; /* Blue for income */
}

.summary-item.balance .value {
  color: #43a047; /* Green for balance */
}

/* Navigation Buttons */
.nav-buttons {
  margin: 20px 0;
  display: flex;
  gap: 20px;
  justify-content: center;
}

.nav-button {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  background-color: #0056b3;
  transform: scale(1.1);
}

.nav-button:active {
  transform: scale(0.95);
}

/* Graph Section */
.graphs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  max-width: 800px; /* Larger max-width for graphs */
  margin: 0 auto; /* Center container */
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.graphs canvas {
  width: 100% !important;
  max-width: 400px;
  height: auto !important;
  aspect-ratio: 1 / 1; /* Square ratio */
  margin: 20px 0;
}

.graphs h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8em;
  color: #333;
  font-family: 'Arial', sans-serif;
}

.graphs p {
  text-align: center;
  font-size: 1.2em;
  color: #999;
  font-style: italic;
  margin-top: 10px;
}

/* Ensure Charts are Centered on Small Screens */
@media (max-width: 768px) {
  .graphs {
    padding: 10px;
    max-width: 100%; /* Use full width for smaller screens */
  }

  .graphs canvas {
    max-width: 300px; /* Smaller max width for canvas */
  }

  .graphs h2 {
    font-size: 1.5em;
  }

  .graphs p {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .dashboard-summary {
    padding: 10px;
  }

  .graphs h2 {
    font-size: 1.2em;
  }

  .nav-button {
    font-size: 16px;
    padding: 8px;
  }
}
</style>