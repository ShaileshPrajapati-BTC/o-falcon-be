module.exports = {
    MESSAGE: {
        CREATED_SUCCESS: ' created successfully.',
        UPDATED_SUCCESS: ' updated successfully.',
        CREATE_FAILED: 'Failed to create ',
        UPDATE_FAILED: 'Failed to update ',
        LIST_NOT_FOUND: ' list not found.',
        DETAIL_NOT_FOUND: ' not found.'
    },
    PASSPORT_SECRET_KEY: 'EtU0USaA9KlVjnbWVQSjsR6r0eQdn7DMbGA3rVj8ijTHE9Dm8dS7i2dmP9KjQER',
    DEVICE_TYPE: {
        ANDROID: 1,
        IPHONE: 2,
        ADMIN: 3,
        DESKTOP: 4
    },
    ACTIVITY_TYPES: {
        CREATED: 1,
        UPDATED: 2,
        REMOVED: 3,
        ACTIVE_STATUS_UPDATED: 4,
        STATUS_UPDATED: 5,
        PASSWORD_RESET: 7
    },
    // SUPPORT_REQUEST_EMAILS: [
    //     "nidhi.desai@coruscate.in",
    //     "mahidaparth7@gmail.com",
    //     "rahul.patel@coruscate.in"
    // ],
    STRIPE: {
        STATUS: {
            captured: 1,
            expired: 2,
            failed: 3,
            canceled: 3,
            pending: 4,
            refunded: 5,
            succeeded: 6,
            paid: 6
        },
        STRIPE_STATUS: {
            1: 'Captured',
            2: 'Expired',
            3: 'Failed',
            4: 'Pending',
            5: 'Refunded',
            6: 'Succeeded'
        },
        MESSAGE: {
            CARD_VERIFY_AMOUNT: 'Transaction to verify customer card.',
            RIDE_REQUEST_CONFIRMED_CHARGE: 'Transaction on the initialization of ride request.',
            FAILED_PAYMENT_CHARGE: 'Transaction on the failed of the payment.',
            RIDE_REQUEST_DONE_CHARGE: 'Transaction on the completion of ride request.',
            RIDE_REQUEST_DONE_PAYOUT: 'Transaction on the completion of ride request.',
            RIDE_REQUEST_REFUND: 'Transaction on the refund to customer.',
            CREDIT_WALLET_DONE: 'Successfully Added to the wallet.',
            DEBIT_WALLET_DONE: 'Paid for Ride ',
            RIDE_DEPOSIT_DONE_CHARGE: 'Transaction on the completion of ride deposit.',
            NEW_CUSTOMER_WALLET_CREDIT: 'System credited wallet',
            CREDIT_WALLET_PENDING: 'Payment initiated successfully. waiting for approval from payment gateway.',
            PLAN_BUY_DONE: 'Transaction on the completion of buying the plan',
            REFUND_BOOK_PLAN: 'Transaction on refund for the plan',
            EXPIRE_PAYMENT: 'Transaction is expire.',
            CREDIT_WALLET_FAILED: 'Failed to add amount in wallet due to some technical issue.',
            EXTRA_TIME_PLAN_PAYMENT: 'Transaction for extra taken time from the plan',
            BONUS_CREDIT: 'Bonus credited in wallet',
            RIDE_REQUEST_PENDING_CHARGE: 'Transaction on the pending of the payment.',
        },
        TRANSACTION_TYPE: {
            CREDIT: 1,
            DEBIT: 2,
            REFUND: 3
        }
    },
    DB_INDEXES: [
        {
            model: 'Vehicle',
            key: 'currentLocation',
            indexName: '2dsphere'
        },
        {
            model: 'Zone',
            key: 'boundary',
            indexName: '2dsphere'
        },
        {
            model: 'Nest',
            key: 'currentLocation',
            indexName: '2dsphere'
        },
    ],
    ZONE_DUMMY_USER_EMAIL: 'zoneuser@gmail.com',
    SOCKET_PAGE: {
        DASHBOARD: 'dashboard',
        VEHICLE_DETAILS: 'vehicle-details',
        RIDES: 'rides'
    },
    RIDE_TYPE: {
        DEFAULT: 1,
        SUBSCRIPTION: 2,
        LEASE: 3,
        BOOKING_PASS: 4
    }
};
