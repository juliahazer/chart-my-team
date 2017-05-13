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

  console.log(playerArr)

  //http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
  var tooltip = d3.select("body")
                  .append("div")
                  .classed('tooltip', true)
                  .style("opacity",0);

  var yMax = d3.max(playerArr.map(d => d3.max(d.Matches)));
  //make the yMax 1 more than the greatest number of matches
  yMax++;

  var xScale = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.2)
      .align(0.1);

  var yScale = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, yMax])

  var zScale;
  // var zScale = d3.scaleOrdinal()
    // .range(['black', 'red', 'green']);

  //array of all the keys in the player array (e.g., Player, City, etc)
  var keys = playerArr.columns.slice(1);
  
  //Default, Loss, Win
  var winLossKeys = [keys[8], keys[17], keys[16]];
  var doublesKeys = [keys[11]];
  var singlesKeys = [keys[10]];
  var singlesDoublesKeys = [keys[10], keys[11]];
  // console.log(winLossKeys);
  // console.log(doublesKeys);
  // console.log(singlesKeys);
  // console.log(singlesDoublesKeys);

  d3.select('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
  
  var g = d3.select('svg')
    .append('g')
      .attr('transform', 'translate(' + margin.left + "," + margin.top + ")");

  //ON FIRST LOAD, DRAW TITLE & DISPLAY MATCHES
  drawTitle();
  drawMatches();

  function drawMatches(){
    //sort by number of matches (and if matches are the same then sort by last name alphabetically)
    playerArr.sort(function(a,b) { 
      return a.Matches - b.Matches || a.Player.localeCompare(b.Player);
    });

    xScale.domain(playerArr.map(d => d.Player));

    zScale = d3.scaleOrdinal()
      .range(['black', 'red', 'green']);

    g.append('g')
        .attr('class', 'matches')
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
          return xScale(d.data.Player) 
        })
        .attr('y', d => {
          return yScale(d[1])
        })
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
      .on('mouseenter', function(d){
        // console.log(d.data)
        tooltipDrawText(d);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
    
    drawMatchLegend(winLossKeys);

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

  function drawSingles(){
    //sort by number of singles (and if singles are the same then sort by last name alphabetically)
    playerArr.sort(function(a,b) { 
      return a.Singles - b.Singles || a.Player.localeCompare(b.Player);
    });

    xScale.domain(playerArr.map(d => d.Player));

    zScale = d3.scaleOrdinal()
      .range(['blue']);

    g.append('g')
        .attr('class', 'singles')
      .selectAll('g')
      .data(d3.stack().keys(singlesKeys)(playerArr))
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
          return yScale(d[1]) - margin.top
        })
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
      .on('mouseenter', function(d){
        // console.log(d.data)
        tooltipDrawText(d);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    drawMatchLegend(singlesKeys); 
    drawXAxis();
    drawYAxis();
  }

  function drawDoubles(){
    //sort by number of doubles (and if doubles are the same then sort by last name alphabetically)
    playerArr.sort(function(a,b) { 
      return a.Doubles - b.Doubles || a.Player.localeCompare(b.Player);
    });

    xScale.domain(playerArr.map(d => d.Player));

    zScale = d3.scaleOrdinal()
      .range(['pink']);

    g.append('g')
        .attr('class', 'doubles')
      .selectAll('g')
      .data(d3.stack().keys(doublesKeys)(playerArr))
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
          return yScale(d[1]) - margin.top
        })
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
      .on('mouseenter', function(d){
        // console.log(d.data)
        tooltipDrawText(d);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    drawMatchLegend(doublesKeys);  
    drawXAxis();
    drawYAxis();
  }

  function drawSinglesDoubles(){
    //sort by number of singles (and if singles are the same then sort by last name alphabetically)
    playerArr.sort(function(a,b) { 
      return a.Matches - b.Matches || a.Player.localeCompare(b.Player);
    });

    xScale.domain(playerArr.map(d => d.Player));

    zScale = d3.scaleOrdinal()
      .range(['blue', 'pink']);

    g.append('g')
        .attr('class', 'singlesDoubles')
      .selectAll('g')
      .data(d3.stack().keys(singlesDoublesKeys)(playerArr))
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
          return yScale(d[1]) - margin.top
        })
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
      .on('mouseenter', function(d){
        // console.log(d.data)
        tooltipDrawText(d);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    drawMatchLegend(singlesDoublesKeys);
    drawXAxis();
    drawYAxis();
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
    var yAxis = d3.axisRight(yScale)
                  .ticks(yMax);
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
    // yMax = d3.max(playerArr.map(d => d3.max(d[newVal])));

    if (newVal === 'Matches'){
      removeSingles();
      removeDoubles();
      removeSinglesDoubles();
      drawMatches();
    } else if (newVal === 'Singles'){
      removeMatches();
      removeDoubles();
      removeSinglesDoubles();
      drawSingles();
    } else if (newVal === 'Doubles'){
      removeMatches();
      removeSingles();
      removeSinglesDoubles();
      drawDoubles();
    } else if (newVal === 'SinglesDoubles'){
      // console.log('here')
      removeMatches();
      removeSingles();
      removeDoubles();
      drawSinglesDoubles();
    }

  })

  function removeMatches(){
    d3.select('svg')
      .select('.matches')
        .remove()
    removeAxes();
    removeLegend();
  }

  function removeDoubles(){
    d3.select('svg')
      .select('.doubles')
        .remove() 
    removeAxes(); 
    removeLegend();   
  }

  function removeSingles(){
    d3.select('svg')
      .select('.singles')
        .remove()  
    removeAxes();  
    removeLegend(); 
  }

  function removeSinglesDoubles(){
    d3.select('svg')
      .select('.singlesDoubles')
        .remove()
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