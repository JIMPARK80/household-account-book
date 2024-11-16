// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../components/DashboardView.vue'; // Renamed to follow multi-word naming convention
import AddExpenseView from '../components/AddExpense.vue';
import ExpenseListView from '../components/ExpenseList.vue';
import CalendarView from '../components/CalendarView.vue'; // Import your CalendarView component

// Define routes
const routes = [
  { path: '/', component: DashboardView }, // Use the renamed DashboardView
  { path: '/add-expense', component: AddExpenseView },
  { path: '/expense-list', component: ExpenseListView },
  { path: '/calendar', component: CalendarView }, // Route for CalendarView
];

// Create and export the router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
