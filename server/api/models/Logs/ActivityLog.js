module.exports = {
    tableName: "ActivityLog",
    schema: true,
    attributes: {
        userId: {
            model: "User"
        },
        referenceId: {
            type: "string"
        },
        module: {
            type: "number"
        },
        action: {
            type: "number"
        },
        recordTitle: {
            type: "string"
        },
        details: {
            type: "json"
        },
        type: {
            type: "number"
        },
        oldValues: {
            type: "json"
        }
    }
};