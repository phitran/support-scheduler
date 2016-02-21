const clientRoutes = require('./client');
const apiRoutes = require('./api');
const assetsRoutes = require('./assets');

const routes = apiRoutes.concat(clientRoutes).concat(assetsRoutes);

module.exports = routes;