module.exports.routes = {
    'POST /admin/task/create': {
        controller: 'Admin/TaskController',
        action: 'create',
        swagger: {
            summary: 'Add task.',
            description: '',
            body: {
                taskType: {
                    type: 'number',
                    required: true
                },
                taskHeading: {
                    type: 'string',
                    required: true
                },
                timeLimitType: {
                    type: 'number'
                },
                timeLimitValue: {
                    type: 'number'
                },
                incentiveRange: {
                    type: 'array'
                },
                taskWorkFlow: {
                    type: 'number'
                },
                module: {
                    type: "number",
                    required: true,
                },
                referenceId: { 
                    type: "string",
                    required: true
                },
                nestId: { type: "string" }
            }
        }
    },

    "POST /admin/task/paginate": {
        controller: "Admin/TaskController",
        action: "paginate",
        swagger: {
            summary: "List Task.",
            description: "",
            body: {},
        },
    },

    "GET /admin/task/:id": {
        controller: "Admin/TaskController",
        action: "view",
        swagger: {
            summary: "Get Task details.",
            description: "",
            body: {},
        },
    },

    "PUT /admin/task/:id": {
        controller: "Admin/TaskController",
        action: "update",
        swagger: {
            summary: "Update Task",
            description: "",
            body: {
                taskType: {
                    type: "number",
                    required: true,
                },
                taskHeading: {
                    type: "string",
                    required: true,
                },
                incentiveRange: {
                    type: 'array'
                },
                taskWorkFlow: {
                    type: 'number'
                },
                module: {
                    type: "number",
                    required: true,
                },
                referenceId: { type: "string" },
            }
        }
    },

    "DELETE /admin/task/:id": {
        controller: "Admin/TaskController",
        action: "delete",
        swagger: {
            summary: "Delete task.",
            description: "",
            body: {},
        },
    },

    "PUT /admin/task/update-status/:id": {
        controller: "Admin/TaskController",
        action: "updateStatus",
        swagger: {
            summary: "update task status.",
            description: "",
            body: {},
        },
    },

    "POST /admin/task/task-summary": {
        controller: "Admin/TaskController",
        action: "taskSummary",
        swagger: {
            summary: "Task total summary.",
            description: "",
            body: {},
        },
    },

    "POST /admin/task/task-by-user": {
        controller: "Admin/TaskController",
        action: "taskByUser",
        swagger: {
            summary: "Task by user.",
            description: "",
            body: {},
        },
    },

    "POST /admin/task/task-by-vehicle": {
        controller: "Admin/TaskController",
        action: "taskByVehicle",
        swagger: {
            summary: "Task by vehicle.",
            description: "",
            body: {},
        },
    },

    // "POST /admin/task/dashboard": {
    //     controller: "Admin/TaskController",
    //     action: "dashboard",
    //     swagger: {
    //       summary: "dashboard.",
    //       description: "",
    //       body: {},
    //     },
    // }
}