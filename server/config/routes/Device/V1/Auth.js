module.exports.routes = {
    "POST /api/v1/auth/login": {
        "controller": "Device/V1/AuthController",
        "action": "login",
        "swagger": {
            "summary": "login user",
            "description": "login via email/mobile, send deviceType in headers, ANDROID:1,IPHONE:2 && imei",
            "body": {
                "username": {
                    type: "string",
                    required: true
                },
                "password": {
                    type: "string",
                    required: true
                }
            }
        }
    },
    "POST /api/v1/auth/logout": {
        "controller": "Device/V1/AuthController",
        "action": "logout",
        "swagger": {
            "summary": "logout user",
            "description": "logout",
            "body": {}
        }
    },
    "POST /api/v1/auth/forgot-password": {
        "controller": "Device/V1/AuthController",
        "action": "forgotPassword",
        "swagger": {
            "summary": "forgot password, username could be email or mobile",
            "description": "",
            "body": {
                "username": {
                    type: "string",
                    required: true
                }
            }
        }
    },
    "POST /api/v1/auth/reset-password": {
        "controller": "Device/V1/AuthController",
        "action": "resetPassword",
        "swagger": {
            "summary": "reset password ",
            "description": "",
            "body": {
                token: {
                    type: "string",
                    required: true
                },
                newPassword: {
                    type: "string",
                    required: true
                }
            }
        }
    },
    "POST /api/v1/auth/reset-password-by-user": {
        "controller": "Device/V1/AuthController",
        "action": "passwordUpdateByUser",
        "swagger": {
            "summary": "Reset password by user  himself, JWT token is must",
            "description": "",
            "body": {
                newPassword: {
                    type: "string",
                    required: true
                },
                currentPassword: {
                    type: "string",
                    required: true
                }
            }
        }
    }

};
