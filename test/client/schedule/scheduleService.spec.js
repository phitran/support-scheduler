'use strict';

require('karma-jasmine');
require('jasmine-expect');

var app = require('../../../app/app.js');
var scheduleService = require('../../../app/schedule/scheduleService.js');

describe(scheduleService.name, function () {
    var service,
        scope,
        http;

    beforeEach(angular.mock.module(app.name));

    beforeEach(inject(function ($rootScope, $http) {
        scope = $rootScope.$new();
        http = $http;

        service = new scheduleService(http);
    }));

    describe('getSchedule', function () {
        it('request', function () {
            var startDate = new Date().toISOString(),
                endDate = new Date().toISOString();
            var spy = spyOn(service, 'getSchedule');

            service.getSchedule(startDate, endDate);

            expect(spy).toHaveBeenCalledWith(startDate, endDate);
        });
    });

    describe('swapSchedule', function () {
        it('request', function () {
            var originSchedule = {foo: 'bar'},
                targetSchedule = {foo2: 'bar2'};
            var spy = spyOn(service, 'swapSchedule');

            service.swapSchedule(originSchedule, targetSchedule);

            expect(spy).toHaveBeenCalledWith(originSchedule, targetSchedule);
        });
    });

    describe('undoableSchedule', function () {
        it('request', function () {
            var schedule = {foo: 'bar'};
            var spy = spyOn(service, 'undoableSchedule');

            service.undoableSchedule(schedule);

            expect(spy).toHaveBeenCalledWith(schedule);
        });
    });
});