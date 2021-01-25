/**
 * @author parth.mahida on 27/04/2018
 */
const _ = require("lodash");
const async = require("async");
const DELETE_DEPENDENCY = require(sails.config.appPath + '/config/constant/deleteDependency').services;
let self = module.exports = {
    /**
     * check dependencies of module natural relation
     * @param options
     * @param callback
     */
    resolveDependenciesNatural: (options, callback) => {
        let dependencies = [];
        let dependents = sails.config.NaturalDependencies[options.model];
        async.each(dependents,

            // getting dependencies of particular model
            (value, ecb) => {
                let model = sails.models[value.model];
                let where = {
                    where: {}
                };
                let columnName = value.columnName || value.field;
                where.where[columnName] = options.documentId.toString();
                if (value.parent) {
                    async.waterfall([
                        (wcb) => {
                            model
                                .find(where, {select: [value.parent.fieldName]})
                                .exec(function (err, result) {
                                    if (err) return callback(err);
                                    if (result && result.length > 0) {
                                        wcb(null, result, value)
                                    } else {
                                        ecb();
                                    }
                                });
                        },
                        (result, value) => {
                            model = sails.models[value.parent.model];
                            let filter = {};
                            let idsArr = _.map(result, value.parent.fieldName);
                            idsArr = _.uniqBy(idsArr);
                            filter['id'] = {$in: idsArr};
                            model.count(filter).exec(function (err, count) {
                                if (err) return callback(err);
                                if (count) {
                                    dependencies.push({
                                        model: value.parent.model,
                                        count: count,
                                        idsArr: idsArr
                                    });
                                }
                                ecb();
                            });
                        }
                    ]);
                }
                else {
                    model
                        .count(where)
                        .exec(function (err, result) {
                            if (err) return callback(err)
                            if (result) {
                                dependencies.push({
                                    model: value.model,
                                    count: result
                                });
                            }
                            ecb();
                        })
                }

            },
            // return
            (err) => {
                if (err) callback(err)
                else {
                    callback(null, dependencies)
                }
            })
    },
    /**
     * check dependencies of module custom relation
     * @param options
     * @param callback
     */
    resolveDependenciesCustom: (options, callback) => {
        let dependencies = [];
        let dependents = DELETE_DEPENDENCY.CustomDependencies[options.model];
        async.each(dependents,

            // getting count of related custom field reference
            (value, ecb) => {
                let model = sails.models[value.model];
                let where = {};
                let columnName;
                if (value.fieldType === 'object') {
                    columnName = value.field + '.' + value.idFieldName;
                } else {
                    columnName = value.field;
                }
                where[columnName] = [options.documentId];
                if (value.parent) {
                    async.waterfall([
                        (wcb) => {
                            model
                                .find(where, {select: [value.parent.fieldName]})
                                .exec(function (err, result) {
                                    if (err) return callback(err);
                                    if (result && result.length > 0) {
                                        wcb(null, result, value)
                                    } else {
                                        ecb();
                                    }
                                });
                        },
                        (result, value) => {
                            model = sails.models[value.parent.model];
                            let filter = {};
                            let idsArr = _.map(result, value.parent.fieldName);
                            idsArr = _.uniqBy(idsArr);
                            filter['id'] = {$in: idsArr};
                            model.count(filter).exec(function (err, count) {
                                if (err) return callback(err);
                                if (count) {
                                    dependencies.push({
                                        model: value.parent.model,
                                        count: count,
                                        idsArr: idsArr
                                    });
                                }
                                ecb();
                            });
                        }
                    ]);
                }
                else {
                    model
                        .count(where)
                        .meta({enableExperimentalDeepTargets: true})
                        .exec(function (err, result) {
                            if (err) return callback(err);
                            if (result) {
                                dependencies.push({
                                    model: value.model,
                                    count: result
                                });
                            }
                            ecb();
                        })
                }
            },

            // return
            (err) => {
                if (err) return callback(err);
                else {
                    callback(null, dependencies);
                }
            })
    },
    /**
     * Call for natural and custom dependency
     * @param options
     * @param callback
     */
    resolveDependencies: (options, callback) => {
        async.parallel({

                // check natural dependencies
                natural: (pcb) => {
                    self
                        .resolveDependenciesNatural(options, (err, natural) => {
                            if (err) callback(err);
                            else {
                                pcb(null, natural)
                            }
                        });
                },

                // check custom dependencies
                custom: (pcb) => {
                    self
                        .resolveDependenciesCustom(options, (err, custom) => {
                            if (err) callback(err);
                            else {
                                pcb(null, custom)
                            }
                        });
                }

            },

            // return
            (err, result) => {
                if (err) callback(err)
                else {
                    callback(null, {natural: result.natural, custom: result.custom});
                }
            })
    },
    /**
     * Dependent data
     * @param options
     * @param callback
     */
    resolveDependentRecordsWithData: (options, callback) => {

        let model = sails.models[options.dependentModel];
        let naturalDependent = _.filter(DELETE_DEPENDENCY.NaturalDependencies[options.model], {model: options.dependentModel});
        let customDependent = _.filter(DELETE_DEPENDENCY.CustomDependencies[options.model], {model: options.dependentModel});
        if (options.idsArr && options.idsArr.length > 0) {
            model.find({'id': {$in: options.idsArr}}, {select: [DELETE_DEPENDENCY.DependenciesColumns[options.dependentModel]]}).exec(function (err, records) {
                callback(err, records)
            });
        } else {
            let where = {
                where: {
                    or: []
                }
            };
            if (naturalDependent) {

                _.each(naturalDependent, function (nd) {
                    where.where.or.push({});
                    let columnName = nd.columnName || nd.field;
                    where.where.or[where.where.or.length - 1][columnName] = options.documentId;
                });
            }
            if (DELETE_DEPENDENCY.DependenciesColumns[options.dependentModel]) {
                where.select = DELETE_DEPENDENCY.DependenciesColumns[options.dependentModel];
            }
            if (customDependent) {
                _.each(customDependent, function (cd) {
                    let columnName;
                    if (cd.fieldType === 'object') {
                        columnName = cd.field + '.' + cd.idFieldName;
                    } else {
                        columnName = cd.field;
                    }
                    where.where.or.push({});
                    where.where.or[where.where.or.length - 1][columnName] = options.documentId;
                });
            }
            model
                .find(where)
                .meta({enableExperimentalDeepTargets: true})
                .limit(5)
                .exec(function (err, result) {

                    callback(err, result)
                });
        }

    },

    /**
     * Loop through all dependencies
     * @param records
     * @param dependencies
     * @param cb
     */
    loopThroughDependencies: function (records, dependencies, cb) {
        var self = this;
        async.map(records, function (value, ecb) {
            self.resolveDependencies({documentId: value.documentId, model: value.model}, function (err, response) {
                if (_.size(response) > 0) {
                    _.each(response.custom, function (dep) {
                        dep.type = 'custom';
                        dep.humanizeName = DELETE_DEPENDENCY.HumanizeMapper[dep.model];
                        dependencies.push(dep);
                    });
                    _.each(response.natural, function (dep) {
                        dep.type = 'natural';
                        dep.humanizeName = DELETE_DEPENDENCY.HumanizeMapper[dep.model];
                        dependencies.push(dep);
                    });
                }
                ecb(err, response);
            });
        }, (err, result) => {
            if (result && _.size(result) > 0) {
                cb(dependencies);
            } else {
                cb(dependencies);
            }
        });
    }
};
