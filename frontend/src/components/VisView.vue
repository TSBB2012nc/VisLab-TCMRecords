<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { usePatientStore } from '../stores/patientStore';

import StreamView from './StreamView.vue';
import MapView from './MapView.vue';
import VisitView from './VisitView.vue';
import TableView from './TableView.vue';


const patientStore = usePatientStore();
console.log(patientStore.currentPatient);

// Add loading states
const isStaticDataLoaded = ref(false);
const isPatientDataLoaded = ref(false);



const patient_data = ref({});
const book_color = ref({});
const exp_color = ref({});
const med_data = ref({})





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
      '教材分类': book_color.value[bookCategory] || '#000000', // Default to black if not found
      '专家分类': exp_color.value[expertCategory] || '#000000'  // Default to black if not found
    };
  }

  console.log(result)
  return result;
});


// 加载静态数据 *TESTED
const loadStaticData = async () => {
  try {
    await Promise.all([
      fetchData('/vis_utils/book_color.json', book_color),
      fetchData('/vis_utils/exp_color.json', exp_color),
      fetchData('/med_data/med_data.json', med_data)
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
  patientStore.setLoading(true)
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

// Add a watcher to log when static data is loaded
watch([med_data, book_color, exp_color], ([newMed, newBook, newExp]) => {
  console.log('Static data updated:', {
    med_data: Object.keys(newMed).length > 0,
    book_color: Object.keys(newBook).length > 0,
    exp_color: Object.keys(newExp).length > 0
  });
});

// 监听患者变化
watch(
  () => patientStore.currentPatient,
  () => {
    loadPatientData()
  }
)


onMounted(() => {
  loadStaticData();
  loadPatientData();
})
</script>

<template>
  <div class="d-flex flex-column w-100">
    <!-- Global loading state -->
    <div v-if="!isStaticDataLoaded || !isPatientDataLoaded" class="global-loading">
      <div class="alert alert-info">
        {{ !isStaticDataLoaded ? 'Loading static data...' : 'Loading patient data...' }}
      </div>
    </div>
    <div v-else>
      <!-- Table View Section -->
      <div class="w-100">
        <TableView :data="patient_data" />
      </div>
      <!-- Stream View Section -->
      <div class="mt-3">
        <StreamView :herbCnt="getHerbCount(patient_data)" :herbColor="herb_color" />
      </div>


      <!-- Visit View Section -->
      <!-- <VisitView :data="visit" :label="visit_info" /> -->

      <!-- Map View Section -->
      <!-- <MapView :herbColor="herb_color" :bookColor="book_color" :expColor="exp_color" :herbCnt="herb_cnt[0]" /> -->
    </div>
  </div>
</template>
<script>
function getHerbCount(patient_data) {
  // Check if required data exists
  if (!patient_data?.visits || !patient_data?.herb_set) {
    console.warn('Missing required data for herb count calculation');
    return [];
  }

  const herbList = patient_data.herb_set;
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

  // console.log('Herb count calculated:', {
  //   visits: result.length,
  //   herbsPerVisit: Object.keys(result[0] || {}).length
  // });

  return result;
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