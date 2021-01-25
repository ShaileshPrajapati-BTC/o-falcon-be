module.exports = {
    VEHICLE_TYPE: {
        SCOOTER: 1,
        BICYCLE: 2,
        BIKE: 3
    },
    IOT_VEHICLE_TYPE: [1, 2, 3],
    VEHICLE_TYPE_STRING: {
        1: 'Scooter',
        2: 'Bicycle',
        3: 'Bike'
    },
    DEFAULT_VEHICLE_TYPE: 1,
    DEFAULT_VEHICLE_TYPE_ARRAY: [1],
    VEHICLE_BATTERY_TYPE: {
        batteryLevel: `Scooter's Battery`,
        // iotBatteryLevel: `IoT's Battery`,
        // backupBatteryLevel: `Backup Battery`
    },
    CHECK_BATTERY_LEVEL_VEHICLE_TYPE: [1],
    VEHICLE_NAME_PREFIX: 'Test',
    VEHICLE_NAME_POSTFIX: 1,
    OMNI_BICYCLE_BATTERY_LEVEL: [
        { volt: 4.2, percentage: 100 },
        { volt: 4.116, percentage: 95 },
        { volt: 3.9561, percentage: 90 },
        { volt: 3.8687, percentage: 80 },
        { volt: 3.7946, percentage: 70 },
        { volt: 3.7344, percentage: 60 },
        { volt: 3.6982, percentage: 50 },
        { volt: 3.6548, percentage: 40 },
        { volt: 3.632, percentage: 30 },
        { volt: 3.5966, percentage: 20 },
        { volt: 3.5473, percentage: 10 },
        { volt: 3.4, percentage: 0 }
    ],
    IOT_COMMANDS_AND_KEYS_FOR_FILTER_CALLBACK_DATA: [
        { command: 'setMaxSpeed', key: 'maxSpeedLimit' },
        { command: 'setPingInterval', key: 'pingInterval' },
        { command: 'setRidePingInterval', key: 'ridePingInterval' }
    ],
    SET_IOT_COMMAND_STATUS: {
        pending: 0,
        success: 1
    },
    ASSIGN_VEHICLE_OPERATION_TYPE: {
        assigned: 1,
        retained: 2
    },
    VEHICLE_MANUFACTURER: {
        OMNI: 'OMNI',
        OMNI_TCP_BICYCLE: 'OMNI_TCP_BICYCLE',
        OMNI_TCP_BICYCLE_SAMPLE_LOCK: 'OMNI_TCP_BICYCLE_SAMPLE_LOCK',
        OMNI_TCP_SCOOTER: 'OMNI_TCP_SCOOTER',
        ZIMO: 'ZIMO',
        ZK_SCOOTER: 'ZK_SCOOTER',
        CORUSCATE_IOT: 'CORUSCATEIOT',
        TELTONIKA: 'TELTONIKA',
        TELTONIKA_TST100: 'TELTONIKA_TST100',
        TELTONIKA_TFT100: 'TELTONIKA_TFT100',
        TELTONIKA_FMB920: 'TELTONIKA_FMB920',
        TELTONIKA_TST100_1: 'TELTONIKA_TST100_1',
        BL10_TCP_BICYCLE: 'BL10_BICYCLE',
        NINEBOT_SCOOTER_US: 'NINEBOT_SCOOTER_US',
        NINEBOT_SCOOTER_EU: 'NINEBOT_SCOOTER_EU',
        FITRIDER_SCOOTER: 'FITRIDER_SCOOTER',
        URBANE_SCOOTER: 'URBANE_SCOOTER',
        ITRIANGLE_SCOOTER: 'ITRIANGLE_SCOOTER',
        CELLOCATOR_TCP_SCOOTER: 'CELLOCATOR_TCP_SCOOTER',
        TXED_TCP_PADDLE_BIKE: 'TXED_TCP_PADDLE_BIKE',
        GOGOBIKE_TCP_BICYCLE: 'GOGOBIKE_TCP_BICYCLE',
    },

    FIELD_NAME: {
        qrNumber: 'QR Number'
    }
};
