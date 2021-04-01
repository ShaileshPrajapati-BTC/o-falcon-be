const PaymentService = require(`${sails.config.appPath}/api/services/Payment/Mastercard/payment`);

module.exports = {
    serverGetCallbackURL: async (req, res) => {
      console.log("dddddddddd")
        let params = req.allParams();
        console.log("ww=================",params, req.session)
        try {
            console.log('-------------------Callback url params-------------');
            console.log(params);
            var result = await PaymentService.process3ds(params)
            console.log("Payment response", result)

            if (result.success){
                let response = { gatewayRecommendation: 'PROCEED', status: 'PROCEED', message: sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_SUCCESS }
                res.redirect(`gatewaysdk://3dsecure?acsResult=${JSON.stringify(response)}`)
                // Payment success fully done update the transaction record
            }else{
                let response = { gatewayRecommendation: 'FAILD', status: 'FAILD', message: sails.config.message.PAYMENT_REQUEST_FAILED }
                res.redirect(`gatewaysdk://3dsecure?acsResult=${JSON.stringify(response)}`)
            }

            await PaymentService.validatePayment(result.orderId, result)

            // let noqoodyReferenceId = params.reference;
            // if (sails.config.NOQOODY_TRANSACTION_VERIFYING.indexOf(noqoodyReferenceId) > -1) {
            //     return res.ok({}, sails.config.message.TRANSACTION_VERIFYING);
            // }
            // sails.config.NOQOODY_TRANSACTION_VERIFYING.push(noqoodyReferenceId);
            // await NoQoodyLog.create(params);
            // let isAddedToWallet = false;
            // let error;
            // try {
            //     isAddedToWallet = await PaymentService.validatePayment(noqoodyReferenceId);
            // } catch (err) {
            //     console.log(err);
            //     error = err;
            // }
            // sails.config.NOQOODY_TRANSACTION_VERIFYING = sails.config.NOQOODY_TRANSACTION_VERIFYING.filter(function (e) { return e !== noqoodyReferenceId });
            // console.log('isAddedToWallet------------------', isAddedToWallet);
            // if (isAddedToWallet) {
            //     return res.ok(isAddedToWallet, sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_SUCCESS);
            // }
            // if (error) {
            //     throw error;
            // }
            // throw sails.config.message.PAYMENT_REQUEST_FAILED;
            // return res.ok(`https://fd4be4c1a7f0.ngrok.io/mastercard/payment-callback?acsResult=${JSON.stringify(result.response)}`)
        } catch (error) {
            console.log(error);
            if(!res.headersSent) res.serverError({}, error);
        }
    },
}
