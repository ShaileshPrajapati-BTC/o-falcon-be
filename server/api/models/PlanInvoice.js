module.exports = {
    tableName: "PlanInvoice",
    attributes: {
        userId: {
            model: "User",
            required: true,
        },
        planId: {
            model: "BookPlan",
            required: true,
        },
        passId: {
            model: "BookingPass",
            required: true,
        },
        totalTimeLimit: {
            type: "number",
            description: "Total Plan's Time limit in seconds",
            required: true,
        },
        remainingTimeLimit: {
            type: "number",
            description: "Remaining Time limit in seconds",
            required: true,
        },
        planData: {
            type: "json",
            columnType: "object",
        },
        planPrice: { type: "number" },
        planName: { type: "string" },
        isTrialPlan: { type: "boolean" },
        isCancelled: {
            type: "boolean",
            defaultsTo: false,
        },
        isRenewable: { type: "boolean" },
        expirationStartDateTime: { type: "string" },
        expirationEndDateTime: { type: "string" },
        isCancellable: {
            type: "boolean",
            defaultsTo: true,
        },
        isNotified: {
            type: "boolean",
            defaultsTo: false,
        },
        vehicleType: {
            type: 'number',
        },
        limitType: {
            type: "number",
            description: sails.config.BOOKING_PASS_EXPIRATION_TYPES,
            required: true
        },
        limitValue: {
            type: "number",
            required: true
        },
    },
};
