'use strict';

module.exports = {
    DEFAULT_ERROR_RESPONSE_CODE: [
        'E_BAD_REQUEST',
        'E_FORBIDDEN',
        'E_NOT_FOUND',
        'E_UNAUTHORIZED',
        'E_USER_NOT_FOUND',
        'UNPROCESSABLE_ENTITY',
        'RIDE_RESERVATION_TIME_EXPIRED',
        'BASE_PAYMENT_FAILURE',
        'INSUFFICIENT_BALANCE_IN_WALLET',
        'OUT_SIDE_NEST',
        'PRIVATE_USER_CAN_USE_PROPERTY',
        'PRIVATE_RIDE_ERROR'
    ],
    SKIP_DEFAULT_FIELD: [
        'createdAt',
        'updatedAt',
        'id'
    ],
    CUSTOM_FIELD_TYPE_FOR_ARRAY: 'fieldType',

    SEEDER_DATA_CONFIG: {
        Master: {
            uniqueField: 'code'
        },
        Settings: {
            uniqueField: 'type'
        },
        SeriesGenerator: {
            uniqueField: 'type'
        },
        StaticPage: {
            uniqueField: 'code'
        },
        ActionQuestionnaireMaster: {
            uniqueField: 'question'
        },
        CancellationReason: {
            uniqueField: 'reason'
        },
        Faqs: {
            uniqueField: 'question'
        },
        PromoCode: {
            uniqueField: 'code'
        },
        BookPlan: {
            uniqueField: 'name'
        },
        ReportCategory: {
            uniqueField: 'code'
        },
        TaskFormSetting: {
            uniqueField: 'taskType'
        }
    },
    BICYCLE_TOPIC_URL: '60.254.95.5:7066',
    // VEHICLE PROVIDERS THAT PROVIDE DISTANCE ON RIDE STOP
    STOP_RIDE_FROM_IOT: [
        'ZIMO'
    ],
    // ZIMO_TOPIC_URL: 'data/Falcon/scootor/',
    FITRIDER_TOPIC_URL: 'bike',
    DEFAULT_LANGUAGE: 'en-US',
    LANGUAGES: [
        // LTR
        {
            id: 'en-US',
            name: 'English'
        },
        {
            id: 'pt-PT',
            name: 'Portuguese'
        },
        {
            id: 'es-ES',
            name: 'Spanish'
        },
        // RTL
        {
            id: 'ar-AE',
            name: 'Arabic'
        }
    ],
    RTL_LANGUAGES: [
        'ar-AE'
    ],

    MODEL_MULTI_LANGUAGE_FIELDS: {
        vehicle: {
            modelFields: [
                'manufacturer',
                'lockManufacturer'
            ]
        },
        zone: {
            modelFields: [
                'userId'
            ]
        },
        ridebooking: {
            modelFields: [
                'userId',
                'vehicleId',
                'zoneId'
            ]
        },
        transcationlog: {
            modelFields: [
                'transactionBy',
                'transactionTo',
                'rideId'
            ]
        }


    },
    CURRENCY_TYPES_ARRAY: [1, 2],
    CURRENCY_TYPES: {
        INR: 1,
        USD: 2
    },
    DISTANCE_UNIT: {
        KM: 1,
        MILES: 2
    },
    DEFAULT_DISTANCE_UNIT: 1,
    DEFAULT_MAP_CORUSCATE: {
        lat: 25.283943,
        lng: 51.3719109
    },
    DEFAULT_MAP_CORUSCATE_IOT: {
        lat: 25.283943,
        lng: 51.3719109
    },
    SHAPE_TYPE: {
        POLYGON: 'Polygon',
        RECTANGLE: 'Rectangle',
        CIRCLE: 'Circle'
    },
    OPERATIONAL_HOURS_OFF_TYPE:{
        ROUTINE_OFF : 1, 
        WEEK_OFFS:  2, 
        NOT_AVAILABLE : 3
    }
};