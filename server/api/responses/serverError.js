'use strict';

/**
 * 500 (Internal Server Error) Response
 *
 * A generic error message, given when no more specific message is suitable.
 * The general catch-all error when the server-side throws an exception.
 */

const _ = require('lodash');
const TranslationService = require('../services/Translation');

module.exports = async function (data, config = {}) {
    let language = this.req.headers.language;
    let response = sails.config.message.SERVER_ERROR;

    let defaultResponses = sails.config.DEFAULT_ERROR_RESPONSE_CODE;
    let configCode = config.code;

    if (configCode) {
        if (defaultResponses.indexOf(configCode) > -1) {
            response = config;
        } else {
            switch (configCode) {
                case 'E_INVALID_NEW_RECORD':
                    response = sails.config.message.CREATE_FAILED;
                    break;
                default:
                    response = sails.config.message.SERVER_ERROR;
            }
        }
    }
    await ErrorLog.create({
        userId: this.req && this.req.user && this.req.user.id ? this.req.user.id : null,
        data,
        config
    });

    response.message = TranslationService.translateMessage(response.message, language, null);

    let statusCode = config.status || 500;
    this.res.status(statusCode);
    this.res.json(response);
};
