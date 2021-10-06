/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import Vue from 'vue';
import {
  flatMap, keyBy, mapValues, min,
} from 'lodash';
import { bitrixAuth } from '@/plugins/authBX24';

export const namespaced = true;
export const state = {
  all: {
    loading: 0,
    error: '',
    data: {},
    fields: {},
    history: [],
  },
};

const generateMutations = {};
['ALL'].forEach((name) => {
  ['LOADING', 'ERROR', 'DATA', 'FIELDS', 'HISTORY'].forEach((type) => {
    generateMutations[`SET_${name}_${type}`] = (d, array) => {
      state[name.toLowerCase()][type.toLowerCase()] = array;
    };

    generateMutations[`SET-FIELDS_${name}_${type}`] = (data, resp) => {
      Vue.set(state[name.toLocaleLowerCase()][type.toLowerCase()], resp.list, resp.array);
    };

    generateMutations[`SET-TYPED_${name}_${type}`] = (data, resp) => {
      Vue.set(
        state[name.toLocaleLowerCase()][type.toLowerCase()],
        resp.list,
        resp.array.map((i) => mapValues(i, (n, k) => {
          if (/^PROPERTY_/.test(k)) {
            if (typeof (Object.values(n)[0]) === 'string' && (Object.values(n)[0].includes('|') || Object.values(n)[0] === '0')) return Number(Object.values(n)[0].replace(/[^.\d]/g, ''));
            return Object.values(n)[0];
          }
          return n;
        })),
      );
    };
    generateMutations[`KEY_${name}_${type}`] = (data, resp) => {
      resp.array.forEach((ik) => {
        // eslint-disable-next-line no-param-reassign
        ik.keyUnic = resp.uidLoad;
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
  getAllObject: (state) => (newkey) => keyBy(flatMap(state.all.data), newkey),
  // eslint-disable-next-line no-shadow
  getListDataFilter: (state) => (filter) => {
    if (!state.all.data) return false;
    return Object.values(state.all.data).filter((i) => min(filter.map((f) => {
      switch (f.type) {
        case 'keyUnic': {
          return i.keyUnic === f.filter;
        }
        case 'datarange':
        case 'date': {
          return (Number(Vue.moment(i[f.filed], 'DD.MM.YYYY').isBetween(Vue.moment(f.filter[0]), Vue.moment(f.filter[1]), 'day', '[]')));
        }
        default: break;
      }
      return 0;
    })));
  },
  // eslint-disable-next-line no-shadow
  getListFieldsType: (state) => (type) => state.all.fields[type],
};

export const actions = {

  async get({ commit }, query) {
    console.log('getDeal data: ', query);
    if (!query) return false;
    commit('SET_ALL_LOADING', state.all.loading + 1);
    try {
      const { result } = await (await bitrixAuth()).list('lists.element.get', query);
      console.log(result);
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('KEY_ALL_DATA', { array: result, key: query.key, uidLoad: query.uidLoad });
      return true;
    } catch (e) {
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('SET_ALL_ERROR', e.message);
      console.error(e.message);
      return false;
    }
  },

  async fields({ commit }, query) {
    console.log('getFields data: ', query);
    if (!query) return false;
    commit('SET_ALL_LOADING', state.all.loading + 1);
    try {
      const { result } = await (await bitrixAuth()).list('lists.field.get', query);
      console.log(result);
      commit('SET_ALL_LOADING', state.all.loading - 1);
      commit('SET-FIELDS_ALL_FIELDS', { array: result, list: query.IBLOCK_ID });
      return true;
    } catch (e) {
      commit('SET_ALL_ERROR', e.message);
      console.error(e.message);
      return false;
    }
  },
};
