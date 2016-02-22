angular
    .module('SupportScheduler')
    .service('scheduleService', scheduleService);

scheduleService.$inject = ['$http'];
function scheduleService($http) {
    this.getSchedule = function (startDate, endDate) {
        return $http.get('/services/schedule?startDate=' + startDate + '&endDate=' + endDate);
    };

    this.swapSchedule = function (originSchedule, targetSchedule) {
        return $http.post('/services/schedule/swap', {originSchedule: originSchedule, targetSchedule: targetSchedule});
    };

    this.undoableSchedule = function (schedule) {
        return $http.post('/services/schedule/undoable', {schedule: schedule});
    };
}

module.exports = scheduleService;