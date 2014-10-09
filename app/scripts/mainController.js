angular.module('plannrs', [])
  .controller('mainController', ['$scope', function($scope) {
    $scope.ui = {
      projectLabel: 'Select project'
    }
    $scope.data = ['A', 'B', 'C']
    $scope.selectProject = function(project) {
      $scope.ui.projectLabel = project;
    }
}])