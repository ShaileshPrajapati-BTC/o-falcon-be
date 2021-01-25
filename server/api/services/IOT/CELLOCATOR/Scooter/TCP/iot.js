const UtilService = require('../../../../util');

module.exports = {
    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        let authCode = this.generateAuthCode(scooter.imei);
        if (reqCommand === 'lock' || reqCommand === 'stop') {
            command = `00${scooter.imei}00${authCode}03031818000000000000`;
            let crc = this.generateChecksum(command);
            command = `4d434750${command}${crc}`;
        } else if (reqCommand === 'unlock' || reqCommand === 'start') {
            command = `00${scooter.imei}00${authCode}03030808000000000000`;
            let crc = this.generateChecksum(command);
            command = `4d434750${command}${crc}`;
        }
        let res = await this.sendCommand(imei, command, scooter.userId, reqCommand);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }

        return res;
    },

    async location(scooter) {
        let authCode = this.generateAuthCode(scooter.imei);
        let command = `00${scooter.imei}00${authCode}00000000000000000000`;
        let crc = this.generateChecksum(command);
        command = `4d434750${command}${crc}`;
        let res = await this.sendCommand(imei, command, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        return {
            isRequested: true,
            message: ''
        };
    },

    async setRidePingInterval(scooter, data) {
        return {
            isRequested: true,
            message: ''
        };
    },

    async track(scooter) {
        let authCode = this.generateAuthCode(scooter.imei);
        let command = `00${scooter.imei}00${authCode}00000000000000000000`;
        let crc = this.generateChecksum(command);
        command = `4d434750${command}${crc}`;
        let res = await this.sendCommand(imei, command, scooter.userId, sails.config.IOT_COMMAND_NAME.TRACK);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }

        return res;
    },

    generateCommand(imei, command) {
        imei = '00000000' + UtilService.decToHex(imei).substr(-8);
        let authCode = this.generateAuthCode(imei);
        let cmd = `00${imei}00${authCode}`;

    },

    async sendCommand(imei, command, userId, commandName = '', currentTry = 1) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('----------------- Publish To scooter Log Start-----------------');
            console.log(`in sendCommand ${imei}, command: ${command},userId  ${userId} currentTry = ${currentTry}`);
            console.log("Commmand", command);
        }
        let iotRequest = {
            request: { imei: imei },
            data: command,
            manufacturer: 'CELLOCATOR_TCP_SCOOTER',
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
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log("***************IOT REQUEST************************");
            console.log(iotRequest);
        }
        const commandType = 'hex';
        res.isRequested = await new Promise((resolve, reject) => {
            sails.config.sendTcpCommand(imei, command, (err) => {
                let message = `${command} published to Scooter: ${imei}`;
                iotRequest.response = { message };
                if (err) {
                    iotRequest.response.message = err;
                    if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
                        console.error(iotRequest.response.message);
                    }
                    resolve(false);
                }
                if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
                    console.log(iotRequest.response.message);
                }
                resolve(true);
            }, commandType);
        });

        res.message = iotRequest.response.message;

        if (!res.isRequested && iotRequest.requestTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {

            await this.sendCommand(imei, command, userId, commandName, iotRequest.requestTry + 1);
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('----------------- Publish To scooter Log End-----------------');
        }

        return res;
    },

    generateAck(data) {
        let authCode = this.generateAuthCode(data.imei);
        let mainAck = `04${data.imei}00${authCode}00${data.messageNumerator}0000000000000000000000`;
        let checksum = this.generateChecksum(mainAck);
        let ack = `4d434750${mainAck}${checksum}`;

        return ack;
    },

    generateAuthCode(id) {
        let authTable = {
            "0": "2",
            "1": "f",
            "2": "7",
            "3": "9",
            "4": "c",
            "5": "1",
            "6": "4",
            "7": "6",
            "8": "8",
            "9": "3",
            "a": "b",
            "b": "e",
            "c": "0",
            "d": "5",
            "e": "a",
            "f": "d"
        };
        let authCode = '';
        for (let i = 0; i < id.length; i++) {
            authCode += authTable[id[i]];
        }

        // return authCode;
        return '00000000';
    },

    generateChecksum(data) {
        let checkSum = 0;
        for (let i = 0; i < data.length; i = i + 2) {
            checkSum = checkSum + parseInt(data.substr(i, 2), 16);
        }
        checkSum = UtilService.decToHex(checkSum);
        checkSum = checkSum.substr(-2);

        return checkSum;
    }
};