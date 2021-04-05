// const UtilService = require(`${sails.config.appPath}/api/services/util`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const WalletService = require(`${sails.config.appPath}/api/services/wallet`);
const UserService = require(`${sails.config.appPath}/api/services/user`);
const NOQOODYPaymentService = require(`${sails.config.appPath}/api/services/Payment/Noqoody/payment`);

module.exports = {
    addBalance: async (req, res) => {
        try {
            const fields = [
                'amount'
            ];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const loggedInUser = req.user;
            // quickFix
            // if (sails.config.PAYMENT_DISABLED && (!loggedInUser.cards || _.size(loggedInUser.cards) === 0)) {
            //     throw sails.config.message.CARD_NOT_ADDED;
            // todo:fix
            // if (sails.config.PAYMENT_DISABLED) {
            //     throw sails.config.message.PAYMENT_DISABLED;
            // }

            // Check older wallet is pending
            if (sails.config.DEFAULT_PAYMENT_METHOD !== sails.config.PAYMENT_GATEWAYS.NOQOODY) {
                let pendingWalletPayment = await TransactionLog.findOne({
                    transactionBy: loggedInUser.id,
                    status: sails.config.STRIPE.STATUS.pending
                });
                if (pendingWalletPayment && pendingWalletPayment.id) {
                    return res.ok({}, sails.config.message.PENDING_OLDER_WALLET);
                }
            }
            await WalletService.validateAddWalletAmount(params.amount);

            let chargeObj = await PaymentService.addBalanceInUserWallet(
                loggedInUser.id,
                params.amount
            );

            let bonusAmount = 0;
            let walletTopUps = sails.config.WALLET_TOP_UPS;
            if (walletTopUps && walletTopUps.length > 0) {
                let walletObj = _.find(walletTopUps, obj => parseFloat(obj.amount) === parseFloat(params.amount));
                bonusAmount = walletObj && walletObj.bonusAmount || 0;
            }
            if (chargeObj.flag) {
                if (sails.config.DEFAULT_PAYMENT_METHOD !== sails.config.PAYMENT_GATEWAYS.NOQOODY) {
                    await UserService.makeUserNonGuestUser(loggedInUser);
                }
                chargeObj.data = await WalletService.addBonusAmountInTransactionObj(chargeObj.data, bonusAmount);
                const latestUserObj = await UserService.getLatestUserObj(loggedInUser.id);
                let response = {
                    paymentData: chargeObj.data,
                    walletAmount: latestUserObj.walletAmount,
                    isGuestUser: latestUserObj.isGuestUser
                };

                if (chargeObj.config) {
                    response.config = chargeObj.config

                    let mobileObj = loggedInUser.mobiles.filter(obj => {
                        return obj.isPrimary === true;
                    })
                    console.log("mobile obj", mobileObj)
                    response.config.userMobile = mobileObj[0].mobile;
                }
                let resMsg;
                let cashbackMessage = ` Cashback of ${bonusAmount} will be credited to your wallet.`;
                if (chargeObj.data.status === sails.config.STRIPE.STATUS.pending) {
                    resMsg = sails.config.message.WALLET_CREDIT_REQUEST_REFERENCE_ID;
                } else {
                    await PaymentService.addBonusForWalletTransaction(chargeObj.data);
                }
                if (bonusAmount > 0) {
                    resMsg = JSON.parse(JSON.stringify(sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_SUCCESS));
                    resMsg.message += cashbackMessage;
                } else {
                    resMsg = JSON.parse(JSON.stringify(sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_SUCCESS));
                }

                return res.ok(response, resMsg);
            }
            let message = sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_FAILED;
            if (chargeObj.data.errorData.errorMessage && chargeObj.data.errorData.errorMessage != '') {
                message = {
                    ...message,
                    message: chargeObj.data.errorMessage
                }
            }

            return res.ok(chargeObj.data, message);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    transactionList: async (req, res) => {
        try {
            const loggedInUser = req.user;
            let params = req.allParams();
            if (!params) {
                params = {}
            }
            let filter = await common.getDateFilterForDevice(params);
            filter.where.isWalletTransaction = true;
            filter.where.transactionBy = loggedInUser.id;
            // filter.sort = 'createdAt DESC';
            let recordsList = await TransactionLog.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            let response = { list: recordsList };
            let countFilter = await common.removePagination(filter);
            response.count = await TransactionLog.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    }
};
