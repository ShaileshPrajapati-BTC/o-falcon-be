module.exports.routes = {
    'POST /admin/state/paginate': {
        controller: 'Admin/Common/StateController',
        action: 'paginate',
    },

    'POST /admin/state/create': {
        controller: 'Admin/Common/StateController',
        action: 'create',
    },

    'POST /admin/state/create-multiple': {
        controller: 'Admin/Common/StateController',
        action: 'createMultipleState',
    },

    "PUT /admin/state/:id": {
        controller: "Admin/Common/StateController",
        action: "update",
    },
};
