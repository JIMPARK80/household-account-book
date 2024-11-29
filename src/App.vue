<template>
  <div class="app-container">
    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <h2>MY Smart Diary</h2>
      <div class="nav-links">
        <router-link to="/" class="nav-item" active-class="active-link">Dashboard</router-link>
        <router-link to="/add-expense" class="nav-item" active-class="active-link">Input</router-link>
      </div>
    </header>

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
/* Overall layout */
.app-container {
  display: flex;
  flex-direction: column; /* Align top bar and main content vertically */
  height: 100vh;
  margin: 0; /* Remove default margin */
}

/* Top Navigation Bar */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 10px 20px;
  border-bottom: 2px solid #ddd;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* Ensure the top nav stays above content */
}

/* Title */
.top-nav h2 {
  font-size: 1.8em; /* Slightly larger font size */
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: bold;
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

/* Navigation links in the top bar */
.nav-links {
  display: flex;
  gap: 20px; /* Adjust spacing between links */
}

.nav-item {
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  font-size: 1.7em;
  border-radius: 5px; /* Rounded corners for the links */
  transition: background-color 0.3s ease, color 0.3s ease;
  font-family: Arial, Helvetica, sans-serif;
}

.nav-item:hover {
  background-color: #e1f5fe; /* Light blue background on hover */
  color: #007bff; /* Blue color on hover */
}

.active-link {
  font-weight: bold;
  color: #007bff;
  border-bottom: 2px solid #007bff; /* Underline active link */
}

/* Main Content Area */
.main-content {
  flex-grow: 1;
  padding: 80px 20px 20px; /* Add padding to avoid overlap with fixed top bar */
  background-color: #fff;
  height: 100vh;
  box-sizing: border-box;
  overflow-y: auto; /* Allow scrolling if content overflows */
}

/* Responsive Design */
@media (max-width: 768px) {
  .top-nav h2 {
    font-size: 1.4em; /* Smaller title font for smaller screens */
  }

  .nav-links {
    gap: 10px; /* Reduce gap for mobile screens */
  }

  .nav-item {
    font-size: 1em; /* Smaller font for the links on smaller screens */
    padding: 10px 12px; /* Smaller padding on mobile */
  }

  .main-content {
    padding: 70px 10px 20px; /* Adjust padding for smaller screens */
  }
}
</style>
