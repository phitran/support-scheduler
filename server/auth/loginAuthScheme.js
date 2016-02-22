'use strict';

// Load modules
const Boom = require('boom');
const apiHelper = require('../handlers/api/apiHelper');

function loginAuthScheme(server, options) {
    const scheme = {
        authenticate: function (request, reply) {
            return reply.continue({credentials: {}});
        },
        payload: function (request, reply) {
            apiHelper.queryCollection('users', {username: request.payload.username.toLowerCase()}).then(user => {
                const currentUser = user[0];

                if (currentUser.length === 0) {
                    return reply(Boom.unauthorized('invalid user or passowrd'));
                }

                if (currentUser.password === request.payload.password) {
                    const response = {
                        userId: currentUser._id,
                        username: currentUser.username,
                        name: currentUser.name
                    };

                    request.auth.credentials = response;

                    return reply.continue();
                } else {
                    return reply(Boom.unauthorized('invalid user or passowrd'));
                }
            }, err => {
                return reply(Boom.unauthorized(err));
            });
        }
    };

    return scheme;
}

module.exports = loginAuthScheme;