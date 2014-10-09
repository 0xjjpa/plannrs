angular.module('plannrs')
  .service('mainService', ['$http', '$q', 'API_URL', function($http, $q, API_URL) {
    var self = this;
    self.getProjects = function() {
      var defer = $q.defer();
      $http({method: 'GET', url: API_URL, params:{url:'/project'}}).success(function(response) {
        return defer.resolve(response);
      }).error(function(error) {
        return defer.reject(error);
      })
      return defer.promise;
    }

    return self;
}])