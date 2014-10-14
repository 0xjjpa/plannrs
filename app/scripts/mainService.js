angular.module('plannrs')
  .service('mainService', ['$http', '$q', 'localStorageService', 'API_URL', function($http, $q, localStorageService, API_URL) {
    var self = this;

    var _isPreviouslyStored = function(key, defer, ignoreCache) {
      if(ignoreCache) return false;
      var storedValue = localStorageService.get(key)
      if(storedValue) {
        defer.resolve(storedValue);  
        return true;
      } else {
        return false
      }
    }

    var _postHTTPOperations = function(url, key, defer, body) {
      $http({method: 'POST', url: API_URL, params: {url:url, body: angular.toJson(body)}}).success(function(response) {
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

    var _executeSmartAPIRetrieval = function(url, key, defer, ignoreCache) {
      if(!_isPreviouslyStored(key, defer, ignoreCache)) {
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

    self.getPriorities = function() {
      var key = 'GET_PRIORITIES',
          url = '/priority',
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.getEpics = function(ignoreCache) {
      var key = 'GET_EPICS',
          url = _getURLFromJQLQuery('issuetype = Epic and project = CWCOM and status != Closed'),
          defer = $q.defer();
      return _executeSmartAPIRetrieval(url, key, defer, ignoreCache);
    }

    self.getUnreviewedIssues = function(ignoreCache) {
      var key = 'GET_UNREVIEWEDISSUES',
          url = _getURLFromJQLQuery('labels in (PendingReview)'),
          defer = $q.defer();
      return _executeSmartAPIRetrieval(url, key, defer, ignoreCache);
    }

    self.createIssue = function(issueData) {
      var queryData = {},
          fields = queryData.fields = {},
          url = '/issue',
          defer = $q.defer();

      //IssueType
      fields.issuetype = {}
      fields.issuetype.id = issueData.selectedIssueTypeId;
      //Project
      fields.project = {}
      fields.project.id = issueData.selectedProjectId;
      //Summary
      fields.summary = issueData.summary;
      //Assignee
      fields.assignee = {};
      fields.assignee.name = issueData.selectedAssignee;
      //Reporter
      fields.reporter = {};
      fields.reporter.name = issueData.selectedReporter;
      //Priority
      fields.priority = {}
      fields.priority.id = issueData.selectedPriorityId;
      //Security
      fields.security = {}
      fields.security.id = issueData.selectedSecurityId;
      //DueDate
      fields.duedate = issueData.selectedDueDate;
      //Components
      fields.components = []
      fields.components.push({id:issueData.selectedComponentId});
      //Versions (affectedVersions)
      fields.versions = [];
      fields.versions.push({id:issueData.selectedAffectedVersionId});
      //fixVersions
      fields.fixVersions = []
      fields.fixVersions.push({id:issueData.selectedFixVersionId});
      //labels
      fields.labels = []
      fields.labels.push(issueData.selectedLabel);
      fields.labels.push('PendingReview')
      //epic
      fields.customfield_10900 = issueData.selectedEpicKey;
      return queryData;
      //return _postHTTPOperations(url, null, defer,queryData);
    }

    self.createBulkIssues = function(issues) {
      var issueBulkObject = {},
          issuesArray = [],
          url = '/issue/bulk',
          defer = $q.defer();
      
      angular.forEach(issues, function(issue){
        issuesArray.push(self.createIssue(issue));
      });

      issueBulkObject.issueUpdates = issuesArray;
      return _postHTTPOperations(url, null, defer, issueBulkObject);
    }

    return self;
}])