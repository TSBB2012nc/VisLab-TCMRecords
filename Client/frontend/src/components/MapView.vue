<script setup>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import { defaultColoring, expColoring } from '@/utils/color';

onMounted(() => {
    drawSConDiv(gSympData, "scSymp", "#exampleSC", 500, 500);
});



var gSympData = [];
// 1.Prepare the scatterplots
d3.csv("./newdata.csv", function (data) {
    for (var i = 0; i < data.length; i++) {
        var sqwwdatum = {};
        sqwwdatum.V0 = +data[i].sqww1;
        sqwwdatum.V1 = +data[i].sqww2;
        sqwwdatum.name = data[i].Name2;
        sqwwdatum.pinyin = data[i].Pinyin;
        gSqwwData.push(sqwwdatum);
        var sympdatum = {}
        if (data[i].Name == "")
            continue;
        sympdatum.name = data[i].Name;
        sympdatum.pinyin = data[i].Pinyin;
        sympdatum.V0 = +data[i].symp1;
        sympdatum.V1 = +data[i].symp2;


        gSympData.push(sympdatum);
    }
});

function drawSConDiv(data, scSvgName, divName, scwidth, scheight) {
    var legendWidth = 40;
    var margin = { top: 5, right: 40, bottom: 5, left: 40 };
    var scSvg = d3.select(divName)
        .append("svg")
        .attr('class', scSvgName)
        .attr('id', scSvgName)
        .attr("width", scwidth + margin.left + margin.right + legendWidth)
        .attr("height", scheight + margin.top + margin.bottom)
        .append("g")
        .attr('class', function () {
            var canv = scSvgName + "_canvas";
            return canv;
        })
        .attr("transform", function () {
            if (scSvgName != "scSymp")
                return "translate(" + margin.left + "," + margin.top + ")";
            else
                return "translate(15," + margin.top + ")";
        });

    var x = d3.scaleLinear()
        // .range([0, scwidth - legendWidth]);
        .range([0, scwidth]);

    var y = d3.scaleLinear()
        .range([scheight, 0]);
    var xAxis = d3.axisBottom(x).ticks(0).tickSize(0);
    var xAxis2 = d3.axisTop(x).ticks(0).tickSize(0);

    var yAxis = d3.axisLeft(y).ticks(0).tickSize(0);
    var yAxis2 = d3.axisRight(y).ticks(0).tickSize(0);


    x.domain(d3.extent(data, function (d) { return d.V0; })).nice();
    y.domain(d3.extent(data, function (d) { return d.V1; })).nice();

    scSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + scheight + ")")
        .attr("opacity", 0.1)
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", scwidth)
        .attr("y", 0)
        .style("text-anchor", "end")
        .text("V0");

    scSvg.append("g")
        .attr("class", "x axis")
        .attr("opacity", 0.1)
        .attr("transform", "translate(0, 0)")
        .call(xAxis2);

    scSvg.append("g")
        .attr("class", "y axis")
        .attr("opacity", 0.1)
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("V1");

    scSvg.append("g")
        .attr("class", "y axis")
        .attr("opacity", 0.1)
        .attr("transform", "translate(" + (scwidth) + ",0)")
        .call(yAxis2);


    var node = scSvg.selectAll(".dot")
        .data(data)
        .enter()
        .append("g");

    node.append("circle")
        .attr("class", "dot")
        .attr("r", 15.5)
        .attr("cx", function (d) { return x(d.V0); })
        .attr("cy", function (d) { return y(d.V1); })
        .style("fill", function (d) {
            return defaultColoring(d);
        })
        .attr("opacity", 0.1);

    // interactive lens
    scSvg.selectAll(".lens").remove();
    scSvg.on("mouseover", function () {
        mousex = d3.mouse(this);
        // mousey = mousex[0] + 5;
        scSvg.append("circle")
            .attr("class", "lens")
            .attr("r", 30)
            .attr("opacity", 0.1)
            .attr("cx", function () { return mousex[0]; })
            .attr("cy", function () { return mousex[1]; })
            .style('stroke', '#AAA')
            .style('fill', '#CCC');
    });
    var ww = 14;

    // // With concentric circles
    // node.append("circle")
    // // node.append("rect")
    //     .attr("class","square")
    //     // .attr("width",ww)
    //     // .attr("height",ww)
    //     // .attr("x",function(d){return x(d.V0)- ww/2;})
    //     // .attr("y",function(d){return y(d.V1)-ww/2;})
    //     .attr("r",10)
    //     .attr("cx", function (d) { return x(d.V0); })
    //     .attr("cy", function (d) { return y(d.V1); })
    //     .style("fill", function(d){
    //       return expColoring(d);
    //     })

    // With inner rectangle
    node.append("rect")
        .attr("class", "square")
        .attr("width", ww)
        .attr("height", ww)
        .attr("x", function (d) { return x(d.V0) - ww / 2; })
        .attr("y", function (d) { return y(d.V1) - ww / 2; })
        .style("fill", function (d) {
            return expColoring(d);
        })

    // draw text of medicine
    node.append("text")
        .attr("class", "dotLabel")
        .text(function (d) { return d.name; })
        .style("font-size", "12px")
        .attr("x", function (d) { return x(d.V0) - 30; })
        .attr("y", function (d) { return y(d.V1) - 10; });



    if (scSvgName == "scSymp") {
        // just record once
        var gPoints = data.map(function (d, i) {
            var obj = {};
            // obj.x = x(d.symp1);
            // obj.y = y(d.symp2);
            obj.x = x(d.V0);
            obj.y = y(d.V1);
            obj.r = 5;
            obj.id = i;
            obj.pinyin = d.Pinyin;
            obj.name = d.Name;
            obj.brushedId = -1; // not selected by any brush
            return obj;
        });

        // // Draw legends
        // scSvg.append("g").selectAll("expLabelsRect")
        //     .data(gExpertMedClass)
        //     .enter()
        //     .append("rect")
        //     .attr("width", ww)
        //     .attr("height", ww)
        //     .attr("x", scwidth + 20)
        //     .attr("y", function (_d, i) { return 20 + i * 25 - ww / 2; })
        //     .style("fill", '#FFFFF')

        // scSvg.append("g").selectAll("expLabels")
        //     .data(gExpertMedClass)
        //     .enter()
        //     .append("text")
        //     .style("font-size", "12px")
        //     .attr("x", scwidth + 35)
        //     .attr("y", function (_d, i) { return 20 + i * 25; }) // 100 is where the first dot appears. 25 is the distance between dots
        //     // .style("fill", function (d,i) { return gDefaultColRange(i); })
        //     .text(function (d) {
        //         var newStr = d.replace(/ *\（[^)]*\） */g, "");
        //         return newStr;
        //     })
        //     .attr("text-anchor", "left")
        //     .style("alignment-baseline", "middle")

        // scSvg.append("g").selectAll("defaultDots")
        //     .data(gDefaultMedClass)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", scwidth + 20)
        //     .attr("cy", function (_d, i) { return 320 + i * 25; }) // 100 is where the first dot appears. 25 is the distance between dots
        //     .attr("r", 7)
        //     .style("fill", function (d, _i) {
        //         return gDefaultColRange(d);
        //     })

        // scSvg.append("g").selectAll("defaultLabels")
        //     .data(gDefaultMedClass)
        //     .enter()
        //     .append("text")
        //     .style("font-size", "12px")
        //     .attr("x", scwidth + 35)
        //     .attr("y", function (_d, i) { return 320 + i * 25; }) // 100 is where the first dot appears. 25 is the distance between dots
        //     // .style("fill", function (d,i) { return gDefaultColRange(i); })
        //     .text(function (d) {
        //         var newStr = d.replace(/ *\（[^)]*\） */g, "");
        //         return newStr;
        //     })
        //     .attr("text-anchor", "left")
        //     .style("alignment-baseline", "middle")

    }


    var scatterplot = {};
    scatterplot.svg = scSvg;
    scatterplot.xXform = x;
    scatterplot.yXform = y;

    return scatterplot;
}

</script>

<template>
    <div id="exampleSC"></div>
</template>