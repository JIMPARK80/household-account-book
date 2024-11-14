<template>
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <nav class="side-nav">
      <h2>My Budget App</h2>
      <router-link to="/" class="nav-item" active-class="active-link">Dashboard</router-link>
      <router-link to="/add-expense" class="nav-item" active-class="active-link">Input</router-link>
      <router-link to="/expense-list" class="nav-item" active-class="active-link">Expense List</router-link>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

/* Sidebar Navigation */
.side-nav {
  width: 200px;
  background-color: #f5f5f5;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: start;
  border-right: 1px solid #ddd;
}

.side-nav h2 {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #333;
}

.nav-item {
  padding: 10px 0;
  color: #333;
  text-decoration: none;
  font-size: 1.1em;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #007bff;
}

.active-link {
  font-weight: bold;
  color: #007bff;
}

/* Main Content Area */
.main-content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
}
</style>
