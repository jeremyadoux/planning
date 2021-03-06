(function() {
  'use strict';

  angular
    .module('planning')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('planning', {
          url: '/planning',
          templateUrl: 'js/planning/planning.html',
          controller: 'PlanningController',
          controllerAs: 'vm'
        });
      $urlRouterProvider.otherwise('planning');
  }]);

})();
