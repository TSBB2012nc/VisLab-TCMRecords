<script setup>
import { ref, onMounted } from 'vue';
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
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

onMounted(() => {
  visit_info.value = {
    'v0': "蛋白尿g/L",
    'v1': ''
  };
  fetchData('/patient1_visit.json', visit);
  fetchData('/patient1_herbcnt.json', herb_cnt);

  fetchData('/herb_color.json', herb_color);
  fetchData('/book_color.json', book_color);
  fetchData('/exp_color.json', exp_color);
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
      <StreamView :herbCnt="herb_cnt" :herbColor="herb_color" />
      <VisitView v-if="visit.length" :data="visit" :label="visit_info"/>
      <MapView :herbColor="herb_color" :bookColor="book_color" :expColor="exp_color" :herbCnt="herb_cnt[0]"/>
    </div>
  </div>
</template>

