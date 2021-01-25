const UtilService = require(`../../../../../util`);
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
        if (reqCommand === 'start') {
            command = 'sclockctrl 0';
        } else if (reqCommand === 'stop') {
            command = 'sclockctrl 1';
        }
        const imei = scooter.imei;
        if (!bookingNumber) {
            bookingNumber = 0;
        }

        let res = await this.sendCommand(imei, command, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't ${command} Scooter`;
        }
        console.log('res, bookingNumber = ', bookingNumber);
        console.log(res);
        console.log('res');

        return res;
    },

    async track(scooter) {
        const imei = scooter.imei;
        let commandToSend = `*SCOS,OM,${imei},D0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't track scooter`;
        }

        return res;
    },

    async lightOn(scooter) {
        const imei = scooter.imei;
        let commandToSend = `scsetledswitch 1`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't lightOn scooter`;
        }

        return res;
    },

    async lightOff(scooter) {
        const imei = scooter.imei;
        let commandToSend = `scsetledswitch 0`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
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

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't setMaxSpeed of scooter`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `*SCOS,OM,${imei},S5,0,0,${data.value},0#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `*SCOS,OM,${imei},S5,0,0,0,${data.value}#`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't set PingInterval of scooter`;
        }

        return res;
    },

    async alarmOn(scooter, data) {
        const imei = scooter.imei;
        let commandToSend = `scbuzzerctrl 1 ${data.value}`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOn scooter`;
        }

        return res;
    },

    async alarmOff(scooter) {
        const imei = scooter.imei;
        let commandToSend = `scbuzzerctrl 0 ${data.value}`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't alarmOff scooter`;
        }

        return res;
    },

    async getLocation(scooter) {
        const imei = scooter.imei;
        let commandToSend = `ggps`;

        let res = await this.sendCommand(imei, commandToSend, scooter.userId);
        if (!res.isRequested && !res.message) {
            res.message = `Can't get current location of scooter`;
        }

        return res;
    },

    async encodeCommand(command, imei, commandQuantity) {
        command = UtilService.ascii2Hex(command);
        let commandSize = command.length / 2;
        let dataSize = commandStructure.codecId.end + commandStructure.commandQuantity1.end + commandStructure.commandType.end + commandStructure.commandSize.end + command.length + commandStructure.commandQuantity2.end;
        dataSize /= 2;
        console.log("dataSize => " + dataSize);
        dataSize = UtilService.decToHex(dataSize);
        commandSize = UtilService.decToHex(commandSize);
        imei = UtilService.decToHex(imei);
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
        encodedCommand += await this.calculateCRC(encodedCommand);

        return encodedCommand;
    },

    async calculateCRC(command) {
        let crc = 0x0000;
        let maxLen = command.length / 2;
        for (let i = 0; i < maxLen; i++) {
            let byte = command.substr(i * 2, 2);
            crc = crc ^ byte;
            console.log("crc => ", crc);
            for (let j = 0; j < 8; j++) {
                crc = crc & 0x0001 ? (crc >> 1) ^ 0xA001 : crc >> 1;
            }
        }

        console.log("crc => ", crc);

        return crc;
    },


    async sendCommand(imei, command, userId, currentTry = 1) {
        console.log('----------------- Publish To scooter Log Start-----------------');
        console.log(`in sendCommand ${imei}, command: ${command},userId  ${userId} currentTry = ${currentTry}`);

        command = await this.encodeCommand(command, imei, '01');
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

        res.isRequested = await new Promise((resolve, reject) => {
            console.log("Command ==>  ", command)
            console.log("imei ==>  ", imei)
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
        console.log('After Promise');
        await IOTApiLog.create(iotRequest);
        console.log('After API Log');

        if (!res.isRequested && iotRequest.requestTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {

            await this.sendCommand(imei, command, userId, iotRequest.requestTry + 1);
        }
        console.log('----------------- Publish To scooter Log End-----------------');

        return res;
    }
};
