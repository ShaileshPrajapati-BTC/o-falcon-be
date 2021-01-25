module.exports.routes = {
    'POST /admin/promo-code/paginate': {
        controller: 'Admin/PromoCodeController',
        action: 'paginate',
        swagger: {
            summary: 'List Promo Code.',
            description: '',
            body: {}
        }
    },
    'POST /admin/promo-code/add': {
        controller: 'Admin/PromoCodeController',
        action: 'add',
        swagger: {
            summary: 'Add Promo Code.',
            description: '',
            body: {
                name: {
                    type: 'string',
                    required: true
                },
                code: {
                    type: 'string',
                    required: true,
                },
                description: {
                    type: 'string',
                    required: true
                },
                tnc: {
                    type: 'string',
                    required: true
                },
                notes: {
                    type: 'string'
                },
                startDateTime: {
                    type: 'string',
                    required: true
                },
                endDateTime: {
                    type: 'string',
                    required: true
                },
                link: { type: 'string' },
                type: {
                    type: 'number'
                },
                maxUseLimitPerUser: {
                    type: 'number',
                    required: true
                },
                discountType: {
                    type: 'number'
                },
                maximumDiscountLimit: {
                    type: 'number'
                },
                flatDiscountAmount: {
                    type: 'number'
                },
                isActive: { type: 'boolean' }
            }
        }
    },
    'PUT /admin/promo-code/:id': {
        controller: 'Admin/PromoCodeController',
        action: 'update',
        swagger: {
            summary: 'Update Promo Code.',
            description: '',
            body: {}
        }
    },
    'GET /admin/promo-code/:id': {
        controller: 'Admin/PromoCodeController',
        action: 'view',
        swagger: {
            summary: 'Get promo-code details.',
            description: '',
            body: {}
        }
    }
};
