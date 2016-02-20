module.exports = [{
    method: ['GET'],
    path: '/test',
    config: {
        handler: function (request, reply) {
            return reply('yay2');
        }
    }
}];