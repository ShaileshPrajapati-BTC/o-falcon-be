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
        //var dsSecureID = await this.keyGen(10)
        var dsSecureID = secureId
        // var dsSecureID = "VJgCsdKxA"
        console.log("dsSecureID",dsSecureID)
        var url = await this.getMerchantUrl(Mpgs_Config) + "/3DSecureId/" + dsSecureID;
        var requestData = {
            apiOperation: "CHECK_3DS_ENROLLMENT",
            order: {
                amount: amount,
                currency: "QAR",
            },
            session: {
                id: sessionId,
            },
            "3DSecure": {
                authenticationRedirect: {
                    responseUrl: `http://lb.staging.falconride.io/mastercard/payment-callback?sessionId=${sessionId}&secureId=${dsSecureID}`,
                    pageGenerationMode: "SIMPLE",
                },
            },
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
  async process3ds (req) {
    var pares = req.PaRes;
    // var scid = await this.keyGen(10);
    var ssid = req.sessionId;
    var scid = req.secureId;
    const orderId = req.secureId;
    console.log("req.body", req)
    var url = await this.getMerchantUrl(Mpgs_Config) + "/3DSecureId/" + orderId;
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

    const transaction = await TransactionLog.findOne({
        id: orderId
    });

    let responseResult = await new Promise((resolve, reject) => {
        request.post(options, async (error, response, Resultbody) => {
            console.log("PROCESS_ACS_RESULT", Resultbody)
            // return callback(error, body);
            const gatewayRecommendation = Resultbody.response && Resultbody.response.gatewayRecommendation
                ? Resultbody.response && Resultbody.response.gatewayRecommendation
                : '';
            console.log("gatewayRecommendation", gatewayRecommendation)

            if (!error && gatewayRecommendation === 'PROCEED') {
                var payload = {
                    apiOperation: "AUTHORIZE",
                    "3DSecureId": scid,
                    order: {
                        amount: transaction.amount,
                        currency: "QAR",
                    },
                    session: {
                        id: ssid,
                    },
                    sourceOfFunds: {
                        type: "CARD",
                    },
                    transaction: {
                        source: "INTERNET",
                    },
                };
                // resolve(body)
                var transactionId = await this.keyGen(10);
                //var orderId = await this.keyGen(10);
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

                        resolve({
                            orderId,
                            success: false,
                            error: true,
                            message: error,
                            url: requestUrl
                        });
                    } else if(body && body.result !== 'SUCCESS') {
                        const response = body.response;
                        resolve({
                            orderId,
                            success: false,
                            error: true,
                            message: response && response.acquirerMessage
                                ? response.acquirerMessage
                                : response && response.gatewayCode
                                    ? response.gatewayCode
                                    : body.result,
                            url: requestUrl
                        });
                    } else {
                        let orderId = body.order && body.order.id
                        resolve({...Resultbody, orderId, success: true})
                        return{
                            error: false,
                            message: body,
                            url: requestUrl
                        };
                    }
                });
            } else {
                resolve({
                    orderId,
                    success: false,
                    error: true,
                    message: gatewayRecommendation,
                    url: requestUrl
                });
            }
        });
    })

    return responseResult;
  },
    async validatePayment(orderId, response) {
        if (!orderId) {
            throw sails.config.message.REFERENCE_ID_NOT_FOUND;
        }
        let transaction = await TransactionLog.findOne({
            noqoodyReferenceId: orderId
        });

        if (!transaction || !transaction.id) {
            throw sails.config.message.TRANSACTION_NOT_FOUND;
        }
        if (transaction && transaction.status === sails.config.STRIPE.STATUS.paid) {
            throw sails.config.message.PAYMENT_ALREADY_SUCCESS;
        }
        //Check transaction is success.
        if (response.success) {
            transaction.statusTrack.push({
                status: sails.config.STRIPE.STATUS.paid,
                remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_DONE,
                datetime: moment().toISOString(),
                isByAdmin: false
            });

            //If success then update transaction status paid and add transaction id
            let updateTransaction = {
                status: sails.config.STRIPE.STATUS.paid,
                remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_DONE,
                paymentTransactionId: response.TransactionID,
                statusTrack: transaction.statusTrack
            };
            let updatedTransaction = await TransactionLog.update({
                id: transaction.id,
            }).set(updateTransaction).fetch();
            if (!updatedTransaction || !updatedTransaction.length) {
                return sails.config.message.PAYMENT_REQUEST_FAILED;
            }
            const user = await User.findOne({id: transaction.transactionBy});

            //Add amount to user wallet.
            let newAmount = user.walletAmount + transaction.amount;
            newAmount = UtilService.getFloat(newAmount);
            let updateUserWallet = await User.update(
                {id: user.id},
                {walletAmount: newAmount}
            ).fetch();
            await payment.addBonusForWalletTransaction(transaction);

            if (updateUserWallet || updateUserWallet.length > 0) {
                return true;
            }
        }

        if (!response.success) {
            let remark = sails.config.message.PAYTM_TRANSACTION_PENDING.message;
            if (response.message) remark = remark + '\n' + response.message;

            transaction.statusTrack.push({
                status: sails.config.STRIPE.STATUS.failed,
                datetime: moment().toISOString(),
                isByAdmin: false,
                remark
            });
            let updatedTransaction = await TransactionLog.update({
                id: transaction.id
            })
                .set({
                    status: sails.config.STRIPE.STATUS.failed,
                    statusTrack: transaction.statusTrack,
                    remark,
                })
                .fetch()
            if (!updatedTransaction || !updatedTransaction.length) {
                return sails.config.message.PAYMENT_REQUEST_FAILED;
            }
            throw sails.config.message.PAYTM_TRANSACTION_PENDING;
        }

        transaction.statusTrack.push({
            status: sails.config.STRIPE.STATUS.failed,
            remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_FAILED,
            datetime: moment().toISOString(),
            isByAdmin: false
        });
        //If transaction fail then update transaction log status fail and remark.
        let updateTransaction = {
            status: sails.config.STRIPE.STATUS.failed,
            remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_FAILED,
            statusTrack: transaction.statusTrack
        };
        if (orderId) {
            updateTransaction.paymentTransactionId = orderId;
        }
        let updatedTransaction = await TransactionLog.update({
            id: transaction.id,
        }).set(updateTransaction).fetch();

        return false
    },
    async checkPaymentStatus(orderId) {
        const merchantURL = await this.getMerchantUrl(Mpgs_Config)
        const requestUrl = merchantURL + '/order/' + orderId;
        let token = await this.getToken();

        let options = {
            url: requestUrl,
            headers: {
                Authorization: token
            }
        };

        return new Promise(function (resolve) {
            request.get(options, function (error, response, body) {
                if(typeof body === 'string') body = JSON.parse(body)
                console.log('response:', body);
                if(error){
                    console.error(error);
                    resolve({
                        orderId,
                        success: false,
                        error: true,
                        message: error.message || 'Transaction is failed',
                        url: requestUrl
                    });
                    return;
                }

                const transaction = body && body.transaction && body.transaction.pop()
                if(transaction && transaction.result === 'SUCCESS') {
                    resolve({
                        orderId,
                        success: true,
                        ...transaction
                    })
                } else if(transaction && transaction.result === 'FAILURE') {
                    const gatewayResponse = transaction.response || {};
                    resolve({
                        orderId,
                        success: false,
                        error: true,
                        message: gatewayResponse.acquirerMessage
                            ? gatewayResponse.acquirerMessage
                            : 'Transaction is failed',
                        url: requestUrl
                    })
                } else {
                    const message = body && body.error && body.error.explanation ? body.error.explanation : 'Transaction is failed';
                    resolve({
                        orderId,
                        success: false,
                        error: true,
                        url: requestUrl,
                        message
                    })
                }
            });
        })
    }
}
