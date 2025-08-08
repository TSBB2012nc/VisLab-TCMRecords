<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { MapChart } from '../utils/visualizations';

const props = defineProps({
    herbColor: {
        type: Object,
        default: {}
    },
    bookColor: {
        type: Object,
        default: {}
    },
    expColor: {
        type: Object,
        default: {}
    },
    herbSet: {
        type: Object,
        default: {}
    },
    symp_loc: {
        type: Array,
        default: () => []
    },
    attr_loc: {
        type: Array,
        default: () => []
    },
});

// 可视化实例
let mapChart = null;

// 初始化图表
const initChart = () => {
    if (!mapChart) {
        mapChart = new MapChart();
    }
};

// 更新图表
const updateChart = () => {
    if (mapChart && props.symp_loc && props.attr_loc && props.herbSet) {
        try {
            mapChart.update(
                props.symp_loc,
                props.attr_loc,
                props.herbSet,
                props.herbColor,
                props.bookColor,
                props.expColor
            );
        } catch (error) {
            console.error('Error updating map chart:', error);
        }
    }
};

// 监听数据变化
watch(() => [props.herbColor, props.bookColor, props.expColor, props.herbSet, props.symp_loc, props.attr_loc], () => {
    updateChart();
}, { deep: true });

// 生命周期钩子
onMounted(() => {
    initChart();
    updateChart();
});

onUnmounted(() => {
    if (mapChart) {
        mapChart.destroy();
        mapChart = null;
    }
});
</script>

<template>
    <div class="w-100 d-flex flex-row border-bottom align-items-center mb-2">
        <i class="fa-solid fa-chart-area"></i>
        <h5 class="ms-2">用药分布</h5>
    </div>
    <div class="container d-flex flex-row">
        <div class="legend">
            <p>教材分类</p>
        </div>
        <div class="card">
            <h5>症状</h5>
            <div id="symp-map" class="d-flex">
            </div>
        </div>
        <div class="card ms-5">
            <h5>四气五味</h5>
            <div id="attr-map" class="d-flex">
            </div>
        </div>
        <div class="legend">
            <p>专家分类</p>
        </div>
    </div>
</template>

<style scoped></style>