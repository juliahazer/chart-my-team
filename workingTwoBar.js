// set the dimensions and margins of the graph
var margin = {
  top: 20, 
  right: 20, 
  bottom: 110, 
  left: 50
}
var width = 900 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var playerArr = [];

d3.tsv('./player_data.tsv', function(file){
  playerArr = file;

  //sort by number of matches (and if matches are the same then sort by last name alphabetically)
  playerArr.sort(function(a,b) { 
    return a.Matches - b.Matches || a.Player.localeCompare(b.Player);
  });

  //console.log(playerArr)

  // var barPadding = 5;
  // var barWidth = width / playerArr.length - barPadding;

  var yMax = d3.max(playerArr.map(d => d3.max(d.Matches)));
  //make the yMax 1 more than the greatest number of matches
  yMax++;

  var xScale = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.2)
      .align(0.1);

  var yScale = d3.scaleLinear()
        // .rangeRound([height, 0]);
      .rangeRound([height+margin.top, margin.top]);

  xScale.domain(playerArr.map(d => d.Player));
  yScale.domain([0, yMax])

  // var yScale = d3.scaleLinear()
  //   .domain([0, yMax])
  //   .range([height+margin.top, margin.top])

  //x Axis 
  // var xScale = d3.scaleBand()
  //   .domain(playerArr.map(d => d.Player))
  //   .range([0, width])
    // .padding(0.1);

  var zScale = d3.scaleOrdinal()
    .range(['red', 'yellow']);

  //array of all the keys in the player array (e.g., Player, City, etc)
  var keys = playerArr.columns.slice(1);
  
  //Win and Loss
  var winLossKeys = [keys[16], keys[17]];
  // console.log(winLossKeys)
  // zScale.domain(winLossKeys);

  // var dataIntermediate = winLossKeys.map(function(el){
  //   return playerArr.map(function(elem){
  //     return {x: elem.Player, y: elem[el]};
  //   })
  // })

  // console.log(dataIntermediate)

  d3.select('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
  
  var g = d3.select('svg')
    .append('g')
      .attr('transform', 'translate(' + margin.left + "," + margin.top + ")");

  g.append('g')
    .selectAll('g')
    .data(d3.stack().keys(winLossKeys)(playerArr))
    .enter()
    .append('g')
      .attr('fill', function(d){
        return zScale(d.key);
      })
    .selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
      .attr('x', d => {
        return xScale(d.data.Player) - margin.left 
      })
      .attr('y', d => {
        // console.log(yScale(d[1]))
        return yScale(d[1]) - margin.top
      })
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth());

// console.log(d3.stack().keys(winLossKeys)(playerArr));


  /*TITLE: http://www.d3noob.org/2013/01/adding-title-to-your-d3js-graph.html*/
  d3.select('svg')
    .append("text")
      .attr("x", (width / 2))             
      .attr("y", margin.top)
      .attr("text-anchor", "middle")  
      .style("font-size", "16px")   
      .text("Matches");

  // d3.select('svg')
  // layer.selectAll('rect')
  //   .data(function(d){
  //     return d;
  //   })
  //   .enter()
  //   .append('rect')
  //   .attr('x', function)

  // //.selectAll('rect')
  //   .data(playerArr) 
  //   .enter()
  //   .append('rect')
  //     .attr('x', (d, i) => (barWidth + barPadding) * i)
  //     .attr('y', d => yScale(d.Matches - d.Win))
  //     .attr('width', barWidth)
  //     .attr('height', d => height + margin.top - yScale(d.Loss))
  //     .style('fill', 'red')
  
  // d3.select('svg')
  //   .selectAll('rect')
  //   .data(playerArr) 
  //   .enter()
  //   .append('rect')
  //     .attr('x', (d, i) => (barWidth + barPadding) * i)
  //     .attr('y', d => yScale(d.Matches))
  //     .attr('width', barWidth)
  //     .attr('height', d => height + margin.top - yScale(d.Win))
  //     .style('fill', 'yellow')


  //limit ticks to whole numbers?? 
  var yAxis = d3.axisRight(yScale)
                //.ticks(yMax);
              // .tickFormat(d3.format('d'))

  var xAxis = d3.axisBottom(xScale);

  //add the x Axis
  d3.select('svg')
    .append('g')
      .attr('transform', 'translate(0,' + (height + margin.top) + ")")
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