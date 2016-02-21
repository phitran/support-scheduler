'use strict';

const Boom = require('boom');
const Joi = require('joi');
const _get = require('lodash/get');
const _random = require('lodash/random');
const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;
const mongoIdValidation = [Joi.string().hex().length(24).optional(), Joi.string().length(12).optional()];
const url = 'mongodb://localhost:27017/support-schedule';
const moment = require('moment');

function queryCollection(collection, options) {
    return new Promise((resolve, reject) => {
        mongoClient.connect(url, (err, db) => {
            if (err) {
                reject(Boom.badRequest(err));
            }

            db.collection(collection).find(options).toArray((err, items) => {
                if (err) {
                    db.close();
                    reject(Boom.badRequest(err));
                }

                db.close();
                resolve(items);
            });
        });
    });
}

function updateDocument(collection, filter, options) {
    return new Promise((resolve, reject) => {
        mongoClient.connect(url, (err, db) => {
            if (err) {
                reject(Boom.badRequest(err));
            }

            return db.collection(collection).updateOne(filter, options).then(value => {
                return db.collection(collection).find(filter).limit(1).next((err, document) => {
                    if (err) {
                        reject(Boom.badRequest(err));
                    }

                    resolve(document);
                    db.close();
                });
            }, err => {
                reject(err);
                db.close();
            });
        });
    });
}

function aggregateSchecduleCollection(matchers) {
    let pipeline = [
        {
            $lookup: {
                from: 'calendar',
                localField: 'calendarId',
                foreignField: '_id',
                as: 'day'
            }
        },
        {
            $unwind: '$day'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        }
    ];

    //merge matchers into pipline
    pipeline = pipeline.concat(matchers);

    return new Promise((resolve, reject) => {
        mongoClient.connect(url, function (err, db) {
            if (err) {
                reject(Boom.badRequest(err))
            }

            db.collection('schedule').aggregate(pipeline, (err, result) => {
                if (err) {
                    reject(Boom.badRequest(err))
                }

                db.close();
                resolve(result);
            })
        });
    });
}

module.exports = [
    {
        method: 'GET',
        path: '/services/user/{userId*}',
        config: {
            validate: {
                query: {}, //disallow any query params
                params: {
                    userId: mongoIdValidation
                }
            }
        },
        handler: function (request, reply) {
            const userId = _get(request.params, 'userId');
            const options = userId ? {"_id": new mongo.ObjectID(userId)} : {};

            queryCollection('users', options).then(value => {
                const payload = userId ? value[0] : value;
                reply(payload).code(200);
            }, err => {
                reply(Boom.badRequest(err));
            });
        }
    },
    {
        method: 'GET',
        path: '/services/calendar',
        config: {
            validate: {
                query: {
                    startDate: Joi.date().iso().required(),
                    endDate: Joi.date().iso().required()
                }
            }
        },
        handler: function (request, reply) {
            const options = {
                date: {
                    $gte: new Date(request.url.query.startDate),
                    $lte: new Date(request.url.query.endDate)
                }
            };

            queryCollection('calendar', options).then(value => {
                reply(value).code(200);
            }, err => {
                reply(Boom.badRequest(err));
            });
        }
    },
    {
        method: 'GET',
        path: '/services/schedule/{userId*}',
        config: {
            validate: {
                query: {
                    month: Joi.number().integer().required()
                },
                params: {
                    userId: mongoIdValidation
                }
            }
        },
        handler: function (request, reply) {
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

            aggregateSchecduleCollection(getScheduleMatcher).then(result => {
                reply(result).code(200);
            }, err => {
                reply(Boom.badRequest(err));
            });
        }
    },
    {
        method: 'POST',
        path: '/services/schedule/swap',
        config: {
            validate: {
                query: {},
                payload: {
                    originSchedule: Joi.object().keys({
                        _id: mongoIdValidation,
                        userId: mongoIdValidation,
                        calendarId: mongoIdValidation
                    }),
                    targetSchedule: Joi.object().keys({
                        _id: mongoIdValidation,
                        userId: mongoIdValidation,
                        calendarId: mongoIdValidation
                    })
                }
            }
        },
        handler: function (request, reply) {
            const origin = request.payload.originSchedule;
            const target = request.payload.targetSchedule;

            const promises = [
                updateDocument('schedule', {_id: new mongo.ObjectID(origin._id)}, {$set: {userId: new mongo.ObjectID(target.userId)}}),
                updateDocument('schedule', {_id: new mongo.ObjectID(target._id)}, {$set: {userId: new mongo.ObjectID(origin.userId)}})
            ];

            Promise.all(promises).then(values => {
                var response = {
                    originSchedule: values[0],
                    targetSchedule: values[1]
                };

                reply(response).code(200);
            });
        }
    },
    {
        method: 'POST',
        path: '/services/schedule/undoable',
        config: {
            validate: {
                query: {},
                params: {
                    schedule: {
                        _id: mongoIdValidation,
                        userId: mongoIdValidation,
                        calendarId: mongoIdValidation
                    }
                }
            }
        },
        handler: function (request, reply) {
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
            aggregateSchecduleCollection(idMatcher)
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
                    return aggregateSchecduleCollection(montYearMatcher);
                })
                .then(currentMonthSchedules => {
                    //create array of UserIds
                    const currentMonthUserIds = [];
                    currentMonthSchedules.forEach((value, index) => {
                        currentMonthUserIds.push(value.user._id)
                    });

                    //get all users not schedule for current month
                    return queryCollection('users', {_id: {$nin: currentMonthUserIds}});
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
                    return aggregateSchecduleCollection(poolOfUserSchedulesMatcher);
                })
                .then(poolOfUserSchedules => {
                    //pick random user from pool and swap times
                    const randomUser = _random(0, poolOfUserSchedules.length);
                    const promises = [
                        updateDocument('schedule', {_id: requestedSchedule._id}, {$set: {userId: poolOfUserSchedules[randomUser].userId}}),
                        updateDocument('schedule', {_id: poolOfUserSchedules[randomUser]._id}, {$set: {userId: requestedSchedule.userId}})
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
    }

];