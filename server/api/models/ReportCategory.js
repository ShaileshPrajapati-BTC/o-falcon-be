module.exports = {
    tableName: 'ReportCategory',
    schema: true,
    attributes: {
        name: {
            type: 'string'
        },
        code: {
            type: 'string'
        },
        parentId: {
            model: "ReportCategory"
        },
        addedBy: {
            model: 'user'
        },
        updatedBy: {
            model: 'user',
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        deletedBy: {
            model: 'user'
        },
        addedAt: {
            type: 'string',
            columnType: 'datetime'
        },
        deletedAt: {
            type: 'string',
            columnType: 'datetime'
        }
    }
}