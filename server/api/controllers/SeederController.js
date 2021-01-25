var SeederService = require(sails.config.appPath + '/api/services/seeder');
module.exports = {
    async seedAdminUser(req, res) {
        try {
            let response = await SeederService.seedAdminUser();
            if (response) {
                return res.ok(response, sails.config.message.OK)
            } else {
                return res.serverError(err, sails.config.message.SERVER_ERROR)
            }
        } catch (e) {
            return res.serverError(err, sails.config.message.SERVER_ERROR)
        }
    },
    async seedUsers(req, res) {
        try {
            let response = await SeederService.seedUsers();
            if (response) {
                return res.ok(response, sails.config.message.OK)
            } else {
                return res.serverError(err, sails.config.message.SERVER_ERROR)
            }
        } catch (e) {
            return res.serverError(err, sails.config.message.SERVER_ERROR)
        }
    }
};