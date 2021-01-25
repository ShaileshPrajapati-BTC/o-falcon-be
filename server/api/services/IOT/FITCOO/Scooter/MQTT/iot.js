module.exports = {
    async lockUnlock(reqCommand, scooter) {
        let qos = 0;
        let command = reqCommand;
        let topic = scooter.imei.toString();
        let data = {};
        if (reqCommand === 'start' || reqCommand === 'unlock') {
            data.a = 1;
            command = 'unlock';
        } else if (reqCommand === 'stop' || reqCommand === 'lock') {
            qos = 1;
            data.a = 3;
            command = 'lock';
        }
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, data, qos, reqCommand);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },

    async lightOn(scooter) {
        const qos = 0;
        let topic = scooter.imei.toString();
        const requestData = {
            a: 37,
            d: 1
        };
        let command = 'lightOn';
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, requestData, qos, sails.config.IOT_COMMAND_NAME.LIGHT_ON);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },

    async lightOff(scooter) {
        const qos = 0;
        let topic = scooter.imei.toString();
        const requestData = {
            a: 37,
            d: 0
        };
        let command = 'lightOff';
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, requestData, qos, sails.config.IOT_COMMAND_NAME.LIGHT_OFF);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },

    async alarmOn(scooter, contentType = 7) {
        const qos = 0;
        let topic = scooter.imei.toString();
        const requestData = {
            a: 28
        }
        let command = 'alarmOn';
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, requestData, qos, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },

    async alarmOff(scooter, contentType = 6) {
    },

    async setMaxSpeed(scooter, data) {
        let km = data.value;
        let topic = scooter.imei.toString();
        if (km > 25) {
            return { isRequested: false, message: 'Can not set speed limit greater than 25km/h' };
        }
        if (data.value < 4) {
            km = Math.ceil((km * 600) / 4);
        } else {
            let decimalNo = (km - Math.floor(km)).toString().substr(0, 2);
            let points = (decimalNo * 50) / 100;
            let diff = (Math.floor(km) - 4) / 2;
            km = (diff * 100) + 400 + points;
        }
        const qos = 1;
        const requestData = {
            a: 13,
            k: km
        }
        let command = 'setMaxSpeed';
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, requestData, qos, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {

    },

    async setRidePingInterval(scooter, data) {
        const qos = 0;
        let topic = scooter.imei.toString();
        const requestData = {
            a: 33,
            u: `${sails.config.SERVER_IP},${sails.config.SERVER_PORT},${scooter.imei},${data.value}`
        };
        let command = 'setRidePingInterval';
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, requestData, qos, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },

    async location(scooter) {
        const qos = 0;
        let topic = scooter.imei.toString();
        const requestData = {
            a: 18
        };
        let command = 'get location';
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, requestData, qos, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },
    async track(scooter, seconds = 30) {
        const qos = 0;
        let topic = scooter.imei.toString();
        const requestData = {
            a: 15
        };
        let command = 'track';
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(topic, command, requestData, qos, sails.config.IOT_COMMAND_NAME.TRACK);
        if (!res.isRequested) {
            res.message = `Can't ${command} the Scooter.`;
        }

        return res;
    },

    async publishToScooter(topic, command, data, qos, commandName = '', currentTry = 1) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == topic)) {
            console.log('----------------- Publish To Scooter Log Start-----------------');
            console.log(`in publishToScooter ${topic}, command: ${command}, currentTry = ${currentTry}`);
        }
        let iotRequest = {
            request: { topic: topic },
            data: command,
            manufacturer: 'FITRIDER',
            imei: topic,
            requestTry: currentTry
        };
        await IOTCommandCallbackTrack.create({
            imei: topic,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: JSON.stringify(data)
        });
        console.log(`in publishToScooter ${topic}, command: ${command}`);
        console.log('Before Promise');
        let res = await new Promise((resolve, reject) => {
            console.log('In Promise');
            sails.config.mqttServer.publish(topic, qos, JSON.stringify(data), (err) => {
                let message = `${command} published to scooter: ${topic}`;
                iotRequest.response = { message };
                if (err) {
                    iotRequest.response.message = `Can't publish ${command} to scooter: ${topic}`;
                    console.error(iotRequest.response.message);
                    resolve(false);
                }
                console.log(iotRequest.response.message);
                resolve(true);
            });
        });

        if (!res && iotRequest.requestTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {
            await this.publishToScooter(topic, command, data, qos, commandName, iotRequest.requestTry + 1);
        }
        console.log('----------------- Publish To Scooter Log End-----------------');

        return res;
    }
}