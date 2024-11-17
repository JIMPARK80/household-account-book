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
// Bar chart options for better aspect ratio
const chartOptions = {
    responsive: true,
    aspectRatio: 1,  // This makes the chart taller by adjusting the aspect ratio (height: width ratio)
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
  justify-content: flex-start; /* Centers content vertically */
  align-items: center; /* Centers content horizontally */
  height: 100%; /* Make the height fill the screen */
  width: 100%;  /* Make the width fill the screen */
  padding: 20px;
  box-sizing: border-box;
  max-width: 100%; /* Ensure the container does not exceed the screen width */
  margin-top: 20px; /* Adjust this value to raise the content higher */}

/* Heading Styles for Dashboard */
.dashboard-view h2, .dashboard-view h3 {
  margin-bottom: auto; /* Slightly larger margin for more space */
  font-size: 2em; /* Larger font size for readability */
  text-align: center; /* Keep the headings centered */
  width: 100%; /* Ensure headings take full width */
}

/* Chart container to fill available space */
.chart-container {
  width: 100%;
  max-width: 1200px; /* Set a max-width to avoid excessive stretching */
  height: 500px; /* Adjust the height for consistency */
  margin-top: 30px; /* Reduce this to bring the chart closer to the title */
}

.chart-container canvas {
  width: 100% !important; /* Ensures the canvas takes full width */
  height: 100% !important; /* Ensures the canvas takes full height */
}

/* Buttons for chart navigation */
.nav-buttons {
  display: flex; /* Aligns buttons horizontally */
  justify-content: center; /* Centers the buttons horizontally */
  align-items: center; /* Centers the buttons vertically */
  margin-top: 50px; /* Space between buttons and chart */
  width: 100%; /* Ensure buttons stretch across the full screen width */
}

.nav-buttons button {
  background-color: #007bff; /* Button background color */
  color: white; /* Button text color */
  border: none; /* No border around the button */
  padding: 12px 20px; /* Button padding for size */
  font-size: 18px; /* Button text size */
  cursor: pointer; /* Change cursor to pointer when hovered */
  margin: 0 10px; /* Space between buttons */
  border-radius: 8px; /* Rounded corners for buttons */
  transition: background-color 0.3s; /* Smooth background color transition */
}

.nav-buttons button:hover {
  background-color: #0056b3; /* Change background color on hover */
}

/* Make sure the charts do not overflow */
.chart-container {
  display: flex;
  justify-content: center; /* Centers the chart container */
  align-items: center; /* Vertically aligns the content */
  overflow: hidden; /* Prevent content from overflowing */
}

/* Responsive design adjustments */
@media (max-width: 1200px) {
  .dashboard-view {
    padding: 15px; /* Slightly smaller padding for medium screens */
  }
  .chart-container {
    height: 400px; /* Reduce height for smaller screens */
  }
  .nav-buttons button {
    padding: 10px 18px; /* Adjust button size for medium screens */
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    height: auto; /* Allow the height to adjust on smaller screens */
    padding: 10px; /* Less padding on mobile for better space utilization */
  }
  .chart-container {
    height: 300px; /* Make the chart container smaller on mobile devices */
  }
  .nav-buttons button {
    padding: 8px 14px; /* Smaller button size on mobile */
  }
}
</style>
