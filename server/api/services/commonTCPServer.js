const net = require('net');

const OmniScooterService = require(`./IOT/OMNI/Scooter/TCP/callback`);
const OmniBicycleService = require(`./IOT/OMNI/Bicycle/TCP/callback`);
const RideBookingService = require('../services/rideBooking');
const TeltonikaService = require('./IOT/TELTONIKA/Scooter/TCP/callback');
const Bl10Service = require('./IOT/BL10/Bicycle/TCP/callback');
const ZkScooterService = require(`./IOT/ZK/Scooter/TCP/callback`);
const ITriangleService = require('./IOT/ITRIANGLE/Scooter/TCP/callback');
const CellocatorService = require('./IOT/CELLOCATOR/Scooter/TCP/callback');
const CellocatorIOTService = require('./IOT/CELLOCATOR/Scooter/TCP/iot');
const TxedService = require('./IOT/TXED/Scooter/TCP/callback');
const TxedIOTService = require('./IOT/TXED/Scooter/TCP/iot');
const GogoBikeService = require('./IOT/GOGOBIKE/Bicycle/TCP/callback');;

module.exports = {
    async startServer() {
        let clients = {};
        let clientsImei = {};
        let socketData = {};
        const scooterPort = 7035;
        const ScooterCode = sails.config.IOT_OMNI_SCOOTER_CODE;
        const BicycleCode = sails.config.IOT_OMNI_BICYCLE_CODE;
        const manufacturers = sails.config.VEHICLE_MANUFACTURER;
        let onClientConnection = (socket) => {
            // sails.config.lockTCPSockets = socket;
            // Log when a client connects.
            // console.log(` ${socket.remoteAddress}:${socket.remotePort} Connected`);
            // Listen for data from the connected client.
            socket.on('data', async (data) => {
                // console.log("*******************Original Callback**********************");
                // console.log(data);
                // console.log("**********************************************************");
                let dataArr = data.toString().split(',');
                let dataHex = data.toString('hex');
                let actualCallback = '';
                // console.log("*******************After toString('Hex')***********************");
                // console.log(dataHex);
                // console.log("**********************************************************");
                // console.log("*******************After toString()***********************");
                // console.log(dataArr);
                // console.log("**********************************************************");
                let manufacturer = dataArr[0];
                let manufacturerOn2 = dataArr[1];
                let iotType = "";
                // will get based on manufacturer
                let command; 1
                let imei;
                let srNo;
                let remoteAddressKey = socket.remoteAddress.toString() + socket.remotePort.toString();

                switch (true) {
                    // We not added Sample Lock Manufature for using same callback file.
                    case manufacturer === '*CMDR':
                        iotType = manufacturers.OMNI_TCP_BICYCLE;
                        command = dataArr[4];
                        imei = dataArr[2];
                        actualCallback = data.toString();
                        break;

                    case manufacturer === '*SCOR':
                        iotType = manufacturers.OMNI_TCP_SCOOTER;
                        command = dataArr[3];
                        imei = dataArr[2];
                        actualCallback = data.toString();
                        break;

                    case manufacturer.indexOf('+ACK:GT') !== -1 || manufacturer.indexOf('+RESP:GT') !== -1:
                        iotType = manufacturers.ZK_SCOOTER;
                        command = dataArr[0];
                        imei = dataArr[2];
                        actualCallback = data.toString();
                        break;

                    case dataHex.startsWith('000'):
                        iotType = manufacturers.TELTONIKA;
                        actualCallback = dataHex;
                        try {
                            console.log("*****************dataHex*************");
                            console.log(dataHex);
                            let data = await TeltonikaService.decodeAcknowledgement(dataHex);
                            dataArr = data;
                            if (data && data.imei) {
                                socket.write('01', 'hex');
                                imei = data.imei;
                            } else {
                                if (data.ackResponse) {
                                    socket.write(data.ackResponse, 'hex');
                                }
                                dataArr.imei = clientsImei[remoteAddressKey];
                                imei = clientsImei[remoteAddressKey];
                            }
                        } catch (e) {
                            socket.write('00', 'hex');
                            return false;
                        }
                        break;

                    case (dataHex.startsWith('7878') || dataHex.startsWith('7979')):
                        iotType = manufacturers.BL10_TCP_BICYCLE;
                        actualCallback = dataHex;
                        try {
                            console.log('*********************BL10 Callback*******************');
                            console.log(dataHex);
                            let isRightCRC = Bl10Service.checkCrc(dataHex);
                            if (!isRightCRC) {
                                // break;
                            }
                            let serialNo = sails.config.BL10.serialNo[clientsImei[remoteAddressKey]];
                            let data = await Bl10Service.decodeAcknowledgement(dataHex, serialNo);
                            if (data.serialNo) {
                                srNo = data.serialNo;
                            }

                            dataArr = data.ackData;
                            if (dataArr && dataArr.imei) {
                                imei = dataArr.imei;
                            } else {
                                dataArr.imei = clientsImei[remoteAddressKey];
                                imei = clientsImei[remoteAddressKey];
                            }
                            if (!data.ackData || !data.ackResponse || data.ackResponse == '') {
                                iotType = '';
                                console.log('**********************Data**********************');
                                console.log(data);
                                break;
                            }
                            socket.write(data.ackResponse, 'hex');
                        } catch (error) {
                            console.log(error);
                            console.log('Error in decoding BL10 Callback');
                        }
                        break;

                    case (data.toString().startsWith('$$') || data.toString().startsWith('http') || data.toString().startsWith('IGN')):
                        iotType = manufacturers.ITRIANGLE_SCOOTER;
                        actualCallback = data.toString();
                        dataArr = await ITriangleService.decodeCallback(dataArr, clientsImei[remoteAddressKey]);
                        imei = dataArr.imei;
                        break;

                    case dataHex.startsWith('4d434750'):
                        actualCallback = dataHex;
                        if (dataHex.length % 140 == 0) {
                            iotType = manufacturers.CELLOCATOR_TCP_SCOOTER;
                            dataArr = await CellocatorService.decodeCallback(dataHex);
                            let ack = dataArr.ack;
                            dataArr = dataArr.data;
                            console.log("\nsend Ack", ack, '\n');
                            for (let i = 0; i < ack.length; i++) {
                                await socket.write(ack[i], 'hex');
                            }
                            imei = dataArr.imei;
                            socketData[remoteAddressKey] = '';
                        } else {
                            socketData[remoteAddressKey] = dataHex;
                        }

                        break;

                    case data.toString().startsWith('**'):
                        actualCallback = data.toString();
                        iotType = manufacturers.TXED_TCP_PADDLE_BIKE;
                        dataArr = TxedService.decodeCallback(dataArr);
                        //let ack = TexedIOTService.
                        if (dataArr.imei) {
                            imei = dataArr.imei;
                            let ack = await TxedIOTService.generateAck(data);
                            socket.write(ack);
                        } else {
                            imei = clientsImei[remoteAddressKey];
                            dataArr.imei = imei;
                        }
                        break;

                    // case dataHex.startsWith('7878'):
                    //     iotType = manufacturers.GOGOBIKE_TCP_BICYCLE;
                    //     let isValidCrc = await GogoBikeService.checkCrc(dataHex);
                    //     if (!isValidCrc) {
                    //         return;
                    //     }
                    //     dataArr = await GogoBikeService.decodeCallback(dataHex, clientsImei[remoteAddressKey]);;
                    //     if (dataArr.ack) {
                    //         await socket.write(dataArr.ack, 'hex');
                    //     }
                    //     dataArr = dataArr.data;
                    //     if (dataArr.imei) {
                    //         imei = dataArr.imei;
                    //     } else {
                    //         dataArr.imei = clientsImei[remoteAddressKey];
                    //     }

                    //     break;

                    default:
                        if (socketData[remoteAddressKey]) {
                            socketData[remoteAddressKey] = socketData[remoteAddressKey] + dataHex;
                            if (socketData[remoteAddressKey].length % 140 == 0) {
                                iotType = manufacturers.CELLOCATOR_TCP_SCOOTER;
                                dataArr = await CellocatorService.decodeCallback(socketData[remoteAddressKey]);
                                let ack = dataArr.ack;
                                dataArr = dataArr.data;
                                console.log("\nsend Ack", ack, '\n');
                                for (let i = 0; i < ack.length; i++) {
                                    await socket.write(ack[i], 'hex');
                                }
                                imei = dataArr.imei;
                                socketData[remoteAddressKey] = '';
                            }
                        }
                        console.log('other callback received');
                        break;

                }
                // console.log(`Received from  scooter client: , imei: ${imei}, command: ${command}`);
                if (imei) {
                    clients[imei] = socket;
                    clientsImei[remoteAddressKey] = imei;
                }
                if (srNo) {
                    sails.config.BL10.serialNo[clientsImei[remoteAddressKey]] = srNo;
                }
                // let modelName = 'iotcallbackinfotrack';
                // let lockUnlockCommands = ['L0', 'L1'];
                // let locationCommands = ['D0'];
                // if (command && lockUnlockCommands.indexOf(command) > -1) {
                //     modelName = 'iotcallbacklockunlocktrack';
                // } else if (command && locationCommands.indexOf(command) > -1) {
                //     modelName = 'iotcallbacklocationtrack';
                // }
                // let logsCreateParams = { imei: imei, data: dataArr };
                // if (modelName === 'iotcallbackinfotrack') {
                //     logsCreateParams.dataHex = dataHex;
                // }
                // await sails.models[modelName].create(logsCreateParams);
                let fnName = _.camelCase(command);

                if (imei) {
                    await IOTCommandCallbackTrack.create({
                        imei: imei,
                        logType: sails.config.IOT_LOG_TYPE.CALLBACK,
                        actualCallback: actualCallback,
                        decodedCallback: dataArr
                    });
                }

                switch (true) {
                    case iotType == manufacturers.OMNI_TCP_BICYCLE && typeof OmniBicycleService[fnName] === 'function':
                        await OmniBicycleService[fnName](dataArr);
                        break;

                    case iotType == manufacturers.OMNI_TCP_SCOOTER && typeof OmniScooterService[fnName] === 'function':
                        await OmniScooterService[fnName](dataArr);
                        break;

                    case iotType == manufacturers.ZK_SCOOTER:
                        // dynamic function will be called from service
                        await ZkScooterService.callbackReceived(fnName, dataArr);
                        break;

                    case iotType == manufacturers.TELTONIKA:
                        // dataArr.imei = clientsImei[remoteAddressKey];
                        await TeltonikaService.callbackReceived(dataArr);
                        break;

                    case iotType == manufacturers.BL10_TCP_BICYCLE:
                        dataArr.imei = clientsImei[remoteAddressKey];
                        await Bl10Service.callbackReceived(dataArr);
                        break;

                    case iotType == manufacturers.ITRIANGLE_SCOOTER:
                        await ITriangleService.callbackReceived(dataArr);
                        break;

                    case iotType == manufacturers.CELLOCATOR_TCP_SCOOTER:
                        console.log(dataArr);
                        //await CellocatorService.callbackReceived(dataArr);
                        break;

                    case iotType == manufacturers.TXED_TCP_PADDLE_BIKE:
                        await TxedService.callbackReceived(dataArr);
                        break;

                    case iotType == manufacturers.GOGOBIKE_TCP_BICYCLE:
                        await GogoBikeService.callbackReceived(dataArr);
                        break;

                    default:
                        console.log(`callback received with command => ${command}, fnName => ${fnName}`);
                        break;
                }
            });

            // Handle client connection termination.
            socket.on('close', async () => {
                console.log(`${socket.remoteAddress}:${socket.remotePort} Terminated the connection`);
                let imeiKey = socket.remoteAddress.toString() + socket.remotePort.toString();
                let imei = clientsImei[imeiKey];
                console.log(`onSocketClose imei => ${imei}`);
                await RideBookingService.updateDisconnectedVehicle(imei);
            });
            // Handle Client connection error.
            socket.on('error', (error) => {
                console.error(
                    `${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`
                );
            });
        };

        const tcpServer = net.createServer(onClientConnection);

        tcpServer.listen(scooterPort, () => {
            console.log(`TCP Server started on port ${scooterPort}`);
        });

        sails.config.sendTcpCommand = function (imei, command, callback, commandType = '') {
            if (!clients[imei]) {
                return callback('Device is not connected!');
            }

            console.log(`Command send to ${imei} => ${command}`);

            // let data = Buffer.from(command);
            let data = command;
            try {
                if (commandType) {
                    clients[imei].write(data, commandType);
                } else {
                    clients[imei].write(data);
                }

                return callback(null);
            } catch (err) {
                console.error(err);

                return callback(err);
            }

        };
    }
};
