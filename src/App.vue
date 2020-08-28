<template>
  <div>
    <a-menu mode="horizontal">
      <a-menu-item v-for="i in pages" :key="i.length"><router-link :to='i.to'>{{i.title}}</router-link></a-menu-item>
    </a-menu>
  </div>
</template>
<script>
export default {
  data() {
    return {
      pages: [
        {to:'/reports',icon:null,title:'Отчёты'}
      ],
    };
  },
};
</script>
