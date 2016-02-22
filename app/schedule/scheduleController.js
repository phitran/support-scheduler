'use strict';

const moment = require('moment');
const _get = require('lodash/get');

angular
    .module('SupportScheduler')
    .controller('scheduleController', scheduleController);

scheduleController.$inject = ['$state', 'userContext', 'scheduleService'];
function scheduleController($state, userContext, scheduleService) {
    const vm = this;

    /* public method */
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
    vm.days = [];
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
        return moment(currentDay.date.date).hour(0).minute(0).seconds(0).milliseconds(0).isSame(vm.today);
    }

    function isThePast(currentDay) {
        return moment(currentDay.date.date).hour(0).minute(0).seconds(0).milliseconds(0).isBefore(vm.today);
    }

    function isCurrentMonth(currentDay) {
        console.log( currentDay.date.month, vm.today.get('month') );
        return currentDay.date.month === parseInt(vm.today.format('M'));
    }

    /**
     * getSchedule
     * based on current month. calculate startDate and endDate
     * to fit a 42 box calendar
     */
    function getSchedule() {
        const currentMonthStart = moment().startOf('month');
        const currentMonthEnd = moment().endOf('month');
        const numberOfDaysInMonth = parseInt(currentMonthEnd.format('D'));
        const remainingDaysOfCalendar = 42 - (currentMonthStart.day() + numberOfDaysInMonth);
        const startOfCalendar = currentMonthStart.clone().subtract(currentMonthStart.day(), 'd').hour(0).minute(0).seconds(0).milliseconds(0);
        const endOfCalendar = currentMonthEnd.clone().add(remainingDaysOfCalendar, 'd').hour(0).minute(0).seconds(0).milliseconds(0);

        scheduleService.getSchedule(startOfCalendar.toISOString(), endOfCalendar.toISOString()).then(schedule => {
            vm.days = schedule.data;
        })
    }

    function swapSchedules(schedule) {
        vm.isSwapping = true;
        vm.swapContext.origin = schedule;
    }

    function confirmSwapSchedule(schedule) {
        vm.swapContext.target = schedule;
        scheduleService.swapSchedule(vm.swapContext.origin,vm.swapContext.target).then(response => {
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
        scheduleService.undoableSchedule(schedule).then(response => {
            getSchedule();
        })
    }

}

module.exports = scheduleController;
