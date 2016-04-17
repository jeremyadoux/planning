(function() {
  'use strict';

  angular
    .module('planning')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('collaborator', {
          url: '/collaborator',
          templateUrl: 'js/collaborator/collaborator.html',
          controller: 'CollaboratorController',
          controllerAs: 'vm'
        });
    }]);
})();
