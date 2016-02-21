'use strict';

angular
    .module('SupportScheduler')
    .controller('loginController', loginController);

loginController.$inject = ['$state', 'loginService'];
function loginController($state, loginService) {
    var vm = this;

    /* public method */
    vm.login = login;

    /* public members */

    function login( credentials ) {
        loginService.login(credentials.username, credentials.password).then( response => {
            $state.go('schedule', {userContext: response.data});
        }, err => {
            console.log(err);
        });
    }
}

module.exports = loginController;