"use strict";

/**
 * 401 (Unauthorized) Response
 *
 * Similar to 403 Forbidden.
 * Specifically for use when authentication is possible but has failed or not yet been provided.
 * Error code response for missing or invalid authentication token.
 */

const _ = require('lodash');
const TranslationService = require('../services/Translation');

module.exports = function (data, config) {
    let language = this.req.headers.language;
    let message = _.get(config, 'message', `Missing or invalid authentication token`);
    message = TranslationService.translateMessage(message, language, null);

    let response = _.assign({
        code: _.get(config, 'code', 'E_UNAUTHORIZED'),
        message: message,
        data: data || {}
    }, _.get(config, 'root', {}));

    this.res.status(401);
    this.res.json(response);
};
