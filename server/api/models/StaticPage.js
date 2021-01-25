module.exports = {
    tableName: 'StaticPage',
    schema: true,
    attributes: {
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
        userType: {
            type: 'number'
        },
        multiLanguageData: {
            type: 'json',
            columnType: 'object',
            description: { fieldType: 'object' }
        }
    }
};
