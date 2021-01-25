module.exports = {
    tableName: "RentPayment",
    schema: true,
    attributes: {
        requestId: {
            type: "string",
        },
        referenceId: {
            model: "User",
            required: true,
        },
        amount: {
            type: "number",
            required: true,
        },
        dateTime: {
            type: "string",
            columnType: "datetime",
        },
        remark: {
            type: "string",
        },
        status: {
            type: "number",
            defaultsTo: sails.config.RENT_PAYMENT_STATUS.REQUESTED,
        },
        transferredDateTime: {
            type: "string",
            columnType: "datetime",
        },
        rejectionDatetime: {
            type: "string",
            columnType: "datetime",
        },
        statusTrack: {
            type: "json",
            columnType: "array",
            defaultsTo: [],
            description: {
                status: { type: "integer" },
                dateTime: { type: "datetime" },
                userId: { type: "string" },
                remark: { type: "string" },
            },
        },
        fareSummary: {
            type: "json",
            columnType: "object",
            description: {
                vehicleId: { type: "string" },
                vehicleName: { type: "string" },
                dayDiff: { type: "number" },
                rent: { type: "number" },
            },
        },
        type: {
            type: "number",
            description: sails.config.RENT_PAYMENT_TYPE,
        },
        rentAmount: {
            type: "number",
            required: true,
        },
        userType: {
            type: "number",
            extendedDescription: [
                sails.config.USER.TYPE.FRANCHISEE,
                sails.config.USER.TYPE.DEALER,
            ],
        },
        parentId: {
            model: "User",
            // required: true,
        },
    },
};
