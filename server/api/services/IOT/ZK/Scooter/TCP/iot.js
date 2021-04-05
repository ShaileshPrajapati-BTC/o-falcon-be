const UtilService = require('../../../../util');

const scooterModel = 'Falcon2020';
module.exports = {

    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        let subCommand = 'F';
        if (reqCommand === 'start') {
            command = 'unlock';
        } else if (reqCommand === 'stop') {
            command = 'lock';
        }
        if (command === 'lock') {
            subCommand = '10';
        }
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 1;
        if (!bookingNumber) {
            bookingNumber = '';
            isRideMode = 0;
        }
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,${isRideMode},${bookingNumber},,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, reqCommand);
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

    async lightOn(scooter) {
        const imei = scooter.imei;
        let subCommand = '9';
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let serialNumber = 'FFFF';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,0,,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LIGHT_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOn scooter`;
        }

        return res;
    },

    async lightOff(scooter) {
        const imei = scooter.imei;
        let subCommand = 'A';
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let serialNumber = 'AAAF';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,0,,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LIGHT_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOff scooter`;
        }

        return res;
    },

    async buzzOn(scooter) {
        const imei = scooter.imei;
        let commandToSend = `AT+GTALM=${scooterModel},${sails.config.BUZZ_COMMAND_INTERVAL},${sails.config.BUZZ_COMMAND_INTERVAL},,,,0210$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (sails.config.BUZZ_COMMAND_ITERATION_COUNT > 1) {
            let i = 1;
            let commandInterval = await setInterval(async () => {
                await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.BUZZ_ON);
                i++;
                if (i >= sails.config.BUZZ_COMMAND_ITERATION_COUNT) {
                    clearInterval(commandInterval);
                }
            }, sails.config.BUZZ_COMMAND_INTERVAL * 1000);
        }
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOn(scooter) {
        const imei = scooter.imei;
        let commandToSend = `AT+GTALM=${scooterModel},10,20,,,,0210$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOff(scooter) {
        const imei = scooter.imei;
        let commandToSend = `AT+GTALM=${scooterModel},0,0,,,,0210$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOff scooter`;
        }

        return res;
    },

    async location(scooter) {
        const imei = scooter.imei;
        let subCommand = '1';
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let serialNumber = '0AAF';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,0,0,0,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },
    async startFirmwareUpdate(scooter){
        let subCommand='0';
        const imei=scooter.imei;
        let commandToSend=`AT+GTUPD=${scooterModel},${subCommand},1,10,0,,,http://3.7.80.234:13810/ZK105L_R61A03V09_CAN.enc,0,0,,,FFFF$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'startFirmwareUpdate');
        if (!res.isRequested && !res.message) {
          res.message = `Can't start update firmware`;
      }
      if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
          console.log('res', res);
      }
      return res;
  },
  async stopFirmwareUpdate(scooter){
      let subCommand='1';
      const imei=scooter.imei;
      let commandToSend=`AT+GTUPD=${scooterModel},${subCommand},,,,,0001$`;
      let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'stopFirmwareUpdate');
      if (!res.isRequested && !res.message) {
        res.message = `Can't stop update firmware`;
    }
    if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
        console.log('res', res);
    }
    return res;
  },
    async setMaxSpeed(scooter, data) {
        const imei = scooter.imei;
        const commandToSend = `AT+GTECC=${scooterModel},,${data.value},0,1,,,,,,0ABF$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set Max speed of scooter`;
        }

        return res;
    },
    async batteryLock(scooter) {
        let subCommand = '14';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 0;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'batteryLock');
        if (!res.isRequested && !res.message) {
            res.message = `Can't batteryLock Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async batteryUnlock(scooter) {
        let subCommand = '13';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 0;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'batteryUnlock');
        if (!res.isRequested && !res.message) {
            res.message = `Can't batteryUnlock Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async batteryLockDisable(scooter) {
        const imei = scooter.imei;
        const commandToSend = `AT+GTVAD=${scooterModel},0,1,0,0,1,2,10,0215$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'batteryLockDisable');
        if (!res.isRequested && !res.message) {
            res.message = `Can't Lock Battery`;
        }

        return res;
    },
    async batteryLockEnable(scooter) {
        const imei = scooter.imei;
        const commandToSend = `AT+GTVAD=${scooterModel},1,1,0,0,1,2,10,0215$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'batteryLockEnable');
        if (!res.isRequested && !res.message) {
            res.message = `Can't Unlock Battery`;
        }

        return res;
    },

    async batteryUnlock2(scooter) {
        let subCommand = '1E';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 0;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'batteryUnlock2');
        if (!res.isRequested && !res.message) {
            res.message = `Can't batteryUnlock Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async batteryLock2(scooter) {
        let subCommand = '1F';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 0;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'batteryLock2');
        if (!res.isRequested && !res.message) {
            res.message = `Can't batteryUnlock Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async pileUnlock(scooter) {
        let subCommand = '1E';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 1;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},0,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'pileUnlock');
        if (!res.isRequested && !res.message) {
            res.message = `Can't batteryUnlock Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async pileLock(scooter) {
        let subCommand = '1F';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 1;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},0,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'pileLock');
        if (!res.isRequested && !res.message) {
            res.message = `Can't batteryUnlock Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async throttleOn(scooter) {
        let subCommand = '18';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 1;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.THROTTLE_ON);
        if (!res.isRequested && !res.message) {
            res.message = `Can't throttleOn Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async throttleOff(scooter) {
        let subCommand = '19';
        const imei = scooter.imei;
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let isRideMode = 1;
        let serialNumber = '0A0F';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,${isRideMode},0,,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.THROTTLE_OFF);
        if (!res.isRequested && !res.message) {
            res.message = `Can't throttleOn Scooter`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res', res);
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        const imei = scooter.imei;
        const commandToSend = `AT+GTQSS=${scooterModel},,,,,,,,,,,,${data.value},,,,0ABF$`
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set Ping Interval of scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        const imei = scooter.imei;
        const commandToSend = `AT+GTFRI=${scooterModel},,,,${data.value},,,,,,0ACF$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set Ride Ping Interval scooter`;
        }

        return res;
    },

    async setPositionPingInterval(scooter, data) {
        const imei = scooter.imei;
        let intervalTime = data.value;
        if (intervalTime < 5) {
            intervalTime = 5;
        }
        const commandToSend = `AT+GTFRI=${scooterModel},,,,${intervalTime},,,,,,0ADF$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.POSITION_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set Ride Ping Interval scooter`;
        }

        return res;
    },

    async track(scooter) {
        const imei = scooter.imei;
        let subCommand = '1';
        let currTimeInYear = UtilService.currTimeInFullYearForIot();
        let expireTime = sails.config.IOT_REQUEST_TIME_OUT_LIMIT;
        // let expireTimeInYear = UtilService.currTimeInFullYearForIot(expireTime);
        let serialNumber = '0AAF';
        let commandToSend = `AT+GTRTO=${scooterModel},${subCommand},,0,0,0,`;
        commandToSend += `${currTimeInYear},${expireTime},,${serialNumber}$`;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async commandToPerform(scooter, params) {
        console.log('in commandToPerform', params.data);
        const imei = scooter.imei;
        const commandToSend = params.data.value;
        let res = await this.sendCommand(imei, commandToSend, scooter.userId, 'anyCommand');
        console.log('commandToSend', commandToSend);
        if (!res.isRequested && !res.message) {
            res.message = `Can't send command to scooter`;
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
            manufacturer: 'ZK_SCOOTER',
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
