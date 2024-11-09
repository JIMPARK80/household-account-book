import { createApp } from 'vue'
import App from './App.vue'
import router from './router'; // import the router

// create and mount the vue app

createApp(App)
.use(router)
.mount('#app');
