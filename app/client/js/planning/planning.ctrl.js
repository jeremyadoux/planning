(function() {
  'use strict';

  angular
    .module('planning')
    .controller('PlanningController', PlanningController);


  PlanningController.$inject = ['$scope', 'Planning', 'Team', 'Project', '$timeout', 'Flash']

  function PlanningController($scope, Planning, Team, Project, $timeout, Flash) {

    var vm = this;
    vm.filterOnTeam = null;
    vm.filterOnTeamFilteredTeam = [];
    vm.filterOnTeamGlobal = null;
    vm.funcSetDay = prepareDataDay;
    vm.nextMonth = nextMonth;
    vm.previousMonth = previousMonth;
    vm.getCurrentMonthName = getCurrentMonthName;
    vm.getCurrentDayName = getCurrentDayName;
    vm.isNotWorkingDay = isNotWorkingDay;
    vm.getColorDay = getColorDay;
    vm.getTeamList = getTeamList;
    vm.getPlanningList = getPlanningList;
    vm.getProjectList = getProjectList;
    vm.addSelectionToProject = addSelectionToProject;
    vm.filterByTeamAction = filterByTeamAction;
    vm.removeFilterTeamAction = removeFilterTeamAction;
    vm.init = init;
    vm.getNumber = function(num) {
      return new Array(num);
    };

    //Init
    var dateStart = moment();

    vm.currentMonth = dateStart.format("M");
    vm.currentYears = dateStart.format("YYYY");
    vm.funcSetDay(vm.currentMonth);
    vm.getProjectList();
    vm.init();


    $scope.$watch('vm.filterOnTeam', function() {
      $timeout(function() {
        filterFilterTeam();
      }, 300);
    });

    function init() {
      vm.planningData = [];
      vm.getPlanningList();
      vm.getTeamList();
    }

    function prepareDataDay(month) {
      if(vm.currentMonth != 12) {
        var a = moment([vm.currentYears, month - 1, 1]);
        var b = moment([vm.currentYears, month, 1]);
      } else {
        var a = moment([vm.currentYears, month - 1, 1]);
        var b = moment([parseInt(vm.currentYears) + 1, 0, 1]);
      }

      var nbDay = b.diff(a, 'days');
      vm.dataDay = nbDay;
    }

    function getCurrentMonthName() {
      var dateCurrent = moment(vm.currentMonth + "-01-"+vm.currentYears, "MM-DD-YYYY");
      return dateCurrent.format("MMMM");
    }

    function getCurrentDayName(day) {
      var dateCurrent = moment(vm.currentMonth + "-"+day+"-"+vm.currentYears, "MM-DD-YYYY");
      return dateCurrent.format("ddd");
    }

    function nextMonth() {
      if(vm.currentMonth >= 12) {
        vm.currentMonth = 1;
        vm.currentYears++;
      } else {
        vm.currentMonth++;
      }

      vm.funcSetDay(vm.currentMonth);
      vm.init();
    }

    function previousMonth() {
      if(vm.currentMonth <= 1) {
        vm.currentMonth = 12;
        vm.currentYears--;
      } else {
        vm.currentMonth--;
      }

      vm.funcSetDay(vm.currentMonth);
      vm.init();
    }

    function getColorDay(day, collabId) {
      if(vm.isNotWorkingDay(day)) {
        return {'background-color':'black'};
      } else {
        var dateCurrent = moment.utc(vm.currentMonth + "-"+day+"-"+vm.currentYears, "MM-DD-YYYY");;
        var planning  = getPlanningByCollabAndDateInPlanning(dateCurrent, collabId);
        if(planning !== false) {
          return {'background-color':planning.project.color};
        }
      }
    }

    function isNotWorkingDay(day) {
      var dateCurrent = moment(vm.currentMonth + "-"+day+"-"+vm.currentYears, "MM-DD-YYYY");
      var nbCurrentDay = dateCurrent.format("e");
      if(nbCurrentDay == 5 || nbCurrentDay == 6) {
        return true;
      } else {
        return false;
      }
    }

    function getTeamList() {
      var dateCurrentMin = moment(vm.currentMonth + "-01-"+vm.currentYears, "MM-DD-YYYY");
      var dateCurrentMax = moment(vm.currentMonth + "-01-"+vm.currentYears, "MM-DD-YYYY").add("1", "months");

      var teamFilter = {
        filter:{
          include : {
            relation: 'collaborators',
            scope: {
              include: {
                relation: 'plannings',
                scope: {
                  where: {
                    date: {
                      between: [dateCurrentMin.format(),dateCurrentMax.format()]
                    }
                  },
                  order: 'date ASC',
                  include: {
                    relation: 'project'
                  }
                }
              }
            }
          }
        }
      };

      if(vm.filterOnTeamGlobal != null && vm.filterOnTeamGlobal) {
        teamFilter.filter.where = {
          id: vm.filterOnTeamGlobal.id
        };
      }

      Team.find(teamFilter)
        .$promise
        .then(function(response) {
          //First prepare team data add date in first parameter for better element configuration
          var dataPlannings = {
            project: {}
          };
          for(var cpt = 0; cpt < vm.dataDay; cpt++) {
            var dataInformation = {};
            if(isNotWorkingDay(cpt+1)) {

              dataInformation.project = {
                color: 'black',
                notWorkingDay: true
              };
            }
            dataPlannings[vm.currentYears.toString()+vm.currentMonth.toString()+(cpt+1).toString()] = dataInformation;
          }

          for(var i = 0; i < response.length; i++ ) {
            if(response[i].collaborators.length == 0) {
              response.splice(i, 1);
            } else {
              for(var j in response[i].collaborators) {
                response[i].collaborators[j].dataPlannings = {};
                angular.copy(dataPlannings, response[i].collaborators[j].dataPlannings);
                //Access to planning data saving for each collaborator in this team
                for(var h in response[i].collaborators[j].plannings) {
                  response[i].collaborators[j].dataPlannings[response[i].collaborators[j].plannings[h].dateSimplified] = response[i].collaborators[j].plannings[h];
                }
              }
            }
          }

          vm.teamListData = response;
        });
    }

    function getProjectList() {
      Project.find({filter: {order: 'name ASC'}})
        .$promise
        .then(function(response) {
           vm.projectData = response;
      });
    }

    function getPlanningList() {
      var dateCurrentMin = moment(vm.currentMonth + "-01-"+vm.currentYears, "MM-DD-YYYY");
      var dateCurrentMax = moment(vm.currentMonth + "-01-"+vm.currentYears, "MM-DD-YYYY").add("1", "months");

      Planning.find({filter:{include : "project", where: {date: {between: [dateCurrentMin.format(),dateCurrentMax.format()]}}}})
        .$promise
        .then(function(response) {
          vm.planningData = response;
        });
    }

    function getPlanningByCollabAndDateInPlanning(date, collabId) {
      for(var i = 0; i < vm.planningData.length; i++) {
        //Better perf like this
        if( vm.planningData[i].collaboratorId == collabId) {
          var dateMoment = moment.utc(vm.planningData[i].date)
          if (dateMoment.isSame(date, 'day')) {
            return vm.planningData[i];
          }
        }
      }

      return false;
    }

    function addSelectionToProject(project) {
      var createDataPlanningToSave = [];
      vm.fiddlePlanning.finderSelect("selected").each(function(index){
        var monthToSave = vm.currentMonth.toString();
        var dayToSave = $(this).attr('data-day').toString();

        if(monthToSave.length == 1) {
          monthToSave = "0"+monthToSave;
        }

        if(dayToSave.length == 1) {
          dayToSave = "0"+dayToSave;
        }

        createDataPlanningToSave.push({
          "date": vm.currentYears+"-"+monthToSave+"-"+dayToSave+"T00:00:00.000Z",
          "collaboratorId": $(this).attr('data-collab-id'),
          "projectId": project.id
        });
      });

      Planning.createMany(createDataPlanningToSave)
        .$promise
        .then(function(response){
          //@TODO faire en sorte qu'on n'est pas besoin de faire un nouvel init après l'enregistrement.
          Flash.create('success', "Le planning a été mis à jour.");
          vm.init();
        });
    }

    function filterFilterTeam() {
      Team.find({
        filter: {
          where: { name: {like: '.*'+vm.filterOnTeam+'.*'}}
        }
      })
        .$promise
        .then(function(response) {
          vm.filterOnTeamFilteredTeam = response;
        });
    }

    function filterByTeamAction(team) {
      vm.filterOnTeam = null;
      vm.filterOnTeamGlobal = team;
      vm.getTeamList();
    }

    function removeFilterTeamAction() {
      vm.filterOnTeam = null;
      vm.filterOnTeamGlobal = null;
      vm.getTeamList();
    }

    //Inject fiddle configuration
    $timeout(function() {
      vm.fiddlePlanning = $('#table-planning').finderSelect({children:"td.fiddle-selectable"});
    });
  }
})();
