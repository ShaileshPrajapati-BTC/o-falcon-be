const UtilService = require('../../../../util');
const crcService = require('../../../crc');

const commandStructure = {
    label: { start: 0, end: 2 },
    decodeHelpByte: { start: 2, end: 2 },
    packetLength: { start: 4, end: 2 },
    dataType: { start: 6, end: 2 },
    deviceId: { start: 8, end: 32 },
    token: { start: 40, end: 8 },
    dataUnit: { start: 48 }
};

module.exports = {
    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        let topic = '01';
        let encodedCommand = '01';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;

        if (reqCommand === 'start' || reqCommand === 'unlock') {
            encodedCommand += '02';
        } else if (reqCommand === 'stop' || reqCommand === 'lock') {
            encodedCommand += '01';
        }
        imei = scooter.imei;
        if (!bookingNumber) {
            bookingNumber = 0;
        }

        let res = await this.sendCommand(topic, command, imei, encodedCommand, reqCommand);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res, bookingNumber = ', bookingNumber);
            console.log(res);
            console.log('res');
        }

        return res;
    },

    async track(scooter) {
        // let encodedCommand = 'e5';
        // let imei = UtilService.decToHex(scooter.imei);
        // imei = ('00000000000000000000000000000000' + imei).substr(-32);
        // encodedCommand += imei;
        // let token = '';
        // encodedCommand += token;
        // encodedCommand += '00000000000001';

        // imei = scooter.imei;

        // let res = await this.sendCommand(command, imei, encodedCommand);
        // if (!res.isRequested && !res.message) {
        //     res.message = `Can't track scooter`;
        // }

        // return res;
    },

    async lightOn(scooter) {
        let encodedCommand = '53';
        let topic = '53';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;
        encodedCommand += '01010100';

        imei = scooter.imei;

        let res = await this.sendCommand(topic, command, imei, encodedCommand, sails.config.IOT_COMMAND_NAME.LIGHT_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOn scooter`;
        }

        return res;
    },

    async lightOff(scooter) {
        let encodedCommand = '53';
        let topic = '53';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;
        encodedCommand += '01000000';

        imei = scooter.imei;

        let res = await this.sendCommand(topic, command, imei, encodedCommand, sails.config.IOT_COMMAND_NAME.LIGHT_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOff scooter`;
        }

        return res;
    },

    async setMaxSpeed(scooter, data) {
        /**
         * Mode : 0 Normal, 1. Eco, 2. Sport
         * Minimum Speed : All => 5  km/h
         * Maximum Speed : Eco => 18 km/h
         *      Normal & Sport => 30 km/h
         */
        let topic = 52;
        let mode = '00';
        if (data.value > 18) {
            mode = '01';
        } else if (data.value > 30) {
            mode = '02';
        }
        let encodedCommand = '52';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;
        encodedCommand = encodedCommand + '01' + mode + '00';

        imei = scooter.imei;

        let res = await this.sendCommand(topic, command, imei, encodedCommand, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        if (!res.isRequested && !res.message) {
            res.message = `Can't setMaxSpeed of scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        let encodedCommand = '50';
        let topic = '50';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;
        let pingInterval = Math.ceil(data.value / 60);
        pingInterval = ('00000000' + UtilService.decToHex(pingInterval)).substr(-8);
        encodedCommand += '010000000000000000' + pingInterval + '00000000';

        imei = scooter.imei;

        let res = await this.sendCommand(topic, command, imei, encodedCommand, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        let encodedCommand = '50';
        let topic = '50';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;
        let pingInterval = ('00' + UtilService.decToHex(data.value)).substr(-2);
        encodedCommand += '010000' + pingInterval + '00000000000000000000000000';

        imei = scooter.imei;

        let res = await this.sendCommand(topic, command, imei, encodedCommand, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async alarmOn(scooter, data) {
        let encodedCommand = '54';
        let topic = '54';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;
        let pingInterval = Math.ceil(data.value / 60);
        pingInterval = ('00000000' + UtilService.decToHex(pingInterval)).substr(-8);
        encodedCommand += '010100000000';

        imei = scooter.imei;

        let res = await this.sendCommand(topic, command, imei, encodedCommand, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOff(scooter) {
        let encodedCommand = '54';
        let topic = '54';
        let imei = UtilService.decToHex(scooter.imei);
        imei = ('00000000000000000000000000000000' + imei).substr(-32);
        encodedCommand += imei;
        let token = '';
        encodedCommand += token;
        let pingInterval = Math.ceil(data.value / 60);
        pingInterval = ('00000000' + UtilService.decToHex(pingInterval)).substr(-8);
        encodedCommand += '010000000000';

        imei = scooter.imei;

        let res = await this.sendCommand(topic, command, imei, encodedCommand, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOff scooter`;
        }

        return res;
    },

    async location(scooter) {
        const imei = scooter.imei;
        let commandToSend = `ggps`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async sendCommand(topic, command, imei, encodedCommand, commandName = '', currentTry = 1) {
        let commonCommandBytes = '5e30';
        let packetLength = encodedCommand.length / 2;
        packetLength += 5;
        packetLength = UtilService.decToHex(packetLength);
        encodedCommand = commonCommandBytes + packetLength + encodedCommand;
        let crc = await crcService.calculateCRC16IBM(encodedCommand);
        crc = ('0000' + crc).substr(-4);
        encodedCommand = encodedCommand + crc;

        let iotRequest = {
            request: { topic: encodedCommand },
            data: command,
            manufacturer: 'URBANE',
            imei: imei,
            requestTry: currentTry
        };
        await IOTCommandCallbackTrack.create({
            imei: imei,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: encodedCommand
        });
        let res = await new Promise((resolve, reject) => {
            console.log('In Promise');
            sails.config.mqttServer.publish(topic, 0, encodedCommand, (err) => {
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
            await this.sendCommand(topic, command, imei, encodedCommand, commandName, iotRequest.requestTry + 1);
        }
        console.log('----------------- Publish To Scooter Log End-----------------');
    }
};