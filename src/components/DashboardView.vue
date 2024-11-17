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
        <div v-if="monthlySummary.expenses.length && monthlySummary.income.length">
          <Bar :data="moneyFlowChartData" :options="chartOptions" />
        </div>
        <p v-else>No data available for money flow comparison.</p>
      </div>

      <!-- Monthly Expense Summary Graph -->
      <div v-if="currentGraph === 2">
        <h2>Monthly Expense Summary</h2>
        <div v-if="monthlySummary.expenses && monthlySummary.expenses.length">
          <Pie :data="expenseChartData" :options="pieChartOptions"/>
        </div>
        <p v-else>No expense data available for summary.</p>
      </div>

      <!-- Monthly Income Summary Graph -->
      <div v-if="currentGraph === 3">
        <h2>Monthly Income Summary</h2>
        <div v-if="monthlySummary.income && monthlySummary.income.length">
          <Pie :data="incomeChartData" :options="pieChartOptions" />
        </div>
        <p v-else>No income data available for summary.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { setupDatabase, getAllExpenses, getAllIncome } from '../database.js';
import { ref, onMounted, computed } from 'vue';
import { Pie, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale, ChartDataLabels);

export default {
  name: 'DashboardView',
  components: { Pie, Bar },
  setup() {
    const expenses = ref([]);
    const income = ref([]);
    const currentGraph = ref(1); // Default: Show the first graph (Monthly Money Flow)

    // Compute monthly summary for both expenses and income
    const monthlySummary = computed(() => {
      const expenseSummary = {};
      const incomeSummary = {};

      expenses.value.forEach((expense) => {
        if (expenseSummary[expense.category]) {
          expenseSummary[expense.category] += expense.amount;
        } else {
          expenseSummary[expense.category] = expense.amount;
        }
      });

      income.value.forEach((inc) => {
        if (incomeSummary[inc.category]) {
          incomeSummary[inc.category] += inc.amount;
        } else {
          incomeSummary[inc.category] = inc.amount;
        }
      });

      return {
        expenses: Object.keys(expenseSummary).map((category) => ({
          category,
          amount: expenseSummary[category],
        })),
        income: Object.keys(incomeSummary).map((category) => ({
          category,
          amount: incomeSummary[category],
        })),
      };
    });

    // Pie chart data for expenses
    const expenseChartData = computed(() => ({
      labels: monthlySummary.value.expenses.map((item) => item.category),
      datasets: [
        {
          label: 'Expenses by Category',
          data: monthlySummary.value.expenses.map((item) => item.amount),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          plugins: {
            datalabels: {
              display: true,
              color: '#fff',
              formatter: (value) => `${value}`,
            },
          },
        },
      ],
    }));

    // Pie chart data for income
    const incomeChartData = computed(() => ({
      labels: monthlySummary.value.income.map((item) => item.category),
      datasets: [
        {
          label: 'Income by Category',
          data: monthlySummary.value.income.map((item) => item.amount),
          backgroundColor: ['#4BC0C0', '#FFCE56'],
          plugins: {
            datalabels: {
              display: true,
              color: '#fff',
              formatter: (value) => `${value}`,
            },
          },
        },
      ],
    }));

    // Bar chart data for Total Income vs Total Expenditure
    const moneyFlowChartData = computed(() => {
      const totalIncome = income.value.reduce((sum, inc) => sum + inc.amount, 0);
      const totalExpenditure = expenses.value.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        labels: ['Total'],
        datasets: [
          {
            label: 'Total Income',
            data: [totalIncome],
            backgroundColor: '#4BC0C0',
            borderColor: '#36A2EB',
            borderWidth: 1,
          },
          {
            label: 'Total Expenditure',
            data: [totalExpenditure],
            backgroundColor: '#FF6384',
            borderColor: '#FFCE56',
            borderWidth: 1,
          },
        ],
      };
    });

    // Chart options for the bar chart
    const chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#333',
          },
          grid: {
            color: '#ddd',
          },
        },
        x: {
          ticks: {
            color: '#333',
          },
          grid: {
            color: '#ddd',
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333',
          },
        },
        tooltip: {
          titleColor: '#333',
          bodyColor: '#333',
        },
        datalabels: {
          color: '#333',
          font: {
            weight: 'bold',
          },
        },
      },
    };

    const pieChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333',
          },
        },
        tooltip: {
          titleColor: '#333',
          bodyColor: '#333',
        },
        datalabels: {
          color: '#333',
          font: {
            weight: 'bold',
          },
        },
      },
    };

    // Fetch expenses and income from the database on component mount
    onMounted(async () => {
      const db = await setupDatabase();
      const allExpenses = await getAllExpenses(db);
      const allIncome = await getAllIncome(db);

      // Assign filtered data to respective variables
      expenses.value = allExpenses.filter((item) => item.type === 'expense');
      income.value = allIncome.filter((item) => item.type === 'income');
    });

    // Function to move to the next graph
    const nextGraph = () => {
      if (currentGraph.value < 3) {
        currentGraph.value++;
      } else {
        currentGraph.value = 1; // Loop back to the first graph
      }
    };

    // Function to move to the previous graph
    const previousGraph = () => {
      if (currentGraph.value > 1) {
        currentGraph.value--;
      } else {
        currentGraph.value = 3; // Loop back to the last graph
      }
    };

    return {
      monthlySummary,
      moneyFlowChartData,
      chartOptions,
      pieChartOptions,
      currentGraph,
      nextGraph,
      previousGraph,
      expenseChartData,
      incomeChartData,
    };
  },
};
</script>

<style scoped>
/* Dashboard View */
.dashboard-view {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  max-width: 100%;
  margin-top: 20px;
}

/* Heading Styles for Dashboard */
.dashboard-view h2, .dashboard-view h3 {
  margin-bottom: 20px;
  font-size: 2.8em;
  font-weight: bold;
  text-align: center;
  width: 100%;
}

/* Chart container to fill available space */
.chart-container {
  width: 100%;
  max-width: 100%;
  height: 500px;
  margin-top: 30px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Buttons for chart navigation */
.nav-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  width: 100%;
}

.nav-buttons button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 18px;
  cursor: pointer;
  margin: 0 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.nav-buttons button:hover {
  background-color: #0056b3;
}

/* Make sure the charts do not overflow */
.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* Responsive Design Adjustments */
@media (max-width: 1200px) {
  .dashboard-view {
    padding: 15px;
  }

  .chart-container {
    height: 400px;
  }

  .nav-buttons button {
    padding: 10px 18px;
  }

  .dashboard-view h2, .dashboard-view h3 {
    font-size: 2.5em;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    height: auto;
    padding: 10px;
  }

  .chart-container {
    height: 300px;
  }

  .nav-buttons button {
    padding: 8px 14px;
  }

  .dashboard-view h2, .dashboard-view h3 {
    font-size: 2em;
  }
}

@media (max-width: 480px) {
  .dashboard-view h2, .dashboard-view h3 {
    font-size: 1.5em;
  }

  .nav-buttons button {
    padding: 6px 12px;
  }
}
</style>
