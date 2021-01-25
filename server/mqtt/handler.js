let tempFlag = false;
let ZimoCallbackService = require(`../api/services/zimoCallback`);

module.exports = {
    message: function (topic, message, packet) {
        let data = JSON.parse(message.toString());
        let imei = topic.toString().substr(sails.config.ZIMO_TOPIC_URL.toString().length);
        if (data.mt) {
            ZimoCallbackService[`mt${data.mt}Received`](imei, data);
        } else {
            ZimoCallbackService.otherDataReceived(topic, data);
        }

        sails.log.silly(topic, message.toString());
    },

    connect: function (connack) {
        console.log('mqtt connected');
        sails.log.info('service started....');
        ZimoCallbackService.subscribeScooter();
        tempFlag = true;
    },

    reconnect: function () {
        if (tempFlag) {
            sails.log.info('reconnecting....');
            tempFlag = false;
            ZimoCallbackService.subscribeScooter();
        }

    },

    close: function () {
        if (tempFlag) {
            sails.log.info('service closed');
            tempFlag = false;

            return;
        }
    },

    offline: function () {
        if (tempFlag) {
            sails.log.info('broker is offline');
            // tempFlag = false;
        }
    },

    error: function (error) {
        sails.log.info('\n\n\nSome thing went wrong!!\n\n\n', error);
    },

    packetsend: function (packet) {
        // sails.log.info("packetsend", packet.cmd);

    },

    packetreceive: function (packet) {
        // sails.log.info("packetreceive", packet.cmd);
    }

};
