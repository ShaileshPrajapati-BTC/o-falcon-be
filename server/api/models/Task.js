module.exports = {
    tableName: "Task",
    schema: true,
    attributes: {
        level: {
            type: "number",
            extendedDescription: sails.config.TASK.TASK_LEVEL,
        },
        taskType: {
            type: "number",
            required: true,
            extendedDescription: sails.config.TASK.TASK_TYPE,
        },
        taskHeading: {
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
        isSnoozer: {
            type: "boolean",
        },
        snoozerTime: {
            type: "number", // in min
        },
        taskWorkFlow: {
            type: "number",
            defaultsTo: sails.config.TASK.WORK_FLOW.OPEN,
        },
        taskCompletionReq: {
            type: "json",
            columnType: "array",
            description: {
                fieldType: "number",
            },
        },
        incentiveAmount: {
            type: "number",
            required: true
        },
        isAssigned: {
            type: "boolean",
        },
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
        priority: {
            type: 'number',
            defaultsTo: sails.config.TASK.PRIORITY.NORMAL
        },
        images: {
            type: "json",
            columnType: "array",
            description: {
                fieldType: "string",
            },
        },
        note: {
            type: "string",
        },
        assignedTo: { model: "User" },
        //last ride datetime
        lastRidden: {
            type: "string"
        },
        //last located time 
        lastLocated: {
            type: "string"
        },
        description: {
            type: "string",
        },
        isOverDue: {
            type: "boolean",
            defaultsTo: false,
        },
        nestId: {
            model: "nest",
            // required: true
        },
        module: {
            type: "number",
            required: true,
        },
        referenceId: {
            model: "Vehicle",
            required: true
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
        completedBy: {
            model: "user",
        },
        canceledBy: {
            type: "json",
            columnType: "array",
            description: {
                userId: { model: "user" },
                dateTime: { type: "datetime" }
            },
            defaultsTo: []
        },
        taskStartDateTime: { type: "string" },
        taskEndDateTime: { type: "string" },
        completedAt: {
            type: "string",
            columnType: "datetime",
        },
        canceledAt: {
            type: "string",
            columnType: "datetime",
        },
        reportId: { model: "Report" },
        taskNumber: { type: "string" },
        isSystemCreated: { type: "boolean" },
        captureTaskTrack: {
            type: "json",
            columnType: "array",
            description: {
                status: { type: "number" },
                dateTime: { type: "datetime" },
                remark: { type: "string" },
                userId: { type: "string" },
            },
        },
        isIdealVehicleTask: {
            type: "boolean",
            defaultsTo: false,
        },
        lowBatteryTask: {
            type: "boolean",
            defaultsTo: false,
        },
    },
};
