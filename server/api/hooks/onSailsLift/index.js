const _ = require('lodash');
const SeederService = require('../../services/seeder');
const SocketService = require('../../services/socketEvents');

module.exports = (sails) => {
    return {
        initialize(cb) {
            // let hook = sails.hooks.swagger;
            sails.after('lifted', () => {
                /** Seed Data **/
                SeederService.seedData();
                /** listen to the socket events, they are good **/
                SocketService.socketEvents();
            });
            cb();
        }
    };
};
