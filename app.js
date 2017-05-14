// set the dimensions and margins of the graph
var margin = {
  top: 60, 
  right: 120, 
  bottom: 160, 
  left: 80
}

var width = 900 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

//will hold all the data from the .tsv file
var teamsArr = [];
var teamsObj = {};
var playerArr = [];

var optionHtml = '';
var optionArr = [];

var chartId;

var teamName = '';
var area = '';
var season = '';

var totalTeamWins;
var totalTeamLoss;
var totalTeamPlays;
var teamWinPercent;
var teamLossPercent;
var tooltip;

var yMax;
var xScale;
var yScale;
var zScale;

var keys;

var g;

d3.tsv('./player_data.tsv', function(file){
  teamsArr = file;

  teamsObj = teamsArr.reduce(function(acc, el){
    var currTeamId = el["Team ID"];
    if (acc[currTeamId] === undefined){
      acc[currTeamId] = [el];
    } else {
      acc[currTeamId].push(el)
    }
    return acc
  }, {});

  for (var prop in teamsObj) {
    var currTeamName = teamsObj[prop][0]["Team Name"];
    optionArr.push([currTeamName, prop]);
  } 

  //sort teams alphabetically
  optionArr.sort(function(a,b){
    return (a[0] < b[0]) ? -1 : 1;
  });

  for (var i = 0; i < optionArr.length; i++){
    //for each unique team, add id & team name
    //into option tags for select 
    optionHtml += `
      <option value='${optionArr[i][1]}'>
      ${optionArr[i][0]}</option>
    `;
  }

  d3.select('#selectTeams')
      .html(optionHtml)

  d3.select('#selectTeams')
      .classed('hidden', false)

  newTeamId(optionArr[0][1])

  function newTeamId(chartId){
    //SET TO THE FIRST TEAMS OBJ
    //NEED TO UPDATE THIS ID IF CHANGE
    playerArr = teamsObj[chartId];

    teamName = playerArr[0]["Team Name"];
    area = playerArr[0]["Area"];
    season = playerArr[0]["Season"]

    totalTeamWins = playerArr.reduce(function(acc, el){
          return acc + Number(el.Won);
        }, 0);
    totalTeamLoss = playerArr.reduce(function(acc, el){
          return acc + Number(el.Lost);
        }, 0);
    totalTeamPlays = totalTeamWins + totalTeamLoss;
    teamWinPercent = Math.round(totalTeamWins / totalTeamPlays * 100);
    teamLossPercent = Math.round(totalTeamLoss / totalTeamPlays * 100);

    //this converts some of the "-" fields to "0"
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

    tooltip = d3.select("body")
                    .append("div")
                    .classed('tooltip', true)
                    .style("opacity",0);

    //array of all the keys in the player array (e.g., Player, City, etc)
    keys = teamsArr.columns.slice(1);

    d3.select('.svgChart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .classed('svgClass', true)
    
    g = d3.select('.svgChart')
      .append('g')
        .attr('transform', 'translate(' + margin.left + "," + margin.top + ")");

    //ON FIRST LOAD CALL REMOVE CHART 
    //TO first remove any previous chart & draw new one
    removeChart('Matches');
  }

  /******************EVENT LISTENERS*********************/
  //when change select dropdown option
  //initiate a new team to draw the chart
  d3.select('#selectTeams').on('change', function(){
    var optionVal = d3.select('#selectTeams').property('value');
    newTeamId(optionVal);
  })

  //draw different charts based on which button is clicked
  d3.selectAll('.btnCustom').on('click', function(){
    d3.selectAll('.btnCustom')
      .classed('active', false);
    d3.event.preventDefault();
    d3.select(this)
      .classed('active', true)
    var newVal = d3.select(this).attr('data-val');
    removeChart(newVal);
  })

  /******************FUNCTIONS*********************/
  function drawChart(type){

    var colorArr = [];
    var keysArr = [];
    var chartTitle = "# ";
    // var chartSubTitle = "";

    //type is based on the select values (event listener)
    if (type === 'Matches'){
      colorArr = ['#A8927B', '#564036', '#EF7D5A'];
      //Default, Loss, Win
      keysArr = [keys[8], keys[17], keys[16]];
      chartTitle += "Matches Won / Lost (by Player)";
    } else if (type === 'Won'){
      colorArr = ['#EF7D5A'];
      keysArr = [keys[16]];
      chartTitle += "Matches Won (by Player)";
    } else if (type === 'Lost'){
      colorArr = ['#564036'];
      keysArr = [keys[17]];
      chartTitle += "Matches Lost (by Player)"
    } else if (type === 'Singles'){
      colorArr = ['#516EBA'];
      keysArr = [keys[10]];
      chartTitle += "Singles Matches Played (by Player)";
    } else if (type === 'Doubles'){
      colorArr = ['#E3C247'];
      keysArr = [keys[11]];
      chartTitle += "Doubles Matches Played (by Player)";
    } else if (type === 'SinglesDoubles'){
      colorArr = ['#516EBA', '#E3C247'];
      keysArr = [keys[10], keys[11]];
      chartTitle += "Singles / Doubles Matches Played (by Player)"
    } else if (type === 'WinPercentage'){
      colorArr = ['#EF7D5A'];
      keysArr = [keys[9]];
      chartTitle = "Match Win Percentage (by Player)"
    }

    chartTitle += "*"

    drawTitle(chartTitle);
        //DRAW TEAM NAME
    drawTeamName();
    drawChartFooter();
    
    //sort by y-axis value (and if same values, then sort by last name alphabetically)
    if (type === 'SinglesDoubles'){
      playerArr.sort(function(a,b) { 
        return Number(a.Matches) - Number(b.Matches) || a.Player.localeCompare(b.Player);
      });
      yMax = d3.max(playerArr.map(d => {
        str_data = d['Matches'];
        num_data = Number(d['Matches']);
        return num_data;
      }));
    } else if (type === 'WinPercentage'){
      playerArr.sort(function(a,b) {
        return a['Win %'] - b['Win %'] || a.Player.localeCompare(b.Player);
      });
      yMax = 100;
    } else {
      playerArr.sort(function(a,b) { 
        return Number(a[type]) - Number(b[type]) || a.Player.localeCompare(b.Player);
      });
      yMax = d3.max(playerArr.map(d => {
        str_data = d[type]
        num_data = Number(d[type])
        return num_data
        //return d3.max(num_data);
      }));
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
        .style('opacity', 0)
        .attr('class', 'bar')
        .attr('x', d => {
          return xScale(d.data.Player) 
        })
        .attr('y', d => {
          return yScale(d[1])
        })
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
      .on('mouseenter', function(d){
        drawTooltipText(d);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    /*add transition effects to fade in*/
    g.selectAll('rect')
      .transition()
      .duration(800)
      .ease(d3.easeLinear)
      .style('opacity', 1);

    //call to functions
    drawLegend(keysArr);
    drawXAxis();
    drawYAxis();
  }

  function drawLegend(keys){
    var legend = g.append('g')
        .attr('class', 'legend')
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
        .attr('x', width+85)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', zScale);

    legend.append('text')
        .attr('x', width+80)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(d => d);
  }

  function drawTooltipText(d){
    tooltip.html(`
      ${d.data.Player}<br>
      ${d.data["Win %"]}% Win<br> 
      Won: ${d.data.Won}; Lost: ${d.data.Lost}<br>
      ${d.data.Singles} Singles Played<br>
      ${d.data.Doubles} Doubles Played<br>
      City: ${d.data.City}<br>
      Rating: ${d.data.Rating}`
    )
          .style('opacity', 1)
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 'px');
  }

  function drawTeamName(){
    //first remove old team name
    d3.select('.teamName')
      .remove();
    //then draw the new team name
    d3.select('.svgChart')
      .append('text')
        .attr('class', 'teamName')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', margin.top / 2)
        .attr("text-anchor", "middle")
        .text(teamName)
  }

  function drawChartFooter(){
    //first remove old footer
    d3.select('.chartFooter')
      .remove();
    //then draw the new one
    d3.select('.svgChart')
      .append('text')
        .attr('class', 'chartFooter')
        .attr('x', margin.left + 10)
        .attr('y', height + margin.top + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("*Data from USTA NorCal")
  }

  function drawTitle(title){
    //first remove old title
    d3.select('.chartTitle')
      .remove();
    //then draw the new chart title
    d3.select('.svgChart')
      .append("text")
        .attr('class', 'chartTitle')
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", margin.top-5)
        .attr("text-anchor", "middle")
        .text(title);
  }

  function drawXAxis(){
    var xAxis = d3.axisBottom(xScale);
    //add the x Axis
    d3.select('.svgChart')
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
    d3.select('.svgChart')
      .append('g')
        .attr('class', 'yAxis')
        .attr('transform', 'translate(' + (width + margin.left) + ',' + margin.top + ')') //shifts axis
        .call(yAxis)
  }


  function removeChart(newVal){
    var svg = d3.select('.svgChart');

    svg.select('.chart')
        .style('opacity', 1)
        /*add transition effects to fade out*/
        .transition().duration(300).ease(d3.easeLinear).style('opacity', 0)
        .remove();
        setTimeout(function(){
          removeAxes();
          removeLegend();
          drawChart(newVal)
        }, 300); 
  }

  function removeAxes(){
    d3.select('.svgChart')
      .select('.xAxis')
        .remove()
    d3.select('.svgChart')
      .select('.yAxis')
        .remove()
  }

  function removeLegend(){
    d3.select('.svgChart')
      .select('.legend')
        .remove()
  }

})