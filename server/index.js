'use strict';

const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');
const BasicAuth = require('hapi-auth-basic');
const config = require('./config');

const server = new Hapi.Server(config.get('/server'));
const routes = require('./routes');
const loginScheme = require('./auth/loginAuthScheme');
server.connection(config.get('/connections'));

server.register([Vision, Inert, BasicAuth], (err) => {
    if (err) {
        throw err;
    }

    server.auth.scheme( 'loginScheme', loginScheme );
    server.auth.strategy( 'loginAuth', 'loginScheme', null);

    server.auth.strategy( 'basicAuth', 'basic', {
        validateFunc: (request, username, password, callback) => {
            if (!username) {
                return callback(null, false);
            }

            callback(err, true, { id: 1, name: 'Phi', username: 'ptran' });
        }
    });

    server.route(routes);

    server.views(config.get('/views'));

    server.start(err => {
        if (err) {
            console.error(err);
        }

        console.log('Server running at:', server.info.uri);
    });
});


