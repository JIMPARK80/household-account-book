<template>
  <div class="calendar-container">
    <!-- Display Current Local Time -->
    <div class="current-time">
      Current Time: {{ formatCurrentTime }}
    </div>

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
            :key="day.date.toISOString()"
            :class="{ 'today': isToday(day.date), 'other-month': !day.isCurrentMonth }"
          >
            <div class="date-number">{{ day.date.toLocaleString(userLocale, { day: 'numeric' }) }}</div>
            <ul class="event-list">
              <li
                v-for="event in day.events"
                :key="event.id || `${event.type}-${event.amount}-${day.date.toISOString()}`"
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
      weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      userLocale: navigator.language || 'en-US', // Automatically detect the user's locale
      currentTime: new Date() // Initialize with current time
    };
  },
  computed: {
    abbreviatedWeekDays() {
      return this.weekDays.map((day, index) =>
        new Date(1970, 0, index + 4).toLocaleString(this.userLocale, { weekday: 'short' })
      );
    },
    currentMonthName() {
      return this.selectedDate.toLocaleString(this.userLocale, { month: 'long' });
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
          events: this.events.filter(event =>
            new Date(event.date).toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
          )
        });
      }

      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }
      return weeks;
    },
    formatCurrentTime() {
      // Display current time in Toronto timezone without timezone label
      return this.currentTime.toLocaleTimeString(this.userLocale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'America/Toronto' // Explicitly set to Toronto timezone
      });
    }
  },
  methods: {
    isToday(date) {
    const today = new Date();
    const options = { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' };

    // Format both dates to Toronto timezone without time component
    const todayString = new Intl.DateTimeFormat('en-CA', options).format(today);
    const dateString = new Intl.DateTimeFormat('en-CA', options).format(date);

    return todayString === dateString;
    },
    goToPreviousMonth() {
      this.selectedDate.setMonth(this.selectedDate.getMonth() - 1);
      this.selectedDate = new Date(this.selectedDate); // Force reactivity
    },
    goToNextMonth() {
      this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
      this.selectedDate = new Date(this.selectedDate); // Force reactivity
    },
    formatCurrency(value) {
      return new Intl.NumberFormat(this.userLocale, {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    },
    formatEventDate(date) {
      // Format event date and time in Toronto timezone
      return new Date(date).toLocaleString(this.userLocale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Toronto' // Set timezone explicitly
      });
    }
  },
  mounted() {
    // Update `currentTime` every second
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  beforeUnmount() { // Use beforeUnmount instead of beforeDestroy in Vue 3
    // Clear the interval when component is unmounted
    clearInterval(this.timeInterval);
  }
};
</script>

<style scoped>
.calendar-container {
  max-width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

.current-time {
  text-align: center;
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 1.2em;
  background-color: #fbfb50;
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
  border: 1px solid #b4b4b4;
}

.calendar-table th {
  padding: 10px;
  text-align: center;
  vertical-align: top;
  border: 2px solid #b4b4b4;
  background-color: #9be470;
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

.event-time {
  font-size: 0.8em;
  color: gray;
}

.income {
  color: green;
  font-weight: bold;
}

.expense {
  color: red;
  font-weight: bold;
}

.balance {
  font-weight: bold;
}

.monthly-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.calendar-table td:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}
</style>
