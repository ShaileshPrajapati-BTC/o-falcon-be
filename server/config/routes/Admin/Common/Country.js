module.exports.routes = {
    'post /admin/country/paginate': {
        controller: 'Admin/Common/CountryController',
        action: 'paginate',
    },

    'POST /admin/country/create': {
        controller: 'Admin/Common/CountryController',
        action: 'create',
    },

    'POST /admin/country/create-multiple': {
        controller: 'Admin/Common/CountryController',
        action: 'createMultipleCountry',
    },

    "PUT /admin/country/:id": {
        controller: "Admin/Common/CountryController",
        action: "update",
    },
};
