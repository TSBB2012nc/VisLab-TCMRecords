// global variables
    // Scatterplot
var g_scwidth = 400;
var g_scheight = 400;
var g_sgwidth = 1400;
var g_sgheight = 400;
var gBrushes = [];
var gSympData = [];
var gSqwwData = [];
var gRxTimeData = [];
var margin = {left: 10, right: 10, top: 10, bottom: 10};

// We also keep the actual d3-brush functions and their IDs in a list:
var brushes = [];
var gPoints = [];
var gSelectedPoints = [];

// Lasso functions

// create a container with position relative to handle our canvas layer
// and our SVG interaction layer
var visRoot = [];
// d3
//     .select(document.body)
//     .append('div')
//     .attr('class', 'vis-root')
//     .style('position', 'relative');

// main canvas to draw on
var canvas = [];
//  visRoot
//     .append('canvas')
//     .attr('width', width * screenScale)
//     .attr('height', height * screenScale)
//     .style('width', `${width}px`)
//     .style('height', `${height}px`);
// canvas
//     .node()
//     .getContext('2d')
//     .scale(screenScale, screenScale);

// add in an interaction layer as an SVG
// Linked views
var linkedView1 = [];
var linkedView2 = [];
var linkedView3 = [];
var linkedView4 = [];
var linkedView5 = [];

// when a lasso is completed, filter to the points within the lasso polygon
function handleLassoEnd(lassoPolygon)
{

    var points = gPoints;
    gSelectedPoints = points.filter(d => {
        // note we have to undo any transforms done to the x and y to match with the
        // coordinate system in the svg.
        const x = d.x;//+ padding.left;
        const y = d.y;//+ padding.top;
        // const name = d.name;
        // const pinyin = d.pinyin;
        return d3.polygonContains(lassoPolygon, [x, y]);
    });
    // Add brush to the brush array
    var brush = lassoFunction();
    gBrushes.push({
        id: brushes.length,
        brush: brush,
        color: colorMap(brushes.length),
        points: gSelectedPoints
    });
    updateSelectedPoints(gSelectedPoints);
}

// reset selected points when starting a new polygon
function handleLassoStart(lassoPolygon) 
{
  updateSelectedPoints([]);
}

// when we have selected points, update the colors and redraw
function updateSelectedPoints(selectedPoints) {
    var points = gPoints;
  // if no selected points, reset to all tomato
  if (!selectedPoints.length) {
    // reset all
    points.forEach(d => {
      d.color = 'tomato';
    });

    // otherwise gray out selected and color selected black
  } else {
    points.forEach(d => {
      d.color = '#eee';
    });
    selectedPoints.forEach(d => {
      d.color = '#000';
    });
  }

  // redraw with new colors
    drawPoints();
}

// helper to actually draw points on the canvas
function drawPoints() 
{
    var points = gPoints;
    const context = canvas.node().getContext('2d');
    context.save();
    context.clearRect(0, 0, width, height);
    //   context.translate(padding.left, padding.top);

    // Draw based on colors of brushes
    // draw each point as a rectangle
    for (let i = 0; i < points.length; ++i) {
        const point = points[i];

        // draw circles
        context.fillStyle = point.color;
        context.beginPath();
        context.arc(point.x, point.y, point.r, 0, 2 * Math.PI);
        context.fill();
        context.font = '24px sans';
        context.fillText(point.name, point.x + 5, point.y + 5);
    }

    for (var j = 0; j < brushes.length; j++) {
        const brushedpoints = brushes[j].points;
        for (var i = 0; i < brushedpoints.length; i++) {
            const point = brushedpoints[i];
            // draw circles
            context.fillStyle = brushes[j].color;
            context.beginPath();
            context.arc(point.x, point.y, point.r, 0, 2 * Math.PI);
            context.fill();
        }


    }
  context.restore();
}

// attach lasso to interaction SVG
function lassoFunction(interactionSvg) 
{
    console.log(interactionSvg);
    var lassoInstance = lasso()
        .on('end', handleLassoEnd)
        .on('start', handleLassoStart);

    interactionSvg.call(lassoInstance);

    return lassoInstance;
}

// Draw scatterplots
function drawSConDiv(data, scSvgName, divName, scwidth, scheight) 
{

    var scSvg = d3.select(divName)
        .append("svg")
        .attr('class', scSvgName)
        .attr('id', scSvgName)
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

//streamgraph
function streamChart(csvpath, color, divName, sgWidth, sgHeight) 
{
    var datearray = [];
    var colorrange = [];
    
    
    var keys = [];
    
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
    var format = d3.timeFormat("%M %d %Y");
    var parseDate = d3.timeParse("%M %d %Y");
    
    var margin = {top: 20, right: 40, bottom: 30, left: 30};
    var width = sgWidth - margin.left - margin.right;
    var height = sgHeight - margin.top - margin.bottom;
    
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");
    
    var x = d3.scaleLinear()
        .range([0, width-10]);
    
    var y = d3.scaleLinear()
        .range([height-10, 0]);
    
    var z = d3.scaleOrdinal()
        .range(colorrange);
    
    var xAxis = d3.axisBottom(x)
        .ticks(20);
        // .ticks(function(d){return d.visit;});
    
    var yAxis = d3.axisLeft(y)
        .scale(y);
    
    var yAxisr = d3.axisRight(y)
        .scale(y);
    
        // var stack = d3.layout.stack()
        //     .offset("silhouette")
        //     .values(function(d) { return d.values; })
        //     .x(function(d) { return d.visit; })
        //     .y(function(d) { return d.value; });
    
    // var stack = d3.stack()
    //    .keys(function(d) { return d.keys; })
    //     .offset(d3.stackOffsetSilhouette)
    //     .value(function(d) { return d.values; });
    
    // // d3.stack()
    //     // .offset("silhouette")
    //     .values(function(d) { return d.values; })
    //     .x(function(d) { return d.visit; })
    //     .y(function(d) { return d.value; });
    
    var nest = d3.nest()
        .key(function(d) { return d.key; });
    
    var area = d3.area()
        .x(function(d) { return x(d.data.visit); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });
    
    var svg = d3
    .select(divName)
        .append("svg")
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
        d.date = parseDate(d.date);
        d.value = +d.value;
        d.visit = +d.visit;
      });
      // transform data to a matrix (rows: date, columns: keys)
    
      // List of groups = header of the csv files
      var keys = data.columns.slice(1);
    
      var stackGen = d3.stack()
       .keys(keys)
      //  .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);
        // .value(function(d) { return d.values; })
     var layers = stackGen(data);
    
      // var layers = stack.keys(keys)(dataForStack);
    
    //   x.domain(d3.extent(data, function(d) { return d.date; }));
      x.domain(d3.extent(data, function(d) { return d.visit; }));
      // y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
      // y.domain([0, d3.extent(data, function(d) {return d[0] + d[1];})]);
      y.domain([-100, 120]);
    
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
          .attr("d", d3.area()
            .x(function(d, i) { return x(d.data.visit); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })
          )
          .style("fill", function(d, i) { return z(i); });
    
    
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    
      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + width + ", 0)")
          .call(yAxisr);
    
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
    
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
          var invertedx = Math.round(x.invert(mousex));
          // invertedx = invertedx.getMonth() + invertedx.getDate();
          var selected = (d[invertedx].data);
        //   console.log(selected);
          // for (var k = 0; k < selected.length; k++) {
          //   datearray[k] = selected[k].visit
          //   // datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
          // }
          mousedate = selected.visit;
          // mousedate = datearray.indexOf(invertedx);
          pro = selected[d.key];//d.data[mousedate].value;
    
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
    
      var vertical = d3.select(divName)
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
    
      d3.select(divName)
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

function drawStreamGraph(csvPath, divName, sgwidth, sgheight)
{
    streamChart(csvPath, 'blue', divName, sgwidth, sgheight);
}
    
function tcmVAmain()
{
    // 1.Prepare the scatterplots
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

        
        drawSConDiv(gSympData, "scSymp", "#exampleSC", g_scwidth, g_scheight);
        drawSConDiv(gSqwwData, "scSqww", "#exampleSC", g_scwidth, g_scheight);

        // 3. Initialize brushes 
        gBrushes = d3.select("#VAcanvas").append('g')
            .attr("class", "brushes");
        // 4. Setup lasso
        linkedView1 = d3.select("#scSymp");
        canvas = d3.select("#scSymp");
        linkedView2 = d3.select("#scSqww");
        lassoFunction(linkedView1);
        lassoFunction(linkedView2);
        

    });
    // 2. Prepare the stream graph
    drawStreamGraph("medByVisit.csv", "#streamGraph", g_sgwidth, g_sgheight);

}