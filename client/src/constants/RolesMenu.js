import { FRANCHISEE_LABEL_STRING, DEALER_LABEL_STRING } from "./Setup";
import { PAGE_PERMISSION } from './PagePermission';
import { NEST_LABEL_STRING, RIDER_LABEL_STRING, ZONE_LABEL_STRING, FEEDER_LABEL_STRING, SUBSCRIPTION_LABEL, BOOKING_PASS_LABEL } from './Setup';

export const PERMISSION_TYPE = {
    view: 'View',
    list: 'List',
    insert: 'Insert',
    update: 'Update',
    delete: 'Delete'
};
export const MENU_LIST_MODULES = [
    {
        module: PAGE_PERMISSION.DASHBOARD,
        name: 'Dashboard',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.GENERAL_SETTINGS,
        name: 'General Settings',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.GEO_LOCATION,
        name: 'Geo Location',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.USERS,
        name: 'Users',
        keys: ['name', 'emails'],
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.RIDERS,
        name: RIDER_LABEL_STRING,
        keys: ['name', 'emails'], //email
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.FRANCHISEE,
        name: FRANCHISEE_LABEL_STRING,
        keys: ['name', 'emails'], //email
        permissions: { list: true, view: true, insert: true, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.DEALER,
        name: DEALER_LABEL_STRING,
        keys: ['name', 'emails'], //email
        permissions: { list: true, view: true, insert: true, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.FEEDER,
        name: FEEDER_LABEL_STRING,
        keys: ['name', 'emails'], //email
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.VEHICLES,
        name: 'Vehicle',
        keys: ['type', 'registerId', 'name'],
        permissions: { list: true, view: true, insert: true, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.COMMUNITY_MODE,
        name: 'Community Mode',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.VEHICLE_REPORT,
        name: 'Vehicle Report',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.RIDES,
        name: 'Rides',
        keys: ['rideNumber', 'status'],         //iot command
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.SUBSCRIPTION,
        name: "Booking Plan",
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.RENTAL,
        name: 'Rental',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.RENTAL_PAYMENT,
        name: 'Rental Payment',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.RENTAL_PAYMENT_CLIENT,
        name: 'Client Payments',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.BOOKING_PASS,
        name: "Booking Pass",
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.PAYMENT,
        name: 'Payment',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.DISPUTE,
        name: 'Dispute',
        keys: ['uniqNumber', 'rideId.rideNumber'],
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.NOTIFICATIONS,
        name: 'Notifications',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.FAQS,
        name: 'FAQs',
        keys: ['question'],
        permissions: { list: true, view: false, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.STATIC_PAGE,
        name: 'Static Page',
        permissions: { list: true, view: true, insert: false, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.FEEDBACK,
        name: 'Feedback',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.MASTER,
        name: 'Master',
        keys: ['code'],
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.DATABANK,
        name: 'Data Bank',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.RIDE_SETTING,
        name: 'Ride Setting',
        permissions: { list: true, view: false, insert: false, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.SUPPORT,
        name: 'Support Information',
        permissions: { list: true, view: false, insert: false, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.CANCELLATION_REASON,
        name: 'Cancellation Reason',
        keys: ['reason'],
        permissions: { list: true, view: false, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.ACTION_QUESTIONNAIRE,
        name: 'Action Questionnaire',
        keys: ['question'],
        permissions: { list: true, view: false, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.ZONES,
        name: ZONE_LABEL_STRING,
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.NEST,
        name: NEST_LABEL_STRING,
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.TASKSETUP,
        name: 'Task Setup',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.CREATE_TASK,
        name: 'Create task',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.FARE_MANAGEMENT,
        name: 'Fare Management',
        permissions: { list: true, view: false, insert: true, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.PROCEDURE,
        name: 'Procedure',
        keys: ['name'],
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.PROMOTIONS,
        name: 'Promotions',
        keys: ['name', 'code'],
        permissions: { list: true, view: true, insert: true, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.VERSION,
        name: 'Version',
        permissions: { list: true, view: false, insert: true, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.ROLES,
        name: 'Roles',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.LOCATION,
        name: 'Location',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.SERVICE_REQUEST,
        name: 'Service Request',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.COMMISSION,
        name: 'Commission',
        permissions: { list: true, view: true, insert: false, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.COMMISSION_PAYOUT,
        name: 'Commission Payout',
        permissions: { list: true, view: true, insert: true, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.PRIVACY_POLICY,
        name: 'Privacy Policy',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.TERMS_AND_CONDITIONS,
        name: 'T&C',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.ABOUT_US,
        name: 'About Us',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.CONTACT_US,
        name: 'Contact Us',
        permissions: { list: true, view: false, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.COMMISSION_REPORT,
        name: 'Commission Report',
        permissions: { list: true, view: true, insert: false, update: false, delete: false }
    },
    {
        module: PAGE_PERMISSION.WALLET_CONFIG,
        name: 'Wallet Config',
        permissions: { list: true, view: false, insert: false, update: true, delete: false }
    },
    {
        module: PAGE_PERMISSION.REFERRAL_CODE,
        name: 'Referral Code',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    },
    {
        module: PAGE_PERMISSION.OPERATIONAL_HOURS,
        name: 'Operational Hours',
        permissions: { list: true, view: true, insert: true, update: true, delete: true }
    }
];
