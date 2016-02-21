'use strict';

angular
    .module('SupportScheduler')
    .controller('loginController', loginController);

loginController.$inject = [];
function loginController() {
    var vm = this;

    console.log('yay');
}

module.exports = loginController;