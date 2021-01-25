const SeederService = require('../api/services/seeder');
const CommonService = require('../api/services/common');
// const ZimoServer = require('../api/services/IOT/ZIMO/Scooter/MQTT/server');
const commonTCPServer = require('../api/services/commonTCPServer');
// const commonMQTTServer = require('../api/services/IOT/commonMqttServer');

module.exports.bootstrap = async function (done) {
    await SeederService.seedAllConfigs();

    console.log('before initializeApp');
    await CommonService.initializeApp();
    sails.config.RIDES_ARRAY = [];
    sails.config.ADMIN_USER_SOCKET_ARRAY = [];
    // await ZimoServer.startServer();
    await commonTCPServer.startServer();
    // await commonMQTTServer.startServer();

    return done();
};
