// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import the router
import { setupDatabase, addExpense, getAllExpenses } from './database.js'; // Import IndexedDB functions

import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";


// Migrate data from localStorage to IndexedDB if needed
async function migrateLocalStorageToIndexedDB() {
  const db = await setupDatabase();

  // Check if there are entries in localStorage
  const entries = JSON.parse(localStorage.getItem('entries'));
  if (entries && Array.isArray(entries)) {
    for (const entry of entries) {
      await addExpense(db, entry); // Save each entry to IndexedDB
    }
    console.log("Migrated localStorage data to IndexedDB.");
  }

  // Clear localStorage to ensure it is not used again
  localStorage.removeItem('entries');
}

// Initialize IndexedDB and load initial data
async function initializeApp() {
  try {
    const db = await setupDatabase();

    // Migrate data from localStorage if there is any
    await migrateLocalStorageToIndexedDB();

    const expenses = await getAllExpenses(db);

    if (expenses.length === 0) {
      console.log("No expenses found in IndexedDB. Initializing with default data.");
      // Optional: Initialize with default expenses if needed
    } else {
      console.log("Expenses loaded from IndexedDB:", expenses);
    }
  } catch (error) {
    console.error("Error initializing IndexedDB:", error);
  }
}

// Create and mount the Vue app
const app = createApp(App);

// Use router for app navigation
app.use(router);

// Initialize IndexedDB before mounting the app
initializeApp();

// Mount the app to the #app element in index.html
app.mount('#app');
