/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import Vue from 'vue';
import Vuex from 'vuex';
import * as auth from './modules/auth';
import * as user from './modules/user';
// eslint-disable-next-line import/no-cycle
import * as lead from './modules/lead';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth, user, lead,
  },
});

export default store;
