import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import AddExpense from '../components/AddExpense.vue';
import ExpenseList from '../components/ExpenseList.vue';
import ManageCategories from '@/components/ManageCategories.vue'; // Add ManageCategories

const routes = [
  { path: '/', component: Dashboard },
  { path: '/add-expense', component: AddExpense },
  { path: '/expense-list', component: ExpenseList },
  { path: '/manage-categories', component: ManageCategories}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
