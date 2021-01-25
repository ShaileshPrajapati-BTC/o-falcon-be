module.exports.routes = {
    'POST /api/v1/customer/create': {
        controller: 'Device/V1/CustomerController',
        action: 'register',
        swagger: {
            summary: 'Create a new Customer',
            description: '',
            body: {
                firstName: {
                    type: 'string',
                    required: true
                },
                lastName: { type: 'string' },
                email: {
                    type: 'string',
                    required: true
                },
                countryCode: { type: 'string' },
                mobile: {
                    type: 'string',
                    required: true
                },
                dob: {
                    type: 'string',
                    required: true,
                    description: 'MM-DD-YYYY'
                },
                password: {
                    type: 'string',
                    required: true
                },
                address: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        mobile: { type: 'string' },
                        type: { type: 'string' },
                        line1: { type: 'string' },
                        line2: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        country: { type: 'string' },
                        pincode: { type: 'string' }
                    }
                },
                uniqueIdentityNumber: {
                    type: "string"
                }
            }
        }
    },
    'POST /api/v1/customer/paginate': {
        controller: 'Device/V1/CustomerController',
        action: 'paginate',
        swagger: {
            summary: '',
            description: '',
            body: {
                page: { type: 'number' },
                limit: { type: 'number' }
            }
        }
    },
    'GET /api/v1/customer/:id': {
        controller: 'Device/V1/CustomerController',
        action: 'view',
        swagger: {
            summary: '',
            description: '',
            body: {}
        }
    },
    'PUT /api/v1/customer/update-profile': {
        controller: 'Device/V1/CustomerController',
        action: 'update',
        swagger: {
            summary: '',
            description: '',
            body: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                emails: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            email: { type: 'string' },
                            isPrimary: { type: 'boolean' },
                            id: { type: 'string' }
                        }
                    }
                },
                mobiles: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            mobile: { type: 'string' },
                            countryCode: { type: 'string' },
                            isPrimary: { type: 'boolean' },
                            id: { type: 'string' }
                        }
                    }
                },
                addresses: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            line1: { type: 'string' },
                            line2: { type: 'string' },
                            city: { type: 'string' },
                            state: { type: 'string' },
                            country: { type: 'string' },
                            rawAddress: { type: 'string' },
                            pincode: { type: 'string' },
                            location: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string' },
                                    coordinates: {
                                        type: 'array',
                                        items: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                },
                image: { type: 'string' },
                dob: {
                    type: 'string',
                    description: 'MM-DD-YYYY'
                },
                uniqueIdentityNumber: { type: 'string'}
            }
        }
    },
    'POST /api/v1/customer/login': {
        controller: 'Device/V1/CustomerController',
        action: 'login',
        swagger: {
            summary: 'login customer',
            description: 'login via email/mobile',
            body: {
                username: {
                    type: 'string',
                    required: true
                },
                loginType: {
                    type: 'number',
                    required: true,
                    description: 'EMAIL: 1, MOBILE: 2'
                }
            }
        }
    },
    'POST /api/v1/customer/logout': {
        controller: 'Device/V1/CustomerController',
        action: 'logout',
        swagger: {
            summary: 'logout cleaner',
            description: 'logout',
            body: {}
        }
    },
    'POST /api/v1/customer/social-auth': {
        controller: 'Device/V1/CustomerController',
        action: 'socialAuth',
        swagger: {
            summary: 'login customer',
            description: 'login via email/mobile',
            body: {
                facebookAuthId: { type: 'string' },
                googleAuthId: { type: 'string' },
                image: { type: 'string' },
                displayName: {
                    type: 'string',
                    required: true
                },
                name: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' }
                    }
                },
                email: {
                    type: 'string',
                    required: true
                },
                mobile: { type: 'string' },
                photos: {
                    type: 'array',
                    properties: { value: { type: 'string' } }
                }
            }
        }
    },
    'POST /api/v1/customer/forgot-password': {
        controller: 'Device/V1/CustomerController',
        action: 'forgotPassword',
        swagger: {
            summary: '',
            description: '',
            body: {
                email: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'GET /api/v1/customer/verify-email/:token': {
        controller: 'Device/V1/CustomerController',
        action: 'verifyEmail',
        swagger: {
            summary: '',
            description: '',
            body: {}
        }
    },
    'POST /api/v1/customer/verify-mobile': {
        controller: 'Device/V1/CustomerController',
        action: 'verifyMobile',
        swagger: {
            summary: '',
            description: '',
            body: {
                token: {
                    type: 'string',
                    required: true,
                    description: 'OTP code'
                },
                mobile: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/validate-reset-password-otp': {
        controller: 'Device/V1/CustomerController',
        action: 'validateResetPasswordOtp',
        swagger: {
            summary: '',
            description: '',
            body: {
                otp: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/reset-password': {
        controller: 'Device/V1/CustomerController',
        action: 'resetPassword',
        swagger: {
            summary: '',
            description: '',
            body: {
                token: {
                    type: 'string',
                    required: true
                },
                newPassword: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/update-password-by-user': {
        controller: 'Device/V1/CustomerController',
        action: 'passwordUpdateByUser',
        swagger: {
            summary: '',
            description: '',
            body: {
                newPassword: {
                    type: 'string',
                    required: true
                },
                currentPassword: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/email-verification': {
        controller: 'Device/V1/CustomerController',
        action: 'emailVerification',
        swagger: {
            summary: 'resend email verification',
            description: 'resend email verification',
            body: {
                email: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/mobile-verification-otp': {
        controller: 'Device/V1/CustomerController',
        action: 'mobileVerificationLink',
        swagger: {
            summary: 'send mobile verification otp',
            description: 'send mobile verification otp',
            body: {
                mobile: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/sync': {
        controller: 'Device/V1/CustomerController',
        action: 'sync',
        swagger: {
            summary: '',
            description: '',
            body: {
                lastSyncDate: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/service-sync': {
        controller: 'Device/V1/CustomerController',
        action: 'serviceSync',
        swagger: {
            summary: '',
            description: '',
            body: {
                lastSyncDate: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/upsert-playerId': {
        controller: 'Device/V1/CustomerController',
        action: 'notificationIdentifierUpsert',
        swagger: {
            summary: 'upsert playerId',
            description: 'for device push notification send `playerid` and `devicetype`  in header, devicetype = ANDROID:2, IPHONE:3',
            body: {}
        }
    },

    'POST /api/v1/customer/check-social-auth': {
        controller: 'Device/V1/CustomerController',
        action: 'checkSocialAuth',
        swagger: {
            summary: 'login customer',
            description: 'login via email/mobile',
            body: {
                facebookAuthId: { type: 'string' },
                googleAuthId: { type: 'string' },
                email: { type: 'string' }
            }
        }
    },

    'POST /admin/v1/customer/summary': {
        controller: 'Device/V1/CustomerController',
        action: 'customerSummary',
        swagger: {
            summary: 'get customer ride and fare summary',
            description: 'get customer ride and fare summary',
            body: {}
        }
    },
    'POST /api/v1/customer/send-login-otp': {
        controller: 'Device/V1/CustomerController',
        action: 'sendLoginOtp',
        swagger: {
            summary: 'send login otp',
            description: 'send login otp',
            body: {}
        }
    },
    'POST /api/v1/customer/verify-master-login': {
        controller: 'Device/V1/CustomerController',
        action: 'verifyMasterLogin',
        swagger: {
            summary: 'Verify loginCodeVerification sent to mobile or email',
            description: 'Verify loginCodeVerification sent to mobile or email',
            body: {
                token: {
                    type: 'string',
                    required: true,
                    description: 'OTP code'
                },
                username: {
                    type: 'string',
                    required: true
                }
            }
        }
    },

    'POST /api/v1/customer/verify-driving-licence': {
        controller: 'Device/V1/CustomerController',
        action: 'verifyDrivingLicence',
        swagger: {
            summary: 'User driving licence verification.',
            description: 'User driving licence verification.',
            body: {}
        }
    },

    'POST /api/v1/customer/send-update-verification-otp': {
        controller: 'Device/V1/CustomerController',
        action: 'sendUpdateReverificationOtp'
    },
    'POST /api/v1/customer/verify-update-verification-otp': {
        controller: 'Device/V1/CustomerController',
        action: 'verifyUpdateUserOtp'
    },

    'POST /api/v1/customer/location-update': {
        controller: 'Device/V1/CustomerController',
        action: 'locationUpdate'
    }
};
