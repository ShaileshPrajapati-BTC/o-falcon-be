'use strict';

/**
 * 400 (Bad Request) Response
 *
 * The request cannot be fulfilled due to bad syntax.
 * General error when fulfilling the request would cause an invalid state.
 * Domain validation errors, missing data, etc.
 */
const TranslationService = require('../services/Translation');

module.exports = function (data, config) {
    let language = this.req.headers.language;
    let message = _.get(config, 'message', 'The request cannot be fulfilled due to bad syntax');
    message = TranslationService.translateMessage(message, language, null);

    let response = {
        code: _.get(config, 'code', 'E_BAD_REQUEST'),
        message: message,
        data: data || {}
    };

    this.res.status(400);
    this.res.json(response);
};
