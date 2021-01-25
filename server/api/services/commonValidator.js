module.exports = {
    getModelParams: function (attributes, parentName = '', columnType = '') {
        let modelAttributes = {
            required: [],
            unique: [],
            valueType: []
        };
        const skipDefaultFields = sails.config.SKIP_DEFAULT_FIELD;
        for (let key in attributes) {
            if (!attributes[key] || skipDefaultFields.indexOf(key) > -1) {
                continue;
            }
            const attribute = attributes[key];
            if (key === 'fieldType' || attribute === 'object') {
                continue;
            }
            if (!attribute.type && !attribute.model) {
                this.throwError(sails.config.message.REQUIRED_MODEL_TYPE, key);
            }
            if (attribute.type === 'json') {
                if (!attribute.description) {
                    this.throwError(sails.config.message.REQUIRED_MODEL_DESCRIPTION, key);
                }
                const currentColumnType = attribute.columnType ||
                    (attribute.autoMigrations && attribute.autoMigrations.columnType);
                if (!currentColumnType) {
                    this.throwError(sails.config.message.REQUIRED_MODEL_COLUMN_TYPE, key);
                }
                let parent = parentName ? `${parentName}.` : '';
                parent += key;
                // set column type for childAttributes
                if (!columnType || columnType !== 'array') {
                    columnType = currentColumnType;
                }
                const childAttr = this.getModelParams(attribute.description, parent, columnType);
                modelAttributes = this.concatObjectsArray(modelAttributes, childAttr);

                if (currentColumnType === 'array' &&
                    attribute.description[sails.config.CUSTOM_FIELD_TYPE_FOR_ARRAY] !== 'undefined'
                ) {
                    columnType = '';
                }
            } else {
                let fieldName = '';
                let fieldPath = '';
                if (columnType === 'array' && key === sails.config.CUSTOM_FIELD_TYPE_FOR_ARRAY) {
                    fieldName = parentName;
                    fieldPath = fieldName;
                } else {
                    fieldName = key;
                    fieldPath = parentName ? `${parentName}.` : '';
                    fieldPath += key;
                }
                if (columnType === 'object') {
                    fieldName = fieldPath;
                }
                if (attribute.required) {
                    modelAttributes.required.push(fieldName);
                }
                let fieldTypeObj = {
                    fieldName: fieldName,
                    fieldPath: fieldPath,
                    type: attribute.type
                };
                if (key === sails.config.CUSTOM_FIELD_TYPE_FOR_ARRAY) {
                    fieldTypeObj[key] = attribute.type;
                    fieldTypeObj.type = columnType;
                }
                if (!attribute.model) {
                    modelAttributes.valueType.push(fieldTypeObj);
                }
                if (attribute.unique ||
                    (attribute.autoMigrations && attribute.autoMigrations.unique)
                ) {
                    modelAttributes.unique.push(fieldTypeObj);
                }
            }
        }

        return modelAttributes;
    },
    validateCreateParams: async function (options) {
        try {
            this.validateParams(options);
            this.validateUnnecessaryCreateParams(options.params);

            let modelName = options.modelName.toLowerCase();
            let model = sails.models[modelName];
            let modelAttributes = this.getModelParams(model.attributes);
            let modifiedParams = this.modifyParamsAsPerKeys(
                options.params,
                modelAttributes.valueType
            );

            if (modelAttributes.required.length > 0) {
                this.validateRequiredParams(modelAttributes.required, modifiedParams);
            }

            this.validateParamsValue(modelAttributes.valueType, modifiedParams);

            if (modelAttributes.unique.length > 0) {
                await this.validateUniqueParams(modelName, modelAttributes.unique, modifiedParams);
            }

        } catch (error) {
            throw error;
        }
    },
    modifyParamsAsPerKeys: function (params, fields, parentField = '') {
        let newParams = {};
        for (let key in params) {
            if (params[key] === 'undefined') {
                continue;
            }
            const param = params[key];
            let newFieldName = parentField + key;
            const field = _.find(fields, { fieldName: newFieldName });

            if (_.isObject(param) && !_.isArray(param) && (!field || field.type === 'object')) {
                newFieldName += '.';
                const newField = this.modifyParamsAsPerKeys(param, fields, newFieldName);
                _.assign(newParams, newField);
            } else {
                newParams[newFieldName] = param;
            }
        }

        return newParams;
    },
    validateParams: function (options) {

        if (!options.params || _.isEmpty(options.params)) {
            throw sails.config.message.REQUIRED_FIELD_MISSING;
        }

        if (!options.modelName) {
            throw sails.config.message.REQUIRED_MODEL_NAME;
        }

        let modelName = options.modelName.toLowerCase();
        let model = sails.models[modelName];
        if (!model || !model.attributes) {
            throw sails.config.message.INVALID_MODEL_NAME;
        }
    },
    validateUnnecessaryCreateParams: function (params) {
        if (params.id) {
            throw sails.config.message.CREATE_FAILED_WITH_ID;
        }
    },
    validateRequiredParams: function (fields, params) {
        for (let field of fields) {
            let value = params[field];
            if (typeof value !== 'boolean' && value !== 0 && !value) {
                this.throwError(sails.config.message.IS_REQUIRED, field);
            }
        }
    },

    validateUniqueParams: async function (modelName, fields, params) {

        let where = { or: [] };
        // todo add nested select
        // let selectFields = [];

        for (let field of fields) {
            let value = params[field.fieldName];
            if (!value) {
                continue;
            }
            let condition = { [field.fieldPath]: value };

            if (params.id) {
                condition.id = { '!=': params.id };
            }
            where.or.push(condition);
            // selectFields.push(field.fieldPath);
        }

        let data = await sails.models[modelName]
            .find(where)
            .meta({ enableExperimentalDeepTargets: true });

        if (data && data.length > 0) {
            for (let field of fields) {
                let value = params[field.fieldName];

                if (!value) {
                    continue;
                }

                let splitFieldName = field.fieldPath.split('.');
                // check which field is duplicate
                let isDuplicate = this.checkValue(data, splitFieldName, value);

                if (isDuplicate) {
                    field.fieldName = this.camelCaseFieldName(field.fieldName);
                    this.throwError(sails.config.message.IS_DUPLICATE, field.fieldName);
                }
            }
        }
    },
    // todo add in utility service
    checkValue: function (data, fields, value, index = 0) {
        let isDuplicate = false;
        let dataFound;
        for (let record of data) {
            for (let i = index; i < fields.length; i++) {
                let fieldName = fields[i];
                if (record[fieldName]) {
                    dataFound = record[fieldName];
                } else if (dataFound && dataFound[fieldName]) {
                    dataFound = dataFound[fieldName];
                }
                if (dataFound && !_.isObject(dataFound) && dataFound === value) {
                    isDuplicate = true;
                    break;
                } else if (dataFound && _.isArray(dataFound)) {
                    isDuplicate = this.checkValue(dataFound, fields, value, index);
                }
            }
            if (isDuplicate) {
                break;
            }
        }

        return isDuplicate;
    },
    validateParamsValue: function (fields, params) {
        let customFieldType = sails.config.CUSTOM_FIELD_TYPE_FOR_ARRAY;
        let errMsg = sails.config.message.INVALID_FIELD_TYPE;
        for (let field of fields) {
            let value = params[field.fieldName];
            if (typeof value !== 'undefined' &&
                (
                    (field.type === 'array' && !_.isArray(value)) ||
                    (field.type !== 'array' && typeof value !== field.type)
                )
            ) {
                this.throwError(errMsg, field.fieldName, field.type);
            }
            // check field type = array's sub value
            if (field[customFieldType] !== undefined) {
                for (let key in value) {
                    if (value[key] === undefined) {
                        continue;
                    }
                    let subValue = value[key];
                    if (!subValue || typeof subValue !== field[customFieldType]) {
                        this.throwError(
                            errMsg,
                            field.fieldName,
                            `${field.type} of ${field[customFieldType]}`
                        );
                    }
                }
            }
        }
    },

    validateUpdateParams: async function (options) {
        try {
            this.validateParams(options);
            this.validateUpdateRequiredParams(options.params);

            let modelName = options.modelName.toLowerCase();
            let model = sails.models[modelName];
            let modelAttributes = this.getModelParams(model.attributes);
            let modifiedParams = this.modifyParamsAsPerKeys(
                options.params,
                modelAttributes.valueType
            );

            this.validateParamsValue(modelAttributes.valueType, modifiedParams);

            if (modelAttributes.unique.length > 0) {
                await this.validateUniqueParams(modelName, modelAttributes.unique, modifiedParams);
            }
        } catch (error) {
            throw error;
        }
    },
    validateUpdateRequiredParams: (params) => {
        if (!params.id) {
            throw sails.config.message.REQUIRED_FIELD_MISSING;
        }
    },

    /**
     * @description validate required parameter(s) for sequence update
     * @param params
     * @return {boolean}
     */
    validateRequiredSequenceUpdateParams: (params) => {
        if (!params.sequences || !_.isArray(params.sequences) || params.sequences.length < 1) {
            this.throwError(sails.config.message.IS_REQUIRED, 'sequences');
        }

    },
    throwError: (errorObj, prefix = '', suffix = '') => {
        let error = _.cloneDeep(errorObj);
        error.message = `${prefix} ${error.message} ${suffix}`;

        throw error;
    },
    concatObjectsArray: (concatToObj, concatObj) => {
        for (let key in concatToObj) {
            if (concatObj[key]) {
                concatToObj[key] = _.concat(concatToObj[key], concatObj[key]);
            }
        }

        return concatToObj;
    },
    checkRequiredParams(fields, params) {
        for (let field of fields) {
            if (typeof params[field] !== 'boolean' && params[field] !== 0 && !params[field]) {
                throw sails.config.message.BAD_REQUEST;
            }
        }
    },

    validateRequiredCreateParams: async (options) => {
        try {
            let requiredModelAttributes = [];
            let model = _.find(sails.models, { globalId: options.globalId });
            if (model && model.attributes) {
                _.forEach(model.attributes, (attribute, key) => {
                    if (attribute.required) {
                        requiredModelAttributes.push(key);
                    }
                });
            }
            if (requiredModelAttributes && requiredModelAttributes.length) {
                let invalidParams = _.filter(requiredModelAttributes, (attribute) => {
                    return !_.has(options.params, attribute);
                });
                console.log('invalidParams', invalidParams);

                return !invalidParams || !invalidParams.length;
            }

            return true;
        } catch (err) {
            console.log('err', err);
            throw err;
        }
    },

    validateRequiredUpdateParams: async (options) => {
        try {
            if (options.params && options.params.id) {
                return await commonValidator.validateRequiredCreateParams(options);
            }

            return false;
        } catch (err) {
            console.log('err', err);
            throw err;
        }
    },

    validateRequiredBulkDeleteParams: async (options) => {
        try {''
            // Setting Type
            return options.ids && options.ids.length;
        } catch (err) {
            console.log('err', err);
            throw err;
        }
    },

    camelCaseFieldName(fieldName) {
        camelCaseString = _.startCase(fieldName);
        if (fieldName === 'qrNumber') {

            return sails.config.FIELD_NAME[fieldName];
        }
        fieldName = camelCaseString ? camelCaseString : fieldName;

        return fieldName;
    }
};
