module.exports.routes = {
  'POST /mastercard/payment-callback': {
      controller: 'Payment/MastercardController',
      action: 'serverGetCallbackURL',
      swagger: {
          summary: 'Server get callback url and add wallet into user.',
          description: '',
          body: {
          }
      }
  }
}
