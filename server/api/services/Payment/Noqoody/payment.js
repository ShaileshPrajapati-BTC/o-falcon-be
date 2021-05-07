/* eslint-disable camelcase */
const moment = require("moment");
const request = require('request');
const ProjectSetupConfigService = require('../../projectSetupConfig');
const UtilService = require('../../util');
const UserService  =  require("../../user");

module.exports = {
    //Get noqoody payment token.
    async getToken() {
        return `bearer ${sails.config.NOQOODYPAY_PAYMENT_TOKEN}`;
    },

    //Get noqoody payment project code.
    async getProjectCode() {
        return sails.config.NOQOODYPAY_PROJECT_CODE;
    },

    //Function for add transaction log.
    async chargeCustomer(ride, amount) {
        console.log('chargeCustomer', ride.id);
        const user = await User.findOne({ id: ride.userId });
        user.email = UtilService.getPrimaryEmail(user.emails);
        user.mobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
        let data = {
            paymentType: 'NOQOODY',
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
            const paymentLink = await this.sendRequest(
                user,
                ride.totalFare,
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

    //Function for get payment links
    async sendRequest(user, amount, referenceId, currentTry = 1) {
        if (!user || !referenceId || !amount) {
            return sails.config.message.PAYMENT_REQUEST_FAILED;
        }
        let projectCode = await this.getProjectCode();
        console.log("projectCode----------------------", projectCode);
        let authToken = await this.getToken();
        console.log("authToken----------------------", authToken);
        let description = "Add balance into Falcon wallet";
        let url = `${sails.config.NOQOODYPAY_PAYMENT_URL}/api/Members/GetPaymentLinks/${projectCode}?reference=${referenceId}&description=${description}&amount=${amount}&CustomerEmail=${user.email}&CustomerMobile=${user.mobile}&CustomerName=${encodeURIComponent(user.name)}`;
        console.log("url---------------------------", url);
        const method = 'GET';
        let response = await new Promise((resolve, reject) => {
            const options = {
                method: method,
                headers: {
                    Authorization: authToken
                },
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            };
            request(url, options, (error, response, body) => {
                resolve(body);
            });
        });
        console.log("response---------------------", response);
        response = JSON.parse(response);
        console.log('-----------------Generate Payment link -----------------', response);
        if (!response) {
            console.log("*****************Fail to generate payment link*****************");
            throw sails.config.message.PAYMENT_REQUEST_FAILED;
        }
        if (response.code === '401') {
            if (currentTry <= sails.config.MAX_PAYMENT_REQUEST_LIMIT) {
                await this.generateNewToken();
                response = await this.sendRequest(user, amount, referenceId, currentTry + 1);
            }
        }
        let transaction = await TransactionLog.findOne({
            id: referenceId
        });
        if (!transaction || !transaction.id) {
            return sails.config.message.PAYMENT_REQUEST_FAILED;
        }
        if (!response || !response.success) {
            //If payment link fail then update transaction log status fail and remark.
            transaction.statusTrack.push({
                status: sails.config.STRIPE.STATUS.failed,
                remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_FAILED,
                datetime: moment().toISOString()
            })
            updateTransaction = {
                status: sails.config.STRIPE.STATUS.failed,
                remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_FAILED,
                paymentTransactionId: response.TransactionID,
                statusTrack: transaction.statusTrack
            };
            let updatedTransaction = await TransactionLog.update({
                id: referenceId,
            }).set(updateTransaction).fetch();
            console.log("*****************Fail to generate payment link*****************");
            throw sails.config.message.PAYMENT_REQUEST_FAILED;
        }
        if (response.errors.length) {
            console.log("*****************Fail to generate payment link*****************");
            throw { error: true, message: response.errors };
        }

        return response;
    },

    //Function for validating user payment and update user transaction.
    async validatePayment(noqoodyReferenceId, currentTry = 1, isByAdmin = false) {
        console.log('noqoodyReferenceId', noqoodyReferenceId);
        if (!noqoodyReferenceId) {
            throw sails.config.message.REFERENCE_ID_NOT_FOUND;
        }
            let transaction = await TransactionLog.findOne({
                noqoodyReferenceId: noqoodyReferenceId
            });
        if (!transaction || !transaction.id) {
            throw sails.config.message.TRANSACTION_NOT_FOUND;
        }
        if (transaction && transaction.status === sails.config.STRIPE.STATUS.paid) {
            throw sails.config.message.PAYMENT_ALREADY_SUCCESS;
        }
        //Validate transaction
        let url = `${sails.config.NOQOODYPAY_PAYMENT_URL}/api/Members/GetTransactionDetailStatusByClientReference/?ReferenceNo=${noqoodyReferenceId}`;
        let authToken = await this.getToken();
        const method = 'GET';
        let response = await new Promise((resolve, reject) => {
            const options = {
                url: url,
                method: method,
                headers: {
                    Authorization: authToken
                },
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            };
            request(options, (error, response, body) => {
                resolve(body);
            });
        });
        console.log('-----------------Validate Payment link -----------------');
        console.log(response);
        if (!response) {
            throw sails.config.message.PAYMENT_REQUEST_FAILED;
        }
        if (response.err) {
            throw { error: true, message: response.err };
        }
        response = JSON.parse(response);
        if (response.code === '401') {
            if (currentTry <= sails.config.MAX_PAYMENT_REQUEST_LIMIT) {
                await this.generateNewToken();
                response = await this.validatePayment(noqoodyReferenceId, currentTry + 1);
            }
        }
        //Check transaction is success.
        if (response.success) {
            transaction.statusTrack.push({
                status: sails.config.STRIPE.STATUS.paid,
                remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_DONE,
                datetime: moment().toISOString(),
                isByAdmin: isByAdmin
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
            const user = await User.findOne({ id: transaction.transactionBy });

            //Add amount to user wallet.
            let newAmount = user.walletAmount + transaction.amount;
            newAmount = UtilService.getFloat(newAmount);
            let updateUserWallet = await User.update(
                { id: user.id },
                { walletAmount: newAmount }
            ).fetch();

             // update wallet expiry date
            await UserService.updateWalletExpriedTime(sails.config.WALLET_EXPIRED_TIME,user.id);
            await payment.addBonusForWalletTransaction(transaction);

            if (updateUserWallet || updateUserWallet.length > 0) {
                return true;
            }
        }
        // For Payment Timeout 
        // if (response.TransactionStatus && response.TransactionStatus == "Failed" && response.Reference) {
        //     let updatedTransaction = await TransactionLog.update({
        //         id: transaction.id
        //         })
        //         .set({
        //             status: sails.config.STRIPE.STATUS.failed,
        //             remark: sails.config.message.PAYTM_TRANSACTION_TIMEOUT.message,
        //             statusTrack: transaction.statusTrack
        //         })
        //         .fetch()
        //     throw sails.config.message.PAYTM_TRANSACTION_TIMEOUT;
        // }
        // For cancel or app close use case
        if (!response.TransactionStatus || response.TransactionStatus == null) {
            
            let updatedTransaction = await TransactionLog.update({
                id: transaction.id
                })
                .set({
                    status: sails.config.STRIPE.STATUS.failed,
                    remark: sails.config.message.PAYTM_TRANSACTION_PENDING.message,
                    statusTrack: transaction.statusTrack
                })
                .fetch()
            throw sails.config.message.PAYTM_TRANSACTION_PENDING;
        }

        transaction.statusTrack.push({
            status: sails.config.STRIPE.STATUS.failed,
            remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_FAILED,
            datetime: moment().toISOString(),
            isByAdmin: isByAdmin
        });
        //If transaction fail then update transaction log status fail and remark.
        let updateTransaction = {
            status: sails.config.STRIPE.STATUS.failed,
            remark: sails.config.STRIPE.MESSAGE.CREDIT_WALLET_FAILED,
            statusTrack: transaction.statusTrack
        };
        if (response.TransactionID) {
            updateTransaction.paymentTransactionId = response.TransactionID;
        }
        let updatedTransaction = await TransactionLog.update({
            id: transaction.id,
        }).set(updateTransaction).fetch();

        return false;
    },

    async generateNewToken() {
        console.log("***************Request to generate Noqoody Token***************");
        let url = `${sails.config.NOQOODYPAY_PAYMENT_URL}/token`;
        const method = 'POST';
        let data = {
            username: sails.config.NOQOODYPAY_USERNAME,
            password: sails.config.NOQOODYPAY_PASSWORD,
            grant_type: sails.config.NOQOODYPAY_GRANT_TYPE
        }
        let response = await new Promise((resolve, reject) => {
            const options = {
                url: url,
                method: method,
                form: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            };
            request(options, (error, response, body) => {
                resolve(body);
            });
        });
        console.log('***************Noqoody generate token response***************');
        console.log(response);
        if (!response) {
            throw sails.config.message.PAYMENT_REQUEST_FAILED;
        }
        if (response.error) {
            throw { error: true, message: response.error };
        }
        response = JSON.parse(response);

        console.log(response);
        if (response || response.access_token) {
            await this.setAuthToken(response.access_token);
        }

        return response;
    },

    async setAuthToken(token) {
        let setupConfig = await SetupConfig.find({ limit: 1 })
            .select(['id']);
        setupConfig = setupConfig[0];
        let param = {
            noqoodypayPaymentToken: token
        };
        let updatedRecord = await ProjectSetupConfigService.updateConfig(
            param,
            'setupconfig',
            true
        );

        return updatedRecord.noqoodypayPaymentToken;
    },
}
