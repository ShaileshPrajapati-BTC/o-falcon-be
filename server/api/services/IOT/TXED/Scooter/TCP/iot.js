const UtilService = require('../../../../util');

module.exports = {
    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        if (reqCommand === 'lock' || reqCommand === 'stop') {
            command = `205,1`;
        } else if (reqCommand === 'unlock' || reqCommand === 'start') {
            command = `205,0`;
        }
        let crc = this.calculateCrc(command);
        command = `**${scooter.imei},${command},${crc}&&;`;
        let res = await this.sendCommand(imei, command, scooter.userId, reqCommand);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }

        return res;
    },

    async alarmOn(scooter) {
        let command = '104,1';
        let crc = this.calculateCrc(command);
        command = `**${scooter.imei},${command},${crc}&&;`;
        let res = await this.sendCommand(imei, command, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }

        return res;
    },

    async alarmOff(scooter) {
        return {
            isRequested: true,
            message: ''
        };
    },

    async location(scooter) {
        let command = '206,1,1';
        let crc = this.calculateCrc(command);
        command = `**${scooter.imei},${command},${crc}&&;`
        let res = await this.sendCommand(scooter.imei, command, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        let runInterval = '5';
        if (scooter && scooter.ridePingInterval && scooter.ridePingInterval.requestedValue) {
            runInterval = scooter.ridePingInterval.requestedValue;
        }
        let command = `206,${data.value},${runInterval}`;
        let crc = this.calculateCrc(command);
        command = `**${scooter.imei},${command},${crc}&&;`;
        let res = await this.sendCommand(scooter.imei, command, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        let lockInterval = '30';
        if (scooter && scooter.ridePingInterval && scooter.ridePingInterval.requestedValue) {
            lockInterval = scooter.ridePingInterval.requestedValue;
        }
        let command = `206,${lockInterval},${data.value}`;
        let crc = this.calculateCrc(command);
        command = `**${scooter.imei},${command},${crc}&&;`;
        let res = await this.sendCommand(scooter.imei, command, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
    },

    async track(scooter) {
        let command = '201';
        let crc = this.calculateCrc(command);
        command = `**${scooter.imei},${command},${crc}&&;`
        let res = await this.sendCommand(scooter.imei, command, scooter.userId, sails.config.IOT_COMMAND_NAME.TRACK);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
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
            manufacturer: 'TXED_TCP_PADDLE_BIKE',
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
        // console.log('----------------- Publish To scooter Log End-----------------');

        return res;
    },

    generateAck(data) {
        let ack = '';
        let date = UtilService.getDateTime();
        ack = `${data.msgType},${date}`;
        let crc = '';
        ack = ack + ',' + crc + '&amp;&;';

        return ack;
    },

    calculateCrc(data) {
        data = UtilService.ascii2Hex(data);
        let crc = 0;
        for (let i = 0; i < data.length; i = i + 2) {
            let byte = parseInt(data.substr(i, 2), 16);
            crc ^= byte;
        }
        crc = crc.toString(16);

        return crc;
    }
};