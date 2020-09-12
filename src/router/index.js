import Vue from 'vue'
import VueRouter from 'vue-router'
/*Page active*/

import reportIndex from "../components/Index";
import pageIndex from "../components/REPORTS/Index";


/*Page passive*/

Vue.use(VueRouter);
const routes = [

    {
        path: '/report',
        name: 'reportIndex',
        component: reportIndex
    },{
        path: '/',
        name: 'pageIndex',
        component: pageIndex
    },

];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});


export default router