const UtilService = require(`../../../../util`);

module.exports = {

    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        if (reqCommand === 'start' || reqCommand === 'unlock') {
            command = 'unlock';
        } else if (reqCommand === 'stop' || reqCommand === 'lock') {
            command = 'lock';
        }
        const imei = scooter.imei;
        let date = new Date();
        let timeStamp = Math.floor(date.getTime() / 1000);
        if (!bookingNumber) {
            bookingNumber = 0;
        }
        let isLock = 0;
        if (command === 'lock') {
            isLock = 1;
        }
        let timeLimit = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},R0,${isLock},${timeLimit},`;
        commandToSend += `${bookingNumber},${timeStamp}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, command);
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
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},D0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.TRACK);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
    },

    async lightOn(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},S7,2,0,0,0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LIGHT_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOn scooter`;
        }

        return res;
    },

    async lightOff(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},S7,1,0,0,0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LIGHT_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOff scooter`;
        }

        return res;
    },

    async setMaxSpeed(scooter, data) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let speedMode = '0';
        if (sails.config.IS_SET_INCH_SPEED_DISPLAY_VALUE) {
            speedMode = '1';
            if (sails.config.DEFAULT_DISTANCE_UNIT === sails.config.DISTANCE_UNIT.MILES) {
                speedMode = '2';
            }
        }
        let commandToSend = `*SCOS,${VC},${imei},S4,${speedMode},0,0,0,0,${data.value},${data.value},${data.value}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        if (!res.isRequested && !res.message) {
            res.message = `Can't setMaxSpeed of scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},S5,0,0,${data.value},0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},S5,0,0,0,${data.value}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async setPositionPingInterval(scooter, data) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},D1,${data.value}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.POSITION_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async buzzOn(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},V0,2#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.BUZZ_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOn(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},V0,1#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOff(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},V0,1#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOff scooter`;
        }

        return res;
    },

    async location(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},D0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async getFirmwareInfo(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},G0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.GET_FIRMWARE_INFO);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async getMacAddress(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},M0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.GET_MAC_ADDRESS);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async getSimDetails(scooter) {
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},I0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.GET_SIM_DETAIL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async commandToPerform(scooter, params) {
        const data = params.data;
        const imei = scooter.imei;
        const VC = scooter.omniCode || sails.config.IOT_OMNI_SCOOTER_CODE;
        let commandToSend = `*SCOS,${VC},${imei},${data.command}`;
        if (data.value) {
            commandToSend += `,${data.value}`;
        }
        commandToSend += `#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, data.command);
        if (!res.isRequested && !res.message) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
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
        await IOTCommandCallbackTrack.create({
            imei: imei,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: command
        });
        res.isRequested = await new Promise((resolve, reject) => {
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
            });
        });

        res.message = iotRequest.response.message;

        if (!res.isRequested && iotRequest.requestTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {

            await this.sendCommand(imei, command, userId, commandName, iotRequest.requestTry + 1);
        }
        // console.log('----------------- Publish To scooter Log End-----------------');

        return res;
    }
};
