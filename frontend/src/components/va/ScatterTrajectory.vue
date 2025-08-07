<template>
  <div class="scatter-trajectory">
    <svg ref="svgRef" :width="width" :height="height">
      <!-- Background -->
      <rect :width="width" :height="height" fill="#0a0e1a"/>
      
      <!-- Grid lines -->
      <defs>
        <pattern id="scatter-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a3441" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect :x="margin" :y="margin" :width="chartWidth" :height="chartHeight" fill="url(#scatter-grid)"/>
      
      <!-- Trajectory paths -->
      <g class="trajectories">
        <g v-for="(trajectory, index) in trajectories" :key="index">
          <path 
            :d="trajectory.path" 
            :stroke="trajectory.color" 
            stroke-width="2" 
            fill="none" 
            opacity="0.6"
          />
          <!-- Arrow at the end -->
          <polygon 
            :points="trajectory.arrow" 
            :fill="trajectory.color" 
            opacity="0.8"
          />
        </g>
      </g>
      
      <!-- Scatter points -->
      <g class="scatter-points">
        <g v-for="(point, index) in scatterPoints" :key="index">
          <circle 
            :cx="point.x" 
            :cy="point.y" 
            :r="point.size" 
            :fill="point.color" 
            :stroke="point.strokeColor"
            :stroke-width="point.strokeWidth"
            :opacity="point.opacity"
            @mouseover="showTooltip(point, $event)"
            @mouseout="hideTooltip"
          />
        </g>
      </g>
      
      <!-- Axes -->
      <g class="axes">
        <!-- Y-axis -->
        <line :x1="margin" :y1="margin" :x2="margin" :y2="height - margin" stroke="#4a5568" stroke-width="2"/>
        <!-- X-axis -->
        <line :x1="margin" :y1="height - margin" :x2="width - margin" :y2="height - margin" stroke="#4a5568" stroke-width="2"/>
        
        <!-- Y-axis ticks and labels -->
        <g v-for="tick in yTicks" :key="tick.value">
          <line :x1="margin - 5" :y1="tick.y" :x2="margin" :y2="tick.y" stroke="#4a5568" stroke-width="1"/>
          <text :x="margin - 10" :y="tick.y + 4" text-anchor="end" font-size="10" fill="#9aa0a6" font-family="Consolas">{{ tick.label }}</text>
        </g>
        
        <!-- X-axis ticks and labels -->
        <g v-for="tick in xTicks" :key="tick.value">
          <line :x1="tick.x" :y1="height - margin" :x2="tick.x" :y2="height - margin + 5" stroke="#4a5568" stroke-width="1"/>
          <text :x="tick.x" :y="height - margin + 18" text-anchor="middle" font-size="10" fill="#9aa0a6" font-family="Consolas">{{ tick.label }}</text>
        </g>
        
        <!-- Axis labels -->
        <text :x="width / 2" :y="height - 5" text-anchor="middle" font-size="11" fill="#e8eaed" font-weight="600" font-family="Consolas">
          TREATMENT EFFECTIVENESS
        </text>
        <text :x="15" :y="height / 2" text-anchor="middle" font-size="11" fill="#e8eaed" font-weight="600" font-family="Consolas"
              transform="rotate(-90, 15, ${height / 2})">
          RECOVERY RATE
        </text>
      </g>
    </svg>
    
    <!-- Tooltip -->
    <div v-if="tooltip.visible" class="tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-content">
        <div><strong>Patient {{ tooltip.data.patientId }}</strong></div>
        <div>Treatment: {{ tooltip.data.treatment }}</div>
        <div>Recovery: {{ tooltip.data.recovery }}%</div>
        <div>Time: {{ tooltip.data.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  timeRange: {
    type: Array,
    default: () => [0, 100]
  }
});

const svgRef = ref(null);
const width = ref(500);
const height = ref(400);
const margin = 50;

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  data: {}
});

// Generate mock trajectory data
const generateTrajectoryData = () => {
  const trajectories = [];
  const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#9c27b0'];
  
  for (let i = 0; i < 5; i++) {
    const points = [];
    let x = Math.random() * 0.3 + 0.1; // Start from low effectiveness
    let y = Math.random() * 0.3 + 0.1; // Start from low recovery
    
    // Generate trajectory with some randomness
    for (let j = 0; j < 8; j++) {
      x += (Math.random() - 0.3) * 0.15 + 0.08; // Generally increasing
      y += (Math.random() - 0.3) * 0.15 + 0.08; // Generally increasing
      x = Math.max(0.05, Math.min(0.95, x));
      y = Math.max(0.05, Math.min(0.95, y));
      points.push([x, y]);
    }
    
    trajectories.push({
      id: i,
      points: points,
      color: colors[i % colors.length]
    });
  }
  
  return trajectories;
};

const rawTrajectories = ref(generateTrajectoryData());

// Convert to SVG coordinates and create paths
const trajectories = computed(() => {
  const chartWidth = width.value - 2 * margin;
  const chartHeight = height.value - 2 * margin;
  
  return rawTrajectories.value.map(traj => {
    const svgPoints = traj.points.map(([x, y]) => [
      margin + x * chartWidth,
      height.value - margin - y * chartHeight
    ]);
    
    // Create path
    const pathData = svgPoints.length > 0 ? [
      'M', svgPoints[0][0], svgPoints[0][1],
      ...svgPoints.slice(1).flatMap(p => ['L', p[0], p[1]])
    ].join(' ') : '';
    
    // Create arrow at the end
    const lastPoint = svgPoints[svgPoints.length - 1];
    const secondLastPoint = svgPoints[svgPoints.length - 2];
    const angle = Math.atan2(lastPoint[1] - secondLastPoint[1], lastPoint[0] - secondLastPoint[0]);
    const arrowSize = 8;
    const arrow = [
      lastPoint[0], lastPoint[1],
      lastPoint[0] - arrowSize * Math.cos(angle - Math.PI / 6), lastPoint[1] - arrowSize * Math.sin(angle - Math.PI / 6),
      lastPoint[0] - arrowSize * Math.cos(angle + Math.PI / 6), lastPoint[1] - arrowSize * Math.sin(angle + Math.PI / 6)
    ].join(',');
    
    return {
      path: pathData,
      color: traj.color,
      arrow: arrow
    };
  });
});

// Generate scatter points
const scatterPoints = computed(() => {
  const points = [];
  const chartWidth = width.value - 2 * margin;
  const chartHeight = height.value - 2 * margin;
  const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#9c27b0'];
  
  rawTrajectories.value.forEach((traj, trajIndex) => {
    traj.points.forEach((point, pointIndex) => {
      const [x, y] = point;
      const isFiltered = pointIndex * 12.5 >= props.timeRange[0] && pointIndex * 12.5 <= props.timeRange[1];
      
      points.push({
        x: margin + x * chartWidth,
        y: height.value - margin - y * chartHeight,
        size: isFiltered ? 6 : 3,
        color: colors[trajIndex % colors.length],
        strokeColor: isFiltered ? '#fff' : 'transparent',
        strokeWidth: isFiltered ? 2 : 0,
        opacity: isFiltered ? 1 : 0.3,
        patientId: `P${trajIndex + 1}`,
        treatment: Math.round(x * 100),
        recovery: Math.round(y * 100),
        time: `T${pointIndex * 12.5}`
      });
    });
  });
  
  return points;
});

// Grid lines
const gridLines = computed(() => {
  const chartWidth = width.value - 2 * margin;
  const chartHeight = height.value - 2 * margin;
  
  const horizontal = [];
  const vertical = [];
  
  for (let i = 1; i < 5; i++) {
    horizontal.push(margin + (i / 5) * chartHeight);
    vertical.push(margin + (i / 5) * chartWidth);
  }
  
  return { horizontal, vertical };
});

// Axis ticks
const xTicks = computed(() => {
  const ticks = [];
  const chartWidth = width.value - 2 * margin;
  for (let i = 0; i <= 5; i++) {
    const x = margin + (i / 5) * chartWidth;
    ticks.push({
      value: i,
      x: x,
      label: `${i * 20}%`
    });
  }
  return ticks;
});

const yTicks = computed(() => {
  const ticks = [];
  const chartHeight = height.value - 2 * margin;
  for (let i = 0; i <= 5; i++) {
    const y = height.value - margin - (i / 5) * chartHeight;
    ticks.push({
      value: i,
      y: y,
      label: `${i * 20}%`
    });
  }
  return ticks;
});

const showTooltip = (point, event) => {
  tooltip.value = {
    visible: true,
    x: event.pageX + 10,
    y: event.pageY - 10,
    data: point
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
.scatter-trajectory {
  width: 100%;
  height: 100%;
  position: relative;
  background: #0a0e1a;
}

svg {
  background: transparent;
}

.scatter-points circle {
  cursor: pointer;
  transition: r 0.2s ease;
}

.scatter-points circle:hover {
  r: 8;
}

.tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
}

.tooltip-content {
  background: rgba(26, 31, 46, 0.95);
  color: #e8eaed;
  padding: 8px 12px;
  border: 1px solid #3a4558;
  font-size: 11px;
  white-space: nowrap;
  font-family: 'Consolas', monospace;
}
</style>
