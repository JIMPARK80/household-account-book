<template>
    <div class="calendar-container">
      <!-- Header with Month Navigation -->
      <div class="calendar-header">
        <button @click="goToPreviousMonth">‹</button>
        <span>{{ currentMonthName }} {{ currentYear }}</span>
        <button @click="goToNextMonth">›</button>
      </div>
  
      <!-- Calendar Table -->
      <table class="calendar-table">
        <thead>
        <tr>
          <th v-for="day in abbreviatedWeekDays" :key="day" class="weekday-header">
            {{ day }}
          </th>
        </tr>
      </thead>
        <tbody>
          <tr v-for="(week, weekIndex) in weeks" :key="weekIndex">
            <td
              v-for="day in week"
              :key="day.date"
              :class="{ 'today': isToday(day.date), 'other-month': !day.isCurrentMonth }"
            >
              <div class="date-number">{{ day.date.getDate() }}</div>
              <ul class="event-list">
                <li
                  v-for="event in day.events"
                  :key="event.id"
                  :class="event.type"
                >
                  {{ event.type === 'income' ? '+' : '-' }}{{ formatCurrency(event.amount) }}
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Monthly Summary -->
      <div class="monthly-summary">
        <div>Income: <span class="income">{{ formatCurrency(totalIncome) }}</span></div>
        <div>Expense: <span class="expense">{{ formatCurrency(totalExpense) }}</span></div>
        <div>Total: <span class="balance">{{ formatCurrency(totalBalance) }}</span></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      events: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        selectedDate: new Date(),
        weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      };
    },
    computed: {
        abbreviatedWeekDays(){
            return this.weekDays.map(day=> day.slice(0,3).toUpperCase()); // convert to "SUN", "MON", etc.
        },
      currentMonthName() {
        return this.selectedDate.toLocaleString("default", { month: "long" });
      },
      currentYear() {
        return this.selectedDate.getFullYear();
      },
      totalIncome() {
        return this.events
          .filter(event => event.type === 'income')
          .reduce((sum, event) => sum + event.amount, 0);
      },
      totalExpense() {
        return this.events
          .filter(event => event.type === 'expense')
          .reduce((sum, event) => sum + event.amount, 0);
      },
      totalBalance() {
        return this.totalIncome - this.totalExpense;
      },
      weeks() {
        const days = [];
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
        const endDate = new Date(lastDayOfMonth);
        endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
  
        for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
          const date = new Date(day);
          days.push({
            date,
            isCurrentMonth: date.getMonth() === month,
            events: this.events.filter(event => new Date(event.date).toDateString() === date.toDateString())
          });
        }
  
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
          weeks.push(days.slice(i, i + 7));
        }
        return weeks;
      }
    },
    methods: {
      isToday(date) {
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      },
      goToPreviousMonth() {
        this.selectedDate.setMonth(this.selectedDate.getMonth() - 1);
        this.selectedDate = new Date(this.selectedDate);
      },
      goToNextMonth() {
        this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
        this.selectedDate = new Date(this.selectedDate);
      },
      formatCurrency(value) {
        return `$${parseFloat(value).toFixed(2)}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .calendar-container {
    max-width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 1.2em;
  }
  
  .calendar-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    border: 1px solid #ddd;
  }
  
  .calendar-table th,
  .calendar-table td {
    padding: 10px;
    text-align: center;
    vertical-align: top;
    border: 1px solid #ddd;
  }
  
  .calendar-table .today {
    background-color: #e0f7fa;
    border: 2px solid #00796b;
  }
  
  .calendar-table .other-month {
    color: #ccc;
  }
  
  .date-number {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .event-list {
    font-size: 0.85em;
    margin-top: 5px;
  }
  
  .income {
    color: green;
  }
  
  .expense {
    color: red;
  }
  
  .balance {
    font-weight: bold;
  }
  
  .monthly-summary {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }
  </style>
  