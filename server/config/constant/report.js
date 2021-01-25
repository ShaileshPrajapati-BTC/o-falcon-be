module.exports = {
    REPORT: {
        STATUS: {
            SUBMITTED: 1,
            TASK_CREATED: 2,
            CANCELED: 3,
            RESOLVED: 4
        },
        STATUS_STRING: {
            1: 'SUBMITTED',
            2: 'TASK_CREATED',
            3: 'CANCELED',
            4: 'RESOLVED'
        },
        ISSUE_TYPE: {
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
            },
            OTHER_ISSUE: {
                UNSAFE_RIDER: 1,
                BADLY_PARKED_FALCONS: 2,
                REPORT_FRAUD: 3,
                MARK_MISSING: 4
            }
        },
        ISSUE_TYPE_STRING: {
            DAMAGE_VEHICLE: {
                1: 'Handle Bar',
                2: 'Battery',
                3: 'Wheel',
                4: 'Stand',
                5: 'Other',
                6: 'Throttle',
                7: 'Brake',
                8: 'Kickstand'
            },
            LOCK_ISSUE: {
                1: 'Locked, still charging',
                2: 'Trip started on phone, still locked',
                3: 'Broken lock',
                4: 'Unauthorized lock',
                5: 'Other'
            },
            OTHER_ISSUE: {
                1: "Unsafe Rider",
                2: "Badly Parked Falcons",
                3: "Report Fraud"
            }
        },
    }
}