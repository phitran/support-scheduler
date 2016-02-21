'use strict';

const Boom = require('boom');
const apiHelper = require('./apiHelper');
const mongo = require('mongodb');
const _get = require('lodash/get');

function getUserHandler(request, reply) {
    const userId = _get(request.params, 'userId');
    const options = userId ? {"_id": new mongo.ObjectID(userId)} : {};

    apiHelper.queryCollection('users', options).then(value => {
        const payload = userId ? value[0] : value;
        reply(payload).code(200);
    }, err => {
        reply(Boom.badRequest(err));
    });
}

module.exports = {
    getUserHandler: getUserHandler
};