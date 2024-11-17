<template>
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <nav class="side-nav">
      <h2>MY BUDGET APP</h2>
      <router-link to="/" class="nav-item" active-class="active-link">Dashboard</router-link>
      <router-link to="/add-expense" class="nav-item" active-class="active-link">Input</router-link>
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
/* Main Layout Container */
.app-container {
  display: flex;
  height: 100vh;
  padding: 10px; /* Reduced padding around the container */
  margin: 0 auto; /* Center the layout without unnecessary space */
  max-width: 1200px; /* Limit the width of the container */
}

/* Sidebar Navigation */
.side-nav {
  width: 180px; /* Reduced sidebar width */
  background-color: #f5f5f5;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: start;
  border-right: 1px solid #ddd;
  margin-right: 10px; /* Small margin to avoid excess space */
}

/* Title inside the sidebar */
.side-nav h2 {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  border: 2px solid #007bff; /* Border around the title */
  padding: 10px;
  border-radius: 10px; /* Rounded corners for the title border */
  width: fit-content;
  margin: 0 0 20px 0; /* Remove margin on top and bottom for neat alignment */
}

/* Sidebar Navigation Item Styles */
.nav-item {
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  font-size: 1.1em;
  margin: 5px 0; /* Add space between items */
  border-radius: 5px; /* Rounded corners */
  transition: background-color 0.3s ease, color 0.3s ease;
  border: 2px solid transparent; /* Border for nav items */
  width: 100%;
  box-sizing: border-box;
}

/* Hover effect for navigation items */
.nav-item:hover {
  background-color: #e1f5fe; /* Light blue background on hover */
  color: #007bff;
  border-color: #007bff; /* Border color change on hover */
}

/* Active Link Style */
.active-link {
  font-weight: bold;
  color: #007bff;
  border-color: #007bff; /* Border color for active link */
}

/* Main Content Area */
.main-content {
  flex-grow: 1;
  padding: 10px 20px; /* Reduced padding for more compact content */
  overflow-y: auto;
  background-color: #fff;
  margin-left: 10px; /* Small margin to the left for better spacing */
}
</style>
