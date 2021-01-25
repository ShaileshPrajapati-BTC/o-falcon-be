module.exports = {
    /**
     * returns view of admin
     * @param req
     * @param res
     * @returns {*}
     */
    admin: function (req, res) {

        return res.view('admin/index', {user: req.user, _layoutFile: 'admin_layout.ejs'});
    },
    /**
     * returns view of admin
     * @param req
     * @param res
     * @returns {*}
     */
    front: function (req, res) {

        // do no
        if (!req.isAuthenticated()) {
            return res.view('front/login', {message: '', _layoutFile: 'front_layout.ejs'});
        }
        return res.view('front/index', {user: req.user, _layoutFile: 'front_layout.ejs'});
    },
    swagger: function (req, res) {
        return res.view('swagger', {
            _layoutFile: ''
        });
    }
};
