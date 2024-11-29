<template>
  <div class="dashboard-view">
    <!-- 대시보드 제목 -->
    <h1>Dashboard View</h1>

    <!-- 요약 카드 섹션 -->
    <div class="summary-card">
      <p class="expense">Expense: <span>{{ totalExpense }} CAD</span></p>
      <p class="income">Income: <span>{{ totalIncome }} CAD</span></p>
      <p class="balance">Total Balance: <span>{{ totalBalance }} CAD</span></p>
    </div>


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

// Chart.js에서 사용할 기능 등록
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  BarElement,
  LinearScale,
  ChartDataLabels
);

export default {
  name: "DashboardView",
  components: { Pie, Bar },
  setup() {
    // 상태 변수 정의
    const expenses = ref([]); // 지출 데이터
    const income = ref([]); // 수입 데이터
    const currentGraph = ref(1); // 현재 선택된 그래프 (1, 2, 3 중 하나)

    // 데이터베이스에서 지출 및 수입 데이터를 가져오는 함수
    const fetchData = async () => {
      const db = await setupDatabase(); // 데이터베이스 설정
      expenses.value = await getAllExpenses(db); // 지출 데이터 가져오기
      income.value = await getAllIncome(db); // 수입 데이터 가져오기

      console.log("Expenses:", expenses.value); // Debugging
      console.log("Income:", income.value); // Debugging
    };

    // 총 지출 계산
    const totalExpense = computed(() =>
      expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
    );

    // 총 수입 계산
    const totalIncome = computed(() =>
      income.value.reduce((sum, inc) => sum + inc.amount, 0)
    );

    // 총 잔액 계산 (수입 - 지출)
    const totalBalance = computed(() => totalIncome.value - totalExpense.value);

    // Check if any data exists
    const hasMonthlyData = computed(
      () => expenses.value.length > 0 || income.value.length > 0
    );
    

    // 카테고리별 데이터를 요약하는 재사용 가능한 함수
    const summarizeData = (data) => {
      return Object.entries(
        data.reduce((summary, item) => {
          summary[item.category] = (summary[item.category] || 0) + item.amount;
          return summary;
        }, {})
      ).map(([category, amount]) => ({ category, amount }));
    };

    // 지출 및 수입 데이터를 카테고리별로 요약
    const monthlySummary = computed(() => ({
      expenses: summarizeData(expenses.value), // 카테고리별 지출 합산
      income: summarizeData(income.value), // 카테고리별 수입 합산
    }));

    // 차트 데이터를 생성하는 재사용 가능한 함수
    const createChartData = (summary, label, colors) => ({
      labels: summary.map((item) => item.category), // 카테고리 레이블
      datasets: [
        {
          label, // 데이터셋 레이블
          data: summary.map((item) => item.amount), // 데이터 값
          backgroundColor: colors, // 막대/파이 색상
        },
      ],
    });

    // 총 수입과 지출 데이터를 위한 바 차트 데이터
    const moneyFlowChartData = computed(() => ({
      labels: ["Total"], // 단일 레이블
      datasets: [
        {
          label: "Total Income (CAD)", // 총 수입
          data: [totalIncome.value],
          backgroundColor: "#4BC0C0",
        },
        {
          label: "Total Expenditure (CAD)", // 총 지출
          data: [totalExpense.value],
          backgroundColor: "#FF6384",
        },
      ],
    }));

    // 카테고리별 지출 데이터를 위한 파이 차트 데이터
    const expenseChartData = computed(() =>
      createChartData(
        monthlySummary.value.expenses, // 요약된 지출 데이터
        "Expenses by Category",
        ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] // 색상 배열
      )
    );

    // 카테고리별 수입 데이터를 위한 파이 차트 데이터
    const incomeChartData = computed(() =>
      createChartData(
        monthlySummary.value.income, // 요약된 수입 데이터
        "Income by Category",
        ["#4BC0C0", "#FFCE56"] // 색상 배열
      )
    );

    // 바 차트 옵션 (디자인 및 툴팁 포함)
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false, // 컨테이너 크기에 맞게 조정
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#333", // 범례 색상
            font: { size: 14, weight: "bold" }, // 폰트 스타일
            padding: 20, // 범례와 그래프 간격
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)", // 툴팁 배경색
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: (tooltipItem) => `$${tooltipItem.raw} CAD`, // 값 포맷
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true, // 0부터 시작
          grid: { color: "rgba(0, 0, 0, 0.1)", drawBorder: false },
          ticks: { color: "#555", font: { size: 12, weight: "500" }, stepSize: 50 },
        },
        x: {
          grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
          ticks: { color: "#555", font: { size: 12, weight: "500" }, padding: 10 },
        },
      },
    };

    // 파이 차트 옵션
    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#333", font: { size: 14, weight: "bold" } },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: (tooltipItem) => {
              const dataset = tooltipItem.dataset.data;
              const currentValue = dataset[tooltipItem.dataIndex];
              const total = dataset.reduce((sum, value) => sum + value, 0);
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return `${tooltipItem.label}: $${currentValue} CAD (${percentage}%)`; // 값 및 퍼센트 표시
            },
          },
        },
      },
    };

    // 그래프 탐색 기능
    const nextGraph = () => {
      currentGraph.value = currentGraph.value < 3 ? currentGraph.value + 1 : 1;
    };

    const previousGraph = () => {
      currentGraph.value = currentGraph.value > 1 ? currentGraph.value - 1 : 3;
    };

    // 컴포넌트가 로드될 때 데이터 가져오기
    onMounted(fetchData);

    // 반환값
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
/* 대시보드 전체 레이아웃 */
.dashboard-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
  background-color: #f9f9f9; /* 배경색 추가 */
  border-radius: 10px; /* 둥근 모서리 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 살짝 그림자 효과 */
  min-height: 60%; /* 최소 높이 설정 */
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
  padding: 12px 24px;
  border: none;
  border-radius: 50%; /* 원형 버튼 */
  cursor: pointer;
  font-size: 20px;
  transition: background-color 0.3s ease, transform 0.2s ease; /* 부드러운 애니메이션 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 버튼 그림자 효과 */
}

.nav-button:hover {
  background-color: #0056b3;
  transform: scale(1.1); /* 마우스 오버 시 확대 효과 */
}

.nav-button:active {
  transform: scale(0.95); /* 클릭 시 약간 축소 */
}

/* 그래프 영역 스타일 */
.graphs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
  max-width: 600px; /* 최대 너비 설정 */
}

.graphs canvas {
  width: 100% !important; /* 컨테이너 너비에 맞춤 */
  max-width: 400px; /* 차트 최대 너비 */
  height: auto !important; /* 비율 유지 */
  aspect-ratio: 1 / 1; /* 정사각형 비율 유지 */
  margin: 20px 0; /* 위아래 간격 추가 */
}

.graphs h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8em;
  color: #333;
  font-family: 'Arial', sans-serif; /* 제목 폰트 설정 */
}

.graphs p {
  text-align: center;
  font-size: 1.2em;
  color: #999;
  font-style: italic; /* 메시지 스타일 변경 */
  margin-top: 10px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .dashboard-view {
    padding: 15px;
  }

  .nav-button {
    font-size: 18px;
    padding: 10px;
  }

  .graphs {
    max-width: 100%;
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
    font-size: 1.6em;
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
