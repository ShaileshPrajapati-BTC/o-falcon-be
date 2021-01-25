module.exports.routes = {
    "POST /admin/nest/paginate": {
        controller: "Admin/NestController",
        action: "paginate",
        swagger: {
            summary: "List Nests.",
            description: "",
            body: {},
        },
    },
    "POST /admin/nest/add": {
        controller: "Admin/NestController",
        action: "add",
        swagger: {
            summary: "Add Nest.",
            description: "",
            body: {},
        },
    },
    "PUT /admin/nest/:id": {
        controller: "Admin/NestController",
        action: "update",
        swagger: {
            summary: "update nest",
            description: "",
            body: {},
        },
    },
    "GET /admin/nest/:id": {
        controller: "Admin/NestController",
        action: "view",
        swagger: {
            summary: "Get nest details.",
            description: "",
            body: {},
        },
    },
    "DELETE /admin/nest/:id": "Admin/NestController.delete",
    'POST /admin/nest/assign-vehicle': 'Admin/NestController.assignVehicle',
    'POST /admin/nest/retain-vehicle': 'Admin/NestController.retainVehicle',
};
