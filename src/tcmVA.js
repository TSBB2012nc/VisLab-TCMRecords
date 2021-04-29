// global variables
    // Scatterplot
var g_scwidth = 400;
var g_scheight = 400;
var gBrushes = [];
var gSympData = [];
var gSqwwData = [];
var gRxTimeData = [];
    
var margin = {left: 10, right: 10, top: 10, bottom: 10};
// Draw scatterplots
function drawSConDiv(data, divName, scwidth, scheight) {

    var scSvg = d3.select(divName)
        .append("svg")
        .attr("width", scwidth + margin.left + margin.right)
        .attr("height", scheight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .range([0, scwidth]);

        var y = d3.scaleLinear()
            .range([scheight, 0]);
        var xAxis = d3.axisBottom(x)
            .ticks(0);

        var yAxis = d3.axisLeft(y)
                    .ticks(0);

        x.domain(d3.extent(data, function(d) { return d.V0; })).nice();
        y.domain(d3.extent(data, function(d) { return d.V1; })).nice();

        scSvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + scheight + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", scwidth)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("V0");

        scSvg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("V1");
            
        scSvg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function (d) { return x(d.V0); })
                .attr("cy", function (d) { return y(d.V1); })
                .style("fill", function (d) { return "gray"; })
                .style("opacity", 0.5)
            .append("text")
             .text(function(d) {return d.name;})
             .attr("x", function (d) { return x(d.V0) + 10; })
             .attr("y", function (d) { return y(d.V1) + 10; });

        return scSvg;
    }


function drawStreamGraph(data){

}

function streamChart(csvpath, color) {

    if (color == "blue") {
      colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color == "pink") {
      colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (color == "orange") {
      colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    strokecolor = colorrange[0];
    
    // var format = d3.time.format("%m/%d/%y");
    // var format = d3.time.format("%Y/%m/%d");
    var format = d3.time.format("%M %d %Y");
    
    var margin = {top: 20, right: 40, bottom: 30, left: 30};
    var width = document.body.clientWidth - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");
    
    var x = d3.scaleTime()
        .range([0, width]);
    
    var y = d3.scaleLinear()
        .range([height-10, 0]);
    
    var z = d3.scaleOrdinal()
        .range(colorrange);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(x);
    
    var yAxis = d3.svg.axis()
        .scale(y);
    
    var yAxisr = d3.svg.axis()
        .scale(y);
    
    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.visit; })
        .y(function(d) { return d.value; });
    
    var nest = d3.nest()
        .key(function(d) { return d.key; });
    
    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.visit); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });
    
    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    
    var graph = d3.csv(csvpath, function(data) {
      var maxTimeSteps = -1;
      var allDates=[];
      data.forEach(function(d,i) {
        d.date = format.parse(d.date);
        d.value = +d.value;
        d.visit = +d.visit;
      });
      // transform data to a matrix (rows: date, columns: keys)
    
      var dataByKey =nest.entries(data);
       // get unique dates
      var dataByDate = d3.nest()
      .key(function(d) { return d.date; })
      .entries(data);
      console.log(dataByDate);
      var fulldataByKey = dataByKey;
      var fixedData = [];
      // Fill empty dates for each medicine
      for(var i = 0; i < dataByKey.length; i++)
      {
        for(var k = 0; k < dataByDate.length; k++) // all dates
          {
              var dateFound = false;
            for(var j = 0; j < dataByKey[i].values.length; j++) // appearances of the medicine
            {
                if(dataByKey[i].values[j].date==dataByDate[k].key)
                {
                    fulldataByKey[i].values.push({key: dataByKey[i].key, value: dataByKey[i].values[j].value, date: dataByDate[k].key});    
                    fixedData.push({key: dataByKey[i].key, value: dataByKey[i].values[j].value, date: dataByDate[k].key});
                    dateFound = true;
                    break;
                } 
            }
    
            if(!dateFound){
                fulldataByKey[i].values.push({key: dataByKey[i].key, value: 0, date: dataByDate[k].key});    
                fixedData.push({key: dataByKey[i].key, value: 0, date: dataByDate[k].key});
            }
    
          }
    
    
      }
      console.log(fixedData);
      // Write out fulldataByKey to csv
      var csvstring = d3.csv.format(
          fixedData.map(function(d, i) {
      return [
        d.key, // Assuming d.year is a Date object.
        d.value,
        d.date,
        d.visit
      ];
        }));
        console.log(csvstring);
    
     var dataForStack=  nest.entries(data);
      var layers = stack(dataForStack);
    
    //   x.domain(d3.extent(data, function(d) { return d.date; }));
    x.domain(d3.extent(data, function(d) { return d.visit; }));
      y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
    
    //   svg.selectAll(".layer")
    //       .data(layers)
    //     .enter().append("path")
    //       .attr("class", "layer")
    //       .attr("d", function(d) { return area(d.values); })
    //       .style("fill", function(d, i) { return z(i); });
    
        svg.selectAll(".layer")
          .data(layers)
        .enter().append("path")
          .attr("class", "layer")
          .attr("d", function(d) { return area(d.values); })
          .style("fill", function(d, i) { return z(i); });
    
    
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    
      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + width + ", 0)")
          .call(yAxis.orient("right"));
    
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis.orient("left"));
    
      svg.selectAll(".layer")
        .attr("opacity", 1)
        .on("mouseover", function(d, i) {
          svg.selectAll(".layer").transition()
          .duration(250)
          .attr("opacity", function(d, j) {
            return j != i ? 0.6 : 1;
        })})
    
        .on("mousemove", function(d, i) {
          mousex = d3.mouse(this);
          mousex = mousex[0];
          var invertedx = x.invert(mousex);
          invertedx = invertedx.getMonth() + invertedx.getDate();
          var selected = (d.values);
          for (var k = 0; k < selected.length; k++) {
            datearray[k] = selected[k].date
            datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
          }
    
          mousedate = datearray.indexOf(invertedx);
          pro = d.values[mousedate].value;
    
          d3.select(this)
          .classed("hover", true)
          .attr("stroke", strokecolor)
          .attr("stroke-width", "0.5px"), 
          tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");
          
        })
        .on("mouseout", function(d, i) {
         svg.selectAll(".layer")
          .transition()
          .duration(250)
          .attr("opacity", "1");
          d3.select(this)
          .classed("hover", false)
          .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
      })
        
      var vertical = d3.select(".chart")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", "380px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");
    
      d3.select(".chart")
          .on("mousemove", function(){  
             mousex = d3.mouse(this);
             mousex = mousex[0] + 5;
             vertical.style("left", mousex + "px" )})
          .on("mouseover", function(){  
             mousex = d3.mouse(this);
             mousex = mousex[0] + 5;
             vertical.style("left", mousex + "px")});
    });
    }
    
function tcmVAmain()
{
    d3.csv("./newdata.csv", function(data){

        for(var i = 0; i < data.length; i++)
        {
            var sqwwdatum = {};
            sqwwdatum.V0 = +data[i].sqww1;
            sqwwdatum.V1 = +data[i].sqww2;
            sqwwdatum.name = data[i].Name;
            sqwwdatum.pinyin = data[i].Pinyin;

            var sympdatum = {}
            sympdatum.name = +data[i].Name;
            sympdatum.pinyin = +data[i].Pinyin;
            sympdatum.V0 = +data[i].symp1;
            sympdatum.V1 = +data[i].symp2;

            gSqwwData.push(sqwwdatum);
            gSympData.push(sympdatum);
        }

        
        drawSConDiv(gSympData, "#exampleSC", g_scwidth, g_scheight);
        drawSConDiv(gSqwwData, "#exampleSC", g_scwidth, g_scheight);
    });
}