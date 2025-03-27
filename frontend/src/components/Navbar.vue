<script setup>
import { ref, computed } from 'vue';
import { usePatientStore } from '../stores/patientStore';


const patientStore = usePatientStore();
const patients = Array.from({ length: 36 }, (_, i) => `patient${i + 1}`);

// Handle patient selection
const handlePatientChange = (patient) => {
  patientStore.setCurrentPatient(patient);
  patientStore.setLoading(true);
  
};

// 使用计算属性获取当前患者
const selectedPatient = computed(() => patientStore.currentPatient);
</script>

<template>
  <nav class="navbar navbar-expand-md w-100 bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">中医病案可视分析</a>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav ms-auto mb-2 mb-md-0 me-3">
          <!-- switch patient data -->
          <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            当前患者：{{ selectedPatient }}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" style="max-height: 280px; overflow-y: auto;">
            <li v-for="patient in patients" :key="patient">
              <a class="dropdown-item" href="#" @click="handlePatientChange(patient)">
                {{ patient }}
              </a>
            </li>
          </ul>
        </li>
<!-- TODO: 添加对比功能 -->
          <!-- <li class="nav-item">
            <a class="nav-link" href="#">添加对比</a>
          </li> -->
        </ul>

      </div>
    </div>
  </nav>
</template>
<style scoped>
.custom-file-upload {
  display: inline-block;
}
</style>