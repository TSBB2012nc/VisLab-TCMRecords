<template>
    <!-- Theme River -->
    <div id="chart-stream"></div>

    <!-- 蛋白尿 -->
    <div id="chart-proteinuria"></div>

    <!-- 血压 -->
    <div id="chart-bloodpressure"></div>

</template>

<script setup>
import * as d3 from 'd3';
import { onMounted } from 'vue';

var patient1_value_csv = 'bingren1.csv'
var gPatient = 0;

var margin = { top: 5, right: 40, bottom: 25, left: 50 };
// var parseDate = d3.time.format("%d-%b-%y").parse;

var width = 3000;
var height = 160;
// var x = d3.scaleTime().range([0, width]);
var x = d3.scaleLinear().range([0, width]);
var y0 = d3.scaleLinear().range([height, 0]);
var y1 = d3.scaleLinear().range([height, 0]);

var yAxisLeft = d3.axisLeft(y0).ticks(5);
var yAxisRight = d3.axisRight(y1).ticks(5);
var isPulse = false;

onMounted(() => {
var svg = d3.select('div#chart-proteinuria')
  .append("svg")
  .attr('class', "linechart")
  .attr("width", 1000)
  .attr("height", 600)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// Get the data
var gPatientVisitDate = [];
d3.csv(patient1_value_csv).then( (data) => {
  console.log(patient1_value_csv);
  console.log(data);
  data.forEach(function (d) {
    d.date = (d.date);
    if (gPatientVisitDate.indexOf(d.date) == -1)
      gPatientVisitDate.push(d.date);
    d.visit = +d.visit;
    if (d.v0 == "x") {
      d.v0 = NaN;
      d.v1 = +d.v1;
    }
    else if (d.v1 == "x") {
      d.v1 = NaN;
      d.v0 = +d.v0;
    }
    else {
      d.v0 = +d.v0;
      d.v1 = +d.v1;
    }
    d.sbp = +d.SBP;
    d.dbp = +d.DBP;
  });



  var line = [];
  var line2 = [];

  line = d3.line().defined(d => !isNaN(d.sbp))
    .x(d => x(d.visit))
    .y(d => y0(d.sbp));

  line2 = d3.line().defined(d => !isNaN(d.dbp))
    .x(d => x(d.visit))
    .y(d => y0(d.dbp));


  // Scale the range of the data
  // x.domain(d3.extent(data, function (d) { return d.date; }));
  x.domain(d3.extent(data, function (d) { return d.visit; }));

  if (!isPulse) {
    y0.domain([0, d3.max(data, function (d) {
      return Math.max(d.v0);
    })]);
    y1.domain([0, d3.max(data, function (d) {
      return Math.max(d.v1);
    })]);
  } else {

    y0.domain([0, d3.max(data, function (d) {
      return Math.max(d.sbp, d.dbp);
    })]);
  }

  var xAxis = d3.axisBottom(x)
    // .ticks(function(_d,_i){
    //   console.log(data.length);
    //   return data.length;})
    .tickFormat(function (_d, i) {
      var date = data[i].date;
      // console.log(date);
      return date;
    });

  if (data.length >= 30)
    xAxis.ticks(30);
  else if (data.length >= 20)
    xAxis.ticks(20);
  else if (data.length >= 10)
    xAxis.ticks(10);
  else
    xAxis.ticks(5);
  // svg.append("path")        // Add the valueline path.
  //   .attr("d", valueline(data))
  //   .attr("stroke", "steelblue")
  //   .style("stroke-width", 2)
  //   .style("fill", "none");
  // draw line1 with missing data
  svg.append("path")
    .datum(data.filter(line.defined()))
    .attr("stroke", "#ccc")
    .attr("d", line)
    .style("fill", "none");

  svg.append("path")
    .datum(data)
    // .attr("stroke", "steelblue")
    .attr("stroke", function () {
      if (isPulse)
        return "#67a9cf";
      else
        return "steelblue";
    })
    .attr("stroke-width", 2.5)
    .attr("d", line)
    .style("fill", "none");
  // draw line 2 with missing data
  svg.append("path")
    .datum(data.filter(line2.defined()))
    .attr("stroke", "#ccc")
    .attr("d", line2)
    .style("fill", "none");

  svg.append("path")
    .datum(data)
    // .attr("stroke", "#FFB018")
    .attr("stroke", function () {
      if (isPulse)
        return "#ef8a62";
      else
        return "#FFB018";
    })
    .attr("stroke-width", 2.5)
    .attr("d", line2)
    .style("fill", "none");

  // svg.append("path")        // Add the valueline2 path.
  //   .style("stroke", "red")
  //   .style("stroke-width", 2)
  //   .attr("d", valueline2(data))
  //   .style("fill", "none");

  var circleNode = svg.selectAll("line-circle")
    .data(data)
    .enter();

  if (!isPulse) // for test results
  {
    circleNode.append("circle")
      .attr("class", "data-circle")
      .attr("r", 5)
      .attr("cx", function (d) { return x(d.visit); })
      .attr("cy", function (d) {
        if (d.v0 >= 0)
          return y0(d.v0);
        else
          return 0;
      })
      .style("fill", function (d) {
        if (d.v0 >= 0)
          return "steelblue";
        else
          return "none";
      });

    circleNode.append("circle")
      .attr("class", "data-circle")
      .attr("r", 5)
      .style("fill", function (d) {
        if (!isNaN(d.v1))
          return "#FFB018";
        else
          return "none";
      })
      .attr("cx", function (d) { return x(d.visit); })
      .attr("cy", function (d) { return y1(d.v1); })
  }
  else { // for pulse
    circleNode.append("circle")
      .attr("class", "data-circle")
      .attr("r", 5)
      .attr("cx", function (d) { return x(d.visit); })
      .attr("cy", function (d) {
        if (d.sbp >= 0)
          return y0(d.sbp);
        else
          return 0;
      })
      .style("fill", function (d) {
        if (d.sbp >= 0)
          return "#67a9cf";
        else
          return "none";
      });

    circleNode.append("circle")
      .attr("class", "data-circle")
      .attr("r", 5)
      .style("fill", function (d) {
        if (!isNaN(d.dbp))
          return "#ef8a62";
        else
          return "none";
      })
      .attr("cx", function (d) { return x(d.visit); })
      .attr("cy", function (d) { return y0(d.dbp); })
  }

  svg.append("g")            // Add the X Axis
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .style("fill", "none")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 8)
    .attr("x", -20)
    .attr("dy", ".7em")
    .attr("transform", "rotate(15)")
    .style("text-anchor", "start");

  ////
  // svg.append("text")
  //   .attr("transform",
  //     "translate(" + (width / 2) + " ," +
  //     (height + margin.top + 10) + ")")
  //   .style("text-anchor", "middle")
  //   .text("就诊日期");
  ////
  svg.append("g")
    .attr("class", "y axis")
    .style("stroke", "steelblue")
    .style("fill", "none")
    .call(yAxisLeft);
  ////
  if (!isPulse) {
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (0.7 * height))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(function () {
        if (gPatient == 0)
          return "蛋白尿g/L";
        else
          return "蛋白尿mg/24h";
      });
    /////

    if (gPatient != 0) {
      svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + " ,0)")
        .style("fill", "none")
        .style("stroke", "#FFB018")
        .call(yAxisRight);

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left + 1300)
        .attr("x", 0 - (0.7 * height))
        .attr("dy", "0.5em")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text("血肌酐 umol/L");
    }
  }
  else {
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (0.7 * height))
      .attr("dy", "1em")
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .text("血压 mmHg");
  }
});

});
</script>
