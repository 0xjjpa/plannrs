//Week 32 Non-Epics 
//https://centralway.atlassian.net/rest/api/latest/search?jql=PROJECT%20in%20(Web,%20C-App)%20AND%20assignee%20in%20(jose.perez,%20jorge.gonzalez,%20peter.braden)%20AND%20(status%20not%20in%20(Done,%20Closed)%20OR%20sprint%20in%20(openSprints(),%20futureSprints()))%20AND%20issuetype%20!=%20Epic%20ORDER%20BY%20Rank%20ASC&maxResults=100
//Week 32 Epics
//https://centralway.atlassian.net/rest/api/latest/search?jql=PROJECT%20in%20(Web,%20C-App)%20AND%20assignee%20in%20(jose.perez,%20jorge.gonzalez,%20peter.braden)%20AND%20(status%20not%20in%20(Done,%20Closed)%20OR%20sprint%20in%20(openSprints(),%20futureSprints()))%20AND%20issuetype%20=%20Epic%20ORDER%20BY%20Rank%20ASC


$.getJSON('week32_nonepics.json', function(nonepics) {
  //customfield_10900 - Epic Links
  var issuesArray = [], issueObject;
  nonepics.issues.forEach(function(issue) {
    issueObject = {};
    issueObject['dueDate'] = moment(issue.fields.duedate);
    issuesArray.push(issueObject);
  });
  $.getJSON('week32_epics.json', function(epics){
    //customfield_10901 - Summary
    var epicsHashMap = {};
    epics.issues.forEach(function(epic){
      epicsHashMap[epic.key] = {
        name: epic.fields.customfield_10901,
        summary: epic.fields.summary
      }
    });
    console.log(epicsHashMap);
    console.log(issuesArray);
  })
});



d3.json('stackedAreaData.json', function(data) {
  nv.addGraph(function() {
    var chart = nv.models.stackedAreaChart()
                  .margin({right: 100})
                  .x(function(d) { return d[0] })   //We can modify the data accessor functions...
                  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
                  .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
                  .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
                  .transitionDuration(500)
                  .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                  .clipEdge(true);

    //Format x-axis labels with custom function.
    chart.xAxis
        .tickFormat(function(d) { 
          return d3.time.format('%x')(new Date(d)) 
    });

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('.jumbotron svg')
      .datum(data)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
})