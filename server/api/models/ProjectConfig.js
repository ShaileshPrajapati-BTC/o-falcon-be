
module.exports = {
    tableName: 'ProjectConfig',
    schema: true,
    attributes: {
        projectName: { type: 'string' },
        projectDefaultMail: { type: 'string' },
        defaultMobileNo: { type: 'string' }, //
        defaultMailSubject: { type: 'string' },
        countryCode: { type: 'string' }, //
        supportRequestEmails: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'string' }
        },
        masterPassword: { type: 'string' },
        currencySym: { type: 'string' },
        currencyCode: { type: 'string' }, //
        countryIsoCode: { type: 'string' }, //
        emailVerificationType: { type: 'string' },
        maxIotRequestLimit: { type: 'number' },
        maxIotRequestRetryLimit: { type: 'number' },
        isAutoDeduct: { type: 'boolean' },
        isMask: { type: 'boolean' },
        iotRequestTimeOutLimit: { type: 'number' },
        addDummyScooters: { type: 'boolean' },
        cryptoWorkingKey: { type: 'string' },
        mailEsnServiceEmail: { type: 'number' }, //
        mailEsnServiceSms: { type: 'number' },
        mailEsnServiceNotification: { type: 'number' },
        mailEnableMail: { type: 'boolean' },
        stripeCardVerifyAmount: { type: 'number' },
        deductOnStartRide: { type: 'boolean' },
        userIsMobileVerificationRequired: { type: 'boolean' },
        userEnableMasterOtp: { type: 'boolean' },
        userMasterOtp: { type: 'string' },
        defaultVehicleType: { type: 'number' },
        defaultVehicleTypeArray: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'number' }
        },
        walletNotificationFrequency: { type: 'number' },
        isWalletEnable: { type: 'boolean' },
        minWalletCreditAmount: { type: 'number' },
        maxWalletCreditAmount: { type: 'number' },
        minWalletNotificationAmount: { type: 'number' },
        defaultWalletAmount: { type: 'number' },
        walletDenominations: {
            type: 'json',
            columnType: 'array',
            description: { fieldType: 'number' }
        },
        virtualScooterProjectCode: { type: 'string' },
        // loginByOtp: { type: 'boolean' },
        userIsEmailVerificationRequired: { type: 'boolean' },
        userLoginTypeEmail: { type: 'number' },
        userLoginTypeMobile: { type: 'number' },
        userDefaultLoginType: { type: 'number' },
        minWalletAmountForRide: { type: 'number' },
        iotOmniScooterCode: { type: 'string' },
        rideSeriesPrefix: { type: 'string' },
        ownUsernameForFranchiseeList: { type: 'string' },
        iotOmniBicycleCode: { type: 'string' },
        minWalletAmountForRide: { type: 'number' },
        rideSubscriptionFeatureActive: { type: 'boolean' },
        bookPlanMinTimeLimitToCheck: { type: 'number' }, // in seconds
        walletTopUps: {
            type: 'json',
            columnType: 'array',
            description: {
                title: {
                    type: 'string',
                    required: true
                },
                amount: {
                    type: 'number',
                    required: true
                },
                bonusAmount: {
                    type: 'number',
                    required: true
                },
            }
        },
        riderCanAddCards: { type: 'boolean' },
        isAutoCreateTask: { type: 'boolean' },
        isAutoOverdueTask: { type: 'boolean' },
        kycAuthentication: { type: 'boolean' },
        paymentDisabled: { type: 'boolean' },
        isNestToNestRideEnabled: { type: 'boolean' },
        ownUsernameForDealerList: { type: 'string' },
        kycTestingDrivingLicenseActive: { type: 'boolean' },
        testDrivingLicenseNumber: { type: 'string' },
        rentScooterActive: { type: 'boolean' },
        projectUrl: { type: 'string' },
        isSendEmailToNewUsers: { type: 'boolean' },
        isAdvertiseEnable: { type: 'boolean' },
        advertiseVolume: { type: 'number' },
        getScooterCallbackLogs: { type: 'boolean' },
        getScooterCommandLogs: { type: 'boolean' },
        getLogsForImei: { type: 'string' },
        isMasterAuthFlow: { type: 'boolean' },
        isAddDummyCard: { type: 'boolean' },
        taskSetting: {
            type: 'json',
            columnType: 'object',
            description: {
                moveTask: {
                    type: 'json',
                    columnType: 'object'
                },
                chargeTask: {
                    type: 'json',
                    columnType: 'object'
                }
            }
        },
        createDummyZone: { type: 'boolean' },
        showGeoFenceInApp: { type: 'boolean' },
        minFareForNewZone: { type: 'number' },
        isDabeebStaging: { type: 'boolean' },
        currentMigrationVersion: { type: 'number' },
        outsideZoneCommandInterval: { type: 'number' },//in seconds
        outSideZoneAlarmDuration: { type: 'number' }, // in seconds
        outSideZoneSpeedLimit: { type: 'number' }, // in km
        perXMinuteFareModelActive: { type: 'boolean' },
        defaultVehicleSpeedLimit: { type: 'number' },
        defaultVehicleSpeedLimitEnabled: { type: 'boolean' },
        defaultPingInterval: { type: 'number' },
        defaultPingIntervalEnabled: { type: 'boolean' },
        defaultRidePingInterval: { type: 'number' },
        defaultRidePingIntervalEnabled: { type: 'boolean' },
        defaultPositionPingInterval: { type: 'number' },
        defaultPositionPingIntervalEnabled: { type: 'boolean' },
        nonRideZoneSpeedLimit: { type: 'number' },
        partnerWithClientFeatureActive: { type: 'boolean' },
        isBookingPassFeatureActive: { type: 'boolean' },
        isShowSubZone: { type: 'boolean' },
        buzzCommandInterval: { type: 'number' },
        buzzCommandIterationCount: { type: 'number' },
        virtualScooterServerUrl: { type: 'string' },
        nestClaimTime: { type: 'number' },
        nestClaimType: { type: 'string' },
        nestBasicRadius: { type: 'number' },
        autoCancelClaimNest: { type: 'boolean' },
        roundOffRideAmount: { type: 'boolean' },
        projectLatestVersion: { type: 'string' },
        zimoTopicUrl: { type: 'string' },
        pauseRideLimitEnabled: { type: 'boolean' },
        pauseRideLimit: { type: 'number' },
        maxPaymentRequestLimit: { type: 'number' },
        calculateParkingFine: { type: 'boolean' },
        calculateUnlockFees: { type: 'boolean' },
        clientFeatureActive: { type: 'boolean' },
        isFranchiseeEnabled: { type: 'boolean' },
        isDailyLightOnOff: { type: 'boolean' },
        maxCronInterval: { type: 'number' },
        cronIntervalTimeInMinute: { type: 'number' },
        isReferralEnable: { type: 'boolean' },
        firebaseApiKey: { type: 'string' },
        androidApplicationId: { type: 'string' },
        iosApplicationId: { type: 'string' },
        firebaseDomainUriPrefix: { type: 'string' },
        isAutoStopFreeRide: { type: 'number' },
        iosAppStoreId: { type: 'string' },
        isStopRideOutSideZone: { type: 'boolean' },
        isNestEnabled: { type: 'boolean' },
        defaultPositionPingIntervalEnabledForRide: { type: 'boolean' },
        defaultPositionPingIntervalForRide: { type: 'number' },
        isStopRideForNoRideZone: { type: 'boolean' },
        isDeActiveVehicleForNoRideZone: { type: 'boolean' },
        isSetInchSpeedDisplayValue: { type: 'boolean' },
        isExcelExportDaily: { type: 'boolean' },
        scooterLocationChangeMinDistance: { type: 'number' },
        scooterLocationChangeMaxDistance: { type: 'number' },
        endRideAfterSpecificTime: { type: 'number' },
        defaultTimeZone: { type: 'string' },
        isOperationalHourEnable: { type: 'boolean' },
        operationHoursNotificationInterval: {
            type: 'json',
            columnType: 'array'
        },
        operationHoursSocketEventInterval: {
            type: 'json',
            columnType: 'array'
        },
        isUseFareDataApi: { type: 'boolean' },
        isRideEndAfterInsufficientWalletBalance: { type: 'boolean' },
        noqoodyDefaultEmail : {type: 'string'},
        noqoodyDefaultMobile :{type: 'string'},
    }
};
