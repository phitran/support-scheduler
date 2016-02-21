'use strict';

const Boom = require('boom');
const apiHelper = require('./apiHelper');

function getCalendar(request, reply) {
    const options = {
        date: {
            $gte: new Date(request.url.query.startDate),
            $lte: new Date(request.url.query.endDate)
        }
    };

    apiHelper.queryCollection('calendar', options).then(value => {
        reply(value).code(200);
    }, err => {
        reply(Boom.badRequest(err));
    });
}

module.exports = {
    getCalendar: getCalendar
};