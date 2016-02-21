'use strict';

const Joi = require('joi');
const mongoIdValidation = [Joi.string().hex().length(24).optional(), Joi.string().length(12).optional()];
const api = require('../handlers/api');

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
        handler: api.getUserHandler
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
        handler: api.getCalendarHandler
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
        handler: api.getScheduleHandler
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
        handler: api.swapScheduleHandler
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
        handler: api.cancelScheduleHandler
    }
];