angular.module('plannrs')
  .service('mainService', ['$http', '$q', 'localStorageService', 'API_URL', function($http, $q, localStorageService, API_URL) {
    var self = this;

    var _isPreviouslyStored = function(key, defer) {
      var storedValue = localStorageService.get(key)
      if(storedValue) {
        defer.resolve(storedValue);
        return true;
      } else {
        return false
      }
    }

    var _postHTTPOperations = function(url, key, defer, body) {
      $http({method: 'POST', url: API_URL, params: {url:url, body: body}}).success(function(response) {
        //localStorageService.set(key, response);
        defer.resolve(response);
      }).error(function(error) {
        defer.reject(error);
      });
    }

    var _getHTTPOperation = function(url, key, defer) {
      $http({method: 'GET', url: API_URL, params:{url:url}}).success(function(response) {
        localStorageService.set(key, response);
        defer.resolve(response);
      }).error(function(error) {
        defer.reject(error);
      });
    }

    var _executeSmartAPIRetrieval = function(url, key, defer) {
      if(!_isPreviouslyStored(key, defer)) {
        _getHTTPOperation(url, key, defer);
      }
      return defer.promise
    }

    var _getURLFromJQLQuery = function(query) {
      return '/search?jql='+encodeURI(query);
    }

    self.getComponents = function() {
      var key = 'GET_COMPONENTS',
          url = '/project/11903/components', // “CWCOM Project”
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.getVersions = function() {
      var key = 'GET_VERSIONS',
          url = '/project/11903/versions', // “CWCOM Project”
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.getProjects = function() {
      var key = 'GET_PROJECTS',
          url = '/project',
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.getEpics = function() {
      var key = 'GET_EPICS',
          url = _getURLFromJQLQuery('issuetype = Epic and project = CWCOM and status = Open'),
          defer = $q.defer();
      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.createTicket = function(ticketData) {
      var queryData = {},
          fields = queryData.fields = {},
          url = '/issue',
          defer = $q.defer();

      //IssueType
      fields.issuetype = {}
      fields.issuetype.id = ticketData.selectedIssueTypeId;
      //Project
      fields.project = {}
      fields.project.id = ticketData.selectedProjectId;
      //Summary
      fields.summary = "Review backlog";
      //Assignee
      fields.assignee = {};
      fields.assignee.name = ticketData.selectedAssignee;
      //Reporter
      fields.reporter = {};
      fields.reporter.name = ticketData.selectedReporter;
      //Priority
      fields.priority = {}
      fields.priority.id = ticketData.selectedPriorityId;
      //Security
      fields.security = {}
      fields.security.id = ticketData.selectedSecurityId;
      //DueDate
      fields.duedate = ticketData.selectedDueDate;
      //Components
      fields.components = []
      fields.components.push({id:ticketData.selectedComponentId});
      //Versions (affectedVersions)
      fields.versions = [];
      fields.versions.push({id:ticketData.selectedAffectedVersionId});
      //fixVersions
      fields.fixVersions = []
      fields.fixVersions.push({id:ticketData.selectedFixVersionId});
      //labels
      fields.labels = []
      fields.labels.push(ticketData.selectedLabel);
      fields.labels.push('PendingReview')
      //epic
      fields.customfield_10900 = ticketData.selectedEpicKey;
      console.log(queryData)
      return _postHTTPOperations(url, null, defer,queryData);
    }

    return self;
}])