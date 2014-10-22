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

    return self;
}]);
    
