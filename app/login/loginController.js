'use strict';

angular
    .module('SupportScheduler')
    .controller('loginController', loginController);

loginController.$inject = ['$state', '$timeout', 'loginService'];
function loginController($state, $timeout, loginService) {
    var vm = this;

    /* public method */
    vm.login = login;

    /* public members */
    vm.loginFailed = false;

    function login(credentials) {
        loginService.login(credentials.username, credentials.password).then(function(response) {
            $state.go('schedule', {userContext: response.data});
        }, function(err) {
            vm.loginFailed = true;

            $timeout(function() {
                vm.loginFailed = false;
            }, 1300);
        });
    }
}

module.exports = loginController;