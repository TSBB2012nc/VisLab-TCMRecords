<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePatientStore } from '../stores/patientStore';
import { 
  loadStaticData as loadApiStaticData, 
  getPatientVisits,
  bookColor,
  expColor,
  medData,
  sympLoc,
  attrLoc,
  isStaticDataLoaded,
  checkApiHealth
} from '../services/dataService.js';

import StreamView from './StreamView.vue';
import MapView from './MapView.vue';
import TableView from './TableView.vue';
import LineView from './LineView.vue';

const patientStore = usePatientStore();
const route = useRoute();

// Loading states
const isPatientDataLoaded = ref(false);
const apiStatus = ref('checking');

// Patient data
const patient_data = ref({});

// 计算中药的类型和颜色
const herbColor = computed(() => {
  if (!isStaticDataLoaded.value || !isPatientDataLoaded.value) {
    console.log('Waiting for all data to load...');
    return {};
  }

  // Check if all required data is loaded
  if (!medData.value || !bookColor.value || !expColor.value) {
    console.log('Missing required color data');
    return {};
  }

  const result = {};
  for (const herb in medData.value) {
    const bookCategory = medData.value[herb]?.['教材分类'];
    const expertCategory = medData.value[herb]?.['专家分类'];

    result[herb] = {
      'book_category': bookCategory,
      'book_color': bookColor.value[bookCategory] || null,
      'expert_category': expertCategory,
      'expert_color': expColor.value[expertCategory] || null
    };
  }

  return result;
});

// 使用静态数据中的颜色配置
const useHerbColor = computed(() => herbColor.value);

// 加载静态数据
const loadStaticData = async () => {
  try {
    await loadApiStaticData();
    console.log('Static data loaded successfully');
  } catch (error) {
    console.error('Error loading static data:', error);
  }
};

// 加载患者数据
const loadPatientData = async () => {
  try {
    isPatientDataLoaded.value = false;
    const patientId = route.params.id;
    
    if (!patientId) {
      console.error('No patient ID provided');
      return;
    }

    const data = await getPatientVisits(patientId);
    if (data) {
      patient_data.value = data;
      isPatientDataLoaded.value = true;
      console.log('Patient data loaded successfully for:', patientId);
    } else {
      console.error('No data returned for patient:', patientId);
    }
  } catch (error) {
    console.error('Error loading patient data:', error);
    isPatientDataLoaded.value = false;
  }
};

// 检查API连接状态
const checkApiConnection = async () => {
  try {
    const health = await checkApiHealth();
    if (health.status === 'OK') {
      apiStatus.value = 'connected';
    } else {
      apiStatus.value = 'error';
    }
  } catch (error) {
    console.error('API connection check failed:', error);
    apiStatus.value = 'error';
  }
};

// Watch for patient changes
watch(
  () => patientStore.currentPatient,
  async () => {
    await loadPatientData();
  }
);

// 添加对路由参数的监听
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadPatientData();
    }
  }
);

// Load both static and patient data on mount
onMounted(async () => {
  // 首先检查API连接状态
  await checkApiConnection();
  
  if (apiStatus.value === 'connected') {
    // Load both in parallel
    await Promise.all([
      loadStaticData(),
      loadPatientData()
    ]);
  } else {
    console.error('API connection failed, cannot load data');
  }
});

const processedPatientData = computed(() => {
  // Return early if data is not loaded
  if (!patient_data.value) return {};
  return patient_data.value;
});

// Helper functions for data processing
function getMetrics(patient_data) {
  // 检查输入数据是否有效
  if (!patient_data || typeof patient_data !== 'object') {
    console.warn('Invalid patient_data');
    return [];
  }

  try {
    // 转换数据为所需格式
    return Object.entries(patient_data).map(([visit_num, data]) => ({
      visit_num: parseInt(visit_num),
      date: data.date,
      metrics: data.metrics || {}
    })).sort((a, b) => a.visit_num - b.visit_num);
  } catch (error) {
    console.error('Error processing metrics data:', error);
    return [];
  }
}

function getStreamData(patient_data) {
  // 检查输入数据是否有效
  if (!patient_data || typeof patient_data !== 'object') {
    console.warn('Invalid patient_data');
    return [];
  }

  try {
    // Map patient_data directly to the required format
    return Object.entries(patient_data).map(([visit_num, data]) => ({
      visit_num: parseInt(visit_num),
      date: data.date,
      herb: data.herb || [],
      symp: data.symp || []
    })).sort((a, b) => a.visit_num - b.visit_num);
  } catch (error) {
    console.error('Error processing stream data:', error);
    return [];
  }
}
</script>

<template>
  <div class="d-flex flex-column w-100">
    <!-- API Status Alert -->
    <div v-if="apiStatus === 'error'" class="alert alert-warning">
      ⚠️ 无法连接到后端服务器，请确保后端服务正在运行（端口8000）
    </div>

    <!-- Global loading state -->
    <div v-if="!isStaticDataLoaded || !isPatientDataLoaded" class="global-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>正在加载数据...</p>
      </div>
    </div>
    
    <div v-else>
      <!-- Table View Section -->
      <div class="w-80">
        <TableView :data="processedPatientData" />
      </div>
      <!-- Stream View Section -->
      <div class="mt-5">
        <StreamView :streamData="getStreamData(patient_data)" :herbColor="herbColor" />
      </div>
      <!-- Visit View Section -->
      <div>
        <LineView :data="getMetrics(patient_data)" />
      </div>
      <!-- Map View Section -->
      <div>
        <MapView 
          v-if="patient_data.herb_set" 
          :herbColor="useHerbColor" 
          :bookColor="bookColor" 
          :expColor="expColor"
          :herbSet="patient_data.herb_set" 
          :symp_loc="sympLoc" 
          :attr_loc="attrLoc" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert {
  text-align: center;
  padding: 1rem;
  margin: 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffecb5;
  color: #856404;
}

.global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
