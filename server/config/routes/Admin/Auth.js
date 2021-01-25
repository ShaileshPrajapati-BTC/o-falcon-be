module.exports.routes = {
    "POST /admin/auth/login": {
        "controller": "Admin/AuthController",
        "action": "login",
        "swagger": {
            "summary": "login user",
            "description": "login via email/mobile, send devicetype in headers",
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
        "controller": "Desktop/V1/AuthController",
        "action": "logout",
        "swagger": {
            "summary": "logout user",
            "description": "logout",
            "body": {
            }
        }
    },
    "POST /admin/auth/forgot-password": {
        "controller": "Admin/AuthController",
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
    "POST /admin/auth/reset-password": {
        "controller": "Admin/AuthController",
        "action": "resetPasswordWeb",
        "swagger": {
            "summary": "reset password ",
            "description": "",
            "body": {
                username: {
                    type: "string",
                    required: true
                },
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
    "POST /api/v1/auth/reset-password": {
        "controller": "Desktop/V1/AuthController",
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
    "POST /auth/reset-password-by-user": {
        "controller": "Admin/AuthController",
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
    },
    "GET /admin/auth/me/:id": 'Admin/AuthController.getMyData'
};