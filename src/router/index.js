// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/components/DashboardView.vue";
import AddExpense from "@/components/AddExpense.vue";
import CalendarView from "@/components/CalendarView.vue";

const routes = [
  { path: "/", name: "Dashboard", component: DashboardView },
  { path: "/add-expense", name: "AddExpense", component: AddExpense },
  { path: "/calendar", name: "Calendar", component: CalendarView }, // Updated path to match App.vue
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
