module.exports.routes = {
    'POST /api/v1/customer/add-card': {
        controller: 'Device/V1/StripeController',
        action: 'addCardToCustomer',
        swagger: {
            summary: 'add credit card',
            description: '',
            body: {
                cardToken: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/update-card': {
        controller: 'Device/V1/StripeController',
        action: 'updateCard',
        swagger: {
            summary: 'update credit card',
            description: '',
            body: {
                cardDetails: {
                    type: 'object',
                    required: true,
                    properties: {
                        expMonth: { type: 'number' },
                        expYear: { type: 'number' },
                        id: { type: 'string' }
                    }
                }
            }
        }
    },
    'POST /api/v1/customer/remove-card': {
        controller: 'Device/V1/StripeController',
        action: 'removeCard',
        swagger: {
            summary: 'remove credit card',
            description: '',
            body: {
                cardId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/set-default-customer-card': {
        controller: 'Device/V1/StripeController',
        action: 'setDefaultCustomerCard',
        swagger: {
            summary: 'set default credit card',
            description: '',
            body: {
                cardId: {
                    type: 'string',
                    required: true
                }
            }
        }
    }
};
