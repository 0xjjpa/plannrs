angular.module('plannrs')
  .service('mainService', ['$http', '$q', 'localStorageService', 'API_URL', function($http, $q, localStorageService, API_URL) {
    var self = this;

    //See https://confluence.cwc.io/display/CWCOM/Web+Label+System+Framework
    var _acceptedLabels = [
      '2014Q4WebDevOps','2014Q4WebFrontEnd','2014Q4WebTechnology','2014Q4WebOperations',
      'WebArchitectureDesign', 'WebSystem', 'WebUserStory', 'WebScenario',
      'WebBlocker','WebPlanning','WebWatcher',
      'WebLowScope','WebMediumScope','WebHighScope'
    ]

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
      return '/search?jql='+encodeURI(query)+'\&maxResults\=500';
    }

    self.getComponents = function() {
      var key = 'GET_COMPONENTS',
          url = '/project/11903/components', // “CWCOM Project”
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.getVersions = function(ignoreCache) {
      var key = 'GET_VERSIONS',
          url = '/project/11903/versions', // “CWCOM Project”
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer, ignoreCache);
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

    self.getIssueTypes = function() {
      var key = 'GET_ISSUETYPES',
          url = '/issuetype',
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.getEpics = function(ignoreCache) {
      var key = 'GET_EPICS',
          url = _getURLFromJQLQuery('issuetype = Epic and project = CWCOM and status != Closed'),
          defer = $q.defer();
      return _executeSmartAPIRetrieval(url, key, defer, ignoreCache);
    }

    self.getLabels = function(ignoreCache) {
      var key = 'GET_LABELS',
          defer = $q.defer();
      defer.resolve(_acceptedLabels);
      return defer.promise;
    }

    self.getUnreviewedIssues = function(ignoreCache) {
      var key = 'GET_UNREVIEWEDISSUES',
          url = _getURLFromJQLQuery('labels in (WebReview) and status not in (Closed,Resolved)'),
          defer = $q.defer();
      return _executeSmartAPIRetrieval(url, key, defer, ignoreCache);
    }

    self.getUsers = function() {
      var key = 'GET_USERS',
          url = '/user/assignable/search\?project\=CWCOM\&maxResults\=200',
          defer = $q.defer();

      return _executeSmartAPIRetrieval(url, key, defer);
    }

    self.getJQLQuery = function(jqlQuery) {
      var key = 'GET_JQL_QUERY',
          url = _getURLFromJQLQuery(jqlQuery),
          ignoreCache = true,
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
      fields.issuetype.id = issueData.selectedIssueTypeId || '3'; // “Task”

      if(fields.issuetype.id === "1") {//Bug
        fields.customfield_11503 = "See bug title"; // Actual Results
        fields.customfield_11501 = "See bug title"; // Steps Required
      }
      
      //Project
      fields.project = {}
      fields.project.id = issueData.selectedProjectId;
      //Summary
      fields.summary = issueData.summary;
      //Assignee
      fields.assignee = {};
      fields.assignee.name = issueData.selectedAssignee || "jose.perez";
      //Reporter
      fields.reporter = {};
      fields.reporter.name = issueData.selectedReporter || "jose.perez";
      //Priority
      fields.priority = {}
      fields.priority.id = issueData.selectedPriorityId;
      //Security
      fields.security = {}
      fields.security.id = issueData.selectedSecurityId;
      //DueDate
      fields.duedate = issueData.selectedDueDate;
      if(!fields.duedate) delete fields.duedate;
      //Components
      fields.components = issueData.selectedComponentId ? [{id:issueData.selectedComponentId}] : null;
      if(!fields.components) delete fields.components;
      //Versions (affectedVersions)
      fields.versions = issueData.selectedAffectedVersionId ? [{id:issueData.selectedAffectedVersionId}] : null;
      if(!fields.versions) delete fields.versions;
      //fixVersions
      fields.fixVersions = issueData.selectedFixVersionId ? [{id:issueData.selectedFixVersionId}] : null;
      if(!fields.fixVersions) delete fields.fixVersions;
      //labels
      fields.labels = []
      if(issueData.selectedLabel1) fields.labels.push(issueData.selectedLabel1);
      if(issueData.selectedLabel2) fields.labels.push(issueData.selectedLabel2);
      fields.labels.push('WebReview')
      //epic
      fields.customfield_10900 = issueData.selectedEpicKey;
      if(!fields.customfield_10900) delete fields.customfield_10900;
      //story points
      fields.customfield_10105 = issueData.storyPoints;
      if(!fields.customfield_10105) delete fields.customfield_10105;

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