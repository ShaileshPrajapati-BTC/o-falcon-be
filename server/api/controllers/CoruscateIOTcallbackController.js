const CoruscateCallbackService = require(`${sails.config.appPath}/api/services/IOT/CORUSCATE/HTTP/callback`);

module.exports = {
    callbackReceived: async function (req, res) {
        // console.log('in call back', new Date());
        // console.log('cb contrlr-=>', req.data);
        try {
            let data = req.body;
            if (data.type !== 'location') {
                // console.log('callbackReceived', data.type);
            }
            // console.log(data);
            // console.log('callbackReceived');
            // console.log('ciotcallback controller=->');
            // console.log(data);
            let modelName = 'iotcallbackinfotrack';
            if (data && data.type) {
            
                // console.log('data.type==>>', data.type);
                switch (data.type) {
                    case 'lock':
                    case 'start':
                    case 'stop' :
                    case 'unlock':
                        modelName = 'iotcallbacklockunlocktrack';
                        break;
                    case 'track':
                    case 'location':
                        // console.log('track in -=>>',data);
                        modelName = 'iotcallbacklocationtrack';
                        break;
                }
                await sails.models[modelName].create({ data: data });
                let fnName = _.camelCase(data.type);
                // console.log('fnName-=>',fnName);
                await CoruscateCallbackService[fnName](data);
            }
            let response = { data: data };

            return res.ok(response);
        } catch (err) {
            // console.log('coruscate-IoT callback err: ', err);

            return res.serverError(null, err);
        }
    }
};