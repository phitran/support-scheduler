'use strict';

require('karma-jasmine');
require('jasmine-expect');

var moment = require('moment');
var app = require('../../../app/app.js');
var scheduleController = require('../../../app/schedule/scheduleController.js');
var currentDayFixture = {
    "_id": "56ca8baa9dad165a721cdade",
    "userId": null,
    "calendarId": "56ca8baa9dad165a721cd965",
    "date": {
        "_id": "56ca8baa9dad165a721cd965",
        "date": "2016-02-28T08:00:00.000Z",
        "month": 2,
        "day": 28,
        "year": 2016,
        "isWeekend": true,
        "isHoliday": false,
        "description": ""
    },
    "user": [{"_id": "56ca8baa9dad165a721cdaa3", "name": "Luis", "username": "luis"}]
};

describe(scheduleController.name, function () {
    var controller,
        scope,
        serviceDeferred,
        userContext = {
            userId: 'foo',
            name: 'name',
            username: 'username'
        },
        scheduleService = {
            getSchedule: function () {
            },
            swapSchedule: function () {
            },
            undoableSchedule: function () {
            }
        };

    beforeEach(angular.mock.module(app.name));

    beforeEach(inject(function ($rootScope, $q) {
        scope = $rootScope.$new();
        serviceDeferred = $q.defer();

        scheduleService.getSchedule = jasmine.createSpy().and.returnValue(serviceDeferred.promise);
        scheduleService.swapSchedule = jasmine.createSpy().and.returnValue(serviceDeferred.promise);

        controller = new scheduleController(userContext, scheduleService);
    }));

    describe('init', function () {
        it('get initial schedule for current date', function () {
            var response = {data: []};
            serviceDeferred.resolve(response);
            // needed to resolve the promise
            scope.$apply();

            expect(controller.days).toEqual([]);
            expect(controller.today).toEqual(moment().hour(0).minute(0).seconds(0).milliseconds(0));
        });
    });

    describe('isWorkday', function () {
        it('is not a workday/holiday', function () {
            var mockArgument = {
                date: {
                    isHoliday: true,
                    isWeekend: false
                }
            };

            var response = controller.isWorkday(mockArgument);
            expect(response).toBeFalse();
        });

        it('is not a work day/weekend', function () {
            var mockArgument = {
                date: {
                    isHoliday: false,
                    isWeekend: true
                }
            };

            var response = controller.isWorkday(mockArgument);
            expect(response).toBeFalse();
        });

        it('is a work day', function () {
            var mockArgument = {
                date: {
                    isHoliday: false,
                    isWeekend: false
                }
            };

            var response = controller.isWorkday(mockArgument);
            expect(response).toBeTrue();
        });
    });

    describe('isSupportHero', function () {
        it('is not supporthero', function () {
            var mockArgument = {
                user: [{
                    _id: 'foo2'
                }]
            };

            var response = controller.isSupportHero(mockArgument);
            expect(response).toBeFalse();
        });

        it('is supporthero', function () {
            var mockArgument = {
                user: [{
                    _id: 'foo'
                }]
            };

            var response = controller.isSupportHero(mockArgument);
            expect(response).toBeTrue();
        });
    });

    describe('isToday', function () {
        it('is today', function () {
            var mockArgument = {
                date: {
                    date: moment().toISOString()
                }
            };

            var response = controller.isToday(mockArgument);
            expect(response).toBeTrue();
        });

        it('is not today', function () {
            var mockArgument = {
                date: {
                    date: moment().add(2, 'd').toISOString()
                }
            };

            var response = controller.isToday(mockArgument);
            expect(response).toBeFalse();
        });

        it('set supporthero', function () {
            var mockArgument = {
                date: {
                    date: moment().toISOString()
                },
                user: [{
                    _id: 'foo',
                    name: 'foo'
                }]
            };

            controller.isToday(mockArgument);
            expect(controller.supportHero).toEqual('foo');
        });

        it('no supporthero', function () {
            var mockArgument = {
                date: {
                    date: moment().toISOString()
                },
                user: []
            };

            controller.isToday(mockArgument);
            expect(controller.supportHero).toEqual('None');
        });
    });

    describe('isThePast', function () {
        it('past', function () {
            var mockArgument = {
                date: {
                    date: moment().subtract(2, 'd').toISOString()
                }
            };

            var response = controller.isThePast(mockArgument);
            expect(response).toBeTrue();
        });

        it('future', function () {
            var mockArgument = {
                date: {
                    date: moment().toISOString()
                }
            };

            var response = controller.isThePast(mockArgument);
            expect(response).toBeFalse();
        });
    });

    describe('isCurrentMonth', function () {
        it('is current month', function () {
            var mockArgument = {
                date: {
                    month: parseInt(moment().format('M'))
                }
            };

            var response = controller.isCurrentMonth(mockArgument);
            expect(response).toBeTrue();
        });

        it('is not current month', function () {
            var mockArgument = {
                date: {
                    month: parseInt(moment().add(1, 'M').format('M'))
                }
            };

            var response = controller.isCurrentMonth(mockArgument);
            expect(response).toBeFalse();
        });
    });

    describe('swap schedules', function () {
        it('initiate swapSchedules', function () {
            var mockArgument = 'foo';

            controller.swapSchedules(mockArgument);

            expect(controller.isSwapping).toBeTrue();
            expect(controller.swapContext.origin).toEqual(mockArgument);
        });

        it('confirm swap', function () {
            var mockArgument = 'bar';
            controller.confirmSwapSchedule(mockArgument);

            serviceDeferred.resolve({});

            expect(controller.swapContext.target).toEqual(mockArgument);
        });

        it('cancel swap', function () {
            controller.isSwapping = true;
            controller.swapContext = {
                origin: 'foo',
                target: 'bar'
            };

            controller.resetSwapContext();

            expect(controller.swapContext.origin).toBeNull();
            expect(controller.swapContext.target).toBeNull();
            expect(controller.isSwapping).toBeFalse();
        });
    });
});