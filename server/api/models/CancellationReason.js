module.exports = {
    tableName: 'CancellationReason',
    schema: true,
    attributes: {
        reason: {
            type: 'string',
            required: true,
            unique: true
        },
        sequence: {
            type: 'number',
            required: true,
            unique: true
        },
        addedBy: {
            model: 'User'
        },
        multiLanguageData: {
            type: 'json',
            columnType: 'object',
            description: { fieldType: 'object' }
        }
    }
};
