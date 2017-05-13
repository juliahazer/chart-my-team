// set the dimensions and margins of the graph
var margin = {
  top: 20, 
  right: 100, 
  bottom: 110, 
  left: 50
}
var width = 900 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var playerArr = [];

d3.tsv('./player_data.tsv', function(file){
  playerArr = file;

  var totalTeamWins = playerArr.reduce(function(acc, el){
    return acc + Number(el.Win);
  }, 0);

  var totalTeamLoss = playerArr.reduce(function(acc, el){
    return acc + Number(el.Loss);
  }, 0);

  var totalTeamPlays = totalTeamWins + totalTeamLoss;
  var teamWinPercent = Math.round(totalTeamWins / totalTeamPlays * 100);
  var teamLossPercent = Math.round(totalTeamLoss / totalTeamPlays * 100);

  //this converts the Defaults "-" to "0"
  playerArr.map(function(el){
    if (el.Defaults === "-"){
      el.Defaults = '0'
    }
    if (el["Win %"] !== "-"){
      el["Win %"] = parseInt(el["Win %"])
    }  
    if (el.Doubles === "-"){
      el.Doubles = '0'
    }
    if (el.Singles === "-"){
      el.Singles = '0'
    }
    return el
  })

  // console.log(playerArr)

  //http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
  var tooltip = d3.select("body")
                  .append("div")
                  .classed('tooltip', true)
                  .style("opacity",0);

  var yMax;

  var xScale;
  var yScale;
  var zScale;

  //array of all the keys in the player array (e.g., Player, City, etc)
  var keys = playerArr.columns.slice(1);


  d3.select('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
  
  var g = d3.select('svg')
    .append('g')
      .attr('transform', 'translate(' + margin.left + "," + margin.top + ")");

  //ON FIRST LOAD, DRAW TITLE & DISPLAY MATCHES
  drawTitle();
  drawChart('Matches');

  function drawChart(type){
    var colorArr = [];
    var keysArr = [];

    //type is based on the select values (event listener)
    if (type === 'Matches'){
      colorArr = ['black', 'red', 'green'];
      //Default, Loss, Win
      keysArr = [keys[8], keys[17], keys[16]];
    } else if (type === 'Win'){
      colorArr = ['green'];
      keysArr = [keys[16]];
    } else if (type === 'Loss'){
      colorArr = ['red'];
      keysArr = [keys[17]];
    } else if (type === 'Singles'){
      colorArr = ['blue'];
      keysArr = [keys[10]];
    } else if (type === 'Doubles'){
      colorArr = ['pink'];
      keysArr = [keys[11]];
    } else if (type === 'SinglesDoubles'){
      colorArr = ['blue', 'pink'];
      keysArr = [keys[10], keys[11]];
    } else if (type === 'WinPercentage'){
      colorArr = ['yellow'];
      keysArr = [keys[9]];
    }
    
    //sort by y-axis value (and if same values, then sort by last name alphabetically)
    if (type === 'SinglesDoubles'){
      playerArr.sort(function(a,b) { 
        return a.Matches - b.Matches || a.Player.localeCompare(b.Player);
      });
      yMax = d3.max(playerArr.map(d => d3.max(d['Matches'])));
    } else if (type === 'WinPercentage'){
      playerArr.sort(function(a,b) {
        return a['Win %'] - b['Win %'] || a.Player.localeCompare(b.Player);
      });
      yMax = 100;
    } else {
      playerArr.sort(function(a,b) { 
        return a[type] - b[type] || a.Player.localeCompare(b.Player);
      });
      yMax = d3.max(playerArr.map(d => d3.max(d[type])));
    }

    //make the yMax 1 more than the greatest number value
    if (yMax !== 100){
      yMax++;
    }

    xScale = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.2)
      .align(0.1);
    xScale.domain(playerArr.map(d => d.Player));
    
    yScale = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, yMax]);

    zScale = d3.scaleOrdinal()
      .range(colorArr);

    g.append('g')
        .attr('class', 'chart') //NEED TO CHANGE
      .selectAll('g')
      .data(d3.stack().keys(keysArr)(playerArr))
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
          return xScale(d.data.Player) 
        })
        .attr('y', d => {
          return yScale(d[1])
        })
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
      .on('mouseenter', function(d){
        tooltipDrawText(d);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
    
    drawMatchLegend(keysArr);

    drawXAxis();
    drawYAxis();
  }

  function drawMatchLegend(keys){
    var legend = g.append('g')
        .attr('class', 'legendMatches')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
      .selectAll('g')
      .data(keys.slice().reverse())
      .enter()
      .append('g')
        .attr('transform', (d, i) =>{
          return "translate(0, " + i*20 + ")"
        });

    legend.append('rect')
        .attr('x', width+margin.left+19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', zScale);

    legend.append('text')
        .attr('x', width+margin.left+10)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(d => d);
  }

  function tooltipDrawText(d){
    tooltip.html(`
      ${d.data.Player}<br>
      Win: ${d.data["Win %"]}%<br>
      # Singles: ${d.data.Singles}<br>
      # Doubles: ${d.data.Doubles}<br>
      City: ${d.data.City}<br>
      Rating: ${d.data.Rating}`
    )
          .style('opacity', 1)
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 'px');
  }

  function drawTitle(){
    d3.select('svg')
      .append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px")   
        .text("Team");
  }

  function drawXAxis(){
    var xAxis = d3.axisBottom(xScale);
    //add the x Axis
    d3.select('svg')
      .append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ")")
        .call(xAxis)
        .selectAll('text')
          .style('text-anchor', 'end') //ensures end of label is attached to the axis tick
          .attr('dx', '-.8em')
          .attr('dy', '-.15em')
          .attr('transform', 'rotate(-50)');//'rotate(-65)');
  }

  function drawYAxis(){
    var numTicks = yMax;
    if (yMax === 100){
      numTicks = 10; 
    }
    var yAxis = d3.axisRight(yScale)
                  .ticks(numTicks);
    //add the y Axis
    d3.select('svg')
      .append('g')
        .attr('class', 'yAxis')
        .attr('transform', 'translate(' + (width + margin.left) + ',' + margin.top + ')') //shifts axis
        .call(yAxis)
  }

  //EVENT LISTENER FOR SELECT CHANGE
  d3.select('select').on('change', function(){
    var newVal = d3.select('select').property('value');
    removeChart();
    drawChart(newVal);
  })

  function removeChart(){
    var svg = d3.select('svg');

    svg.select('.chart')
        .remove(); 
    removeAxes();
    removeLegend();
  }

  function removeAxes(){
    d3.select('svg')
      .select('.xAxis')
        .remove()
    d3.select('svg')
      .select('.yAxis')
        .remove()
  }

  function removeLegend(){
    d3.select('svg')
      .select('.legendMatches')
        .remove()
  }

})