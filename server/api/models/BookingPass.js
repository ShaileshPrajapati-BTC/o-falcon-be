module.exports = {
    tableName: "BookingPass",
    attributes: {
        name: {
            type: "string",
            required: true
        },
        code: {
            type: "string",
            required: true,
            unique: true
        },
        description: {
            type: "string",
            required: true
        },
        passType: {
            type: "json",
            columnType: 'array',
            // description: sails.config.BOOKING_PASS_TYPE,
            required: true,
            description: { fieldType: 'number' }
        },
        vehicleTypes: {
            type: 'json',
            columnType: 'array',
            description: {
                vehicleType: { type: "number" },
                price: { type: "number" },
                rideDiscount: { type: "number" },
                unlockDiscount: { type: "number" },
            }
        },
        limitType: {
            type: "number",
            description: sails.config.BOOKING_PASS_LIMIT_TYPES,
            required: true
        },
        limitValue: {
            type: "number",
            required: true
        },
        expirationType: {
            type: "number",
            description: sails.config.BOOKING_PASS_EXPIRATION_TYPES,
            required: true
        },
        expirationValue: {
            type: "number",
            required: true
        },
        ismaxRideLimit: {
            type: "boolean",
            defaultsTo: false
        },
        maxRidePerDay: {
            type: "number"
        },
        isActive: {
            type: "boolean",
            defaultsTo: false
        },
        isDeleted: {
            type: "boolean",
            defaultsTo: false
        },
        extraDescription: {
            type: 'json',
            columnType: 'array',
            description: {}
        },
    }
};
