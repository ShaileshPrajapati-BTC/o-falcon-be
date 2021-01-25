/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on any of these options, check out:
 * https://sailsjs.com/config/globals
 */

module.exports.globals = {
    _: require('@sailshq/lodash'),
    async: require('async'),
    moment: require('moment'),
    models: true,
    services: true,
    sails: true
};
