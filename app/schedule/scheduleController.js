'use strict';

var moment = require('moment');
var _get = require('lodash/get');

angular
    .module('SupportScheduler')
    .controller('scheduleController', scheduleController);

scheduleController.$inject = ['userContext', 'scheduleService'];
function scheduleController(userContext, scheduleService) {
    var vm = this;

    /* public methods */
    vm.isWorkday = isWorkday;
    vm.isSupportHero = isSupportHero;
    vm.isToday = isToday;
    vm.isThePast = isThePast;
    vm.isCurrentMonth = isCurrentMonth;
    vm.swapSchedules = swapSchedules;
    vm.confirmSwapSchedule = confirmSwapSchedule;
    vm.resetSwapContext = resetSwapContext;
    vm.markUndoable = markUndoable;

    /* public members */
    vm.userContext = userContext;
    vm.isSwapping = false;
    vm.swapContext = {
        origin: null,
        target: null
    };
    vm.supportHero = null;
    vm.days = [];
    vm.personalSchedule = [];
    vm.today = moment().hour(0).minute(0).seconds(0).milliseconds(0);

    init();

    function init() {
        getSchedule();
    }

    function isWorkday(currentDay) {
        return !(currentDay.date.isHoliday || currentDay.date.isWeekend);
    }

    function isSupportHero(currentDay) {
        return vm.userContext.userId === _get(currentDay, 'user[0]._id');
    }

    function isToday(currentDay) {
        var isToday = moment(currentDay.date.date).hour(0).minute(0).seconds(0).milliseconds(0).isSame(vm.today);

        if (isToday) {
            vm.supportHero = _get(currentDay, 'user[0].name') || 'None';
            return isToday;
        }

        return false;
    }

    function isThePast(currentDay) {
        return moment(currentDay.date.date).hour(0).minute(0).seconds(0).milliseconds(0).isBefore(vm.today);
    }

    function isCurrentMonth(currentDay) {
        return currentDay.date.month === parseInt(vm.today.format('M'));
    }

    function swapSchedules(schedule) {
        vm.isSwapping = true;
        vm.swapContext.origin = schedule;
    }

    function confirmSwapSchedule(schedule) {
        vm.swapContext.target = schedule;
        scheduleService.swapSchedule(vm.swapContext.origin,vm.swapContext.target).then(function(response) {
            getSchedule();
            resetSwapContext();
        });
    }

    function resetSwapContext() {
        vm.isSwapping = false;
        vm.swapContext.origin = null;
        vm.swapContext.target = null;
    }

    function markUndoable(schedule) {
        scheduleService.undoableSchedule(schedule).then(function(response) {
            getSchedule();
        })
    }


    /**
     * getSchedule
     * based on current month. calculate startDate and endDate
     * to fit a 42 box calendar
     *
     * get currentUsers schedule. from current date to end of year
     */
    function getSchedule() {
        var currentMonthStart = vm.today.clone().startOf('month');
        var currentMonthEnd = vm.today.clone().endOf('month');
        var numberOfDaysInMonth = parseInt(currentMonthEnd.format('D'));
        var remainingDaysOfCalendar = 42 - (currentMonthStart.day() + numberOfDaysInMonth);
        var startOfCalendar = currentMonthStart.clone().subtract(currentMonthStart.day(), 'd').hour(0).minute(0).seconds(0).milliseconds(0);
        var endOfCalendar = currentMonthEnd.clone().add(remainingDaysOfCalendar, 'd').hour(0).minute(0).seconds(0).milliseconds(0);

        scheduleService.getSchedule(startOfCalendar.toISOString(), endOfCalendar.toISOString()).then(function(schedule) {
            vm.days = schedule.data;
        });

        scheduleService.getUserSchedule(vm.userContext.userId, vm.today.toISOString(), moment().endOf('year').toISOString()).then(function(schedule) {
            schedule.data.map(function(value, index) {
                return value['moment'] = moment(value.date.date);
            });

            vm.personalSchedule = schedule.data
        });
    }

}

module.exports = scheduleController;
