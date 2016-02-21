'use strict';

const Hapi = require('hapi');
const Vision = require('vision');
const config = require('./config');

const server = new Hapi.Server(config.get('/server'));
const routes = require('./routes');
server.connection(config.get('/connections'));

server.register([Vision], (err) => {
    if (err) {
        throw err;
    }

    server.route(routes);

    server.views(config.get('/views'));

    server.start(err => {
        console.log('Server running at:', server.info.uri);
    });
});


