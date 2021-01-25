module.exports.routes = {
    "POST /admin/report/paginate": {
        controller: "Admin/ReportController",
        action: "paginate",
        swagger: {
            summary: "List Report.",
            description: "",
            body: {},
        },
    },

    "GET /admin/report/:id": {
        controller: "Admin/ReportController",
        action: "view",
        swagger: {
            summary: "Get report.",
            description: "",
            body: {},
        },
    },

    "PUT /admin/report/:id": {
        controller: "Admin/ReportController",
        action: "update",
        swagger: {
            summary: "Update report.",
            description: "",
            body: {},
        },
    },

    "PUT /admin/report/update-status/:id": {
        controller: "Admin/ReportController",
        action: "updateStatus",
        swagger: {
            summary: "Update report status.",
            description: "",
            body: {},
        },
    },
}