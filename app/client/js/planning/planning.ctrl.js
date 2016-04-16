(function() {
  'use strict';

  angular
    .module('planning')
    .controller('PlanningController', PlanningController);


  PlanningController.$inject = ['Planning', 'Team']

  function PlanningController(Planning, Team) {

    var vm = this;
    vm.funcSetDay = prepareDataDay;
    vm.nextMonth = nextMonth;
    vm.previousMonth = previousMonth;
    vm.getCurrentMonthName = getCurrentMonthName;
    vm.getCurrentDayName = getCurrentDayName;
    vm.isNotWorkingDay = isNotWorkingDay;
    vm.getColorDay = getColorDay;
    vm.getTeamList = getTeamList;
    vm.getPlanningList = getPlanningList;
    vm.init = init;
    vm.getNumber = function(num) {
      return new Array(num);
    };

    //Init
    var dateStart = moment();

    vm.currentMonth = dateStart.format("M");
    vm.currentYears = dateStart.format("YYYY");
    vm.funcSetDay(vm.currentMonth);
    vm.init();


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
        var b = moment([vm.currentYears+1, 0, 1]);
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
        var dateCurrent = moment(vm.currentMonth + "-"+day+"-"+vm.currentYears, "MM-DD-YYYY");
        var planning  = getPlanningByCollabAndDateInPlanning(dateCurrent, collabId)
        if(planning !== false) {
          return {'background-color':'red'};
        }
      }
    }

    function isNotWorkingDay(day) {
      var dateCurrent = moment(vm.currentMonth + "-"+day+"-"+vm.currentYears, "MM-DD-YYYY");
      var nbCurrantDay = dateCurrent.format("e");
      if(nbCurrantDay == 5 || nbCurrantDay == 6) {
        return true;
      } else {
        return false;
      }
    }

    function getTeamList() {
      Team.find({filter:{ include : "collaborators"} })
        .$promise
        .then(function(response) {
          for(var i = 0; i < response.length; i++ ) {
            if(response[i].collaborators.length == 0) {
              response.splice(i, 1);
            }
          }
          vm.teamListData = response;
        });
    }

    function getPlanningList() {
      var dateCurrentMin = moment(vm.currentMonth + "-01-"+vm.currentYears, "MM-DD-YYYY");
      var dateCurrentMax = moment(vm.currentMonth + "-01-"+vm.currentYears, "MM-DD-YYYY").add("1", "months");

      Planning.find({filter:{where: {date: {between: [dateCurrentMin.format(),dateCurrentMax.format()]}}}})
        .$promise
        .then(function(response) {
          vm.planningData = response;
        });
    }

    function getPlanningByCollabAndDateInPlanning(date, collabId) {
      for(var i = 0; i < vm.planningData.length; i++) {
        var dateMoment = moment(vm.planningData[0].date);
        if(dateMoment.isSame(date, 'day') && vm.planningData[i].collaboratorId == collabId) {
          return vm.planningData[i];
        }
      }

      return false;
    }
  }
})();
