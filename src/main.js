import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import moment from "moment";

import Bitrix24 from 'bitrix24-vue'
import VueResize from 'vue-resize'
import excel from 'vue-excel-export'


import 'bitrix24-vue/dist/bitrix24-vue.css'
import 'vue-resize/dist/vue-resize.css'


import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';


Vue.use(excel)
Vue.use(Antd);
Vue.use(Bitrix24)
Vue.use(VueResize)


Vue.use(moment)


Vue.config.productionTip = false

moment.locale('ru');
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')


