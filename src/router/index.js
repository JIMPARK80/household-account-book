// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import AddExpense from '../components/AddExpense.vue';
import ExpenseList from '../components/ExpenseList.vue';
import ExpenseReport from '../components/ExpenseReport.vue'; // Updated import

const routes = [
  { path: '/', component: Dashboard },
  { path: '/add-expense', component: AddExpense },
  { path: '/expense-list', component: ExpenseList },
  { path: '/report', component: ExpenseReport }, // Updated route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
