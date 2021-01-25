module.exports = {
    datastores: {
        default: {
            adapter: 'sails-mongo'
        },
    },
    models: {
        migrate: 'safe',
    },
    blueprints: {
        shortcuts: false,
    },
    security: {
        // cors: {
        //     allRoutes: true,
        //     allowOrigins: ['http://localhost:3011']
        // },
    },
    session: {
        cookie: {
            // secure: true,
            maxAge: 24 * 60 * 60 * 1000,  // 24 hours
        },
    },
    sockets: {
        beforeConnect: function (handshake, cb) {
            return cb(null, true);
        }
    },
    log: {
        level: 'debug'
    },
    http: {
        cache: 365.25 * 24 * 60 * 60 * 1000, // One year
        // trustProxy: true,
    },
    port: 1376,
    // ssl: undefined,
    custom: {
        internalEmailAddress: 'support@example.com',
    }
};
