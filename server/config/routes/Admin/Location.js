module.exports.routes = {

    'put /admin/location/:id': {
        controller: 'Admin/LocationController',
        action: 'update'
    },
    'post /admin/location/create': {
        controller: 'Admin/LocationController',
        action: 'create'
    },
    'post /admin/location/paginate': {
        controller: 'Admin/LocationController',
        action: 'paginate'
    },
    'get /admin/location/:id': {
        controller: 'Admin/LocationController',
        action: 'view'
    },

    'post /admin/location/casecader-list': {
        controller: 'Admin/LocationController',
        action: 'getCasCaderLocationList'
    },
};
