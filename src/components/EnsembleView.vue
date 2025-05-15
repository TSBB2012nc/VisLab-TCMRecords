<template>
  <div class="ensemble-container">
    <h3>选中的患者ID：</h3>
    <el-tag
      v-for="id in patientIdList"
      :key="id"
      class="patient-tag"
      type="info"
    >
      {{ id }}
    </el-tag>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用药河流图</span>
          <el-button type="primary" @click="goBack">返回</el-button>
        </div>
      </template>
      <div v-if="!isStaticDataLoaded || !isPatientDataLoaded" v-loading="true" class="content">
        <el-empty description="加载中..." />
      </div>
      <div v-else class="content">
        <div class="chart-section">
          <div id="chart-ensemble-stream"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { TrendCharts } from '@element-plus/icons-vue';
import * as d3 from 'd3';

const props = defineProps<{
  patientIds?: string
}>();

// Loading states
const isStaticDataLoaded = ref(false);
const isPatientDataLoaded = ref(false);

// Data refs
const patientDataMap = ref<Record<string, any>>({});
const bookColor = ref({});
const expColor = ref({});
const medData = ref({});
const sympLoc = ref({});
const attrLoc = ref({});

const patientIdList = computed(() => {
  return props.patientIds ? props.patientIds.split(',') : [];
});

const router = useRouter();

const goBack = () => {
  router.push('/');
};

// Fetch data utility function
const fetchData = async (url: string) => {
  const response = await fetch(import.meta.env.BASE_URL + url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Load static data
const loadStaticData = async () => {
  try {
    const [bookColorData, expColorData, medDataData, sympLocData, attrLocData] = await Promise.all([
      fetchData('vis_utils/book_color.json'),
      fetchData('vis_utils/exp_color.json'),
      fetchData('med_data/med_data.json'),
      fetchData('vis_utils/symp_loc.json'),
      fetchData('vis_utils/attr_loc.json')
    ]);

    bookColor.value = bookColorData;
    expColor.value = expColorData;
    medData.value = medDataData;
    sympLoc.value = sympLocData;
    attrLoc.value = attrLocData;

    isStaticDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading static data:', error);
  }
};

// Load patient data
const loadPatientData = async () => {
  try {
    const dataPromises = patientIdList.value.map(async (patientId) => {
      const data = await fetchData(`patient/${patientId}.json`);
      return [patientId, data];
    });
    
    const results = await Promise.all(dataPromises);
    patientDataMap.value = Object.fromEntries(results);
    isPatientDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading patient data:', error);
  }
};

// Add herbColor computed property
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

// 提取单个病人的河流图数据
const getStreamData = (patientData: any) => {
  if (!patientData || typeof patientData !== 'object') {
    console.warn('Invalid patient data');
    return [];
  }

  try {
    return Object.entries(patientData).map(([visit_num, data]: [string, any]) => ({
      visit_num: parseInt(visit_num),
      date: data.date,
      scripts: data.scripts
    }));
  } catch (error) {
    console.error('Error processing patient data:', error);
    return [];
  }
};

// 按book_category对药物进行分类和排序
const categorizeHerbs = (streamData: any[], herbColorMap: any) => {
  const categoryMap = new Map();

  streamData.forEach(visit => {
    Object.entries(visit.scripts).forEach(([herb, data]: [string, any]) => {
      const category = herbColorMap[herb]?.book_category || '未分类';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Set());
      }
      categoryMap.get(category).add(herb);
    });
  });

  // 对每个类别内的药物按字典序排序
  return new Map([...categoryMap.entries()].map(([category, herbs]) => [
    category,
    [...herbs].sort((a, b) => a.localeCompare(b))
  ]));
};

// 计算所有病人的药物类别全集
const getAllCategories = (patientDataMap: Record<string, any>, herbColorMap: any) => {
  const allCategories = new Set();
  
  Object.values(patientDataMap).forEach(patientData => {
    const streamData = getStreamData(patientData);
    const categories = categorizeHerbs(streamData, herbColorMap);
    categories.forEach((_, category) => allCategories.add(category));
  });

  return [...allCategories].sort();
};

// 计算总的图表所需高度（每个类别一个河流图）
const calculateTotalHeight = (categoryCount: number) => {
  const singleHeight = 200; // 单个河流图高度
  const gap = 50; // 河流图之间的间距
  return (singleHeight + gap) * categoryCount;
};

// 修改绘制河流图函数
const drawOverlayStream = () => {
  if (!isStaticDataLoaded.value || !isPatientDataLoaded.value) return;

  const margin = { top: 20, right: 80, bottom: 30, left: 50 };
  const width = 0.85 * window.innerWidth - margin.left - margin.right;
  const singleHeight = 200;
  const gap = 50;

  const allCategories = getAllCategories(patientDataMap.value, herbColor.value);
  const totalHeight = calculateTotalHeight(allCategories.length);

  // 移除全局 maxVisit 的计算，因为现在每个病人都使用自己的访问索引

  // 计算所有类别的数据范围，用于创建统一的y比例尺
  let globalMinY = Infinity;
  let globalMaxY = -Infinity;

  // 首先计算所有类别的数据范围
  allCategories.forEach(category => {
    Object.values(patientDataMap.value).forEach(patientData => {
      const streamData = getStreamData(patientData);
      const categorizedHerbs = categorizeHerbs(streamData, herbColor.value);
      const categoryHerbs = categorizedHerbs.get(category) || [];

      if (categoryHerbs.length === 0) return;

      const stackData = streamData.map((visit, index) => {
        const visitData: any = { visit: index }; // 使用索引替代具体诊次
        categoryHerbs.forEach(herb => {
          visitData[herb] = visit.scripts[herb]?.amount || 0;
        });
        return visitData;
      });

      const stack = d3.stack()
        .keys(categoryHerbs)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);

      const layers = stack(stackData);

      // 更新全局最大最小值
      const minY = d3.min(layers, layer => d3.min(layer, d => d[0])) || 0;
      const maxY = d3.max(layers, layer => d3.max(layer, d => d[1])) || 0;
      globalMinY = Math.min(globalMinY, minY);
      globalMaxY = Math.max(globalMaxY, maxY);
    });
  });

  // 创建统一的y比例尺
  const y = d3.scaleLinear()
    .domain([globalMinY, globalMaxY])
    .range([singleHeight, 0]);

  // 清除现有图表并创建新的SVG容器
  d3.select("#chart-ensemble-stream").selectAll("*").remove();
  const svg = d3.select("#chart-ensemble-stream")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", totalHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 为每个类别创建一个子图
  allCategories.forEach((category, index) => {
    const yOffset = index * (singleHeight + gap);
    
    // 添加类别标题
    svg.append("text")
      .attr("x", 0)
      .attr("y", yOffset - 10)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(`${category}`);

    // 创建该类别的canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = singleHeight;
    const ctx = canvas.getContext('2d');

    // 处理每个病人的数据
    const patientCount = Object.keys(patientDataMap.value).length;
    const opacity = 1.0 / patientCount;

    Object.values(patientDataMap.value).forEach(patientData => {
      const streamData = getStreamData(patientData);
      const categorizedHerbs = categorizeHerbs(streamData, herbColor.value);
      const categoryHerbs = categorizedHerbs.get(category) || [];

      if (categoryHerbs.length === 0) return;

      // 为每个病人创建独立的x比例尺
      const x = d3.scaleLinear()
        .domain([0, streamData.length - 1])
        .range([0, width]);

      const stackData = streamData.map((visit, index) => {
        const visitData: any = { visit: index };
        categoryHerbs.forEach(herb => {
          visitData[herb] = visit.scripts[herb]?.amount || 0;
        });
        return visitData;
      });

      const stack = d3.stack()
        .keys(categoryHerbs)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);

      const layers = stack(stackData);

      // 使用统一的y比例尺和病人特定的x比例尺绘制河流图
      layers.forEach(layer => {
        const herb = layer.key as string;
        const color = herbColor.value[herb]?.book_color;
        if (!color) return;

        ctx!.beginPath();
        const firstPoint = layer[0];
        ctx!.moveTo(x(0), y(firstPoint[0]));

        layer.forEach((point, i) => {
          ctx!.lineTo(x(i), y(point[1]));
        });

        for (let i = layer.length - 1; i >= 0; i--) {
          ctx!.lineTo(x(i), y(layer[i][0]));
        }

        ctx!.closePath();
        ctx!.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${opacity})`;
        ctx!.fill();
      });
    });

    // 将canvas内容添加到SVG
    const image = new Image();
    image.onload = () => {
      svg.append("image")
        .attr("x", 0)
        .attr("y", yOffset)
        .attr("width", width)
        .attr("height", singleHeight)
        .attr("xlink:href", canvas.toDataURL());
      
      // 移除x轴和y轴的绘制代码
    };
    image.src = canvas.toDataURL();
  });
};

// 监听数据变化，重新绘制图表
watch([isStaticDataLoaded, isPatientDataLoaded], ([newStaticLoaded, newPatientLoaded]) => {
  if (newStaticLoaded && newPatientLoaded) {
    drawOverlayStream();
  }
});

// 初始化图表区域
const initChartArea = () => {
  const margin = { top: 20, right: 80, bottom: 60, left: 50 };
  const width = 0.85 * window.innerWidth - margin.left - margin.right;
  const height = 0.5 * window.innerHeight - margin.top - margin.bottom;

  // 清除现有的图表
  d3.select("#chart-ensemble-stream").selectAll("*").remove();

  // 创建SVG容器
  const svg = d3.select("#chart-ensemble-stream")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return svg;
};

onMounted(async () => {
  try {
    await Promise.all([
      loadStaticData(),
      loadPatientData()
    ]);
    drawOverlayStream();
  } catch (error) {
    console.error('Error during data loading:', error);
  }
});
</script>

<style scoped>
.ensemble-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  margin-top: 20px;
}

.patient-tag {
  margin: 0 5px 5px 0;
}

.chart-section {
  margin-top: 20px;
  width: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-icon {
  margin-right: 8px;
}

#chart-ensemble-stream {
  width: 100%;
  min-height: 400px;
}
</style>
