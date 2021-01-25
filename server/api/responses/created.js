"use strict";

/**
 * 201 (Created) Response
 *
 * The request has been fulfilled and resulted in a new resource being created.
 * Successful creation occurred (via either POST or PUT).
 * Set the Location header to contain a link to the newly-created resource (on POST).
 * Response body content may or may not be present.
 */

const _ = require('lodash');
const TranslationService = require('../services/Translation');

module.exports = function (data, config) {
    let language = this.req.headers.language;
    let message = _.get(config, 'message', `The request has been fulfilled and
     resulted in a new resource being created`);
    message = TranslationService.translateMessage(message, language, null);
    let response = _.assign({
        code: _.get(config, 'code', 'CREATED'),
        message: message,
        data: data || {}
    }, _.get(config, 'root', {}));

    this.res.status(201);
    this.res.json(response);
};
