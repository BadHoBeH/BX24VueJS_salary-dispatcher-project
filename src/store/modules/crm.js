import Vue from 'vue'
export const namespaced = true;
import Bitrix24 from 'bitrix24-vue'

export const state = {

    lead: {
        status: 'empty', //busy,init,loaded,error
        loading: 0, //busy,init,loaded,error
        error: '',
        data: {},
        history: [],
    },
    user: {
        status: 'empty', //busy,init,loaded,error
        error: '',
        data: {},
        history: [],
    },
    deal: {
        status: 'empty', //busy,init,loaded,error
        error: '',
        data: [],
        history: [],
    }

}
const generateMutations = {};
['LEAD','USER', 'DEAL'].forEach(name => {
    ['STATUS','ERROR','DATA','HISTORY','LOADING'].forEach(type => {
        generateMutations[`SET_${name}_${type}`] = function (state, array){
            state[name.toLowerCase()][type.toLowerCase()] = array
        };

        generateMutations[`ADD_${name}_${type}`] = function (state, array){
            Vue.set(state[name.toLocaleLowerCase()][type.toLowerCase()], array.guid, array.data)
        }

        generateMutations[`PUSH_${name}_${type}`] = function (state, array){
            state[name.toLowerCase()][type.toLowerCase()].push(...array);
        }

        generateMutations[`PUSHK_${name}_${type}`] = function (state, data){

            data.array.forEach(i => {
                Vue.set(state[name.toLocaleLowerCase()][type.toLowerCase()], i[data.key], i)
            })

        }

    })
})

export const mutations = {
    ...generateMutations
}

export const getters = {

    //getAllё
    getAll: state => i => {
        return state[i].data
    }

}

export const actions = {


    /*
    *   Actions
    */

    /*
    *   getLeadSync
    *       - dFind array: {
    *               filter {object}
    *               select [array]
    *       }
    */
    async getLeadSync({state,commit}, dFind){
        console.log('getUserSync data: ',dFind)
        if (!dFind) return false;
        commit('SET_LEAD_LOADING', state.lead.loading+1);
        try  {
            const BX24 = await Bitrix24.init()
            if (!BX24) return
            await BX24.init(() => {
                BX24.callMethod('crm.lead.list', dFind, function(result)
                    {
                        if(result.error())  alert("Error: " + result.error());
                            else commit('PUSHK_LEAD_DATA',{array:result.data(), key:'ID'})
                        if (result.more()) result.next();
                            else commit('SET_LEAD_LOADING', state.lead.loading-1);
                    }
                )})
        }catch (e){
            console.log('Error'. e.message)
            commit('SET_LEAD_STATUS', 'error')
            commit('SET_LEAD_ERROR', e.message)
        }
    },




    async getUserSync({state,commit}, dFind){
        console.log('getUserSync data: ',dFind)
        if (!dFind) return false;
        commit('SET_USER_LOADING', state.user.loading+1);
        try  {
            const BX24 = await Bitrix24.init()
            if (!BX24) return
            await BX24.init(() => {
                BX24.callMethod('user.get', dFind, function(result)
                    {
                        if(result.error()) alert("Error: " + result.error());
                            else commit('PUSHK_USER_DATA',{array:result.data(), key:dFind.key})
                        if (result.more()) result.next();
                        else  commit('SET_USER_LOADING', state.user.loading-1);
                    }
                )})
        }catch (e){
            console.log('Error'. e.message)
            commit('SET_USER_STATUS', 'error')
            commit('SET_USER_ERROR', e.message)
        }
    }
}
