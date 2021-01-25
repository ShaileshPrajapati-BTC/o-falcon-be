const OmniCallbackService = require(`${sails.config.appPath}/api/services/IOT/OMNI/Scooter/HTTP/iot`);

module.exports = {
    callbackReceived: async function (req, res) {
        try {
            let data = req.body;
            let noLogsForCommand = ['heart', 'location'];
            if (noLogsForCommand.indexOf(data.type) === -1) {
                console.log('callbackReceived', data.type);
            }
            // console.log(data);
            // console.log('callbackReceived');
            let modelName = 'iotcallbackinfotrack';
            if (data && data.type) {
                switch (data.type) {
                    case 'lock':
                    case 'unlock':
                        modelName = 'iotcallbacklockunlocktrack';
                        break;
                    case 'location':
                        modelName = 'iotcallbacklocationtrack';
                        break;
                }
                await sails.models[modelName].create({ data: data });
                let fnName = _.camelCase(data.type);
                if (typeof OmniCallbackService[fnName] === 'function') {
                    await OmniCallbackService[fnName](data);
                } else {
                    console.log(`callback received with type => ${data.type}, fnName => ${fnName}`);
                }
            }
            let response = { data: data };

            return res.ok(response);
        } catch (err) {
            console.log('IoT callback err: ', err);

            return res.serverError(null, err);
        }
    }
};
