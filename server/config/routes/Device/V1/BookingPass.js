module.exports.routes = {
    "POST /api/v1/booking-pass/list": {
        controller: "Device/V1/BookingPassController",
        action: "list",
        swagger: {
            summary: "",
            description: "",
            body: {
                page: { type: "number" },
                limit: { type: "number" },
            },
        },
    },
    "POST /api/v1/booking-pass/buy": {
        controller: "Device/V1/BookingPassController",
        action: "purchasePass",
        swagger: {
            summary: "Buy the pass",
            description: "",
            body: {
                planId: {
                    type: "string",
                    required: true
                },
                vehicleType: {
                    type: "number",
                    required: true
                }
            }
        }
    },
};
