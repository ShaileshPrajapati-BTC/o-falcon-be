module.exports.routes = {
    'POST /admin/city/paginate': {
        controller: 'Admin/Common/CityController',
        action: 'paginate',
    },

    'POST /admin/city/create': {
        controller: 'Admin/Common/CityController',
        action: 'create',
    },

    'POST /admin/city/create-multiple': {
        controller: 'Admin/Common/CityController',
        action: 'createMultipleCity',
    },

    "PUT /admin/city/:id": {
        controller: "Admin/Common/StateController",
        action: "update",
    },
};
