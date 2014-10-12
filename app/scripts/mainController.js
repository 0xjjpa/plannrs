angular.module('plannrs')
  .controller('mainController', ['$scope', 'mainService', function($scope, mainService) {
    $scope.ui = {
      issueSummary: null,
      projectLabel: 'Select project',
      componentLabel: 'Select component',
      affectedVersionLabel: 'Select version',
      fixVersionLabel: 'Select version',
      labelLabel: 'Select label',
      epicLabel: 'Select epic',
      priorityLabel: 'Select priority'
    }
    $scope.data = {
      projects: [{key:'Loading...'}],
      components: [{name:'Loading...'}],
      versions: [{name:'Loading...'}],
      labels: ['2014Q4WebDevOps','2014Q4WebFrontEnd','2014Q4WebTechnology','2014Q4WebOperations'],
      epics: [{fields:{customfield_10901:'Loading...'}}],
      priorities: [{name:'Loading...'}],
      issues: []
    }
    $scope.formData = {
      selectedProjectId: null,
      selectedIssueTypeId: '3', // “Task”
      selectedSecurityId: '10802', // “Open to Centralway”,
      selectedPriorityId: '3', // “Major”,
      //selectedDueDate: moment().add(1, 'week').day(5).format('YYYY-MM-DD'), // “Due Date”
      selectedDueDate: null,
      selectedComponentId: null,
      selectedAffectedVersionId: null,
      selectedFixVersionId: null,
      selectedReporter: "jose.perez",
      selectedAssignee: "jose.perez",
      selectedLabel: null,
      selectedEpicKey: null
    }

    $scope.addIssue = function() {
      var issue = angular.copy($scope.formData);
      issue.summary = angular.copy($scope.ui.issueSummary);
      $scope.ui.issueSummary = null;
      $scope.data.issues.push(issue);
    }
    $scope.removeIssue = function(index) {
      $scope.data.issues.splice(index, 1);
    }

    $scope.loadProjects = function() {
      var promise = mainService.getProjects();
      promise.then(function(response) {
        $scope.data.projects = response;
      });
    }
    $scope.loadComponents = function() {
      var promise = mainService.getComponents();
      promise.then(function(response) {
        $scope.data.components = response;
      });
    }
    $scope.loadVersions = function() {
      var promise = mainService.getVersions();
      promise.then(function(response) {
        $scope.data.versions = response;
      });
    }
    $scope.loadEpics = function() {
      var promise = mainService.getEpics();
      promise.then(function(response) {
        $scope.data.epics = response.issues;
      }); 
    }
    $scope.loadPriorities = function() {
      var promise = mainService.getPriorities();
      promise.then(function(response) {
        $scope.data.priorities = response;
      }); 
    }

    $scope.selectProject = function(project) {
      $scope.ui.projectLabel = project.key;
      $scope.formData.selectedProjectId = project.id;
    }

    $scope.selectPriority = function(priority) {
      $scope.ui.priorityLabel = priority.name;
      $scope.formData.selectedPriorityId = priority.id;
    }


    $scope.selectComponent = function(component) {
      $scope.ui.componentLabel = component.name;
      $scope.formData.selectedComponentId = component.id;
    }
    $scope.clearComponent = function() {
      $scope.ui.componentLabel = 'Select component';
      $scope.formData.selectedComponentId = null;
    }


    $scope.selectAffectedVersion = function(version) {
      $scope.ui.affectedVersionLabel = version.name;
      $scope.formData.selectedAffectedVersionId = version.id; 
    }
    $scope.clearAffectedVersion = function() {
      $scope.ui.affectedVersionLabel = 'Select version';
      $scope.formData.selectedAffectedVersionId = null;
    }


    $scope.selectFixVersion = function(version) {
      $scope.ui.fixVersionLabel = version.name;
      $scope.formData.selectedFixVersionId = version.id; 
    }
    $scope.clearFixVersion = function() {
      $scope.ui.fixVersionLabel = 'Select version';
      $scope.formData.selectedFixVersionId = null;
    }


    $scope.selectLabel = function(label) {
      $scope.ui.labelLabel = label;
      $scope.formData.selectedLabel = label; 
    }
    $scope.clearLabel = function() {
      $scope.ui.labelLabel = 'Select label';
      $scope.formData.selectedLabel = null;
    }


    $scope.selectEpic = function(epic) {
      $scope.ui.epicLabel = epic.fields.customfield_10901;
      $scope.formData.selectedEpicKey = epic.key; 
    }
    $scope.clearEpic = function() {
      $scope.ui.epicLabel = 'Select epic';
      $scope.formData.selectedEpicKey = null;
    }


    /*
    $scope.createIssue = function() {
      var issueData = angular.copy($scope.formData);
      console.log("Response", mainService.createissue(issueData));
    }
    */
    $scope.createBulkIssues = function() {
      mainService.createBulkIssues($scope.data.issues);
      $scope.data.issues = [];
    }
    
}])