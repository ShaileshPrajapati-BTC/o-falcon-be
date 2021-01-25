const UtilService = require(`../../../../util`);

module.exports = {

    async lockUnlock(command, scooter, bookingNumber) {
        const imei = scooter.imei;
        const commandToSend = { cmd: command };
        let res = {
            isRequested: false,
            message: ''
        };
        // only available in old system
        // if (bookingNumber && sails.config.IS_ADVERTISE_ENABLE) {
        //     commandToSend.value = bookingNumber;
        // }
        res.isRequested = await this.publishToScooter(imei, commandToSend, command);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res, bookingNumber = ', bookingNumber);
            console.log(res);
            console.log('res');
        }
        if (sails.config.IS_ADVERTISE_ENABLE && res.isRequested &&
            (command === 'start' || command === 'stop')
        ) {
            let fileIndex = 101;
            if (command === 'stop') {
                fileIndex = 102;
            }
            await this.playAudio(scooter, fileIndex)
        }

        return res;
    },

    async lightOn(scooter) {
        const imei = scooter.imei;
        const commandToSend = {
            cmd: 'lighton',
            value: `0, 0`
        };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.LIGHT_ON);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async lightOff(scooter) {
        const imei = scooter.imei;
        const commandToSend = { cmd: 'lightoff' };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.LIGHT_OFF);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async buzzOn(scooter) {
        const imei = scooter.imei;
        const commandToSend = {
            cmd: 'alarmon',
            value: `0, ${sails.config.BUZZ_COMMAND_INTERVAL}`
        };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.BUZZ_ON);
        if (sails.config.BUZZ_COMMAND_ITERATION_COUNT > 1) {
            let i = 1;
            let commandInterval = await setInterval(async () => {
                await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.BUZZ_ON);
                i++;
                if (i >= sails.config.BUZZ_COMMAND_ITERATION_COUNT) {
                    clearInterval(commandInterval);
                }
            }, sails.config.BUZZ_COMMAND_INTERVAL * 1000);
        }
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async alarmOn(scooter) {
        const imei = scooter.imei;
        const commandToSend = {
            cmd: 'alarmon',
            value: `0, 4`
        };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.ALARM_ON);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async alarmOff(scooter) {
        const imei = scooter.imei;
        const commandToSend = { cmd: 'alarmoff' };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.ALARM_OFF);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async setMaxSpeed(scooter, data) {
        const imei = scooter.imei;
        const commandToSend = {
            cmd: 'param',
            value: `speedlim,${data.value}`
        };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.SET_MAX_SPEED);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async setPingInterval(scooter, data) {
        const imei = scooter.imei;
        const commandToSend = {
            cmd: 'param',
            value: `tripint,${data.value}`
        };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.SET_PING_INTERVAL);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async setRidePingInterval(scooter, data) {
        const imei = scooter.imei;
        const commandToSend = {
            cmd: 'param',
            value: `ping,${data.speed}`
        };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.SET_RIDE_PING_INTERVAL);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async track(scooter, seconds = 30) {
        if (typeof seconds === 'object') {
            seconds = 30;
        }
        const imei = scooter.imei;
        let res = { isRequested: true };
        const topicUrl = sails.config.ZIMO_TOPIC_URL;
        res.isRequested = await this.subscribeToScooter(imei, `${topicUrl}${imei}`);
        if (res.isRequested) {
            const command = { cmd: 'param', value: `ping,${seconds}` };
            await this.publishToScooter(imei, command, sails.config.IOT_COMMAND_NAME.TRACK);
        }
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == imei)) {
            console.log('res');
            console.log(res);
            console.log('res');
        }

        return res;
    },

    async uploadFileToScooter(scooter) {
        const imei = scooter.imei;

        const serverUrl = UtilService.getBaseUrl();
        const commandToSend = { cmd: 'useraudioota', value: `${serverUrl}/audio_files/audio_content.txt` };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.UPLOAD_FILE_TO_SCOOTER);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async playAudio(scooter, value) {
        const imei = scooter.imei;
        const volume = sails.config.ADVERTISE_VOLUME;
        let fileIndex = value;
        if (fileIndex.value) {
            fileIndex = fileIndex.value;
        }
        const commandToSend = { cmd: 'playaudio', value: `${fileIndex},1,${volume}` };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.PLAY_AUDIO);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
            console.log('res.message', res.message);
        }

        return res;
    },

    async autoPlayEnable(scooter) {
        const imei = scooter.imei;
        const commandToSend = { cmd: 'param', value: 'audio,1,80' };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.AUTO_PLAY_ENABLE);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async autoPlayDisable(scooter) {
        const imei = scooter.imei;
        const commandToSend = { cmd: 'param', value: 'audio,0,80' };
        let res = {
            isRequested: false,
            message: ''
        };
        res.isRequested = await this.publishToScooter(imei, commandToSend, sails.config.IOT_COMMAND_NAME.AUTO_PLAY_DISABLE);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },


    async commandToPerform(scooter, params) {
        const data = params.data;
        const imei = scooter.imei;
        const commandToSend = { cmd: data.command };
        if (data.value) {
            commandToSend.value = data.value;
        }
        let res = {
            isRequested: false,
            message: ''
        };
        console.log('commandToSend', commandToSend);
        res.isRequested = await this.publishToScooter(imei, commandToSend, data.command);
        if (!res.isRequested) {
            res.message = `Scooter is not connected. Please check scooter connectivity. You may consider keeping scooter in open area to improve connectivity.`;
        }

        return res;
    },

    async subscribeToScooter(imei, topic, currentTry = 1) {
        console.log(`in subscribeToScooter ${imei}`);
        let iotRequest = {
            request: { topic: topic },
            manufacturer: 'ZIMO',
            imei: imei,
            requestTry: currentTry
        };
        let res = await new Promise((resolve, reject) => {
            sails.config.mqttServer.subscribe(topic, (err) => {
                let message = `Subscribe to scooter: ${imei}, topic: ${topic}`;
                iotRequest.response = { message };
                if (err) {
                    iotRequest.response.message = `Can't subscribe scooter: ${imei}, topic: ${topic}`;
                    console.error(iotRequest.response.message);
                    resolve(false);
                }
                console.log(iotRequest.response.message);
                resolve(true);
            });
        });
        await IOTApiLog.create(iotRequest);
        if (!res && iotRequest.requestTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {
            await this.subscribeToScooter(imei, topic, iotRequest.requestTry + 1);
        }

        return res;
    },

    async publishToScooter(topic, command, commandName = '', currentTry = 1) {
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == topic)) {
            console.log('----------------- Publish To Scooter Log Start-----------------');
            console.log(`in publishToScooter ${topic}, command: ${command}, currentTry = ${currentTry}`);
        }
        let iotRequest = {
            request: { topic: topic },
            data: command,
            manufacturer: 'ZIMO',
            imei: topic,
            requestTry: currentTry
        };
        await IOTCommandCallbackTrack.create({
            imei: topic,
            logType: sails.config.IOT_LOG_TYPE.COMMAND,
            commandName: commandName,
            sentCommand: JSON.stringify(command) || ''
        });
        if (sails.config.GET_SCOOTER_COMMAND_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == topic)) {
            console.log(`in publishToScooter ${topic}, command: ${command}`);
            console.log('Before Promise');
        }
        let res = await new Promise((resolve, reject) => {
            // console.log('In Promise');
            let qos = 0;
            sails.config.mqttServer.publish(topic, qos, JSON.stringify(command), (err) => {
                let message = `${command} published to scooter: ${topic}`;
                iotRequest.response = { message };
                if (err) {
                    iotRequest.response.message = `Can't publish ${command} to scooter: ${topic}`;
                    console.error(iotRequest.response.message);
                    resolve(false);
                }
                console.log(iotRequest.response.message);
                resolve(true);
            });
        });

        if (!res && iotRequest.requestTry <= sails.config.MAX_IOT_REQUEST_LIMIT) {
            await this.publishToScooter(topic, command, commandName, iotRequest.requestTry + 1);
        }
        // console.log('----------------- Publish To Scooter Log End-----------------');

        return res;
    }
};
