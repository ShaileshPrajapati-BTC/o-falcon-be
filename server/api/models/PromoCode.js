module.exports = {
    tableName: 'PromoCode',
    schema: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        code: {
            type: 'string',
            required: true,
            // unique: true
        },
        addedBy: {
            model: 'User'
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
            type: 'string',
            required: false
        },
        startDateTime: {
            type: 'string',
            columnType: 'datetime',
            required: true
        },
        endDateTime: {
            type: 'string',
            columnType: 'datetime',
            required: true
        },
        link: { type: 'string' },
        type: {
            type: 'number',
            description: sails.config.PROMO_CODE_TYPE
        },
        maxUseLimitPerUser: {
            type: 'number',
            required: true
        },
        discountType: {
            type: 'number',
            description: sails.config.PROMO_CODE_DISCOUNT_TYPE
        },
        maximumDiscountLimit: {
            type: 'number'
        },
        flatDiscountAmount: {
            type: 'number'
        },
        percentage: {
            type: 'number'
        },
        isActive: {
            type: 'boolean',
            defaultsTo: false
        },
        isApplicableToAllUsers: {
            type: 'boolean'
        },
        applicableUsers: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' }
        },
        vehicleType: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'number' },
            defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE_ARRAY
        }
    }
};
