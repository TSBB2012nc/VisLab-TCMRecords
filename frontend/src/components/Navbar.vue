<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PatientSelector from './PatientSelector.vue'
import { loadPatientList } from '../services/dataService'

const router = useRouter()
const props = defineProps({
  showPatientSelector: Boolean
})

const handlePatientChange = (patientId) => {
  if (patientId) {
    router.push(`/patient/${patientId}`)
  }
}

onMounted(async () => {
  await loadPatientList()
})
</script>

<template>
  <el-menu class="navbar" mode="horizontal" :ellipsis="false">
    <el-menu-item index="0">
      <el-text class="title" size="large">中医病案可视分析</el-text>
    </el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="1">
      <router-link to="/" class="link">数据面板</router-link>
    </el-menu-item>
    <el-menu-item index="2">
      <router-link to="/va" class="link">可视分析</router-link>
    </el-menu-item>
    <el-menu-item index="3">
      <PatientSelector 
        v-if="showPatientSelector" 
        @change="handlePatientChange"
      />
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

.link {
  text-decoration: none;
  color: inherit;
}

.link:hover {
  color: #409eff;
}
</style>