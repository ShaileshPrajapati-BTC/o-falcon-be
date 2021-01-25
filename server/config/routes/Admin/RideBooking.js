module.exports.routes = {
    'POST /admin/ride-booking/paginate': {
        controller: 'Admin/RideBookingController',
        action: 'paginate',
        swagger: {
            summary: 'List Rides.',
            description: '',
            body: {
                page: { type: 'number' },
                limit: { type: 'number' },
                filter: { type: 'object' }
            }
        }
    },
    'POST /admin/ride-booking/charge-customer-for-ride': {
        controller: 'Admin/RideBookingController',
        action: 'chargeCustomerForRide',
        swagger: {
            summary: 'Charge Customer For Ride.',
            description: '',
            body: { rideId: { type: 'string' } }
        }
    },
    'POST /admin/ride-booking/export-rides': {
        controller: 'Admin/RideBookingController',
        action: 'exportRides',
        swagger: {
            summary: 'export rides.',
            description: '',
            body: {}
        }
    },
    'POST /admin/ride-booking/get-ride-location-data': {
        controller: 'Admin/RideBookingController',
        action: 'getRideLocationData',
        swagger: {
            summary: 'getRideLocationData.',
            description: '',
            body: {}
        }
    }
};