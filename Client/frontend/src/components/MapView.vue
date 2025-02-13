<script setup>
import { defineProps, onMounted, toRaw, watch } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
    herbColor: {
        type: Object,
        default: () => ({})
    },
    bookColor: {
        type: Object,
        default: () => ({})
    },
    expColor: {
        type: Object,
        default: () => ({})
    },
    herbCnt: {
        type: Object,
        default: () => ({})
    }
});

const allPropsLoaded = () => {
    return Object.values(props).every(obj => Object.keys(toRaw(obj)).length > 0);
};

const margin = { top: 20, right: 80, bottom: 30, left: 50 };
const width = 600;
const height = 600;


onMounted(async () => {
    // 读取数据
    const sympLoc = await d3.json("symp_loc.json");
    const attrLoc = await d3.json("attr_loc.json");



    const unwatch = watch(() => allPropsLoaded(), (isLoaded) => {
        if (isLoaded) {
            // selected herbs
            const herbsSelected = new Set(Object.keys(props.herbCnt));
            const sympdata = sympLoc
                .filter(d => d.symp1 !== null && d.symp2 !== null && herbsSelected.has(d.Name))
                .map(d => ({ name: d.Name, x: d.symp1, y: d.symp2 }));
            const attrdata = attrLoc
                .filter(d => d.attr1 !== null && d.attr2 !== null && herbsSelected.has(d.Name))
                .map(d => ({ name: d.Name, x: d.sqww1, y: d.sqww2 }));
            drawLegend(height, props);
            drawMap(sympdata, "#symp-map", width, height, props);
            drawMap(attrdata, "#attr-map", width, height, props);
            unwatch(); // 停止监听
        }
    }, { immediate: true });
});


function fillColor(herb, colorMap, seletion) {
    if (herb in colorMap) {
        // 返回rgb字符串
        let r, g, b;
        if (seletion == 0) {
            [r, g, b] = colorMap[herb];
        } else if (seletion == 1) {
            [r, g, b] = colorMap[herb].Color1;
        } else {
            [r, g, b] = colorMap[herb].Color2;
        }
        return `rgb(${r}, ${g}, ${b})`
    } else {
        return "";
    }
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
        .attr("fill", d => fillColor(d.name, props.herbColor, 1))
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
        .attr("fill", d => fillColor(d.name, props.herbColor, 2))
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
function drawLegend(height, props) {
    const svg = d3.select("#legend")
        .append("svg")
        .attr("width", 100)
        .attr("height", height);

    // 根据expColor绘制纵向排列的图例，正方形
    const expKeys = Object.keys(props.expColor);
    const expLegend = svg.selectAll(".expLegend")
        .data(expKeys)
        .enter()
        .append("g")
        .attr("class", "expLegend")
        .attr("transform", (d, i) => `translate(0,${height - (i + 1) * 20})`);

    expLegend.append("rect")
        .attr("x", 5)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => fillColor(d, props.expColor, 0));

    expLegend.append("text")
        .attr("x", 20)
        .attr("y", 15)
        .text(d => d)
        .attr("font-size", "12px")
        .attr("fill", "black");

    // 根据bookColor绘制纵向排列的图例，圆点
    const bookKeys = Object.keys(props.bookColor);
    const bookLegend = svg.selectAll(".bookLegend")
        .data(bookKeys)
        .enter()
        .append("g")
        .attr("class", "bookLegend")
        .attr("transform", (d, i) => `translate(0,${height - (expKeys.length + i + 1) * 20 - 40})`);

    bookLegend.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 5)
        .attr("fill", d => fillColor(d, props.bookColor, 0));

    bookLegend.append("text")
        .attr("x", 20)
        .attr("y", 15)
        .text(d => d)
        .attr("font-size", "12px")
        .attr("fill", "black");
}
</script>

<template>
    <div class="container d-flex flex-row">
        <div id="legend"></div>
        <div id="symp-map" class="card">
            <p class="card-title">症状</p>
        </div>
        <div id="attr-map" class="card ms-5">
            <p class="card-title">四气五味</p>
        </div>
    </div>
</template>

<style scoped>

</style>