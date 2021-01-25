const UtilService = require('../../../../../util');
const ackStructure = {
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
    decodeAcknowledgement(ack) {
        let ackData;
        if (ack.substr(ackStructure.commandType.start, ackStructure.commandType.end) != '06') {

            throw Error('Acknowledgement type is not verified.');
        }
        let commandQuantity1 = ack.substr(ackStructure.commandQuantity1.start, ackStructure.commandQuantity1.end);
        let commandQuantity2 = ack.substr(ack.length - (ackStructure.crc16.end + ackStructure.commandQuantity2.end), ackStructure.commandQuantity2.end);
        console.log("CommandQuantity1 => ", commandQuantity1);
        console.log("CommandQuantity2 => ", commandQuantity2);

        if (commandQuantity1 != commandQuantity2) {

            throw Error('Command Quantity not matched.');
        }
        let responseSize = ack.substr(ackStructure.commandSize.start, ackStructure.commandSize.end);
        responseSize = UtilService.hexToDec(responseSize);
        responseSize = responseSize * 2;
        console.log("ResponseSize => ", responseSize);
        let hexResponse = ack.substr(ackStructure.command.start, responseSize);
        console.log("HexResponse => ", hexResponse);
        let data = UtilService.hex2Ascii(hexResponse);
        console.log(data);
        // data = data.replace(/ /g, `","`);
        // data = data.replace(/:/g, `":"`);
        // data = '{"' + data + '"}';
        //  data = JSON.parse(data);
        data = this.getResponseJSON(data);
        console.log(data);
        ackData = data;

        return ackData;
    },

    getResponseJSON(data) {
        let response = {};
        let startIndex = 0;
        data = data.split(' ');
        for (let i = 0; i < data.length; i++) {
            let keyValue = data[i].split(':');
            if (!isNaN(keyValue[0])) {
                data[i - 1][1] += ` ${keyValue[0]}:${keyValue[1]}`;
                data[i] = [];

                continue;
            }
            data[i] = keyValue;
        }
        for (let jsonData of data) {
            if (jsonData.length > 0) {
                response[jsonData[0].toLowerCase()] = jsonData[1];
            }
        }

        return response;
    }
};