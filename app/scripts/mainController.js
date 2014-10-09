angular.module('plannrs')
  .controller('mainController', ['$scope', 'mainService', function($scope, mainService) {
    $scope.ui = {
      projectLabel: 'Select project'
    }
    $scope.data = {
      projects: [{key:'Loading...'}]
    }
    $scope.formData = {
      selectedProjectId: null
    }

    $scope.loadProjects = function() {
      var promise = mainService.getProjects();
      promise.then(function(response) {
        $scope.data.projects = response;
      })
    }
    $scope.selectProject = function(project) {
      $scope.ui.projectLabel = project.key;
      $scope.formData.selectedProjectId = project.id;
    }
}])