'use strict';

/**
 * 200 (OK) Response
 *
 * General status code. Most common code used to indicate success.
 * The actual response will depend on the request method used.
 * In a GET request, the response will contain an entity corresponding to the requested resource.
 * In a POST request the response will contain an entity describing or containing the result of the
    action.
 */

const _ = require('lodash');
const TranslationService = require('../services/Translation');
module.exports = function (data, config, modelName = '') {
    let language = this.req.headers.language;
    if (data) {
        let resData = data.list || data;
        let isObject = false;
        if (!_.isArray(resData)) {
            isObject = true;
            resData = [resData];
        }
        resData = TranslationService.translateData(resData, language, modelName);
        if (isObject) {
            data = resData[0];
        } else {
            data.list = resData;
        }
    }

    let message = _.get(config, 'message', 'Operation is successfully executed');
    let type = '';
    if (data && ((data.type && data.imei) || data.vehicleType)) {
        type = (data.type ? data.type : null) || (data.vehicleType ? data.vehicleType : null);
    } else {
        type = null;
    }
    message = TranslationService.translateMessage(message, language, type);

    let response = _.assign({
        code: _.get(config, 'code', 'OK'),
        message: message,
        data: data || {}
    }, _.get(config, 'root', {}));

    this.res.status(200);
    this.res.json(response);
};
