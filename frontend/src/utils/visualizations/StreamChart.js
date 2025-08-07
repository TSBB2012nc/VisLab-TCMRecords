import * as d3 from 'd3';

/**
 * StreamChart - 用药河流图可视化类
 * 负责处理所有与河流图相关的d3.js绘制逻辑
 */
export class StreamChart {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.margin = options.margin || { top: 20, right: 80, bottom: 60, left: 50 };
    this.width = options.width || (0.85 * window.innerWidth - this.margin.left - this.margin.right);
    this.height = options.height || (0.5 * window.innerHeight - this.margin.top - this.margin.bottom);
    
    // 绑定resize事件
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * 数据预处理 - 将原始数据转换为河流图需要的格式
   */
  processData(rawData) {
    const herbDataMap = {};
    
    rawData.forEach(record => {
      const visitNum = record.visit_num;
      const scripts = record.scripts;
      const date = record.date;
      
      if (!herbDataMap[visitNum]) {
        herbDataMap[visitNum] = {
          date: date,
          herbs: {}
        };
      }
      
      if (scripts && typeof scripts === 'object') {
        Object.keys(scripts).forEach(herb => {
          herbDataMap[visitNum].herbs[herb] = scripts[herb].amount || 0;
        });
      }
    });
    
    const allHerbs = new Set();
    Object.values(herbDataMap).forEach(visit => {
      Object.keys(visit.herbs).forEach(herb => allHerbs.add(herb));
    });
    
    const processedData = Object.keys(herbDataMap).map(visit => {
      const visitData = { 
        visit: parseInt(visit),
        date: herbDataMap[visit].date
      };
      allHerbs.forEach(herb => {
        visitData[herb] = herbDataMap[visit].herbs[herb] || 0;
      });
      return visitData;
    });
    
    return processedData;
  }

  /**
   * 清除图表
   */
  clear() {
    d3.select(`#${this.containerId}`).selectAll("*").remove();
  }

  /**
   * 根据分类对中药进行排序
   */
  sortHerbsByCategory(herbs, colormap) {
    return herbs.sort((a, b) => {
      const catA = colormap[a]?.book_category || '';
      const catB = colormap[b]?.book_category || '';
      if (catA === catB) return a.localeCompare(b);
      return catA.localeCompare(catB);
    });
  }

  /**
   * 计算标签位置
   */
  calculateLabelPositions(layers, x, y) {
    return layers.map(layer => {
      if (!layer || !layer.length) return null;
      
      const maxIndex = d3.maxIndex(layer, d => {
        if (!d || !d.data) return 0;
        return Math.abs(d[1] - d[0]);
      });
      
      if (maxIndex === undefined || !layer[maxIndex] || !layer[maxIndex].data) return null;
      
      return {
        key: layer.key,
        x: x(layer[maxIndex].data.visit),
        y: (y(layer[maxIndex][0]) + y(layer[maxIndex][1])) / 2
      };
    }).filter(pos => pos !== null);
  }

  /**
   * 绘制无数据占位符
   */
  drawNoDataPlaceholder() {
    const svg = d3.select(`#${this.containerId}`)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

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
      .text("暂无用药数据");

    // 添加副标题
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2 + 25)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#adb5bd")
      .text("No medication data available");
  }

  /**
   * 添加标签
   */
  addLabels(svg, positions) {
    if (!positions || positions.length === 0) return;
    
    svg.selectAll(".label")
      .data(positions)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("dy", ".35em")
      .style("font-size", "10px")
      .style("fill", "#000")
      .style("pointer-events", "none")
      .text(d => d.key);
  }

  /**
   * 绘制河流图
   */
  draw(data, colormap) {
    this.clear();
    
    // 数据验证
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No valid data provided for stream chart');
      this.drawNoDataPlaceholder();
      return;
    }
    
    const validData = data.filter(d => d && typeof d === 'object');
    if (validData.length === 0) {
      console.warn('No valid data points found for stream chart');
      this.drawNoDataPlaceholder();
      return;
    }

    // 创建SVG
    const svg = d3.select(`#${this.containerId}`)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // 过滤并排序中药
    const keys = Object.keys(validData[0]).filter(d => d !== 'visit' && d !== 'date');
    if (keys.length === 0) {
      console.warn('No herb data found in stream data');
      this.drawNoDataPlaceholder();
      return;
    }
    
    const sortedKeys = this.sortHerbsByCategory(keys, colormap);

    // 创建堆叠生成器
    const stack = d3.stack()
      .keys(sortedKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetSilhouette);

    const layers = stack(validData);

    // 创建比例尺
    const x = d3.scaleLinear()
      .domain(d3.extent(validData, d => d.visit))
      .range([0, this.width]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(layers, layer => d3.min(layer, d => d[0])),
        d3.max(layers, layer => d3.max(layer, d => d[1]))
      ])
      .range([this.height, 0]);

    // 创建区域生成器
    const area = d3.area()
      .curve(d3.curveBasis)
      .x(d => x(d.data.visit))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    // 绘制层级
    svg.selectAll(".layer")
      .data(layers)
      .enter()
      .append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", d => {
        const color = colormap[d.key]?.book_color;
        return color ? `rgb(${color[0]},${color[1]},${color[2]})` : '#ccc';
      })
      .style("opacity", 0.8)
      .style("stroke", "none")
      .style("stroke-width", "1px")
      .on("mouseover", function() {
        d3.select(this)
          .style("opacity", 1)
          .style("stroke", "black");
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("opacity", 0.8)
          .style("stroke", "none");
      })
      .append("title")
      .text(d => `${d.key} (${colormap[d.key]?.book_category || '未分类'})`);

    // 添加x轴
    svg.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(x)
        .ticks(validData.length)
        .tickFormat(d => {
          const record = validData.find(r => r.visit === d);
          return record ? record.date : '';
        }))
      .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // 添加标签
    const labelPositions = this.calculateLabelPositions(layers, x, y);
    this.addLabels(svg, labelPositions);
  }

  /**
   * 更新图表
   */
  update(rawData, colormap) {
    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
      try {
        const processedData = this.processData(rawData);
        if (processedData && processedData.length > 0) {
          this.draw(processedData, colormap);
        }
      } catch (error) {
        console.error('Error updating stream chart:', error);
      }
    }
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    this.width = 0.85 * window.innerWidth - this.margin.left - this.margin.right;
    this.height = 0.5 * window.innerHeight - this.margin.top - this.margin.bottom;
    
    // 如果有当前数据，重新绘制
    if (this.currentData && this.currentColormap) {
      this.update(this.currentData, this.currentColormap);
    }
  }

  /**
   * 销毁图表并清理事件监听器
   */
  destroy() {
    this.clear();
    window.removeEventListener('resize', this.handleResize);
  }

  /**
   * 设置当前数据（用于resize时重绘）
   */
  setCurrentData(data, colormap) {
    this.currentData = data;
    this.currentColormap = colormap;
  }
}
