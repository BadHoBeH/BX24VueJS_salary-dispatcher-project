<template>
  <Report/>
</template>

<script>
import Report from '@/components/FullReport/Index.vue';

export default {
  name: 'Home',
  components: { Report },
  mounted() {
    console.log('mounted');
  },
};
</script>
