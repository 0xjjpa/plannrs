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

    self.getProjects = function() {
      var key = 'GET_PROJECTS',
          defer = $q.defer();

      if(!_isPreviouslyStored(key, defer)) {
        $http({method: 'GET', url: API_URL, params:{url:'/project'}}).success(function(response) {
          localStorageService.set(key, response);
          return defer.resolve(response);
        }).error(function(error) {
          return defer.reject(error);
        });
      }
      return defer.promise;
    }

    return self;
}])