import Vue from 'vue';

/**
 *  import CSS files
 */
import 'ant-design-vue/dist/antd.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import 'vue-resize/dist/vue-resize.css';

/**
 * Import language moment
 */

/**
 *  import modules
 */
import './registerServiceWorker';
import Antd from 'ant-design-vue';
import VueMoment from 'vue-moment';
import VueResize from 'vue-resize';
import moment from 'moment';

/**
 *  import VueJS components
 */
import { setAuth } from '@/plugins/authBX24';
import router from './router';
import store from './store';

/**
 *  import App
 */
import App from './App.vue';

/**
 *  config in modules
 */
Vue.config.productionTip = false;

/**
 *  Vue.using(modules)
 */
Vue.use(Antd);
Vue.use(VueMoment);
Vue.use(VueResize);
Vue.use(moment);
moment.locale('ru');

new Vue({
  router,
  store,
  render: (h) => h(App),
  async created() {
    await setAuth();
    if (process.env.NODE_ENV !== 'development') router.push({ path: '/' });
  },
}).$mount('#app');
