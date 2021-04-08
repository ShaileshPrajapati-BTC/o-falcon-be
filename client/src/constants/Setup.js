import IntlMessages from "../util/IntlMessages";
import React from 'react';

export const PROJECT_NAME = 'Falcon Ride';
export const BASE_URL = process.env.REACT_APP_BASE_URL;

export const FILTER_VISIBLE = true;
export const SUBSCRIPTION_VISIBLE = false;
export const RENTAL_VISIBLE = false;
export const LEASING_VISIBLE = false;
export const WALLET_CONFIG_VISIBLE = true;
export const NEST_VISIBLE = true;
export const ADD_VEHICLE_INTO_NEST = true;
export const TASK_MODULE_VISIBLE = true;
export const COMMUNITY_MODE_VISIBLE = true;
export const DOCUMENT_VERIFICATION_REQUIRED = true;
export const STAFF_VISIBLE = false;
export const FEEDER_VISIBLE = true;
export const BOOKING_PASS_VISIBLE = true;
export const MINIMUM_AGE_VISIBLE = false;
export const WORKING_HOURS_VISIBLE = true;
export const DAILY_LIGHT_ON_OFF = false;
export const SOCKET_CONNECTION = true;
export const FRANCHISEE_VISIBLE = false;
export const CLIENT_VISIBLE = false;
export const PARTNER_WITH_CLIENT_FEATURE = false;
export const PROMOCODE_WALLET_BALANCE_TYPE = true;
export const REFERRAL_CODE_VISIBLE = true;
export const EXPORT_EXCEL = true;
export const DISPLAY_DASHBOARD_SCOOTER_STATIC_DATA = false;
export const DISPLAY_DASHBOARD_DATA_FROM_SPECIFIC_DATE =  true;
export const DISPLAY_AFTER_SPECIFIC_DATE  = '2021-01-01';
export const OPERATIONAL_HOURS_VISIBLE = true;
export const IS_NOQOODY_PG =  true;
export const IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY =  true;
export const IS_PARKING_FINE_FEATURE = true;

export const DEFAULT_BASE_CURRENCY = 'QR';
export const UNIT_TYPE_ARRAY = [
    { value: 1, label: DEFAULT_BASE_CURRENCY },
    { value: 2, label: '%' }
];
export const COMMISSION_TYPE_ARRAY = [
    { value: 1, label: <span><IntlMessages id="app.setUp.flat" defaultMessage="Flat" /> ({DEFAULT_BASE_CURRENCY})</span> },
    { value: 2, label: <IntlMessages id="app.setUp.percentage" defaultMessage="Percentage (%)" /> }
];
export const DEFAULT_DISTANCE_UNIT = 'km';
export const CUSTOM_MODAL_WIDTH = 720;
export let DEFAULT_MAP_CENTER = {
    lat: 25.283943,
    lng: 51.3719109
};

export const VEHICLE_TYPES = {
    SCOOTER: 1,
    BICYCLE: 2,
    BIKE: 3
};
export const FILTER_BY_VEHICLE_TYPE = [
    {
        label: <IntlMessages id="app.all" defaultMessage="All" />,
        value: 0,
        type: [VEHICLE_TYPES.SCOOTER, VEHICLE_TYPES.BICYCLE, VEHICLE_TYPES.BIKE]
    },
    { label: <IntlMessages id="app.vehicle.scooter" defaultMessage="Scooter" />, value: 1, type: [VEHICLE_TYPES.SCOOTER] },
    { label: <IntlMessages id="app.vehicle.bicycle" defaultMessage="Bicycle" />, value: 2, type: [VEHICLE_TYPES.BICYCLE] },
    { label: <IntlMessages id="app.vehicle.bike" defaultMessage="Bike" />, value: 3, type: [VEHICLE_TYPES.BIKE] }
];

export const VEHICLE_TYPE_FILTER = [
    { label: <IntlMessages id="app.all" defaultMessage="All" />, value: 0 },
    { label: <IntlMessages id="app.vehicle.scooter" defaultMessage="Scooter" />, value: 1, type: VEHICLE_TYPES.SCOOTER },
    { label: <IntlMessages id="app.vehicle.bicycle" defaultMessage="Bicycle" />, value: 2, type: VEHICLE_TYPES.BICYCLE },
    { label: <IntlMessages id="app.vehicle.bike" defaultMessage="Bike" />, value: 3, type: VEHICLE_TYPES.BIKE }
];
export const VEHICLE_TYPE_FILTER_FOR_EXCEL = [
    { label: "Scooter", value: 1, type: VEHICLE_TYPES.SCOOTER },
    { label: "Bicycle", value: 2, type: VEHICLE_TYPES.BICYCLE },
    { label: "Bike", value: 3, type: VEHICLE_TYPES.BIKE }
];
export const DEFAULT_VEHICLE = FILTER_BY_VEHICLE_TYPE[1].value;

export const LANGUAGES = [
    // LTR
    { id: 'en-US', name: 'English' },
    { id: 'pt-PT', name: 'Portuguese' },
    { id: 'es-ES', name: 'Spanish' },
    { id: 'ko-KR', name: 'Korean' },
    { id: 'it-IT', name: 'Italian (Italy)' },
    // RTL
    { id: 'ar-AE', name: 'Arabic' }
];
export const LOCALIZATION_LANGUAGES = [
    { id: 'en-US', name: 'English' },
    { id: 'de-DE', name: 'German' },
    { id: 'es-ES', name: 'Spanish' },
    { id: 'nl-BE', name: 'Dutch' },
    { id: 'it-IT', name: 'Italian' },
]
export const LANGUAGES_NAME = {
    'en-US': 'English',
    'pt-PT': 'Portuguese',
    'es-ES': 'Spanish',
    'ar-AE': 'Arabic',
    'ko-KR': 'Korean',
    'it-IT': 'Italian (Italy)'
};
export const DEFAULT_LANGUAGE = 'en-US';
export const RTL_LANGUAGE = ['ar-AE'];
export const FRANCHISEE_LABEL = <IntlMessages id="app.setUp.partnerLabel" defaultMessage="Partner" />;
export const FRANCHISEE_LABEL_STRING = "Partner";
export const FRANCHISEE_ROUTE = "partner";
export const DEALER_LABEL = <IntlMessages id="app.setUp.clientLabel" defaultMessage="Client" />;
export const DEALER_LABEL_STRING = "Client";
export const DEALER_ROUTE = "client";

export const GUEST_USER = <IntlMessages id="app.setUp.guestUser" defaultMessage="Guest User" />;
export const GUEST_USER_STRING = "Guest User";

export const SUPPORT = {
    CONTACT: 9978379402,
    EMAIL: 'develop@rohak.io'
}


export const isSuperAdminViewPartnerFare = false
export const isPartnerViewDealerFare = false
export const NEST_LABEL = <IntlMessages id="app.setUp.nestLabel" defaultMessage="Zone" />;
export const NEST_LABEL_STRING = "Zone";
export const NEST_ROUTE = "zone";

export const RIDER_LABEL = <IntlMessages id="app.setUp.riderLabel" defaultMessage="Customer" />;
export const RIDER_LABEL_STRING = "Customer";
export const RIDER_ROUTE = "customer";

export const ZONE_LABEL = <IntlMessages id="app.setUp.zoneLabel" defaultMessage="Geo Fence" />;
export const ZONE_LABEL_STRING = "Geo Fence";
export const ZONE_ROUTE = "geo-fence";

export const FEEDER_LABEL = <IntlMessages id="app.setUp.feederLabel" defaultMessage="Feeder" />;
export const FEEDER_LABEL_STRING = "Feeder";
export const FEEDER_ROUTE = "feeder";

export const SUBSCRIPTION_LABEL = <IntlMessages id="app.setUp.subscriptionLabel" defaultMessage="Booking Plan" />;
export const SUBSCRIPTION_ROUTE = "booking-plan";

export const BOOKING_PASS_LABEL = <IntlMessages id="app.setUp.bookingPassLabel" defaultMessage="Booking Pass" />;
export const BOOKING_PASS_ROUTE = "booking-pass";
