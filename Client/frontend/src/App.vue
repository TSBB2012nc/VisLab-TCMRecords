<script setup>
import MapView from './components/MapView.vue';
import Navbar from './components/Navbar.vue';
import TimeView from './components/TimeView.vue';



</script>

<template>
  <div class="d-flex flex-column">
    <!-- Header: 导航栏和字典侧边组件 fixed-->
    <div class="d-flex flex-column fixed-top">
      <Navbar />
    </div>
    <!-- 主要视图 -->
    <div class="d-flex flex-column">
      <TimeView />
      <MapView />
    </div>
  </div>
</template>


