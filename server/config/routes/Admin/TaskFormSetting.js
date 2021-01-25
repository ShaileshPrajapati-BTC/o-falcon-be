module.exports.routes = {
    'POST /admin/task-form-setting/add': {
        controller: 'Admin/TaskFormSettingController',
        action: 'create',
        swagger: {
            summary: 'Add task form settings.',
            description: '',
            body: {
                level: {
                    type: 'number',
                    required: true
                },
                taskType: {
                    type: 'number',
                    required: true
                },
                title: {
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
                isSnoozer: {
                    type: 'boolean'
                },
                taskCompletionReq:{
                    type: 'boolean'
                },
                nest: {
                    type: 'boolean'
                }
            }
        }
    },

    'POST /admin/task-form-setting/get-task-form': {
        controller: 'Admin/TaskFormSettingController',
        action: 'getTaskForm',
        swagger: {
            summary: 'Get task form settings.',
            description: '',
            body: {
            }
        }
    },

    'PUT /admin/task-form-setting/:id': {
        controller: 'Admin/TaskFormSettingController',
        action: 'update',
        swagger: {
            summary: 'Update task form settings.',
            description: '',
            body: {
                level: {
                    type: 'number',
                    required: true
                },
                taskType: {
                    type: 'number',
                    required: true
                },
                title: {
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
                isSnoozer: {
                    type: 'boolean'
                },
                taskCompletionReq:{
                    type: 'boolean'
                },
                nest: {
                    type: 'boolean'
                }
            }
        }
    },

    "DELETE /admin/task-form-setting/:id": {
        controller: "Admin/TaskFormSettingController",
        action: "delete",
        swagger: {
            summary: "Delete task form setting.",
            description: "",
            body: {},
        },
    },

    "POST /admin/task-form-setting/paginate": {
        controller: "Admin/TaskFormSettingController",
        action: "paginate",
        swagger: {
            summary: "Get all task form setting.",
            description: "",
            body: {},
        },
    },

    "GET /admin/task-form-setting/:id": {
        controller: "Admin/TaskFormSettingController",
        action: "view",
        swagger: {
            summary: "Get task form setting.",
            description: "",
            body: {},
        },
    }    
}