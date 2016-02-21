const clientHandler = require('../handlers/clientHandler');

module.exports = [{
    method: ['GET'],
    path: '/{p*}',
    handler: clientHandler
}];