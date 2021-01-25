module.exports.routes = {
    
    "POST /admin/operational-hours/upsert": {
        controller: "Admin/OperationalHoursController",
        action: "upsert",
        swagger: {
            summary: "upsert operational hours",
            description: "",
            body: {},
        },
    },


    "POST /admin/operational-hours/view": {
        controller: "Admin/OperationalHoursController",
        action: "view",
        swagger: {
            summary: "view operational hours",
            description: "",
            body: {},
        },
    },


    "POST /admin/operational-hours/get-all-active-operational-hours": {
        controller: "Admin/OperationalHoursController",
        action: "getAllActiveOperationalHours",
        swagger: {
            summary: "view operational hours",
            description: "",
            body: {},
        },
    },



}