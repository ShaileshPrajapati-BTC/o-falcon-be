module.exports = {
    tableName: 'Document',
    schema: true,
    attributes: {
        type: { 
            model: 'master',
            // required: true
            // description: sails.config.DOCUMENT.TYPE
        },
        name: {
            type: 'string'
        },
        module: {
            type: 'number',
            required: true
        },
        referenceId: {
            type: 'string',
            required: true
        },
        path: { 
            type: 'string',
            required: true
        },
        backPath: { 
            type: 'string'
        },
        number: { 
            type: 'string'
        },
        // each time admin approve
        approvedDate: {
            type: 'string',
            columnType: 'datetime'
        },
        expiryDate: {
            type: 'string',
            columnType: 'datetime'
        },
        status: {
            type: 'number',
            description: sails.config.DOCUMENT.STATUS
        },        
        addedBy: {
            model: 'user'
        },
        updatedBy: {
            model: 'user'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        deletedBy: {
            model: 'user'
        },
        deletedAt: {
            type: 'string',
            columnType: 'datetime'
        }
    }
}