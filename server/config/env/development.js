module.exports = {
    datastores: {
        default: {
            adapter: 'sails-mongo',
            url: 'mongodb://127.0.0.1:27017/O-Falcon',
            // sets the max retry times(seconds)
            reconnectTries: 600,
            // sets the delay between every retry (milliseconds)
            reconnectInterval: 2000
        }
    },
    models: {
        migrate: 'safe'
    },
    blueprints: {
        shortcuts: false
    },
    security: {
        cors: {
            allRoutes: true,
            allowOrigins: ['http://localhost:3000']
        }
    },
    session: {
        cookie: {
            // secure: true,
            // 24 hours
            maxAge: 24 * 60 * 60 * 1000
        }
    },
    sockets: {
        // onlyAllowOrigins: [
        //   'https://example.com',
        //   'https://staging.example.com',
        // ],
    },

    log: {
        level: 'debug'
    },
    http: {
        // One year
        cache: 365.25 * 24 * 60 * 60 * 1000
        // trustProxy: true,
    },
    port: 1381,
    // ssl: undefined,
    custom: {
        internalEmailAddress: 'support@example.com'
    }
};
