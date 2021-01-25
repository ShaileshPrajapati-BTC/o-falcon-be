"use strict";

/**
 * 403 (Forbidden) Response
 *
 * The request was a legal request, but the server is refusing to respond to it.
 * Unlike a 401 Unauthorized response, authenticating will make no difference.
 * Error code for user not authorized to perform the operation or the resource is unavailable for some reason.
 */

const _ = require('lodash');
const TranslationService = require('../services/Translation');

module.exports = function (data, config) {
    let language = this.req.headers.language;
    let message = _.get(config, 'message', `Token expired.`);
    message = TranslationService.translateMessage(message, language, null);

    let response = _.assign({
        code: _.get(config, 'code', 'E_TOKEN_EXPIRED'),
        message: message,
        data: data || null
    }, _.get(config, 'root', {}));
    let status = config.status || 401;
    this.res.status(status);
    this.res.json(response);
};
