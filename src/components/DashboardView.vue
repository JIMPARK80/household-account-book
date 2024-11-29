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
  maintainAspectRatio: false, // 컨테이너 크기에 맞게 조정
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#333", // 범례 색상
        font: {
          size: 14, // 범례 폰트 크기
          weight: "bold", // 폰트 굵기
        },
        padding: 20, // 범례와 그래프 간 간격
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(0, 0, 0, 0.8)", // 툴팁 배경색
      titleColor: "#ffffff", // 툴팁 제목 색상
      bodyColor: "#ffffff", // 툴팁 본문 색상
      titleFont: {
        size: 16, // 툴팁 제목 폰트 크기
        weight: "bold",
      },
      bodyFont: {
        size: 14, // 툴팁 본문 폰트 크기
      },
      padding: 10, // 툴팁 내부 패딩
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)", // 툴팁 테두리 색상
      callbacks: {
        label: (tooltipItem) => `$${tooltipItem.raw} CAD`, // 데이터 값 형식
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true, // 0부터 시작
      grid: {
        color: "rgba(0, 0, 0, 0.1)", // Y축 격자선 색상
        lineWidth: 1, // 격자선 두께
        drawBorder: false, // 축 테두리 제거
      },
      ticks: {
        color: "#555", // Y축 눈금 색상
        font: {
          size: 12, // Y축 눈금 폰트 크기
          weight: "500",
        },
        callback: (value) => `$${value}`, // 값 포맷팅
        stepSize: 50, // 눈금 간격
      },
    },
    x: {
      grid: {
        color: "rgba(0, 0, 0, 0.05)", // X축 격자선 색상
        lineWidth: 1,
        drawBorder: false,
      },
      ticks: {
        color: "#555", // X축 눈금 색상
        font: {
          size: 12, // X축 눈금 폰트 크기
          weight: "500",
        },
        padding: 10, // X축 눈금과 축 간격
      },
    },
  },
};
// 파이 그래프 옵션
const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: true, // Ensure the chart maintains its aspect ratio
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#333",
        font: {
          size: 14,
          weight: "bold",
        },
      },
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
          return `${tooltipItem.label}: $${currentValue} CAD (${percentage}%)`;
        },
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
