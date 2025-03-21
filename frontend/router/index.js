import { createRouter, createWebHistory } from "vue-router";
import TableView from "../src/components/DataView.vue"; 
import VisView from "../src/components/VisView.vue";

const routes = [
  {
    path: "/",
    name: "Index",
    component: VisView,
  },
  {
    path: "/data",
    name: "DataManagement",
    component: TableView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
