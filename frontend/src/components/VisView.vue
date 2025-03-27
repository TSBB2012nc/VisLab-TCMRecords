<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { usePatientStore } from '../stores/patientStore';

import StreamView from './StreamView.vue';
import MapView from './MapView.vue';
import TableView from './TableView.vue';
import LineView from './LineView.vue';


const patientStore = usePatientStore();
console.log(patientStore.currentPatient);

// Add loading states
const isStaticDataLoaded = ref(false);
const isPatientDataLoaded = ref(false);



const patient_data = ref({});
const book_color = ref({});
const exp_color = ref({});
const med_data = ref({})
const symp_loc = ref({});  // 症状降维坐标
const attr_loc = ref({});  // 四气五味降维坐标




// fetchData utility function *TESTED
const fetchData = async (url, targetRef) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  targetRef.value = data;
};

const herb_color = computed(() => {
  if (!isStaticDataLoaded.value || !isPatientDataLoaded.value) {
    console.log('Waiting for all data to load...');
    return {};
  }

  // Check if all required data is loaded
  if (!med_data.value || !book_color.value || !exp_color.value) {
    console.log('Missing required color data');
    return {};
  }

  const result = {};
  for (const herb in med_data.value) {
    const bookCategory = med_data.value[herb]?.['教材分类'];
    const expertCategory = med_data.value[herb]?.['专家分类'];

    result[herb] = {
      '教材分类': book_color.value[bookCategory] || null, // Default to null if not found
      '专家分类': exp_color.value[expertCategory] || null  // Default to null if not found
    };
  }

  // console.log(result)
  return result;
});

console.log(herb_color);

// 加载静态数据 *TESTED
const loadStaticData = async () => {
  try {
    await Promise.all([
      fetchData('/vis_utils/book_color.json', book_color),
      fetchData('/vis_utils/exp_color.json', exp_color),
      fetchData('/med_data/med_data.json', med_data),
      fetchData('/vis_utils/symp_loc.json', symp_loc),
      fetchData('/vis_utils/attr_loc.json', attr_loc)
    ])
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
    const currentPatient = patientStore.currentPatient
    console.log(currentPatient);
    // 重置patient数据
    patient_data.value = {};
    // 加载新数据
    await Promise.all([
      fetchData(`/patient_data/${currentPatient}.json`, patient_data),
    ]);
    // console.log('Patient data loaded:', patient_data.value)
    isPatientDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading patient data:', error)
  } finally {
    patientStore.setLoading(false)
  }
}

// Watch for patient changes only
watch(
  () => patientStore.currentPatient,
  async () => {
    await loadPatientData();
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
</script>

<template>
  <div class="d-flex flex-column w-100">
    <!-- Global loading state -->
    <div v-if="!isStaticDataLoaded || !isPatientDataLoaded" class="global-loading">
    </div>
    <div v-else>
      <!-- Table View Section -->
      <div class="w-100">
        <TableView :data="patient_data" />
      </div>
      <!-- Stream View Section -->
      <div class="mt-5" v-if="getHerbCountFlag(patient_data)">
        <StreamView :herbCnt="getHerbCount(patient_data, med_data)" :herbColor="herb_color" />
      </div>
      <!-- Visit View Section -->
      <div>
        <LineView v-if="patient_data.visits && patient_data.visits[0]?.metrics" :data="getMetrics(patient_data)" />
      </div>
      <div>
        <MapView v-if="patient_data.herb_set" :herbColor="herb_color" :bookColor="book_color" :expColor="exp_color"
          :herbSet="patient_data.herb_set" :symp_loc="symp_loc" :attr_loc="attr_loc" />
      </div>
      <!-- Map View Section -->

    </div>
  </div>
</template>
<script>

function getHerbCountFlag(patient_data) {
  if (!patient_data?.visits) {
    // console.warn('Missing visits data');
    return false;
  }
  return patient_data.visits[0].scripts !== undefined;
}

function getHerbCount(patient_data, med_data) {

  // console.log(patient_data);
  const herbList = patient_data.herb_set;
  // Sort herbList based on the dictionary order of herbCatExp
  herbList.sort((a, b) => {
    const categoryA = med_data[a]?.['专家分类'] || '未知分类';
    const categoryB = med_data[b]?.['专家分类'] || '未知分类';
    return categoryA.localeCompare(categoryB);
  });
  // console.log(herbList);
  const result = [];

  // Process each visit
  patient_data.visits.forEach(visit => {
    // Initialize herb count object for this visit
    const visitHerbs = {
      'visit': visit.visit_num
    };

    // Initialize all herbs with 0
    herbList.forEach(herb => {
      visitHerbs[herb] = 0;
    });


    var currentScripts = visit.scripts;
    // console.log(currentScripts);

    // 使用currentScripts的键值对更新visitHerbs
    for (const [key, value] of Object.entries(currentScripts)) {
      visitHerbs[key] = value;
    }
    // console.log(visitHerbs);
    result.push(visitHerbs);
  });
  return result;
}
function getMetrics(patient_data) {
  // Check if patient_data and visits exist
  if (!patient_data?.visits) {
    console.warn('Missing visits data');
    return [];
  }

  // Extract required fields from each visit
  const visitMetrics = patient_data.visits.map(visit => ({
    visit_num: visit.visit_num,
    date: visit.date,
    metrics: visit.metrics
  }));

  return visitMetrics;
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