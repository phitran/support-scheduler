angular
    .module('SupportScheduler')
    .service('loginService', loginService);

loginService.$inject = ['$http'];
function loginService($http) {
    this.login = function (username, password) {
        return $http.post('/auth/login', {username: username, password: password});
    }
}

module.exports = loginService;