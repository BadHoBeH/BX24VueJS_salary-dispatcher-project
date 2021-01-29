<template>
  <div class="menu-header">
    <a-page-header
      style="border-bottom: 1px solid rgb(235, 237, 240)"
      :title="pageName.title"
      @back="() => $router.go(-1)"
    >

      <template slot="tags" v-for="(i, k) in auth">
        <a-tag
          :style="{borderStyle: i.select ? '' : 'dashed'}"
          :color="i.status ? 'green' : 'red'" :key="k">
          {{ i.method }}
        </a-tag>
      </template>

      <template slot="extra">
        <a-button icon="setting">Настройки</a-button>
      </template>

      <template slot="footer">
        <a-tabs :active-key="$route.name" @change="goRouter">
          <a-tab-pane
            v-for="i in router"
            :key="i.name"
            :tab="i.title"
            :disabled="i.disable"/>
        </a-tabs>
      </template>

    </a-page-header>
  </div>
</template>

<script>
import router, { routes } from '@/router';
import { find } from 'lodash';
import { mapState } from 'vuex';

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      height: 10,
    };
  },
  computed: {
    ...mapState({
      auth: (state) => state.auth.all.data,
    }),
    router() {
      return routes;
    },
    pageName() {
      return find(routes, { name: this.$route.name });
    },
  },
  methods: {
    goRouter(name, params = null) {
      router.push({ name, params });
    },
  },
  mounted() {
  },
};
</script>

<style scoped>
.menu-header{
  text-align: center;
}
</style>
