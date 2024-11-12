// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import AddExpense from '../components/AddExpense.vue';
import ExpenseList from '../components/ExpenseList.vue';
import TransactionList from '../components/TransactionList.vue'; // Updated import
import CalendarView from '../components/CalendarView.vue';  // Import your CalendarView component


const routes = [
  { path: '/', component: Dashboard },
  { path: '/add-expense', component: AddExpense },
  { path: '/expense-list', component: ExpenseList },
  { path: '/calendar', component: CalendarView },  // Add route for CalendarView
  { path: '/transaction-list-container' , component: TransactionList}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
