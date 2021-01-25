module.exports = {
    tableName: "TaskFormSetting",
    schema: true,
    attributes: {
        level: {
            type: "number",
            required: true,
            extendedDescription: sails.config.TASK.TASK_LEVEL,
        },
        taskType: {
            type: "number",
            unique: true,
            extendedDescription: sails.config.TASK.TASK_TYPE,
        },
        title: {
            type: "string",
            required: true,
        },
        timeLimitType: {
            type: "number",
            extendedDescription: sails.config.TASK_TIME_LIMIT_TYPE,
        },
        timeLimitValue: {
            type: "number",
        },
        incentiveRange: {
            type: "json",
            columnType: "array",
            description: {
                fieldType: "number",
            },
        },
        isSnoozer: {
            type: "boolean",
        },
        taskCompletionReq: {
            type: "boolean",
        },
        // todo:falcon -> change nest -> isNest or nestAvailable
        nest: {
            type: "boolean",
        },
        addedBy: {
            model: "user",
        },
        updatedBy: {
            model: "user",
        },
        isDeleted: {
            type: "boolean",
            defaultsTo: false,
        },
        deletedBy: {
            model: "user",
        },
        addedAt: {
            type: "string",
            columnType: "datetime",
        },
        deletedAt: {
            type: "string",
            columnType: "datetime",
        },
    },
};
