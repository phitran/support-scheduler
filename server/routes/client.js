const clientHandler = require('../handlers/clientHandler');
const authHandler = require('../handlers/authHandler');

module.exports = [
    {
        method: 'GET',
        path: '/{p*}',
        handler: clientHandler
    },
    {

        method: 'POST',
        path: '/auth/login',
        handler: authHandler,
        config: {
            auth: {
                strategy: 'loginAuth',
                payload: 'required'
            }
        }
    }
];