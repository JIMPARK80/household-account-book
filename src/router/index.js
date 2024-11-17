// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../components/DashboardView.vue'; // Renamed to follow multi-word naming convention
import AddExpenseView from '../components/AddExpense.vue';

// Define routes
const routes = [
  { path: '/', component: DashboardView }, // Use the renamed DashboardView
  { path: '/add-expense', component: AddExpenseView },
];

// Create and export the router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
