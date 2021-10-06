/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import Vue from 'vue';
import Vuex from 'vuex';
import * as auth from './modules/auth';
import * as user from './modules/user';
// eslint-disable-next-line import/no-cycle
import * as lead from './modules/lead';
// eslint-disable-next-line import/no-cycle
import * as stage from './modules/stage';
// eslint-disable-next-line import/no-cycle
import * as list from './modules/list';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth, user, lead, stage, list,
  },
});

export default store;
