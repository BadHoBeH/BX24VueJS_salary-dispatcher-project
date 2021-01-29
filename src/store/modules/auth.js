import Vue from 'vue';
import { unionWith } from 'lodash';

export const namespaced = true;
export const state = {
  all: {
    loading: 0,
    error: '',
    data: [],
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

    generateMutations[`SET-UNION_${name}_${type}`] = (data, resp) => {
      Vue.set(
        state[name.toLocaleLowerCase()],
        type.toLowerCase(),
        unionWith(state[name.toLocaleLowerCase()][type.toLowerCase()], resp),
      );
    };
  });
});

export const mutations = {
  ...generateMutations,
};

export const getters = {
  // eslint-disable-next-line no-shadow
  getType: (state) => (type) => state.all.data[type],
  // eslint-disable-next-line no-shadow
  getAuth: (state) => state.all.data.find((i) => !!i.status && !!i.select),
  // eslint-disable-next-line no-shadow
  getUser: (state) => (priority = 'token') => state.all.data.find((i, k) => {
    if (i.method === priority) return i;
    if (k === state.all.data.length - 1) return i;
    return false;
  }),
};

export const actions = {
  async set({ commit }, query) {
    console.log('set: ', query);
    if (!query) return false;
    try {
      commit('SET-UNION_ALL_DATA', query);
      return true;
    } catch (e) {
      commit('SET_ALL_ERROR', e.message);
      return false;
    }
  },
};
