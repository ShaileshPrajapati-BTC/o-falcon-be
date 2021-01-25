module.exports.routes = {

    'POST /admin/IOTCommandTrack/paginate': {
        controller: 'Admin/IOTCommandTrackController',
        action: 'paginate',
        swagger: {
            summary: 'List IOT Command Callabck.',
            description: '',
            body: {}
        }
    },
}