const querystring = require('querystring');
const request = require('request');

const serverUrl = 'http://192.168.0.154:7024';
const ProjectSetupConfigService = require('../../../projectSetupConfig');
module.exports = {

    getTimestamp() {
        return parseInt(new Date().getTime() / 1000);
    },
    async lockUnlock(command, scooter, bookingNumber) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == scooter.imei)) {
            console.log('c-iot command=>' + command);
            console.log('c-iot scooter=>', (scooter));
        }
        const method = 'post';
        const imei = scooter.imei;
        const currentTimestamp = this.getTimestamp();
        const otherParams = {
            data: {
                imei,
                bookingNumber,
                currentTimestamp,
                type: command,
                lat: sails.config.DEFAULT_MAP_CORUSCATE.lat,
                lng: sails.config.DEFAULT_MAP_CORUSCATE.lng
            }
        };
        let res = await this.sendRequest(method, command, imei, otherParams, command);

        // console.log('res iot data', new Date());
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res ', res);
        }

        let modifiedResponse = {
            isRequested: false,
            message: res.message
        };

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't ${command} Scooter`;
        }
        // console.log('modifd=' + JSON.stringify(modifiedResponse));


        return modifiedResponse;
    },

    async buzzOn(command, scooter, bookingNumber) {
        let modifiedResponse = {
            isRequested: true,
            message: ""
        };
        return modifiedResponse;
    },

    async sendRequest(method, command, imei, data = [], commandName = '', currentTry = 1) {
        let url = this.buildRequest(method, command, imei, data);
        url += `?projectCode=${sails.config.VIRTUAL_SCOOTER_PROJECT_CODE}`;
        // if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
        //     console.log('url-send=>' + url);
        // }
        const currentTimestamp = this.getTimestamp();
        const authToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NjIwNjM2ODMsImlhdCI6MTU2MjA1NjQ4MywidXNyIjoiRGV2aWNlMV9QdW5lIn0.6sPHJxnsxXpTbk6DvpVPzdzO0-pwclvg6UKtCvG0CIg`;
        let iotRequest = {
            request: {
                url: url,
                method: method,
                auth: authToken,
                data: data
            },
            manufacturer: 'CORUSCATEIOT',
            imei: imei,
            command: command,
            currentTimestamp: currentTimestamp,
            requestTry: currentTry
        };
        let commandToSave = {
            url: url,
            data: data
        };
        await IOTCommandCallbackTrack.create({
            imei: imei,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: JSON.stringify(commandToSave)
        });
        let response = await new Promise((resolve, reject) => {
            const options = {
                url: url,
                method: method,
                json: data,
                headers: {
                    Authorization: authToken,
                    'Content-Type': 'application/json;indent=2'
                },
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            };
            request(options, (error, response, body) => {
                resolve(body);
            });
        });
        // console.log('iotRequest -=>' + JSON.stringify(iotRequest));
        // console.log('ciot-Response=1>' + JSON.stringify(response));
        iotRequest.response = response;
        await IOTApiLog.create(iotRequest);

        if (typeof response === 'string') {
            response = JSON.stringify(response);
        }

        if (response && !response.data && response.message) {
            if (iotRequest.requestTry >= sails.config.MAX_IOT_REQUEST_LIMIT) {
                return {
                    status: 401,
                    code: 'UNPROCESSABLE_ENTITY',
                    message: response.message
                };
            }
            if (response.code === 101 || response.code === 102) {
                await this.getNewToken();
            }
            if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
                console.log('send-Response=2>' + JSON.stringify(response));
            }
            response = await this.sendRequest(method, command, imei, data, commandName, currentTry + 1);
        }

        return response;
    },
    async getSetting() {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('in custom getSetting');
        }
        let setting = {
            coruscateIotSetting: {
                signInUrl: sails.config.CORUSCATE_IOT_SETTING_SIGN_IN_URL,
                callbackUrl: sails.config.CORUSCATE_IOT_SETTING_CALLBACK_URL,
                email: sails.config.CORUSCATE_IOT_SETTING_EMAIL,
                password: sails.config.CORUSCATE_IOT_SETTING_PASSWORD,
                username: sails.config.CORUSCATE_IOT_SETTING_USERNAME,
                authToken: sails.config.CORUSCATE_IOT_SETTING_AUTH_TOKEN
            }
        };
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('settings-=>' + JSON.stringify(setting));
        }

        return setting;
    },
    buildRequest(method, command, imei, otherParams) {

        const getUrl = `${sails.config.VIRTUAL_SCOOTER_SERVER_URL}/${command}`;
        const setUrl = `${sails.config.VIRTUAL_SCOOTER_SERVER_URL}/${command}`;
        let url = setUrl;
        method = method.toLowerCase();

        if (method === 'get') {
            url = getUrl;
        }
        return url;
    },
    async getNewToken() {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('-------corscateIOT request get authToken ------');
        }
        let url = `${sails.config.VIRTUAL_SCOOTER_SERVER_URL}/auth/`;
        let iotSetting = await this.getIOTSetting();
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('IotSetting-=>' + JSON.stringify(iotSetting));
        }
        let data = {
            account: iotSetting.username,
            password: iotSetting.password
        };

        data = querystring.encode(data);
        let response = await new Promise((resolve, reject) => {
            request({
                url: url,
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data,
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            }, (error, response, body) => {
                resolve(body);
            });
        });
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('build-response=>' + JSON.stringify(response));
        }
        response = JSON.parse(response);
        if (response.data) {
            await this.setAuthToken(response.data);
        }
    },
    async setAuthToken(token) {
        let setupConfig = await SetupConfig.find({ limit: 1 })
            .select(['id']);
        setupConfig = setupConfig[0];
        let param = {
            id: setupConfig.id,
            coruscateIotSettingAuthToken: token
        };
        let updatedRecord = await ProjectSetupConfigService.updateConfig(
            param,
            'setupconfig',
            true
        );

        return updatedRecord.coruscateIotSettingAuthToken;
    },
    async getIOTSetting() {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('in getIOTSetting');
        }
        let setting = await this.getSetting();
        if (sails.config.GET_SCOOTER_COMMAND_LOGS) {
            console.log('setting.coruscateSetting=>>' + JSON.stringify(setting.coruscateIotSetting));
        }

        return setting.coruscateIotSetting;
    },
    async track(scooter, seconds) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == scooter.imei)) {
            console.log('in track');
        }
        const command = 'track';
        const imei = scooter.imei;
        const currentTimestamp = this.getTimestamp();

        let scooterLat;
        let scooterLng;
        if (!scooter.currentLocation) {
            scooterLat = sails.config.DEFAULT_MAP_CORUSCATE.lat;
            scooterLng = sails.config.DEFAULT_MAP_CORUSCATE.lng;
        }
        if (scooter.currentLocation != null) {
            scooterLat = scooter.currentLocation.coordinates[1];
            scooterLng = scooter.currentLocation.coordinates[0];
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('scooter lat=>', scooterLat, '  lng=>', scooterLng);
        }
        const data = {
            seconds,
            imei,
            currentTimestamp,
            type: command,
            manufacturer: 'CORUSCATEIOT',
            imei: imei,
            lat: scooterLat,
            lng: scooterLng,

        };

        let res = await this.sendRequest('post', command, imei, data, sails.config.IOT_COMMAND_NAME.TRACK);
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('track location res start, imei =', imei);
            console.log(res);
        }
        // console.log('track location res end');
        let modifiedResponse = {
            isRequested: false,
            message: res.message
        };
        if (res.data == 1) {
            modifiedResponse.isRequested = true;

            return modifiedResponse;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't track Scooter`;

            return modifiedResponse;
        }

        return res;
    },
    async setMaxSpeed(scooter, data) {
        console.log('insetMaxSpeed');
        const method = 'post';
        const imei = scooter.imei;
        let otherParams = [0, 0, 0, 0, 0, 0, data.speed, 0];
        let res = await this.sendRequest(method, 'infoSet2', imei, otherParams, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        let modifiedResponse = {
            isRequested: false,
            message: res.message
        };

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't lightOff Scooter`;
        }

        return modifiedResponse;
    },
}