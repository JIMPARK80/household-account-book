<template>
  <div class="calendar-container">
    <div class="current-time">Current Time: {{ formatCurrentTime }}</div>
    <div class="calendar-header">
      <button @click="goToPreviousMonth">‹</button>
      <span>{{ currentMonthName }} {{ currentYear }}</span>
      <button @click="goToNextMonth">›</button>
    </div>
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
            :key="day.date?.toISOString()"
            :class="{ 'today': isToday(day.date), 'other-month': !day.isCurrentMonth }"
          >
            <div class="date-number">
              {{ day.date ? day.date.toLocaleString(userLocale, { day: "numeric" }) : "" }}
            </div>
            <ul class="event-list">
              <li v-for="event in day.events" :key="event.id">
                {{ event.description }} - {{ event.amount }}
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="entries-section">
      <h3>Entries</h3>
      <ul>
        <li v-for="entry in filteredEntries" :key="entry.id">
          <span>{{ entry.date }}</span>: {{ entry.description }} - {{ entry.amount }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { setupDatabase, getAllExpenses } from "../database.js";

export default {
  data() {
    return {
      selectedDate: new Date(),
      weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      userLocale: navigator.language || "en-US",
      currentTime: new Date(),
      calendarEvents: [], // Fetched from database
      db: null, // Database instance
    };
  },
  computed: {
    abbreviatedWeekDays() {
      return this.weekDays.map((day, index) =>
        new Date(1970, 0, index + 4).toLocaleString(this.userLocale, { weekday: "short" })
      );
    },
    currentMonthName() {
      return this.selectedDate.toLocaleString(this.userLocale, { month: "long" });
    },
    currentYear() {
      return this.selectedDate.getFullYear();
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
          events: this.calendarEvents.filter(
            (event) =>
              new Date(event.date).toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
          ),
        });
      }

      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }
      return weeks;
    },
    filteredEntries() {
      const currentMonth = this.selectedDate.getMonth();
      const currentYear = this.selectedDate.getFullYear();
      return this.calendarEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth
        );
      });
    },
    formatCurrentTime() {
      return this.currentTime.toLocaleTimeString(this.userLocale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "America/Toronto",
      });
    },
  },
  methods: {
    async fetchCalendarEvents() {
      try {
        if (!this.db) {
          this.db = await setupDatabase(); // Set up the database
        }
        const events = await getAllExpenses(this.db); // Fetch all expenses
        this.calendarEvents = events.map((entry) => ({
          id: entry.id,
          date: entry.date,
          description: entry.category || entry.note || "No Description",
          amount: entry.amount,
        }));
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    },
    isToday(date) {
      const today = new Date();
      return (
        today.getDate() === date.getDate() &&
        today.getMonth() === date.getMonth() &&
        today.getFullYear() === date.getFullYear()
      );
    },
    goToPreviousMonth() {
      const previousMonth = new Date(this.selectedDate);
      previousMonth.setMonth(this.selectedDate.getMonth() - 1);
      this.selectedDate = previousMonth;
    },
    goToNextMonth() {
      const nextMonth = new Date(this.selectedDate);
      nextMonth.setMonth(this.selectedDate.getMonth() + 1);
      this.selectedDate = nextMonth;
    },
  },
  mounted() {
    this.fetchCalendarEvents(); // Fetch events from database
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timeInterval);
  },
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
.entries-section {
  margin-top: 20px;
}
.entries-section ul {
  list-style-type: none;
  padding: 0;
}
.entries-section li {
  margin-bottom: 10px;
}
</style>
