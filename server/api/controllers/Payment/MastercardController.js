const PaymentService = require(`${sails.config.appPath}/api/services/Payment/Mastercard/payment`);

module.exports = {
    serverGetCallbackURL: async (req, res) => {
        let params = req.allParams();
        try {
            console.log('-------------------Callback url params-------------');
            console.log(params);
            const result = await PaymentService.process3ds(params)
            console.log("Payment response", result)

            if (result.success) {
                let response = {
                    gatewayRecommendation: 'PROCEED',
                    status: 'PROCEED',
                    message: sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_SUCCESS
                }
                res.redirect(`gatewaysdk://3dsecure?acsResult=${JSON.stringify(response)}`)
            } else {
                let response = {
                    gatewayRecommendation: 'FAILD',
                    status: 'FAILED',
                    message: sails.config.message.PAYMENT_REQUEST_FAILED
                }
                res.redirect(`gatewaysdk://3dsecure?acsResult=${JSON.stringify(response)}`)
            }

            await PaymentService.validatePayment(result.orderId, result)
        } catch (error) {
            console.log(error);
            if (!res.headersSent) res.serverError({}, error);
        }
    },
}
