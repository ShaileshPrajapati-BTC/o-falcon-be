module.exports.routes = {

    'POST /admin/actionquestionnaire/create': 'Admin/ActionQuestionnaireMasterController.create',
    'POST /admin/actionquestionnaire/paginate': 'Admin/ActionQuestionnaireMasterController.paginate',
    'PUT /admin/actionquestionnaire/update/:id': 'Admin/ActionQuestionnaireMasterController.update',
    'DELETE /admin/actionquestionnaire/delete': 'Admin/ActionQuestionnaireMasterController.delete',
    'GET /admin/actionquestionnaire/:id': 'Admin/ActionQuestionnaireMasterController.view'
};
