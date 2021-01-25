module.exports.routes = {
    'GET /api/v1/operational-hours/get-current-day-hours': {
        controller: 'Device/V1/OperationalHoursController',
        action: 'getCurrentDateHours'
    },
}