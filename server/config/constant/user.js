module.exports = {
    USER: {
        GENDER_TYPE: {
            MALE: 1,
            FEMALE: 2
        },
        STATUS: {
            SUBMITTED: 1
        },
        // this structure has been defined for to better remember who is parent of which user
        TYPE: {
            SUPER_ADMIN: 1,
            ADMIN: 2,
            SUB_ADMIN: 3,
            STAFF: 4,
            CUSTOMER: 5,
            FEEDER: 6,
            FRANCHISEE: 11,
            DEALER: 12
        },
        ADMIN_USERS: [
            1,
            2,
            3,
            4
        ],
        PATIENT: {
            STATUS: {
                "ACTIVE": 1,
                "DISCHARGED": 2
            }
        },
        ACCOUNT_TYPE: {
            "CURRENT": 1,
            "SAVING": 2
        },
        ADDRESS_TYPE: {
            "HOME": 1,
            "WORK": 2
        },
        USER_ROLE_TITLE: {
            SUPER_ADMIN: 'super-admin',
            ADMIN: 'admin',
            SUB_ADMIN: 'sub-admin',
            STAFF: 'staff',
            CUSTOMER: 'customer',
            FRANCHISEE: 'franchisee',
            DEALER: 'dealer'
        },
        FLEET_TYPE: {
            PRIVATE: 1,
            GENERAL: 2
        },
        DOCUMENT: {
            STATUS: {
                APPROVED: 1,
                REJECTED: 2,
            }
        }
    },
    UPDATE_USER_VERIFICATION: {
        EMAIL: 1,
        MOBILE: 2
    }
};
