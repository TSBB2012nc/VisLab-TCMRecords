<script setup>
import { computed, ref } from 'vue';
import { patientList, isLoading } from '../services/dataService';

// 从 patientList 中提取 PID 作为选项
const patients = computed(() => patientList.value.map(patient => patient.PID));
const selectedPatient = ref(null);

const handlePatientChange = (patient) => {
  emit('change', patient);
};

const emit = defineEmits(['change']);
</script>

<template>
  <div class="patient-selector">
    <el-select
      v-model="selectedPatient"
      @change="handlePatientChange"
      placeholder="切换患者"
      size="large"
      style="width: 160px"
      :loading="isLoading"
    >
      <el-option
        v-for="pid in patients"
        :key="pid"
        :label="pid"
        :value="pid"
      />
    </el-select>
  </div>
</template>

<style scoped>
.patient-selector {
  display: inline-block;
  margin: 0 10px;
}
</style>
