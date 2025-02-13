<script setup>
import { defineProps, onMounted, toRaw } from 'vue';
const stream_data = defineProps({
    herbCnt: {
        type: Object,
        default: {}
    }
});
const margin = { top: 20, right: 80, bottom: 30, left: 50 };
// 获取窗口高度和宽度
const width = 0.85 * window.innerWidth;
const height = 0.15 * window.innerHeight;

onMounted(() => {
    

});

function drawStream(data) {
    // 画布
    const svg = d3.select("#chart-stream")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
}

</script>
<template>
    <div id="chart-stream"></div>
</template>