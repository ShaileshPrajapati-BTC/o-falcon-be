module.exports.routes = {
    'POST /api/v1/customer/ride-booking/find-nearby-scooters': {
        controller: 'Device/V1/RideBookingController',
        action: 'findNearbyScooters',
        swagger: {
            summary: 'find near by scooters.',
            description: 'find near by scooters',
            body: {
                currentLocation: {
                    type: 'array',
                    required: true,
                    items: { type: 'string' }
                }
            }
        }
    },
    'POST /api/v1/customer/ride-booking/fare-calculation': {
        controller: 'Device/V1/RideBookingController',
        action: 'calculateFare',
        swagger: {
            summary: 'Get Estimate fare.',
            description: '',
            body: {
                from: {
                    type: 'array',
                    required: true,
                    items: { type: 'string' }
                },
                to: {
                    type: 'array',
                    required: true,
                    items: { type: 'string' }
                },
                distance: {
                    type: 'number',
                    required: true
                },
                time: {
                    type: 'number',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/ride-booking/reserve-ride': {
        controller: 'Device/V1/RideBookingController',
        action: 'reserveRide',
        swagger: {
            summary: 'Reserve ride.',
            description: '',
            body: {
                vehicleId: {
                    type: 'string',
                    required: true
                },
                zoneId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/ride-booking/start-ride': {
        controller: 'Device/V1/RideBookingController',
        action: 'startRide',
        swagger: {
            summary: 'Start ride.',
            description: '',
            body: {
                qrNumber: {
                    type: 'string',
                    required: true
                }
            }
        }
    },

    'POST /api/v1/customer/ride-booking/pause-ride': {
        controller: 'Device/V1/RideBookingController',
        action: 'pauseRide',
        swagger: {
            summary: 'Pause ride.',
            description: '',
            body: {
                rideId: {
                    type: 'string',
                    required: true
                },
                currentLocation: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        name: { type: 'string' },
                        coordinates: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    'POST /api/v1/customer/ride-booking/resume-ride': {
        controller: 'Device/V1/RideBookingController',
        action: 'resumeRide',
        swagger: {
            summary: 'Resume ride.',
            description: '',
            body: {
                rideId: {
                    type: 'string',
                    required: true
                },
                currentLocation: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        name: { type: 'string' },
                        coordinates: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    },

    'POST /api/v1/customer/ride-booking/stop-ride': {
        controller: 'Device/V1/RideBookingController',
        action: 'stopRide',
        swagger: {
            summary: 'Stop ride.',
            description: '',
            body: {
                rideId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/ride-booking/cancel-ride': {
        controller: 'Device/V1/RideBookingController',
        action: 'cancelRide',
        swagger: {
            summary: 'Cancel ride.',
            description: '',
            body: {
                rideId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },


    'POST /api/v1/customer/ride-booking/ride-list': {
        controller: 'Device/V1/RideBookingController',
        action: 'rideList',
        swagger: {
            summary: 'Ride list.',
            description: 'Ride list',
            body: {}
        }
    },

    'POST /api/v1/customer/ride-booking/make-payment': {
        controller: 'Device/V1/RideBookingController',
        action: 'makePayment',
        swagger: {
            summary: 'Make Ride Payment.',
            description: 'Make Ride Payment',
            body: {
                rideId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },

    'POST /api/v1/customer/ride-booking/get-fare-data': {
        controller: 'Device/V1/RideBookingController',
        action: 'getFareData',
        swagger: {
            summary: 'get fare data by vehicleId.',
            description: '',
            body: {
                vehicleId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },

    'POST /api/v1/customer/ride-booking/send-command': {
        controller: 'Device/V1/RideBookingController',
        action: 'commandToPerform',
        swagger: {
            summary: 'Send command to Scooter.',
            description: '',
            body: {
                vehicleId: {
                    type: 'string',
                    required: true
                }
            }
        }
    },
    'POST /api/v1/customer/ride-parking-fine': {
        controller: 'Device/V1/RideBookingController',
        action: 'checkParkingIsRequired',
        swagger: {
            summary: 'Send command to Scooter.',
            description: '',
          
        }
    }

};
