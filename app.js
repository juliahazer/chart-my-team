// set the dimensions and margins of the graph
var margin = {
  top: 20, 
  right: 20, 
  bottom: 100, 
  left: 50
}
var width = 900 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
// var border = 1;
// var borderColor = 'black';

var playerArr = [];

d3.tsv('./player_data.tsv', function(file){
  playerArr = file;

  //sort by number of matches
  playerArr.sort(function(a,b) { return a.Matches - b.Matches});

  console.log(playerArr)

  var barPadding = 5;
  var barWidth = width / playerArr.length - barPadding;
  

  var yMax = d3.max(playerArr.map(d => d3.max(d.Matches)));
  //make the yMax 1 more than the greatest number of matches
  yMax++;

  var yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0])

  //x Axis 
  var xScale = d3.scaleBand()
    .domain(playerArr.map(d => d.Player))
    .range([0, width])
    .padding(0.1);

  d3.select('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      // .attr('border', border)
    .append('g')
      .attr('transform', 'translate(' + margin.left + "," + margin.top + ")")

  /*TITLE: http://www.d3noob.org/2013/01/adding-title-to-your-d3js-graph.html*/
  d3.select('svg')
    .append("text")
      .attr("x", (width / 2))             
      .attr("y", margin.top)
      .attr("text-anchor", "middle")  
      .style("font-size", "16px")   
      .text("Matches");

  d3.select('svg')
    .selectAll('rect')
    .data(playerArr) 
    .enter()
    .append('rect')
      .attr('x', (d, i) => (barWidth + barPadding) * i)
      .attr('y', d => yScale(d.Matches))
      .attr('width', barWidth)
      .attr('height', d => height - yScale(d.Matches))
      .style('fill', 'red')



  //limit ticks to whole numbers?? 
  var yAxis = d3.axisRight(yScale)
              .tickFormat(d3.format('d'))

  var xAxis = d3.axisBottom(xScale);

  //add the x Axis
  d3.select('svg')
    .append('g')
      .attr('transform', 'translate(0,' + height + ")")
      .call(xAxis)
      .selectAll('text')
        .style('text-anchor', 'end') //ensures end of label is attached to the axis tick
        .attr('dx', '-.8em')
        .attr('dy', '-.15em')
        .attr('transform', 'rotate(-90)');//'rotate(-65)');

  //add the y Axis
  d3.select('svg')
    .append('g')
      .attr('transform', 'translate(' + width + ', 0)') //shifts axis
      .call(yAxis)

})