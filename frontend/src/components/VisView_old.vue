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

// Loading states
const isPatientDataLoaded = ref(false);
const apiStatus = ref('checking');

// Patient data
const patient_data = ref({});

const route = useRoute();

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
    // console.log('Static data loaded')
    // console.log('Book color:', book_color.value)
    // console.log('Exp color:', exp_color.value)
    isStaticDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading static data:', error)
  }

}

// 加载患者数据 *TESTED
const loadPatientData = async () => {
  try {
    const patientId = route.params.id || patientStore.currentPatient;
    console.log('Loading patient data for ID:', patientId);

    // 重置patient数据
    patient_data.value = {};
    // 加载新数据
    await Promise.all([
      fetchData(`patient/${patientId}.json`, patient_data),
    ]);
    console.log('Patient data loaded:', patient_data.value);
    isPatientDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading patient data:', error);
  } finally {
    patientStore.setLoading(false);
  }
}

// Watch for patient changes only
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
  // Load both in parallel
  await Promise.all([
    loadStaticData(),
    loadPatientData()
  ]);
});

const processedPatientData = computed(() => {
  // Return early if data is not loaded
  if (!patient_data.value) return {};
  return patient_data.value;
});

</script>

<template>
  <div class="d-flex flex-column w-100">
    <!-- Global loading state -->
    <div v-if="!isStaticDataLoaded || !isPatientDataLoaded" class="global-loading">
    </div>
    <div v-else>
      <!-- Table View Section - Updated -->
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
        <MapView v-if="patient_data.herb_set" :herbColor="useHerbColor" :bookColor="book_color" :expColor="exp_color"
          :herbSet="patient_data.herb_set" :symp_loc="symp_loc" :attr_loc="attr_loc" />
      </div>

    </div>
  </div>
</template>
<script>


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
      scripts: data.scripts
    }));
  } catch (error) {
    console.error('Error processing patient data:', error);
    return [];
  }
}

</script>
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