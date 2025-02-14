<script setup>
import { defineProps, onMounted, toRaw } from 'vue';
import * as d3 from 'd3';
import { fillColor } from '../utils/color.js';

const stream_data = defineProps({
    herbCnt: {
        type: Object,
        default: {}
    },
    herbColor: {
        type: Object,
        default: {}
    }
});
const margin = { top: 20, right: 80, bottom: 30, left: 50 };
// 获取窗口高度和宽度
const width = 0.85 * window.innerWidth;
const height = 0.5 * window.innerHeight;

onMounted(() => {
    drawStream(stream_data.herbCnt, stream_data.herbColor);

});

function drawStream(data, colormap) {

    // 画布
    const svg = d3.select("#chart-stream")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // get herbs: keys - visit
    const keys = Object.keys(data[0]).slice(1);
    const totalVisits = data.length;
    var stackGen = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette)
    var layers = stackGen(data);
    var gStreamGraphLayers = layers;

    var x = d3.scaleLinear().domain(d3.extent(data, d => d.visit)).range([0, width]);

    var y = d3.scaleLinear().domain([0.5*height, -0.5*height]).range([height, 0]);


    var layernode = svg.selectAll(".layer")
        .data(layers)
        .enter();

    // find the thickest region of each layer
    var maxYloc = [];
    for (var l = 0; l < layers.length; l++) {
        var thisLayer = layers[l];
        var loc = { x: [], h: -Infinity, y0: [], y1: [] };
        var hlist = [];

        for (var t = 0; t < thisLayer.length; t++) {
            var hh = Math.abs(thisLayer[t][1] - thisLayer[t][0]);
            hlist.push(hh);
            if (hh >= loc.h) {
                loc.h = hh;

            }
        }

        // Find x pos that has equal height of loc.h
        for (var t = 0; t < thisLayer.length; t++) {
            if (hlist[t] >= loc.h) {
                loc.x.push(t);
                loc.y0.push(thisLayer[t][0]);
                loc.y1.push(thisLayer[t][1]);
            }
        }
        loc.hStd = d3.deviation(hlist);
        loc.hMed = d3.median(hlist);
        loc.key = thisLayer.key;
        maxYloc.push(loc);
    }

    var layerTextCol = [];
    layernode.append("path")
        .attr("class", "layer")
        .attr("d", d3.area()
            .curve(d3.curveBasis)
            .x(function (d, _i) { return x(d.data.visit); })
            .y0(function (d, _i) {
                return y(d[0]);
            })
            .y1(function (d, _i) {
                return y(d[1]);
            })
        )
        .style("fill", d => fillColor(d.key, colormap, 2));
    ;

    var textLoc = [];
    var delta = 1;
    for (var ii = 0; ii < maxYloc.length; ii++) {
        var randX = 0;
        var locInfo = maxYloc[ii];
        var xBest = 0;
        var yBest = 0;
        if (locInfo.hMed + delta < locInfo.h) {
            var randInd = Math.round(Math.random() * (locInfo.x.length - 1));
            var randMaxX = locInfo.x[randInd];
            xBest = x(randMaxX) + Math.random() * 5;
            yBest = 0.5 * (y(locInfo.y0[randInd]) + y(locInfo.y1[randInd]));// + Math.random() * 5;
        }
        else {
            randX = Math.random() * (width - 20);
            xBest = randX;
            var rvisit = randX / (width - 1) * totalVisits;
            yBest = 0.5 * (y(layers[ii][Math.round(rvisit)][0]) + y(layers[ii][Math.round(rvisit)][1]));
            // return randX;
        }
        textLoc.push({ x: xBest, y: yBest });
    }

    // Draw text!
    var textnode = svg.selectAll("text").data(textLoc)
        .enter()
        .append("text")
        .text(function (_d, i) { return layers[i].key; })
        .style("font-size", "11px")
        .style("fill", function (_d, i) { return layerTextCol[i]; })
        .attr("x", function (d) {
            return d.x;
        })
        // .attr("y", function (d) { return 0.5 * (y(d[0])+y(d[1])); });
        .attr("y", function (d, _i) {
            return d.y;

        });

}

</script>
<template>
    <div id="chart-stream"></div>
</template>