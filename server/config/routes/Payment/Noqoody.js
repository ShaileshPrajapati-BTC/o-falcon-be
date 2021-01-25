module.exports.routes = {
    'GET /noqoody/payment-callback': {
        controller: 'Payment/NoqoodyController',
        action: 'serverGetCallbackURL',
        swagger: {
            summary: 'Server get callback url and add wallet into user.',
            description: '',
            body: {
            }
        }
    }
}