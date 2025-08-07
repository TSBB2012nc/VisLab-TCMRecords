<template>
  <div class="stream-graph">
    <svg ref="svgRef" :width="width" :height="height">
      <!-- Background Grid -->
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a3441" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect :width="width" :height="height" fill="url(#grid)"/>
      
      <!-- Stream layers -->
      <g v-for="(layer, index) in streamLayers" :key="index">
        <path 
          :d="layer.path" 
          :fill="layer.color" 
          :opacity="0.8"
          :stroke="layer.strokeColor"
          stroke-width="1"
        />
      </g>
      
      <!-- Axis lines -->
      <g class="axis">
        <!-- Y-axis -->
        <line :x1="40" :y1="20" :x2="40" :y2="height - 40" stroke="#4a5568" stroke-width="2"/>
        <!-- X-axis -->
        <line :x1="40" :y1="height - 40" :x2="width - 20" :y2="height - 40" stroke="#4a5568" stroke-width="2"/>
        
        <!-- Y-axis labels -->
        <g v-for="tick in yTicks" :key="tick.value">
          <line :x1="35" :y1="tick.y" :x2="40" :y2="tick.y" stroke="#4a5568" stroke-width="1"/>
          <text :x="30" :y="tick.y + 4" text-anchor="end" font-size="11" fill="#9aa0a6" font-family="Consolas">{{ tick.value }}</text>
        </g>
        
        <!-- X-axis labels -->
        <g v-for="tick in xTicks" :key="tick.value">
          <line :x1="tick.x" :y1="height - 40" :x2="tick.x" :y2="height - 35" stroke="#4a5568" stroke-width="1"/>
          <text :x="tick.x" :y="height - 22" text-anchor="middle" font-size="11" fill="#9aa0a6" font-family="Consolas">{{ tick.label }}</text>
        </g>
      </g>
      
      <!-- Legend -->
      <g class="legend" transform="translate(60, 25)">
        <rect :width="legendWidth" :height="30" fill="#1a1f2e" stroke="#3a4558" stroke-width="1" opacity="0.9"/>
        <g v-for="(layer, index) in streamLayers" :key="index" :transform="`translate(${10 + index * 80}, 15)`">
          <rect :width="10" :height="10" :fill="layer.color" :opacity="0.8"/>
          <text :x="15" :y="9" font-size="10" fill="#e8eaed" font-family="Consolas" font-weight="600">{{ layer.name }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const svgRef = ref(null);
const width = ref(500);
const height = ref(300);

// Mock data for stream graph
const streamData = ref([
  { name: 'Symptoms', values: [10, 15, 12, 18, 25, 30, 28, 32, 35, 30, 25, 20] },
  { name: 'Treatments', values: [5, 8, 10, 12, 15, 18, 20, 22, 18, 15, 12, 10] },
  { name: 'Recovery', values: [2, 3, 5, 8, 10, 12, 15, 18, 20, 25, 28, 30] }
]);

const colors = ['#4285f4', '#34a853', '#fbbc05'];
const legendWidth = 250;

// Generate stream layers
const streamLayers = computed(() => {
  const layers = [];
  const timePoints = 12;
  const chartWidth = width.value - 60;
  const chartHeight = height.value - 80;
  
  let cumulativeData = new Array(timePoints).fill(0);
  
  streamData.value.forEach((series, seriesIndex) => {
    const points = [];
    const bottomPoints = [];
    
    for (let i = 0; i < timePoints; i++) {
      const x = 40 + (i / (timePoints - 1)) * chartWidth;
      const bottomY = height.value - 40 - (cumulativeData[i] / 50) * chartHeight;
      cumulativeData[i] += series.values[i];
      const topY = height.value - 40 - (cumulativeData[i] / 50) * chartHeight;
      
      points.push([x, topY]);
      bottomPoints.unshift([x, bottomY]);
    }
    
    // Create path for the stream layer
    const pathData = [
      'M', points[0][0], points[0][1],
      ...points.slice(1).flatMap(p => ['L', p[0], p[1]]),
      ...bottomPoints.flatMap(p => ['L', p[0], p[1]]),
      'Z'
    ].join(' ');
    
    layers.push({
      name: series.name,
      path: pathData,
      color: colors[seriesIndex % colors.length],
      strokeColor: colors[seriesIndex % colors.length]
    });
  });
  
  return layers;
});

// Generate axis ticks
const yTicks = computed(() => {
  const ticks = [];
  for (let i = 0; i <= 5; i++) {
    const value = i * 10;
    const y = height.value - 40 - (value / 50) * (height.value - 80);
    ticks.push({ value, y });
  }
  return ticks;
});

const xTicks = computed(() => {
  const ticks = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 12; i += 2) {
    const x = 40 + (i / 11) * (width.value - 60);
    ticks.push({ value: i, x, label: months[i] });
  }
  return ticks;
});

onMounted(() => {
  // Adjust dimensions based on container
  const resizeObserver = new ResizeObserver(() => {
    if (svgRef.value?.parentElement) {
      width.value = Math.max(400, svgRef.value.parentElement.clientWidth - 40);
      height.value = Math.max(250, svgRef.value.parentElement.clientHeight - 100);
    }
  });
  
  if (svgRef.value?.parentElement) {
    resizeObserver.observe(svgRef.value.parentElement);
  }
});
</script>

<style scoped>
.stream-graph {
  width: 100%;
  height: 100%;
  background: #0a0e1a;
}

svg {
  background: transparent;
}
</style>
