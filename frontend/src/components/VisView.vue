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
    return {};
  }

  // Check if all required data is loaded
  if (!medData.value || !bookColor.value || !expColor.value) {
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
    if (health.status === 'healthy') {
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
  
  // 处理新的API格式：{ patient_id: "001", timeline: [...] }
  if (patient_data.value.timeline && Array.isArray(patient_data.value.timeline)) {
    const processedData = {};
    patient_data.value.timeline.forEach((timelineEntry, index) => {
      // 将herbs数组转换为scripts对象格式
      const scripts = {};
      if (timelineEntry.herbs && Array.isArray(timelineEntry.herbs)) {
        timelineEntry.herbs.forEach(herb => {
          scripts[herb.name] = {
            amount: herb.amount,
            raw_name: herb.raw_name
          };
        });
      }
      
      processedData[index] = {
        date: timelineEntry.date,
        metrics: {
          '肌酐': timelineEntry['肌酐'],
          '蛋白量mg': timelineEntry['蛋白量mg'],
          '蛋白定性': timelineEntry['蛋白定性'],
          '血尿定性': timelineEntry['血尿定性']
        },
        scripts: scripts,
        '味数': timelineEntry['味数'],
        '剂数': timelineEntry['剂数'],
        '频次': timelineEntry['频次'] || '/',
        '途径': timelineEntry['途径'] || '/'
      };
    });
    return processedData;
  }
  
  // 兼容旧格式
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
    // 处理新的API格式：{ patient_id: "001", timeline: [...] }
    if (patient_data.timeline && Array.isArray(patient_data.timeline)) {
      return patient_data.timeline.map((timelineEntry, index) => ({
        visit_num: index, // 使用索引作为visit_num
        date: timelineEntry.date,
        metrics: {
          '肌酐': timelineEntry['肌酐'],
          '蛋白量mg': timelineEntry['蛋白量mg'],
          '蛋白定性': timelineEntry['蛋白定性'],
          '血尿定性': timelineEntry['血尿定性']
        }
      }));
    }
    
    // 兼容旧格式：Object.entries for visit-based data
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
    // 处理新的API格式：{ patient_id: "001", timeline: [...] }
    if (patient_data.timeline && Array.isArray(patient_data.timeline)) {
      const result = patient_data.timeline.map((timelineEntry, index) => {
        // 将herbs数组转换为scripts对象格式
        const scripts = {};
        if (timelineEntry.herbs && Array.isArray(timelineEntry.herbs)) {
          timelineEntry.herbs.forEach(herb => {
            scripts[herb.name] = {
              amount: herb.amount,
              raw_name: herb.raw_name
            };
          });
        }
        
        return {
          visit_num: index, // 使用索引作为visit_num
          date: timelineEntry.date,
          scripts: scripts
        };
      });
      
      return result;
    }
    
    // 兼容旧格式：Object.entries for visit-based data
    const result = Object.entries(patient_data).map(([visit_num, data]) => {
      return {
        visit_num: parseInt(visit_num),
        date: data.date,
        scripts: data.scripts || {}
      };
    }).sort((a, b) => a.visit_num - b.visit_num);
    
    return result;
  } catch (error) {
    console.error('Error processing stream data:', error);
    return [];
  }
}

function getAllHerbsFromTimeline(patient_data) {
  if (!patient_data || !patient_data.timeline || !Array.isArray(patient_data.timeline)) {
    return [];
  }
  
  const allHerbs = new Set();
  patient_data.timeline.forEach(timelineEntry => {
    if (timelineEntry.herbs && Array.isArray(timelineEntry.herbs)) {
      timelineEntry.herbs.forEach(herb => {
        allHerbs.add(herb.name);
      });
    }
  });
  
  return Array.from(allHerbs);
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
          v-if="patient_data.timeline && patient_data.timeline.length > 0" 
          :herbColor="useHerbColor" 
          :bookColor="bookColor" 
          :expColor="expColor"
          :herbSet="getAllHerbsFromTimeline(patient_data)" 
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
