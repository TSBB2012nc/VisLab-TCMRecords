import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'
import App from './App.vue'

// Table Component
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Import Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Import Fontawesome CSS
import '@fortawesome/fontawesome-free/css/all.css';


const app = createApp(App);
const pinia = createPinia()

app.component('EasyDataTable', Vue3EasyDataTable);

app.use(pinia)
app.mount('#app');