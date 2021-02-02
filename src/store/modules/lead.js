/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
// eslint-disable-next-line import/no-cycle
import store from '@/store';
import Vue from 'vue';
import {
  mapValues,
} from 'lodash';
import { bitrixAuth } from '@/plugins/authBX24';
import { isArray } from 'ant-design-vue/lib/_util/vue-types/utils';

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
        Vue.set(state[name.toLocaleLowerCase()][type.toLowerCase()], ik[resp.key], mapValues(ik, (n, k) => {
          if (/^PROPERTY_/.test(k)) {
            if (typeof (Object.values(n)[0]) === 'string' && (Object.values(n)[0].includes('|') || Object.values(n)[0] === '0')) return Number(Object.values(n)[0].replace(/[^.\d]/g, ''));
            return Object.values(n)[0];
          }
          return n;
        }));
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
  // eslint-disable-next-line no-shadow,consistent-return
  filter: (state) => (st = 'default', filter) => {
    switch (isArray(state.all[st])) {
      case true: {
        return state.all[st].filter(filter);
      } case false: {
        return Object.values(state.all[st]).filter(filter);
      }
      default: break;
    }
  },
};

export const actions = {
  async get({ commit }, query) {
    if (!query) return false;
    commit('SET_ALL_LOADING', state.all.loading + 1);
    try {
      console.log('get', query);
      if (!state.all.fields) store.dispatch('lead/fields', query);
      const { result } = await (await bitrixAuth()).leads.list(query);
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
