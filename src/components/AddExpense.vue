<template>
  <div class="input-form">
    <!-- Tabs for Expense and Income -->
    <div class="tabs">
      <button @click="setType('expense')" :class="{ active: type === 'expense' }">Expense</button>
      <button @click="setType('income')" :class="{ active: type === 'income' }">Income</button>
    </div>

    <!-- Input Form -->
    <form @submit.prevent="addOrUpdateEntry">
      <!-- Date Field -->
      <div class="form-group">
        <label>Date:</label>
        <input v-model="entry.date" type="date" required />
      </div>

      <!-- Note Field -->
      <div class="form-group">
        <label>Note:</label>
        <input v-model="entry.note" type="text" placeholder="Enter value" />
      </div>

      <!-- Amount Field -->
      <div class="form-group">
        <label>{{ type === 'expense' ? 'Expense' : 'Income' }}:</label>
        <input v-model="entry.amount" type="number" placeholder="0.00" required />
      </div>

      <!-- Category Selection with Custom Category Option -->
      <div class="category-section">
        <h3>Category</h3>
        <div class="category-grid">
          <div
            v-for="category in currentCategories"
            :key="category.name"
            :class="{ selected: entry.category === category.name }"
            @click="selectCategory(category.name)"
            class="category"
          >
            <i :class="category.icon"></i>
            <span>{{ category.name }}</span>
          </div>
          <!-- Button to Add/Edit Custom Categories -->
          <div class="category custom-category" @click="addingCustomCategory = true">
            <span>Edit</span>
          </div>
        </div>

        <!-- Custom Category Input -->
        <div v-if="addingCustomCategory" class="custom-category-input">
          <input v-model="newCategory" placeholder="Enter new category" />
          <button @click="addCustomCategory">Add Category</button>
          <button @click="cancelCustomCategory">Cancel</button>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Submit' }}</button>
    </form>
  </div>
</template>

<script>
import { format, toZonedTime } from 'date-fns-tz';

export default {
  props: {
    editingEntry: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isEditing: false,
      type: 'expense', // Default to expense
      entry: {
        id: null,
        date: this.getTodayDate(), // Default to today’s date in Toronto timezone
        note: '', // New field for additional notes
        amount: 0,
        category: '',
      },
      expenseCategories: [
        { name: 'Food', icon: 'fas fa-utensils' },
        // Add other categories here...
      ],
      incomeCategories: [
        { name: 'Salary', icon: 'fas fa-wallet' },
        // Add other categories here...
      ],
      addingCustomCategory: false, // Track if adding custom category
      newCategory: '', // Stores new category name
    };
  },
  watch: {
    editingEntry: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          // Load entry data into form for editing
          this.isEditing = true;
          this.entry = { ...newValue };
          this.type = newValue.type;
        }
      }
    }
  },
  computed: {
    currentCategories() {
      return this.type === 'expense' ? this.expenseCategories : this.incomeCategories;
    }
  },
  methods: {
    getTodayDate() {
      const torontoTimezone = 'America/Toronto';
      const zonedDate = toZonedTime(new Date(), torontoTimezone);
      return format(zonedDate, 'yyyy-MM-dd', { timeZone: torontoTimezone });
    },
    setType(newType) {
      this.type = newType;
      this.entry.amount = 0;
      this.entry.category = '';
    },
    selectCategory(category) {
      this.entry.category = category;
      this.addingCustomCategory = false;
    },
    addCustomCategory() {
      if (this.newCategory) {
        const categoryList = this.type === 'expense' ? this.expenseCategories : this.incomeCategories;
        if (!categoryList.some(cat => cat.name === this.newCategory)) {
          categoryList.push({ name: this.newCategory, icon: 'fas fa-tag' });
          this.entry.category = this.newCategory;
        }
        this.newCategory = '';
        this.addingCustomCategory = false;
      }
    },
    cancelCustomCategory() {
      this.addingCustomCategory = false;
      this.newCategory = '';
    },
    addOrUpdateEntry() {
      if (!this.entry.date || !this.entry.amount || !this.entry.category) {
        alert("Please complete all required fields.");
        return;
      }

      const savedEntries = JSON.parse(localStorage.getItem('entries')) || [];
      if (this.isEditing) {
        // Update existing entry
        const index = savedEntries.findIndex(e => e.id === this.entry.id);
        if (index !== -1) savedEntries.splice(index, 1, this.entry);
      } else {
        // Add new entry
        this.entry.id = Date.now();
        savedEntries.push({ ...this.entry, type: this.type });
      }
      localStorage.setItem('entries', JSON.stringify(savedEntries));
      this.$emit('updateList'); // Notify parent to refresh the list
      this.resetForm();
    },
    resetForm() {
      this.isEditing = false;
      this.entry = {
        id: null,
        date: this.getTodayDate(),
        note: '',
        amount: 0,
        category: '',
      };
    },
  }
};
</script>

<style scoped>
.input-form {
  max-width: 600px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border: none;
  outline: none;
  font-size: 1em;
  transition: background-color 0.3s;
  border-radius: 5px 5px 0 0;
}

.tabs .active {
  background-color: #ffa500;
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.category-section {
  margin-top: 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.category {
  padding: 10px;
  cursor: pointer;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 5px;
  transition: background-color 0.2s ease;
}

.category.selected {
  background-color: #ffa500;
  color: white;
}

.custom-category-input {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.submit-button {
  background-color: #ff7f50;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 15px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 20px;
}

.submit-button:hover {
  background-color: #ff6347;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
