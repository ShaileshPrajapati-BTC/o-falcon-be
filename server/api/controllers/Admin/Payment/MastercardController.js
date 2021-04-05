const MPGSPaymentService = require(`${sails.config.appPath}/api/services/Payment/Mastercard/payment`);

module.exports = {
    checkPaymentStatusAndCredit: async (req, res) => {
        let params = req.allParams();
        try {
            console.log('-------------------Callback url params-------------');
            console.log(params);
            let mastercardOrderId = params.noqoodyReferenceId;
            console.log("mastercardOrderId",mastercardOrderId)
            params.isAdmin = true;
            // await NoQoodyLog.create(params);
            let isAddedToWallet = false;
            let error;
            try {
                // isAddedToWallet = await PaymentService.validatePayment(noqoodyReferenceId, 1, true);
                const result = await MPGSPaymentService.checkPaymentStatus(mastercardOrderId)
                isAddedToWallet = await MPGSPaymentService.validatePayment(mastercardOrderId, result)
            } catch (err) {
                console.log(err);
                error = err;
            }
            console.log('isAddedToWallet------------------', isAddedToWallet);
            if (isAddedToWallet) {
                return res.ok(isAddedToWallet, sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_SUCCESS);
            }
            if (error) {
                throw error;
            }
            throw sails.config.message.PAYMENT_REQUEST_FAILED;
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },
}
