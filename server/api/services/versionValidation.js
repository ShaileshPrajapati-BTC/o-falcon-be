"use strict";
module.exports = {


    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateRequiredCreateParams: (params) => {
        if (params
            && params.name && params.platform) {
            return true
        }
        else {
            return false;
        }
    },

    /**
     * @description validate required parameter(s)
     * @param params
     * @return {boolean}
     */
    validateRequiredUpdateParams: (params) => {
        let isValid = false;
        if (params
            && params.version_id) {
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
            && params.ids) {
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
