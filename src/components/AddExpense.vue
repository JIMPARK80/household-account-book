<template>
    <div class = "add-expense">
        <h1> Add Expense</h1>
        <p> this page to add a new expense </p>
        <form @submit.prevent="addExpense">
            <div>
                <label>Amount (금액): </label>
                <input type="number" v-model="amount" required placeholder="Enter amount" />
            </div>
            <div>
                <label>Category (항목): </label>
                <input type="text" v-model="category" required placeholder="Enter Category" />
            </div>
            <div>
                <label>Date (날짜): </label>
                <input type="date" v-model="date" required placeholder="select"/>
            </div>
            <button type="submit">Add Expense</button>
        
        </form>
    </div>
</template>

<script>
export default{
    name: "AddExpense",

    data(){
        return{
            amount: 0,
            category: "",
            date: ""
        };
    },
    methods:{
        addExpense(){
            // create an expense object
        
            const expense = {
                amount: this.amount,
                category: this.category,
                date: this.date
            };

            // Get existing expenses from localStorage
            const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
            
            // Add the new expense to to the array
            expenses.push(expense);

            // Save the updated array back to localStorage
            localStorage.setItem("expenses", JSON.stringify(expenses));

            // 폼 제출후 필드 초기회
            this.amount = 0;
            this.category = "";
            this.date = "";

            // log to console for debugging
            console.log("Expense added:", expense);
            }
    }
};
</script>

<style scoped>
.add-expense{
    padding: 20px;
}
</style>