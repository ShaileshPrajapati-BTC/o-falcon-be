const querystring = require('querystring');
const request = require('request');

const ProjectSetupConfigService = require('../../../../projectSetupConfig');

module.exports = {

    async lockUnlock(reqCommand, scooter) {
        let command = reqCommand;
        if (reqCommand === 'start' || reqCommand === 'unlock') {
            command = 'unlock';
        } else if (reqCommand === 'stop' || reqCommand === 'lock') {
            command = 'lock';
        }
        let url = `/api/vehicle/control/${command}`;
        const method = 'post';
        const imei = scooter.imei;
        let res;
        const otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            manufacturer: scooter.manufacturerRegion
        };
        res = await this.sendRequest(method, command, url, imei, 'application/json', otherParams, reqCommand);
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('iot res');
            console.log(res);
            console.log(typeof res);
            console.log(typeof res.data);
            console.log('iot res');
        }
        let modifiedResponse = {
            isRequested: false
        };
        if (res.message) {
            modifiedResponse.message = res.message;
        } else {
            modifiedResponse.message = 'Operation executed successfully.';
        }

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't ${command} Scooter`;
        }

        return modifiedResponse;
    },

    async lightOn(scooter) {
        const method = 'post';
        const url = '/api/vehicle/control/headlight';
        const imei = scooter.imei;
        let otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            controlType: 1,
            manufacturer: scooter.manufacturerRegion
        };
        let res = await this.sendRequest(method, 'lightOn', url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.LIGHT_ON);
        let modifiedResponse = {
            isRequested: false
        };
        if (res.message) {
            modifiedResponse.message = res.message;
        } else {
            modifiedResponse.message = 'Light on request sent successfully.';
        }

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't lightOn Scooter`;
        }

        return modifiedResponse;
    },

    async lightOff(scooter) {
        const method = 'post';
        const url = '/api/vehicle/control/headlight';
        const imei = scooter.imei;
        let otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            controlType: 0,
            manufacturer: scooter.manufacturerRegion
        };
        let res = await this.sendRequest(method, 'lightOn', url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.LIGHT_OFF);
        let modifiedResponse = {
            isRequested: false
        };
        if (res.message) {
            modifiedResponse.message = res.message;
        } else {
            modifiedResponse.message = 'Light off request sent successfully.';
        }

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't lightOff Scooter`;
        }

        return modifiedResponse;
    },

    async alarmOn(scooter, data, contentType = 7) {
        const command = 'alarmOn';
        const method = 'post';
        const imei = scooter.imei;
        const url = '/api/vehicle/control/toot';
        const otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            contentType: contentType,
            manufacturer: scooter.manufacturerRegion
        };
        let res = await this.sendRequest(method, command, url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        let modifiedResponse = {
            isRequested: false
        };
        if (res.data == 1) {
            modifiedResponse.isRequested = true;
            if (res.message) {
                modifiedResponse.message = res.message;
            } else {
                modifiedResponse.message = 'Alarm on successfully.';
            }
        } else {
            modifiedResponse.message = 'Alarm on failed.';
        }

        return modifiedResponse;
    },

    async alarmOff(scooter, data, contentType = 6) {
        const command = 'alarmOn';
        const method = 'post';
        const imei = scooter.imei;
        const url = '/api/vehicle/control/toot';
        const otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            contentType: contentType,
            manufacturer: scooter.manufacturerRegion
        };
        let res = await this.sendRequest(method, command, url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        let modifiedResponse = {
            isRequested: false
        };
        if (res.data == 1) {
            modifiedResponse.isRequested = true;
            if (res.message) {
                modifiedResponse.message = res.message;
            } else {
                modifiedResponse.message = 'Alarm off successfully.';
            }
        } else {
            modifiedResponse.message = 'Alarm off failed.';
        }

        return modifiedResponse;
    },

    async setMaxSpeed(scooter, data) {
        const method = 'post';
        const url = "/api/vehicle/setting/speed-limit";
        const imei = scooter.imei;
        let otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            lowSpeedLimit: data.value,
            mediumSpeedLimit: data.value,
            highSpeedLimit: data.value,
            manufacturer: scooter.manufacturerRegion
        };
        let res = await this.sendRequest(method, 'setMaxSpeedLimit', url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        let modifiedResponse = {
            isRequested: false
        };
        if (res.message) {
            modifiedResponse.message = res.message;
        } else {
            modifiedResponse.message = 'Set max speed limit request sent successfully.';
        }
        if (res.success) {
            await Vehicle.update({ id: scooter.id }).set({
                maxSpeedLimit: {
                    requestedValue: data.value,
                    status: sails.config.SET_IOT_COMMAND_STATUS.success,
                    actualValue: data.value
                }
            });
        }
        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't set max speed of Scooter`;
        }

        return modifiedResponse;
    },

    async setPingInterval(scooter, data) {
        const method = 'post';
        const url = '/api/vehicle/setting/location';
        const imei = scooter.imei;
        let otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            uploadInterval: data.value,
            manufacturer: scooter.manufacturerRegion
        };
        let res = await this.sendRequest(method, 'setPingInterval', url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        let modifiedResponse = {
            isRequested: false
        };
        if (res.data == 1) {
            modifiedResponse.isRequested = true;
        }
        if (res.message) {
            modifiedResponse.message = res.message;
        } else {
            modifiedResponse.message = 'Ping interval set successfully.';
        }

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't set ping interval`;
        }
        if (res.success) {
            await Vehicle.update({ id: scooter.id }).set({
                pingInterval: {
                    requestedValue: data.value,
                    status: sails.config.SET_IOT_COMMAND_STATUS.success,
                    actualValue: data.value
                }
            });
        }

        return modifiedResponse;
    },

    async setRidePingInterval(scooter, data) {
        const method = 'post';
        const url = '/api/vehicle/setting/location';
        const imei = scooter.imei;
        let otherParams = {
            iotCode: imei,
            vehicleCode: imei,
            uploadInterval: data.value,
            manufacturer: scooter.manufacturerRegion
        };
        let res = await this.sendRequest(method, 'setPingInterval', url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        let modifiedResponse = {
            isRequested: false
        };
        if (res.data == 1) {
            modifiedResponse.isRequested = true;
        }
        if (res.message) {
            modifiedResponse.message = res.message;
        } else {
            modifiedResponse.message = 'Ride ping interval set successfully.';
        }
        if (res.success) {
            await Vehicle.update({ id: scooter.id }).set({
                ridePingInterval: {
                    requestedValue: data.value,
                    status: sails.config.SET_IOT_COMMAND_STATUS.success,
                    actualValue: data.value
                }
            });
        }
        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't set ride ping interval`;
        }

        return modifiedResponse;
    },

    async location(scooter) {
        const command = 'location';
        const method = 'get';
        const imei = scooter.imei;
        const otherParams = {
            manufacturer: scooter.manufacturerRegion
        }
        const url = `/api/vehicle/query/get?iotCode=${imei}&vehicleCode=${imei}&realTimeLocation=true&realTimeStatus=true`;
        let res = await this.sendRequest(method, command, url, imei, 'application/json', otherParams, sails.config.IOT_COMMAND_NAME.LOCATION);
        if (!res.status) {

            await iotCallbackHandler.updateVehicle(scooter, res);
            res.isRequested = true;
            res.message = 'Getting location successfully';
        } else {
            res.message = 'Getting location failed.';
            res.isRequested = false;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('location location res start, imei =', imei);
            console.log(res);
            console.log('location location res end');
        }

        return res;
    },

    async track(scooter, seconds = 30) {
        let res = await this.location(scooter);
        if (res.status) {
            res.message = "Reconnection failed.";
            res.isRequested = false;
        } else {
            res.message = 'Reconnected successfully.';
            res.isRequested = true;
        }

        return res;
    },

    async connectionStatus(scooter) {
        let res = await this.location(scooter);
        if (res.status == 401) {
            res.message = "Connection failed.";
            res.isRequested = false;
        } else {
            res.message = 'Connected successfully.';
            res.isRequested = false;
        }

        return res;
    },


    async sendRequest(method, command, url, imei, contentType, data = {}, commandName = '', currentTry = 1) {
        let manufacturer = data.manufacturer;
        let iotSetting = await this.getIOTSetting(manufacturer);
        delete data.manufacturer;
        if (!iotSetting.authToken || iotSetting.authToken == '') {
            await this.getNewToken(manufacturer);
            iotSetting = await this.getIOTSetting(manufacturer);
        }
        const authToken = `bearer ${iotSetting.authToken}`;
        let iotRequest = {
            request: {
                url: `${iotSetting.serverUrl}${url}`,
                method: method,
                authToken: authToken,
                data: data
            },
            manufacturer: 'NINEBOT_BICYCLE',
            imei: imei,
            command: command,
            requestTry: currentTry
        };
        await IOTCommandCallbackTrack.create({
            imei: imei,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: JSON.stringify(iotRequest.request)
        });
        let response = await new Promise((resolve, reject) => {
            const options = {
                url: `${iotSetting.serverUrl}${url}`,
                method: method,
                headers: {
                    Authorization: authToken,
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache'
                },
                body: data,
                json: true,
                timeout: 15000,
                followRedirect: true,
                maxRedirects: 10
            };
            request(options, (error, response, body) => {
                if (body) {
                    resolve(body);
                }
                if (error) {
                    resolve({ success: false });
                }
            });
        });
        iotRequest.response = response;
        // console.log('response', url)
        // console.log(response);
        // console.log('response');
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('Response of ' + url + "\n", data, "\n");
            console.log(JSON.stringify(response) + "\n");
        }
        if (typeof response === 'string') {
            response = JSON.parse(response);
        }

        if (response && (response.code || response.error || response.success == false)) {
            if (iotRequest.requestTry === sails.config.MAX_IOT_REQUEST_LIMIT) {
                iotRequest.isRequested = false;
                return {
                    status: 401,
                    code: 'UNPROCESSABLE_ENTITY',
                    message: response.message
                };
            }
            if (response.error) {
                await this.getNewToken(manufacturer);
            }
            data.manufacturer = manufacturer;
            response = await this.sendRequest(method, command, url, imei, contentType, data, commandName, currentTry + 1);
        } else {
            if (!response) {
                response = {};
            }
            response.data = 1;
        }

        return response;
    },


    async getIOTSetting(manufacturer) {
        let nineBotSetting;
        if (manufacturer == sails.config.VEHICLE_MANUFACTURER.NINEBOT_SCOOTER_US) {
            nineBotSetting = {
                grantType: 'client_credentials',
                clientSecret: sails.config.NINE_BOT_US_SETTING_CLIENT_SECRET,
                clientId: sails.config.NINE_BOT_US_SETTING_CLIENT_ID,
                authToken: sails.config.NINE_BOT_US_SETTING_AUTH_TOKEN,
                serverUrl: sails.config.NINE_BOT_US_SETTING_URL
            };
        } else {
            nineBotSetting = {
                grantType: 'client_credentials',
                clientSecret: sails.config.NINE_BOT_EU_SETTING_CLIENT_SECRET,
                clientId: sails.config.NINE_BOT_EU_SETTING_CLIENT_ID,
                authToken: sails.config.NINE_BOT_EU_SETTING_AUTH_TOKEN,
                serverUrl: sails.config.NINE_BOT_EU_SETTING_URL
            };
        }

        return nineBotSetting;
    },

    async getNewToken(manufacturer) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('-------NineBot request get authToken ------');
        }
        const iotSetting = await this.getIOTSetting(manufacturer);
        let url = `${iotSetting.serverUrl}/oauth/token`;
        let data = {
            client_id: iotSetting.clientId,
            client_secret: iotSetting.clientSecret,
            grant_type: iotSetting.grantType
        };
        data = querystring.encode(data);
        let response = await new Promise((resolve, reject) => {
            request({
                url: url,
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
                body: data,
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            }, (error, response, body) => {
                console.log(error);
                resolve(body);
            });
        });
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log("Get Token Response ");
            console.log(response);
        }
        response = JSON.parse(response);
        if (response.access_token) {
            await this.setAuthToken(response.access_token, manufacturer);
        }
    },

    async setAuthToken(token, manufacturer) {
        console.log("Inside set auth token");
        let setupConfig = await SetupConfig.find({ limit: 1 })
            .select(['id']);
        setupConfig = setupConfig[0];
        let param = {};
        if (manufacturer == sails.config.VEHICLE_MANUFACTURER.NINEBOT_SCOOTER_US) {
            param = {
                id: setupConfig.id,
                nineBotUsSettingAuthToken: token
            };
            sails.config.NINE_BOT_US_SETTING_AUTH_TOKEN = token;
        } else {
            param = {
                id: setupConfig.id,
                nineBotEuSettingAuthToken: token
            };
            sails.config.NINE_BOT_EU_SETTING_AUTH_TOKEN = token;
        }
        await ProjectSetupConfigService.updateConfig(
            param,
            'setupconfig',
            true
        );
    },

    async validateSignature(data) {
        let signature = '';
        let signatureToMatch = data.signature.toLowerCase();
        delete data.signature;
        Object.keys(data).sort().forEach(function (key) {
            signature += key + '=' + data[key] + '&';
        });
        let vehicle = await Vehicle.findOne({ imei: data.iotCode }).populate('manufacturer');
        if (!vehicle || !vehicle.manufacturer) {

            return false;
        }

        let setting = await this.getIOTSetting(vehicle.manufacturer.code);
        signature += 'client_secret=' + setting.clientSecret;
        signature = util.generateMd5Hash(signature);
        if (signature == signatureToMatch) {

            return true;
        }

        return false;
    }
};