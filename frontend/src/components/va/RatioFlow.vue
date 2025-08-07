<template>
  <div class="ratio-flow">
    <svg ref="svgRef" :width="width" :height="height">
      <!-- Background -->
      <rect :width="width" :height="height" fill="#0a0e1a"/>
      
      <!-- Chart area background -->
      <rect :x="margin" :y="margin" :width="chartWidth" :height="chartHeight" 
            fill="#252b3d" stroke="#3a4558" stroke-width="1"/>
      
      <!-- Grid lines -->
      <g class="grid" opacity="0.3">
        <g v-for="line in gridLines" :key="line.y">
          <line :x1="margin" :y1="line.y" :x2="margin + chartWidth" :y2="line.y" 
                stroke="#4a5568" stroke-width="0.5"/>
          <text :x="margin - 10" :y="line.y + 4" text-anchor="end" font-size="9" fill="#9aa0a6" font-family="Consolas">
            {{ line.label }}
          </text>
        </g>
      </g>
      
      <!-- Flow lines -->
      <g class="flow-lines">
        <g v-for="(line, index) in flowLines" :key="index">
          <path 
            :d="line.path" 
            :stroke="line.color" 
            stroke-width="3" 
            fill="none" 
            opacity="0.8"
          />
          <!-- Data points -->
          <g v-for="(point, pointIndex) in line.points" :key="pointIndex">
            <circle 
              :cx="point.x" 
              :cy="point.y" 
              :r="4" 
              :fill="line.color" 
              stroke="white" 
              stroke-width="2"
              @mouseover="showTooltip(point, line.name, $event)"
              @mouseout="hideTooltip"
            />
          </g>
        </g>
      </g>
      
      <!-- Axes -->
      <g class="axes">
        <!-- Y-axis -->
        <line :x1="margin" :y1="margin" :x2="margin" :y2="margin + chartHeight" 
              stroke="#4a5568" stroke-width="2"/>
        <!-- X-axis -->
        <line :x1="margin" :y1="margin + chartHeight" :x2="margin + chartWidth" :y2="margin + chartHeight" 
              stroke="#4a5568" stroke-width="2"/>
        
        <!-- X-axis ticks and labels -->
        <g v-for="tick in xTicks" :key="tick.value">
          <line :x1="tick.x" :y1="margin + chartHeight" :x2="tick.x" :y2="margin + chartHeight + 5" 
                stroke="#4a5568" stroke-width="1"/>
          <text :x="tick.x" :y="margin + chartHeight + 18" text-anchor="middle" font-size="10" fill="#9aa0a6" font-family="Consolas">
            {{ tick.label }}
          </text>
        </g>
        
        <!-- Axis labels -->
        <text :x="margin + chartWidth / 2" :y="height - 5" text-anchor="middle" 
              font-size="11" fill="#e8eaed" font-weight="600" font-family="Consolas">
          TIME PERIOD
        </text>
        <text :x="15" :y="margin + chartHeight / 2" text-anchor="middle" 
              font-size="11" fill="#e8eaed" font-weight="600" font-family="Consolas"
              :transform="`rotate(-90, 15, ${margin + chartHeight / 2})`">
          PATIENT RATIO (%)
        </text>
      </g>
      
      <!-- Legend -->
      <g class="legend" :transform="`translate(${margin + 20}, ${margin + 20})`">
        <rect :width="legendWidth" :height="legendHeight" fill="#1a1f2e" stroke="#3a4558" 
              stroke-width="1" opacity="0.95"/>
        <g v-for="(item, index) in legendItems" :key="index" 
           :transform="`translate(10, ${20 + index * 22})`">
          <line :x1="0" :y1="0" :x2="16" :y2="0" :stroke="item.color" stroke-width="2"/>
          <circle :cx="8" :cy="0" :r="3" :fill="item.color"/>
          <text :x="24" :y="4" font-size="10" fill="#e8eaed" font-family="Consolas" font-weight="500">{{ item.name }}</text>
        </g>
      </g>
    </svg>
    
    <!-- Tooltip -->
    <div v-if="tooltip.visible" class="tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-content">
        <div><strong>{{ tooltip.series }}</strong></div>
        <div>Time: {{ tooltip.time }}</div>
        <div>Ratio: {{ tooltip.value }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const svgRef = ref(null);
const width = ref(500);
const height = ref(350);
const margin = 60;

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  series: '',
  time: '',
  value: ''
});

// Computed properties for chart dimensions
const chartWidth = computed(() => width.value - 2 * margin);
const chartHeight = computed(() => height.value - 2 * margin - 30);

// Mock data for patient ratios
const mockData = ref([
  {
    name: 'Recovered',
    color: '#34a853',
    values: [15, 18, 22, 28, 35, 42, 48, 55, 62, 68, 72, 75]
  },
  {
    name: 'Improving',
    color: '#fbbc05',
    values: [25, 28, 30, 32, 30, 28, 25, 22, 20, 18, 16, 15]
  },
  {
    name: 'Stable',
    color: '#4285f4',
    values: [45, 42, 38, 32, 28, 25, 22, 18, 15, 12, 10, 8]
  },
  {
    name: 'Deteriorating',
    color: '#ea4335',
    values: [15, 12, 10, 8, 7, 5, 5, 5, 3, 2, 2, 2]
  }
]);

// Generate flow lines
const flowLines = computed(() => {
  const lines = [];
  const timePoints = 12;
  
  mockData.value.forEach(series => {
    const points = [];
    
    for (let i = 0; i < timePoints; i++) {
      const x = margin + (i / (timePoints - 1)) * chartWidth.value;
      const y = margin + chartHeight.value - (series.values[i] / 100) * chartHeight.value;
      points.push({ 
        x, 
        y, 
        value: series.values[i],
        time: `Month ${i + 1}`
      });
    }
    
    // Create smooth path
    const pathData = createSmoothPath(points);
    
    lines.push({
      name: series.name,
      color: series.color,
      path: pathData,
      points: points
    });
  });
  
  return lines;
});

// Create smooth curved path
const createSmoothPath = (points) => {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    if (i === 1) {
      // First curve
      const cp1x = prev.x + (curr.x - prev.x) * 0.3;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) * 0.3;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    } else {
      // Subsequent curves
      const prevPrev = points[i - 2];
      const cp1x = prev.x + (curr.x - prevPrev.x) * 0.15;
      const cp1y = prev.y + (curr.y - prevPrev.y) * 0.15;
      const cp2x = curr.x - (i < points.length - 1 ? points[i + 1].x - prev.x : curr.x - prev.x) * 0.15;
      const cp2y = curr.y - (i < points.length - 1 ? points[i + 1].y - prev.y : curr.y - prev.y) * 0.15;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
  }
  
  return path;
};

// Grid lines
const gridLines = computed(() => {
  const lines = [];
  for (let i = 0; i <= 5; i++) {
    const value = i * 20;
    const y = margin + chartHeight.value - (value / 100) * chartHeight.value;
    lines.push({
      y: y,
      label: `${value}%`
    });
  }
  return lines;
});

// X-axis ticks
const xTicks = computed(() => {
  const ticks = [];
  for (let i = 0; i < 12; i += 2) {
    const x = margin + (i / 11) * chartWidth.value;
    ticks.push({
      value: i,
      x: x,
      label: `M${i + 1}`
    });
  }
  return ticks;
});

// Legend
const legendItems = computed(() => mockData.value);
const legendWidth = 160;
const legendHeight = computed(() => 20 + mockData.value.length * 25);

const showTooltip = (point, seriesName, event) => {
  tooltip.value = {
    visible: true,
    x: event.pageX + 10,
    y: event.pageY - 10,
    series: seriesName,
    time: point.time,
    value: point.value
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    if (svgRef.value?.parentElement) {
      width.value = Math.max(400, svgRef.value.parentElement.clientWidth - 20);
      height.value = Math.max(300, svgRef.value.parentElement.clientHeight - 20);
    }
  });
  
  if (svgRef.value?.parentElement) {
    resizeObserver.observe(svgRef.value.parentElement);
  }
});
</script>

<style scoped>
.ratio-flow {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

svg {
  border-radius: 4px;
}

.flow-lines circle {
  cursor: pointer;
  transition: r 0.2s ease;
}

.flow-lines circle:hover {
  r: 6;
}

.tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.axes text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.legend text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 500;
}
</style>
