import { ZONE_LABEL, FRANCHISEE_LABEL, NEST_LABEL, RIDER_LABEL, RIDER_ROUTE, FRANCHISEE_VISIBLE, DEALER_LABEL, PROMOCODE_WALLET_BALANCE_TYPE, FRANCHISEE_ROUTE, FEEDER_LABEL } from './Setup';
import IntlMessages from '../util/IntlMessages';
import React from 'react';

const _ = require("lodash");

export * from './Sidebar';
export * from './Setup';
export * from './RolesMenu';
export * from './PagePermission';
export * from './PricingPlanFilter';
export * from './GeneralSettingMenu';
export * from './IotButtons';
export * from './IotCommands';

export const PAGES_PERMISSION = {
    1: [1, 10, 2, 21, 33, 4, 53, 54, 57, 58, 6, 8],
    2: [1, 10, 2, 21, 33, 4, 53, 54, 57, 58, 6, 8],
    3: [1, 10, 2, 21, 33, 53, 54, 6, 8],
    4: [1, 10, 2, 33, 53, 54, 6, 8],
    5: [1, 10, 2, 21, 33, 4, 53, 54, 6, 8]
};
export const NAME_SORTER = (a, b, key) => {
    if (a[key] < b[key]) {
        return -1;
    }
    if (a[key] > b[key]) {
        return 1;
    }

    return 0;
};
export const USER_PATHS = `all|e-scooter-admin|sub-admin|staff|${RIDER_LABEL}`;

export const USER_TYPES = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    SUB_ADMIN: 3,
    STAFF: 4,
    RIDER: 5,
    FEEDER: 6,
    FRANCHISEE: 11,
    DEALER: 12
};
export const USER_TYPES_FILTER = [
    { value: 1, label: <IntlMessages id="app.constant.superAdmin" defaultMessage="Super Admin" />, type: USER_TYPES.SUPER_ADMIN },
    { value: 2, label: <IntlMessages id="app.constant.admin" defaultMessage="Admin" />, type: USER_TYPES.ADMIN },
    { value: 3, label: <IntlMessages id="app.constant.subAdmin" defaultMessage="Sub Admin" />, type: USER_TYPES.SUB_ADMIN },
    { value: 4, label: <IntlMessages id="app.constant.staff" defaultMessage="Staff" />, type: USER_TYPES.STAFF },
    { value: 5, label: RIDER_LABEL, type: USER_TYPES.RIDER },
    { value: 6, label: FEEDER_LABEL, type: USER_TYPES.FEEDER },
    { value: 7, label: FRANCHISEE_LABEL, type: USER_TYPES.FRANCHISEE },
    { value: 8, label: DEALER_LABEL, type: USER_TYPES.DEALER },
];
export const GENDER_LIST = {
    MALE: 1,
    FEMALE: 2,
    OTHER: 3
};
export const GENDER_FILTER = [
    { value: 1, label: <IntlMessages id="app.male" defaultMessage="Male" />, type: GENDER_LIST.MALE },
    { value: 2, label: <IntlMessages id="app.female" defaultMessage="Female" />, type: GENDER_LIST.FEMALE },
    { value: 3, label: <IntlMessages id="app.other" defaultMessage="Other" />, type: GENDER_LIST.OTHER },
];
export const STATIC_PAGE_USER_TYPES = [
    {
        label: <IntlMessages id="app.all" defaultMessage="All" />,
        value: 0
    },
    {
        label: RIDER_LABEL,
        value: 1,
        type: USER_TYPES.RIDER
    }
];
if (FRANCHISEE_VISIBLE) {
    STATIC_PAGE_USER_TYPES.push({
        label: FRANCHISEE_LABEL,
        value: 2,
        type: USER_TYPES.FRANCHISEE
    });
}
export const PRIORITY = {
    URGENT: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4
};
export const PRIORITY_FILTER = [
    {
        label: <IntlMessages id="app.all" defaultMessage="All" />,
        value: 0
    },
    {
        label: <IntlMessages id="app.constant.urgent" defaultMessage="Urgent" />,
        value: 1,
        type: PRIORITY.URGENT
    },
    {
        label: <IntlMessages id="app.constant.high" defaultMessage="High" />,
        value: 2,
        type: PRIORITY.HIGH
    },
    {
        label: <IntlMessages id="app.constant.medium" defaultMessage="Medium" />,
        value: 3,
        type: PRIORITY.MEDIUM
    },
    {
        label: <IntlMessages id="app.constant.low" defaultMessage="Low" />,
        value: 4,
        type: PRIORITY.LOW
    }
];
export const BOOK_PLAN_EXPIRATION_TYPES = {
    HOUR: 1,
    DAY: 2,
    WEEK: 3,
    MONTH: 4
}
export const BOOK_PLAN_EXPIRATION_FILTER = [
    { value: 1, label: <IntlMessages id="app.constant.hour" defaultMessage="Hour" />, type: BOOK_PLAN_EXPIRATION_TYPES.HOUR },
    { value: 2, label: <IntlMessages id="app.constant.day" defaultMessage="Day" />, type: BOOK_PLAN_EXPIRATION_TYPES.DAY },
    { value: 3, label: <IntlMessages id="app.constant.week" defaultMessage="Week" />, type: BOOK_PLAN_EXPIRATION_TYPES.WEEK },
    { value: 4, label: <IntlMessages id="app.constant.month" defaultMessage="Month" />, type: BOOK_PLAN_EXPIRATION_TYPES.MONTH }
];

export const BOOK_PLAN_LIMIT_TYPES = {
    MINUTE: 1,
    HOUR: 2,
}
export const BOOK_PLAN_LIMIT_FILTER = [
    { value: 1, label: <IntlMessages id="app.constant.minute" defaultMessage="Minute" />, type: BOOK_PLAN_LIMIT_TYPES.MINUTE },
    { value: 2, label: <IntlMessages id="app.constant.hour" defaultMessage="Hour" />, type: BOOK_PLAN_LIMIT_TYPES.HOUR },
];
export const TASK_TIME_LIMIT_TYPE = {
    MINUTES: 1,
    HOURS: 2,
    DAYS: 3,
}
export const TASK_TIME_LIMIT_TYPE_FILTER = [
    { value: 1, label: <IntlMessages id="app.constant.minutes" defaultMessage="Minutes" />, type: TASK_TIME_LIMIT_TYPE.MINUTES },
    { value: 2, label: <IntlMessages id="app.constant.hours" defaultMessage="Hours" />, type: TASK_TIME_LIMIT_TYPE.HOURS },
    { value: 3, label: <IntlMessages id="app.constant.days" defaultMessage="Days" />, type: TASK_TIME_LIMIT_TYPE.DAYS }
];
// export const ROUTE_USER_TYPE = {
//     "e-scooter-admin": USER_TYPES.ADMIN,
//     "sub-admin": USER_TYPES.SUB_ADMIN,
//     staff: USER_TYPES.STAFF,
//     riders: USER_TYPES.RIDER
// };
export const PAGE_PATHS = 'privacy-policy|terms-and-conditions|about-us';
export const STATIC_PAGE = {
    'privacy-policy': 'PRIVACY_POLICY',
    'terms-and-conditions': 'TERMS_CONDITION',
    'about-us': 'ABOUT_US'
};
export const USER_TYPES_ARRAY = [
    {
        label: <IntlMessages id="app.all" defaultMessage="All" />,
        value: 1,
        val: 'all',
        type: [USER_TYPES.ADMIN, USER_TYPES.SUB_ADMIN, USER_TYPES.STAFF]
    },
    {
        label: <IntlMessages id="app.constant.admin" defaultMessage="Admin" />,
        value: 2,
        val: 'e-scooter-admin',
        type: USER_TYPES.ADMIN
    },
    {
        label: <IntlMessages id="app.constant.subAdmin" defaultMessage="Sub admin" />,
        value: 3,
        val: 'sub-admin',
        type: USER_TYPES.SUB_ADMIN
    },
    { label: <IntlMessages id="app.constant.staff" defaultMessage="Staff" />, value: 4, val: 'staff', type: USER_TYPES.STAFF },
];

export const DISPUTE_STATUS_ARRAY = [
    // { value: 0, label: 'All' },
    { value: 1, label: <IntlMessages id="app.constant.submitted" defaultMessage="SUBMITTED" />, type: 1 },
    { value: 2, label: <IntlMessages id="app.constant.inProgress" defaultMessage="IN PROCESS" />, type: 2 },
    { value: 3, label: <IntlMessages id="app.constant.resolved" defaultMessage="RESOLVED" />, type: 3 },
    { value: 4, label: <IntlMessages id="app.constant.cancelled" defaultMessage="CANCELLED" />, type: 4 }
];
export const BOOK_PLAN_EXPIRATION_TYPES_FILTER = [
    { value: 0, label: <IntlMessages id="app.all" defaultMessage="All" /> },
    { value: 1, label: <IntlMessages id="app.constant.hourly" defaultMessage="HOURLY" />, type: BOOK_PLAN_EXPIRATION_TYPES.HOUR },
    { value: 2, label: <IntlMessages id="app.constant.daily" defaultMessage="DAILY" />, type: BOOK_PLAN_EXPIRATION_TYPES.DAY },
    { value: 3, label: <IntlMessages id="app.constant.weekly" defaultMessage="WEEKLY" />, type: BOOK_PLAN_EXPIRATION_TYPES.WEEK },
    { value: 4, label: <IntlMessages id="app.constant.monthly" defaultMessage="MONTHLY" />, type: BOOK_PLAN_EXPIRATION_TYPES.MONTH }
];
export const RIDE_STATUS = {
    RESERVED: 1,
    // UNLOCK_REQUESTED: 2,
    ON_GOING: 3,
    COMPLETED: 4,
    CANCELLED: 5
};
export const RIDE_STATUS_ARRAY = [
    // { value: 0, label: 'All' },
    { value: 1, label: <IntlMessages id="app.constant.reserved" defaultMessage="RESERVED" />, displayColor: 'var(--es--db--man--leg)', type: RIDE_STATUS.RESERVED },
    // {
    //     value: 2,
    //     label: 'UNLOCK REQUESTED',
    //     displayColor: 'var(--es--menu--hover)',
    //     type: RIDE_STATUS.UNLOCK_REQUESTED
    // },
    { value: 3, label: <IntlMessages id="app.constant.onGoing" defaultMessage="ON GOING" />, displayColor: 'var(--es--svg--end)', type: RIDE_STATUS.ON_GOING },
    { value: 4, label: <IntlMessages id="app.constant.completed" defaultMessage="COMPLETED" />, displayColor: 'var(--es--svg--start)', type: RIDE_STATUS.COMPLETED },
    { value: 5, label: <IntlMessages id="app.constant.cancelled" defaultMessage="CANCELLED" />, displayColor: 'var(--es--loader', type: RIDE_STATUS.CANCELLED }
];
export const RIDE_STATUS_ARRAY_FOR_EXCEL = [
    { label: "RESERVED", type: RIDE_STATUS.RESERVED },
    { label: "ON GOING", type: RIDE_STATUS.ON_GOING },
    { label: "COMPLETED", type: RIDE_STATUS.COMPLETED },
    { label: "CANCELLED", type: RIDE_STATUS.CANCELLED }
];
export const PAID_TYPES = {
    PAID: true,
    UNPAID: false
};
export const PAID_STATUS_ARRAY = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 1 },
    { label: <IntlMessages id="app.constant.paid" defaultMessage="Paid" />, value: 2, type: PAID_TYPES.PAID },
    { label: <IntlMessages id="app.constant.unPaid" defaultMessage="Unpaid" />, value: 3, type: PAID_TYPES.UNPAID }
];
export const CHARGE_TYPE = {
    CREDIT: 1,
    DEBIT: 2
};
export const CHARGE_TYPE_FILTER = [
    { label: <IntlMessages id="app.constant.credit" defaultMessage="Credit" />, value: 1, type: CHARGE_TYPE.CREDIT },
    { label: <IntlMessages id="app.constant.debit" defaultMessage="Debit" />, value: 2, type: CHARGE_TYPE.DEBIT },
];
export const BASE_CURRENCY = {
    INR: 1,
    USD: 2
};
export const DISTANCE_UNIT = {
    KM: 1,
    MILES: 2
};

export const FILE_TYPES = {
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/png', 'image/jpg'],
    json: ['application/json'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};
export const DOCUMENT_TYPE = {
    Business_Proof: 1,
    Agreement: 2,
    Other: 3
};
export const GENDER_TYPE = {
    1: 'Male',
    2: 'Female'
};
export const MASTER_CODES = {
    MANUFACTURER: 'MANUFACTURER',
    LOCK_MANUFACTURER: 'LOCK_MANUFACTURER',
    CHARGING_PLUG: 'CHARGING_PLUG',
    CHARGING_POWER: 'CHARGING_POWER',
    BANK_NAME: 'BANK_NAME',
    DOCUMENT: 'DOCUMENT'
};
export const ONLY_NUMBER_REQ_EXP = '^[0-9]*$';
export const DECIMAL_NUMBER_REG_EXP = '^[0-9]+(.[0-9]{1,2})?$';

export const MINIMUM_FARE_TYPE = [
    { name: <IntlMessages id="app.constant.custom" defaultMessage="custom" />, code: 'CUSTOM', value: 1 },
    { name: <IntlMessages id="app.constant.1kmCharge" defaultMessage="1km charge" />, code: 'PER_DISTANCE_UNIT_CHARGE', value: 2 }
];

export const DAYS = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6
};
export const DAYS_FILTER = [
    { label: <IntlMessages id="app.constant.sun" defaultMessage="Sun" />, value: 1, type: DAYS.SUN },
    { label: <IntlMessages id="app.constant.mon" defaultMessage="Mon" />, value: 2, type: DAYS.MON },
    { label: <IntlMessages id="app.constant.tue" defaultMessage="Tue" />, value: 3, type: DAYS.TUE },
    { label: <IntlMessages id="app.constant.wed" defaultMessage="Wed" />, value: 4, type: DAYS.WED },
    { label: <IntlMessages id="app.constant.thu" defaultMessage="Thu" />, value: 5, type: DAYS.THU },
    { label: <IntlMessages id="app.constant.fri" defaultMessage="Fri" />, value: 6, type: DAYS.FRI },
    { label: <IntlMessages id="app.constant.sat" defaultMessage="Sat" />, value: 7, type: DAYS.SAT },
];
export const OVERFLOW_COUNT = 15000;
export const LOCATION_TYPE = {
    COUNTRY: 1,
    STATE: 2,
    CITY: 3
};
export const LOCATION_TYPE_FILTER = [
    { label: <IntlMessages id="app.user.countryLabel" defaultMessage="Country" />, value: 1, type: LOCATION_TYPE.COUNTRY },
    { label: <IntlMessages id="app.user.stateLabel" defaultMessage="State" />, value: 2, type: LOCATION_TYPE.STATE },
    { label: <IntlMessages id="app.user.cityLabel" defaultMessage="City" />, value: 3, type: LOCATION_TYPE.CITY },
];
export const SETTING_TYPE = {
    RIDE: 1,
    NOTIFICATION: 2,
    COMMISSION: 3
};
export const COMMISSION_TYPE = {
    AMOUNT: 1,
    PERCENTAGE: 2
};
export const VERSION_PLATFORM = {
    ANDROID: 1,
    IPHONE: 2
};
export const NEST_TYPE = {
    NEST_RIDER: 1,
    NEST_REPAIR: 2,
    NO_RIDE_AREA: 3,
    NO_PARKING: 4,
    SLOW_SPEED: 5,
    NEST_DOCKING_STATION: 6
};
export const FILTER_BY_NEST_TYPE = [
    { label: 'All', value: 1, },
    { label: 'Nest Rider', value: 2, displayColor: '#87A71B', nestColor: '#87A71B', type: NEST_TYPE.NEST_RIDER },
    { label: 'Nest Repair', value: 3, displayColor: '#FF0000', nestColor: '#FF0000', type: NEST_TYPE.NEST_REPAIR },
    { label: 'No Ride Area', value: 4, displayColor: '#4B73E2', nestColor: '#4B73E2', type: NEST_TYPE.NO_RIDE_AREA },
    { label: 'No Parking', value: 5, displayColor: '#00C9E9', nestColor: '#00C9E9', type: NEST_TYPE.NO_PARKING },
    { label: 'Slow Speed', value: 6, displayColor: '#FF9900', nestColor: '#FF9900', type: NEST_TYPE.SLOW_SPEED },
    { label: 'Nest Docking Station', value: 7, displayColor: '#BC00E9', nestColor: '#BC00E9', type: NEST_TYPE.NEST_DOCKING_STATION }
];
export const MASTER_DATA = ['CHARGING_PLUG', 'CHARGING_POWER'];

export const REGEX = {
    URL: /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
};

export const DEFAULT_API_ERROR = <IntlMessages id="app.constant.somethingWrongOnServer" defaultMessage="Something went wrong. Please contact admin." />;

export const FEEDBACK_CONTROL_TYPE = {
    TEXTBOX: 1
};
export const FEEDBACK_CONTROL_TYPE_FILTER = [
    { label: 'Textbox', value: 1, type: FEEDBACK_CONTROL_TYPE.TEXTBOX },
];
export const QUESTION_TYPE = {
    PROBLEM: 1,
    DISPUTE: 2,
    SERVICE_REQUEST: 3
};
export const FILTER_BY_QUESTION_TYPES = [
    { value: 1, label: <IntlMessages id="app.all" defaultMessage="All" /> },
    { value: 2, label: <IntlMessages id="app.constant.problem" defaultMessage="Problem" />, type: QUESTION_TYPE.PROBLEM, displayColor: 'green' },
    { value: 3, label: <IntlMessages id="app.constant.dispute" defaultMessage="Dispute" />, type: QUESTION_TYPE.DISPUTE, displayColor: 'green' },
    { value: 4, label: <IntlMessages id="app.constant.serviceRequest" defaultMessage="Service Request" />, type: QUESTION_TYPE.SERVICE_REQUEST, displayColor: 'green' }
];
export const VEHICLE_STATUS = {
    RUNNING: 1,
    STANDING: 2
};

export const VEHICLE_STATUS_ARRAY = [
    { value: 1, label: <IntlMessages id="app.constant.running" defaultMessage="RUNNING" />, displayColor: 'var(--es--svg--start)' }, // #bd1a1b
    { value: 2, label: <IntlMessages id="app.constant.standing" defaultMessage="STANDING" />, displayColor: 'var(--es--menu--hover)' } // #650001
];
export const NOTIFICATION_TYPE = {
    EMAIL: 1,
    SMS: 2,
    PUSH_NOTIFICATION: 3
};
export const NOTIFICATION_STATUS = {
    SEND: 1,
    READ: 2
}
export const DOCUMENT_VERIFICATION_STATUS = {
    // PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
};
export const DISCOUNT_TYPE = {
    FREE_FIRST_RIDE: 1,
    GENERAL: 2,
    WALLET_BALANCE: 3
};

const DISCOUNT_TYPE_FILTER = [
    { value: 0, label: <IntlMessages id="app.all" defaultMessage="All" /> },
    { value: 1, type: DISCOUNT_TYPE.FREE_FIRST_RIDE, label: <IntlMessages id="app.constant.freeFirstRide" defaultMessage="Free First Ride" /> },
    { value: 2, type: DISCOUNT_TYPE.GENERAL, label: <IntlMessages id="app.constant.general" defaultMessage="General" /> },
    { value: 3, type: DISCOUNT_TYPE.WALLET_BALANCE, label: <IntlMessages id="app.constant.walletBalance" defaultMessage="Wallet Balance" /> }
];

export const DISCOUNT_TYPE_ARRAY = PROMOCODE_WALLET_BALANCE_TYPE ? DISCOUNT_TYPE_FILTER : _.filter(DISCOUNT_TYPE_FILTER, ele => {
    return ele.type !== DISCOUNT_TYPE.WALLET_BALANCE
});
export const PASSWORD_MIN_LENGTH = 6;

export const VEHICLE_CONNECTION_TYPES = {
    CONNECTED: true,
    NOT_CONNECTED: false
};

export const STATUS_TYPES = {
    ACTIVE: true,
    DEACTIVE: false
};

export const VEHICLE_LOCK_STATUS_TYPES = {
    LOCKED: true,
    UNLOCKED: false
};

export const ZIMO_NOTIFICATION_TYPES = [
    { value: 1, label: 'All' },
    { value: 2, label: 'Battery', type: 1 },
    { value: 3, label: 'Battery Condition', type: 2 },
    { value: 4, label: 'Unauthorized Movement', type: 3 },
    { value: 5, label: 'Buzzer', type: 4 },
    { value: 6, label: `Outside ${ZONE_LABEL}`, type: 5 }
];

export const OMNI_NOTIFICATION_TYPES = [
    { value: 1, label: 'All' },
    { value: 2, label: 'Illegal Movement', type: 6 },
    { value: 3, label: 'Down Ground Alarm', type: 7 },
    { value: 4, label: 'Illegal Removal Of Alarm', type: 8 },
    { value: 5, label: `Outside ${ZONE_LABEL}`, type: 5 },
    { value: 6, label: 'Battery', type: 1 }
];
export const LIVE_NOTIFICATION_TYPES = {
    BATTERY: 1,
    CONDITION_CHECK: 2,
    UNAUTHORIZED_MOVEMENT: 3,
    BUZZER: 4,
    OUTSIDE_ZONE: 5,
    DOWN_GROUND_ALARM: 7,
    ILLEGAL_REMOVAL_ALARM: 8,
    LOW_POWER_ALARM: 9,
    CUSTOM: 10,
    VEHICLE_ADD: 11,
    VEHICLE_UPDATE: 12,
    VEHICLE_CONNECTED: 13,
    VEHICLE_DISCONNECTED: 14,
    DUMMY_ZONE_CREATION: 21
}
export const LIVE_NOTIFICATION_TYPES_FILETR = [
    { value: 0, label: <IntlMessages id="app.all" defaultMessage="All" /> },
    { value: 1, label: <IntlMessages id="app.battery" defaultMessage="Battery" />, type: LIVE_NOTIFICATION_TYPES.BATTERY },
    { value: 2, label: <IntlMessages id="app.constant.conditionCheck" defaultMessage="Condition check" />, type: LIVE_NOTIFICATION_TYPES.CONDITION_CHECK },
    { value: 3, label: <IntlMessages id="app.constant.UnauthorizedMovement" defaultMessage="Unauthorized movement" />, type: LIVE_NOTIFICATION_TYPES.UNAUTHORIZED_MOVEMENT },
    { value: 4, label: <IntlMessages id="app.constant.buzzer" defaultMessage="Buzzer" />, type: LIVE_NOTIFICATION_TYPES.BUZZER },
    { value: 5, label: <><IntlMessages id="app.constant.outside" defaultMessage="Outside" /> {ZONE_LABEL}</>, type: LIVE_NOTIFICATION_TYPES.OUTSIDE_ZONE },
    { value: 6, label: <IntlMessages id="app.constant.downGround" defaultMessage="Down ground alarm" />, type: LIVE_NOTIFICATION_TYPES.DOWN_GROUND_ALARM },
    { value: 7, label: <IntlMessages id="app.constant.battIllegal" defaultMessage="BattIllegal removal alarmery" />, type: LIVE_NOTIFICATION_TYPES.ILLEGAL_REMOVAL_ALARM },
    { value: 8, label: <IntlMessages id="app.constant.lowPowerAlarm" defaultMessage="Low power alarm" />, type: LIVE_NOTIFICATION_TYPES.LOW_POWER_ALARM },
    { value: 9, label: <IntlMessages id="app.constant.custom" defaultMessage="Custom" />, type: LIVE_NOTIFICATION_TYPES.CUSTOM },
    { value: 10, label: <IntlMessages id="app.constant.vehicleAdd" defaultMessage="Vehicle Add" />, type: LIVE_NOTIFICATION_TYPES.VEHICLE_ADD },
    { value: 11, label: <IntlMessages id="app.constant.vehicleUpdate" defaultMessage="Vehicle update" />, type: LIVE_NOTIFICATION_TYPES.VEHICLE_UPDATE },
    { value: 12, label: <IntlMessages id="app.constant.vehicleConnected" defaultMessage="Vehicle connected" />, type: LIVE_NOTIFICATION_TYPES.VEHICLE_CONNECTED },
    { value: 13, label: <IntlMessages id="app.constant.vehicleDisconnected" defaultMessage="Vehicle disconnected" />, type: LIVE_NOTIFICATION_TYPES.VEHICLE_DISCONNECTED },
    { value: 21, label: <><IntlMessages id="app.constant.dummy" defaultMessage="Dummy" /> {ZONE_LABEL} <IntlMessages id="app.constant.created" defaultMessage="Created" /></>, type: LIVE_NOTIFICATION_TYPES.DUMMY_ZONE_CREATION }
];

export const FILTER_BY_ACTIVE = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 1 },
    { label: <IntlMessages id="app.active" defaultMessage="Active" />, value: 2, type: STATUS_TYPES.ACTIVE },
    { label: <IntlMessages id="app.deactive" defaultMessage="Deactive" />, value: 3, type: STATUS_TYPES.DEACTIVE }
];

export const CANCEL_PLAN_TYPE = {
    CANCELLED: true,
    ACTIVE: false
};
export const FILTER_BY_CANCEL_BOOK_PLAN = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 1 },
    { label: <IntlMessages id="app.bookingpass.cancelledPlan" defaultMessage="Cancelled Plan" />, value: 2, type: CANCEL_PLAN_TYPE.CANCELLED },
    { label: <IntlMessages id="app.constant.activePlan" defaultMessage="Active Plan" />, value: 3, type: CANCEL_PLAN_TYPE.ACTIVE }
];

export const PAYMENT_STATUS = {
    CAPTURED: 1,
    EXPIRED: 2,
    FAILED: 3,
    PENDING: 4,
    REFUNDED: 5,
    SUCCEEDED: 6
};
export const FILTER_BY_PAYMENT_STATUS = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 0 },
    { label: <IntlMessages id="app.constant.captured" defaultMessage="Captured" />, value: 1, displayColor: 'grey', type: PAYMENT_STATUS.CAPTURED },
    { label: <IntlMessages id="app.constant.expired" defaultMessage="Expired" />, value: 2, displayColor: 'red', type: PAYMENT_STATUS.EXPIRED },
    { label: <IntlMessages id="app.constant.failed" defaultMessage="Failed" />, value: 3, displayColor: 'red', type: PAYMENT_STATUS.FAILED },
    { label: <IntlMessages id="app.constant.pending" defaultMessage="Pending" />, value: 4, displayColor: '#2BC9C3', type: PAYMENT_STATUS.PENDING },
    { label: <IntlMessages id="app.constant.refunded" defaultMessage="Refunded" />, value: 5, displayColor: 'purple', type: PAYMENT_STATUS.REFUNDED },
    { label: <IntlMessages id="app.constant.succeeded" defaultMessage="Succeeded" />, value: 6, displayColor: 'green', type: PAYMENT_STATUS.SUCCEEDED }
];
// export const RIDE_TYPE = {
//     DEFAULT: 1,
//     SUBSCRIPTION: 2,
//     LEASE: 3
// }
// export const RIDE_TYPE_FILTER = [
//     { label: 'All', value: 0 },
//     { label: 'Default', value: 1, type: RIDE_TYPE.DEFAULT },
//     { label: 'Subscription', value: 2, type: RIDE_TYPE.SUBSCRIPTION },
//     { label: 'Lease', value: 3, type: RIDE_TYPE.LEASE },
// ];
export const ACTIVITY_TYPES = {
    CREATED: 1,
    UPDATED: 2,
    REMOVED: 3,
    ACTIVE_STATUS_UPDATED: 4,
    STATUS_UPDATED: 5,
    PASSWORD_RESET: 7
};
export const ACTIVITY_TYPES_ARRAY = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 0 },
    { label: <IntlMessages id="app.constant.created" defaultMessage="Created" />, value: 1, type: ACTIVITY_TYPES.CREATED },
    { label: <IntlMessages id="app.constant.updated" defaultMessage="Updated" />, value: 2, type: ACTIVITY_TYPES.UPDATED },
    { label: <IntlMessages id="app.constant.deleted" defaultMessage="Deleted" />, value: 3, type: ACTIVITY_TYPES.REMOVED },
    {
        label: <IntlMessages id="app.activeDeactive" defaultMessage="Active/Deactive" />,
        value: 4,
        type: ACTIVITY_TYPES.ACTIVE_STATUS_UPDATED
    },
    { label: <IntlMessages id="app.dispute.statusUpdate" defaultMessage="Status Update" />, value: 5, type: ACTIVITY_TYPES.STATUS_UPDATED },
    { label: <IntlMessages id="app.constant.passwordReset" defaultMessage="Password Reset" />, value: 7, type: ACTIVITY_TYPES.PASSWORD_RESET }
];
// ----------------------filter constant---------------------------------------------
export const FILTER_BY_BATTERY = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 1 },
    { label: <IntlMessages id="app.constant.upto25" defaultMessage="Upto 25%" />, value: 2, type: { '>=': 0, '<=': 25 } },
    { label: <IntlMessages id="app.constant.26To50" defaultMessage="26% to 50%" />, value: 3, type: { '>=': 26, '<=': 50 } },
    { label: <IntlMessages id="app.constant.51To75" defaultMessage="51% to 75%" />, value: 4, type: { '>=': 51, '<=': 75 } },
    {
        label: <IntlMessages id="app.constant.76To100" defaultMessage="76% to 100%" />,
        value: 5,
        type: { '>=': 76, '<=': 100 }
    }
];

export const FILTER_BY_CONNECTION_TYPE = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 1 },
    {
        label: <IntlMessages id="app.connected" defaultMessage="Connected" />,
        value: 2,
        type: VEHICLE_CONNECTION_TYPES.CONNECTED
    },
    {
        label: <IntlMessages id="app.notConnected" defaultMessage="Not Connected" />,
        value: 3,
        type: VEHICLE_CONNECTION_TYPES.NOT_CONNECTED
    }
];
export const FILTER_BY_LOCK_STATUS = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 1 },
    { label: <IntlMessages id="app.vehicle.locked" defaultMessage="Locked" />, value: 2, type: VEHICLE_LOCK_STATUS_TYPES.LOCKED },
    {
        label: <IntlMessages id="app.constant.unlocked" defaultMessage="Unlocked" />,
        value: 3,
        type: VEHICLE_LOCK_STATUS_TYPES.UNLOCKED
    }
];
export const SORT_BY_ARRAY = [
    { label: <IntlMessages id="app.constant.none" defaultMessage="None" />, value: 1 },
    { label: <IntlMessages id="app.name" defaultMessage="Name" />, type: 'name', value: 2 },
    {
        label: <IntlMessages id="app.lastConnected" defaultMessage="Last Connected" />,
        type: 'lastConnectedDateTime',
        value: 3
    },
    { label: <IntlMessages id="app.battery" defaultMessage="Battery" />, type: 'batteryLevel', value: 4 },
    { label: <IntlMessages id="app.constant.vehicleId" defaultMessage="Vehicle Id" />, type: 'registerId', value: 5 }
];
export const SORT_BY_ARRAY_USER = [
    {
        label: <IntlMessages id="app.user.nameHolder" defaultMessage="First Name" />,
        key: 'firstName',
        value: 1,
        type: 'firstName'
    },
    { label: <IntlMessages id="app.user.lastNameHolder" defaultMessage="Last Name" />, key: 'lastName', value: 2, type: 'lastName' },
    {
        label: <IntlMessages id="app.constant.signUpDate" defaultMessage="Sign Up Date" />,
        key: 'createdAt',
        value: 3,
        type: 'createdAt'
    }
];
export const SORT_BY_REQUEST_DATE = [
    {
        label: <IntlMessages id="app.dispute.requestDate" defaultMessage="Request Date" />,
        key: 'createdAt',
        value: 1,
        type: 'createdAt'
    },
];

export const EMAIL_VERIFICATION_TYPE = ['OTP', 'LINK'];
export const DEFAULT_PAYMENT_METHOD = ['STRIPE', 'NOQOODY'];
export const SET_IOT_COMMAND_STATUS = {
    0: 'Pending',
    1: 'Success'
};

export const COMMISSION_PAYOUT_TYPE = {
    REQUESTED: 1,
    TRANSFERRED: 2,
    REJECTED: 3
};

export const COMMISSION_PAYOUT_TYPE_ARRAY = [
    { value: 1, label: <IntlMessages id="app.dispute.requested" defaultMessage="Requested" /> },
    { value: 2, label: <IntlMessages id="app.dispute.transferred" defaultMessage="Transferred" /> },
    { value: 3, label: <IntlMessages id="app.dispute.rejected" defaultMessage="Rejected" /> }
];
export const USER_LOGIN_TYPES = {
    EMAIL: 1,
    MOBILE: 2
};
export const WORK_FLOW = {
    OPEN: 1,
    IN_PROGRESS: 2,
    COMPLETE: 3,
    CANCELLED: 4,
};
export const FILTER_BY_WORK_FLOW = [
    // { label: 'All', value: 0 },
    { label: <IntlMessages id="app.constant.open" defaultMessage="Open" />, value: 1, type: WORK_FLOW.OPEN },
    { label: <IntlMessages id="app.constant.progress" defaultMessage="In Progress" />, value: 2, type: WORK_FLOW.IN_PROGRESS },
    { label: <IntlMessages id="app.constant.complete" defaultMessage="Complete" />, value: 3, type: WORK_FLOW.COMPLETE },
    { label: <IntlMessages id="app.constant.cancel" defaultMessage="Cancelled" />, value: 4, type: WORK_FLOW.CANCELLED },
];
export const TASK_PRIORITY = {
    URGENT: 1,
    NORMAL: 2
}
export const TASK_PRIORITY_FILTER = [
    { label: <IntlMessages id="app.constant.open" defaultMessage="Open" />, value: 1, type: TASK_PRIORITY.URGENT },
    { label: <IntlMessages id="app.constant.progress" defaultMessage="In Progress" />, value: 2, type: TASK_PRIORITY.NORMAL },
];
export const TASK_LEVEL = {
    LEVEL_1: 1,
    LEVEL_2: 2,
    // LEVEL_3: 3
};
export const TASK_TYPE = {
    LEVEL_1: {
        MOVE: 1,
        DAMAGE_MOVE: 2
    },
    LEVEL_2: {
        CHARGE: 3,
        DAMAGE_CHARGE: 4,
    },
    // LEVEL_3: {
    //     SPECIAL_TASK: 5,
    //     TASKS: 6
    // }
};
export const FILTER_BY_TASK_TYPE = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 0 },
    { label: <IntlMessages id="app.constant.move" defaultMessage="Move" />, value: 1, type: TASK_TYPE.LEVEL_1.MOVE, level: TASK_LEVEL.LEVEL_1 },
    { label: <IntlMessages id="app.constant.damageMove" defaultMessage="Damage Move" />, value: 2, type: TASK_TYPE.LEVEL_1.DAMAGE_MOVE, level: TASK_LEVEL.LEVEL_1 },
    { label: <IntlMessages id="app.constant.charge" defaultMessage="Charge" />, value: 3, type: TASK_TYPE.LEVEL_2.CHARGE, level: TASK_LEVEL.LEVEL_2 },
    { label: <IntlMessages id="app.constant.damageCharge" defaultMessage="Damage Charge" />, value: 4, type: TASK_TYPE.LEVEL_2.DAMAGE_CHARGE, level: TASK_LEVEL.LEVEL_2 },
    // { label: 'Special Task', value: 5, type: TASK_TYPE.LEVEL_3.SPECIAL_TASK, level: TASK_LEVEL.LEVEL_3 },
    // { label: 'Tasks', value: 6, type: TASK_TYPE.LEVEL_3.TASKS, level: TASK_LEVEL.LEVEL_3 },
];
export const FILTER_BY_TASK_LEVEL = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 0 },
    { label: <IntlMessages id="app.constant.level1" defaultMessage="Level 1" />, value: 1, type: TASK_LEVEL.LEVEL_1, displayColor: 'green' },
    { label: <IntlMessages id="app.constant.level2" defaultMessage="Level 2" />, value: 2, type: TASK_LEVEL.LEVEL_2, displayColor: 'green' },
    // { label: 'Level 3', value: 3, type: TASK_LEVEL.LEVEL_3 }
];
export const TASK_HEADING = {
    1: {
        1: "Move"
        // 1: <IntlMessages id="app.constant.move" defaultMessage="Move" />,
        // 2: "Move for repair"
    },
    2: {
        1: "Damage Move"
        // 1: <IntlMessages id="app.constant.damageMove" defaultMessage="Damage Move" />,
        // 2: "Damage Battery"
    },
    3: {
        1: "Charge"
        // 1: <IntlMessages id="app.constant.charge" defaultMessage="Charge" />,
        // 2: "Move for repair"
    },
    4: {
        1: "Damage Charge"
        // 1: <IntlMessages id="app.constant.damageCharge" defaultMessage="Damage Charge" />,
        // 2: "Move for repair"
    },
    // 5: {
    //     1: "Charge vehicle",
    //     2: "Replace Battery"
    // },
    // 6: {
    //     1: "Repair on spot",
    //     2: "Collect for repair"
    // }
};

export const RENTAL_PAYMENT_TYPE = {
    REQUESTED: 1,
    TRANSFERRED: 2,
    REJECTED: 3
};
export const RENT_PAYMENT_TYPE = {
    ACCOUNT_PAYABLE: 1,
    ACCOUNT_RECEIVABLE: 2
}

export const RENTAL_PAYMENT_FILTER_TYPE = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 1 },
    { label: <IntlMessages id="app.partner.payable" defaultMessage="Payable" />, value: 2, type: RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE },
    { label: <IntlMessages id="app.partner.receivable" defaultMessage="Receivable" />, value: 3, type: RENT_PAYMENT_TYPE.ACCOUNT_RECEIVABLE },
];

export const FLEET_TYPE = {
    PRIVATE: 1,
    GENERAL: 2
}
export const OVERDUE_TASK_FILTER = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 0 },
    { label: <IntlMessages id="app.constant.overdueTask" defaultMessage="Overdue Task" />, value: 1, type: true },
];
export const SORT_BY_CREATED_AT_TASK = [
    {
        label: <IntlMessages id="app.constant.creationDate" defaultMessage="Creation Date" />,
        key: 'createdAt',
        value: 1,
        type: 'createdAt'
    }
];
export const SOCKET_PAGE = {
    DASHBOARD: 'dashboard',
    VEHICLE_DETAILS: 'vehicle-details',
    RIDES: 'rides'
};

export const SMS_METHOD = ['DEFAULT', 'TWILIO', 'AWS_SNS', 'OOREDOO'];

export const FILTER_BY_FLEET_TYPE = [
    { value: 1, label: <IntlMessages id="app.all" defaultMessage="All" /> },
    { value: 2, label: <IntlMessages id="app.constant.private" defaultMessage="Private" />, type: FLEET_TYPE.PRIVATE, displayColor: 'green' },
    { value: 3, label: <IntlMessages id="app.constant.general" defaultMessage="General" />, type: FLEET_TYPE.GENERAL, displayColor: 'green' },
];
export const FILTER_BY_DISPUTE_TYPES = [
    { value: 1, label: <IntlMessages id="app.all" defaultMessage="All" /> },
    { value: 2, label: <IntlMessages id="app.constant.problem" defaultMessage="Problem" />, type: QUESTION_TYPE.PROBLEM, displayColor: 'green' },
    { value: 3, label: <IntlMessages id="app.constant.dispute" defaultMessage="Dispute" />, type: QUESTION_TYPE.DISPUTE, displayColor: 'green' }
];

export const SHAPE_TYPE = {
    POLYGON: 'Polygon',
    RECTANGLE: 'Rectangle',
    CIRCLE: 'Circle'
}
export const VEHICLE_REPORT_STATUS = {
    SUBMITTED: 1,
    TASK_CREATED: 2,
    CANCELED: 3,
    RESOLVED: 4
}
export const FILTER_BY_VEHICLE_REPORT_STATUS = [
    // { label: 'All', value: 0 },
    { label: <IntlMessages id="app.constant.submitted" defaultMessage="Submitted" />, value: 1, type: VEHICLE_REPORT_STATUS.SUBMITTED },
    { label: <IntlMessages id="app.constant.progress" defaultMessage="In Progress" />, value: 2, type: VEHICLE_REPORT_STATUS.TASK_CREATED },
    { label: <IntlMessages id="app.constant.cancel" defaultMessage="Cancelled" />, value: 3, type: VEHICLE_REPORT_STATUS.CANCELED },
    { label: <IntlMessages id="app.constant.resolve" defaultMessage="Resolved" />, value: 4, type: VEHICLE_REPORT_STATUS.RESOLVED },
];
export const VEHICLE_REPORT_ISSUE_TYPE = {
    DAMAGE_VEHICLE: {
        HANDLE_BAR: 1,
        BATTERY: 2,
        WHEEL: 3,
        STAND: 4,
        OTHER: 5,
        THROTTLE: 6,
        BRAKE: 7,
        KICKSTAND: 8,
    },
    LOCK_ISSUE: {
        LOCKED_STILL_CHARGING: 1,
        TRIP_STARTED_ON_PHONE_STILL_LOCKED: 2,
        BROKEN_LOCK: 3,
        UNAUTHORIZED_LOCK: 4,
        OTHER: 5,
    }
}
export const SORT_BY_CREATED_AT_Report = [
    {
        label: <IntlMessages id="app.constant.submitted" defaultMessage="Creation Date" />,
        key: 'createdAt',
        value: 1,
        type: 'createdAt'
    }
];

export const BOOKING_PASS_TIME_TYPES = {
    MINUTE: 1,
    HOUR: 2,
};
export const BOOKING_PASS_LIMIT_TYPES = {
    MINUTES: 1,
    HOUR: 2,
    DAY: 3,
    MONTH: 4
};
export const BOOKING_PASS_LIMIT_TYPES_FILTER = [
    { label: <IntlMessages id="app.constant.minute" defaultMessage="Minute" />, value: 1, type: BOOKING_PASS_LIMIT_TYPES.MINUTES },
    { label: <IntlMessages id="app.hour" defaultMessage="Hour" />, value: 2, type: BOOKING_PASS_LIMIT_TYPES.HOUR },
    { label: <IntlMessages id="app.constant.day" defaultMessage="Day" />, value: 3, type: BOOKING_PASS_LIMIT_TYPES.DAY },
    { label: <IntlMessages id="app.constant.month" defaultMessage="Month" />, value: 4, type: BOOKING_PASS_LIMIT_TYPES.MONTH },
];
export const BOOKING_PASS_TYPE = {
    RIDE: 1,
    UNLOCK: 2
};
export const BOOKING_PASS_TYPE_FILTER = [
    { label: "Ride", value: 1, type: BOOKING_PASS_TYPE.RIDE },
    { label: "Unlock", value: 2, type: BOOKING_PASS_TYPE.UNLOCK },
];
export const ASSIGN_VEHICLE_OPERATION_TYPE = [
    { label: <IntlMessages id="app.constant.assigned" defaultMessage="Assigned" />, value: 1, type: 1 },
    { label: <IntlMessages id="app.constant.retained" defaultMessage="Retained" />, value: 2, type: 2 },
];
export const REFERRAL_USER_BENEFIT_TYPE = {
    FREE_AMOUNT: 1,
    FREE_RIDE: 2,
    FREE_MINUTES: 3
};
export const REFERRAL_USER_BENEFIT_TYPE_FILTER = [
    { label: <IntlMessages id="app.constant.freeAmount" defaultMessage="Free Amount" />, value: 1, type: REFERRAL_USER_BENEFIT_TYPE.FREE_AMOUNT },
    // { label: <IntlMessages id="app.constant.freeRide" defaultMessage="Free Ride" />, value: 2, type: REFERRAL_USER_BENEFIT_TYPE.FREE_RIDE },
    // { label: <IntlMessages id="app.constant.freeMinutes" defaultMessage="Free Minutes" />, value: 3, type: REFERRAL_USER_BENEFIT_TYPE.FREE_MINUTES },
];
export const BOOKING_PASS_EXPIRATION_TYPES = {
    HOUR: 1,
    DAY: 2,
    MONTH: 3
};
export const BOOKING_PASS_EXPIRATION_TYPES_FILTER = [
    { label: <IntlMessages id="app.hour" defaultMessage="Hour" />, value: 1, type: BOOKING_PASS_EXPIRATION_TYPES.HOUR },
    { label: <IntlMessages id="app.constant.day" defaultMessage="Day" />, value: 2, type: BOOKING_PASS_EXPIRATION_TYPES.DAY },
    { label: <IntlMessages id="app.constant.month" defaultMessage="Month" />, value: 3, type: BOOKING_PASS_EXPIRATION_TYPES.MONTH },
];
export const WALLET_EXPIRES_TIME = [
    { label: "1 Month", value: 1 },
    { label: "2 Month", value: 2 },
    { label: "3 Month", value: 3 },
    { label: "6 Month", value: 4 },
    { label: "1 Year", value: 5 },
    { label: "2 Year", value: 6 },
    { label: "No Limit", value: 0 }
];