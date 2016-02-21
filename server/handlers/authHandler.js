function authHandler(request, reply) {
    return reply(request.auth.credentials);
}

module.exports = authHandler;