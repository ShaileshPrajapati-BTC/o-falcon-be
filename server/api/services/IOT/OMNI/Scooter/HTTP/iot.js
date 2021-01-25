const querystring = require('querystring');
const request = require('request');

const serverUrl = '';
const getCallbackURL = '';

const ProjectSetupConfigService = require('../../../../projectSetupConfig');

module.exports = {

    getTimestamp() {
        return parseInt(new Date().getTime() / 1000);
    },

    async lockUnlock(reqCommand, scooter, bookingNumber) {
        let command = reqCommand;
        if (reqCommand === 'start') {
            command = 'unlock';
        } else if (reqCommand === 'stop') {
            command = 'lock';
        }
        const method = 'post';
        const imei = scooter.imei;
        let res;
        let currentTry = 1;
        while (currentTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {
            const currentTimestamp = this.getTimestamp();
            const otherParams = [
                bookingNumber || 0,
                currentTimestamp
            ];
            res = await this.sendRequest(method, command, imei, otherParams);
            console.log('iot res');
            console.log(res);
            console.log(typeof res);
            console.log(typeof res.data);
            console.log('iot res');
            if (res.data === 1) {
                currentTry += sails.config.MAX_IOT_REQUEST_LIMIT;
            }
            currentTry++;
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
        console.log('modifiedResponse');
        console.log(modifiedResponse);
        console.log('modifiedResponse');

        return modifiedResponse;
    },

    async lightOn(scooter) {
        const method = 'post';
        const imei = scooter.imei;
        let otherParams = [0, 0, 1, 1];
        let res = await this.sendRequest(method, 'infoSet1', imei, otherParams);
        let modifiedResponse = {
            isRequested: false,
            message: res.message
        };

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't lightOn Scooter`;
        }

        return modifiedResponse;
    },

    async lightOff(scooter) {
        const method = 'post';
        const imei = scooter.imei;
        let otherParams = [0, 0, 0, 0];
        let res = await this.sendRequest(method, 'infoSet1', imei, otherParams);
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

    async setMaxSpeed(scooter, data) {
        const method = 'post';
        const imei = scooter.imei;
        let otherParams = [0, 0, 0, 0, 0, 0, data.value, 0];
        let res = await this.sendRequest(method, 'infoSet2', imei, otherParams);
        let modifiedResponse = {
            isRequested: false,
            message: res.message
        };

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't set max speed of Scooter`;
        }

        return modifiedResponse;
    },

    async setPingInterval(scooter, data) {
        const method = 'post';
        const imei = scooter.imei;
        let otherParams = [0, 0, 0, data.value];
        let res = await this.sendRequest(method, 'iot', imei, otherParams);
        let modifiedResponse = {
            isRequested: false,
            message: res.message
        };

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't set ping interval`;
        }

        return modifiedResponse;
    },

    async setRidePingInterval(scooter, data) {
        const method = 'post';
        const imei = scooter.imei;
        let otherParams = [0, 0, data.value, 0];
        let res = await this.sendRequest(method, 'iot', imei, otherParams);
        let modifiedResponse = {
            isRequested: false,
            message: res.message
        };

        if (res.data === 1) {
            modifiedResponse.isRequested = true;
        } else if (!modifiedResponse.message) {
            modifiedResponse.message = `Can't set ride ping interval`;
        }

        return modifiedResponse;
    },

    async location(scooter) {
        const command = 'location';
        const imei = scooter.imei;
        let res = await this.sendRequest('get', command, imei);
        console.log('location location res start, imei =', imei);
        console.log(res);
        console.log('location location res end');

        return res;
    },

    async track(scooter, seconds = 30) {
        if (typeof seconds === 'object') {
            seconds = 30;
        }
        const command = 'track';
        const imei = scooter.imei;
        let res = await this.sendRequest('get', command, imei, [seconds]);
        // console.log('track location res start, imei =', imei);
        // console.log(res);
        // console.log('track location res end');

        return res;
    },

    async connectionStatus(scooter) {
        const command = 'info';
        const imei = scooter.imei;
        let res = await this.sendRequest('get', command, imei);
        // console.log('*********************info location res start, imei =', imei);
        // console.log(res);
        // console.log('info location res end');
        res.status = !res.message === 'device not connect';

        return res;
    },

    buildRequest(method, command, imei, otherParams) {
        const getUrl = `${serverUrl}/api/E34B43E0B8994F6F93F045565A7D550B.html/scooter/get`;
        const setUrl = `${serverUrl}/api/F803E88631BD4E0BB5777DACF7F825BF.html/scooter/set`;
        let url = setUrl;
        method = method.toLowerCase();
        if (method === 'get') {
            url = getUrl;
        }
        url += `/${command}/${imei}`;
        if (otherParams && otherParams.length > 0) {
            for (const param of otherParams) {
                url += `/${param}`;
            }
        }

        return url;
    },
    // extra params for log purpose only
    async sendRequest(method, command, imei, data = [], currentTry = 1) {
        let url = this.buildRequest(method, command, imei, data);
        let iotSetting = await this.getIOTSetting();
        const authToken = `Bearer ${iotSetting.authToken}`;
        let iotRequest = {
            request: {
                url: url,
                method: method,
                authToken: authToken,
                data: data
            },
            manufacturer: 'OMNI',
            imei: imei,
            command: command,
            requestTry: currentTry
        };
        let response = await new Promise((resolve, reject) => {
            const options = {
                url: url,
                method: method,
                headers: {
                    Authorization: authToken,
                    'Content-Type': 'application/json'
                },
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            };
            request(options, (error, response, body) => {
                resolve(body);
            });
        });
        iotRequest.response = response;
        await IOTApiLog.create(iotRequest);
        // console.log('response', url)
        // console.log(response);
        // console.log('response');
        if (typeof response === 'string') {
            response = JSON.parse(response);
        }

        if (response && !response.data && response.message) {
            if (iotRequest.requestTry === sails.config.MAX_IOT_REQUEST_LIMIT) {
                return {
                    status: 401,
                    code: 'UNPROCESSABLE_ENTITY',
                    message: response.message
                };
            }
            if (response.code === 101 || response.code === 102) {
                await this.getNewToken();
            }
            response = await this.sendRequest(method, command, imei, data, currentTry + 1);
        }

        return response;
    },

    async getSetting() {
        let setting = await Settings.findOne({ type: sails.config.SETTINGS.TYPE.APP_SETTING });

        return setting;
    },

    async getIOTSetting() {
        let omniSetting = {
            signInUrl: sails.config.OMNI_SETTING_SIGN_IN_URL,
            callbackUrl: sails.config.OMNI_SETTING_CALLBACK_URL,
            email: sails.config.OMNI_SETTING_EMAIL,
            password: sails.config.OMNI_SETTING_PASSWORD,
            username: sails.config.OMNI_SETTING_USERNAME,
            authToken: sails.config.OMNI_SETTING_AUTH_TOKEN
        };

        return omniSetting;
    },

    async setAuthToken(token) {
        let setupConfig = await SetupConfig.find({ limit: 1 })
            .select(['id']);
        setupConfig = setupConfig[0];
        let param = {
            id: setupConfig.id,
            omniSettingAuthToken: token
        };
        let updatedRecord = await ProjectSetupConfigService.updateConfig(
            param,
            'setupconfig',
            true
        );

        return updatedRecord.omniSettingAuthToken;
    },

    async getNewToken() {
        console.log('-------omni request get authToken ------');
        let url = `${serverUrl}/auth/28288352F434AB5AB6968F5480476720.html/signin`;
        const iotSetting = await this.getIOTSetting();
        let data = {
            account: iotSetting.username,
            password: iotSetting.password
        };
        data = querystring.encode(data);
        let response = await new Promise((resolve, reject) => {
            request({
                url: url,
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data,
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            }, (error, response, body) => {
                resolve(body);
            });
        });
        response = JSON.parse(response);
        if (response.data) {
            await this.setAuthToken(response.data);
        }
    },

    async setOmniCallback() {
        const setUrl = `${serverUrl}/api/F803E88631BD4E0BB5777DACF7F825BF.html/scooter/set`;
        const method = 'post';
        const command = 'callback';
        let url = `${setUrl}/${command}?url=${getCallbackURL}`;
        let iotSetting = await this.getIOTSetting();
        const authToken = `Bearer ${iotSetting.authToken}`;
        let iotRequest = {
            request: {
                url: url,
                method: method,
                authToken: authToken,
                data: {}
            },
            manufacturer: 'OMNI',
            imei: 'set_callback',
            command: command,
            requestTry: currentTry
        };
        let response = await new Promise((resolve, reject) => {
            const options = {
                url: url,
                method: method,
                headers: {
                    Authorization: authToken,
                    'Content-Type': 'application/json'
                },
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            };
            request(options, (error, response, body) => {
                resolve(body);
            });
        });
        iotRequest.response = response;
        await IOTApiLog.create(iotRequest);
        // console.log('response', url);
        // console.log(response);
        // console.log('response');
        if (typeof response === 'string') {
            response = JSON.parse(response);
        }

        if (response && !response.data && response.message) {
            if (iotRequest.requestTry === sails.config.MAX_IOT_REQUEST_LIMIT) {
                return {
                    status: 401,
                    code: 'UNPROCESSABLE_ENTITY',
                    message: response.message
                };
            }
            if (response.code === 101 || response.code === 102) {
                await this.getNewToken();
            }
            response = await this.sendRequest(method, command, imei, data, currentTry + 1);
        }

        return response;
    }
};
