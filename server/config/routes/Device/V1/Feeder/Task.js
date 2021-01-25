module.exports.routes = {
    "POST /api/v1/feeder/task/capture-vehicle": {
        controller: "Device/V1/Feeder/TaskController",
        action: "captureVehicleToStartTask",
        swagger: {
            summary: "Vehicle scan and then captured.",
            description: "",
            body: {
                qrNumber: {
                    type: "string",
                    required: true,
                },
            },
        },
    },

    "POST /api/v1/feeder/task/find-tasks": {
        controller: "Device/V1/Feeder/TaskController",
        action: "findTasks",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },

    "POST /api/v1/feeder/task/overdue-tasks-list": {
        controller: "Device/V1/Feeder/TaskController",
        action: "overdueTasksListOfFeeder",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },

    "POST /api/v1/feeder/task/user-release-tasks-list": {
        controller: "Device/V1/Feeder/TaskController",
        action: "userReleaseTasksList",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },

    "POST /api/v1/feeder/task/cancel-task": {
        controller: "Device/V1/Feeder/TaskController",
        action: "cancelAssignTask",
        swagger: {
            summary: "",
            description: "",
            body: {
                taskId: {
                    type: "string",
                    required: true,
                },
            },
        },
    },
    "POST /api/v1/feeder/task/paginate": {
        controller: "Device/V1/Feeder/TaskController",
        action: "paginate",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },
    "GET /api/v1/feeder/task/:id": {
        controller: "Device/V1/Feeder/TaskController",
        action: "view",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },

    "POST /api/v1/feeder/dashboard-task-list": {
        controller: "Device/V1/Feeder/TaskController",
        action: "taskDashboard",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },

    "POST /api/v1/feeder/task/filter-falcon": {
        controller: "Device/V1/Feeder/TaskController",
        action: "filterFalcon",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },

    "POST /api/v1/feeder/task/my-task": {
        controller: "Device/V1/Feeder/TaskController",
        action: "myTask",
        swagger: {
            summary: "",
            description: "",
            body: {},
        },
    },

    "POST /api/v1/feeder/task/capture-vehicle-release": {
        controller: "Device/V1/Feeder/TaskController",
        action: "captureVehicleToReleaseTasks",
        swagger: {
            summary: "Vehicle scan and then release.",
            description: "",
            body: {
                qrNumber: {
                    type: "string",
                    required: true,
                },
                currentLocation: {
                    type: "string"
                }
            },
        },
    },
};
