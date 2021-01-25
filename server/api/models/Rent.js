module.exports = {
    tableName: "Rent",
    schema: true,
    attributes: {
        referenceId: {
            model: "User",
            required: true,
        },
        vehicleRentAmount: {
            type: "number",
            defaultsTo: 0.0,
        },
        track: {
            type: "json",
            columnType: "array",
            description: {
                data: { type: "json" },
                vehicleRentAmount: { type: "number" },
                dateTime: { type: "datetime" },
                userId: { model: "user" },
                remark: { type: "string" },
            },
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
            required: true,
        },
    },
};
