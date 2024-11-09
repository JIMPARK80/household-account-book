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
            // Output the input expenditure data to the console, 입력된 지출 데이터를 콘솔 출력, 
        console.log("Expense added:", {
            amount: this.amount, 
            category: this.category, 
            date: this.date
        });


        // 폼 제출후 필드 초기회
        this.amount = 0;
        this.category = "";
        this.date = "";
        }
    }
};
</script>

<style scoped>
.add-expense{
    padding: 20px;
}
</style>