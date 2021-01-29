/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import Vue from 'vue';
import { Method } from '@2bad/bitrix';
import { bitrixAuth } from '@/plugins/authBX24';

export const namespaced = true;
export const state = {
  all: {
    loading: 0,
    error: null,
    data: {},
    fields: {},
  },
};

const generateMutations = {};
['ALL'].forEach((name) => {
  ['LOADING', 'ERROR', 'DATA', 'HISTORY'].forEach((type) => {
    generateMutations[`SET_${name}_${type}`] = (d, array) => {
      state[name.toLowerCase()][type.toLowerCase()] = array;
    };

    generateMutations[`PUSH_${name}_${type}`] = (data, resp) => {
      resp.array.forEach((i) => {
        Vue.set(state[name.toLocaleLowerCase()][type.toLowerCase()], i[resp.key], i);
      });
    };
  });
});

export const mutations = {
  ...generateMutations,
};

export const getters = {
  // eslint-disable-next-line no-shadow
  g_id: (state) => (id) => state.all.data[id] || null,
};

export const actions = {

  async get({ commit }, query) {
    if (!query) return false;
    commit('SET_ALL_LOADING', state.all.loading + 1);
    try {
      const { result } = await (await bitrixAuth()).list(Method.USER_GET, query);
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('PUSH_ALL_DATA', { array: result, key: query.key });
      return true;
    } catch (e) {
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('SET_ALL_ERROR', e.message);
      console.error(e.message, e);
      return false;
    }
  },

  async field({ commit }, query) {
    if (!query) return false;
    console.log('field', query);
    commit('SET_ALL_LOADING', state.all.loading + 1);
    try {
      const { result } = await (await bitrixAuth()).list(Method.USER_FIELDS, query);
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('PUSH_ALL_FIELDS', { array: result, key: query.key });
      return true;
    } catch (e) {
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('SET_ALL_ERROR', e.message);
      console.error(e.message);
      return false;
    }
  },
};
