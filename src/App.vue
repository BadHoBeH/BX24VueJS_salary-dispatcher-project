<template>
  <div style="position: relative" id="main" ref="main">
    <resize-observer @notify="updateViewSize" />
    <a-button @click="updateViewSize" type="link" icon="arrows-alt"/>
    <report/>
    <div :style="{height:razmer+'px'}"></div>
  </div>
</template>
<script>

import report from '../src/components/REPORTS/Index'
import Bitrix24 from "bitrix24-vue";

export default {
  components: {report},
  data() {
    return {
      a: 100,
      razmer: 100,
      lastHeight: 0
    };

  },
  computed:{

  },
  methods: {

    async updateViewSize({ width, height })  {
      const BX24 = await Bitrix24.init()
      if (!BX24) return
      console.log(width, height)
      if(height % 3) this.razmer++;
      BX24.fitWindow()

    },

  },

  watch: {

  },

};
</script>
