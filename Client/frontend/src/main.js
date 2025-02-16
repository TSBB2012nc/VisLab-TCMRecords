import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '../router'

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
app.use(router); // 使用路由
app.component('EasyDataTable', Vue3EasyDataTable);
app.mount('#app');