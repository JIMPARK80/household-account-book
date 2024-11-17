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
          <Pie :data="expenseChartData" />
        </div>
        <p v-else>No expense data available for summary.</p>
      </div>

      <!-- Monthly Income Summary Graph -->
      <div v-if="currentGraph === 3">
        <h2>Monthly Income Summary</h2>
        <div v-if="monthlySummary.income && monthlySummary.income.length">
          <Pie :data="incomeChartData" />
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
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Total Income vs Total Expenditure',
        },
      },
    };

    // Fetch expenses and income from the database on component mount
    onMounted(async () => {
      const db = await setupDatabase();
      const allExpenses = await getAllExpenses(db);  // Get all expenses
      const allIncome = await getAllIncome(db);  // Get all income

      // Assign filtered data to respective variables
      expenses.value = allExpenses.filter(item => item.type === 'expense');
      income.value = allIncome.filter(item => item.type === 'income');
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
/* General Layout */
.dashboard-view {
  font-family: 'Arial', sans-serif;
  margin: 20px auto;
  max-width: 800px;
  padding: 20px;
  background-color: #f4f4f9;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Graph Navigation Buttons */
.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
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

/* Graphs Section */
.graphs {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* Each Graph Container */
.graph-container {
  width: 100%;
  padding: 20px;
}

/* Make the graphs fill the screen */
h2 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}
</style>
