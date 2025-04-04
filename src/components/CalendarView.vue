<template>
  <div class="calendar-container">
    <h2>Income/Expense Calendar</h2>
    <div class="calendar">
      <div class="calendar-header">
        <button @click="prevMonth">Previous</button>
        <h3>{{ currentMonth }}</h3>
        <button @click="nextMonth">Next</button>
      </div>
      <div class="calendar-grid">
        <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
        <div 
          v-for="day in days" 
          :key="day.date"
          class="calendar-day"
          :class="{ 'today': isToday(day.date), 'other-month': !day.isCurrentMonth }"
          @click="selectDate(day.date)"
        >
          {{ day.date.getDate() }}
          <div class="expense-amount" v-if="day.expenses > 0">
            -{{ day.expenses.toLocaleString() }} CAD
          </div>
          <div class="income-amount" v-if="day.income > 0">
            +{{ day.income.toLocaleString() }} CAD
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedDate" class="transaction-details">
      <h3>{{ formatDate(selectedDate) }} transactions</h3>
      <div v-if="selectedDateTransactions.length > 0">
        <div v-for="transaction in selectedDateTransactions" :key="transaction.id" 
             class="transaction-item"
             :class="{ 'income': transaction.type === 'income', 'expense': transaction.type === 'expense' }">
          <div class="transaction-info">
            <span class="transaction-category">{{ transaction.category }}</span>
            <span class="transaction-amount">
              {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount.toLocaleString() }} CAD
            </span>
          </div>
          <div class="transaction-memo">{{ transaction.memo }}</div>
        </div>
      </div>
      <div v-else class="no-transactions">
        No transactions for this date.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { setupDatabase, getAllExpenses, getAllIncome } from '@/database';

export default {
  name: 'CalendarView',
  setup() {
    const currentDate = ref(new Date());
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const db = ref(null);
    const expenses = ref([]);
    const income = ref([]);
    const selectedDate = ref(null);
    const selectedDateTransactions = ref([]);

    onMounted(async () => {
      db.value = await setupDatabase();
      await loadTransactions();
    });

    const loadTransactions = async () => {
      expenses.value = await getAllExpenses(db.value);
      income.value = await getAllIncome(db.value);
    };

    const currentMonth = computed(() => {
      return `${currentDate.value.getFullYear()} ${currentDate.value.getMonth() + 1}`;
    });

    const days = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const days = [];
      
      // 이전 달의 날짜들
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const firstDayOfWeek = firstDay.getDay();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push(createDayObject(date, false));
      }

      // 현재 달의 날짜들
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push(createDayObject(date, true));
      }

      // 다음 달의 날짜들
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push(createDayObject(date, false));
      }

      return days;
    });

    const createDayObject = (date, isCurrentMonth) => {
      const dateStr = formatDate(date);
      const dayExpenses = expenses.value
        .filter(expense => formatDate(new Date(expense.date)) === dateStr)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const dayIncome = income.value
        .filter(inc => formatDate(new Date(inc.date)) === dateStr)
        .reduce((sum, inc) => sum + inc.amount, 0);

      return {
        date,
        isCurrentMonth,
        expenses: dayExpenses,
        income: dayIncome
      };
    };

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const prevMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      );
    };

    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      );
    };

    const isToday = (date) => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    const selectDate = (date) => {
      selectedDate.value = date;
      const dateStr = formatDate(date);
      selectedDateTransactions.value = [
        ...expenses.value.filter(expense => formatDate(new Date(expense.date)) === dateStr),
        ...income.value.filter(inc => formatDate(new Date(inc.date)) === dateStr)
      ].sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    return {
      currentMonth,
      days,
      weekdays,
      prevMonth,
      nextMonth,
      isToday,
      selectDate,
      selectedDate,
      selectedDateTransactions,
      formatDate
    };
  }
};
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.calendar {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header button {
  padding: 8px 16px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.calendar-header button:hover {
  background-color: #0056b3;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.weekday {
  text-align: center;
  font-weight: bold;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.calendar-day {
  aspect-ratio: 1;
  padding: 5px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.today {
  background-color: #e3f2fd;
  font-weight: bold;
}

.other-month {
  color: #adb5bd;
}

.expense-amount {
  font-size: 0.8em;
  color: #dc3545;
  position: absolute;
  bottom: 5px;
  left: 5px;
  right: 5px;
  text-align: center;
}

.income-amount {
  font-size: 0.8em;
  color: #28a745;
  position: absolute;
  bottom: 25px;
  left: 5px;
  right: 5px;
  text-align: center;
}

.transaction-details {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.transaction-item {
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.transaction-category {
  font-weight: bold;
}

.transaction-amount {
  font-weight: bold;
}

.transaction-amount.income {
  color: #28a745;
}

.transaction-amount.expense {
  color: #dc3545;
}

.transaction-memo {
  color: #6c757d;
  font-size: 0.9em;
}

.no-transactions {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}
</style>
  