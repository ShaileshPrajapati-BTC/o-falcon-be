module.exports = {
    tableName: 'ActionQuestionnaireMaster',
    schema: true,
    attributes: {
        question: {
            type: 'string',
            required: true
        },
        feedbackControlType: {
            type: 'number',
            required: true
        },
        isActive: {
            type: 'boolean',
            defaultsTo: true
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        isAttachmentRequired: {
            type: 'boolean',
            defaultsTo: true
        },
        type: {
            type: 'number',
            required: true
        },
        addedBy: {
            model: 'User'
        },
        multiLanguageData: {
            type: 'json',
            columnType: 'object',
            description: {
                fieldType: 'object'
            }
        }
    }
}