function clientHandler(request, reply) {
    return reply.view('index');
}

module.exports = clientHandler;