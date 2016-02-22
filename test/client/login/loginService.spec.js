'use strict';

require('karma-jasmine');
require('jasmine-expect');

var app = require('../../../app/app.js');
var loginService = require('../../../app/login/loginService.js');

describe(loginService.name, function () {
    var service,
        scope,
        http;

    beforeEach(angular.mock.module(app.name));

    beforeEach(inject(function ($rootScope, $http) {
        scope = $rootScope.$new();
        http = $http;

        service = new loginService(http);
    }));

    it('login', function () {
        var payload = {username: 'foo', password: 'bar'};
        var spy = spyOn(service, 'login');

        service.login(payload);

        expect(spy).toHaveBeenCalledWith(payload);
    });
});