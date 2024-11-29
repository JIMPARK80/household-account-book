<template>
    <div class="calendar-view">
      <h2>Welcome to the Calendar View!</h2>
      <p>This is where you can view and manage your monthly expenses and income on a calendar.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: "CalendarView",
  };
  </script>
  
  <style scoped>
  .calendar-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
    max-width: 600px;
  }
  
  .calendar-view h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
  }
  
  .calendar-view p {
    font-size: 16px;
    color: #555;
  }
  </style>
  