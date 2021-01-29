import Vue from 'vue';
import VueRouter from 'vue-router';
import Salary from '../views/Salary.vue';
import FullReport from '../views/FullReport.vue';

Vue.use(VueRouter);

export const routes = [
  {
    title: 'Зарплаты',
    path: '/',
    name: 'Home',
    component: Salary,
  },
  {
    title: 'Полный отчёт',
    path: '/full',
    name: 'FullReport',
    component: FullReport,
    disable: false,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;

export function routers() {
  return routes;
}
