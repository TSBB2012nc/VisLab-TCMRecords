<template>
  <div class="ensemble-container">
    <!-- Controller -->
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
      "
    >
      <div style="display: flex; flex-wrap: wrap; align-items: center">
        <h3 style="margin-right: 10px">选中的患者ID：</h3>
        <el-tag
          v-for="id in patientIdList"
          :key="id"
          class="patient-tag"
          type="info"
        >
          {{ id }}
        </el-tag>
      </div>

      <div class="category-selector">
        <h3 class="selector-label">药物类别：</h3>
        <el-select
          v-model="selectedCategory"
          placeholder="选择药物类别"
        >
          <el-option
            v-for="category in allCategories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </div>
    </div>

    <!-- 统计表格卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="section-title">
          <el-icon class="section-icon"><Grid /></el-icon>
          <span>统计表格</span>
        </div>
      </template>
      <div v-if="!isStaticDataLoaded || !isPatientDataLoaded" v-loading="true">
        <el-empty description="加载中..." />
      </div>
      <div v-else>
        <div class="stats-table">
          <el-table
            :data="categoryStats[selectedCategory]"
            size="small"
            border
            style="width: 100%"
            max-height="400"
            :header-cell-style="{
              background: '#f5f7fa',
              color: '#606266',
              fontWeight: 'bold',
              textAlign: 'center',
            }"
            :cell-style="{
              textAlign: 'center',
            }"
          >
            <el-table-column
              prop="herb"
              label="药名"
              fixed="left"
              width="180"
              align="left"
              :cell-style="{ textAlign: 'left' }"
            />
            <el-table-column
              prop="totalCount"
              label="总出现次数"
              sortable
            />
            <el-table-column
              prop="patientRatio"
              label="病人使用比例"
              sortable
            />
            <el-table-column
              label="前期"
              sortable
              :sort-method="
                (a, b) => a.stageCounts[0].count - b.stageCounts[0].count
              "
            >
              <template #default="{ row }">
                <span>{{ row.stageCounts[0].count }}</span>
                <span style="color: #909399; margin-left: 4px"
                  >({{ row.stageCounts[0].ratio }})</span
                >
              </template>
            </el-table-column>
            <el-table-column
              label="中期"
              width="140"
              sortable
              :sort-method="
                (a, b) => a.stageCounts[1].count - b.stageCounts[1].count
              "
            >
              <template #default="{ row }">
                <span>{{ row.stageCounts[1].count }}</span>
                <span style="color: #909399; margin-left: 4px"
                  >({{ row.stageCounts[1].ratio }})</span
                >
              </template>
            </el-table-column>
            <el-table-column
              label="后期"
              width="140"
              sortable
              :sort-method="
                (a, b) => a.stageCounts[2].count - b.stageCounts[2].count
              "
            >
              <template #default="{ row }">
                <span>{{ row.stageCounts[2].count }}</span>
                <span style="color: #909399; margin-left: 4px"
                  >({{ row.stageCounts[2].ratio }})</span
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <!-- 河流图卡片 -->
    <el-card class="box-card" style="margin-top: 30px">
      <template #header>
        <div class="section-title">
          <el-icon class="section-icon">
            <TrendCharts />
          </el-icon>
          <span>用药河流图</span>
        </div>
      </template>
      <div
        v-if="!isStaticDataLoaded || !isPatientDataLoaded"
        v-loading="true"
        class="content"
      >
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
import { computed, ref, onMounted, watch } from "vue";
import { TrendCharts, Grid } from "@element-plus/icons-vue";
import * as d3 from "d3";
import {
  loadStaticData,
  loadPatientData as loadApiPatientData,
  bookColor,
  expColor,
  medData,
  isStaticDataLoaded,
  patientDataMap as globalPatientDataMap,
  isPatientDataLoaded as globalIsPatientDataLoaded,
} from "../services/dataService.js";
import { calculateHerbStats } from "../utils/statsUtils";
import type { HerbColorMap, PatientData, StreamData } from "../types";

const props = defineProps<{
  patientIds?: string;
}>();

// Loading states
const isPatientDataLoaded = computed(() => globalIsPatientDataLoaded.value);

// Data refs
const patientDataMap = computed(() => globalPatientDataMap.value);

const patientIdList = computed(() => {
  return props.patientIds ? props.patientIds.split(",") : [];
});

// Selected category ref
const selectedCategory = ref<string>("");

// Load patient data
const loadPatientData = async () => {
  try {
    if (patientIdList.value.length === 0) {
      console.error('No patient IDs provided');
      return;
    }
    
    // Use the new API function
    await loadApiPatientData(patientIdList.value);
  } catch (error) {
    console.error("Error loading patient data:", error);
  }
};

// Add herbColor computed property
const herbColor = computed<HerbColorMap>(() => {
  if (!isStaticDataLoaded.value || !isPatientDataLoaded.value) {
    return {};
  }

  if (!medData.value || !bookColor.value || !expColor.value) {
    return {};
  }

  const result: HerbColorMap = {};
  for (const herb in medData.value) {
    const bookCategory = medData.value[herb]?.["教材分类"];
    const expertCategory = medData.value[herb]?.["专家分类"];

    result[herb] = {
      book_category: bookCategory,
      book_color: bookColor.value[bookCategory] || null,
      expert_category: expertCategory,
      expert_color: expColor.value[expertCategory] || null,
    };
  }

  return result;
});

// 提取单个病人的河流图数据
const getStreamData = (patientData: PatientData): StreamData[] => {
  if (!patientData || typeof patientData !== "object") {
    console.warn("Invalid patient data");
    return [];
  }

  return Object.entries(patientData).map(([visit_num, data]) => ({
    visit_num: parseInt(visit_num),
    date: data.date,
    scripts: data.scripts,
  }));
};

// 按book_category对药物进行分类和排序
const categorizeHerbs = (
  streamData: StreamData[],
  herbColorMap: HerbColorMap
) => {
  const categoryMap = new Map<string, Set<string>>();

  streamData.forEach((visit) => {
    Object.entries(visit.scripts).forEach(([herb, data]) => {
      const category = herbColorMap[herb]?.book_category || "未分类";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Set());
      }
      categoryMap.get(category)?.add(herb);
    });
  });

  return new Map(
    [...categoryMap.entries()].map(([category, herbs]) => [
      category,
      [...herbs].sort((a, b) => a.localeCompare(b)),
    ])
  );
};

// 计算所有病人的药物类别全集
const getAllCategories = (
  patientDataMap: Record<string, PatientData>,
  herbColorMap: HerbColorMap
): string[] => {
  const allCategories = new Set<string>();

  Object.values(patientDataMap).forEach((patientData) => {
    Object.values(patientData).forEach((visit) => {
      Object.keys(visit.scripts).forEach((herb) => {
        const category = herbColorMap[herb]?.book_category;
        if (category) {
          allCategories.add(category);
        }
      });
    });
  });

  return [...allCategories].sort();
};

// 统计数据
const allCategories = ref<string[]>([]);
const categoryStats = ref<Record<string, any[]>>({});

// 计算统计数据
const calculateStats = () => {
  if (!isStaticDataLoaded.value || !isPatientDataLoaded.value) return;

  allCategories.value = getAllCategories(patientDataMap.value, herbColor.value);
  const stats: Record<string, any[]> = {};

  allCategories.value.forEach((category) => {
    try {
      stats[category] = calculateHerbStats(
        patientDataMap.value,
        herbColor.value,
        category
      );
    } catch (error) {
      console.error(`Error calculating stats for category ${category}:`, error);
      stats[category] = [];
    }
  });

  categoryStats.value = stats;
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

  const margin = { top: 50, right: 80, bottom: 30, left: 50 };
  const width = 0.85 * window.innerWidth - margin.left - margin.right;
  const singleHeight = 200;
  const gap = 50;

  const categoriesToDraw = selectedCategory.value
    ? [selectedCategory.value]
    : getAllCategories(patientDataMap.value, herbColor.value);

  const totalHeight = calculateTotalHeight(categoriesToDraw.length);

  let globalMinY = Infinity;
  let globalMaxY = -Infinity;

  // 计算所有类别的数据范围
  categoriesToDraw.forEach((category) => {
    Object.values(patientDataMap.value).forEach((patientData) => {
      const streamData = getStreamData(patientData as PatientData);
      const categorizedHerbs = categorizeHerbs(streamData, herbColor.value);
      const categoryHerbs = categorizedHerbs.get(category) || [];

      if (categoryHerbs.length === 0) return;

      const stackData = streamData.map((visit, index) => {
        const visitData: Record<string, number> = { visit: index };
        categoryHerbs.forEach((herb) => {
          visitData[herb] = visit.scripts[herb]?.amount || 0;
        });
        return visitData;
      });

      const stack = d3
        .stack()
        .keys(categoryHerbs)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);

      const layers = stack(stackData);

      const minY = d3.min(layers, (layer) => d3.min(layer, (d) => d[0])) || 0;
      const maxY = d3.max(layers, (layer) => d3.max(layer, (d) => d[1])) || 0;
      globalMinY = Math.min(globalMinY, minY);
      globalMaxY = Math.max(globalMaxY, maxY);
    });
  });

  // 创建统一的y比例尺
  const y = d3
    .scaleLinear()
    .domain([globalMinY, globalMaxY])
    .range([singleHeight, 0]);

  // 清除现有图表并创建新的SVG容器
  d3.select("#chart-ensemble-stream").selectAll("*").remove();
  const svg = d3
    .select("#chart-ensemble-stream")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", totalHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 为每个类别创建一个子图
  categoriesToDraw.forEach((category, index) => {
    const yOffset = index * (singleHeight + gap);

    // 添加类别标题
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", yOffset - 10)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(`${category}`);

    // 创建该类别的canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = singleHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 处理每个病人的数据
    const patientCount = Object.keys(patientDataMap.value).length;
    const opacity = 1.0 / patientCount;

    Object.values(patientDataMap.value).forEach((patientData) => {
      const streamData = getStreamData(patientData as PatientData);
      const categorizedHerbs = categorizeHerbs(streamData, herbColor.value);
      const categoryHerbs = categorizedHerbs.get(category) || [];

      if (categoryHerbs.length === 0) return;

      // 为每个病人创建独立的x比例尺
      const x = d3
        .scaleLinear()
        .domain([0, streamData.length - 1])
        .range([0, width]);

      const stackData = streamData.map((visit, index) => {
        const visitData: Record<string, number> = { visit: index };
        categoryHerbs.forEach((herb) => {
          visitData[herb] = visit.scripts[herb]?.amount || 0;
        });
        return visitData;
      });

      const stack = d3
        .stack()
        .keys(categoryHerbs)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);

      const layers = stack(stackData);

      // 使用统一的y比例尺和病人特定的x比例尺绘制河流图
      layers.forEach((layer) => {
        const herb = layer.key as string;
        const color = herbColor.value[herb]?.book_color;
        if (!color) return;

        ctx.beginPath();
        const firstPoint = layer[0];
        ctx.moveTo(x(0), y(firstPoint[0]));

        layer.forEach((point, i) => {
          ctx.lineTo(x(i), y(point[1]));
        });

        for (let i = layer.length - 1; i >= 0; i--) {
          ctx.lineTo(x(i), y(layer[i][0]));
        }

        ctx.closePath();
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${opacity})`;
        ctx.fill();
      });
    });

    // 将canvas内容添加到SVG
    const image = new Image();
    image.onload = () => {
      svg
        .append("image")
        .attr("x", 0)
        .attr("y", yOffset)
        .attr("width", width)
        .attr("height", singleHeight)
        .attr("xlink:href", canvas.toDataURL());

      // 绘制y轴
      const axisScale = d3
        .scaleLinear()
        .domain([globalMinY, globalMaxY])
        .range([singleHeight, 0]);
      const axis = d3.axisLeft(axisScale).ticks(5);

      // 每个类别左侧绘制y轴
      if (index === 0) {
        svg
          .append("g")
          .attr("class", "y-axis")
          .attr("transform", `translate(0,${yOffset})`)
          .call(axis);
      } else {
        svg
          .append("g")
          .attr("class", "y-axis")
          .attr("transform", `translate(0,${yOffset})`)
          .call(axis)
          .selectAll("text")
          .style("display", "none");
      }
    };
    image.src = canvas.toDataURL();
  });
};

// 监听数据变化，重新绘制图表
watch(
  [isStaticDataLoaded, isPatientDataLoaded, selectedCategory],
  ([newStaticLoaded, newPatientLoaded]) => {
    if (newStaticLoaded && newPatientLoaded) {
      calculateStats();
      drawOverlayStream();
    }
  }
);

onMounted(async () => {
  try {
    await Promise.all([loadStaticData(), loadPatientData()]);
    calculateStats();
    // Set default category
    if (allCategories.value.length > 0) {
      selectedCategory.value = allCategories.value[0];
    }
    drawOverlayStream();
  } catch (error) {
    console.error("Error during data loading:", error);
  }
});
</script>

<style scoped>
.ensemble-container {
  padding: 20px;
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
  width: 100%;
}

.section-icon {
  margin-right: 8px;
}

#chart-ensemble-stream {
  width: 100%;
  min-height: 400px;
}

.el-table {
  margin-bottom: 20px;
  max-height: 400px; /* 添加固定高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
}

.category-selector {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.selector-label {
  margin-right: 10px;
  font-weight: bold;
}

.el-select {
  width: 200px;
}

.el-card {
  width: 100%;
  box-sizing: border-box;
}

</style>
