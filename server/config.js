
const Confidence = require( 'confidence' );
const ejs = require( 'ejs' );
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development' ;
const criteria = {
    env: env
};

const store = new Confidence.Store( {
    server: {
        debug: {
            log: [
                'bootup'
            ],
            request: [
                'error',
                'received',
                'handler',
                'response'
            ]
        }
    },
    connections: {
        host: "0.0.0.0",
            port: 8080
    },
    views: {
        engines: {
            'ejs': ejs
        },
        relativeTo: './server/views'
    }
} );

exports.get = function ( key ) {
    return store.get( key, criteria );
};