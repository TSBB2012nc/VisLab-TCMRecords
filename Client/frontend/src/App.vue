<script setup>
import { ref, onMounted, computed } from 'vue';
import StreamView from './components/StreamView.vue';
import MapView from './components/MapView.vue';
import Navbar from './components/Navbar.vue';
import VisitView from './components/VisitView.vue';

const visit = ref([]);
const visit_info = ref([]);
const herb_cnt = ref([]);
const herb_color = ref({});
const exp_color = ref({});
const book_color = ref({});


const fetchData = async (filename, container) => {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    container.value = data;
    return true;  // Return true on successful data load
  } catch (error) {
    console.error('Fetch error:', error);
    return false;  // Return false if there was an error
  }
};


// Update computed properties to set component-specific loading states
const streamViewReady = computed(() => 
  herb_cnt.value.length > 0 && 
  Object.keys(herb_color.value).length > 0
);

const visitViewReady = computed(() => 
  visit.value.length > 0
);

const mapViewReady = computed(() => 
  herb_cnt.value.length > 0 &&
  Object.keys(herb_color.value).length > 0 &&
  Object.keys(book_color.value).length > 0 &&
  Object.keys(exp_color.value).length > 0
);

onMounted(async () => {
  visit_info.value = {
    'v0': "蛋白尿g/L",
    'v1': ''
  };

  const results = await Promise.all([
    fetchData('/patient1_visit.json', visit),
    fetchData('/patient1_herbcnt.json', herb_cnt),
    fetchData('/herb_color.json', herb_color),
    fetchData('/book_color.json', book_color),
    fetchData('/exp_color.json', exp_color)
  ]);


});
</script>

<!-- TODO: 切换患者数据 -->
<!-- TODO: 上传患者数据 -->
<template>
  <div class="d-flex flex-column">
    <!-- Header: 导航栏和字典侧边组件 fixed-->
    <div class="d-flex flex-column fixed-top">
      <Navbar />
    </div>
    <!-- 主要视图 -->
    <div class="d-flex flex-column">
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
      <MapView v-else :herbColor="herb_color" :bookColor="book_color" 
               :expColor="exp_color" :herbCnt="herb_cnt[0]" />
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
</style>