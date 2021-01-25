const UtilService = require(`../../../../../util`);
const crcService = require('../../../../crc');
const commandStructure = {
    zeroBytes: { start: 0, end: 8 },
    dataSize: { start: 8, end: 8 },
    codecId: { start: 16, end: 2 },
    commandQuantity1: { start: 18, end: 2 },
    commandType: { start: 20, end: 2 },
    commandSize: { start: 22, end: 8 },
    command: { start: 30 },
    commandQuantity2: { end: 2 },
    crc16: { end: 8 }
};

module.exports = {

    async lockUnlock(reqCommand, scooter, bookingNumber = 0) {
        let command = reqCommand;
        if (reqCommand === 'start' || reqCommand === 'unlock') {
            command = 'setdigout 0';
        } else if (reqCommand === 'stop' || reqCommand === 'lock') {
            command = 'setdigout 1';
        }
        const imei = scooter.imei;
        if (!bookingNumber) {
            bookingNumber = 0;
        }

        let res = await this.sendCommand(imei, command, scooter.userId, reqCommand);
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

    async turnOn(vehicle) {
        const imei = vehicle.imei;
        let commandToSend = `setdigout 1`;

        let res = await this.sendCommand(imei, commandToSend, vehicle.userId, sails.config.IOT_COMMAND_NAME.UNLOCK);
        if (!res.isRequested && !res.message) {
            res.message = `Can't turn on the bike`;
        }

        return res;
    },

    async turnOff(vehicle) {
        const imei = vehicle.imei;
        let commandToSend = `setdigout 0`;

        let res = await this.sendCommand(imei, commandToSend, vehicle.userId, sails.config.IOT_COMMAND_NAME.LOCK);
        if (!res.isRequested && !res.message) {
            res.message = `Can't turn off the bike`;
        }

        return res;
    },

    async bootOpen(vehicle) {
        const imei = vehicle.imei;
        let commandToSend = `setdigout `;
        if (vehicle.lockStatus) {
            commandToSend += '01';
        } else {
            commandToSend += '11';
        }
        let res = await this.sendCommand(imei, commandToSend, vehicle.userId, sails.config.IOT_COMMAND_NAME.BOOT_OPEN);
        setTimeout(async () => {
            await this.bootOff(vehicle);
        }, 2000);
        if (!res.isRequested && !res.message) {
            res.message = `Can't open boot of the bike`;
        }

        return res;
    },

    async bootClose(vehicle) {
        const imei = vehicle.imei;
        let commandToSend = `setdigout `;
        if (vehicle.lockStatus) {
            commandToSend += '00';
        } else {
            commandToSend += '10';
        }
        let res = await this.sendCommand(imei, commandToSend, vehicle.userId, sails.config.IOT_COMMAND_NAME.BOOT_CLOSE);
        if (!res.isRequested && !res.message) {
            res.message = `Can't close boot of the bike`;
        }

        return res;
    },

    async track(scooter) {
        const imei = scooter.imei;
        let commandToSend = `*SCOS,OM,${imei},D0#`;

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

    async setMaxSpeed(scooter, data) {
        const imei = scooter.imei;
        /**
         * Mode : 0 Normal, 1. Eco, 2. Sport
         * Minimum Speed : All => 5  km/h
         * Maximum Speed : Eco => 18 km/h
         *      Normal & Sport => 30 km/h
         */
        let commandToSend = `scsetspdlim ${data.mode} ${data.value}`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        if (!res.isRequested && !res.message) {
            res.message = `Can't setMaxSpeed of scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `*SCOS,OM,${imei},S5,0,0,${data.value},0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `*SCOS,OM,${imei},S5,0,0,0,${data.value}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
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

    async location(scooter) {
        const imei = scooter.imei;
        let commandToSend = `ggps`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async encodeCommand(command, imei, commandQuantity) {
        command = UtilService.ascii2Hex(command);
        command += "0d0a"
        let commandSize = command.length / 2;
        let dataSize = commandStructure.codecId.end + commandStructure.commandQuantity1.end + commandStructure.commandType.end + commandStructure.commandSize.end + command.length + commandStructure.commandQuantity2.end;
        dataSize /= 2;
        console.log("dataSize => " + dataSize);
        dataSize = UtilService.decToHex(dataSize);
        commandSize = UtilService.decToHex(commandSize);
        let commandData = {
            zeroBytes: '00000000',
            dataSize: dataSize,
            codecId: '0C',
            commandQuantity1: commandQuantity,
            commandType: '05',
            commandSize: commandSize,
            command: command,
            commandQuantity2: commandQuantity
        };
        let encodedCommand = await this.formatEncodedCommand(commandData);

        return encodedCommand;
    },

    async formatEncodedCommand(commandData) {
        let encodedCommand = '';
        for (let key in commandData) {
            let value = commandData[key];
            if (key != 'command') {
                let diff = commandStructure[key].end - value.length;
                console.log('Diff    ' + key + " => " + diff)
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) {
                        value = "0" + value;
                    }
                }
            }
            encodedCommand += value;
        }
        let crc = await this.calculateCRC(encodedCommand);
        if (crc.length < 8) {
            for (let i = 0; i < 8 - crc.length; i++) {
                encodedCommand += '0';
            }
        }
        encodedCommand += crc;
        return encodedCommand;
    },

    async calculateCRC(command) {
        command = command.substr(16, command.length - 16);
        let crc = crcService.calculateCRC16IBM(command);
        crc = ('00000000' + crc.toString(16)).substr(-8);

        return crc;
    },


    async sendCommand(imei, command, userId, commandName, currentTry = 1) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('----------------- Publish To scooter Log Start-----------------');
            console.log(`in sendCommand ${imei}, command: ${command},userId  ${userId} currentTry = ${currentTry}`);
        }

        command = await this.encodeCommand(command, imei, '01');
        let iotRequest = {
            request: { imei: imei },
            data: command,
            manufacturer: 'TELTONIKA',
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
    }
};
