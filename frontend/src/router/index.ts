import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DataView from '../components/DataView.vue';
import VisView from '../components/VisView.vue';
import EnsembleView from '../components/EnsembleView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'DataView',
    component: DataView
  },
  {
    path: '/patient/:id',
    name: 'VisView',
    component: VisView,
  },
  {
    path: '/ensemble',
    name: 'EnsembleView',
    component: EnsembleView,
    props: route => ({ patientIds: route.query.ids })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;