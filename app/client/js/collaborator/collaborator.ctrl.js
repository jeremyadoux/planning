(function() {
  'use strict';

  angular
    .module('planning')
    .controller('CollaboratorController', CollaboratorController);


  CollaboratorController.$inject = ['$scope', 'Flash', 'Collaborator', 'Team']

  function CollaboratorController($scope, Flash, Collaborator, Team) {

    var vm = this;

    if($scope.$parent.vm != null) {
      vm.parentScope = $scope.$parent.vm;
    }

    vm.limit = 5;
    vm.currentPage = 1;
    vm.collabCount = 0;

    vm.loadCollaborator = loadCollaborator;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.haveNextPage = haveNextPage;
    vm.havePreviousPage = havePreviousPage;
    vm.createCollaborator = createCollaborator;
    vm.countCollaborator = countCollaborator;
    vm.wantEditCollaborator = wantEditCollaborator;
    vm.editCollaborator = editCollaborator;
    vm.resetForm = resetForm;

    init();

    function init() {
      vm.collaboratorData = [];
      vm.loadCollaborator();
      vm.countCollaborator();
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
      if((vm.currentPage * vm.limit) < vm.collabCount) {
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

    function loadCollaborator() {
      var filter = {filter: {skip: (vm.limit * (vm.currentPage-1)), limit: vm.limit, order: 'lastName ASC'}};
      if(vm.search != null) {
        filter.filter.where = {or: [{lastName: {like : '.*'+vm.search+'.*'}}, {firstName: {like : '.*'+vm.search+'.*'}}]};
      }

      Collaborator.find(filter)
        .$promise
        .then(function(response) {
          vm.collaboratorData = response;
        });
    }

    function countCollaborator() {
      var filter = {};
      if(vm.search != null) {
        filter = {where: {or: [{lastName: {like : '.*'+vm.search+'.*'}}, {firstName: {like : '.*'+vm.search+'.*'}}]}};
      }

      Collaborator.count(filter)
        .$promise
        .then(function(response) {
          vm.collabCount = response.count;
        });
    }

    function createCollaborator(collab) {
      Collaborator.create(collab).$promise
        .then(function (response) {
          vm.currentPage = 1;
          init();
          Flash.create('success', "Le collaborateur "+response.name+" a été enregistré.");
          vm.newCollab = null;
          $scope.form.$setPristine();
        }, function(reason) {
          Flash.create('danger', "Une erreur d'enregistrement s'est produite, vérifiez le formulaire.");
        });
    }

    function resetForm() {
      vm.newCollab = null;
      $scope.form.$setPristine();
    }

    function wantEditCollaborator(collab) {
      vm.newCollab = null;
      $scope.form.$setPristine();
      vm.newCollab = collab;
    }

    function editCollaborator(collab) {
      if(collab.password == null || collab.password == "") {
        delete collab.password;
      }

      Collaborator.prototype$updateAttributes({ id: collab.id }, collab)
        .$promise
        .then(function(response) {
          Flash.create('success', "Le collaborateur "+response.name+" a été mis à jour.");
          vm.newCollab = null;
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
