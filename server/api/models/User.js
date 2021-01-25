module.exports = {
    tableName: 'User',
    schema: true,
    attributes: {
        firstName: {
            type: 'string',
            // required: true
        },

        lastName: {
            type: 'string',
            // required: true
        },

        name: { type: 'string' },

        dob: { type: 'string' },

        loginCodeVerification: {
            type: 'json',
            description: {
                token: { type: 'string' },
                expireTime: { type: 'datetime' }
            }
        },

        mobiles: {
            type: 'json',
            columnType: 'array',
            // required: true,
            description: {
                mobile: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                countryCode: { type: 'string' },
                isPrimary: { type: 'boolean' },
                verification: {
                    type: 'json',
                    description: {
                        token: { type: 'string' },
                        expireTime: { type: 'datetime' }
                    }
                },
                isVerified: { type: 'boolean' },
                isoCode: { type: 'string' }
            }
        },

        emails: {
            type: 'json',
            columnType: 'array',
            // required: true,
            description: {
                email: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                isPrimary: { type: 'boolean' },
                verification: {
                    type: 'json',
                    description: {
                        token: {
                            type: 'string',
                            required: true,
                            unique: true
                        },
                        expireTime: { type: 'datetime' }
                    }
                },
                isVerified: { type: 'boolean' }
            }
        },

        parentId: { model: 'user' },

        type: {
            type: 'number',
            extendedDescription: sails.config.USER.TYPE,
            defaultsTo: sails.config.USER.TYPE.CUSTOMER
        },

        username: { type: 'string' },

        password: {
            type: 'string',
            // required: true
        },

        addresses: {
            type: 'json',
            columnType: 'array',
            description: {
                id: { type: 'string' },
                type: { type: 'string' },
                line1: { type: 'string' },
                line2: { type: 'string' },
                country: { type: 'string' },
                state: { type: 'string' },
                city: { type: 'string' },
                pinCode: { type: 'string' }
            }
        },

        documents: {
            type: 'json',
            columnType: 'object',
            description: {
                drivingLicence: {
                    type: 'json',
                    columnType: 'object',
                    description: {
                        path: { type: 'string' },
                        backPath: { type: 'string' },
                        number: { type: 'string' },
                        imageStatus: {
                            type: 'number',
                            defaultsTo: 0
                        },
                        numberStatus: {
                            type: 'number',
                            defaultsTo: 0
                        },
                        selfie: { type: 'string' },
                        selfieStatus: {
                            type: 'number',
                            defaultsTo: 0
                        },
                        isApproved: {
                            type: 'boolean',
                            defaultsTo: false
                        },
                        validity: { type: 'string' },
                        state: { type: 'string' }
                    }
                }
            }
        },

        image: { type: 'string', allowNull: true },

        facebookAuthId: { type: 'string' },

        googleAuthId: { type: 'string' },

        appleAuthId: { type: 'string' },

        androidPlayerId: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' },
            defaultsTo: null
        },

        iosPlayerId: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' },
            defaultsTo: null
        },

        cards: {
            type: 'json',
            columnType: 'array',
            description: {
                first4: {
                    type: 'number',
                    example: 1234
                },
                last4: {
                    type: 'number',
                    example: 1234
                },
                expMonth: {
                    type: 'number',
                    example: 1
                },
                expYear: {
                    type: 'number',
                    example: 2021
                },
                brand: {
                    type: 'number',
                    example: 'Visa'
                },
                cardToken: {
                    type: 'number',
                    example: 'Visa'
                },
                isPrimary: { type: 'boolean' }
            }
        },

        bankAccountDetails: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            description: {
                accountNumber: {
                    type: 'string',
                    example: '000123456789'
                },
                accountHolderName: {
                    type: 'string',
                    example: 'John Doe'
                },
                routingNumber: { type: 'string' },
                bankId: { type: 'string' },
                isPrimary: { type: 'boolean' }
            }
        },

        isActive: {
            type: 'boolean',
            defaultsTo: true
        },

        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },

        roles: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' }
        },

        accessPermission: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'object' }
        },

        resetPasswordLink: {
            type: 'json',
            description: {
                code: { type: 'string' },
                expireTime: { type: 'datetime' }
            }
        },

        // connectedSockets: {
        //     type: 'json',
        //     columnType: 'array',
        //     description: { fieldType: 'string' }
        // },

        stripeCustomerId: { type: 'string' },
        alloCustomerId: { type: 'string' },

        loginToken: { type: 'string' },
        preferredLang: { type: 'string' },
        gender: { type: 'number' },
        identifier: {
            type: 'string',
            unique: true
        },
        rideSummary: {
            type: 'json',
            columnType: 'object',
            description: {
                reserved: { type: 'number' },
                paused: { type: 'number' },
                late: { type: 'number' },
                booked: { type: 'number' },
                cancelled: { type: 'number' },
                completed: { type: 'number' },
                reservedTime: { type: 'number' },
                pausedTime: { type: 'number' },
                lateTime: { type: 'number' },
                distance: { type: 'number' },
                time: { type: 'number' }
            }
        },
        fareSummary: {
            type: 'json',
            columnType: 'object',
            description: {
                reserved: { type: 'number' },
                paused: { type: 'number' },
                late: { type: 'number' },
                cancelled: { type: 'number' },
                distance: { type: 'number' },
                time: { type: 'number' },
                subTotal: { type: 'number' },
                tax: { type: 'number' },
                total: { type: 'number' }
            }
        },
        cpfNumber: { type: 'string' },
        walletAmount: {
            type: 'number',
            defaultsTo: 0
        },
        activationDate: { type: 'string' }, // for franchisee
        designation: { type: 'string' },
        companyName: { type: 'string' },
        inviteCode: {
            type: 'string',
            allowNull: true
        },
        referralCode: {
            type: 'string',
            allowNull: true
        },
        senderReferralCode: {
            type: 'string'
        },
        referralType: {
            type: 'number'
        },
        referralBenefitType: {
            type: 'number'
        },
        uniqueIdentityNumber: { type: 'string' },
        franchiseeCountryId: { type: 'string' },
        franchiseeStateId: { type: 'string' },
        franchiseeId: { model: 'user' },
        seriesCode: { type: 'string' },
        franchiseeCityId: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' }
        },
        currentBookingPlanInvoiceId: { model: 'PlanInvoice' },
        isBookingTrialPlanUsed: {
            type: 'boolean',
            defaultsTo: false
        },
        nextBookingPlanInvoiceId: { model: 'PlanInvoice' },
        isGuestUser: {
            type: 'boolean',
            defaultsTo: true
        },
        paytmTransactionCount: {
            type: 'number',
            defaultsTo: 0
        },
        level: {
            type: 'number' //Feeder level
        },
        dealerId: {
            model: 'user'
        },
        franchiseeId: {
            model: 'user'
        },
        fleetType: {
            type: 'number',
            description: sails.config.USER.FLEET_TYPE
        },
        addedDealers: {
            type: "json",
            columnType: 'array',
            defaultsTo: [],
            description: {
                dealerId: { type: "string" },
                fleetType: { type: "number" }
            }
        },
        addedFranchisees: {
            type: "json",
            columnType: 'array',
            defaultsTo: [],
            description: {
                franchiseeId: { type: "string" },
                fleetType: { type: "number" }
            }
        },
        primaryLoggedInType: {
            type: 'number',
            description: [
                sails.config.USER_LOGIN_TYPE_EMAIL,
                sails.config.USER_LOGIN_TYPE_MOBILE
            ]
        },
        paytmWalletBalanceCount: {
            type: 'number',
            defaultsTo: 0
        },
        drivingLicenceNumberCount: {
            type: 'number',
            defaultsTo: 0
        },
        drivingLicenceNumberStatusTrack: {
            type: 'json',
            columnType: 'object',
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                count: { type: 'integer' }
            }
        },
        drivingLicenceImageCount: {
            type: 'number',
            defaultsTo: 0
        },
        drivingLicenceImageStatusTrack: {
            type: 'json',
            columnType: 'object',
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                count: { type: 'integer' }
            }
        },
        drivingLicenceSelfieCount: {
            type: 'number',
            defaultsTo: 0
        },
        drivingLicenceSelfieStatusTrack: {
            type: 'json',
            columnType: 'object',
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                count: { type: 'integer' }
            }
        },
        selfieVerificationDetails: {
            type: 'json',
            columnType: 'object',
            description: {
                isMatch: { type: 'integer' },
                matchScore: { type: 'boolean' },
                faceLiveness: { type: 'string' }
            }
        },
        qatarLicenceId: {
            type: 'string'
        },
        feederCompanyName: { type: 'string' },
        feederId: { model: 'User' },
        customerId: { model: 'User' },
        isAgreementAccepted: {
            type: 'boolean',
            defaultsTo: false
        },
        currentBookingPassIds: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            description: {},
        },
        isStripeModificationDone: {
            type: 'boolean',
            defaultsTo: false,
        },
        clientIp: { type: 'string' },
        referralLink: { type: 'string' },
        isRegisteredFirstTime: { type: 'boolean' },
        isReferralBenefitAdd: { type: 'boolean' }
    },
    customToJSON: function () {
        return _.omit(this, ['password']);
    }
};
