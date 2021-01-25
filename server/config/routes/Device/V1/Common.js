module.exports.routes = {
    "POST /api/v1/sync": {
        "controller": "Device/V1/CommonController",
        "action": "sync",
        "swagger": {
            "summary": "sync user",
            "description": "",
            "body": {
                "lastSyncDate": {
                    type: "string",
                    columnType: "datetime",
                    required: true
                },
                "homeId": {
                    type: "string",
                    required: true
                }
            }
        }
    }
};