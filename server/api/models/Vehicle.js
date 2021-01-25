module.exports = {
    tableName: "Vehicle",
    schema: true,
    attributes: {
        type: {
            type: "number",
            required: true,
            extendedDescription: sails.config.VEHICLE_TYPE,
        },
        qrNumber: {
            type: "string",
            required: true,
            unique: true,
        },
        nestId: {
            model: "Nest",
        },
        numberPlate: {
            type: "string",
            required: false,
            unique: true,
        },
        modelName: {
            type: "string",
            required: false,
        },
        image: {
            type: "json",
            columnType: "array",
            description: {
                fieldType: "string",
            },
        },
        manufacturer: {
            model: "master",
            required: true,
        },
        name: { type: "string" },
        imei: {
            type: "string",
            unique: true,
        },
        lockManufacturer: { model: "master" },
        isActive: {
            type: "boolean",
            defaultsTo: true,
        },
        isDeleted: {
            type: "boolean",
            defaultsTo: false,
        },
        multiLanguageData: {
            type: "json",
            columnType: "object",
            description: { fieldType: "object" },
        },
        registerId: { type: "string" },
        batteryLevel: {
            type: "number",
            columnType: "float",
        },
        iotBatteryLevel: {
            type: "number",
            columnType: "float",
        },
        model: { model: "master" },
        chargerPlugIds: {
            type: "json",
            columnType: "array",
            description: { fieldType: "string" },
        },
        chargerPowerTypes: {
            type: "json",
            columnType: "array",
            description: { fieldType: "string" },
        },
        franchiseeId: { model: "user" },
        lastUsed: {
            type: "string",
            columnType: "datetime",
        },
        currentLocation: {
            type: "json",
            columnType: "object",
            description: {
                name: { type: "string" },
                type: {
                    // value must be "Point"
                    type: "string",
                    extendedDescription: ["Point"],
                },
                coordinates: { type: "array" },
            },
        },
        lastLocation: {
            type: "json",
            columnType: "object",
            description: {
                name: { type: "string" },
                type: {
                    // value must be "Point"
                    type: "string",
                    extendedDescription: ["Point"],
                },
                coordinates: { type: "array" },
            },
        },
        isAvailable: {
            type: "boolean",
            defaultsTo: true,
        },
        isRideCompleted: {
            type: "boolean",
            defaultsTo: true,
        },
        chargeStatus: {
            type: "boolean",
            defaultsTo: false,
        },
        gsm: { type: "number" },
        iotCode: { type: "string" },
        vehicleCode: { type: "string" },
        iotBuildTime: { type: "number" },
        iotVersion: { type: "number" },
        scooterVersion: { type: "number" },
        ecuHardwareVersion: { type: "number" },
        ecuSoftwareVersion: { type: "number" },
        power1: { type: "number" },
        power2: { type: "number" },
        speed: { type: "number" },
        iccid: {
            type: "string",
            unique: true,
        },
        mac: {
            type: "string",
            unique: true,
        },
        acceleratorResponse: { type: "number" },
        headLight: { type: "number" },
        mode: { type: "number" },
        tailLightTwinkling: { type: "number" },
        bleKey: { type: "string" },
        connectionStatus: {
            type: "boolean",
            defaultsTo: false,
        },
        lastConnectedDateTime: {
            type: "string",
            columnType: "datetime",
        },
        lastConnectionCheckDateTime: {
            type: "string",
            columnType: "datetime",
        },
        locationUpdatedAt: {
            type: "string",
            columnType: "datetime",
        },
        isLocationChanged: {
            type: "boolean",
            defaultsTo: false,
        },
        lastLocationChanged: {
            type: "string",
            columnType: "datetime",
        },
        isVehicleOutsideZone: {
            type: "boolean",
            defaultsTo: false,
        },
        lockStatus: {
            type: "boolean",
        },
        bleCommandPassword: {
            type: "string",
        },
        networkSignal: {
            type: "number",
        },
        accelerometerSensitivity: {
            type: "number",
        },
        pingInterval: {
            type: "json",
            columnType: "object",
            description: {
                actualValue: { type: "number" },
                requestedValue: { type: "number" },
                status: {
                    type: "number",
                    defaultsTo: 1,
                },
            },
        },
        ridePingInterval: {
            type: "json",
            columnType: "object",
            description: {
                actualValue: { type: "number" },
                requestedValue: { type: "number" },
                status: {
                    type: "number",
                    defaultsTo: 1,
                },
            },
        },
        maxSpeedLimit: {
            type: "json",
            columnType: "object",
            description: {
                actualValue: { type: "number" },
                requestedValue: { type: "number" },
                status: {
                    type: "number",
                    defaultsTo: 1,
                },
            },
        },
        franchiseeRentStartDate: {
            type: "string",
            columnType: "datetime",
        },
        dealerRentStartDate: {
            type: "string",
            columnType: "datetime",
        },
        dealerLastRentPaymentDate: {
            type: "string",
            columnType: "datetime",
        },
        franchiseeLastRentPaymentDate: {
            type: "string",
            columnType: "datetime",
        },
        markedAs: {
            type: "number",
            defaultsTo: 0,
            extendedDescription: sails.config.TASK.MARKED.CAPTURE,
        },
        dealerId: {
            model: "user",
        },
        fleetType: {
            type: "json",
            columnType: "array",
            defaultsTo: [],
            description: { fieldType: "number" },
        },
        lastAlarmed: {
            type: "string",
            columnType: "datetime",
        },
        lastSpeedSet: {
            type: 'string',
            columnType: 'datetime'
        },
        lastSpeedLimit: {
            type: 'number',
            defaultsTo: 0
        },
        isTaskCreated: {
            type: 'boolean',
            defaultsTo: false
        },
        batteryLockStatus: {
            type: 'boolean'
        },
        wheelLockStatus: {
            type: 'boolean'
        },
        cableLockStatus: {
            type: 'boolean'
        },

        /**
         * Extra fields added after adding all OMNI Callbacks
         */
        speedMode: {
            type: 'number'
        },
        throttleResponse: {
            type: 'number'
        },
        inchSpeedDisplay: {
            type: 'number'
        },
        cruiseControlSetting: {
            type: 'number'
        },
        startupModeSetting: {
            type: 'number'
        },
        buttonSwitchingSpeedMode: {
            type: 'number'
        },
        keySwitchHeadlight: {
            type: 'number'
        },
        lowSpeedModeSpeedLimitValue: {
            type: 'number'
        },
        mediumSpeedModeSpeedLimitValue: {
            type: 'number'
        },
        highSpeedModeSpeedLimitValue: {
            type: 'number'
        },
        alarmStatus: { type: 'boolean' },
        voicePlayStatus: { type: 'boolean' },
        noOfSatellites: { type: 'number' },
        hdop: { type: 'number' },
        altitude: { type: 'number' },
        firmwareCompilationDate: { type: 'string' },
        scooterControllerHardwareVersion: { type: 'string' },
        uploadedFiles: { type: 'number' },

        /**
         * Nine bot extra field
         */

        faultCode: { type: 'number' },
        lockVoltage: { type: 'number' },
        odometer: { type: 'number' },
        remainingRange: { type: 'number' },
        omniCode: { type: 'string' }
    }
};
