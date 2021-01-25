module.exports.routes = {
    'POST /admin/iot/stop-ride': {
        controller: 'Admin/IotController',
        action: 'stopRide',
        swagger: {
            summary: 'stop ride',
            description: '',
            body: {}
        }
    },
    'POST /admin/iot/stop-ride-force-fully': {
        controller: 'Admin/IotController',
        action: 'stopRideForceFully',
        swagger: {
            summary: 'Stop ride force fully',
            description: '',
            body: {}
        }
    },
    'POST /admin/iot/lock-unlock': {
        controller: 'Admin/IotController',
        action: 'lockUnlock',
        swagger: {
            summary: 'lock or unlock ride',
            description: '',
            body: {}
        }
    },
    'POST /admin/iot/command': {
        controller: 'Admin/IotController',
        action: 'commandToPerform',
        swagger: {
            summary: 'command to perform',
            description: '',
            body: {}
        }
    }
};