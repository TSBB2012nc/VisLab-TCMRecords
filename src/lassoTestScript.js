// general size parameters for the vis
const width = window.innerWidth;
const height = window.innerHeight;
const padding = { top: 40, right: 40, bottom: 40, left: 40 };
const plotAreaWidth = width - padding.left - padding.right;
const plotAreaHeight = height - padding.top - padding.bottom;
var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);
var color = d3.scaleOrdinal(d3.schemeCategory10);


// create a container with position relative to handle our canvas layer
// and our SVG interaction layer
const visRoot = d3
  .select(document.body)
  .append('div')
  .attr('class', 'vis-root')
  .style('position', 'relative');

// main canvas to draw on
const screenScale = window.devicePixelRatio || 1;
const canvas = visRoot
  .append('canvas')
  .attr('width', width * screenScale)
  .attr('height', height * screenScale)
  .style('width', `${width}px`)
  .style('height', `${height}px`);
canvas
  .node()
  .getContext('2d')
  .scale(screenScale, screenScale);

// add in an interaction layer as an SVG
const interactionSvg = visRoot
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('position', 'absolute')
  .style('top', 0)
  .style('left', 0);

// We initially generate a SVG group to keep our brushes' DOM elements in:
var gBrushes = interactionSvg.append('g')
  .attr("class", "brushes");

// We also keep the actual d3-brush functions and their IDs in a list:
var brushes = [];
var gPoints = [];
var gSelectedPoints = [];

// when a lasso is completed, filter to the points within the lasso polygon
function handleLassoEnd(lassoPolygon) {
var points = gPoints;
gSelectedPoints = points.filter(d => {
    // note we have to undo any transforms done to the x and y to match with the
    // coordinate system in the svg.
    const x = d.x ;//+ padding.left;
    const y = d.y ;//+ padding.top;

    return d3.polygonContains(lassoPolygon, [x, y]);
  });
  // Add brush to the brush array
  var brush = lassoFunction();
  brushes.push({id: brushes.length, brush: brush, points: gSelectedPoints});
  updateSelectedPoints(gSelectedPoints);
}

// reset selected points when starting a new polygon
function handleLassoStart(lassoPolygon) {
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
function drawPoints() {
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
  }

  context.restore();
}



// attach lasso to interaction SVG
function lassoFunction()
{
    var lassoInstance = lasso()
    .on('end', handleLassoEnd)
    .on('start', handleLassoStart);
  
  interactionSvg.call(lassoInstance);
  return lassoInstance;
}


// // make up fake data
// const points = d3.range(500).map(() => ({
//   x: Math.random() * plotAreaWidth,
//   y: Math.random() * plotAreaHeight,
//   r: Math.random() * 5 + 2,
//   color: 'tomato',
// }));

// // initial draw of points
// drawPoints();
// lassoFunction();
// const points;
d3.tsv("flowers.tsv", function(error, data) {
  data.forEach(function(d) {
    d.sepalLength = +d.sepalLength;
    d.sepalWidth = +d.sepalWidth;
  });

  x.domain(d3.extent(data, function(d) { return d.sepalWidth; })).nice();
  y.domain(d3.extent(data, function(d) { return d.sepalLength; })).nice();

  gPoints = data.map(function(d,i){
    var obj={};
    obj.x = x(d.sepalWidth);
    obj.y = y(d.sepalLength);
    obj.r = 5;
    obj.id = i;
    return obj;
});


  interactionSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Sepal Width (cm)");

      interactionSvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Sepal Length (cm)")

    //   interactionSvg.selectAll(".dot")
    //   .data(data)
    // .enter().append("circle")
    //   .attr("id",function(d,i) {return "dot_" + i;}) // added
    //   .attr("class", "dot")
    //   .attr("r", 3.5)
    //   .attr("cx", function(d) { return x(d.sepalWidth); })
    //   .attr("cy", function(d) { return y(d.sepalLength); })
    //   .style("fill", function(d) { return color(d.species); });
    drawPoints();
   lassoFunction();

  var legend = interactionSvg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});



