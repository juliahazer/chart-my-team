// set the dimensions and paddings of the graph
var padding = {
  top: 20, 
  right: 20, 
  bottom: 100, 
  left: 50
}
var width = 900;
var height = 500;
// var border = 1;
// var borderColor = 'black';

var playerArr = [];

d3.tsv('./player_data.tsv', function(file){
  playerArr = file;

  //sort by number of matches
  playerArr.sort(function(a,b) { return a.Matches - b.Matches});

  console.log(playerArr)

  var barPadding = 5;
  var barWidth = width / playerArr.length - barPadding; //fix here
  

  var yMax = d3.max(playerArr.map(d => d3.max(d.Matches)));
  //make the yMax 1 more than the greatest number of matches
  yMax++;

  var yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height - padding.top - padding.bottom, 0])

  //x Axis 
  var xScale = d3.scaleBand()
    .domain(playerArr.map(d => d.Player))
    .range([0 + padding.left, width - padding.right])
    .padding(0.1);

  d3.select('svg')
      .attr('width', width)
      .attr('height', height)
      // .attr('border', border)

  /*TITLE: http://www.d3noob.org/2013/01/adding-title-to-your-d3js-graph.html*/
  d3.select('svg')
    .append("text")
      .attr("x", ((width - padding.right - padding.left) / 2))             
      .attr("y", padding.top)
      .attr("text-anchor", "middle")  
      .style("font-size", "16px")   
      .text("Matches");

  d3.select('svg')
    .selectAll('rect')
    .data(playerArr) 
    .enter()
    .append('rect')
      .attr('x', (d, i) => (barWidth + barPadding) * i + padding.left)
      .attr('y', d => yScale(d.Matches))
      .attr('width', barWidth)
      .attr('height', d => height - yScale(d.Matches) - padding.bottom)
      .style('fill', 'red')



  //limit ticks to whole numbers?? 
  var yAxis = d3.axisLeft(yScale)
              .tickFormat(d3.format('d'))

  var xAxis = d3.axisBottom(xScale);

  //add the x Axis
  d3.select('svg')
    .append('g')
      .attr('transform', 'translate(' + padding.left + ", " + (height - padding.bottom) + ")")
      .call(xAxis)
      .selectAll('text')
        .style('text-anchor', 'end') //ensures end of label is attached to the axis tick
        .attr('dx', '-.8em')
        .attr('dy', '-.15em')
        .attr('transform', 'rotate(-90)');//'rotate(-65)');

  //add the y Axis
  d3.select('svg')
    .append('g')
      .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')') //shifts axis
      .call(yAxis)

})