module.exports.routes = {
    'POST /admin/dashboard/get-ride-summary': {
        controller: 'Admin/DashboardController',
        action: 'getRideSummary',
        swagger: {
            summary: 'summary of ride.',
            description: '',
            body: {
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                vehicleType: { type: 'array' }
            }
        }
    },

    'POST /admin/dashboard/get-statisctics': {
        controller: 'Admin/DashboardController',
        action: 'getStatistics',
        swagger: {
            summary: 'summary of statisctics.',
            description: '',
            body: {
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                vehicleType: { type: 'array' }
            }
        }
    },


    'POST /admin/dashboard/get-scooter-statisctics': {
        controller: 'Admin/DashboardController',
        action: 'getScooterStatistics',
        swagger: {
            summary: 'summary of scooter statisctics.',
            description: '',
            body: {
                vehicleType: { type: 'array' }
            }
        }
    },

    'POST /admin/dashboard/get-booking-habits': {
        controller: 'Admin/DashboardController',
        action: 'getBookingHabits',
        swagger: {
            summary: 'summary of scooter bookinh habits.',
            description: '',
            body: {
                vehicleType: { type: 'array' }
            }
        }
    },
    'POST /admin/dashboard/get-chart-data': {
        controller: 'Admin/DashboardController',
        action: 'getChartData',
        swagger: {
            summary: 'data of chart.',
            description: '',
            body: {
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                vehicleType: { type: 'array' }
            }
        }
    },

    'POST /admin/dashboard/get-vehicles': {
        controller: 'Admin/DashboardController',
        action: 'getVehicleData',
        swagger: {
            summary: 'Get vehicles for map.',
            description: '',
            body: {
                vehicleType: { type: 'array' }
            }
        }
    },
    'POST /admin/dashboard/get-franchisee-summary': {
        controller: 'Admin/DashboardController',
        action: 'getFranchiseeSummary',
        swagger: {
            summary: 'summary of franchisee.',
            description: '',
            body: {
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                vehicleType: { type: 'array' }
            }
        }
    },

    'POST /admin/dashboard/export-ride-summary': {
        controller: 'Admin/DashboardController',
        action: 'exportRideSummary',
        swagger: {
            summary: 'export summary of ride.',
            description: '',
            body: {
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                vehicleType: { type: 'array' }
            }
        }
    },

    'POST /admin/dashboard/export-total-rider-summary': {
        controller: 'Admin/DashboardController',
        action: 'exportTotalRiderSummary',
        swagger: {
            summary: 'export total rider summary.',
            description: '',
            body: {}
        }
    },

    'POST /admin/dashboard/export-total-revenue-summary': {
        controller: 'Admin/DashboardController',
        action: 'exportTotalRevenueSummary',
        swagger: {
            summary: 'export total rider summary.',
            description: '',
            body: {}
        }
    },

};
