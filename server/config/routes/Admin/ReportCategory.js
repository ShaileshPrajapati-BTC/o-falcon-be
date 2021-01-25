module.exports.routes = {
    'POST /admin/report-category/add': {
        controller: 'Admin/ReportCategoryController',
        action: 'create',
        swagger: {
            summary: 'Add report category.',
            description: '',
            body: {
                name: {
                    type: 'string',
                    required: true
                },
                code: {
                    type: 'string',
                    required: true
                },
                parentId: {
                    type: 'string'
                }
            }
        }
    },

    "POST /admin/report-category/paginate": {
        controller: "Admin/ReportCategoryController",
        action: "paginate",
        swagger: {
            summary: "List Task.",
            description: "",
            body: {},
        },
    },

    "POST /admin/report-category/report-category": {
        controller: "Admin/ReportCategoryController",
        action: "getCategory",
        swagger: {
            summary: "List Task.",
            description: "",
            body: {},
        },
    },
}