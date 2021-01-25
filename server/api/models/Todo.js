module.exports = {
    tableName: 'Todo',
    schema: true,
    attributes: {
        title: {
            type: 'string'
        },
        description: {
            type: 'string',
            required: true
        },
        priority: { 
            type: 'string',
            required: true
        },
        status: {
            model: 'master'
        },
        isCompleted: {
            type: 'boolean',
            defaultsTo: false
        },
        completedBy: {
            model: 'user'
        },
        completedAt: { 
            type: 'string',
            columnType: 'datetime'
        },
        dueDate: {
            type: 'string',
            columnType: 'datetime'
        },
        parentToDoId :{
            model: 'todo'
        },
        attachment: {
            type: 'json',
            columnType: 'array',
            description: {
                id: {
                    type: 'string'
                },
                path: {
                    type: 'string'
                },
                fileName: {
                    type: 'string'
                }
            }
        },
        assignedTo: {
            type: 'json',
            columnType: 'array',
            description: {
                id: {
                    type: 'string'
                },
                userId: {
                    model: 'user'
                }
            }
        },
        progress: {
            type: 'number',
            defaultsTo: 0
        },
        module: {
            type: 'number',
            required: true
        },
        referenceId: {
            type: 'string'
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
        deletedAt: {
            type: 'string',
            columnType: 'datetime'
        }
    }
}