module.exports = {
    tableName: 'RideComplaintDispute',
    schema: true,
    attributes: {

        // Created from series generator setting
        uniqNumber: { type: 'string' },

        rideId: {
            model: 'ridebooking'
        },

        userId: {
            model: 'user',
            required: true
        },

        franchiseeId: { model: 'user' },
        dealerId: { model: 'user' },
        userType: { type: 'number' },
        // --- Action Questionnaire ----
        actionQuestionnaireId: { model: 'actionquestionnairemaster' },


        question: { type: 'string' },

        answer: { type: 'string' },
        // --- Action Questionnaire ----

        attachments: {
            type: 'JSON',
            columnType: 'ARRAY',
            description: {
                path: { type: 'string' },
                type: { type: 'integer' },
                isPrimary: { type: 'boolean' },
                attachmentId: { type: 'string' }
            }
        },

        // --- STATUS----
        status: {
            type: 'number',
            defaultsTo: sails.config.COMPLIANT_DISPUTE.STATUS.SUBMITTED
        },
        type: {
            type: 'number',
            required: true
        },
        remark: { type: 'string' },
        statusTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                // User ID
                userId: { type: 'string' },
                remark: { type: 'string' }
            }

        },
        vehicleType: {
            type: 'number',
            extendedDescription: sails.config.VEHICLE_TYPE,
            defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        },
        priority: {
            type: 'number',
            defaultsTo: sails.config.COMPLIANT_DISPUTE.PRIORITY.LOW
        },
        // --- /STATUS ----
        conversationTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                dateTime: { type: 'datetime' },
                // User ID
                userId: { model: 'user' },
                remark: { type: 'string' }
            }
        },
        activityTrack: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            description: {
                dateTime: { type: 'datetime' },
                keyName: { type: "string" },
                // User ID
                userId: { model: 'user' },
                oldValues: { type: "number" },
                newValues: { type: "number" }
            }
        },
        serviceNo: { type: 'string' }
    }
};
