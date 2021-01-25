module.exports.routes = {
    'POST /api/v1/customer/promo-code/apply': {
        controller: 'Device/V1/PromoCodeController',
        action: 'applyPromoCode',
        swagger: {
            summary: 'Apply Promo Code.',
            description: 'Apply Promo Code',
            body: {
                rideId: {
                    type: 'string',
                    required: true
                },
                promoCode: {
                    type: 'string',
                    required: true
                }
            }
        }
    },

    'POST /api/v1/customer/promo-code/list': {
        controller: 'Device/V1/PromoCodeController',
        action: 'list',
        swagger: {
            summary: 'List Promo Codes.',
            description: '',
            body: {}
        }
    },

    'POST /api/v1/customer/promo-code/remove': {
        controller: 'Device/V1/PromoCodeController',
        action: 'remove',
        swagger: {
            summary: 'Remove Promo Codes.',
            description: '',
            body: {
                rideId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
}