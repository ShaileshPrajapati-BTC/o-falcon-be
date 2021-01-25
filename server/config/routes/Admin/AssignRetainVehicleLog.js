module.exports.routes = {
    "POST /admin/assign-vehicle-logs": {
        controller: "Admin/AssignRetainVehicleLogController",
        action: "getLogs",
        swagger: {
            summary: "List logs.",
            description: "",
            body: {},
        },
    },
};
