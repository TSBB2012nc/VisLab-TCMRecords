// global variables
    // Scatterplot
var g_scwidth = 660;
var g_scheight = 660;
var g_sgwidth = 1400;
var g_sgLegendWidth = 100;
var g_sgheight = 400;
var gBrushes = [];
var gSympData = [];
var gSqwwData = [];
var gRxTimeData = [];
var margin = {left: 20, right: 20, top: 40, bottom: 40};

// Scatterplot objects
var gScatterSymp = [];
var gScatterSqww = [];
// Streamgraph objects
var gStreamRx = [];

//User selection with burshing
var brushes = [];
var gPoints = [];
var gSelectedPoints = [];
var gNotSelectedPoints = [];
// colors of streamgraph bands by user brushing
var gStreamGraphLayers = [];
var gStreamGraphKeys = [];
var gDefaultStreamgraphColRange = [];
var gStreamBandColors = [];

// Patient data
var gPatient = 1;
var gRxFilenameList = ["medByVisitP1.csv","medByVisitP2.csv","medByVisitP3.csv"];
var gTestFilenameList = ["bingren1.csv","bingren2.csv","bingren3.csv"];
// Medicine attributes
var gMedProperties = [];
var gDefaultMedClass = [];
var gExpertMedClass = [];
var gDefaultMedMajorClass = ["利水渗湿药","化湿药","收敛药","泻下药","止血药","消食药","活血祛瘀药","清热类","理气药","补虚药","解表药"];
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
var colorMap = d3.scaleOrdinal(d3.schemeCategory10);

 // Save data to CSV
 function exportToCsv(filename, rows) {
  var processRow = function (row) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      };
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0)
        result = '"' + result + '"';
      if (j > 0)
        finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  var csvFile = '';
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function defaultColoring(d)
{
  if(gDefaultMedMajorClass.length > 0 )
  {
      // Default classification by medicine classification
      var medClass = -1;
      for(var ii = 0; ii < gMedProperties.length; ii++)
      {
        if(d.name == gMedProperties[ii].name)
        {
          // Search the name of medicine classification in the major classification list
          for(var j = 0; j < gDefaultMedMajorClass.length; j++){
            if(gMedProperties[ii].class.search(gDefaultMedMajorClass[j]) >= 0){
              medClass = j;
              break;
            }
          }
        }
        
        if(medClass >= 0)
          break;
      }  
      if(medClass < 0 )
        return "blue";
      else
        return gDefaultStreamgraphColRange(medClass); 
  }
  else
    return "blue"; 
}

function expColoring(d)
{
  if(gExpertMedClass.length > 0 )
  {
      // Default classification by medicine classification
      var medClass = -1;
      for(var ii = 0; ii < gMedProperties.length; ii++)
      {
        if(d.name == gMedProperties[ii].name)
        {
          // Search the name of medicine classification in the major classification list
          for(var j = 0; j < gExpertMedClass.length; j++){
            if(gMedProperties[ii].classExp.search(gExpertMedClass[j]) >= 0){
              medClass = j;//gExpertMedClass.length - j -1;
              break;
            }
          }
        }
        
        if(medClass >= 0)
          break;
      }  
      if(medClass < 0 )
        return "blue";
      else
        return gDefaultStreamgraphColRange(medClass); 
  }
  else
    return "blue"; 
}


// when a lasso is completed, filter to the points within the lasso polygon
function handleLassoEnd(lassoPolygon)
{

    var points = gPoints;
    gSelectedPoints = points.filter(d => {
        // note we have to undo any transforms done to the x and y to match with the
        // coordinate system in the svg.
        const x = d.x+ margin.left; //padding.left;
        const y = d.y+ margin.top; //padding.top;
        // const name = d.name;
        // const pinyin = d.pinyin;
        return d3.polygonContains(lassoPolygon, [x, y]);
    });

  //   var selectedPointsSqww = points.filter(d => {
  //     // note we have to undo any transforms done to the x and y to match with the
  //     // coordinate system in the svg.
  //     const x2 = d.x2+ margin.left; //padding.left;
  //     const y2 = d.y2+ margin.top; //padding.top;
  //     // const name = d.name;
  //     // const pinyin = d.pinyin;
  //     return d3.polygonContains(lassoPolygon, [x2, y2]);
  // });

  // gSelectedPoints = gSelectedPoints.concat(selectedPointsSqww);

    gNotSelectedPoints = [];
    for(var i = 0; i < gPoints.length; i++){
        var isSelected = false;
        for(var j = 0; j < gSelectedPoints.length; j++){
            if(gSelectedPoints[j].id == gPoints[i].id){
                isSelected = true;
                break;
            }
        }
        if(!isSelected)
        gNotSelectedPoints.push(gPoints[i]);
    }
    // Add brush to the brush array
    // var brush = lassoFunction(d3.select("#scSymp"));
    gBrushes.push({
        id: gBrushes.length,
        // brush: brush,
        color: colorMap(gBrushes.length),
        points: gSelectedPoints
    });
    updateSelectedPoints(gSelectedPoints);
}

function handleLassoEndInstance2(lassoPolygon)
{

    var points = gPoints;
    gSelectedPoints  = points.filter(d => {
      // note we have to undo any transforms done to the x and y to match with the
      // coordinate system in the svg.
      const x2 = d.x2+ margin.left; //padding.left;
      const y2 = d.y2+ margin.top; //padding.top;
      // const name = d.name;
      // const pinyin = d.pinyin;
      return d3.polygonContains(lassoPolygon, [x2, y2]);
  });

    gNotSelectedPoints = [];
    for(var i = 0; i < gPoints.length; i++){
        var isSelected = false;
        for(var j = 0; j < gSelectedPoints.length; j++){
            if(gSelectedPoints[j].id == gPoints[i].id){
                isSelected = true;
                break;
            }
        }
        if(!isSelected)
        gNotSelectedPoints.push(gPoints[i]);
    }
    // Add brush to the brush array
    // var brush = lassoFunction(d3.select("#scSymp"));
    gBrushes.push({
        id: gBrushes.length,
        // brush: brush,
        color: colorMap(gBrushes.length),
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
      // Check if it's lately selected 
      for(var i = 0; i < selectedPoints.length; i++)
      {
        if(d.id == selectedPoints[i].id)
        {
          d.brushedId = gBrushes.length -1 ;
          // Check if the medicine is in the streamgraph
          for (var j = 0; j < gStreamGraphLayers.length; j++) {
            if (d.name == gStreamGraphLayers[j].key){
              gStreamBandColors.push({name: d.name, color: colorMap(d.brushedId)});
              break;
            }
         }
          break;
        }
      }
    });
    selectedPoints.forEach(d => {
      d.color = '#000';
      d.brushedId = gBrushes.length-1; // Set brushed Id
    });

  }

  // redraw with new colors
    redrawAll();
}

// helper to actually draw points on the canvas
function redrawAll() 
{

  // Check what medicine are used in the streamgraph

  // Need to update multiple linked views!!!
  // Symptoms view
    const context1 = d3.select("#scSymp");
    var allDotsSymp = context1.selectAll(".dot");
    allDotsSymp.data(gPoints)
    .attr("r", function(d)    {
            // check if the point is selected by SelectedPoints
          for (var i = 0; i < gSelectedPoints.length; i++) {
            if(gSelectedPoints[i].id == d.id)
              return 18;
          }
          return 15.5;
        })
    .style("fill", function(d){
        // Check all brushed groups
        if(d.brushedId >= 0)
          return gBrushes[d.brushedId].color;
        else
         return defaultColoring(d);//"#045A8D";
    })
    .attr("opacity", function(d){
      for(var i = 0; i < gStreamGraphKeys.length; i++){
        if(d.name == gStreamGraphKeys[i])
          return 1;
      }
      return 0.05;
    });

    var allRectsSymp = context1.selectAll(".square");
    allRectsSymp.data(gPoints)
    .attr("opacity", function(d){
      for(var i = 0; i < gStreamGraphKeys.length; i++){
        if(d.name == gStreamGraphKeys[i])
          return 1;
      }
      return 0.05;
    });

    // Sqww View
    const context2 = d3.select("#scSqww");
    var allDotsSqww = context2.selectAll(".dot");
    allDotsSqww.data(gPoints)
    .attr("r", function(d)    {
            // check if the point is selected by SelectedPoints
          for (var i = 0; i < gSelectedPoints.length; i++) {
            if(gSelectedPoints[i].id == d.id)
              return 18;
          }
          return 15.5;
        })
    .style("fill", function(d){
        // Check all brushed groups
        if(d.brushedId >= 0)
          return gBrushes[d.brushedId].color;
        else
          return defaultColoring(d);
        //  return "#045A8D";
    })
    .attr("opacity", function(d){
      for(var i = 0; i < gStreamGraphKeys.length; i++){
        if(d.name == gStreamGraphKeys[i])
          return 1;
      }
      return 0.05;
    });

    var allRectsSqww = context2.selectAll(".square");
    allRectsSqww.data(gPoints)
    .attr("opacity", function(d){
      for(var i = 0; i < gStreamGraphKeys.length; i++){
        if(d.name == gStreamGraphKeys[i])
          return 1;
      }
      return 0.05;
    });

    // Stream graph
    const context3 = d3.select("#streamGraph");
    var bands = context3.selectAll(".layer");
      bands.attr("class", "layer")
      .style("fill", function(d, i) { 
        for(var j = 0; j < gStreamBandColors.length; j++){
          if(d.key == gStreamBandColors[j].name)
            return gStreamBandColors[j].color;
        }
        return gDefaultStreamgraphColRange(i);
       });
  }

// attach lasso to interaction SVG
function lassoFunction(interactionSvg) 
{
    // console.log(interactionSvg);
    var lassoInstance = lasso(interactionSvg)
        .on('end', handleLassoEnd)
        .on('start', handleLassoStart);

    interactionSvg.call(lassoInstance);

    return lassoInstance;
}

function lassoFunctionInstance2(interactionSvg) 
{
    // console.log(interactionSvg);
    var lassoInstance = lasso(interactionSvg)
        .on('end', handleLassoEndInstance2)
        .on('start', handleLassoStart);

    interactionSvg.call(lassoInstance);

    return lassoInstance;
}

// Draw linecharts
function drawLinecharts(csvName, divName, sgWidth, sgHeight)
{



  var margin = {top: 20, right: 40, bottom: 30, left: 50};
  // var parseDate = d3.time.format("%d-%b-%y").parse;
  var parseDate = d3.timeParse("%d-%b-%y");

  var width = sgWidth - margin.left - margin.right;
  var height = sgHeight - margin.top - margin.bottom;
  var x = d3.scaleTime().range([0, width]);
  var y0 = d3.scaleLinear().range([height, 0]);
  var y1 = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x).ticks(20);

  var yAxisLeft = d3.axisLeft(y0).ticks(5);

  var yAxisRight = d3.axisRight(y1).ticks(5);


  var svg = d3.select(divName)
    .append("svg")
    .attr('class', "linechart")
    .attr("width",  width + margin.left + margin.right+ g_sgLegendWidth)
    .attr("height", height + margin.bottom+margin.top)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  d3.csv(csvName, function (error, data) {
    data.forEach(function (d) {
      d.date = parseDate(d.date);
      d.v0 = +d.v0;
      d.v1 = +d.v1;
    });

    
  var valueline = d3.line()
  .x(function (d) { return x(d.date); })
  .y(function (d) { return y0(d.v0); });

var valueline2 = d3.line()
  .x(function (d) { return x(d.date); })
  .y(function (d) { return y1(d.v1); });

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) { return d.date; }));
    y0.domain([0, d3.max(data, function (d) {
      return Math.max(d.v0);
    })]);
    y1.domain([0, d3.max(data, function (d) {
      return Math.max(d.v1);
    })]);

    svg.append("path")        // Add the valueline path.
      .attr("d", valueline(data))
      .attr("stroke", "steelblue")
      .style("stroke-width", 2)
      .style("fill", "none");

    svg.append("path")        // Add the valueline2 path.
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("d", valueline2(data))
      .style("fill","none");

    var circleNode = svg.selectAll("line-circle")
        .data(data)
        .enter();
      
        circleNode.append("circle")
          .attr("class","data-circle")
          .attr("r",5)
          .style("fill", "steelblue")
          .attr("cx", function(d){return x(d.date);})
          .attr("cy", function(d){return y0(d.v0);});

        circleNode.append("circle")
          .attr("class","data-circle")
          .attr("r",5)
          .style("fill", "red")
          .attr("cx", function(d){return x(d.date);})
          .attr("cy", function(d){return y1(d.v1);})

    svg.append("g")            // Add the X Axis
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .style("fill","none")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .style("stroke", "steelblue")
      .style("fill","none")
      .call(yAxisLeft);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + " ,0)")
      .style("fill","none")
      .style("stroke", "red")
      .call(yAxisRight);

  });
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
            
        var node =scSvg.selectAll(".dot")
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
                    .attr("class","square")
                    .attr("width",ww)
                    .attr("height",ww)
                    .attr("x",function(d){return x(d.V0)- ww/2;})
                    .attr("y",function(d){return y(d.V1)-ww/2;})
                    .style("fill", function(d){
                      return expColoring(d);
                    })

            node.append("text")
             .text(function(d) {return d.name;})
             .style("font-size", "12px")
             .attr("x", function (d) { return x(d.V0) - 30; })
             .attr("y", function (d) { return y(d.V1) - 10; });

             
  if (scSvgName == "scSymp") // just record once
    gPoints = data.map(function (d, i) {
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

    scSvg.append("text")
    .attr("x", (scwidth / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "24px") 
    .text(function(d){
      if(scSvgName == "scSymp")
      return "症状";
      else
      return "四气五味-归经";
    });


    var scatterplot = {};
    scatterplot.svg = scSvg;
    scatterplot.xXform = x;
    scatterplot.yXform = y;

    return scatterplot;
}

//streamgraph
function streamChart(csvpath, color, divName, sgWidth, sgHeight) 
{
    var datearray = [];
    var colorrange = [];
    
    
    var keys = [];
    
    if (color == "blue") {
      // colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
      colorrange = ["#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color == "pink") {
      colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (color == "orange") {
      colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    else if (color == "gray"){
      // colorrange = ["#252525", "#525252","#737373","#969696","#bdbdbd","#d9d9d9","#f0f0f0"];
      colorrange = ["#bdbdbd","#d9d9d9","#f0f0f0"];
    }

    strokecolor = colorrange[0];

    // var format = d3.time.format("%m/%d/%y");
    // var format = d3.time.format("%Y/%m/%d");
    var format = d3.timeFormat("%M %d %Y");
    var parseDate = d3.timeParse("%M %d %Y");
    
    var margin = {top: 20, right: 40, bottom: 30, left: 50};
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
    // // If we have a classificiation of medicine
    // if(gDefaultMedMajorClass.length>0)
    // {
    //   z = d3.scaleOrdinal(d3.schemeTableau10);
    // }
    // gDefaultStreamgraphColRange = z;   

    var xAxis = d3.axisBottom(x)
        .ticks(20);
        // .ticks(function(d){return d.visit;});
    
    var yAxis = d3.axisLeft(y)
        .scale(y).ticks(0);
    
    var yAxisr = d3.axisRight(y)
        .scale(y).ticks(0);
    
    var nest = d3.nest()
        .key(function(d) { return d.key; });
    
    var area = d3.area()
        .x(function(d) { return x(d.data.visit); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });
    
    var svg = d3
    .select(divName)
        .append("svg")
         .attr("width", width + margin.left + margin.right+ g_sgLegendWidth) 
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    
    var graph = d3.csv(csvpath, function(data) {
      var maxTimeSteps = -1;
      var allDates=[];
      var totalVisits = 0;
      data.forEach(function(d,i) {
        d.date = parseDate(d.date);
        d.value = +d.value;
        d.visit = +d.visit;
        totalVisits = Math.max(d.visit, totalVisits);
      });
      // transform data to a matrix (rows: date, columns: keys)
    
      // List of groups = header of the csv files
      var keys = data.columns.slice(1);
      gStreamGraphKeys = keys;
      var stackGen = d3.stack()
       .keys(keys)
        .order(d3.stackOrderDescending)
        .offset(d3.stackOffsetSilhouette);
        // .value(function(d) { return d.values; })
     var layers = stackGen(data);
      gStreamGraphLayers = layers;
      // var layers = stack.keys(keys)(dataForStack);
    
      // TODO: need to fix the y range
    //   x.domain(d3.extent(data, function(d) { return d.date; }));
      x.domain(d3.extent(data, function(d) { return d.visit; }));
      // y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
      // y.domain([0, d3.extent(data, function(d) {return d[0] + d[1];})]);
      y.domain([-180, 180]); 
    
    //   svg.selectAll(".layer")
    //       .data(layers)
    //     .enter().append("path")
    //       .attr("class", "layer")
    //       .attr("d", function(d) { return area(d.values); })
    //       .style("fill", function(d, i) { return z(i); });
    
      var layernode=  svg.selectAll(".layer")
          .data(layers)
        .enter();
        
        layernode.append("path")
          .attr("class", "layer")
          .attr("d", d3.area()
          .curve(d3.curveBasis)
            .x(function(d, i) { return x(d.data.visit); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })
          )
          .style("fill", function(d, i) { 
            var medClass = -1;
            for(var ii = 0; ii < gMedProperties.length; ii++)
            {
              if(d.key == gMedProperties[ii].name)
              {
                // Search the name of medicine classification in the major classification list
                for(var j = 0; j < gDefaultMedMajorClass.length; j++){
                  if(gMedProperties[ii].class.search(gDefaultMedMajorClass[j]) >= 0){
                    medClass = j;
                    break;
                  }
                }
              }
              
              if(medClass >= 0)
                break;
            }  
              return z(medClass); 
          });
        ;
      
        var randX= 0;
        var textnode = svg.selectAll("text").data(layers)
        .enter()
        .append("text")
        .text(function(d) {return d.key;})
        .style("font-size", "12px")
        .attr("x", function (d) { 
          randX = Math.random() * (width-20);//(totalVisits-1));
          return randX; //x(randVisit); 
        })
        // .attr("y", function (d) { return 0.5 * (y(d[0])+y(d[1])); });
        .attr("y", function (d,i) { 
          var rvisit = randX / (width-1) * totalVisits;
          return  0.5*( y(d[Math.round(rvisit)][0]) + y(d[Math.round(rvisit)][1])) ; });


      svg.append("g").selectAll("mydots")
        .data(gDefaultMedMajorClass)
        .enter()
        .append("circle")
        .attr("cx", width+margin.left+5)
        .attr("cy", function (d, i) { return 20 + i * 25; }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function (d,i) { return gDefaultStreamgraphColRange(i); })

      svg.append("g").selectAll("mylabels")
        .data(gDefaultMedMajorClass)
        .enter()
        .append("text")
        .attr("x", width+margin.left+12)
        .attr("y", function (d, i) { return 20 + i * 25; }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d,i) { return gDefaultStreamgraphColRange(i); })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
    
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
            return j != i ? 0.4 : 1;
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

      redrawAll();
    });
}

function drawStreamGraph(csvPath, divName, sgwidth, sgheight)
{
    streamChart(csvPath, 'blue', divName, sgwidth, sgheight);
}

function drawTable()
{
  var tableFname = "Result-MedicalTable.csv";
  d3.csv(tableFname, function(error, data) {
    if (error) throw error;
    
    var sortAscending = true;
    var table = d3.select('#page-wrap').append('table');


    var dimensions={};
    dimensions.width = 500;
    dimensions.height = 800;
    var width = dimensions.width + "px";
    var height = dimensions.height + "px";
    var twidth = (dimensions.width - 25) + "px";
    var divHeight = (dimensions.height - 60) + "px";
    var inner = table.append("tr").append("td")
		.append("div").attr("class", "scroll").attr("width", width).attr("style", "height:" + divHeight + ";")
		.append("table").attr("class", "bodyTable").attr("border", 1).attr("width", twidth).attr("height", height).attr("style", "table-layout:fixed");
  
    var titles = d3.keys(data[0]);
    gMedProperties = data;
    var dataByCategory = d3.nest()
    .key(function(d){return d.class})
    .entries(data);

    var dataByExpCategory = d3.nest()
    .key(function(d){return d.classExp;})
    .entries(data);

    for(var k = 0; k < dataByCategory.length; k++){
      gDefaultMedClass.push(dataByCategory[k].key);
    }

    for(var k = 0; k < dataByExpCategory.length; k++){
      gExpertMedClass.push(dataByExpCategory[k].key);
    }

    if(gDefaultMedClass.length < 15)
      gDefaultMedMajorClass = gDefaultMedClass;

    
    var headers = inner.append('thead').append('tr')
                     .selectAll('th')
                     .data(titles).enter()
                     .append('th')
                     .text(function (d) {
                        return d;
                      });

                       
    // var rows = table.append('tbody').selectAll('tr')
    var rows = inner.append('tbody').selectAll('tr')
                 .data(data).enter()
                 .append('tr');
    rows.selectAll('td')
      .data(function (d) {
        return titles.map(function (k) {
          return { 'value': d[k], 'name': k};
        });
      }).enter()
      .append('td')
      .attr('data-th', function (d) {
        return d.name;
      })
      .text(function (d) {
        return d.value;
      });
  });
}
    
function convertPatientRxData(csvpath){
  var graph = d3.csv(csvpath, function(data) {
    var maxTimeSteps = -1;
    var allDates=[];
    var parseDate = d3.timeParse("%Y年%M月%Y日");
    var nest = d3.nest()
    .key(function(d) { return d.key; });
    data.forEach(function(d,i) {
      d.date = parseDate(d.date);
      d.value = +d.value;
      d.visit = +d.visit;
    });
    // 0. generate original nest data！
    var dataByKey =nest.entries(data);
    var dataByVisit = d3.nest()
    .key(function (d) { return d.visit; })
    .entries(data);

  // 1. Fix data to have values of all keys at all time steps
    var fulldataByKey = dataByKey;
    var fixedData = [];
    // Fill empty dates for each medicine
    for(var i = 0; i < dataByKey.length; i++)
    {
      for(var k = 0; k < dataByVisit.length; k++) // all dates
        {
            var dateFound = false;
          for(var j = 0; j < dataByKey[i].values.length; j++) // appearances of the medicine
          {
              if(dataByKey[i].values[j].visit==dataByVisit[k].key)
              {
                  fulldataByKey[i].values.push({key: dataByKey[i].key, value: dataByKey[i].values[j].value, visit:+dataByVisit[k].key, date: dataByKey[i].values[j].date});
                  fixedData.push({key: dataByKey[i].key, value: dataByKey[i].values[j].value, visit: +dataByVisit[k].key, date: dataByKey[i].values[j].date});
                  dateFound = true;
                  break;
              }
          }
  
          if(!dateFound){
              fulldataByKey[i].values.push({key: dataByKey[i].key, value: 0, visit: +dataByVisit[k].key, date: dataByVisit[k].values[0].date});
              fixedData.push({key: dataByKey[i].key, value: 0, visit: +dataByVisit[k].key, date: dataByVisit[k].values[0].date});
          }
  
        }
      }
  // 2. Regenerate nest data!
   dataByKey = fulldataByKey;//nest.entries(data);
   dataByVisit = d3.nest()
  .key(function (d) { return d.visit; })
  .entries(fixedData);
  // 3. Transform data to a matrix (rows: date, columns: keys)
  //Create empty data structures
  var matrix0 = [];
  for(var t = -1; t < dataByVisit.length; t++)
  // for(var t = 0; t < dataByVisit.length; t++)
  {
    var vectorMed = [];
    if(t==-1)
       vectorMed.push("visit");
    for(var m = -1; m < dataByKey.length; m++)
    {
  
      if(t == -1)
      {
          if(m >=0)
          vectorMed.push(dataByKey[m].key);
      }
      else
      {
        if(m==-1)
          vectorMed.push(t);
        else
          vectorMed.push(dataByVisit[t].values[m].value);
  
      }
    }
    matrix0.push(vectorMed);
  }
  console.log(matrix0);
  
  exportToCsv("medByVisitP3.csv", matrix0);

  });
}


function tcmVAmain()
{
  // 0. convert medical record files when not been done.
  // convertPatientRxData("medicalRecordsP3.csv");

  // ## Load medicine properties and draw a table
  drawTable();
  // If we have a classificiation of medicine
  if (gDefaultMedMajorClass.length > 0) {
    gDefaultStreamgraphColRange = d3.scaleOrdinal(d3.schemeCategory10);
  }

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
    gScatterSymp = drawSConDiv(gSympData, "scSymp", "#exampleSC", g_scwidth, g_scheight);
    // Add title to the svg
    gScatterSqww = drawSConDiv(gSqwwData, "scSqww", "#exampleSC", g_scwidth, g_scheight);

    gPoints = data.map(function (d, i) {
      var obj = {};
      // obj.x = x(d.symp1);
      // obj.y = y(d.symp2);
      obj.x = gScatterSymp.xXform(+d.symp1);
      obj.y = gScatterSymp.yXform(+d.symp2);
      obj.x2 = gScatterSqww.xXform(+d.sqww1);
      obj.y2 = gScatterSqww.yXform(+d.sqww2);
      obj.r = 5;
      obj.id = i;
      obj.pinyin = d.Pinyin;
      obj.name = d.Name;
      obj.brushedId = -1; // not selected by any brush
      return obj;
    });

    // 3. Initialize brushes 
    // gBrushes = d3.select("#VAcanvas").append('g')
    //     .attr("class", "brushes");
    // 4. Setup lasso
    linkedView1 = d3.select("#scSymp");//.select("svg");
    canvas = d3.select("#scSymp");
    linkedView2 = d3.select("#scSqww");//.select("svg");
    lassoFunction(linkedView1);
    lassoFunctionInstance2(linkedView2);
  });

  // initialize a selection button
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(gRxFilenameList)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button

  // draw streamgraph with the patient
  drawStreamGraph(gRxFilenameList[gPatient - 1], "#streamGraph", g_sgwidth, g_sgheight);
  // draw a line chart
  drawLinecharts(gTestFilenameList[gPatient-1], "#lineCharts", g_sgwidth, 150);

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function (d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    // 2. Prepare the stream graph
    // gPatient = 2;
    var RxDataName = selectedOption;
    if (RxDataName != gRxFilenameList[gPatient - 1]) {
      // Clear stream graph
      d3.select("#streamGraph").selectAll("svg").remove();
      drawStreamGraph(RxDataName, "#streamGraph", g_sgwidth, g_sgheight);
   
      for (var i = 0; i < gRxFilenameList.length; i++) {
        if (RxDataName === gRxFilenameList[i])
        {
          gPatient = i + 1 ;
          break;

        }
      }
       // Clear line charts
       d3.select("#lineCharts").selectAll("svg").remove();
      // draw a line chart
      drawLinecharts(gTestFilenameList[gPatient-1], "#lineCharts", g_sgwidth, 150);
    }
    // update(selectedOption)
  })


}