module.exports = {
    tableName: 'Report',
    schema: true,
    attributes: {
        vehicleId: {
            model: 'vehicle',
            required: true
        },
        userId: {
            model: 'user',
        },
        userType: {
            type: 'number',
            extendedDescription: sails.config.USER.TYPE
        },
        categoryId: {
            model: 'reportcategory',
            required: true
        },
        subCategoryId: {
            model: 'reportcategory'
        },
        issueType: {
            type: 'json',
            columnType: 'array',
            description: {
                fieldType: 'string'
            }
        },
        comment: {
            type: 'string'
        },
        images: {
            type: 'json',
            columnType: 'array',
            description: {
                fieldType: 'string'
            }
        },
        address: {
            type: 'string'
        },
        // location: {
        //     type: "json",
        //     columnType: "object",
        //     description: {
        //         coordinates: { type: "array" },
        //     },
        // },
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
        },
        taskId: { model: "Task" },
        reportNumber: { type: 'string' },
        status: { type: 'number' },
        statusTrack: {
            type: "json",
            columnType: "array",
            description: {
                before: { type: "number" },
                after: { type: "number" },
                dateTime: { type: "datetime" },
                remark: { type: "string" },
                userId: { type: "string" },
            },
        },
    }
}