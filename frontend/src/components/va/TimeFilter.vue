<template>
  <div class="time-filter">
    <div class="filter-header">
      <span class="filter-label">TIME RANGE:</span>
      <span class="time-display">{{ formatTime(modelValue[0]) }} → {{ formatTime(modelValue[1]) }}</span>
    </div>
    <div class="slider-container">
      <svg ref="sliderSvg" :width="width" :height="50">
        <!-- Background track -->
        <rect :x="margin" :y="20" :width="width - 2 * margin" :height="6" 
              fill="#252b3d" stroke="#3a4558" stroke-width="1"/>
        
        <!-- Active range -->
        <rect :x="getPosition(modelValue[0])" :y="20" 
              :width="getPosition(modelValue[1]) - getPosition(modelValue[0])" 
              :height="6" fill="#4285f4" stroke="#4285f4"/>
        
        <!-- Left handle -->
        <rect :x="getPosition(modelValue[0]) - 4" :y="16" :width="8" :height="14" 
              fill="#4285f4" stroke="#e8eaed" stroke-width="1" 
              class="handle" @mousedown="startDrag('start', $event)"/>
        
        <!-- Right handle -->
        <rect :x="getPosition(modelValue[1]) - 4" :y="16" :width="8" :height="14" 
              fill="#4285f4" stroke="#e8eaed" stroke-width="1" 
              class="handle" @mousedown="startDrag('end', $event)"/>
        
        <!-- Scale ticks -->
        <g v-for="tick in ticks" :key="tick.value">
          <line :x1="tick.position" :y1="30" :x2="tick.position" :y2="35" 
                stroke="#9aa0a6" stroke-width="1"/>
          <text :x="tick.position" :y="45" text-anchor="middle" 
                font-size="9" fill="#9aa0a6" font-family="Consolas">{{ tick.label }}</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [0, 100]
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  }
});

const emit = defineEmits(['update:modelValue', 'timechange']);

const sliderSvg = ref(null);
const width = ref(400);
const margin = 20;
const isDragging = ref(false);
const dragType = ref(null);

// Generate ticks for the time scale
const ticks = computed(() => {
  const tickCount = 10;
  const step = (props.max - props.min) / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, i) => {
    const value = props.min + i * step;
    return {
      value,
      position: getPosition(value),
      label: Math.round(value).toString()
    };
  });
});

const getPosition = (value) => {
  const ratio = (value - props.min) / (props.max - props.min);
  return margin + ratio * (width.value - 2 * margin);
};

const getValue = (position) => {
  const ratio = (position - margin) / (width.value - 2 * margin);
  return Math.max(props.min, Math.min(props.max, props.min + ratio * (props.max - props.min)));
};

const formatTime = (value) => {
  return `T${Math.round(value)}`;
};

const startDrag = (type, event) => {
  isDragging.value = true;
  dragType.value = type;
  event.preventDefault();
  
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
};

const handleDrag = (event) => {
  if (!isDragging.value || !sliderSvg.value) return;
  
  const rect = sliderSvg.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const newValue = getValue(x);
  
  let newRange = [...props.modelValue];
  
  if (dragType.value === 'start') {
    newRange[0] = Math.min(newValue, newRange[1] - 1);
  } else {
    newRange[1] = Math.max(newValue, newRange[0] + 1);
  }
  
  emit('update:modelValue', newRange);
  emit('timechange', newRange);
};

const stopDrag = () => {
  isDragging.value = false;
  dragType.value = null;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
};

onMounted(() => {
  // Adjust width based on container
  const resizeObserver = new ResizeObserver(() => {
    if (sliderSvg.value?.parentElement) {
      width.value = Math.max(300, sliderSvg.value.parentElement.clientWidth - 40);
    }
  });
  
  if (sliderSvg.value?.parentElement) {
    resizeObserver.observe(sliderSvg.value.parentElement);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.time-filter {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: #1a1f2e;
  border: 1px solid #3a4558;
  padding: 10px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.filter-label {
  font-weight: 700;
  color: #9aa0a6;
  font-size: 10px;
  letter-spacing: 1px;
  font-family: 'Consolas', monospace;
}

.time-display {
  font-family: 'Consolas', monospace;
  color: #4285f4;
  font-weight: 600;
  font-size: 11px;
}

.slider-container {
  width: 100%;
}

.handle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.handle:hover {
  fill: #5a9bff;
}

svg {
  overflow: visible;
}
</style>
