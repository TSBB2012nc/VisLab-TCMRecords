import * as d3 from 'd3';

/**
 * MapChart - 用药分布图可视化类
 * 负责处理所有与散点图相关的d3.js绘制逻辑
 */
export class MapChart {
  constructor(options = {}) {
    this.margin = options.margin || { top: 20, right: 30, bottom: 30, left: 30 };
    this.width = options.width || (window.innerWidth * 0.3);
    this.height = options.height || 500;
  }

  /**
   * 清除图表
   */
  clear() {
    d3.select("#symp-map").selectAll("*").remove();
    d3.select("#attr-map").selectAll("*").remove();
    d3.select("#legend").selectAll("*").remove();
  }

  /**
   * 获取填充颜色
   */
  fillColor(name, herbColorMap, type) {
    const color = herbColorMap[name];
    if (!color) return '#ccc';
    
    if (type === 0) {
      return color.book_color ? 
        `rgb(${color.book_color[0]},${color.book_color[1]},${color.book_color[2]})` : '#ccc';
    } else {
      return color.expert_color ? 
        `rgb(${color.expert_color[0]},${color.expert_color[1]},${color.expert_color[2]})` : '#ccc';
    }
  }

  /**
   * 绘制无数据占位符
   */
  drawNoDataPlaceholder(containerId, title) {
    const svg = d3.select(containerId)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    // 添加背景矩形
    svg.append("rect")
      .attr("x", this.margin.left)
      .attr("y", this.margin.top)
      .attr("width", this.width - this.margin.left - this.margin.right)
      .attr("height", this.height - this.margin.top - this.margin.bottom)
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
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#6c757d")
      .text(`暂无${title}数据`);

    // 添加副标题
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2 + 20)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .style("fill", "#adb5bd")
      .text("No data available");
  }

  /**
   * 绘制散点图
   */
  drawScatterPlot(data, containerId, herbColor) {
    if (!data || data.length === 0) {
      console.warn(`No valid data provided for ${containerId}`);
      // 根据容器ID确定标题
      const title = containerId.includes('symp') ? '症状分布' : '四气五味分布';
      this.drawNoDataPlaceholder(containerId, title);
      return;
    }

    const svg = d3.select(containerId)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    // 创建比例尺
    const xScaler = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([this.margin.left, this.width - this.margin.right])
      .nice();

    const yScaler = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([this.height - this.margin.bottom, this.margin.top])
      .nice();

    // 绘制散点图（圆形）
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScaler(d.x))
      .attr("cy", d => yScaler(d.y))
      .attr("r", 15)
      .attr("fill", d => this.fillColor(d.name, herbColor, 0))
      .attr("class", "base");

    // 绘制小正方形
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => xScaler(d.x) - 7)
      .attr("y", d => yScaler(d.y) - 7)
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", d => this.fillColor(d.name, herbColor, 1))
      .attr("class", "base");

    // 添加标签
    svg.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => xScaler(d.x))
      .attr("y", d => yScaler(d.y))
      .attr("dx", -30)
      .attr("dy", -10)
      .text(d => d.name)
      .attr("font-size", "12px")
      .attr("fill", "black");
  }

  /**
   * 绘制图例
   */
  drawLegend(height, herbColor, bookColor, expColor) {
    // 绘制左侧 bookColor 图例
    const bookSvg = d3.select(".legend:first-child")
      .append("svg")
      .attr("width", 100)
      .attr("height", height);

    const bookKeys = Object.values(herbColor)
      .map(color => color.book_category)
      .filter((value, index, self) => self.indexOf(value) === index);

    const bookLegend = bookSvg.selectAll(".bookLegend")
      .data(bookKeys)
      .enter()
      .append("g")
      .attr("class", "bookLegend")
      .attr("transform", (d, i) => `translate(10, ${i * 20 + 20})`);

    bookLegend.append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 5)
      .attr("fill", d => {
        const color = bookColor[d];
        return color ? `rgb(${color[0]},${color[1]},${color[2]})` : '#ccc';
      });

    bookLegend.append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text(d => d)
      .attr("font-size", "12px")
      .attr("fill", "black");

    // 绘制右侧 expColor 图例
    const expSvg = d3.select(".legend:last-child")
      .append("svg")
      .attr("width", 100)
      .attr("height", height);

    const expKeys = Object.values(herbColor)
      .map(color => color.expert_category)
      .filter((value, index, self) => self.indexOf(value) === index);

    const expLegend = expSvg.selectAll(".expLegend")
      .data(expKeys)
      .enter()
      .append("g")
      .attr("class", "expLegend")
      .attr("transform", (d, i) => `translate(10, ${i * 20 + 20})`);

    expLegend.append("rect")
      .attr("x", 0)
      .attr("y", 5)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => {
        const color = expColor[d];
        return color ? `rgb(${color[0]},${color[1]},${color[2]})` : '#ccc';
      });

    expLegend.append("text")
      .attr("x", 15)
      .attr("y", 15)
      .text(d => d)
      .attr("font-size", "12px")
      .attr("fill", "black");
  }

  /**
   * 绘制完整的地图视图
   */
  draw(sympLoc, attrLoc, herbSet, herbColor, bookColor, expColor) {
    this.clear();

    // 处理症状数据
    const sympData = sympLoc
      .filter(d => d.symp1 !== null && d.symp2 !== null && herbSet.includes(d.Name))
      .map(d => ({ name: d.Name, x: d.symp1, y: d.symp2 }));

    // 处理属性数据
    const attrData = attrLoc
      .filter(d => d.dim1 !== null && d.dim2 !== null && herbSet.includes(d.herb_name))
      .map(d => ({ name: d.herb_name, x: d.dim1, y: d.dim2 }));

    // 绘制散点图
    if (sympData.length > 0) {
      this.drawScatterPlot(sympData, "#symp-map", herbColor);
    } else {
      console.warn('No valid symptom data to display');
    }

    if (attrData.length > 0) {
      this.drawScatterPlot(attrData, "#attr-map", herbColor);
    } else {
      console.warn('No valid attribute data to display');
    }

    // 绘制图例
    this.drawLegend(this.height, herbColor, bookColor, expColor);
  }

  /**
   * 更新图表
   */
  update(sympLoc, attrLoc, herbSet, herbColor, bookColor, expColor) {
    this.draw(sympLoc, attrLoc, herbSet, herbColor, bookColor, expColor);
  }

  /**
   * 销毁图表
   */
  destroy() {
    this.clear();
  }
}
