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
import * as d3 from 'd3';
import { defineProps, onMounted, toRaw, watch } from 'vue';

const props = defineProps({
   data: {
      type: Array,
      default: []
   }
});

const margin = { top: 20, right: 80, bottom: 80, left: 50 };
// 获取窗口高度和宽度
const width = 0.85 * window.innerWidth;
const height = 0.15 * window.innerHeight;


onMounted(() => {
   drawMetrics(props.data);
   // drawGroup1(data);
   // drawGroup2(data);
});

// Add watch for data changes
watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    drawMetrics(newData);
  }
}, { deep: true });

function clearLine() {
   d3.select("#chart-group1").selectAll("*").remove();
   d3.select("#chart-group2").selectAll("*").remove();
}

// 添加数据预处理函数
function preprocessData(rawData) {
   return rawData.map(d => ({
      ...d,
      metrics: {
         group1: {
            '肌酐': d.metrics['肌酐'],
            '蛋白量mg': d.metrics['蛋白量mg']
         }
      }
   }));
}

function drawMetrics(data) {
   if (!data || data.length === 0) return;
   clearLine();
   const processedData = preprocessData(data);
   drawGroup1(processedData);
}

function drawLine(svg, data, lineGenerator, className) {
   let currentSegment = [];
   let dashedIndices = [];
   // 第一次遍历：找出实线和虚线的分界点
   for (let i = 0; i < data.length; i++) {
      const currentPoint = data[i];
      if (currentPoint.y !== null) {
         currentSegment.push(currentPoint);
         if (i === data.length - 1 || data[i + 1].y === null) {
            const lineClass = className + (currentSegment.length === 1 ? " dashed" : "");
            svg.append("path")
               .datum(currentSegment)
               .attr("class", lineClass)
               .attr("d", lineGenerator);
            if (i < data.length - 1 && currentSegment.length > 0) {
               dashedIndices.push({ start: currentSegment[currentSegment.length - 1], endIndex: i + 1 });
            }
            currentSegment = [];
         }
      }
   }
   // 第二次遍历：绘制虚线
   dashedIndices.forEach(({ start, endIndex }) => {
      for (let j = endIndex; j < data.length; j++) {
         if (data[j].y !== null) {
            const dashedSegment = [start, data[j]];
            svg.append("path")
               .datum(dashedSegment)
               .attr("class", className + " dashed")
               .attr("d", lineGenerator);
            break;
         }
      }
   });
};

function hasValidData(data, key) {
   return data.some(d => d.metrics?.group1?.[key] !== null);
}

// Group1: 双y轴
function drawGroup1(data) {
   // 检查数据有效性
   if (!data[0]?.metrics?.group1) {
      console.warn('Invalid data format: metrics.group1 is missing');
      return;
   }

   const label = Object.keys(data[0].metrics.group1);
   if (label.length === 0) {
      console.warn('No metrics found in group1');
      return;
   }

   const currentData = data.map(d => {
      return {
         visit: d.visit_num,
         date: d.date,
         v0: d.metrics?.group1?.[label[0]] ?? null,
         v1: d.metrics?.group1?.[label[1]] ?? null
      }
   });

   // 检查是否所有数据都为null
   const hasAnyData = currentData.some(d => d.v0 !== null || d.v1 !== null);
   if (!hasAnyData) {
      console.warn('All data points are null');
      return;
   }

   // 画布
   const svg = d3.select("div#chart-group1")
      .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

   const x = d3.scaleBand()
      .domain(currentData.map(d => d.visit))
      .range([0, width])
      .padding(0.1);

   // Set default domain if all values are null
   const y0 = d3.scaleLinear()
      .domain([
         hasValidData(data, label[0]) ? d3.min(currentData.filter(d => d.v0 !== null), d => d.v0) || 0 : 0,
         hasValidData(data, label[0]) ? d3.max(currentData.filter(d => d.v0 !== null), d => d.v0) || 100 : 100
      ])
      .range([height, 0]);

   const y1 = d3.scaleLinear()
      .domain([
         hasValidData(data, label[1]) ? d3.min(currentData.filter(d => d.v1 !== null), d => d.v1) || 0 : 0,
         hasValidData(data, label[1]) ? d3.max(currentData.filter(d => d.v1 !== null), d => d.v1) || 100 : 100
      ])
      .range([height, 0]);

   const xAxis = d3.axisBottom(x).tickFormat(d => currentData.find(item => item.visit === d).date);
   const yAxisLeft = d3.axisLeft(y0);
   const yAxisRight = d3.axisRight(y1);
   // 添加坐标轴说明
   svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (0.5 * height))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(label[0]);
   svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right / 2)
      .attr("x", 0 - (0.5 * height))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(label[1]);

   // 坐标轴刻度
   svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-30)")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em");
   svg.append("g")
      .call(yAxisLeft);
   svg.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(yAxisRight);
   const lineV0 = d3.line()
      .x(d => x(d.x) + x.bandwidth() / 2)
      .y(d => y0(d.y));
   const lineV1 = d3.line()
      .x(d => x(d.x) + x.bandwidth() / 2)
      .y(d => y1(d.y));

   // Only draw lines if there is valid data
   if (hasValidData(data, label[0])) {
      drawLine(svg, currentData.map(d => ({ x: d.visit, y: d.v0 })), lineV0, "line-v0");
      svg.selectAll(".dot-v0")
         .data(currentData.filter(d => d.v0 !== null))
         .enter().append("circle")
         .attr("class", "dot-v0")
         .attr("cx", d => x(d.visit) + x.bandwidth() / 2)
         .attr("cy", d => y0(d.v0))
         .attr("r", 4);
   }

   if (label.length > 1 && hasValidData(data, label[1])) {
      drawLine(svg, currentData.map(d => ({ x: d.visit, y: d.v1 })), lineV1, "line-v1");
      svg.selectAll(".dot-v1")
         .data(currentData.filter(d => d.v1 !== null))
         .enter().append("circle")
         .attr("class", "dot-v1")
         .attr("cx", d => x(d.visit) + x.bandwidth() / 2)
         .attr("cy", d => y1(d.v1))
         .attr("r", 4);
   }
}

// Group2: 共用y轴刻度
function drawGroup2(data) {
   // 画布
   const svg = d3.select("div#chart-group2")
      .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
   const x = d3.scaleBand()
      .domain(data.map(d => d.visit))
      .range([0, width])
      .padding(0.1);
   const y0 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.SBP)])
      .range([height, 0]);

   const xAxis = d3.axisBottom(x).tickFormat(d => data.find(item => item.visit === d).date);
   const yAxisLeft = d3.axisLeft(y0);

   // 添加坐标轴说明
   svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (0.5 * height))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("血压 mmHg");


   svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
   svg.append("g")
      .call(yAxisLeft);

   const line = d3.line()
      .x(d => x(d.x) + x.bandwidth() / 2)
      .y(d => y0(d.y));

   drawLine(svg, data.map(d => ({ x: d.visit, y: d.SBP })), line, "line-v0");
   drawLine(svg, data.map(d => ({ x: d.visit, y: d.DBP })), line, "line-v1");

   svg.selectAll(".dot-v0")
      .data(data.filter(d => d.SBP !== null))
      .enter().append("circle")
      .attr("class", "dot-v0")
      .attr("cx", d => x(d.visit) + x.bandwidth() / 2)
      .attr("cy", d => y0(d.SBP))
      .attr("r", 4);
   svg.selectAll(".dot-v1")
      .data(data.filter(d => d.DBP !== null))
      .enter().append("circle")
      .attr("class", "dot-v1")
      .attr("cx", d => x(d.visit) + x.bandwidth() / 2)
      .attr("cy", d => y0(d.DBP))
      .attr("r", 4);
};

</script>

<style>
path.line-v0 {
   fill: none;
   stroke: steelblue;
   stroke-width: 2.5px;
}

path.line-v1 {
   fill: none;
   stroke: orange;
   stroke-width: 2.5px;
}

circle.dot-v0 {
   fill: steelblue;
}

circle.dot-v1 {
   fill: orange;
}

path.dashed {
   stroke: gray !important;
   stroke-width: 2.5px;
   stroke-dasharray: 5, 5;
}
</style>