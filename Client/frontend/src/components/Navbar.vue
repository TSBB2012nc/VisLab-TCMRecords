<script setup>
import TableView from './TableView.vue';
import { ref } from 'vue';

// 引用文件输入框
const fileInput = ref(null);
// 控制 TableView 显示状态
const isTableViewVisible = ref(false);

var toggleTableView = () => {
  isTableViewVisible.value = !isTableViewVisible.value;
}

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
        <button @click="toggleTableView" :class="isTableViewVisible ? 'btn btn-success' : 'btn btn-outline-success'"
          type="submit">用药字典</button>
      </div>
    </div>
  </nav>
  <TableView v-if="isTableViewVisible" />
</template>
<style scoped>
.custom-file-upload {
  display: inline-block;
}
</style>