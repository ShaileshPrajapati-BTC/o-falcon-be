"use strict";

/**
 * 400 (Bad Request) Response
 *
 * The request cannot be fulfilled due to bad syntax.
 * General error when fulfilling the request would cause an invalid state.
 * Domain validation errors, missing data, etc.
 */

const _ = require('lodash');
const TranslationService = require('../services/Translation');

module.exports = function (data, config) {
    let language = this.req.headers.language;
    let message = _.get(config, 'message', `The request cannot be fulfilled due to
     dependencies of other module(s).`);
    message = TranslationService.translateMessage(message, language, null);

    let response = _.assign({
        code: _.get(config, 'code', 'E_DEPENDENT'),
        message: message,
        data: data || {}
    }, _.get(config, 'root', {}));

    this.res.status(200);
    this.res.json(response);
};
