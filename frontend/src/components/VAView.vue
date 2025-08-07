<template>
  <div class="va-system">
    <!-- Top Header Bar -->
    <div class="header-bar">
      <div class="system-title">
        <div class="title-main">Visual Analytics System</div>
        <div class="title-sub">TCM Records Analysis Platform</div>
      </div>
      <div class="header-controls">
        <button class="ctrl-btn" @click="resetView">Reset</button>
        <button class="ctrl-btn" @click="exportData">Export</button>
        <router-link to="/" class="ctrl-btn back-btn">← Back</router-link>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="content-area">
      <!-- Left Panel - Patient Analysis -->
      <div class="left-panel">
        <div class="panel-header">
          <div class="header-title">PATIENT ANALYSIS</div>
          <div class="header-indicator"></div>
        </div>
        <div class="panel-content">
          <div class="analysis-placeholder">
            <div class="placeholder-grid">
              <div class="grid-item" v-for="i in 12" :key="i"></div>
            </div>
            <div class="placeholder-text">
              Patient Visual Analysis Module
              <br><span class="sub-text">Individual patient trajectory visualization</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Visualization Grid -->
      <div class="main-grid">
        <!-- Top Row -->
        <div class="grid-row">
          <!-- Stream Graph -->
          <div class="viz-panel">
            <div class="panel-header">
              <div class="header-title">TEMPORAL STREAM ANALYSIS</div>
              <div class="header-controls">
                <span class="status-indicator active"></span>
                <span class="control-label">ACTIVE</span>
              </div>
            </div>
            <div class="panel-content">
              <StreamGraph />
              <TimeFilter @timechange="handleTimeChange" />
            </div>
          </div>

          <!-- Horizon Plot -->
          <div class="viz-panel">
            <div class="panel-header">
              <div class="header-title">HORIZON DECOMPOSITION</div>
              <div class="header-controls">
                <span class="status-indicator active"></span>
                <span class="control-label">LINKED</span>
              </div>
            </div>
            <div class="panel-content">
              <HorizonPlot />
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="grid-row">
          <!-- Scatter Trajectory -->
          <div class="viz-panel">
            <div class="panel-header">
              <div class="header-title">TRAJECTORY SPACE</div>
              <div class="header-controls">
                <span class="status-indicator active"></span>
                <span class="control-label">FILTERED</span>
              </div>
            </div>
            <div class="panel-content">
              <ScatterTrajectory :timeRange="selectedTimeRange" />
            </div>
          </div>

          <!-- Ratio Flow -->
          <div class="viz-panel">
            <div class="panel-header">
              <div class="header-title">PATIENT RATIO FLOW</div>
              <div class="header-controls">
                <span class="status-indicator active"></span>
                <span class="control-label">REAL-TIME</span>
              </div>
            </div>
            <div class="panel-content">
              <RatioFlow />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-section">
        <span class="status-label">DATA:</span>
        <span class="status-value">2,847 records</span>
      </div>
      <div class="status-section">
        <span class="status-label">FILTER:</span>
        <span class="status-value">{{ selectedTimeRange[0] }}-{{ selectedTimeRange[1] }}</span>
      </div>
      <div class="status-section">
        <span class="status-label">LAST UPDATE:</span>
        <span class="status-value">{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import StreamGraph from './va/StreamGraph.vue';
import TimeFilter from './va/TimeFilter.vue';
import HorizonPlot from './va/HorizonPlot.vue';
import ScatterTrajectory from './va/ScatterTrajectory.vue';
import RatioFlow from './va/RatioFlow.vue';

const selectedTimeRange = ref([0, 100]);
const currentTime = ref('');

const handleTimeChange = (timeRange) => {
  selectedTimeRange.value = timeRange;
};

const resetView = () => {
  selectedTimeRange.value = [0, 100];
};

const exportData = () => {
  console.log('Exporting data...');
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString();
};

onMounted(() => {
  updateTime();
  const interval = setInterval(updateTime, 1000);
  
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
/* System-wide variables */
:root {
  --bg-primary: #0a0e1a;
  --bg-secondary: #1a1f2e;
  --bg-panel: #252b3d;
  --border-color: #3a4558;
  --text-primary: #e8eaed;
  --text-secondary: #9aa0a6;
  --accent-blue: #4285f4;
  --accent-green: #34a853;
  --accent-orange: #fbbc05;
  --accent-red: #ea4335;
}

.va-system {
  width: 100vw;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header Bar */
.header-bar {
  height: 60px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.system-title {
  display: flex;
  flex-direction: column;
}

.title-main {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
}

.title-sub {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.ctrl-btn {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.ctrl-btn:hover {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
  color: white;
}

.back-btn {
  background: var(--bg-primary);
}

/* Main Content */
.content-area {
  flex: 1;
  display: flex;
  min-height: 0;
}

.left-panel {
  width: 300px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.main-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.grid-row {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* Panel Styling */
.viz-panel {
  flex: 1;
  background: var(--bg-panel);
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.viz-panel:last-child {
  border-right: none;
}

.grid-row:last-child .viz-panel {
  border-bottom: none;
}

.panel-header {
  height: 40px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
}

.header-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--text-secondary);
}

.header-indicator {
  width: 8px;
  height: 8px;
  background: var(--accent-green);
  margin-left: 10px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-green);
}

.status-indicator.active {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.control-label {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
}

.panel-content {
  flex: 1;
  background: var(--bg-primary);
  min-height: 0;
  position: relative;
}

/* Left Panel Specific */
.analysis-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.placeholder-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 30px;
}

.grid-item {
  width: 20px;
  height: 20px;
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
}

.placeholder-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.sub-text {
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.7;
}

/* Status Bar */
.status-bar {
  height: 30px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 30px;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
}

.status-value {
  font-size: 10px;
  color: var(--text-primary);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .left-panel {
    width: 250px;
  }
}

@media (max-width: 1200px) {
  .main-grid {
    flex-direction: column;
  }
  
  .grid-row {
    flex-direction: column;
    height: 50%;
  }
  
  .left-panel {
    width: 200px;
  }
}
</style>
