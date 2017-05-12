// set the dimensions and margins of the graph
var margin = {
  top: 20, 
  right: 20, 
  bottom: 100, 
  left: 20
}

var height = 900 - margin.top - margin.bottom;
var width = 500 - margin.left - margin.right;

var playerArr = [];

d3.tsv('./player_data.tsv', function(file){
  playerArr = file;

  //sort by number of matches
  playerArr.sort(function(a,b) { return a.Matches - b.Matches});

  console.log(playerArr)

  var barPadding = 5;
  var barHeight = height / playerArr.length - barPadding;

  var xMax = d3.max(playerArr.map(d => d3.max(d.Matches)));
  //make the xMax 1 more than the greatest number of matches
  xMax++;

  var xScale = d3.scaleLinear()
    .domain([0, xMax])
    .range([width, 0])

  //y Axis 
  var yScale = d3.scaleBand()
    .domain(playerArr.map(d => d.Player))
    .range([0, height])
    .padding(0.1);

  /*TITLE*/
  d3.select('svg')
    .append("text")
      .attr("x", (width / 2))             
      .attr("y", margin.top)
      .attr("text-anchor", "middle")  
      .style("font-size", "16px")   
      .text("Matches");

  d3.select('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .selectAll('rect')
    .data(playerArr) 
    .enter()
    .append('rect')
      .attr('y', (d, i) => (barHeight + barPadding) * i)
      .attr('x', d => 0)
      .attr('height', barHeight)
      .attr('width', d => xScale(d.Matches))
      .style('fill', 'red')



  //limit ticks to whole numbers?? 
  var xAxis = d3.axisRight(xScale)
              .tickFormat(d3.format('d'));

  var yAxis = d3.axisBottom(yScale);

  //add the y Axis
  d3.select('svg')
    .append('g')
      .attr('transform', 'translate(0,' + width + ")")
      .call(xAxis)
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em') //NOT SURE ABOUT THESE LINES
        .attr('dy', '-.15em')
        .attr('transform', 'rotate(-90)');//'rotate(-65)');

  //add the x Axis
  d3.select('svg')
    .append('g')
    .call(xAxis)

})