module.exports = {
    tableName: 'Faqs',
    schema: true,
    attributes: {
        question: {
            type: 'string',
            required: true
        },
        answer: {
            type: 'string',
            required: true
        },
        sequence: {
            type: 'number',
            required: true,
            unique: true
        },
        multiLanguageData: {
            type: 'json',
            columnType: 'object',
            description: { fieldType: 'object' }
        }
    }
};
