<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

// Get current route
const route = useRoute();
const currentRoute = computed(() => route.path);



</script>

<template>
  <nav class="navbar navbar-expand-md navbar-dark w-100 bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">中医病案可视分析</a>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav ms-auto mb-2 mb-md-0 me-3">
          <li class="nav-item">
            <a class="nav-link" href="#">切换数据</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">添加对比</a>
          </li>
        </ul>
        <!-- 页面跳转 -->
        <router-link 
          :to="currentRoute === '/data' ? '/' : '/data'" 
          class="btn btn-outline-success me-2">
          {{ currentRoute === '/data' ? '可视分析' : '查看数据' }}
        </router-link>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.custom-file-upload {
  display: inline-block;
}
</style>