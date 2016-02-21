'use strict';

const Boom = require('boom');
const apiHelper = require('./apiHelper');
const mongo = require('mongodb');
const _get = require('lodash/get');
const _random = require('lodash/random');

function getScheduleHandler(request, reply) {
    const userId = _get(request.params, 'userId');
    const getScheduleMatcher = [
        {
            $match: {
                "day.month": request.query.month
            }
        }
    ];

    if (userId) {
        getScheduleMatcher.push({
            $match: {
                "userId": new mongo.ObjectID(userId)
            }
        });
    }

    apiHelper.aggregateScheduleCollection(getScheduleMatcher).then(result => {
        reply(result).code(200);
    }, err => {
        reply(Boom.badRequest(err));
    });
}

function swapScheduleHandler(request, reply) {
    const origin = request.payload.originSchedule;
    const target = request.payload.targetSchedule;

    const promises = [
        apiHelper.updateDocument('schedule', {_id: new mongo.ObjectID(origin._id)}, {$set: {userId: new mongo.ObjectID(target.userId)}}),
        apiHelper.updateDocument('schedule', {_id: new mongo.ObjectID(target._id)}, {$set: {userId: new mongo.ObjectID(origin.userId)}})
    ];

    Promise.all(promises).then(values => {
        var response = {
            originSchedule: values[0],
            targetSchedule: values[1]
        };

        reply(response).code(200);
    });
}

function cancelScheduleHandler(request, reply) {
    /**
     * get current Schedule (month, year)
     * get all schedules in month
     * get all users not scheduled in current Month
     * pick random
     */
    const idMatcher = [
        {
            $match: {
                "_id": new mongo.ObjectID(request.payload.schedule._id)
            }
        }
    ];
    let requestedSchedule = null;

    //get current schedule from request
    apiHelper.aggregateScheduleCollection(idMatcher)
        .then(currentSchedule => {
            requestedSchedule = currentSchedule[0];
            const montYearMatcher = [
                {
                    $match: {
                        "day.month": requestedSchedule.day.month
                    }
                },
                {
                    $match: {
                        "day.year": requestedSchedule.day.year
                    }
                }
            ];

            //get schedule for current month/year
            return apiHelper.aggregateScheduleCollection(montYearMatcher);
        })
        .then(currentMonthSchedules => {
            //create array of UserIds
            const currentMonthUserIds = [];
            currentMonthSchedules.forEach((value, index) => {
                currentMonthUserIds.push(value.user._id)
            });

            //get all users not schedule for current month
            return apiHelper.queryCollection('users', {_id: {$nin: currentMonthUserIds}});
        })
        .then(poolOfUser => {
            //create array of UserIds
            const poolOfUserId = [];
            poolOfUser.forEach((value, index) => {
                poolOfUserId.push(value._id);
            });

            const poolOfUserSchedulesMatcher = [
                {
                    $match: {
                        userId: {
                            $in: poolOfUserId
                        }
                    }
                },
                {
                    $match: {
                        "day.month": requestedSchedule.day.month === 12 ? 1 : requestedSchedule.day.month + 1
                    }
                },
                {
                    $match: {
                        "day.year": requestedSchedule.day.month === 12 ? requestedSchedule.day.year + 1 : requestedSchedule.day.year
                    }
                }
            ];

            //get next months schedule for pool of users
            return apiHelper.aggregateScheduleCollection(poolOfUserSchedulesMatcher);
        })
        .then(poolOfUserSchedules => {
            //pick random user from pool and swap times
            const randomUser = _random(0, poolOfUserSchedules.length);
            const promises = [
                apiHelper.updateDocument('schedule', {_id: requestedSchedule._id}, {$set: {userId: poolOfUserSchedules[randomUser].userId}}),
                apiHelper.updateDocument('schedule', {_id: poolOfUserSchedules[randomUser]._id}, {$set: {userId: requestedSchedule.userId}})
            ];

            Promise.all(promises).then(values => {
                var response = {
                    originalSchedule: values[0],
                    newSchedule: values[1]
                };

                reply(response).code(200);
            });
        })
        .catch(err => {
            reply(Boom.badRequest(err));
        });
}

module.exports = {
    getScheduleHandler: getScheduleHandler,
    swapScheduleHandler: swapScheduleHandler,
    cancelScheduleHandler: cancelScheduleHandler
};