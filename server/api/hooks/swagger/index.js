"use strict";

/**
 * https://github.com/tjwebb/sails-swagger
 */

const _ = require('lodash');
const express = require('express');
var swaggerDoc = require("./lib/swaggerDoc");

module.exports = sails => {
    return {
        defaults: function () {
            return {
                disabled: true,
                __configKey__: sails.config['swagger']
            };
        },
        initialize(cb) {
            // let hook = sails.hooks.swagger;
            sails.after('lifted', () => {
                swaggerDoc(sails, this);
            });
            cb();
        }
    }
};
