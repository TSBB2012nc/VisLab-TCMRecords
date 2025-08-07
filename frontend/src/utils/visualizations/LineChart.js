import * as d3 from 'd3';

/**
 * LineChart - 生理指标折线图可视化类
 * 负责处理所有与折线图相关的d3.js绘制逻辑
 */
export class LineChart {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.margin = options.margin || { top: 20, right: 80, bottom: 80, left: 50 };
    this.width = options.width || (0.85 * window.innerWidth);
    this.height = options.height || (0.15 * window.innerHeight);
  }

  /**
   * 清除图表
   */
  clear() {
    d3.select(`#${this.containerId}`).selectAll("*").remove();
  }

  /**
   * 数据预处理函数
   */
  preprocessData(rawData) {
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

  /**
   * 绘制无数据占位符
   */
  drawNoDataPlaceholder(svg, containerId) {
    // 添加背景矩形
    svg.append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "#f8f9fa")
      .attr("stroke", "#dee2e6")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    // 添加"无数据"文本
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#6c757d")
      .text("暂无生理指标数据");

    // 添加副标题
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2 + 25)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#adb5bd")
      .text("No physiological data available");
  }

  /**
   * 检查是否有有效数据
   */
  hasValidData(data, key) {
    return data.some(d => d.metrics?.group1?.[key] !== null);
  }

  /**
   * 绘制线条（包括虚线处理）
   */
  drawLine(svg, data, lineGenerator, className) {
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
  }

  /**
   * 绘制双Y轴折线图（Group1）
   */
  drawGroup1(containerId, data) {
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
    
    // 创建SVG
    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // 如果没有任何数据，显示"无数据"占位符
    if (!hasAnyData) {
      console.warn('All data points are null - showing no data placeholder');
      this.drawNoDataPlaceholder(svg, containerId);
      return;
    }

    // 创建比例尺
    const x = d3.scaleBand()
      .domain(currentData.map(d => d.visit))
      .range([0, this.width])
      .padding(0.1);

    const y0 = d3.scaleLinear()
      .domain([
        this.hasValidData(data, label[0]) ? d3.min(currentData.filter(d => d.v0 !== null), d => d.v0) || 0 : 0,
        this.hasValidData(data, label[0]) ? d3.max(currentData.filter(d => d.v0 !== null), d => d.v0) || 100 : 100
      ])
      .range([this.height, 0]);

    const y1 = d3.scaleLinear()
      .domain([
        this.hasValidData(data, label[1]) ? d3.min(currentData.filter(d => d.v1 !== null), d => d.v1) || 0 : 0,
        this.hasValidData(data, label[1]) ? d3.max(currentData.filter(d => d.v1 !== null), d => d.v1) || 100 : 100
      ])
      .range([this.height, 0]);

    // 创建坐标轴
    const xAxis = d3.axisBottom(x).tickFormat(d => currentData.find(item => item.visit === d).date);
    const yAxisLeft = d3.axisLeft(y0);
    const yAxisRight = d3.axisRight(y1);

    // 添加坐标轴说明
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - (0.5 * this.height))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(label[0]);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", this.width + this.margin.right / 2)
      .attr("x", 0 - (0.5 * this.height))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(label[1]);

    // 绘制坐标轴
    svg.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-30)")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em");

    svg.append("g").call(yAxisLeft);
    svg.append("g")
      .attr("transform", `translate(${this.width},0)`)
      .call(yAxisRight);

    // 创建线条生成器
    const lineV0 = d3.line()
      .x(d => x(d.x) + x.bandwidth() / 2)
      .y(d => y0(d.y));

    const lineV1 = d3.line()
      .x(d => x(d.x) + x.bandwidth() / 2)
      .y(d => y1(d.y));

    // 绘制线条和点
    if (this.hasValidData(data, label[0])) {
      this.drawLine(svg, currentData.map(d => ({ x: d.visit, y: d.v0 })), lineV0, "line-v0");
      svg.selectAll(".dot-v0")
        .data(currentData.filter(d => d.v0 !== null))
        .enter().append("circle")
        .attr("class", "dot-v0")
        .attr("cx", d => x(d.visit) + x.bandwidth() / 2)
        .attr("cy", d => y0(d.v0))
        .attr("r", 4);
    }

    if (label.length > 1 && this.hasValidData(data, label[1])) {
      this.drawLine(svg, currentData.map(d => ({ x: d.visit, y: d.v1 })), lineV1, "line-v1");
      svg.selectAll(".dot-v1")
        .data(currentData.filter(d => d.v1 !== null))
        .enter().append("circle")
        .attr("class", "dot-v1")
        .attr("cx", d => x(d.visit) + x.bandwidth() / 2)
        .attr("cy", d => y1(d.v1))
        .attr("r", 4);
    }
  }

  /**
   * 绘制共用Y轴的折线图（Group2）
   */
  drawGroup2(containerId, data) {
    // 创建SVG
    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // 创建比例尺
    const x = d3.scaleBand()
      .domain(data.map(d => d.visit))
      .range([0, this.width])
      .padding(0.1);

    const y0 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.SBP)])
      .range([this.height, 0]);

    const xAxis = d3.axisBottom(x).tickFormat(d => data.find(item => item.visit === d).date);
    const yAxisLeft = d3.axisLeft(y0);

    // 添加坐标轴说明
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - (0.5 * this.height))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("血压 mmHg");

    svg.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(xAxis);
    svg.append("g")
      .call(yAxisLeft);

    const line = d3.line()
      .x(d => x(d.x) + x.bandwidth() / 2)
      .y(d => y0(d.y));

    this.drawLine(svg, data.map(d => ({ x: d.visit, y: d.SBP })), line, "line-v0");
    this.drawLine(svg, data.map(d => ({ x: d.visit, y: d.DBP })), line, "line-v1");

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
  }

  /**
   * 绘制指标图表
   */
  drawMetrics(data) {
    this.clear();
    
    if (!data || data.length === 0) {
      // 如果没有数据，显示占位符
      const svg = d3.select('#chart-group1')
        .append('svg')
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
      
      this.drawNoDataPlaceholder(svg, 'chart-group1');
      return;
    }
    
    const processedData = this.preprocessData(data);
    this.drawGroup1('chart-group1', processedData);
  }

  /**
   * 更新图表
   */
  update(data) {
    if (data && data.length > 0) {
      this.drawMetrics(data);
    }
  }

  /**
   * 销毁图表
   */
  destroy() {
    this.clear();
  }
}
