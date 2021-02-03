/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import Vue from 'vue';
import { bitrixAuth } from '@/plugins/authBX24';
import { Method } from '@2bad/bitrix';

export const namespaced = true;
export const state = {
  all: {
    loading: 0,
    error: null,
    data: {},
    fields: null,
  },
};

const generateMutations = {};
['ALL'].forEach((name) => {
  ['LOADING', 'ERROR', 'DATA', 'FIELDS', 'HISTORY'].forEach((type) => {
    generateMutations[`SET_${name}_${type}`] = (d, array) => {
      state[name.toLowerCase()][type.toLowerCase()] = array;
    };

    generateMutations[`KEY_${name}_${type}`] = (data, resp) => {
      resp.array.forEach((ik) => {
        // eslint-disable-next-line max-len
        Vue.set(state[name.toLocaleLowerCase()][type.toLowerCase()], ik[resp.key], ik);
      });
    };
  });
});

export const mutations = {
  ...generateMutations,
};

export const getters = {
  // eslint-disable-next-line no-shadow
  g_id: (state) => (ID) => state.all.data[ID],
  // eslint-disable-next-line no-shadow
  g_fl: (state) => (type = 'default') => (type === 'all' ? state.all.fields.array : state.all.fields.array[type]),
};

export const actions = {
  async get({ commit }, query) {
    if (!query) return false;
    commit('SET_ALL_LOADING', state.all.loading + 1);
    try {
      console.log('get', query);
      // if (!state.all.fields) store.dispatch('lead/fields', query);
      const { result } = await (await bitrixAuth()).list(Method.CRM_STATUS_LIST, query);
      console.log(result);
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('KEY_ALL_DATA', { array: result, key: query.key });
      return true;
    } catch (e) {
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('SET_ALL_ERROR', e.message);
      console.error(e.message);
      return false;
    }
  },

  async fields({ commit }, query) {
    console.log('fields query: ', query);
    if (!query) return false;
    commit('SET_ALL_LOADING', state.all.loading + 1);
    commit('SET_ALL_FIELDS', 1);
    try {
      const { result } = await (await bitrixAuth()).leads.fields(query);
      console.log(result);
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('SET_ALL_FIELDS', { array: result, list: query.key });
      return true;
    } catch (e) {
      commit('SET_ALL_ERROR', e.message);
      console.error(e.message);
      return false;
    }
  },
};
