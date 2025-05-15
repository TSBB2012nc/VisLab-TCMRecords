<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PatientSelector from './PatientSelector.vue';

const router = useRouter()


defineProps({
  showPatientSelector: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <el-menu
    class="navbar"
    mode="horizontal"
    :ellipsis="false"
  >
    <el-menu-item index="0">
      <el-text class="title" size="large">中医病案可视分析</el-text>
    </el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="1">
      <a href="/" class="link">数据面板</a>
    </el-menu-item>
    <el-menu-item index="2">
      <PatientSelector v-if="showPatientSelector" />
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.navbar {
  width: 100%;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.flex-grow {
  flex-grow: 1;
}

.title {
  font-size: 18px;
  font-weight: bold;
}
</style>