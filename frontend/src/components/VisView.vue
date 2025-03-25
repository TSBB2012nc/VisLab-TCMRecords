<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { usePatientStore } from '../stores/patientStore';

import StreamView from './StreamView.vue';
import MapView from './MapView.vue';
import VisitView from './VisitView.vue';


const patientStore = usePatientStore();
console.log(patientStore.currentPatient);


const patient_data = ref({});
const book_color = ref({});
const exp_color = ref({});

// 加载静态数据
const loadStaticData = async () => {
  try {
    await Promise.all([
      fetchData('/herb_color.json', herb_color),
      fetchData('/book_color.json', book_color),
      fetchData('/exp_color.json', exp_color)
    ])
    console.log('Static data loaded')
  } catch (error) {
    console.error('Error loading static data:', error)
  }
}


const loadPatientData = async () => {
  patientStore.setLoading(true)
  try {
    const currentPatient = patientStore.currentPatient

    // 重置patient数据
    patient_data.value = {}
    // 加载新数据
    await Promise.all([
      fetchData(`/patient/patient${currentPatient}.json`, patient_data).then(() => {
        console.log('Patient data loaded:', patient_data.value)
      }),
      fetchData('/herb_color.json', herb_color),
      fetchData('/book_color.json', book_color),
      fetchData('/exp_color.json', exp_color)
    ])
  } catch (error) {
    console.error('Error loading patient data:', error)
  } finally {
    patientStore.setLoading(false)
  }
}

// 监听患者变化
watch(
  () => patientStore.currentPatient,
  () => {
    loadPatientData()
  }
)

onMounted(() => {
  loadPatientData()
})
</script>

<template>
  <div class="d-flex flex-column">
    <!-- 添加全局加载状态 -->
    <div v-if="patientStore.isLoading" class="global-loading">
      <div class="alert alert-info">Loading patient data...</div>
    </div>
    <div v-else>
      <!-- Stream View Section -->
      <div v-if="!streamViewReady" class="alert alert-info">
        Loading Stream View...
      </div>
      <StreamView v-else :herbCnt="herb_cnt" :herbColor="herb_color" />

      <!-- Visit View Section -->
      <div v-if="!visitViewReady" class="alert alert-info">
        Loading Visit View...
      </div>
      <VisitView v-else :data="visit" :label="visit_info" />

      <!-- Map View Section -->
      <div v-if="!mapViewReady" class="alert alert-info">
        Loading Map View...
      </div>
      <MapView v-else :herbColor="herb_color" :bookColor="book_color" :expColor="exp_color" :herbCnt="herb_cnt[0]" />
    </div>
  </div>
</template>
<style scoped>
.alert {
  text-align: center;
  padding: 1rem;
  margin: 1rem;
  transition: all 0.3s ease;
}

.alert-info {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>