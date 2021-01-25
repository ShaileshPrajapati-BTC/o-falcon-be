module.exports = {
    TASK: {
        WORK_FLOW: {
            OPEN: 1,
            IN_PROGRESS: 2,
            COMPLETE: 3,
            CANCELLED: 4,
        },

        TASK_TYPE: {
            LEVEL_1: {
                MOVE: 1,
                DAMAGE_MOVE: 2
            },
            LEVEL_2: {
                CHARGE: 3,
                DAMAGE_CHARGE: 4,
            }
        },

        TASK_HEADING: {
            MOVE: {
                1: "Move for ride",
                2: "Move for repair",
            },
            CHARGE: {
                1: "Charge vehicle",
                2: "Replace Battery",
            },
            REPAIR: {
                1: "Repair on spot",
                2: "Collect for repair",
            },
        },
        TASK_LEVEL: {
            ONE: 1,
            TWO: 2,
            THREE: 3
        },
        LEVEL_STRING: {
            1: "LEVEL_1",
            2: "LEVEL_2",
            3: "LEVEL_3"
        },        
        REMARK: {
            SCAN_VEHICLE: "User scanned the vehicle to start task.",
            CANCEL_TASK: "User cancelled the task",
            SCAN_VEHICLE_CLAIM: "User scanned the vehicle to claim nest.",
            SCAN_VEHICLE_RELEASE: "User scanned the vehicle to release task."
        },
        MARKED: {
            CAPTURE: 1,
            RELEASED: 2,
        },
        PRIORITY: {
            URGENT: 1,
            NORMAL: 2
        }
    },
    TASK_TIME_LIMIT_TYPE: {
        MINUTES: 1,
        HOURS: 2,
        DAYS: 3,
    },
};
