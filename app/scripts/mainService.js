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

    var _getHTTPOperation = function(url, key, defer) {
      $http({method: 'GET', url: API_URL, params:{url:url}}).success(function(response) {
        localStorageService.set(key, response);
        defer.resolve(response);
      }).error(function(error) {
        defer.reject(error);
      });
    }

    self.getComponents = function() {
      var key = 'GET_COMPONENTS',
          url = '/project/11903/components', // “CWCOM Project”
          defer = $q.defer();

      if(!_isPreviouslyStored(key, defer)) {
        _getHTTPOperation(url, key, defer);
      }
      return defer.promise;
    }

    self.getProjects = function() {
      var key = 'GET_PROJECTS',
          url = '/project',
          defer = $q.defer();

      if(!_isPreviouslyStored(key, defer)) {
        _getHTTPOperation(url, key, defer);
      }
      return defer.promise;
    }

    return self;
}])