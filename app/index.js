'use strict';
const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

require('./auth')();

// Create an IO Server instance
let ioServer = app => {
    app.locals.chatrooms = [];
    const server = require('http').Server(app);
    const io = require('socket.io')(server);
    //sticky session not supported on long polling
    //force io to use websocket as transport
    io.set('transports', ['websocket']);
    let pubClient = redis(config.redis.port, config.redis.host, {
        auth_pass: config.redis.password
    });
    let subClient = redis(config.redis.port, config.redis.host, {
        //return the data on its original state (not string)
        return_buffers:true,
        auth_pass: config.redis.password
    });

    io.adapter(adapter({
        pubClient,
        subClient
    }));

    io.use((socket, next) => {
        //read from express session
        require('./session')(socket.request, {}, next);
    });
    require('./socket')(io, app);
    return server;
};

module.exports = {
    router: require('./routes')(),//devuelve la instancia del router
    session: require('./session'),
    ioServer,
    logger: require('./logger'),
};