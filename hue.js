const d3 = require("d3");

d3.selectAll("input.redraws, select.redraws").on("change", hue);
d3.selectAll("#showIndexes").on("change", updateIndexes);

export default function hue() {
  let svg = d3.select("svg");
  svg.selectAll("*").remove();

  let boxWidth = +d3.select("#boxWidth").property("value");
  let boxHeight = +d3.select("#boxHeight").property("value");
  let nBoxesWide = +d3.select("#nBoxesWide").property("value");
  let nBoxesHigh = +d3.select("#nBoxesHigh").property("value");
  let geometry = {
    "boxWidth": boxWidth,
    "boxHeight": boxHeight,
    "nBoxesWide": nBoxesWide,
    "nBoxesHigh": nBoxesHigh
  };

  let topLeftColor = d3.select("#topLeftColor").property("value");
  let topRightColor = d3.select("#topRightColor").property("value");
  let bottomLeftColor = d3.select("#bottomLeftColor").property("value");
  let bottomRightColor = d3.select("#bottomRightColor").property("value");

  let interpolator = d3[d3.select("#interpolator").property("value")];

  svg.attr('width', +boxWidth * +nBoxesWide);
  svg.attr('height', +boxHeight * +nBoxesHigh);

  let colorFunc = color(
    nBoxesWide,
    nBoxesHigh,
    {
      'topLeft': topLeftColor,
      'topRight': topRightColor,
      'bottomLeft': bottomLeftColor,
      'bottomRight': bottomRightColor
    },
    interpolator
  );

  let group = svg.selectAll("g")
    .data(d3.cross(d3.range(nBoxesWide), d3.range(nBoxesHigh)))
    .enter().append("g")
    .attr("class", d => `box x${d[0]} y${d[1]}`)
    .attr("transform", d =>  `translate(${d[0] * boxWidth}, ${d[1] * boxHeight})`);

  group.on("drag", function(d) {
    console.log(d, this);
  });

  group.append("rect")
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .attr("fill", colorFunc);

  group.append("text")
    .text(d => d[1] * nBoxesWide + d[0])
    .attr("class", "indexText")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("dx", 0.5 * boxWidth)
    .attr("dy", 0.5 * boxHeight);

  group.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged(geometry))
    .on("end", dragended(geometry)));
}

function color(x, y, colors, interpolator) {
  let topRowColor = d3.scaleLinear()
      .domain([0, x - 1])
      .range([colors.topLeft, colors.topRight])
      .interpolate(interpolator),
    bottomRowColor = d3.scaleLinear()
      .domain([0, x - 1])
      .range([colors.bottomLeft, colors.bottomRight])
      .interpolate(interpolator);

  let range = d3.range(0, x),
    topRowValues = range.map(topRowColor),
    bottomRowValues = range.map(bottomRowColor),
    columnColors = d3.zip(topRowValues, bottomRowValues)
      .map(colorPair => {
        return d3.scaleLinear()
          .domain([0, y-1])
          .range([colorPair[0], colorPair[1]])
          .interpolate(interpolator);
      });

  return data => {
    return columnColors[data[0]](data[1])
  }
}

function updateIndexes() {
  let showIndexes = d3.select("#showIndexes").property("checked");
  d3.selectAll(".indexText")
    .classed("visibleIndex", showIndexes);
}

function dragstarted(d) {
  d3.select(this).raise();
}

function dragged(geometry) {
  return function (d) {
    d3.select(this)
      .attr("transform", (d) => {
        return `translate(${d3.event.x - (geometry.boxWidth / 2)}, ${d3.event.y - (geometry.boxHeight / 2)})`;
      });
    redrawDragDropCursor(geometry, svgCoordsToBoxCoords(geometry));
  };
}

function redrawDragDropCursor(geometry, coords) {
  let translateX = geometry.boxWidth * coords[0],
    translateY = geometry.boxHeight * coords[1];
  d3.select(".cursor").remove();
  d3.select("svg")
    .append("rect")
    .attr("class", "cursor")
    .attr("transform", () => `translate(${translateX}, ${translateY})`)
    .attr("width", geometry.boxWidth)
    .attr("height", geometry.boxHeight)
}

function dragended(geometry) {
  return function (d) {
    d3.select(".cursor").remove();
    swap(geometry);
    d3.select(this)
      .attr("transform", (d) => {
        return `translate(${d[0] * geometry.boxWidth}, ${d[1] * geometry.boxHeight})`;
      });
    // debugger;
  }
}

function swap(geometry) {
  // Swaps the colors of the rects at
  //   - d3.event.subject
  //   - svgCoordsToBoxCoords
  let a = d3.select(boxCoordsToClass(d3.event.subject)),
    b = d3.select(boxCoordsToClass(svgCoordsToBoxCoords(geometry)));

  // color swap
  let aRect = a.select("rect"),
    bRect = b.select("rect");
  let tmpFill = aRect.attr("fill");
  aRect.attr("fill", bRect.attr("fill"));
  bRect.attr("fill", tmpFill);

  // index swap
  let aText = a.select("text"),
    bText = b.select("text");
  let tmpText = aText.text();
  aText.text(bText.text());
  bText.text(tmpText);
}

function svgCoordsToBoxCoords(geometry, e) {
  let event = e ? e : d3.event;
  let xScale = d3.scaleQuantize()
    .domain([0, geometry.boxWidth * geometry.nBoxesWide])
    .range(d3.range(geometry.nBoxesWide)),
    yScale = d3.scaleQuantize()
      .domain([0, geometry.boxHeight * geometry.nBoxesHigh])
      .range(d3.range(geometry.nBoxesHigh));
  return [xScale(event.x), yScale(event.y)];
}

function boxCoordsToClass(coords) {
  return `.x${coords[0]}.y${coords[1]}`
}