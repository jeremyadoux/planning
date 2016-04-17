(function() {
  'use strict';

  angular
    .module('planning')
    .controller('TeamController', TeamController);

  TeamController.$inject = ['$scope', 'Team', 'Collaborator', 'Flash', 'ngDialog'];

  function TeamController($scope, Team, Collaborator, Flash, ngDialog) {
    var vm = this;

    vm.limit = 5;
    vm.currentPage = 1;
    vm.teamCount = 0;

    vm.loadTeam = loadTeam;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.haveNextPage = haveNextPage;
    vm.havePreviousPage = havePreviousPage;
    vm.createTeam = createTeam;
    vm.countTeam = countTeam;
    vm.wantEditTeam = wantEditTeam;
    vm.editTeam = editTeam;
    vm.resetForm = resetForm;
    vm.addCollaborator = addCollaborator;
    vm.removeCollaborator = removeCollaborator;
    vm.addCollaboratorOpen = addCollaboratorOpen;

    init();

    function init() {
      vm.teamData = [];
      vm.loadTeam();
      vm.countTeam();
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
      if((vm.currentPage * vm.limit) < vm.teamCount) {
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

    function loadTeam() {
      var filter = {filter: {skip: (vm.limit * (vm.currentPage-1)), limit: vm.limit, order: 'lastName ASC', include: "collaborators"}};
      if(vm.search != null) {
        filter.filter.where = {name: {like : '.*'+vm.search+'.*'}};
      }

      Team.find(filter)
        .$promise
        .then(function(response) {
          vm.teamData = response;
        });
    }

    function countTeam() {
      var filter = {};
      if(vm.search != null) {
        filter = {where: {name: {like : '.*'+vm.search+'.*'}}};
      }

      Team.count(filter)
        .$promise
        .then(function(response) {
          vm.teamCount = response.count;
        });
    }

    function createTeam(team) {
      Team.create(team).$promise
        .then(function (response) {
          vm.currentPage = 1;
          init();
          Flash.create('success', "L'équipe "+response.name+" a été enregistré.");
          vm.newTeam = null;
          $scope.form.$setPristine();
        }, function(reason) {
          Flash.create('danger', "Une erreur d'enregistrement s'est produite, vérifiez le formulaire.");
        });
    }

    function resetForm() {
      vm.newTeam = null;
      $scope.form.$setPristine();
    }

    function wantEditTeam(team) {
      vm.newTeam = null;
      $scope.form.$setPristine();
      vm.newTeam = team;
    }

    function editTeam(team) {
      Team.prototype$updateAttributes({ id: team.id }, team)
        .$promise
        .then(function(response) {
          Flash.create('success', "L'équipe "+response.name+" a été mise à jour.");
          vm.newTeam = null;
          $scope.form.$setPristine();
        }, function(reason) {
          Flash.create('danger', "Une erreur d'enregistrement s'est produite, vérifiez le formulaire.");
        });
    }

    function addCollaborator(team, collaborator) {
      team.collaborators.push(collaborator);

      collaborator.teamId = team.id;

      Collaborator.prototype$updateAttributes({ id: collaborator.id }, collaborator)
        .$promise
        .then(function(response) {
          Flash.create('success', "Le collaborateur "+collaborator.name+" a été ajouté à l'équipe "+team.name+".");
          vm.newTeam = null;
          $scope.form.$setPristine();
        }, function(reason) {
          Flash.create('danger', "Une erreur d'enregistrement s'est produite, vérifiez le formulaire.");
        });
    }

    function removeCollaborator(team, collaborator) {
      console.log("pas encore implémenté");
    }

    function addCollaboratorOpen(team) {
      vm.currentTeamToAdd = team;
      ngDialog.open({
        template: 'js/collaborator/collaborator-dialog.html',
        className: 'dialog-add-collaborator',
        controller: 'CollaboratorController',
        controllerAs: 'vm',
        scope: $scope
      });
    }

    $scope.$watch('vm.search', function() {
      vm.currentPage = 1;
      init();
    });
  }

})();
