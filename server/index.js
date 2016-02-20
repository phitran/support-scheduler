'use strict';

const Hapi = require('hapi');
const Vision = require('vision');
const config = require('./config');

const server = new Hapi.Server(config.get('/server'));
server.connection(config.get('/connections'));

server.register([Vision], (err) => {
    if (err) {
        throw err;
    }

    // Add the route
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            return reply('yay');
        }
    });

    // Start the server
    server.start(err => {
        console.log('Server running at:', server.info.uri);
    });
});


