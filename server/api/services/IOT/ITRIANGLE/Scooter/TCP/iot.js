module.exports = {

    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        if (reqCommand === 'start' || reqCommand === 'unlock') {
            command = 'sclockctrl 0';
        } else if (reqCommand === 'stop' || reqCommand === 'lock') {
            command = 'sclockctrl 1';
        }
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
        let commandToSend = `#%GETIO%${sails.config.ITRIANGLE_PASSWORD}`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.TRACK);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
    },

    async lightOn(scooter) {
        const imei = scooter.imei;
        let commandToSend = `scsetledswitch 1`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LIGHT_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOn scooter`;
        }

        return res;
    },

    async lightOff(scooter) {
        const imei = scooter.imei;
        let commandToSend = `scsetledswitch 0`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LIGHT_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOff scooter`;
        }

        return res;
    },

    async alarmOn(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `scbuzzerctrl 1 ${data.value}`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOff(scooter) {
        const imei = scooter.imei;
        let commandToSend = `scbuzzerctrl 0 ${data.value}`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOff scooter`;
        }

        return res;
    },

    async setMaxSpeed(scooter, data) {
        const imei = scooter.imei;
        /**
         * Mode : 0 Normal, 1. Eco, 2. Sport
         * Minimum Speed : All => 5  km/h
         * Maximum Speed : Eco => 18 km/h
         *      Normal & Sport => 30 km/h
         */
        let commandToSend = `#set$${imei}@${sails.config.ITRIANGLE_PASSWORD}#CFG_OS:${data.value},30S*`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        if (!res.isRequested && !res.message) {
            res.message = `Can't setMaxSpeed of scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `#set$${imei}@${sails.config.ITRIANGLE_PASSWORD}#CFG_TL:GPRS,${scooter.ridePingInterval.actualValue}S,${data.value}M*`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `#set$${imei}@${sails.config.ITRIANGLE_PASSWORD}#CFG_TL:GPRS,${data.value}S,${scooter.pingInterval.actualValue}M*`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async location(scooter) {
        const imei = scooter.imei;
        let commandToSend = `#GLOCATE:${sails.config.ITRIANGLE_PASSWORD}`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async sendCommand(imei, command, userId, commandName = '', currentTry = 1) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('----------------- Publish To scooter Log Start-----------------');
            console.log(`in sendCommand ${imei}, command: ${command},userId  ${userId} currentTry = ${currentTry}`);
        }

        let iotRequest = {
            request: { imei: imei },
            data: command,
            manufacturer: 'OMNI_TCP_SERVER',
            imei: imei,
            requestTry: currentTry
        };
        let res = {
            isRequested: false,
            message: ''
        };
        const commandType = 'hex';
        await IOTCommandCallbackTrack.create({
            imei: imei,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: command
        });

        res.isRequested = await new Promise((resolve, reject) => {
            if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.imei)) {
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
    }
};
