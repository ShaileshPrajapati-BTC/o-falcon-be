/**
 * NotificationSettingServices.js
 */
const _ = require("lodash");
module.exports = {

    /**
     * @description: generate next order number
     * @param callback
     */
    nextSeriesGenerate: async (options) => {

        var where = {};
        if (sails.config.IS_FRANCHISEE_ENABLED && options.franchiseeId) {
            where.franchiseeId = options.franchiseeId;
        };
        if (sails.config.IS_FRANCHISEE_ENABLED && !options.franchiseeId) {
            where.franchiseeId = null;
        }
        where.type = options.type;

        let setting = await SeriesGenerator.find(where);
        if (setting) {
            setting = _.first(setting);
            setting.totalEntry = setting.totalEntry ? setting.totalEntry + 1 : 1;
            // console.log("before saved");
            await SeriesGenerator.update({ id: setting.id }, { totalEntry: setting.totalEntry });
            // console.log("set saved");
            /**
             * Set num range format
             * e.x : if(startFrom == 0 && digitLength = 4) => start range is '0000'
             * so add extra zeros as prefix
             * @type {string}
             */
            var next_num = '' + (setting.startFrom + (setting.totalEntry || 0));

            while (next_num.length < setting.digitLength) {
                next_num = '0' + next_num;
            }

            var new_gen_num = '';


            // add prefix
            if (setting.prefix) new_gen_num = new_gen_num + '' + setting.prefix;

            // generate number
            new_gen_num = new_gen_num + '' + next_num;

            // add postfix
            if (setting.postfix) new_gen_num = new_gen_num + '' + setting.postfix;

            return { series: new_gen_num, setting: setting, totalEntry: setting.totalEntry + 1 };
        }
        else {
            return 'Please activate series generator setting.';
        }
    },
    /**
     * @description: generate next order number
     * @param callback
     */
    getSeries: async (options) => {

        var where = {
            type: options.type,
        }

        let setting = await SeriesGenerator.findOne(where)
        if (setting) {
            return setting;
        }
        else {
            return 'Please activate series generator setting.';
        }
    },

    generateNextSeries: async (setting) => {
        setting.totalEntry = setting.totalEntry ? setting.totalEntry + 1 : 1;
        /**
         * Set num range format
         * e.x : if(startFrom == 0 && digitLength = 4) => start range is '0000'
         * so add extra zeros as prefix
         * @type {string}
         */
        var next_num = '' + (setting.startFrom + (setting.totalEntry || 0));

        while (next_num.length < setting.digitLength) {
            next_num = '0' + next_num;
        }

        var new_gen_num = '';


        // add prefix
        if (setting.prefix) new_gen_num = new_gen_num + '' + setting.prefix;

        // generate number
        new_gen_num = new_gen_num + '' + next_num;

        // add postfix
        if (setting.postfix) new_gen_num = new_gen_num + '' + setting.postfix;
        return { series: new_gen_num, setting: setting };
    },

    updateSeries: async (options) => {
        var where = {
            id: options.id,
        }

        let setting = await SeriesGenerator.findOne(where)
        if (setting) {
            setting.totalEntry = options.totalEntry ? options.totalEntry : 1;
            // console.log("before saved");
            await setting.save();
            return true;
        }
        else {
            return false;
        }
    },

    appendSeriesUpdateParams: function (options) {
        let params = options.params;
        let user = options.user;

        user = _.assignIn(user, params);

        return user;
    },

    validateRequiredSeriesGenUpdateParams: (params) => {
        let isValid = false;
        if (params
            && params.id) {
            isValid = true
        }
        return isValid;
    },

    validateRequiredSeriesGenCreateParams: (params) => {
        let isValid = false;
        if (params
            && params.type) {
            isValid = true
        }
        return isValid;
    },

    validateSeriesType: async (options) => {
        let filter = {
            where: {}
        }

        // validate by user name
        if (options && options.type) {
            filter.where["type"] = options.type
        }

        // for updating record check same criteria
        // except self master id
        if (options && options.exceptId) {
            filter.where.id = {
                '!=': options.exceptId
            }
        }
        const user = await SeriesGenerator.findOne(filter)
        if (user) {
            return false;
        }
        else {
            return true;
        }
    },


    /**
     * update series generator
     * @param order_num_setting
     * @param callback
     */
    updateSeriesGeneratorSetting: function (seriesSetting, callback) {


        var totalEntry = seriesSetting.totalEntry ? seriesSetting.totalEntry + 1 : 1;

        SeriesGenerator
            .update({ id: seriesSetting.id }, { totalEntry: totalEntry })
            .exec(function (err, seriesGenerator) {


                if (callback) {
                    callback(null, seriesGenerator);
                }
                else {
                    return seriesGenerator;
                }
            })
    }

}

