<script setup>
import { onMounted, watch, onUnmounted, ref } from 'vue';
import { TrendCharts } from '@element-plus/icons-vue';
import { StreamChart } from '../utils/visualizations';

const props = defineProps({
    streamData: {
        type: Array,
        required: true
    },
    herbColor: {
        type: Object,
        required: true
    }
});

// 可视化实例
let streamChart = null;

// 初始化图表
const initChart = () => {
    if (!streamChart) {
        streamChart = new StreamChart('chart-stream');
    }
};

// 更新图表
const updateChart = () => {
    if (streamChart && props.streamData && Array.isArray(props.streamData) && props.streamData.length > 0) {
        try {
            streamChart.setCurrentData(props.streamData, props.herbColor);
            streamChart.update(props.streamData, props.herbColor);
        } catch (error) {
            console.error('Error updating stream chart:', error);
        }
    }
};

// 监听数据变化
watch(() => props.streamData, () => {
    updateChart();
}, { deep: true });

watch(() => props.herbColor, () => {
    updateChart();
}, { deep: true });

// 生命周期钩子
onMounted(() => {
    initChart();
    updateChart();
});

onUnmounted(() => {
    if (streamChart) {
        streamChart.destroy();
        streamChart = null;
    }
});
</script>

<template>
    <div class="w-100 d-flex flex-column">
        <div class="section-title">
            <el-icon class="section-icon"><TrendCharts /></el-icon>
            <span>用药河流图</span>
        </div>
        <div id="chart-stream"></div>
    </div>
</template>

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
</style>