const clientHandler = require('../handlers/clientHandler');

module.exports = [{
    method: ['GET'],
    path: '/',
    handler: clientHandler
}];