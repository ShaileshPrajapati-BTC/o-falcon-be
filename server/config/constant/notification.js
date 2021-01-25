'use strict';

let notificationConstants = {
    PRIORITY: {
        URGENT: 1,
        HIGH: 2,
        NORMAL: 3,
        LOW: 4,
        NO_PRIORITY: 5 // It is not necesary to have priority
    },
    NOTIFICATION: {
        STATUS: {
            SEND: 1,
            READ: 2
        },
        MESSAGES: {
            CUSTOMER: {
                BOOKING_SUCCESSFUL: 'Slot Successfully booked',
                RESCHEDULE_SUCCESSFUL: 'Slot Successfully rescheduled',
                SCHEDULE_BOOKING_SUCCESSFUL: 'Schedule booked Successfully'
            },
            ADMIN: {
                BOOKING_SUCCESSFUL: 'Customer booked slot',
                RESCHEDULE_SUCCESSFUL: 'Customer rescheduled slot',
                SCHEDULE_BOOKING_SUCCESSFUL: 'Customer Schedule booked',
                BOOKING_BEHALF_OF_CUSTOMER_SUCCESSFUL:
                    'Slot Successfully booked',
                SCHEDULE_BEHALF_OF_CUSTOMER_BOOKING_SUCCESSFUL:
                    'Schedule booked Successfully',
                BOOKING_CANCEL: 'Admin cancelled your booking'
            }
        },
        TYPE: {
            EMAIL: 1,
            SMS: 2,
            PUSH_NOTIFICATION: 3
        },

        CHARGING_STATION_DEACTIVE_MESSAGE:
            `Oops.! Our Partner had to cancel , Due to unforeseen circumstances. While we assure you ,We'll be back soon.`,
        ADMIN_NOTIFICATION: {
            TYPE: {
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
        }
    }
};

notificationConstants.NOTIFICATION.NOTIFICATION_TYPES = {
    ib: notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.BATTERY,
    sb: notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.BATTERY,
    'battery-check': notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.CONDITION_CHECK,
    'iot-check': notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.CONDITION_CHECK,
    'vehicle-unauth-move':
        notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.UNAUTHORIZED_MOVEMENT,
    buzzer: notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.BUZZER,
    'outside-zone': notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.OUTSIDE_ZONE,
    'illegal-movement-alarm':
        notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.OMNI_ILLEGAL_MOVEMENT_ALARM,
    'down-ground-alarm':
        notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.OMNI_DOWN_GROUND_ALARM,
    'illegal-removal-alarm':
        notificationConstants.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.OMNI_ILLEGAL_REMOVAL_ALARM
};

/** 
 * Battery Level Notification's data.
 * Keep Battery Level in ascending order.
 * sendInterval's value is in Minutes 
 */

notificationConstants.NOTIFICATION.BATTERY_LEVEL_INFO = {
    EXTREME_LOW: {
        batteryLevel: 5,
        sendInterval: 1,
        priority: notificationConstants.PRIORITY.URGENT
    },
    LOW: {
        batteryLevel: 10,
        sendInterval: 5,
        priority: notificationConstants.PRIORITY.HIGH
    },
    BELOW_AVERAGE: {
        batteryLevel: 20,
        sendInterval: 10,
        priority: notificationConstants.PRIORITY.NORMAL
    },
    AVERAGE: {
        batteryLevel: 30,
        sendInterval: 30,
        priority: notificationConstants.PRIORITY.LOW
    }
};

/** sendInterval's value is in Minutes */
notificationConstants.NOTIFICATION.IOT_NOTIFICATION = {
    BATTERY: {
        type: 1,
        sendInterval: 1,
        message: 'batteryLevel Remain!'
    },
    CONDITION_CHECK: {
        type: 2,
        sendInterval: 0,
        message: '',
        priority: notificationConstants.PRIORITY.HIGH
    },
    UNAUTHORIZED_MOVEMENT: {
        type: 3,
        sendInterval: 5,
        message: 'Illegal Movement Alarm.',
        priority: notificationConstants.PRIORITY.HIGH
    },
    BUZZER: {
        type: 4,
        sendInterval: 0,
        MESSAGE: '',
        priority: notificationConstants.PRIORITY.NORMAL
    },
    OUTSIDE_ZONE: {
        type: 5,
        sendInterval: 10,
        message: 'Outside Zone Alarm.',
        priority: notificationConstants.PRIORITY.URGENT
    },
    DOWN_GROUND_ALARM: {
        type: 6,
        sendInterval: 30,
        message: 'Down Ground Alarm.',
        priority: notificationConstants.PRIORITY.HIGH
    },
    LIFTED_UP_ALARM: {
        type: 11,
        sendInterval: 0,
        message: 'Scooter was lifted up',
        priority: notificationConstants.PRIORITY.NORMAL
    },
    ILLEGAL_REMOVAL_ALARM: {
        type: 7,
        sendInterval: 10,
        message: 'Illegal Removal of Alarm.',
        priority: notificationConstants.PRIORITY.URGENT
    },
    LOW_POWER_ALARM: {
        type: 8,
        sendInterval: 0,
        message: 'Low Power Alarm.',
        priority: notificationConstants.PRIORITY.URGENT
    },
    BASIC_EVENTS: {
        type: 9,
        sendInterval: 0,
        message: '',
        priority: notificationConstants.PRIORITY.NORMAL
    },
    CRITICAL_EVENTS: {
        type: 10,
        sendInterval: 0,
        message: '',
        priority: notificationConstants.PRIORITY.HIGH
    }
}

module.exports = notificationConstants;