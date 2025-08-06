<script setup>
import { defineProps, onMounted, watch, ref } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
    streamData: {
        type: Array,
        required: true
    },
    herbColor: {
        type: Object,
        required: true
    }
});

// Transform data for stream graph
const processData = (rawData) => {
    const herbDataMap = {};
    
    rawData.forEach(record => {
        const visitNum = record.visit_num;
        const scripts = record.scripts;
        const date = record.date;  // 添加日期信息
        
        if (!herbDataMap[visitNum]) {
            herbDataMap[visitNum] = {
                date: date,  // 存储日期
                herbs: {}
            };
        }
        
        Object.keys(scripts).forEach(herb => {
            herbDataMap[visitNum].herbs[herb] = scripts[herb].amount || 0;
        });
    });
    
    const allHerbs = new Set();
    Object.values(herbDataMap).forEach(visit => {
        Object.keys(visit.herbs).forEach(herb => allHerbs.add(herb));
    });
    
    const processedData = Object.keys(herbDataMap).map(visit => {
        const visitData = { 
            visit: parseInt(visit),
            date: herbDataMap[visit].date  // 添加日期到输出数据
        };
        allHerbs.forEach(herb => {
            visitData[herb] = herbDataMap[visit].herbs[herb] || 0;
        });
        return visitData;
    });
    
    return processedData;
};

const margin = { top: 20, right: 80, bottom: 60, left: 50 };
const width = ref(0.85 * window.innerWidth - margin.left - margin.right);
const height = ref(0.5 * window.innerHeight - margin.top - margin.bottom);

const clearStream = () => {
    d3.select("#chart-stream").selectAll("*").remove();
};

const sortHerbsByCategory = (herbs, colormap) => {
    return herbs.sort((a, b) => {
        const catA = colormap[a]?.book_category || '';
        const catB = colormap[b]?.book_category || '';
        if (catA === catB) return a.localeCompare(b);
        return catA.localeCompare(catB);
    });
};

const drawStream = (data, colormap) => {
    clearStream();
    
    const svg = d3.select("#chart-stream")
        .append("svg")
        .attr("width", width.value + margin.left + margin.right)
        .attr("height", height.value + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 过滤掉非药物属性
    const keys = Object.keys(data[0]).filter(d => d !== 'visit' && d !== 'date');
    const sortedKeys = sortHerbsByCategory(keys, colormap);

    // Create stack generator with sorted keys
    const stack = d3.stack()
        .keys(sortedKeys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);

    const layers = stack(data);

    // Create scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.visit))
        .range([0, width.value]);

    const y = d3.scaleLinear()
        .domain([
            d3.min(layers, layer => d3.min(layer, d => d[0])),
            d3.max(layers, layer => d3.max(layer, d => d[1]))
        ])
        .range([height.value, 0]);

    // Create area generator
    const area = d3.area()
        .curve(d3.curveBasis)
        .x(d => x(d.data.visit))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    // Draw layers with book_color
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
        .style("stroke", "none")  // 默认无描边
        .style("stroke-width", "1px")
        .on("mouseover", function() {  // 添加鼠标悬浮效果
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black");
        })
        .on("mouseout", function() {  // 鼠标移出效果
            d3.select(this)
                .style("opacity", 0.8)
                .style("stroke", "none");
        })
        .append("title")  // Add tooltip showing category
        .text(d => `${d.key} (${colormap[d.key]?.book_category || '未分类'})`);

    // 修改x轴位置和格式
    svg.append("g")
        .attr("transform", `translate(0,${height.value})`)
        .call(d3.axisBottom(x)
            .ticks(data.length)
            .tickFormat(d => {
                const record = data.find(r => r.visit === d);
                return record ? record.date : '';
            }))
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");  // 旋转文本

    // Add labels
    const labelPositions = calculateLabelPositions(layers, x, y);
    addLabels(svg, labelPositions, colormap);
};

const calculateLabelPositions = (layers, x, y) => {
    return layers.map(layer => {
        // 添加安全检查
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
    }).filter(pos => pos !== null); // 过滤掉无效的位置
};

const addLabels = (svg, positions, colormap) => {
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
        .style("fill", "#000")  // 统一改为黑色
        .text(d => d.key);
};

// Watch for data changes
watch(() => props.streamData, (newData) => {
    if (newData && newData.length > 0) {
        const processedData = processData(newData);
        drawStream(processedData, props.herbColor);
    }
}, { deep: true });

// Initial render
onMounted(() => {
    if (props.streamData && props.streamData.length > 0) {
        const processedData = processData(props.streamData);
        drawStream(processedData, props.herbColor);
    }
});

// Window resize handling
window.addEventListener('resize', () => {
    width.value = 0.85 * window.innerWidth - margin.left - margin.right;
    height.value = 0.5 * window.innerHeight - margin.top - margin.bottom;
    if (props.streamData && props.streamData.length > 0) {
        const processedData = processData(props.streamData);
        drawStream(processedData, props.herbColor);
    }
});
</script>

<template>
    <div class="w-100 d-flex flex-column">
        <div class="section-title">
            <el-icon class="section-icon"><TrendCharts /></el-icon>
            <span>用药河流图</span>
        </div>
        <div id="chart-stream"></div>
    </div>
</template>

<style scoped>



.label {
    pointer-events: none;
}
</style>