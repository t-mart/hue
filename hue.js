const d3 = require("d3");

export default function hue() {
  let svg = d3.select("svg");
  let boxWidth = d3.select("#boxWidth").property("value");
  let boxHeight = d3.select("#boxHeight").property("value");
  let nBoxesWide = d3.select("#nBoxesWide").property("value");
  let nBoxesHigh = d3.select("#nBoxesHigh").property("value");
  let originColor = d3.select("#originColor").property("value");
  let xColor = d3.select("#xColor").property("value");
  let yColor = d3.select("#yColor").property("value");
  svg.attr('width', +boxWidth * +nBoxesWide);
  svg.attr('height', +boxHeight * + nBoxesHigh);

  
}
