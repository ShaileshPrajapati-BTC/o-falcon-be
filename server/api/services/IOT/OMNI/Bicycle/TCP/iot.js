const UtilService = require('../../../../util');

module.exports = {

    async lockUnlock(reqCommand, bicycle, bookingNumber = 0) {
        let command = reqCommand;
        if (reqCommand === 'start') {
            command = 'unlock';
        } else if (reqCommand === 'stop') {
            command = 'lock';
        }
        if (command === 'lock') {
            return {
                isRequested: false,
                message: 'Can\'t lock Bicycle'
            };
        }
        const imei = bicycle.imei;
        let bicycleCode = bicycle.omniCode || sails.config.IOT_OMNI_BICYCLE_CODE;
        if (!bicycle.omniCode && bicycle.manufacturer.code === sails.config.VEHICLE_MANUFACTURER.OMNI_TCP_BICYCLE_SAMPLE_LOCK) {
            bicycleCode = 'OM';
        }
        let currTimeInYear = UtilService.currTimeInYearForIot();
        let commandToSend = `*CMDS,${bicycleCode},${imei},${currTimeInYear},`;
        let date = new Date();
        let timeStamp = Math.floor(date.getTime() / 1000);
        if (!bookingNumber) {
            bookingNumber = 0;
        }
        if (command === 'lock') {
            // commandToSend += `D0#`;
            commandToSend += `L1,1,${bookingNumber},${timeStamp}#`;
        } else {
            commandToSend += `L0,0,${bookingNumber},${timeStamp}#`;
        }
        let res = await this.sendCommand(imei, commandToSend, bicycle.userId, reqCommand);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Bicycle`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res, bookingNumber = ', bookingNumber);
            console.log(res);
            console.log('res');
        }

        return res;
    },

    async buzzOn(bicycle) {
        const imei = bicycle.imei;
        let currTimeInYear = UtilService.getUnixTimestampInSeconds();
        let bicycleCode = bicycle.omniCode || sails.config.IOT_OMNI_BICYCLE_CODE;
        if (!bicycle.omniCode && bicycle.manufacturer.code === sails.config.VEHICLE_MANUFACTURER.OMNI_TCP_BICYCLE_SAMPLE_LOCK) {
            bicycleCode = 'OM';
        }
        let commandToSend = `*CMDS,${bicycleCode},${imei},${currTimeInYear},S8,${sails.config.BUZZ_COMMAND_INTERVAL},0#`;

        let res = await this.sendCommand(imei, commandToSend, bicycle.userId, sails.config.IOT_COMMAND_NAME.BUZZ_ON);
        if (sails.config.BUZZ_COMMAND_ITERATION_COUNT > 1) {
            let i = 1;
            let commandInterval = await setInterval(async () => {
                await this.sendCommand(imei, commandToSend, bicycle.userId, sails.config.IOT_COMMAND_NAME.BUZZ_ON);
                i++;
                if (i >= sails.config.BUZZ_COMMAND_ITERATION_COUNT) {
                    clearInterval(commandInterval);
                }
            }, sails.config.BUZZ_COMMAND_INTERVAL * 1000);
        }
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn bicycle`;
        }

        return res;
    },

    async alarmOn(bicycle) {
        const imei = bicycle.imei;
        let bicycleCode = bicycle.omniCode || sails.config.IOT_OMNI_BICYCLE_CODE;
        if (!bicycle.omniCode && bicycle.manufacturer.code === sails.config.VEHICLE_MANUFACTURER.OMNI_TCP_BICYCLE_SAMPLE_LOCK) {
            bicycleCode = 'OM';
        }
        let currTimeInYear = UtilService.getUnixTimestampInSeconds();
        let commandToSend = `*CMDS,${bicycleCode},${imei},${currTimeInYear},S8,5,0#`;

        let res = await this.sendCommand(imei, commandToSend, bicycle.userId, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn bicycle`;
        }

        return res;
    },

    async alarmOff(bicycle) {
        const imei = bicycle.imei;
        let currTimeInYear = UtilService.getUnixTimestampInSeconds();
        let bicycleCode = bicycle.omniCode || sails.config.IOT_OMNI_BICYCLE_CODE;
        if (!bicycle.omniCode && bicycle.manufacturer.code === sails.config.VEHICLE_MANUFACTURER.OMNI_TCP_BICYCLE_SAMPLE_LOCK) {
            bicycleCode = 'OM';
        }
        let commandToSend = `*CMDS,${bicycleCode},${imei},${currTimeInYear},S8,0,0#`;

        let res = await this.sendCommand(imei, commandToSend, bicycle.userId, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOff bicycle`;
        }

        return res;
    },

    async location(bicycle) {
        const imei = bicycle.imei;
        let currTimeInYear = UtilService.getUnixTimestampInSeconds();
        let bicycleCode = bicycle.omniCode || sails.config.IOT_OMNI_BICYCLE_CODE;
        if (!bicycle.omniCode && bicycle.manufacturer.code === sails.config.VEHICLE_MANUFACTURER.OMNI_TCP_BICYCLE_SAMPLE_LOCK) {
            bicycleCode = 'OM';
        }
        let commandToSend = `*CMDS,${bicycleCode},${imei},${currTimeInYear},D0#`;

        let res = await this.sendCommand(imei, commandToSend, bicycle.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of bicycle`;
        }

        return res;
    },

    async sendCommand(imei, command, userId, commandName = '', currentTry = 1) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('----------------- Publish To bicycle Log Start-----------------');
            console.log(`in sendCommand ${imei}, command: ${command},userId  ${userId} currentTry = ${currentTry}`);
        }
        let iotRequest = {
            request: { imei: imei },
            data: command,
            manufacturer: 'OMNI_BICYCLE',
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
                let message = `${command} published to Bicycle: ${imei}`;
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
        // console.log('----------------- Publish To bicycle Log End-----------------');

        return res;
    }
};
