<template>
    <div class="calendar-container">
      <!-- Calendar Header with Month and Year -->
      <div class="calendar-header">
        <button @click="goToPreviousMonth">‹</button>
        <span>{{ currentMonthName }} {{ currentYear }}</span>
        <button @click="goToNextMonth">›</button>
      </div>
  
      <!-- Weekday Labels -->
      <div class="calendar-grid">
        <div class="weekday-label" v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>
  
      <!-- Main Calendar Grid (Dates) -->
      <div class="calendar-grid">
        <div
          class="calendar-day"
          v-for="day in currentMonthDays"
          :key="day.date"
          :class="{ 'today': isToday(day.date) }"
        >
          <div class="date-number">{{ day.date.getDate() }}</div>
          <ul class="event-list">
            <li v-for="event in day.events" :key="event.id" :class="event.type">
              {{ event.type === 'income' ? '+' : '-' }}{{ formatCurrency(event.amount) }}
            </li>
          </ul>
        </div>
      </div>
  
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
        weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      };
    },
    computed: {
      currentMonthDays() {
        const days = [];
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
  
        // Get the first and last dates of the current month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
  
        // Fill days array with each day of the month
        for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
          const date = new Date(day);
          days.push({
            date,
            events: this.events.filter(event => new Date(event.date).toDateString() === date.toDateString())
          });
        }
        return days;
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
        this.selectedDate = new Date(this.selectedDate); // Update to trigger reactivity
      },
      goToNextMonth() {
        this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
        this.selectedDate = new Date(this.selectedDate); // Update to trigger reactivity
      },
      formatCurrency(value) {
        return `$${parseFloat(value).toFixed(2)}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .calendar-container {
    max-width: 600px;
    margin: auto;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 1.2em;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    gap: 1px;
    border: 1px solid #ddd;
  }
  
  .weekday-label {
    font-weight: bold;
    padding: 10px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
  }
  
  .calendar-day {
    border: 1px solid #ddd;
    min-height: 100px;
    max-height: 120px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 5px;
  }
  
  .calendar-day.today {
    background-color: #e0f7fa;
    border: 2px solid #00796b;
  }
  
  .date-number {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .event-list {
    flex-grow: 1;
    overflow-y: auto;
  }
  
  .event-list li {
    font-size: 0.85em;
    margin: 2px 0;
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
  