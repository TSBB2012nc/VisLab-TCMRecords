<script setup>
import { computed, defineProps, onMounted, toRaw, watch } from 'vue';
import * as d3 from 'd3';
const props = defineProps({
    herbColor: {
        type: Object,
        default: {}
    },
    bookColor: {
        type: Object,
        default: {}
    },
    expColor: {
        type: Object,
        default: {}
    },
    herbSet: {
        type: Object,
        default: {}
    },
    symp_loc: {
        type: Array,
        default: () => []
    },
    attr_loc: {
        type: Array,
        default: () => []
    },
});


const margin = { top: 20, right: 30, bottom: 30, left: 30 };
const width = window.innerWidth * 0.3;
const height = 500;


onMounted(() => {
    cleanMap();
    const sympData = props.symp_loc
        .filter(d => d.symp1 !== null && d.symp2 !== null && props.herbSet.includes(d.Name))
        .map(d => ({ name: d.Name, x: d.symp1, y: d.symp2 }));
    const attrData = props.attr_loc
        .filter(d => d.dim1 !== null && d.dim2 !== null && props.herbSet.includes(d.herb_name))
        .map(d => ({ name: d.herb_name, x: d.dim1, y: d.dim2 }));
    // console.log(sympData, attrData);

    // Check if sympData is valid before drawing
    if (sympData.length > 0) {
        drawMap(sympData, "#symp-map", width, height, props);
    } else {
        console.warn('No valid symptom data to display');
    }

    // Check if attrData is valid before drawing
    if (attrData.length > 0) {
        drawMap(attrData, "#attr-map", width, height, props);
    } else {
        console.warn('No valid attribute data to display');
    }

    drawLegend(height, 150, props);
});

function fillColor(name, herbColorMap, type) {
    const color = herbColorMap[name];
    if (type === 0) {
        return 'rgb(' + color.book_color[0] + ',' + color.book_color[1] + ',' + color.book_color[2] + ')';
    } else {
        return 'rgb(' + color.expert_color[0] + ',' + color.expert_color[1] + ',' + color.expert_color[2] + ')';
    }
}

function cleanMap() {
    d3.select("#symp-map").selectAll("*").remove();
    d3.select("#attr-map").selectAll("*").remove();
    d3.select("#legend").selectAll("*").remove();
}

function drawMap(data, div, width, height, props) {
    const svg = d3.select(div)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // 创建scaler
    const xScaler = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([margin.left, width - margin.right]).nice();
    const yScaler = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([height - margin.bottom, margin.top]).nice();
    
    // 绘制散点图
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScaler(d.x))
        .attr("cy", d => yScaler(d.y))
        .attr("r", 15)
        .attr("fill", d => fillColor(d.name, props.herbColor, 0))
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
        .attr("fill", d => fillColor(d.name, props.herbColor, 1))
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
function drawLegend(height, herbCat) {
    // 绘制左侧 bookColor 图例
    const bookSvg = d3.select(".legend:first-child") // 选择第一个 legend 容器
        .append("svg")
        .attr("width", 100) // 限制宽度
        .attr("height", height);

    const bookKeys = Object.values(props.herbColor).map(color => color.book_category).filter((value, index, self) => self.indexOf(value) === index);
    const bookLegend = bookSvg.selectAll(".bookLegend")
        .data(bookKeys)
        .enter()
        .append("g")
        .attr("class", "bookLegend")
        .attr("transform", (d, i) => `translate(10, ${i * 20 + 20})`); // 左侧位置

    bookLegend.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 5)
        .attr("fill", d => {
            const color = props.bookColor[d];
            return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        });

    bookLegend.append("text")
        .attr("x", 25) // 调整文本位置
        .attr("y", 15)
        .text(d => d)
        .attr("font-size", "12px")
        .attr("fill", "black");

    // 绘制右侧 expColor 图例
    const expSvg = d3.select(".legend:last-child") // 选择最后一个 legend 容器
        .append("svg")
        .attr("width", 100) // 限制宽度
        .attr("height", height);

    const expKeys = Object.values(props.herbColor).map(color => color.expert_category).filter((value, index, self) => self.indexOf(value) === index);
    const expLegend = expSvg.selectAll(".expLegend")
        .data(expKeys)
        .enter()
        .append("g")
        .attr("class", "expLegend")
        .attr("transform", (d, i) => `translate(10, ${i * 20 + 20})`); // 右侧位置

    expLegend.append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => {
            const color = props.expColor[d];
            return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        })
    expLegend.append("text")
        .attr("x", 15) // 调整文本位置
        .attr("y", 15)
        .text(d => d)
        .attr("font-size", "12px")
        .attr("fill", "black");
}
</script>

<template>
    <div class="w-100 d-flex flex-row border-bottom align-items-center mb-2">
        <i class="fa-solid fa-chart-area"></i>
        <h5 class="ms-2">用药分布</h5>
    </div>
    <div class="container d-flex flex-row">
        <div class="legend">
            <p>教材分类</p>
        </div>
        <div class="card">
            <h5>症状</h5>
            <div id="symp-map" class="d-flex">
            </div>
        </div>
        <div class="card ms-5">
            <h5>四气五味</h5>
            <div id="attr-map" class="d-flex">
            </div>
        </div>
        <div class="legend">
            <p>专家分类</p>
        </div>
    </div>
</template>

<style scoped></style>