import Vue from 'vue'
import Vuex from 'vuex'
import * as crm from './modules/crm'


Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        crm
    }
})

export default store