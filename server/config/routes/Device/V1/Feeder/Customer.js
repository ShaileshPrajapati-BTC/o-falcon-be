module.exports.routes = {
    "PUT /api/v1/feeder/update-profile": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "update",
        swagger: {
            summary: "",
            description: "",
            body: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                emails: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            email: { type: "string" },
                            isPrimary: { type: "boolean" },
                            id: { type: "string" },
                        },
                    },
                },
                mobiles: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            mobile: { type: "string" },
                            countryCode: { type: "string" },
                            isPrimary: { type: "boolean" },
                            id: { type: "string" },
                        },
                    },
                },
                addresses: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            line1: { type: "string" },
                            line2: { type: "string" },
                            city: { type: "string" },
                            state: { type: "string" },
                            country: { type: "string" },
                            rawAddress: { type: "string" },
                            pincode: { type: "string" },
                            location: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    coordinates: {
                                        type: "array",
                                        items: { type: "number" },
                                    },
                                },
                            },
                        },
                    },
                },
                image: { type: "string" },
                dob: {
                    type: "string",
                    description: "MM-DD-YYYY",
                },
            },
        },
    },
    "POST /api/v1/feeder/login": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "login",
        swagger: {
            summary: "login customer",
            description: "login via email/mobile",
            body: {
                username: {
                    type: "string",
                    required: true,
                },
                loginType: {
                    type: "number",
                    required: true,
                    description: "EMAIL: 1, MOBILE: 2",
                },
            },
        },
    },
    "POST /api/v1/feeder/logout": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "logout",
        swagger: {
            summary: "logout cleaner",
            description: "logout",
            body: {},
        },
    },
    "POST /api/v1/feeder/social-auth": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "socialAuth",
        swagger: {
            summary: "login customer",
            description: "login via email/mobile",
            body: {
                facebookAuthId: { type: "string" },
                googleAuthId: { type: "string" },
                image: { type: "string" },
                displayName: {
                    type: "string",
                    required: true,
                },
                name: {
                    type: "object",
                    properties: {
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                    },
                },
                email: {
                    type: "string",
                    required: true,
                },
                mobile: { type: "string" },
                photos: {
                    type: "array",
                    properties: { value: { type: "string" } },
                },
            },
        },
    },
    "POST /api/v1/feeder/sync": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "sync",
        swagger: {
            summary: "",
            description: "",
            body: {
                lastSyncDate: {
                    type: "string",
                    required: true,
                },
            },
        },
    },
    "POST /api/v1/feeder/upsert-playerId": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "notificationIdentifierUpsert",
        swagger: {
            summary: "upsert playerId",
            description:
                "for device push notification send `playerid` and `devicetype`  in header, devicetype = ANDROID:2, IPHONE:3",
            body: {},
        },
    },
    "POST /api/v1/feeder/check-social-auth": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "checkSocialAuth",
        swagger: {
            summary: "login customer",
            description: "login via email/mobile",
            body: {
                facebookAuthId: { type: "string" },
                googleAuthId: { type: "string" },
                email: { type: "string" },
            },
        },
    },
    "POST /admin/v1/feeder/summary": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "feederSummary",
        swagger: {
            summary: "get feeder ride and fare summary",
            description: "get feeder ride and fare summary",
            body: {},
        },
    },
    "POST /api/v1/feeder/verify-master-login": {
        controller: "Device/V1/Feeder/CustomerController",
        action: "verifyMasterLogin",
        swagger: {
            summary: "Verify loginCodeVerification sent to mobile or email",
            description: "Verify loginCodeVerification sent to mobile or email",
            body: {
                token: {
                    type: "string",
                    required: true,
                    description: "OTP code",
                },
                username: {
                    type: "string",
                    required: true,
                },
            },
        },
    },

    'POST /api/v1/feeder/send-update-verification-otp': {
        controller: 'Device/V1/Feeder/CustomerController',
        action: 'sendUpdateReverificationOtp'
    },
    'POST /api/v1/feeder/verify-update-verification-otp': {
        controller: 'Device/V1/Feeder/CustomerController',
        action: 'verifyUpdateUserOtp'
    }
};
