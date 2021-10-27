<template>
  <a-spin style="position: relative" class="app" :spinning="false">
    <resize-observer @notify="updateViewSize"/>
    <AppMenu/>
    <div :style="{height:height+'px'}"/>
    <a-spin :spinning="!authSucces">
      <router-view v-if="authSucces"/>
    </a-spin>
  </a-spin>
</template>

<script>
/**
 *  import components
 */
import { bitrixAuth } from '@/plugins/authBX24';
import AppMenu from '@/components/Menu/Index.vue';
import Bitrix24 from 'bitrix24-vue';
import { mapGetters, mapActions } from 'vuex';

export default {
  components: {
    AppMenu,
  },
  data() {
    return {
      height: 10,
      query: {
        user: {
          select: ['ID', 'NAME', 'UF_DEPARTMENT', 'WORK_POSITION'],
          key: 'ID',
        },
        stage: {
          filter: { ENTITY_ID: 'STATUS' },
          select: ['NAME', 'NAME_INT', 'STATUS_ID'],
          key: 'STATUS_ID',
        },
      },
    };
  },
  computed: {
    ...mapGetters({
      authSucces: 'auth/getAuth',
      authUser: 'auth/getUser',
    }),
  },
  methods: {
    ...mapActions({
      get_user: 'user/get',
      get_stage: 'stage/get',
    }),
    async updateViewSize({ height }) {
      if (process.env.NODE_ENV === 'development' || !await Bitrix24.init()) return true;
      const BX24 = await Bitrix24.init();
      if (!BX24) return true;
      if (height % 3) this.height += 1;
      BX24.fitWindow();
      return true;
    },
    async startworkflow() {
      console.log('startWF');
      const params = {
        TEMPLATE_ID: 51,
        DOCUMENT_ID: ['crm', 'CCrmDocumentLead', 33772],
        PARAMETERS: { a: 1 },
      };
      await (await bitrixAuth()).call('bizproc.workflow.start', params);
    },
  },
  watch: {
    authSucces: {
      handler() {
        this.startworkflow();
        this.get_user(this.query.user);
        this.get_stage(this.query.stage);
      },
    },
  },

};

</script>

<style>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.load{
  filter:blur(3px);
  display: block;
}
</style>
