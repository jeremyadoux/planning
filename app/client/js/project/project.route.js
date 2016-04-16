(function() {
  'use strict';

  angular
    .module('planning')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('project', {
          url: '/project',
          templateUrl: 'js/project/project.html',
          controller: 'ProjectController',
          controllerAs: 'vm'
        });
    }]);

})();
