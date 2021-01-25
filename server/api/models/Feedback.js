module.exports = {
    tableName: 'Feedback',
    schema: true,
    attributes: {
        feedback: {
            type: 'string',
            required: true
        },
        franchiseeId: {
            model: 'User'
        },
        dealerId: {
            model: 'User'
        },
        language: {
            type: 'string',
            defaultsTo: sails.config.DEFAULT_LANGUAGE
        }
    }
};
