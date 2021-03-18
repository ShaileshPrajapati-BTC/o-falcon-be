/* eslint-disable camelcase */
const moment = require("moment");
const request = require('request');
const ProjectSetupConfigService = require('../../projectSetupConfig');
const UtilService = require('../../util');

const Mpgs_Config = {
  BASEURL: "https://test-dohabank.mtf.gateway.mastercard.com",
  API_VERSION: 57,
  USERNAME: 'merchant.' + "TESTDB74147",
  PASSWORD: "29814cc2d50733a5d7ec35aadfb17f6d" ,
  MERCHANTID: "TESTDB74147"
};

module.exports = {

  // Generate random 3DSecure id
  async keyGen(keyLength) {
    var i, key = "", characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (i = 0; i < keyLength; i++) {
        key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
    }
    console.log("========",key)
    return key;
  },
    //Get MPGS payment token.
    async getToken() {
        return 'Basic ' + new Buffer.from(Mpgs_Config.USERNAME + ":" + Mpgs_Config.PASSWORD, 'utf-8').toString("base64");
    },

    async getBaseUrl(config) {
      return config.BASEURL;
    },

    async getMerchantUrl(config) {
      return await this.getBaseUrl(config) + "/api/rest/version/" + config.API_VERSION + "/merchant/" + config.MERCHANTID;
    },
  
    //Get noqoody payment project code.
    async getProjectCode() {
        return sails.config.NOQOODYPAY_PROJECT_CODE;
    },

    async getHtmlContent (amount, secureId, sessionId) {
        var dsSecureID = await this.keyGen(10)
        // var dsSecureID = "VJgCsdKxA"
        console.log("dsSecureID",dsSecureID)
        var url = await this.getMerchantUrl(Mpgs_Config) + "/3DSecureId/" + dsSecureID;
        var requestData = {
            "apiOperation": "CHECK_3DS_ENROLLMENT",
            "order": {
                "amount": amount,
                "currency": "QAR"
            },
            "session": {
                "id": sessionId
            },
            "3DSecure": {
                "authenticationRedirect": {
                    "responseUrl": `https://7eae7c6be141.ngrok.io/mastercard/payment-callback?sessionId=${sessionId}&secureId=${dsSecureID}`,
                    "pageGenerationMode": "SIMPLE"
                }
            }
        };
        let token = await this.getToken();
        let response = await new Promise((resolve, reject) => {
                const options = {
                    url: url,
                    json: requestData,
                    headers: {
                    Authorization: token
                },
                    timeout: 10000
                };
                console.log("options", options)
                request.put(options, (error, response1, body) => {
                console.log("body", body)
                console.log("error", error)
                // console.log("response",response1)
                resolve(body);
                });
            });
            // console.log(response);
        return response
    },

    //Function for request payment link and return payment link.
    async getPaymentLink(ride, paymentDetail, transactionId) {
        const user = await User.findOne({ id: ride.userId });
        user.email = UtilService.getPrimaryEmail(user.emails);
        user.mobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
        if (!user.email) {
            user.email = sails.config.NOQOODY_DEFAULT_EMAIL;
        }
        if (!user.mobile) {
            user.mobile = sails.config.NOQOODY_DEFAULT_MOBILE;
        }
        console.log("========in Payment Link",{ride, paymentDetail, transactionId})
        let data = {};
        try {
            // API call to get the hmltcontent for payment gatway
            const paymentLink = await this.getHtmlContent(
                ride.totalFare,
                transactionId,
                paymentDetail.sessionId,
            );
            console.log("paymentLink",paymentLink)
            await TransactionLog.update({
                id: transactionId
            }, { noqoodyReferenceId: transactionId }).fetch();
            data.paymentLink = paymentLink && paymentLink['3DSecure'] && paymentLink['3DSecure'].authenticationRedirect.simple.htmlBodyContent;
            data.noqoodyReferenceId = transactionId;
        } catch (e) {
            console.log('Payment error ******************', e);
            data.transactionSuccess = false;
            data.failedTransactionId = '';
            data.status = 'failed';
            data.errorData = e.message;
            if (!data.errorMessage || data.errorMessage == '') {
                data.errorMessage = 'Transaction was declined by payment gateway due to unknown reason';
            }
        }
        return data;
    },
    //Function for add transaction log.
    async chargeCustomer(ride, amount) {
      console.log('chargeCustomer', ride.id);
      const user = await User.findOne({ id: ride.userId });
      user.email = UtilService.getPrimaryEmail(user.emails);
      user.mobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
      let data = {
          paymentType: 'MPGS',
          rideId: ride.id,
          rideCost: ride.totalFare,
          userId: user.id,
          userCards: user.cards,
          vehicleType: ride.vehicleType,
          rideNumber: ride.rideNumber,
          isRideDepositTransaction: ride.deductMinFare,
          rideType: ride.rideType
      };
      try {

          let chargeObj = {
              status: 'pending'
          };
          data.transactionAmount = ride.totalFare;
          data.transactionSuccess = true;
          data.chargeObj = chargeObj;
          data.expiryDate = moment().add(30, 'minutes').toISOString();
          let statusTrack = [{
              status: sails.config.STRIPE.STATUS.pending,
              remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_PENDING,
              datetime: moment().toISOString()
          }];
          data.statusTrack = statusTrack;
          // return response; 
      } catch (e) {
          console.log('Payment error ******************', e);
          data.transactionSuccess = false;
          data.failedTransactionId = '';
          data.status = 'failed';
          data.errorData = sails.config.PAYMENT_ERRORS.NOQOODY.transaction_fail;
          if (!data.errorMessage || data.errorMessage == '') {
              data.errorMessage = 'Transaction was declined by payment gateway due to unknown reason';
          }
      }
      return data;
  },
  async process3ds (req){
    var pares = req.PaRes;
    // var scid = await this.keyGen(10);
    var ssid = req.sessionId;
    var scid = req.secureId;
    console.log("req.body", req)
    var url = await this.getMerchantUrl(Mpgs_Config) + "/3DSecureId/" + scid;
    var requestData = {
        "apiOperation": "PROCESS_ACS_RESULT",
        "3DSecure": {
            "paRes": pares
        }
    }
    let token = await this.getToken();
    var options = {
        url: url,
        json: requestData,
        headers: {
            Authorization: token
        }
        
    };
    let responseResult = await new Promise((resolve, reject) => {
        request.post(options, async (error, response, Resultbody) => {
            console.log("PROCESS_ACS_RESULT", Resultbody)
            // return callback(error, body);
            if (!error) {
                var payload = {
                    "apiOperation": "PAY",
                    "3DSecureId": scid,
                    "order": {
                        "amount": 50,
                        "currency": "QAR"
                    },
                    "session": {
                        "id": ssid
                    },
                    "sourceOfFunds": {
                        "type": "CARD"
                    },
                    "transaction":{
                        "source": "INTERNET"
                    }
                }
                // resolve(body)
                var transactionId = await this.keyGen(10);
                var orderId = await this.keyGen(10);
                var requestUrl = await this.getMerchantUrl(Mpgs_Config) + "/order/" + orderId + "/transaction/" + transactionId;
                var options = {
                    url: requestUrl,
                    method: "PUT",
                    json: payload,
                    headers: {
                        Authorization: token
                    }
                }
                request(options, function (error, response, body) {
                    console.log({body})
                    if (error) {
                        resolve({error: true})
                        return {
                            error: true,
                            message: error,
                            url: requestUrl
                        };
                    } else {
                        resolve(Resultbody)
                        return{
                            error: false,
                            message: body,
                            url: requestUrl
                        };
                    }
                });
            }
        });
    })

    return responseResult;
  }
}
