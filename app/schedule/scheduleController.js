'use strict';

angular
    .module('SupportScheduler')
    .controller('scheduleController', scheduleController);

scheduleController.$inject = ['$state'];
function scheduleController($state) {
    var vm = this;

    /* public method */

    /* public members */

    console.log('yay');

}

module.exports = scheduleController;