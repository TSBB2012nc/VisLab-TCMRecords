<script setup>
import Navbar from './components/Navbar.vue';


</script>

<template>
<div class="d-flex flex-column">
  <!-- Header: 导航栏和字典侧边组件 fixed-->
  <div class="d-flex flex-column fixed-top">
    <Navbar />
  </div>
  <!-- 主要视图 -->
  <div class="d-flex">
    <h1>Flask + Vite + Vue</h1>
    
  </div>
</div>
</template>

