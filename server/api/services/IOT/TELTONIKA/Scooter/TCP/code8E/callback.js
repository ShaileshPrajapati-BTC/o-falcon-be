const UtilService = require('../../../../../util');
const IotCallbackHandler = require('../../../../../iotCallbackHandler');
const ackStructure = {
    zeroBytes: { start: 0, end: 8 },
    dataSize: { start: 8, end: 8 },
    codecId: { start: 16, end: 2 },
    noOfData1: { start: 18, end: 2 },
    timestamp: { start: 20, end: 16 },
    priority: { start: 36, end: 2 },
    longitude: { start: 38, end: 8 },
    latitude: { start: 46, end: 8 },
    altitude: { start: 54, end: 4 },
    angle: { start: 58, end: 4 },
    satellites: { start: 62, end: 2 },
    speed: { start: 64, end: 4 },
    eventIOId: { start: 68, end: 4 },
    nOfTotalId: { start: 72, end: 4 },
    n1OfOneByte: { start: 76, end: 4 },
    ioId: { end: 4 },
    noOfData2: { end: 2 },
    crc16: { end: 8 }
};

module.exports = {
    decodeAcknowledgement(ack) {
        let ackData = {};
        if (ack.substr(ackStructure.noOfData1.start, ackStructure.noOfData1.end) == ack.substr(ack.length - 10, ackStructure.noOfData2.end)) {
            ackData.ackResponse = ('00000000' + ack.substr(ackStructure.noOfData1.start, ackStructure.noOfData1.end)).substr(-8);
            let hexValue = '';
            let tst100Keys = sails.config.TELTONIKA.AVLIDS;

            hexValue = ack.substr(ackStructure.timestamp.start, ackStructure.timestamp.end);
            ackData.dateTime = UtilService.hexToDec(hexValue);

            hexValue = ack.substr(ackStructure.longitude.start, ackStructure.longitude.end);
            ackData.lng = UtilService.convertAckToLocation(hexValue);

            hexValue = ack.substr(ackStructure.latitude.start, ackStructure.longitude.end);
            ackData.lat = UtilService.convertAckToLocation(hexValue);

            hexValue = ack.substr(ackStructure.altitude.start, ackStructure.altitude.end);
            ackData.altitude = UtilService.hexToDec(hexValue);

            hexValue = ack.substr(ackStructure.angle.start, ackStructure.angle.end);
            ackData.angle = UtilService.hexToDec(hexValue);

            hexValue = ack.substr(ackStructure.satellites.start, ackStructure.satellites.end);
            ackData.satellites = UtilService.hexToDec(hexValue);

            hexValue = ack.substr(ackStructure.speed.start, ackStructure.speed.end);
            ackData.satellitesSpeed = UtilService.hexToDec(hexValue);

            hexValue = ack.substr(ackStructure.eventIOId.start, ackStructure.eventIOId.end);
            ackData.eventIOId = UtilService.hexToDec(hexValue);
            ackData.event = tst100Keys[ackData.eventIOId];

            hexValue = ack.substr(ackStructure.nOfTotalId.start, ackStructure.nOfTotalId.end);
            let totalElements = UtilService.hexToDec(hexValue);
            let elementCount = 0;
            let elementValueSize = 2;
            let currentPointer = ackStructure.n1OfOneByte.start;

            while (elementCount < totalElements) {
                hexValue = ack.substr(currentPointer, ackStructure.n1OfOneByte.end);
                let totalElementOfCurrentByte = UtilService.hexToDec(hexValue);
                currentPointer += ackStructure.n1OfOneByte.end;

                for (let i = 0; i < totalElementOfCurrentByte; i++) {
                    try {
                        hexValue = ack.substr(currentPointer, ackStructure.ioId.end);
                        let ioId = UtilService.hexToDec(hexValue);
                        currentPointer += ackStructure.ioId.end;
                        ioId = tst100Keys[ioId];

                        hexValue = ack.substr(currentPointer, elementValueSize);
                        ackData[ioId] = UtilService.hexToDec(hexValue);
                        currentPointer += elementValueSize;

                        elementCount++;
                    } catch (error) { }
                }

                elementValueSize *= 2;
            }

        }

        return ackData;
    }
};