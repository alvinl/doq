
/* global angular, EventSource */

var DoqApp = angular.module('DoqApp', ['luegg.directives', 'ngSanitize']);

DoqApp.filter('toTrusted', ['$sce',
  function ($sce) {

    return function (input) {

      input = input.replace('(B', '');

      return $sce.trustAsHtml(input);

    };

  }]);

DoqApp.filter('parseRunning', function () {

  return function (input) {

    return (input === 1) ? input + ' running app' : input + ' running apps';

  };

});

DoqApp.controller('ActiveCtrl', ['$scope', '$http',
  function ($scope, $http) {

    $http.get('/api/containers')
      .success(function (activeContainers) {

        $scope.activeContainers = activeContainers;

      })
      .error(function (err) {

        console.dir(err);

      });

  }]);

DoqApp.controller('IndexCtrl', ['$scope', '$http', '$window',
  function ($scope, $http, $window) {

    $scope.runningContainers = 0;

    $scope.variables = {};

    var reservedVars = ['PORT', 'APP_REPO'];

    $http.get('/api/containers')
      .success(function (runningContainers) {

        $scope.runningContainers = runningContainers.filter(function (runningContainer) {

          return runningContainer.Ports.length;

        }).length;

      })
      .error(function (err) {

        console.dir(err);

      });

    $scope.removeEnv = function (key) {

      delete $scope.variables[key];

    };

    $scope.addVar = function () {

      if (!$scope.key)
        return;

      else if (~reservedVars.indexOf($scope.key))
        return ($scope.warning = 'Sorry, but ' + $scope.key + ' is a reserved environment variable');

      $scope.variables[$scope.key] = $scope.value;
      $scope.key = '';
      $scope.value = '';

    };

    $scope.launchApp = function () {

      $http.post('/api/launch', { url: $scope.appRepo, vars: $scope.variables })
        .success(function (app) {

          $window.location = '/app/' + app.id.substring(0, 12);

        })
        .error(function (err) {

          console.dir(err);
          $scope.launchError = 'Sorry, there was an error launching your application.';

        });

    };

  }]);

DoqApp.controller('AppCtrl', ['$scope', '$http', '$window', '$anchorScroll', '$location',
  function ($scope, $http, $window, $anchorScroll, $location) {

    $scope.appLog = [];
    $scope.appURL = ($scope.containerPort !== 'null') ? 'http://' + $location.host() + ':' + $scope.containerPort : '#notRunning';

    $scope.deleteApp = function () {

      $http.post('/api/delete', { containerID: $scope.containerHash })
        .success(function () {

          $window.location = '/';

        })
        .error(function (err) {

          console.dir(err);

        });

    };

    $scope.relaunchApp = function () {

      $http.post('/api/relaunch', { containerID: $scope.containerHash })
        .success(function () {

          $window.location = $window.location;

        })
        .error(function (err) {

          console.dir(err);

        });

    };

    if (!!window.EventSource) {

      var source = new EventSource('/api/logs/' + $scope.containerHash);

      source.addEventListener('log', function (payload) {

        $scope.$apply(function () {

          $scope.appLog.push(JSON.parse(payload.data));

        });

      });

    }

  }]);
