<template>
    <div class="manage-categories">
      <h2>Manage Categories</h2>
  
      <ul>
        <li v-for="(category, index) in categories" :key="index">
          {{ category }}
          <button @click="removeCategory(index)">Delete</button>
        </li>
      </ul>
  
      <input v-model="newCategory" placeholder="Add new category" />
      <button @click="addCategory">Add Category</button>
    </div>
  </template>

  <script>
  export default {
    name: "ManageCategories",
    data() {
      return {
        categories: [],      // List of categories
        newCategory: ""      // Input for a new category
      };
    },
    created() {
      const savedCategories = JSON.parse(localStorage.getItem("categories")) || ["Rent", "Utilities", "Groceries"];
      this.categories = savedCategories;
    },
    methods: {
      addCategory() {
        if (this.newCategory && !this.categories.includes(this.newCategory)) {
          this.categories.push(this.newCategory);
          this.newCategory = "";
          localStorage.setItem("categories", JSON.stringify(this.categories)); // Save updated categories
        }
      },
      removeCategory(index) {
        this.categories.splice(index, 1);
        localStorage.setItem("categories", JSON.stringify(this.categories)); // Update localStorage after deletion
      }
    }
  };
  </script>
  
  <style scoped>
  .manage-categories {
    padding: 20px;
  }
  input {
    margin-right: 10px;
    padding: 5px;
  }
  button {
    padding: 5px 10px;
    cursor: pointer;
  }
  </style>
  