module.exports = {
    tableName: "BookPlan",
    attributes: {
        name: {
            type: "string",
            required: true
        },
        description: {
            type: "string",
            required: true
        },
        planType: {
            type: "number",
            description: sails.config.BOOK_PLAN_TYPES,
            required: true
        },
        planValue: {
            type: "number",
            required: true
        },
        limitType: {
            type: "number",
            description: sails.config.BOOK_PLAN_LIMIT_TYPES,
            required: true
        },
        limitValue: {
            type: "number",
            required: true
        },
        startDateTimeToBuy: {
            type: "string",
            columnType: "datetime",
            required: true
        },
        endDateTimeToBuy: {
            type: "string",
            columnType: "datetime",
            required: true
        },
        isActive: {
            type: "boolean",
            defaultsTo: false
        },
        isRenewable: {
            type: "boolean",
            defaultsTo: false
        },
        isTrialPlan: {
            type: "boolean",
            defaultsTo: false
        },
        price: {
            type: "number",
            required: true
        },
        isDeleted: {
            type: "boolean",
            defaultsTo: false
        },
        extraDescription: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' }
        },
        // validOnDays: {
        //     type: 'json',
        //     columnType: 'array',
        //     description: { fieldType: 'number' }
        //     // sails.config.WEEKDAYS
        // },
        // timeWindows: {
        // }
    }
};
