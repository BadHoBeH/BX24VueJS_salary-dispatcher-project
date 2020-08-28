import Vue from 'vue'
import VueRouter from 'vue-router'
/*Page active*/

import pageIndex from "../components/Index";
import reportIndex from "../components/REPORTS/Index";


/*Page passive*/

Vue.use(VueRouter);
const routes = [


    {
        path: '/',
        name: 'pageIndex',
        component: pageIndex
    },{
        path: '/report',
        name: 'reportIndex',
        component: reportIndex
    },

];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});


export default router