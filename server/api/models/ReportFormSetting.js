module.exports = {
    tableName: 'ReportFormSetting',
    schema: true,
    attributes: {
        title: {
            type: 'string'
        },
        vehicleId: {
            type: 'boolean',
            required: true
        },
        categoryId: {
            model: 'reportcategory',
            required: true
        },
        comment: {
            type: 'boolean'
        },
        photo: {
            type: 'boolean'
        },
        location: {
            type: 'boolean'
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