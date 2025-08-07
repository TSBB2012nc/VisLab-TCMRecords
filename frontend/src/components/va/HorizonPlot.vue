<template>
  <div class="horizon-plot">
    <svg ref="svgRef" :width="width" :height="height">
      <!-- Background -->
      <rect :width="width" :height="height" fill="#0a0e1a"/>
      
      <!-- Horizon bands -->
      <g v-for="(band, index) in horizonBands" :key="index">
        <g :transform="`translate(0, ${index * bandHeight})`">
          <!-- Band background -->
          <rect :width="width" :height="bandHeight" fill="#252b3d" stroke="#3a4558" stroke-width="0.5"/>
          
          <!-- Band label -->
          <text :x="10" :y="bandHeight / 2 + 4" font-size="11" fill="#e8eaed" font-weight="600" font-family="Consolas">
            {{ band.name }}
          </text>
          
          <!-- Horizon layers -->
          <g v-for="(layer, layerIndex) in band.layers" :key="layerIndex">
            <path 
              :d="layer.path" 
              :fill="layer.color" 
              :opacity="layer.opacity"
              :clip-path="`url(#clip-${index}-${layerIndex})`"
            />
          </g>
          
          <!-- Clip paths for each layer -->
          <defs>
            <clipPath v-for="(layer, layerIndex) in band.layers" :key="layerIndex" :id="`clip-${index}-${layerIndex}`">
              <rect :x="labelWidth" :y="layer.clipY" :width="width - labelWidth - 10" :height="layer.clipHeight"/>
            </clipPath>
          </defs>
          
          <!-- Center line -->
          <line :x1="labelWidth" :y1="bandHeight / 2" :x2="width - 10" :y2="bandHeight / 2" 
                stroke="#9aa0a6" stroke-width="0.5" opacity="0.5"/>
        </g>
      </g>
      
      <!-- X-axis -->
      <g class="x-axis" :transform="`translate(0, ${height - 30})`">
        <line :x1="labelWidth" :y1="0" :x2="width - 10" :y2="0" stroke="#4a5568" stroke-width="2"/>
        <g v-for="tick in xTicks" :key="tick.value">
          <line :x1="tick.x" :y1="0" :x2="tick.x" :y2="5" stroke="#4a5568" stroke-width="1"/>
          <text :x="tick.x" :y="18" text-anchor="middle" font-size="10" fill="#9aa0a6" font-family="Consolas">{{ tick.label }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const svgRef = ref(null);
const width = ref(400);
const height = ref(300);
const labelWidth = 80;
const bandHeight = 60;

// Mock data for horizon plot
const mockData = ref([
  {
    name: 'Heart Rate',
    values: [72, 75, 78, 82, 85, 88, 85, 82, 79, 76, 73, 70, 68, 72, 75, 78, 80, 77, 74, 71]
  },
  {
    name: 'Temperature',
    values: [36.5, 36.7, 36.8, 37.1, 37.3, 37.2, 37.0, 36.9, 36.8, 36.6, 36.5, 36.4, 36.6, 36.8, 37.0, 36.9, 36.7, 36.6, 36.5, 36.4]
  },
  {
    name: 'Blood Pressure',
    values: [120, 122, 125, 128, 130, 132, 129, 126, 123, 121, 119, 117, 120, 123, 126, 124, 122, 120, 118, 116]
  },
  {
    name: 'Symptoms',
    values: [2, 3, 4, 6, 8, 7, 5, 4, 3, 2, 1, 2, 3, 5, 6, 5, 4, 3, 2, 1]
  }
]);

const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];

// Generate horizon bands
const horizonBands = computed(() => {
  const bands = [];
  const chartWidth = width.value - labelWidth - 10;
  const timePoints = 20;
  
  mockData.value.forEach((series, seriesIndex) => {
    const normalizedValues = normalizeData(series.values);
    const layers = generateHorizonLayers(normalizedValues, chartWidth, timePoints, colors[seriesIndex]);
    
    bands.push({
      name: series.name,
      layers: layers
    });
  });
  
  return bands;
});

const normalizeData = (values) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map(v => (v - min) / (max - min) * 2 - 1); // Normalize to [-1, 1]
};

const generateHorizonLayers = (values, chartWidth, timePoints, baseColor) => {
  const layers = [];
  const numBands = 3;
  
  for (let band = 1; band <= numBands; band++) {
    const threshold = band / numBands;
    
    // Positive layer
    const posPath = generateLayerPath(values, chartWidth, timePoints, threshold, 'positive');
    if (posPath) {
      layers.push({
        path: posPath,
        color: baseColor,
        opacity: 0.6 + (band - 1) * 0.2,
        clipY: 0,
        clipHeight: bandHeight / 2
      });
    }
    
    // Negative layer (mirrored)
    const negPath = generateLayerPath(values, chartWidth, timePoints, threshold, 'negative');
    if (negPath) {
      layers.push({
        path: negPath,
        color: '#d62728',
        opacity: 0.6 + (band - 1) * 0.2,
        clipY: bandHeight / 2,
        clipHeight: bandHeight / 2
      });
    }
  }
  
  return layers;
};

const generateLayerPath = (values, chartWidth, timePoints, threshold, type) => {
  const points = [];
  const baseY = bandHeight / 2;
  
  for (let i = 0; i < timePoints; i++) {
    const x = labelWidth + (i / (timePoints - 1)) * chartWidth;
    let value = values[i];
    
    if (type === 'positive') {
      value = Math.max(0, Math.min(value, threshold)) / threshold;
      const y = baseY - (value * bandHeight / 2);
      points.push([x, y]);
    } else {
      value = Math.max(0, Math.min(-value, threshold)) / threshold;
      const y = baseY + (value * bandHeight / 2);
      points.push([x, y]);
    }
  }
  
  if (points.length === 0) return null;
  
  // Create path
  const pathData = [
    'M', points[0][0], baseY,
    ...points.flatMap(p => ['L', p[0], p[1]]),
    'L', points[points.length - 1][0], baseY,
    'Z'
  ].join(' ');
  
  return pathData;
};

// X-axis ticks
const xTicks = computed(() => {
  const ticks = [];
  const chartWidth = width.value - labelWidth - 10;
  for (let i = 0; i <= 4; i++) {
    const x = labelWidth + (i / 4) * chartWidth;
    ticks.push({
      value: i,
      x: x,
      label: `T${i * 5}`
    });
  }
  return ticks;
});

onMounted(() => {
  // Adjust dimensions based on container
  const resizeObserver = new ResizeObserver(() => {
    if (svgRef.value?.parentElement) {
      width.value = Math.max(300, svgRef.value.parentElement.clientWidth - 20);
      height.value = Math.max(250, mockData.value.length * bandHeight + 50);
    }
  });
  
  if (svgRef.value?.parentElement) {
    resizeObserver.observe(svgRef.value.parentElement);
  }
});
</script>

<style scoped>
.horizon-plot {
  width: 100%;
  height: 100%;
  background: #0a0e1a;
  overflow-y: auto;
}

svg {
  background: transparent;
}
</style>
