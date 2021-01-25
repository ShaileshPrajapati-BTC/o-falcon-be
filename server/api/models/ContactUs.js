module.exports = {
    tableName: 'ContactUs',
    schema: true,
    attributes: {
        userId: {
            model: 'User',
            required: true
        },
        from: {
            type: 'string',
            required: true
        },
        to: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' },
            required: true
        },
        subject: {
            type: 'string',
            required: true
        },
        message: {
            type: 'string',
            required: true
        },
        attachments: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' }
        }
    }
};
