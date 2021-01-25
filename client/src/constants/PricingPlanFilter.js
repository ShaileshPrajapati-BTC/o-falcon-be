import { SUBSCRIPTION_VISIBLE, BOOKING_PASS_VISIBLE, LEASING_VISIBLE } from './Setup';

export const RIDE_TYPE = {
    DEFAULT: 1,
    SUBSCRIPTION: 2,
    LEASE: 3,
    BOOKING_PASS: 4
}
const FILTER = [
    { label: 'All', value: 0 },
    { label: 'General', value: 1, type: RIDE_TYPE.DEFAULT },
];

SUBSCRIPTION_VISIBLE && FILTER.push({ label: 'Subscription', value: 2, type: RIDE_TYPE.SUBSCRIPTION });
LEASING_VISIBLE && FILTER.push({ label: 'Lease', value: 3, type: RIDE_TYPE.LEASE });
BOOKING_PASS_VISIBLE && FILTER.push({ label: 'Booking Pass', value: 4, type: RIDE_TYPE.BOOKING_PASS });

export const RIDE_TYPE_FILTER = FILTER;