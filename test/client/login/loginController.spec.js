'use strict';

require('karma-jasmine');
require('jasmine-expect');

var app = require('../../../app/app.js');
var loginController = require('../../../app/login/loginController.js');

describe(loginController.name, function () {
    var controller,
        scope,
        serviceDeferred,
        state = {
            go: function () {
            }
        },
        loginService = {
            login: function () {
            }
        };

    beforeEach(angular.mock.module(app.name));

    beforeEach(inject(function ($rootScope, $q) {
        scope = $rootScope.$new();
        serviceDeferred = $q.defer();

        loginService.login = jasmine.createSpy().and.returnValue(serviceDeferred.promise);

        controller = new loginController(state, loginService);
    }));

    it('init', function () {
        var payload = {username: 'foo', password: 'bar'};
        spyOn(state, 'go');
        serviceDeferred.resolve({});

        controller.login(payload);
        scope.$apply();

        expect(state.go).toHaveBeenCalled();
    });
});