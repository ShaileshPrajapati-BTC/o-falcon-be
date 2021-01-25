module.exports.routes = {
    'POST /admin/report-form-setting/add': {
        controller: 'Admin/ReportFormSettingController',
        action: 'create',
        swagger: {
            summary: 'Add report form settings.',
            description: '',
            body: {
                vehicleId: {
                    type: 'boolean',
                    required: true
                },
                category: {
                    type: 'string',
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
                }
            }
        }
    },

    'PUT /admin/report-form-setting/:id': {
        controller: 'Admin/ReportFormSettingController',
        action: 'update',
        swagger: {
            summary: 'update report form settings.',
            description: '',
            body: {
                vehicleId: {
                    type: 'boolean',
                    required: true
                },
                category: {
                    type: 'strings',
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
                }
            }
        }
    },

    "DELETE /admin/report-form-setting/:id": {
        controller: "Admin/ReportFormSettingController",
        action: "delete",
        swagger: {
            summary: "Delete report form setting.",
            description: "",
            body: {},
        },
    },

    "POST /admin/report-form-setting/paginate": {
        controller: "Admin/ReportFormSettingController",
        action: "paginate",
        swagger: {
            summary: "Get all report form setting.",
            description: "",
            body: {},
        },
    },

    "GET /admin/report-form-setting/:id": {
        controller: "Admin/ReportFormSettingController",
        action: "view",
        swagger: {
            summary: "Get report form setting.",
            description: "",
            body: {},
        },
    },
}