<template>
  <a-row>
    статус!
    {{listLead}}
  </a-row>
</template>

<script>

  import {mapActions, mapState, mapGetters} from 'vuex';
  import moment from 'moment'

export default {

  data() {
    return {
      ds: [],
      date: moment().format('MM.01.YYYY'),
    }
  },

  computed:{

    ...mapState({
        listLead: state => state.crm.lead.status
    }),
    ...mapGetters({
        getDataLead: 'crm/getLeadSync'
    }),

  },

  methods: {

    ...mapActions({
        getLead: 'crm/getLeadSync'
    }),

    async getLeads() {


    }

  }
}
</script>