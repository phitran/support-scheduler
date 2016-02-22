'use strict';

const Boom = require('boom');
const apiHelper = require('./apiHelper');
const mongo = require('mongodb');
const _get = require('lodash/get');
const _random = require('lodash/random');

/**
 * query schedule through a start and end range.
 * optional userId
 * @param request
 * @param reply
 */
function getScheduleHandler(request, reply) {
    const userId = _get(request.params, 'userId');
    const getScheduleMatcher = [
        {
            $match: {
                "date.date": {$gte: new Date(request.query.startDate), $lte: new Date(request.query.endDate)}
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

/**
 * swap userIds on the schedule record
 * from the request
 * @param request
 * @param reply
 */
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

/**
 * Search the next months schedules
 * and pick a random schedule to swap
 * @param request
 * @param reply
 */
function undoableScheduleHandler(request, reply) {
    const requestedSchedule = request.payload.schedule;

    //get calendar info from passed in schedule
    apiHelper.queryCollection('calendar', {_id: new mongo.ObjectID(requestedSchedule.calendarId)})
        .then(calendarRecord => {
            return calendarRecord;
        })
        .then(calendarRecord => {
            const undoableMatcher = [
                {
                    $match: {
                        "date.month": calendarRecord[0].month === 12 ? 1 : calendarRecord[0].month + 1
                    }
                },
                {
                    $match: {
                        "date.year": calendarRecord[0].month === 12 ? calendarRecord[0].year + 1 : calendarRecord[0].year
                    }
                },
                {
                    $match: {
                        $and: [
                            {"userId": {$ne: new mongo.ObjectID(requestedSchedule.userId)}},
                            {"userId": {$ne: null}}
                        ]
                    }
                }
            ];

            return apiHelper.aggregateScheduleCollection(undoableMatcher);
        })
        .then(schedules => {
            const randomSchedule = schedules[_random(0, schedules.length)];
            const promises = [
                apiHelper.updateDocument('schedule', {_id: randomSchedule._id}, {$set: {userId: new mongo.ObjectID(requestedSchedule.userId)}}),
                apiHelper.updateDocument('schedule', {_id: new mongo.ObjectID(requestedSchedule._id)}, {$set: {userId: randomSchedule.userId}})
            ];

            return Promise.all(promises);
        })
        .then(updatedSchedules => {
            var response = {
                originalSchedule: updatedSchedules[0],
                newSchedule: updatedSchedules[1]
            };

            reply(response).code(200);
        })
        .catch(err => {
            reply(Boom.badRequest(err));
        });
}

module.exports = {
    getScheduleHandler: getScheduleHandler,
    swapScheduleHandler: swapScheduleHandler,
    undoableScheduleHandler: undoableScheduleHandler
};