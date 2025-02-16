<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

// Get current route
const route = useRoute();
const currentRoute = computed(() => route.path);



// 引用文件输入框
const fileInput = ref(null);

const openFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};



// 处理文件上传的函数
const handleFileUpload = async () => {
  const file = fileInput.value.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('file send');
      } else {
        console.error('上传失败:', response.statusText);
      }
    } catch (error) {
      console.error('上传过程中出现错误:', error);
    }
  }
};



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
        <!-- 文件上传组件 -->
        <div class="custom-file-upload">
          <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;">
          <button class="btn btn-outline-success me-2" @click="openFileInput">上传</button>
        </div>
        <!-- 页面跳转 -->
        <router-link 
          :to="currentRoute === '/data' ? '/' : '/data'" 
          class="btn btn-outline-success me-2">
          {{ currentRoute === '/data' ? '可视分析' : '数据管理' }}
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