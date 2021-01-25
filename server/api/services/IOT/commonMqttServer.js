// const ZimoCallbackService = require('./callback');
const FitRiderCallbackService = require('./FITCOO/Scooter/MQTT/callback');
const ZimoCallbackService = require('./ZIMO/Scooter/MQTT/callback');
const UrbaneCallbackService = require('./URBANE/Scooter/MQTT/callback');

module.exports = {
    async startServer() {
        const aedes = require('aedes')();
        let port = 1883;
        let clients = {};
        let clientsImei = {};
        aedes.authenticate = async function (client, username, password, callback) {
            console.log('in authenticate');
            let authorized = false;
            username = username.toString();
            password = password.toString();

            switch (true) {
                case username === 'FalconScooterAdmin' && password === 'Scooter@Falcon':
                    authorized = true;
                    break;

                case password.startsWith('AES1280'):
                    let imei = username.substring(1, username.length);
                    let vehicle = await Vehicle.findOne({ imei: imei });
                    if (!vehicle || !vehicle.imei) {
                        return callback(null, false);
                    }
                    let matchPassword = `AES1280${vehicle.imei}`;
                    authorized = password.toString() === matchPassword;
                    if (authorized) {
                        await iotCallbackHandler.updateVehicle(vehicle, { connectionStatus: true });
                    }
                    break;

                // case 'URBANE_SCOOTER':
                //     authorized = true;
                //     break;

                default:
                    break;
            }
            if (!authorized) {
                let error = new Error('Auth error');
                error.returnCode = 1;

                return callback(error, null);
            } else {
                client.user = username;
            }

            return callback(null, authorized);
        };

        aedes.on('clientDisconnect', async (client) => {
            let imei = clientsImei[client.id];
            if (!imei) {
                return;
            }
            await rideBooking.updateDisconnectedVehicle(imei);
        });

        aedes.authorizePublish = function (client, packet, callback) {
            // let data = payload.toString();
            // console.log('client', client);
            let topic = packet.topic;
            let data = packet.payload.toString();
            try {
                data = JSON.parse(data);
            } catch (error) { }
            console.log('topic', topic);
            console.log('data', data);
            let actualCallback = data;
            let imei = '';
            let manufacturer = '';
            switch (true) {
                case topic.toString().startsWith(sails.config.ZIMO_TOPIC_URL):
                    imei = topic.toString().substr(sails.config.ZIMO_TOPIC_URL.toString().length);
                    manufacturer = sails.config.VEHICLE_MANUFACTURER.ZIMO;
                    break;

                case typeof data === 'object' && data.a !== 'undefined':
                    imei = data.i;
                    manufacturer = sails.config.VEHICLE_MANUFACTURER.FITRIDER_SCOOTER;
                    break;

                case (typeof data == 'string' && data.toLowerCase().startsWith('5e')):
                    data = UrbaneCallbackService.decodeCallback(data);
                    if (data.imei) {
                        imei = data.imei;
                    }
                    manufacturer = sails.config.VEHICLE_MANUFACTURER.URBANE_SCOOTER;
                    break;

                default:
                    break;
            }
            if (!clients[imei]) {
                clients[imei] = client.id;
                clientsImei[client.id] = imei;
            }
            switch (manufacturer) {
                case sails.config.VEHICLE_MANUFACTURER.ZIMO:
                    if (data.mt) {
                        ZimoCallbackService[`mt${data.mt}Received`](imei, data);
                    } else {
                        ZimoCallbackService.otherDataReceived(topic, data);
                    }
                    break;

                case sails.config.VEHICLE_MANUFACTURER.FITRIDER_SCOOTER:
                    FitRiderCallbackService.fitRiderCallbackReceived(topic, data);
                    break;

                case sails.config.VEHICLE_MANUFACTURER.URBANE_SCOOTER:
                    UrbaneCallbackService.callbackReceived(data, actualCallback);
                    break;

                default:
                    break;
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
                clientsImei[client.id] = imei;
            }

            callback(null, sub);
        };

        sails.config.mqttServer = {};

        sails.config.mqttServer.publish = (topic, qos, data, callback) => {
            console.log(`in mqttServer.publish topic = ${topic}, data = ${data}`);
            let message = {
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
            let manufacturers = await Master.find({ code: sails.config.MQTT_MANUFACTURERS });
            if (!manufacturers || !manufacturers.length) {
                return;
            }
            let manufacturerId = [];
            let manufacturerCode = {};
            for (let manufacturer of manufacturers) {
                manufacturerId.push(manufacturer.id);
                manufacturerCode[manufacturer.code] = manufacturer.id;
            }
            let vehicles = await Vehicle.find({ where: { manufacturer: manufacturerId }, select: ['imei', 'manufacturer'] });
            let topicUrl = '';
            for (let vehicle of vehicles) {
                switch (vehicle.manufacturer) {
                    case manufacturerCode[sails.config.VEHICLE_MANUFACTURER.ZIMO]:
                        topicUrl = sails.config.ZIMO_TOPIC_URL + vehicle.imei;
                        break;

                    case manufacturerCode[sails.config.VEHICLE_MANUFACTURER.FITRIDER_SCOOTER]:
                        topicUrl = sails.config.FITRIDER.TOPIC_URL;
                        break;

                    case manufacturerCode[sails.config.VEHICLE_MANUFACTURER.URBANE_SCOOTER]:
                        topicUrl = sails.config.URBANE.TOPIC_URL;
                        break;

                    default:
                        break;
                }
                sails.config.mqttServer.subscribe(`${topicUrl}`, (err) => {
                    if (err) {
                        sails.log.error(`Can't subscribe scooter: ${vehicle.imei}`);
                    }
                    sails.log.debug(`Subscribe to scooter: ${vehicle.imei}`);
                });
            }
        });
    }
};
