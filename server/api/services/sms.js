'use strict';
const _ = require('lodash');
const request = require('request');
const TwilioHandler = require('./SMS/Twilio/twilioHandler');
const AwsSNSHandler = require('./SMS/AWS_SNS/awsSNSHandler');

//------------------------------------not use now
module.exports = {

    /**
     * @description: send SMS
     * @param options "{
     *                      "message":<string>,
     *                      "to":<string> // comma separated number(s)
     *                 }"
     * @param callback
     */

    // send: async (obj) => {
    async send(obj) {
        let data;
        console.log('SMS---', obj);
        if (!obj.mobiles || !obj.mobiles.length) {
            return;
        }
        try {
            if (obj.to) {
                obj.mobiles = obj.to;
            }
            // let mobiles;
            let mobiles = [];
            if (!_.isArray(obj.mobiles)) {
                // obj.mobiles = _.map(obj.mobiles, (m) => {
                //     // let tmpNo = m.split('+');
                //     // return tmpNo[1] ? tmpNo[1] : tmpNo[0];
                //     mobiles.push(sails.config.COUNTRY_CODE + " " + m)
                //     return mobiles;
                // });
                // mobiles = obj.mobiles.join(',');
                mobiles.push(obj.mobiles);
            }
            let DEFAULT_SMS_METHOD = sails.config.DEFAULT_SMS_METHOD;
            switch (DEFAULT_SMS_METHOD) {
                case sails.config.SMS_GATEWAYS.DEFAULT:
                    data = await this.defaultSMSService(mobiles, obj);
                    break;
                case sails.config.SMS_GATEWAYS.TWILIO:
                    data = await this.twilioSMSService(mobiles, obj);
                    break;
                case sails.config.SMS_GATEWAYS.AWS_SNS:
                    data = await this.awsSNSSMSService(mobiles, obj);
                    break;
                case sails.config.SMS_GATEWAYS.OOREDOO:
                    data = await this.ooredooSMSService(mobiles, obj);
                    break;

                default:
                    data = await this.defaultSMSService(mobiles, obj)
                    break;
            }

            return data;

        } catch (e) {
            throw e;
        }

    },

    async defaultSMSService(mobiles, obj) {
        if (!sails.config.SMS_LOGIN_ID || !sails.config.SMS_PASSWORD) {
            console.log('----------SMS Login ID/Pass Empty----------');

            return;
        }
        console.log(mobiles, obj.message);
        new Promise((resolve, reject) => {
            request.get({
                url: sails.config.SMS_URL,
                qs: {
                    username: sails.config.SMS_LOGIN_ID,
                    password: sails.config.SMS_PASSWORD,
                    mobile: mobiles,
                    unicode: sails.config.SMS_UNICODE,
                    message: obj.message,
                    sender: sails.config.SMS_SENDER_NAME
                }
            },
                function (error, response, body) {
                    // var trackObj = {
                    //     type: sails.config.MAIL_ESN_SERVICE_SMS,
                    //     mobile: mobiles,
                    //     response: error ? {error: error} : {success: body},
                    //     request: obj,
                    //     payload: {'message': obj.smsText},
                    // };
                    // _.extend(trackObj, obj);
                    //
                    // MailService
                    //     .emailSmsTrack(trackObj, function () {
                    //
                    //     });
                    if (error) {
                        console.log('SMS err:', error);
                        reject(error);
                    }
                    else {
                        console.log('SMS body:', body);
                        resolve(body);
                    }
                });
        });
        return true;
    },

    async twilioSMSService(mobiles, obj) {
        console.log(mobiles, obj);
        const client = await TwilioHandler.getTwilioObject();
        await client.messages
            .create({
                body: obj.message,
                from: sails.config.TWILIO_FROM_NUMBER,
                to: mobiles
            })
            .then(message => {
                if (!message.sid) {
                    return false
                }
                console.log('----------------------SMS successfully send----------------------');
                console.log(message);

                return true;
            });
    },

    async awsSNSSMSService(mobiles, obj) {
        const pinpoint = await AwsSNSHandler.getAwsSNSObject();
        for (let mobile of mobiles) {
            const params = {
                ApplicationId: sails.config.AWS_SNS_APP_ID,
                MessageRequest: {
                    Addresses: {
                        [mobile]: {
                            ChannelType: 'SMS'
                        }
                    },
                    MessageConfiguration: {
                        SMSMessage: {
                            Body: obj.message,
                            MessageType: 'TRANSACTIONAL',
                            SenderId: sails.config.SMS_SENDER_NAME
                        }
                    }
                }
            };
            pinpoint.sendMessages(params, function (err, data) {
                // If something goes wrong, print an error message.
                if (err) {
                    console.log('SMS err message: ', err.message);
                    // Otherwise, show the unique ID for the message.
                } else {
                    console.log("Message sent! "
                        + data['MessageResponse']['Result'][mobile]['StatusMessage']);
                }
            });
        }
    },

    async ooredooSMSService(mobiles, obj) {
        // if (!sails.config.SMS_LOGIN_ID || !sails.config.SMS_PASSWORD) {
        // console.log('----------SMS Login ID/Pass Empty----------');
        //     return;
        // }
        console.log('mobiles', mobiles[0]);
        console.log('mobiles', mobiles[0]);

        let mobile = mobiles.join(", ");
        console.log('obj.message', obj.message);

        new Promise((resolve, reject) => {
            request.get({
                url: `${sails.config.OOREDOO_URL}/bms/soap/Messenger.asmx/HTTP_SendSms`,
                qs: {
                    customerID: sails.config.OOREDOO_CUSTOMER_ID,
                    userName: sails.config.OOREDOO_USERNAME,
                    userPassword: sails.config.OOREDOO_USERPASSWORD,
                    originator: sails.config.OOREDOO_ORIGINATOR,
                    smsText: obj.message,
                    recipientPhone: mobile,
                    messageType: sails.config.OOREDOO_MESSAGE_TYPE,
                    defDate: '',
                    blink: 'false',
                    flash: 'false',
                    Private: 'false'
                }
            },
                function (error, response, body) {
                    // var trackObj = {
                    //     type: sails.config.MAIL_ESN_SERVICE_SMS,
                    //     mobile: mobiles,
                    //     response: error ? {error: error} : {success: body},
                    //     request: obj,
                    //     payload: {'message': obj.smsText},
                    // };
                    // _.extend(trackObj, obj);
                    //
                    // MailService
                    //     .emailSmsTrack(trackObj, function () {
                    //
                    //     });
                    if (error) {
                        console.log('SMS err:', error);
                        reject(error);
                    }
                    else {
                        console.log('SMS body:', body);
                        resolve(body);
                    }
                });
        });
        return true;
    },

};
