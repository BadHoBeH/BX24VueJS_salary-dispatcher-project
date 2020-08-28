import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { BX24 } from 'bx24';
const bx24 = new BX24(window, parent);

bx24.callMethod(
    "crm.deal.list",
    {
      order: { "STAGE_ID": "ASC" },
      filter: { ">PROBABILITY": 50 },
      select: [ "ID", "TITLE", "STAGE_ID", "PROBABILITY", "OPPORTUNITY", "CURRENCY_ID" ]
    },
    function(result)
    {
      if(result.error())
        console.error(result.error());
      else
      {
        console.dir(result.data());
        if(result.more())
          result.next();
      }
    });



import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

Vue.use(Antd);



Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
