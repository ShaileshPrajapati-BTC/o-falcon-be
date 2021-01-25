const ZimoCallbackService = require('./callback');
module.exports = {
    async startServer() {
        const aedes = require('aedes')();
        let port = 1883;
        let clients = {};
        aedes.authenticate = function (client, username, password, callback) {
            console.log('in authenticate');
            let authorized = username === 'FalconScooterAdmin' && password.toString() === 'Scooter@Falcon';
            if (authorized) {
                client.user = username;
            } else {
                let error = new Error('Auth error');
                error.returnCode = 1;

                return callback(error, null);
            }

            return callback(null, authorized);
        };

        aedes.authorizePublish = function (client, packet, callback) {
            // let data = payload.toString();
            // console.log('client', client);
            let topic = packet.topic;
            let data = packet.payload.toString();
            data = JSON.parse(data);
            console.log('topic', topic);
            console.log('data', data);

            let imei = topic.toString().substr(sails.config.ZIMO_TOPIC_URL.toString().length);
            if (!clients[imei]) {
                clients[imei] = client.id;
            }
            if (data.mt) {
                ZimoCallbackService[`mt${data.mt}Received`](imei, data);
            } else {
                ZimoCallbackService.otherDataReceived(topic, data);
            }

            callback(null);
        };

        aedes.authorizeSubscribe = function (client, sub, callback) {
            // let data = payload.toString();
            console.log('client', client.id);
            let imei = sub.topic;
            // console.log('topic', imei);
            // let imei = topic.toString().substr(sails.config.ZIMO_TOPIC_URL.toString().length);
            if (!clients[imei]) {
                clients[imei] = client.id;
            }

            callback(null, sub);
        };

        sails.config.mqttServer = {};

        sails.config.mqttServer.publish = (topic, qos, data, callback) => {
            console.log(`in mqttServer.publish topic = ${topic}, data = ${data}`);
            let message = {
                cmd: 'publish',
                qos: qos,
                topic: topic,
                payload: data,
                retain: false
            };
            let clientId = clients[topic];
            if (!aedes.clients[clientId]) {
                console.log('Scooter is not connected!');

                return callback('Scooter is not connected!');
            }
            aedes.clients[clientId].publish(message, callback);
            // aedes.publish(message, callback);
        };

        sails.config.mqttServer.subscribe = (topic, callback) => {
            console.log('in mqttServer.subscribe topic', topic);
            // console.log('in subscribe callback', callback);
            aedes.subscribe(topic, callback, callback);
        };

        const server = require('net').createServer(aedes.handle);
        server.listen(port, async () => {
            console.log('server listening on port', port);
            await ZimoCallbackService.subscribeScooter();
        });
    }
};
