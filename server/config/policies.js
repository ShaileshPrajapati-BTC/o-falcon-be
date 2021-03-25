/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
    /* **************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions, unless overridden.       *
     * (`true` allows public access)                                            *
     *                                                                          *
     ***************************************************************************/

    // '*': true,
    /* *******************************************
     * Master                                   *
     ******************************************* */

    'Admin/MasterController': {
        '*': ['hasToken'],
        'listByCode': ['manageRole'],
        'listBySearch': ['manageRole']
    },

    'Admin/Common/CommonController': {
        '*': ['hasToken'],
        isDefalutBooleanStatusUpdate: ['manageRole'],
        booleanStatusUpdate: ['manageRole'],
        deleteRecord: ['hasBasicToken']
    },
    'Admin/Common/DeleteDependencyController': {
        '*': ['hasToken']
    },
    'Admin/Common/CountryController': {
        '*': ['hasToken']
    },
    'Admin/Common/StateController': {
        '*': ['hasToken']
    },
    'Admin/Common/CityController': {
        '*': ['hasToken']
    },
    /* *******************************************
     * Master                                   *
     ******************************************* */
    'Admin/UserController': {
        '*': ['manageRole']
    },
    'Admin/VehicleController': {
        '*': ['hasToken'],
        update: ['manageRole'],
        paginate: ['manageRole'],
        view: ['manageRole'],
        detailView: ['manageRole'],
        getChartData: ['manageRole'],
        getConnectionStatus: ['manageRole'],
        getLocationStatus: ['manageRole'],
        getUnassignedVehicle: ['manageRole'],
        vehicleDetailIotLogTrack: ['manageRole'],
        vehicleDetailLastRides: ['manageRole'],
        activeDeactive: ['manageRole']
    },
    'Admin/CancellationReasonController': {
        '*': ['hasBasicToken']
    },
    'Admin/ProcedureController': {
        '*': ['hasToken']
    },
    'Admin/RideComplaintDisputeController': {
        '*': ['manageRole']
    },
    'Admin/': {
        '*': ['hasToken']
    },
    'Admin/AuthController': {
        passwordUpdateByUser: ['hasToken']
    },
    'Admin/ZoneController': {
        '*': ['hasToken'],
        add: ['manageRole'],
        update: ['manageRole'],
        zoneList: ['manageRole'],
        paginate: ['manageRole'],
        view: ['manageRole'],
        delete: ['manageRole']
    },
    'Admin/FareManagementController': {
        '*': ['manageRole'],
    },
    'Admin/ContactUsController': {
        '*': ['hasToken']
    },

    'Admin/TodoController': {
        '*': ['hasToken']
    },
    'Admin/IotController': {
        '*': ['manageRole']
    },

    'Admin/ProjectSetupConfigController': {
        '*': ['hasToken']
    },

    'Admin/PromoCodeController': {
        '*': ['hasBasicToken']
    },
    'Admin/ActionQuestionnaireMasterController': {
        '*': ['hasBasicToken'],
        'listByCode': ['manageRole']
    },
    'Admin/FranchiseeController': {
        '*': ['hasToken']
    },
    'Admin/CommissionController': {
        '*': ['hasToken'],
        paginate: ['manageRole'],
    },
    'Admin/CommissionPayoutController': {
        '*': ['hasToken'],
        paginate: ['manageRole'],
        requestCommissionPayout: ['manageRole'],
        getPendingCommission: ['manageRole'],
        addCommissionPayout: ['manageRole']
    },
    'Admin/LocationController': {
        '*': ['hasToken'],
        paginate: ['manageRole']
    },
    'Admin/RideBookingController': {
        paginate: ['manageRole'],
        chargeCustomerForRide: ['hasToken']
    },
    'Admin/NotificationController': {
        '*': ['manageRole']
    },
    'Admin/PaymentController': {
        '*': ['manageRole'],
        userBankAccount: ['manageRole'],
        handleStripeAccounts: ['hasToken'],
        emptyStripeIds: ['hasToken']
    },
    'Admin/DashboardController': {
        '*': ['manageRole']
    },
    'Admin/DocumentController': {
        '*': ['manageRole']
    },
    'Admin/WalletController': {
        '*': ['hasToken']
    },
    'Admin/BookPlanController': {
        '*': ['hasToken']
    },
    'Admin/RentController': {
        '*': ['customManageRole'],
    },
    'Admin/RentPaymentController': {
        '*': ['hasBasicToken'],
    },
    'Admin/TaskFormSettingController': {
        '*': ['hasToken']
    },
    'Admin/TaskController': {
        '*': ['hasToken']
    },
    'Admin/ReportFormSettingController': {
        '*': ['hasToken']
    },
    'Admin/ReportCategoryController': {
        '*': ['hasToken']
    },
    'Admin/ReportController': {
        '*': ['hasToken']
    },
    'Admin/DealerController': {
        register: ['manageRole'],
        assignVehicle: ['manageRole'],
        paginate: ['manageRole'],
        view: ['manageRole'],
        retainVehicle: ['manageRole'],
        getVehicleOfDealer: ['manageRole']
    },
    'Admin/NestController': {
        '*': ['hasToken']
    },
    'Admin/StaticPageController': {
        '*': ['hasBasicToken']
    },
    'Admin/FeedbackController': {
        '*': ['manageRole']
    },
    'Admin/ContactUsSettingController': {
        '*': ['hasBasicToken']
    },
    'Admin/FeederController': {
        '*': ['hasToken']
    },
    'Admin/BookingPassController': {
        '*': ['hasToken']
    },
    'Admin/Common/ReferralSettingController': {
        '*': ['hasToken']
    },
    'Admin/DeveloperController': {
        '*': ['hasToken']
    },

    'Admin/OperationalHours': {
        '*': ['hasToken']
    },


    'Device/V1/CommonController': {
        sync: ['hasDeviceToken']
    },
    'Device/V1/CustomerController': {
        paginate: ['hasDeviceToken'],
        view: ['hasDeviceToken'],
        update: ['hasDeviceToken'],
        sync: ['hasDeviceToken'],
        serviceSync: ['hasDeviceToken'],
        notificationIdentifierUpsert: ['hasDeviceToken'],
        passwordUpdateByUser: ['hasDeviceToken'],
        customerSummary: ['hasDeviceToken'],
        verifyDrivingLicence: ['hasDeviceToken'],
        sendUpdateReverificationOtp: ['hasDeviceToken'],
        verifyUpdateUserOtp: ['hasDeviceToken'],
    },
    'Device/V1/NotificationController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/StripeController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/FeedbackController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/FaqsController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/RideComplaintDisputeController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/RatingReviewController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/RideBookingController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/ContactUsController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/PromoCodeController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/WalletController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/BookPlanController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/ReportController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/Feeder/ReportController': {
        '*': ['hasFeederToken']
    },
    'Device/V1/Feeder/TaskController': {
        '*': ['hasFeederToken']
    },
    'Device/V1/CountryController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/StateController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/CityController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/Feeder/CustomerController': {
        paginate: ['hasFeederToken'],
        view: ['hasFeederToken'],
        update: ['hasFeederToken'],
        sync: ['hasFeederToken'],
        notificationIdentifierUpsert: ['hasFeederToken'],
        feederSummary: ['hasFeederToken'],
        sendUpdateReverificationOtp: ['hasDeviceToken'],
        verifyUpdateUserOtp: ['hasDeviceToken'],
    },
    'Device/V1/BookingPassController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/FeederController': {
        update: ['hasToken'],
        sync: ['hasToken'],
        notificationIdentifierUpsert: ['hasToken'],
        feederSummary: ['hasToken']
    },
    'Device/V1/NestController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/ReferralBenefitController': {
        '*': ['hasDeviceToken']
    },
    'Device/V1/UserCardController': {
        '*': ['hasDeviceToken']
    },
};
