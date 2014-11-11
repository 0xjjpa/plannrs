angular.module('plannrs')
  .service('ticketProcessorService', ['mainService', function(mainService) {
    var self = this;

    _retrieveTotalStoryPointsFromIssues = function(issues) {
      var totalStoryPoints = 0;
      angular.forEach(issues, function(issue) {
        if(issue.fields && issue.fields.customfield_10105) {
          totalStoryPoints += issue.fields.customfield_10105
        }
      });
      return totalStoryPoints
    }

    _retrieveLabelsFromIssues = function(issues) {
      var labels = {};
      angular.forEach(issues, function(issue) {
        if(issue.fields && issue.fields.labels && issue.fields.labels.length > 0) {
          angular.forEach(issue.fields.labels, function(label) {
            labels[label] = labels[label] ? labels[label]+1 : 1;
            console.log('Labels', label)
          })
        }
      });
      console.log(labels);
      return labels
    }


    self.getTotalStoryPoints = function(jqlQuery, ui) {
      var promise = mainService.getJQLQuery(jqlQuery);
      promise.then(function(response) {
        if(response.errorMessages) {
          ui.jqlQueryProcessingResult = 'Error on JQL'
        } else {
          ui.jqlQueryProcessingResult = _retrieveTotalStoryPointsFromIssues(response.issues) + ' Story Points';
        }
      });
    }

    self.getTotalLabels = function(jqlQuery, ui) {
      var promise = mainService.getJQLQuery(jqlQuery);
      promise.then(function(response) {
        if(response.errorMessages) {
          ui.jqlQueryProcessingResult = 'Error on JQL'
        } else {
          ui.jqlQueryProcessingResult = _retrieveLabelsFromIssues(response.issues) + ' Story Points';
        }
      });
    }

    return self;
}]);
    
