<template>
  <div id="app">
    <nav>
      <router-link to="/">Dashboard</router-link>
      <router-link to="/add-expense">Add Expense</router-link>
      <router-link to="/expense-list">View Expenses</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  margin-bottom: 20px;
  background-color: #42b983;
  padding: 10px;
  border-radius: 4px;
}

nav a {
  margin: 0 10px;
  text-decoration: none;
  color: white;
  font-weight: bold;
}

nav a.router-link-exact-active {
  color: #35495e;
}
</style>
