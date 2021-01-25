module.exports = {
    NEST_TYPE: {
        RIDER: 1,
        REPAIR: 2,
        NON_RIDE: 3,
        NO_PARKING: 4,
        SLOW_SPEED: 5,
        PARKING: 6
    },
    RIDER_NEST_TYPES: [3, 4, 5, 6],
    FEEDER_NEST_TYPES: [1, 2],
    NEST_ACTIONS: {
        1: {
            message: "",
            isStickNotify: false,
            disableRidePause: false,
            disableRideEnd: false
        },
        2: {
            message: "",
            isStickNotify: false,
            disableRidePause: false,
            disableRideEnd: false
        },
        3: {
            message: "You are in a No Ride Area, you won't be able to ride the vehicle here. Please move out of the area to resume riding",
            isStickNotify: true,
            disableRidePause: false,
            disableRideEnd: false
        },
        4: {
            message: "You are in a No Parking Area, you won't be able to park the vehicle here",
            isStickNotify: true,
            disableRidePause: true,
            disableRideEnd: true
        },
        5: {
            message: "",
            isStickNotify: false,
            disableRidePause: false,
            disableRideEnd: false
        },
        6: {
            message: "",
            isStickNotify: false,
            disableRidePause: false,
            disableRideEnd: false
        }
    },
    NEST_CLAIM_TIME_TYPES: {
        MINUTE: 1,
        HOUR: 2,
    },
};
