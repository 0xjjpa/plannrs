//Week 32 Non-Epics 
//https://centralway.atlassian.net/rest/api/latest/search?jql=PROJECT%20in%20(Web,%20C-App)%20AND%20assignee%20in%20(jose.perez,%20jorge.gonzalez,%20peter.braden)%20AND%20(status%20not%20in%20(Done,%20Closed)%20OR%20sprint%20in%20(openSprints(),%20futureSprints()))%20AND%20issuetype%20!=%20Epic%20ORDER%20BY%20Rank%20ASC&maxResults=100
//Week 32 Epics
//https://centralway.atlassian.net/rest/api/latest/search?jql=PROJECT%20in%20(Web,%20C-App)%20AND%20assignee%20in%20(jose.perez,%20jorge.gonzalez,%20peter.braden)%20AND%20(status%20not%20in%20(Done,%20Closed)%20OR%20sprint%20in%20(openSprints(),%20futureSprints()))%20AND%20issuetype%20=%20Epic%20ORDER%20BY%20Rank%20ASC

var EPICS_URL = 'https://centralway.atlassian.net/rest/api/latest/search?jql=PROJECT%20in%20(Web,%20C-App)%20AND%20assignee%20in%20(jose.perez,%20jorge.gonzalez,%20peter.braden)%20AND%20(status%20not%20in%20(Done,%20Closed)%20OR%20sprint%20in%20(openSprints(),%20futureSprints()))%20AND%20issuetype%20=%20Epic%20ORDER%20BY%20Rank%20ASC';
var NONEPICS_URL = 'https://centralway.atlassian.net/rest/api/latest/search?jql=PROJECT%20in%20(Web,%20C-App)%20AND%20assignee%20in%20(jose.perez,%20jorge.gonzalez,%20peter.braden)%20AND%20(status%20not%20in%20(Done,%20Closed)%20OR%20sprint%20in%20(openSprints(),%20futureSprints()))%20AND%20issuetype%20!=%20Epic%20ORDER%20BY%20Rank%20ASC&maxResults=100';

var JIRA_REQUEST = {
  xhrFields: {
    withCredentials: true
  },
  type: 'GET',
  dataType: 'json',
  contentType: 'application/json'
}

/*
* Set day of the month.
* moment().date(12)
*/
var START_END_DATE = moment().date(18);
var LIMIT_END_DATE = moment().date(22);


var generateDates = function(dueDate) {
  var tmp = START_END_DATE.clone(), dates = {}, unixDate, count = 0;
  while(tmp.isBefore(dueDate) && tmp.isBefore(LIMIT_END_DATE)) {
    count++;
    unixDate = tmp.format('X');
    dates[unixDate] = true;
    tmp.add(1, 'days');
  }
  return dates;
}

var generateValuesFromIssues = function(issuesArray) {
  var values = {}, issue, value;
  var start = START_END_DATE.clone();
  var end = LIMIT_END_DATE.clone();
  while(start.isBefore(end)) {
    for(var i = 0, len = issuesArray.length; i < len; i++) {
      issue = issuesArray[i];
      if(issue.dates[start.format('X')]) {
        value = values[start.format('X')] ? value + issue.storyPoints : issue.storyPoints;
        values[start.format('X')] = value;
      } else {
        if(!values[start.format('X')]) {
         values[start.format('X')] = 0;
        }
      }
    }
    start.add(1, 'days');
  }
  var aggregatedValueArray = [], pairedValue;
  for (var aggregatedValue in values) { 
    if(values.hasOwnProperty(aggregatedValue)) {
      pairedValue = [];
      pairedValue[0] = aggregatedValue*1000;
      pairedValue[1] = values[aggregatedValue];
      aggregatedValueArray.push(pairedValue);
    }
  }
  return aggregatedValueArray;
}

JIRA_REQUEST.url = 'http://localhost:8080/api/proxy';
JIRA_REQUEST.data = {url: EPICS_URL};
JIRA_REQUEST.success = epicsSucessCallBack;

console.log(JIRA_REQUEST);
$.ajax(JIRA_REQUEST);

function epicsSucessCallBack(epics){
  console.log(epics)
  //customfield_10901 - Summary
  var epicsHashMap = {};
  epics.issues.forEach(function(epic){
    epicsHashMap[epic.key] = {
      name: epic.fields.customfield_10901,
      summary: epic.fields.summary,
      issues: []
    }
  });


  JIRA_REQUEST.url = 'http://localhost:8080/api/proxy';
  JIRA_REQUEST.data = {url: NONEPICS_URL};
  JIRA_REQUEST.success = function(nonepics) {
  //customfield_10900 - Epic Links
  //customfield_10105 - Story Points
  var issuesArray = [], issueObject, maxDate = moment(), epicMatchedIssue;
  nonepics.issues.forEach(function(issue) {
    issueObject = {};
    //Saving only the issues that have Epics & Story Points
    if(issue.fields.customfield_10900 && issue.fields.customfield_10105) {
      issueObject['epicKey'] = issue.fields.customfield_10900;
      issueObject['storyPoints'] = issue.fields.customfield_10105;
      //Saving only the issues that have a dueDate
      if(issue.fields.duedate) {
        issueObject['dates'] =  generateDates(moment(issue.fields.duedate));
        issueObject['summary'] =  issue.fields.summary;
      }
      epicMatchedIssue = epicsHashMap[issueObject['epicKey']];
      if(epicMatchedIssue) {
        epicMatchedIssue.issues.push(issueObject);
      }
    }
  });

  var weeklyReport = [], report;

  for (var epic in epicsHashMap) {
    if(epicsHashMap.hasOwnProperty(epic)) {
      // Only reporting Epics with issues in it
      if(epicsHashMap[epic].issues.length > 0) {
        report = {};
        report.key = epicsHashMap[epic].name;
        report.values = generateValuesFromIssues(epicsHashMap[epic].issues);
        weeklyReport.push(report);
      }
    }
  }

  drawGraph(weeklyReport);

  };

  $.ajax(JIRA_REQUEST);
};

function drawGraph(weeklyReportData) {
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
        .datum(weeklyReportData)
        .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  
}