var app = angular.module("app", ['ngAnimate', 'ngRoute', 'app.config']);

angular.module('app').config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({ enabled: true, requireBase: false });

  $routeProvider
  .when('/', {
    templateUrl: '/pages/battle/battle.html',
    controller: 'battleController'
  })

}]);

angular.module('app').run(function($rootScope) {
  $rootScope.$on('$routeChangeSuccess', function(e,to){
    window.scrollTo(0, 0);
  });
});
