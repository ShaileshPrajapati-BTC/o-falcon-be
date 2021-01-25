module.exports = {
    async subscribeScooter() {
        console.log('in subscribeScooter');
        let subMaster = await Master.findOne({ code: 'FITRIDER' });
        if (!subMaster || !subMaster.id) {
            return;
        }
        let scooters = await Vehicle.find({
            where: {
                type: sails.config.VEHICLE_TYPE.SCOOTER,
                manufacturer: subMaster.id
            },
            select: ['vehicleCode']
        });
        const topicUrl = sails.config.FITRIDER.TOPIC_URL;

        for (let scooter of scooters) {
            if (scooter.vehicleCode) {
                sails.config.mqttServer.subscribe(`${topicUrl}`, (err) => {
                    if (err) {
                        sails.log.error(`Can't subscribe scooter: ${scooter.vehicleCode}`);
                    }
                    sails.log.debug(`Subscribe to scooter: ${scooter.vehicleCode}`);
                });
            }
        }
    },

    async fitRiderCallbackReceived(topic, data) {
        if (!data.a) {
            return;
        }
        switch (data.a) {
            case 2:
                this.unlockCallbackReceived(data);
                break;

            case 4:
                this.lockCallbackReceived(data);
                break;

            case 14:
                this.setMaxSpeedCallbackReceived(data);
                break;

            case 16:
                this.vehicleTrackData(data);
                break;

            case 17:
                this.vehicleFailureReport(data);
                break;

            case 19:
                this.locationCallbackReceived(data);
                break;

            case 27:
                this.heartBeat(data);
                break;

            case 34:

                break;

            default:
                this.otherCallbackReceived(data);
                break;
        }
    },

    async unlockCallbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log("*********Unlock Callback Start************");
            console.log(data);
        }
        let updateObj = {};
        if (data.s == 0) {
            updateObj = {
                imei: data.i,
                lockStatus: false
            };
            await iotCallbackHandler.findAndUpdateRideAndVehicle(updateObj);
        }
        await IOTCommandCallbackTrack.create({
            imei: data.i,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: updateObj || {}
        });
    },

    async lockCallbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log("*************************Lock Callback Received***********************");
            console.log(data);
        }
        let updateObj = {};
        if (data.s == 0) {
            updateObj = {
                imei: data.i,
                lockStatus: true
            };
            await iotCallbackHandler.findAndUpdateRideAndVehicle(updateObj);
        }
        await IOTCommandCallbackTrack.create({
            imei: data.i,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: updateObj
        });
        // console.log("*************************Lock Callback End***************************");
    },

    async setMaxSpeedCallbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log("**********************Set Max Speed Limit Callback Start**************");
            console.log(data);
        }
        let updateObj = {};
        if (data.s == 0) {
            let vehicle = await Vehicle.findOne({ imei: data.i });
            updateObj = {
                maxSpeedLimit: vehicle.maxSpeedLimit
            };
            await iotCallbackHandler.updateVehicle(vehicle, updateObj);
        }
        await IOTCommandCallbackTrack.create({
            imei: data.i,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: updateObj
        });
        // console.log("**********************Set Max Speed Limit Callback End****************");
    },

    async heartBeat(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log('*****************Heart Beat Received*****************************');
            console.log(data);
        }
        if (!data.b) {
            return;
        }
        const updateObj = {
            imei: data.i,
            batteryLevel: data.b,
            lockStatus: data.c
        }
        await iotCallbackHandler.findAndUpdateRideAndVehicle(updateObj);
        await IOTCommandCallbackTrack.create({
            imei: data.i,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: updateObj
        });
        // console.log('*******************Heart Beat End********************************');
    },

    async locationCallbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log('********************Get Location Callback Received********************');
            console.log(data);
        }
        let locationData = data.g.split(',');
        let updateObj = {
            imei: data.i,
            lat: parseInt(locationData[0]),
            lng: parseInt(locationData[1]),
            businessType: parseInt(locationData[2])
        }
        if (locationData[3] == '0') {
            updateObj.locationType = 'GPS';
        } else {
            updateObj.locationType = 'LBS';
        }
        await iotCallbackHandler.findAndUpdateVehicle(updateObj);
        await IOTCommandCallbackTrack.create({
            imei: data.i,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: updateObj
        });

    },

    async vehicleFailureReport(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log('********************Vehicle Failure Callback Received********************');
            console.log(data);
            await IOTCommandCallbackTrack.create({
                imei: data.i,
                logType: sails.config.IOT_LOG_TYPE.CALLBACK,
                actualCallback: JSON.stringify(data),
                decodedCallback: data
            });
        }
    },

    async vehicleTrackData(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log('************************Track Callback Received***********************');
            console.log(data);
        }
        let updateObj = {
            imei: data.i,
            maxSpeedLimit: data.k,
            currentSpeed: data.p,
            batteryFaultCode: data.e,
            batteryLevel: data.b,
            totalRidingTime: data.y,
            totalRidingMileage: data.q,
            singleRideTime: data.w,
            singleRideDistance: data.z,
            lockStatus: data.c
        };
        await iotCallbackHandler.findAndUpdateRideAndVehicle(updateObj);
        await IOTCommandCallbackTrack.create({
            imei: data.i,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: updateObj
        });
    },

    async setRidePingIntervalCallbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log('****************Set Ride Ping Interval Callback Received******************');
            console.log(data);
        }
        let vehicle = await Vehicle.findOne({ imei: data.i });
        if (!vehicle || !vehicle.imei) {
            return;
        }
        const updateObj = {
            ridePingInterval: vehicle.ridePingInterval.requestedValue,
            imei: vehicle.imei
        };
        await iotCallbackHandler.updateVehicle(vehicle, updateObj);
        await IOTCommandCallbackTrack.create({
            imei: data.i,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(data),
            decodedCallback: updateObj
        });
    },

    async otherCallbackReceived(data) {
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == data.i)) {
            console.log("******************Other callback received****************************");
            console.log(data);
            await IOTCommandCallbackTrack.create({
                imei: data.i,
                logType: sails.config.IOT_LOG_TYPE.CALLBACK,
                actualCallback: JSON.stringify(data),
                decodedCallback: data
            });
        }
    }
};