/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {


    //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
    //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
    //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/
    /***********************************************************
     * INDEX : view -------------------------------------------*
     ***********************************************************/
    //'get /': 'Customer/RouteController.home',
    // 'get /': 'RouteController.front',
    'get /admin': 'RouteController.admin',
    // 'get /reset-password/:token': 'RouteController.resetPassword',
    'get /explorer': 'RouteController.swagger',
    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/







    /*USER*/
    'POST /user/update': 'UserController.update',
    /*TEST*/
    'POST /test/test': 'TestController.test',
    // 'POST /iot/callback': 'TestController.callbackTest',
    'POST /iot/omni-callback': 'OmniCallbackController.callbackReceived',
    /* coruscate-iot*/
    'POST /iot/coruscate-callback': 'CoruscateIOTcallbackController.callbackReceived',
    


    /**************************************************************************
     * File Upload                                                           *
     **************************************************************************/
    'post /upload-file': 'Admin/Common/FileOperatorController.uploadFiles',
    'post /delete-file': 'Admin/Common/FileOperatorController.removeFiles',
    'post /excel-file': 'Admin/Common/FileOperatorController.importExcel',

    //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
    //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
    //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝


    //  ╔╦╗╦╔═╗╔═╗
    //  ║║║║╚═╗║
    //  ╩ ╩╩╚═╝╚═╝
    //seeder
    'post /seeder/admin-user': 'SeederController.seedAdminUser',
    'post /seeder/user': 'SeederController.seedUsers',
};


