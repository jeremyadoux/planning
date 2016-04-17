(function() {
  'use strict';

  angular
    .module('planning')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('team', {
          url: '/team',
          templateUrl: 'js/team/team.html',
          controller: 'TeamController',
          controllerAs: 'vm'
        });
    }]);
})();
