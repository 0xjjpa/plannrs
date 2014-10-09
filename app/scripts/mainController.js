angular.module('plannrs')
  .controller('mainController', ['$scope', 'mainService', function($scope, mainService) {
    $scope.ui = {
      projectLabel: 'Select project',
      componentLabel: 'Select component'
    }
    $scope.data = {
      projects: [{key:'Loading...'}],
      components: [{name:'Loading...'}]
    }
    $scope.formData = {
      selectedProjectId: null,
      selectedIssueTypeId: 3, // “Task”
      selectedSecurityId: 10802, // “Open to Centralway”,
      selectedPriorityId: 3, // “Major”,
      selectedDueDate: moment().add(1, 'week').day(5).format('YYYY-MM-DD'), // “Due Date”
      selectedComponent: null
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

    $scope.selectProject = function(project) {
      $scope.ui.projectLabel = project.key;
      $scope.formData.selectedProjectId = project.id;
    }
    $scope.selectComponent = function(component) {
      $scope.ui.componentLabel = component.name;
      $scope.formData.selectedComponentId = component.id;
    }
    $scope.clearComponent = function() {
      $scope.ui.componentLabel = 'Select component';
      $scope.formData.selectedComponentId = null;
    }
}])