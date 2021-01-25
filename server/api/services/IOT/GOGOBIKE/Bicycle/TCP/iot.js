const UtilService = require('../../../../util');
const crcService = require('../../../crc');
module.exports = {

    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        if (reqCommand === 'lock' || reqCommand === 'stop') {
            command = 'BATLOCK#1';
        } else if (reqCommand === 'unlock' || reqCommand === 'start') {
            command = 'BATLOCK#0';
        }
        console.log("LockUnlock Command", command);
        const imei = scooter.imei;
        if (!bookingNumber) {
            bookingNumber = 0;
        }

        let res = await this.sendCommand(imei, command, scooter.userId, reqCommand);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }

        return res;
    },

    async track(scooter) {
        const imei = scooter.imei;
        let commandToSend = `DWXX#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.TRACK);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        const imei = scooter.imei;
        data.value = (data.value / 60);
        if (data.value < 1) {
            data.value = 1;
        }
        data.value = data.value.toFixed(2)
        let commandToSend = `HBT,${data.value}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        const imei = scooter.imei;
        data.value = (data.value / 60).toFixed(2);
        let commandToSend = `GTIMER,${data.value}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async alarmOn(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `SEARCH#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOff(scooter) {
        const imei = scooter.imei;
        let commandToSend = `SDFIND,OFF,10,10,5#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOff scooter`;
        }

        return res;
    },

    async location(scooter) {
        const imei = scooter.imei;
        let commandToSend = `DWXX#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async encodeCommand(command, imei) {
        let encodedCommand = '7878';
        let data = '80';

        let asciiCommand = UtilService.ascii2Hex(command);
        asciiCommand = '00000000' + asciiCommand;
        let commandLength = asciiCommand.length / 2;
        commandLength = UtilService.decToHex(commandLength);
        asciiCommand = ('00' + commandLength).substr(-2) + asciiCommand + '0002';

        let serialNo = sails.config.GOGOBIKE.serialNo[imei];
        if (!serialNo || isNaN(serialNo)) {
            serialNo = 0;
        }
        serialNo++;
        serialNo = UtilService.decToHex(serialNo);
        serialNo = ('0000' + serialNo).substr(-4);
        sails.config.GOGOBIKE.serialNo[imei] = serialNo;

        data = data + asciiCommand + serialNo;

        let packetLength = (data.length + 4) / 2;
        packetLength = UtilService.decToHex(packetLength);

        data = ('00' + packetLength).substr(-2) + data;
        let crc = this.calculateCrc(data);
        encodedCommand = encodedCommand + data + crc + '0D0A';

        return encodedCommand;
    },

    async sendCommand(imei, command, userId, commandName = '', currentTry = 1) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('----------------- Publish To scooter Log Start-----------------');
            console.log(`in sendCommand ${imei}, command: ${command},userId  ${userId} currentTry = ${currentTry}`);
            console.log("Commmand", command);
        }
        command = await this.encodeCommand(command, imei);
        let iotRequest = {
            request: { imei: imei },
            data: command,
            manufacturer: 'GOGOBIKE',
            imei: imei,
            requestTry: currentTry
        };
        let res = {
            isRequested: false,
            message: ''
        };
        await IOTCommandCallbackTrack.create({
            imei: imei,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: command
        });
        const commandType = 'hex';
        res.isRequested = await new Promise((resolve, reject) => {
            if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
                console.log("Command ==>  ", command)
                console.log("imei ==>  ", imei)
            }
            sails.config.sendTcpCommand(imei, command, (err) => {
                let message = `${command} published to Scooter: ${imei}`;
                iotRequest.response = { message };
                if (err) {
                    iotRequest.response.message = err;
                    console.error(iotRequest.response.message);
                    resolve(false);
                }
                console.log(iotRequest.response.message);
                resolve(true);
            }, commandType);
        });

        res.message = iotRequest.response.message;

        if (!res.isRequested && iotRequest.requestTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {

            await this.sendCommand(imei, command, userId, commandName, iotRequest.requestTry + 1);
        }

        return res;
    },

    calculateCrc(data) {
        let crc = crcService.calculateCRCITU(data);
        crc = ("0000" + crc).substr(-4);

        return crc;
    }
};