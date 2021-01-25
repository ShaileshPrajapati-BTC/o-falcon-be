const NineBotIotService = require('../../services/IOT/NINEBOT/Scooter/HTTP/iot');
const NineBotCallbackHandler = require('../../services/IOT/NINEBOT/Scooter/HTTP/callback');

module.exports = {
    async getScooterAlert(req, res) {
        let params = req.allParams();
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('********************NineBot Scooter Alert Callback************************\n');
            console.log(`IMEI => ${params.iotCode}, Signature => ${params.signature}`);
            console.log(params);
        }
        let isSignatureVerified = await NineBotIotService.validateSignature(params);
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('isSignatureVerified', isSignatureVerified);
            console.log('\n**************************************************************************');
        }
        await IOTCommandCallbackTrack.create({
            imei: params.iotCode,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(params),
            decodedCallback: params
        });
        if (isSignatureVerified) {
            params.imei = params.iotCode;

            await NineBotCallbackHandler.scooterAlertCallback(params);

            return res.status(200).json(sails.config.BL10.callbackResponse);
        }

        return res.serverError(sails.config.message.UNAUTHORIZED);
    },

    async getScooterFault(req, res) {
        let params = req.allParams();
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('********************NineBot Scooter Fault Callback************************\n');
            console.log(`IMEI => ${params.iotCode}, Signature => ${params.signature}`);
            console.log(params);
        }
        let isSignatureVerified = await NineBotIotService.validateSignature(params);
        await IOTCommandCallbackTrack.create({
            imei: params.iotCode,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(params),
            decodedCallback: params
        });
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('isSignatureVerified', isSignatureVerified);
            console.log('\n**************************************************************************');
        }
        if (isSignatureVerified) {
            params.faultCode = params.code;
            params.imei = params.iotCode;
            await NineBotCallbackHandler.scooterFaultCallback(params);

            return res.status(200).json(sails.config.BL10.callbackResponse);
        }

        return res.serverError(sails.config.message.UNAUTHORIZED);
    },

    async getScooterStatus(req, res) {
        let params = req.allParams();
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('********************NineBot Scooter Status Callback***********************\n');
            console.log(`IMEI => ${params.iotCode}, Signature => ${params.signature}`);
            console.log(params);
        }
        let isSignatureVerified = await NineBotIotService.validateSignature(params);
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('isSignatureVerified', isSignatureVerified);
            console.log('\n**************************************************************************');
        }
        await IOTCommandCallbackTrack.create({
            imei: params.iotCode,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(params),
            decodedCallback: params
        });
        if (isSignatureVerified) {
            params.imei = params.iotCode;
            await NineBotCallbackHandler.scooterHeartBeatCallback(params);

            return res.status(200).json(sails.config.BL10.callbackResponse);
        }

        return res.serverError(sails.config.message.UNAUTHORIZED);
    },

    async getScooterUpgradeCallback(req, res) {
        let params = req.allParams();
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('********************NineBot Scooter Upgrade Callback**********************\n');
            console.log(`IMEI => ${params.iotCode}, Signature => ${params.signature}`);
            console.log(params);
        }
        let isSignatureVerified = await NineBotIotService.validateSignature(params);
        if (sails.config.GET_SCOOTER_CALLBACK_LOGS && (!sails.config.GET_LOGS_FOR_IMEI || sails.config.GET_LOGS_FOR_IMEI == params.iotCode)) {
            console.log('isSignatureVerified', isSignatureVerified);
            console.log('\n**************************************************************************');
        }
        await IOTCommandCallbackTrack.create({
            imei: params.iotCode,
            logType: sails.config.IOT_LOG_TYPE.CALLBACK,
            actualCallback: JSON.stringify(params),
            decodedCallback: params
        });
        if (isSignatureVerified) {

            return res.status(200).json(sails.config.BL10.callbackResponse);
        }

        return res.serverError(sails.config.message.UNAUTHORIZED);
    }
};