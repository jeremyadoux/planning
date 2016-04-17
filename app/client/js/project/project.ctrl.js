(function() {
  'use strict';

  angular
    .module('planning')
    .controller('ProjectController', ProjectController);

  ProjectController.$inject = ['$scope', 'Project', 'Flash'];

  function ProjectController($scope, Project, Flash) {
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
    vm.wantEditProject = wantEditProject;
    vm.editProject = editProject;
    vm.resetForm = resetForm;

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
      if((vm.currentPage * vm.limit) < vm.projectCount) {
        return true;
      } else {
        return false;
      }
    }

    function havePreviousPage() {
      if(vm.currentPage > 1) {
        return true;
      } else {
        return false;
      }
    }

    function loadProject() {
      var filter = {filter: {skip: (vm.limit * (vm.currentPage-1)), limit: vm.limit, order: 'name ASC'}};
      if(vm.search != null) {
        filter.filter.where = {name: {like : '.*'+vm.search+'.*'}};
      }

      Project.find(filter)
        .$promise
        .then(function(response) {
          vm.projectData = response;
        });
    }

    function countProject() {
      var filter = {};
      if(vm.search != null) {
        filter = {where: {name: {like : '.*'+vm.search+'.*'}}};
      }

      Project.count(filter)
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
            vm.newProject = null;
            $scope.form.$setPristine();
          }, function(reason) {
            Flash.create('danger', "Une erreur d'enregistrement s'est produite, vérifiez le formulaire.");
          });
    }

    function resetForm() {
      vm.newProject = null;
      $scope.form.$setPristine();
    }

    function wantEditProject(project) {
      vm.newProject = null;
      $scope.form.$setPristine();
      vm.newProject = project;
    }

    function editProject(project) {
      Project.prototype$updateAttributes({ id: project.id }, project)
        .$promise
        .then(function(response) {
          Flash.create('success', "Le projet "+response.name+" a été mis à jour.");
          vm.newProject = null;
          $scope.form.$setPristine();
        }, function(reason) {
          Flash.create('danger', "Une erreur d'enregistrement s'est produite, vérifiez le formulaire.");
        });
    }


    $scope.$watch('vm.search', function() {
      vm.currentPage = 1;
      init();
    });

  }

})();
