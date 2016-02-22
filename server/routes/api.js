'use strict';

const Joi = require('joi');
const mongoIdValidation = [Joi.string().hex().length(24).optional(), Joi.string().length(12).optional()];
const api = require('../handlers/api');

module.exports = [
    {
        method: 'GET',
        path: '/services/schedule/{userId*}',
        config: {
            validate: {
                query: {
                    startDate: Joi.date().iso().required(),
                    endDate: Joi.date().iso().required()
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
                    }).unknown(),
                    targetSchedule: Joi.object().keys({
                        _id: mongoIdValidation,
                        userId: mongoIdValidation,
                        calendarId: mongoIdValidation
                    }).unknown()
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
                payload: {
                    schedule: Joi.object().keys({
                        _id: mongoIdValidation,
                        userId: mongoIdValidation,
                        calendarId: mongoIdValidation
                    }).unknown()
                }
            }
        },
        handler: api.undoableScheduleHandler
    }
];