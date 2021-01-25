"use strict";
module.exports = {


    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateRequiredCreateParams: (params) => {
        let isValid = false;
        if (params
            && params.name
            && params.code) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateRequiredUpdateParams: (params) => {
        let isValid = false;
        if (params
            && params.id) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateRequiredSequenceUpdateParams: (params) => {
        let isValid = false;
        if (params
            && params.sequences) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateRequiredActivateParams: (params) => {
        let isValid = false;
        if (params
            && _.has(params, 'isActive')
            && params.masters) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateRequiredBulkDestroyParams: (params) => {
        let isValid = false;
        if (params
            && params.masters) {
            isValid = true
        }
        return isValid;
    },


    /**
     * @description validate mobile number of user
     * @param options "{
     *                      "name":<string>,
      *                     "exceptId":<string>
     *                 }"
     * @param callback
     */
    validateName: async (options) => {
        let filter = {
            where: {
                or: []
            }
        };

        // validate by name
        if (options && options.name) {
            filter.where.or.push({
                name: options.name
            })
        }
        // validate by code
        if (options && options.code) {
            filter.where.or.push({
                code: options.code
            })
        }

        // validate by parent
        if (options && options.parentId) {
            filter.where.parentId = options.parentId

        }
        else {
            filter.where.parentId = null
        }

        // for updating record check same criteria
        // except self master id
        if (options && options.exceptId) {
            filter.where.id = {
                '!=': options.exceptId
            }
        }
        let isInvalidMaster = await Master.findOne(filter);
        return isInvalidMaster ? false : true

    },

    /**
     * @description set in active master as default
     * @param options
     * @constructor
     */
    ValidateInActiveDefault: (options) => {
        let isValid = true;
        if (!options.isActive && options.isDefault) {
            isValid = false
        }
        else {
            isValid = true;
        }

        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateListByCodeParams: (options) => {
        let isValid = false;
        if (options
            && options.masters) {
            isValid = true
        }
        return isValid;
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateDeleteDependencyCheckParams: (params) => {
        let isValid = false;
        if (params
            && params.id
            && params.type) {
            isValid = true
        }
        return isValid;
    }


};
