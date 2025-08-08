<template>
   <div class="section-title">
      <el-icon class="section-icon">
         <TrendCharts />
      </el-icon>
      <span>生理指标</span>
   </div>
   <!-- 测量值 -->
   <div id="chart-group1" class=""></div>

   <!-- 血压 -->
   <div id="chart-group2" class="mt-5"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { TrendCharts } from '@element-plus/icons-vue';
import { LineChart } from '../utils/visualizations';

const props = defineProps({
   data: {
      type: Array,
      default: []
   }
});

// 可视化实例
let lineChartGroup1 = null;
let lineChartGroup2 = null;

// 初始化图表
const initCharts = () => {
    if (!lineChartGroup1) {
        lineChartGroup1 = new LineChart('chart-group1');
    }
    if (!lineChartGroup2) {
        lineChartGroup2 = new LineChart('chart-group2');
    }
};

// 更新图表
const updateCharts = () => {
    if (props.data && props.data.length > 0) {
        if (lineChartGroup1) {
            lineChartGroup1.update(props.data);
        }
        // 如果需要Group2图表，可以在这里添加
        // if (lineChartGroup2) {
        //     lineChartGroup2.update(props.data);
        // }
    }
};

// 监听数据变化
watch(() => props.data, () => {
    updateCharts();
}, { deep: true });

// 生命周期钩子
onMounted(() => {
    initCharts();
    updateCharts();
});

onUnmounted(() => {
    if (lineChartGroup1) {
        lineChartGroup1.destroy();
        lineChartGroup1 = null;
    }
    if (lineChartGroup2) {
        lineChartGroup2.destroy();
        lineChartGroup2 = null;
    }
});
</script>

<style scoped>
.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    font-weight: bold;
}

.section-icon {
    margin-right: 0.5rem;
}

/* 将全局样式移到这里 */
:deep(path.line-v0) {
   fill: none;
   stroke: steelblue;
   stroke-width: 2.5px;
}

:deep(path.line-v1) {
   fill: none;
   stroke: orange;
   stroke-width: 2.5px;
}

:deep(circle.dot-v0) {
   fill: steelblue;
}

:deep(circle.dot-v1) {
   fill: orange;
}

:deep(path.dashed) {
   stroke: gray !important;
   stroke-width: 2.5px;
   stroke-dasharray: 5, 5;
}
</style>