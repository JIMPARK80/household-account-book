<template>
  <div class="dashboard-view">
    <!-- 대시보드 제목 -->
    <h1>Dashboard View</h1>

    <!-- 그래프를 바꾸는 버튼들 -->
    <div class="nav-buttons">
      <!-- 왼쪽 버튼: 이전 그래프로 이동 -->
      <button @click="previousGraph" class="nav-button">←</button>
      <!-- 오른쪽 버튼: 다음 그래프로 이동 -->
      <button @click="nextGraph" class="nav-button">→</button>
    </div>

    <!-- 현재 선택된 그래프를 보여주는 영역  -->
    <div class="graphs">
      <!-- 1번 그래프: 월별 돈 흐름 -->
      <div v-if="currentGraph === 1">
        <h2>Monthly Money Flow</h2>
        <!-- 데이터가 있을 경우 바 그래프를 보여준다. -->
        <div v-if="hasMonthlyData">
          <Bar :data="moneyFlowChartData" :options="chartOptions" />
        </div>
        <!-- 데이터가 없을 경우 메시지 표시 -->
        <p v-else>No data available for money flow comparison.</p>
      </div>

      <!-- 2번 그래프: 월별 지출 요약 -->
      <div v-if="currentGraph === 2">
        <h2>Monthly Expense Summary</h2>
        <!-- 데이터가 있을 경우 파이 그래프를 보여준다-->
        <div v-if="monthlySummary.expenses.length">
          <Pie :data="expenseChartData" :options="pieChartOptions" />
        </div>
        <!-- 데이터가 없을 경우 메시지 표시 -->
        <p v-else>No expense data available for summary.</p>
      </div>

      <!-- 3번 그래프: 월별 수입 요약 -->
      <div v-if="currentGraph === 3">
        <h2>Monthly Income Summary</h2>
        <!-- 데이터가 있을 경우 파이 그래프를 보여준다 -->
        <div v-if="monthlySummary.income.length">
          <Pie :data="incomeChartData" :options="pieChartOptions" />
        </div>
        <!-- 데이터가 없을경우 메시지 표시 -->
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


// Chart.js에서 사용할 기능들을 등록
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale, ChartDataLabels);

export default {
  name: "DashboardView",
  components: { Pie, Bar }, // 우리가 사용할 그래프 컴포넌트
  setup() {
    const expenses = ref([]); // 지출 데이터를 담을 공간
    const income = ref([]); // 수입 데이터를 담을 공간
    const currentGraph = ref(1); // 현재 보여줄 그래프(1,2,3 중 선택)

    // 지출과 수입 데이터를 요약해서 보여주는 계산된 값
    const monthlySummary = computed(() => {
      const expenseSummary = {};
      const incomeSummary = {};

      // 지출 데이터를 카테고리별로 합산
      expenses.value.forEach((expense) => {
        expenseSummary[expense.category] = (expenseSummary[expense.category] || 0) + expense.amount;
      });

      // 수입 데이터를 카테고리별로 합산
      income.value.forEach((inc) => {
        incomeSummary[inc.category] = (incomeSummary[inc.category] || 0) + inc.amount;
      });

      // 정리된 데이터를 반환
      return {
        expenses: Object.entries(expenseSummary).map(([category, amount]) => ({ category, amount })),
        income: Object.entries(incomeSummary).map(([category, amount]) => ({ category, amount })),
      };
    });

    // 데이터가 있는지 확인
    const hasMonthlyData = computed(() => expenses.value.length || income.value.length);

    // 총수입과 총지출을 계산해서 그래프 데이터를 만듦
    const moneyFlowChartData = computed(() => {
      const totalIncome = income.value.reduce((sum, inc) => sum + inc.amount, 0);
      const totalExpenditure = expenses.value.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        labels: ["Total"],
        datasets: [
          {
            label: "Total Income (CAD)", // 캐나다 달러 단위 수입
            data: [totalIncome],
            backgroundColor: "#4BC0C0",
          },
          {
            label: "Total Expenditure (CAD)", // 캐나다 달러 단위 지출
            data: [totalExpenditure],
            backgroundColor: "#FF6384",
          },
        ],
      };
    });

    // 카테고리별 지출 데이터를 그래프로 나타냄
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

    // 카테고리별 수입 데이터를 그래프로 나타냄
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

    // 그래프 옵션 (디자인 및 툴팁 설정)
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
        y: { beginAtZero: true, 
          ticks: { color: "#333" , 
          stepsize: 100, 
          callback: (value) => `$${value}`,
        }, 
          grid: { color: "#ddd" } 
        },
        x: { 
          ticks: { color: "#333" }, 
          grid: { color: "#ddd" } 
        },
      },
    };

    // 파이 그래프 옵션
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
    // 컴포넌트가 처음 실행될 때 데이터베이스에서 지출/수입 데이터를 가져옴
    onMounted(async () => {
      const db = await setupDatabase();
      expenses.value = await getAllExpenses(db);
      income.value = await getAllIncome(db);
    });

    // 다음 그래프로 이동
    const nextGraph = () => {
      currentGraph.value = currentGraph.value < 3 ? currentGraph.value + 1 : 1;
    };

    // 이전 그래프로 이동
    const previousGraph = () => {
      currentGraph.value = currentGraph.value > 1 ? currentGraph.value - 1 : 3;
    };

    // 위에서 정의한 데이터와 함수들을 반환
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
/* 스타일 정의 (디자인) */

.dashboard-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
}

/* 네비게이션 버튼 스타일 */
.nav-buttons {
  margin: 20px 0;
  display: flex;
  gap: 20px;
}

.nav-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 30px;
}

.nav-button:hover {
  background-color: #0056b3;
}

/* 그래프 스타일 */
.graphs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.graphs canvas {
  width: 100% !important; /* Scale to container width */
  max-width: 300px; /* Maximum width for the chart */
  height: auto !important; /* Maintain aspect ratio */
  aspect-ratio: 1 / 1; /* Ensure the chart remains square */
  margin: 0 auto;
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
