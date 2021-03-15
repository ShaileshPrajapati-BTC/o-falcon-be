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
    return key;
  },
    //Get MPGS payment token.
    async getToken() {
        return 'Basic ' + new Buffer(Mpgs_Config.USERNAME + ":" + Mpgs_Config.PASSWORD).toString("base64");
    },

    async getBaseUrl(config) {
      return config.BASEURL;
    },

    async getMerchantUrl(config) {
      return this.getBaseUrl(config) + "/api/rest/version/" + config.API_VERSION + "/merchant/" + config.MERCHANTID;
    },
  
    //Get noqoody payment project code.
    async getProjectCode() {
        return sails.config.NOQOODYPAY_PROJECT_CODE;
    },

    async getHtmlContent (amount, secureId, sessionId) {
      var url = this.getMerchantUrl(Mpgs_Config) + "/3DSecureId/" + secureId;
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
                "responseUrl": "/noqoody/payment-callback",
                "pageGenerationMode": "SIMPLE"
            }
        }
      };
      let response = await new Promise((resolve, reject) => {
        const options = {
            url: url,
            json: requestData,
            headers: {
              Authorization: this.getToken()
          },
            timeout: 10000
        };
        request(options, (error, response, body) => {
          resolve(body);
        });
        return response
    });
    },

    //Function for request payment link and return payment link.
    async getPaymentLink(ride, amount, transactionId) {
        const user = await User.findOne({ id: ride.userId });
        user.email = UtilService.getPrimaryEmail(user.emails);
        user.mobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
        if (!user.email) {
            user.email = sails.config.NOQOODY_DEFAULT_EMAIL;
        }
        if (!user.mobile) {
            user.mobile = sails.config.NOQOODY_DEFAULT_MOBILE;
        }

        let data = {};
        try {
            // API call to get the hmltcontent for payment gatway
            const paymentLink = await this.getHtmlContent(
                ride.totalFare,
                this.keyGen(10),
                transactionId
            );
           
            await TransactionLog.update({
                id: transactionId
            }, { noqoodyReferenceId: transactionId }).fetch();
            data.paymentLink = paymentLink;
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
}
