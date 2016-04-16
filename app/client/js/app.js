(function() {
  'use strict';

  angular
    .module('planning', ['ui.router', 'ngSanitize', 'lbServices', 'ngDialog', 'ngFlash']).config(function(LoopBackResourceProvider) {
      // Change the URL where to access the LoopBack REST API server
      LoopBackResourceProvider.setUrlBase('/api');
    });
})();
