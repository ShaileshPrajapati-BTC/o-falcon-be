module.exports = {
  datastores: {
    default: {
      adapter: "sails-mongo",
      url: 'mongodb://12.0.1.246:27017/O-Falcon',
      // sets the max retry times(seconds)
      reconnectTries: 600,
      // sets the delay between every retry (milliseconds)
      reconnectInterval: 2000
    }
  },
  models: {
    migrate: "safe"
  },
  blueprints: {
    shortcuts: false
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
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  sockets: {

  },
  log: {
    level: "debug"
  },
  http: {
    cache: 365.25 * 24 * 60 * 60 * 1000 // One year
    // trustProxy: true,
  },
  port: 1381,
  // ssl: undefined,
  custom: {
    internalEmailAddress: "support@example.com",
    baseUrl: 'https://admin.falconride.io'
  }
};
