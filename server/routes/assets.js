'use strict';

const assets = [
    {
        method: 'GET',
        path: '/js/{p*}',
        handler: {
            directory: {
                path: './dist/js'
            }
        }
    },
    {
        method: 'GET',
        path: '/css/{p*}',
        handler: {
            directory: {
                path: './dist/css'
            }
        }
    },
    {
        method: 'GET',
        path: '/favicon.ico',
        config: {
            handler: {
                file: './server/favicon.ico'
            },
            cache: {
                expiresIn: 86400000, //one day
                privacy: 'public'
            }
        }
    }
];

module.exports = assets;