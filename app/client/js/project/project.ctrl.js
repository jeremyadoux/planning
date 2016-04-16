(function() {
  'use strict';

  angular
    .module('planning')
    .controller('ProjectController', ProjectController);


  ProjectController.$inject = ['Project', 'Flash'];
  function ProjectController(Project, Flash) {
    var vm = this;

    vm.limit = 5;
    vm.currentPage = 1;
    vm.projectCount = 0;


    vm.loadProject = loadProject;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.haveNextPage = haveNextPage;
    vm.havePreviousPage = havePreviousPage;
    vm.createProject = createProject;
    vm.countProject = countProject;

    init();

    function init() {
      vm.projectData = [];
      vm.loadProject();
      vm.countProject();
    }

    function nextPage() {
      vm.currentPage++;
      init();
    }

    function previousPage() {
      vm.currentPage--;
      init();
    }

    function haveNextPage() {

    }

    function havePreviousPage() {

    }

    function loadProject() {
      Project.find({filter: {skip: (vm.limit * (vm.currentPage-1)), limit: vm.limit, order: 'name ASC'}})
        .$promise
        .then(function(response) {
          vm.projectData = response;
        });
    }

    function countProject() {
      Project.count()
        .$promise
        .then(function(response) {
          vm.projectCount = response.count;
        });
    }

    function createProject(project) {
        Project.create(project).$promise
          .then(function (response) {
            vm.currentPage = 1;
            init();
            Flash.create('success', "Le projet "+response.name+" a été enregistré.");
          }, function(reason) {
            Flash.create('danger', "Une erreur d'enregistrement s'est produite, vérifiez le formulaire.");
          });
    }
  }

})();
