import { FRANCHISEE_LABEL, FRANCHISEE_ROUTE, DEALER_LABEL, DEALER_ROUTE } from './Setup';
import { PAGE_PERMISSION } from './PagePermission';
import { RIDER_ROUTE, RIDER_LABEL, FEEDER_LABEL, FEEDER_ROUTE, SUBSCRIPTION_ROUTE, SUBSCRIPTION_LABEL, BOOKING_PASS_LABEL, BOOKING_PASS_ROUTE } from './Setup';
import IntlMessages from '../util/IntlMessages';
import React from 'react'

export const MENU = [
    {
        name: <IntlMessages id="app.dashboard.dashboard" />,
        id: PAGE_PERMISSION.DASHBOARD,
        path: '/e-scooter/dashboard',
        svg: 'Dashboard',
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.users" />,
        path: '/e-scooter/users',
        id: PAGE_PERMISSION.USERS,
        icon: "team"
    },
    {
        name: RIDER_LABEL,
        id: PAGE_PERMISSION.RIDERS,
        path: `/e-scooter/${RIDER_ROUTE}`,
        svg: "Vehicle",
        icon: "desktop"
    },
    {
        name: FRANCHISEE_LABEL,
        id: PAGE_PERMISSION.FRANCHISEE,
        path: `/e-scooter/${FRANCHISEE_ROUTE}`,
        svg: "Partner",
        icon: 'desktop'
    },
    {
        name: DEALER_LABEL,
        id: PAGE_PERMISSION.DEALER,
        path: `/e-scooter/${DEALER_ROUTE}`,
        svg: "Partner",
        icon: 'desktop'
    },
    {
        name: FEEDER_LABEL,
        id: PAGE_PERMISSION.FEEDER,
        path: `/e-scooter/${FEEDER_ROUTE}`,
        icon: "team"
    },
    {
        name: <IntlMessages id="app.vehicles" />,
        id: PAGE_PERMISSION.VEHICLES,
        path: '/e-scooter/vehicle',
        svg: 'Vehicle',
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.rides" />,
        path: '/e-scooter/rides',
        svg: 'Vehicle',
        id: PAGE_PERMISSION.RIDES,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.zone.geoLocation" />,
        id: PAGE_PERMISSION.GEO_LOCATION,
        path: "/e-scooter/geo-location",
        icon: "environment"
    },
    {
        name: <IntlMessages id="app.sidebar.payment" />,
        id: PAGE_PERMISSION.PAYMENT,
        svg: 'Payment',
        path: '/e-scooter/payment',
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.dispute" />,
        id: PAGE_PERMISSION.DISPUTE,
        path: '/e-scooter/ride-dispute',
        svg: 'Dispute',
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.notifications" />,
        id: PAGE_PERMISSION.NOTIFICATIONS,
        path: '/e-scooter/notification',
        svg: 'Notifications',
        icon: 'desktop'
    },

    {
        name: <IntlMessages id="app.staticpage.staticPage" />,
        path: '/e-scooter/static-page',
        id: PAGE_PERMISSION.STATIC_PAGE,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.communityMode" />,
        path: '/e-scooter/community-mode',
        id: PAGE_PERMISSION.COMMUNITY_MODE,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.tasks" />,
        path: '/e-scooter/task-setup',
        id: PAGE_PERMISSION.TASKSETUP,
        icon: 'desktop'
    },
    {
        name: SUBSCRIPTION_LABEL,
        path: `/e-scooter/${SUBSCRIPTION_ROUTE}`,
        svg: "Vehicle",
        id: PAGE_PERMISSION.SUBSCRIPTION,
        icon: "desktop"
    },
    {
        name: BOOKING_PASS_LABEL,
        path: `/e-scooter/${BOOKING_PASS_ROUTE}`,
        svg: "Vehicle",
        id: PAGE_PERMISSION.BOOKING_PASS,
        icon: "desktop"
    },
    {
        name: <IntlMessages id="app.sidebar.promotions" />,
        path: "/e-scooter/promocode",
        id: PAGE_PERMISSION.PROMOTIONS,
        icon: "desktop"
    },
    {
        name: <IntlMessages id="app.sidebar.rentals" />,
        path: "/e-scooter/rental",
        // svg: "Vehicle",
        id: 83,
        icon: "desktop"
    },
    // {
    //     name: 'Task',
    //     path: '/e-scooter/task',
    //     id: 58,
    //     icon: 'desktop',
    // },
    {
        name: <IntlMessages id="app.sidebar.feedback" />,
        path: '/e-scooter/feedback',
        id: PAGE_PERMISSION.FEEDBACK,
        icon: 'solution'
    },
    {
        name: <IntlMessages id="app.dispute.serviceRequest" />,
        path: '/e-scooter/service-request',
        id: PAGE_PERMISSION.SERVICE_REQUEST,
        icon: 'desktop'
    },
    // {
    //     name: 'Heat Map',
    //     id: 3,
    //     path: '/e-scooter/heatmap',
    //     icon: 'desktop'
    // },
    // {
    //     name: 'Analytics',
    //     id: 5,
    //     path: '/e-scooter/analytics',
    //     icon: 'desktop'
    // },
    // {
    //     name: 'Contact',
    //     id: 7,
    //     path: '/e-scooter/contact',
    //     icon: 'desktop'
    // },
    {
        name: <IntlMessages id="app.payment.commission" />,
        path: '/e-scooter/commission',
        id: PAGE_PERMISSION.COMMISSION,
        icon: 'desktop'
    },
    // {
    //     name: 'Commission Payout',
    //     path: '/e-scooter/commission-payout',
    //     id: 92,
    //     icon: 'desktop'
    // },
    {
        name: <IntlMessages id="app.sidebar.abountUs" />,
        path: '/e-scooter/about-us',
        id: PAGE_PERMISSION.ABOUT_US,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.privacyPolicy" />,
        path: '/e-scooter/privacy-policy',
        id: PAGE_PERMISSION.PRIVACY_POLICY,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.termsAndCondition" />,
        path: '/e-scooter/terms-and-conditions',
        id: PAGE_PERMISSION.TERMS_AND_CONDITIONS,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.support" />,
        path: '/e-scooter/contact-us',
        id: PAGE_PERMISSION.CONTACT_US,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.commissionReport" />,
        path: '/e-scooter/commission-report',
        id: PAGE_PERMISSION.COMMISSION_REPORT,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.referralCode" />,
        id: PAGE_PERMISSION.REFERRAL_CODE,
        path: "/e-scooter/referral-code",
        svg: 'Payment',
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.generalSettings" />,
        id: PAGE_PERMISSION.GENERAL_SETTINGS,
        path: "/e-scooter/general-settings",
        icon: "setting"
    }

];
export const COMMISSION_SUBMENU = [
    {
        name: <IntlMessages id="app.sidebar.structure" />,
        path: '/e-scooter/commission',
        id: PAGE_PERMISSION.COMMISSION,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.payout" />,
        path: '/e-scooter/commission-payout',
        id: PAGE_PERMISSION.COMMISSION_PAYOUT,
        icon: 'desktop'
    },
];
export const RENTAL_SUBMENU = [
    {
        name: <IntlMessages id="app.sidebar.structure" />,
        path: '/e-scooter/rental',
        id: PAGE_PERMISSION.RENTAL,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.payment.payments" />,
        path: '/e-scooter/rental-payment',
        id: PAGE_PERMISSION.RENTAL_PAYMENT,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.clientPayments" />,
        path: '/e-scooter/client-payments',
        id: PAGE_PERMISSION.RENTAL_PAYMENT_CLIENT,
        icon: 'desktop'
    },
];
export const TASK_SUBMENU = [
    {
        name: <IntlMessages id="app.sidebar.formSetup" />,
        path: '/e-scooter/task-setup',
        id: PAGE_PERMISSION.TASKSETUP,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.taskList" />,
        path: '/e-scooter/task-list',
        id: PAGE_PERMISSION.CREATE_TASK,
        icon: 'desktop'
    },
];
export const COMMUNITY_MODE_SUBMENU = [
    // {
    //     name: <IntlMessages id="app.sidebar.formSetup" />,
    //     path: '/e-scooter/community-mode',
    //     id: PAGE_PERMISSION.COMMUNITY_MODE,
    //     icon: 'desktop'
    // },
    {
        name: <IntlMessages id="app.sidebar.vehicleReport" />,
        path: '/e-scooter/vehicle-report',
        id: PAGE_PERMISSION.VEHICLE_REPORT,
        icon: 'desktop'
    },
];
export const SETUP_MODULES = [
    {
        name: <IntlMessages id="app.sidebar.master" />,
        path: '/e-scooter/master/main-master',
        componentName: 'Master',
        id: PAGE_PERMISSION.MASTER,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.dataBank" />,
        path: '/e-scooter/master/sub-master',
        componentName: 'SubMaster',
        id: PAGE_PERMISSION.DATABANK,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.location" />,
        path: '/e-scooter/location',
        id: PAGE_PERMISSION.LOCATION,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.rideSetting" />,
        path: '/e-scooter/ride-setting',
        id: PAGE_PERMISSION.RIDE_SETTING,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.cancellationReason" />,
        path: '/e-scooter/ride-cancellation-reason',
        componentName: 'RideCancellationReason',
        id: PAGE_PERMISSION.CANCELLATION_REASON,
        icon: 'icon icon-widgets'
    },
    {
        name: <IntlMessages id="app.sidebar.actionQuestionnaire" />,
        path: '/e-scooter/actionquestionnairemaster',
        componentName: 'ActionQuestionnaireMaster',
        id: PAGE_PERMISSION.ACTION_QUESTIONNAIRE,
        icon: 'icon icon-widgets'
    },
    {
        name: <IntlMessages id="app.sidebar.zone" />,
        path: '/e-scooter/zone',
        id: PAGE_PERMISSION.ZONES,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.fareManagement" />,
        path: '/e-scooter/fare-management',
        id: PAGE_PERMISSION.FARE_MANAGEMENT,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.procedure" />,
        path: '/e-scooter/procedure',
        id: PAGE_PERMISSION.PROCEDURE,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.version" />,
        path: '/e-scooter/version-apk',
        id: PAGE_PERMISSION.VERSION,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.faqs" />,
        path: '/e-scooter/faqs',
        id: PAGE_PERMISSION.FAQS,
        icon: 'desktop'
    },
    {
        name: <IntlMessages id="app.sidebar.walletConfig" />,
        path: '/e-scooter/wallet-config',
        id: PAGE_PERMISSION.WALLET_CONFIG,
        icon: 'desktop'
    }
];
