const clientRoutes = require('./client');
const apiRoutes = require('./api');

const routes = apiRoutes.concat( clientRoutes );

module.exports = routes;