/**
 * @module FileOperator
 * @description :: helps to do file operations
 */
var path = require('path');
var fs = require('fs');
var async = require('async');
var FileService = require(sails.config.appPath + '/api/services/FileService');
var develop = require(sails.config.appPath + '/api/services/develop');
var CommonService = require(sails.config.appPath + '/api/services/common');
const CollectionExcelGeneratorService = require(sails.config.appPath + '/api/services/CollectionExcelGenerator');
const _ = require('lodash');
var UtilService = require(sails.config.appPath + "/api/services/util");
var UserService = require(sails.config.appPath + "/api/services/user");
const { Parser } = require("json2csv");

module.exports = {
    /**
     * @description upload multiple files into specified directories
     * @param req
     * @param res
     */
    async uploadFiles(req, res) {
        let params = req.allParams();
        let headers = req.headers;
        let options = {};

        // apply destination from parameters
        if (params && params.destination) {
            options.destination = params.destination;
            develop.checkDirectorySync
                (`${sails.config.appPath}/assets/images/`, params.destination);
        }

        // apply destination from headers
        if (headers && headers.destination) {
            develop.checkDirectorySync
                (`${sails.config.appPath}/assets/images/`, headers.destination);
            options.destination = headers.destination;
        }

        // append attach information
        if (params && params.attachInfo) {
            options.attachInfo = params.attachInfo;
        }
        if (headers && (headers.attachInfo || headers.attachinfo)) {
            options.attachInfo = JSON.parse(headers.attachInfo || headers.attachinfo);
        }
        try {
            let uploadedFiles = [];
            let uploadedFilesErrors = [];
            let streamOptions = await FileService.buildRequest({
                uploadedFiles: uploadedFiles,
                uploadedFilesErrors: uploadedFilesErrors,
                destination: options.destination ?
                    `/images/${options.destination}` : undefined
            });

            req.file('file').upload(FileService.documentReceiverStream(streamOptions), (err, uploaded) => {
                if (err) {
                    throw new Error(err);
                } else {
                    const response = {
                        files: streamOptions.uploadedFiles,
                        errors: streamOptions.uploadedFileErrors,
                        attachInfo: options.attachInfo
                    };
                    return res.ok(response, {
                        message: streamOptions.uploadedFiles.length + sails.config.message.FILE_UPLOADED_SUCCESSFULLY
                    });
                }
            });
        }
        catch (err) {
            console.log('err', err);
            return res.serverError(null, { message: sails.config.message.ERROR, data: err });
        }
    },

    /**
     * @description:
     * @param req
     * @param res
     */
    async removeFiles(req, res) {
        let params = req.allParams();
        try {
            const isPaths = params && params.paths && params.paths.length;
            if (isPaths) {
                _.forEach(params.paths, async (path) => {
                    if (FileService.getFileSize('assets' + path) > 0) {
                        let isUnlinkFromAssets = await fs.unlinkSync('assets' + path);
                        console.log("    Uninkfromassets   ",isUnlinkFromAssets);
                    }
                    if (FileService.getFileSize('.tmp/public/' + path) > 0) {
                        let isUnlinkFromTemp = await fs.unlinkSync('.tmp/public/' + path);
                        console.log("    Unink from temp   ",isUnlinkFromTemp);
                    }
                });
                return res.ok({}, { message: `File${params.paths.length > 1 ? 's' : ''} ${sails.config.message.DELETE_SUCCESSFULLY.message}` });
            }
            else {
                return res.badRequest({}, sails.config.message.NOT_FOUND);
            }
        }
        catch (err) {
            return res.serverError(null, { message: sails.config.message.ERROR, data: err });
        }
    },
    async importExcel(req, res) {
        let params = req.allParams();
        try {
            let excelUploadPath = '/assets/data/excel/';
            let uploadedFile = await CommonService.storeFile(req, {
                storePath: path.join(sails.config.appPath, excelUploadPath)
            });
            console.log('uploadedFile', uploadedFile)
            let rows = await CollectionExcelGeneratorService.excelToJson(sails.config.appPath + excelUploadPath + uploadedFile.link);
            console.log('rows', rows);
            return res.ok(rows, {
                message: sails.config.message.FILE_UPLOADED_SUCCESSFULLY
            });
        } catch (e) {
            console.log('err', e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },


    async exportExcel(req, res) {
        let params = req.allParams();
        if (!params || !params.model) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        let conference_id = req.headers.conference_id;
        try {
            let obj = {};
            obj.Model = params.model;
            obj.conference_id = conference_id;
            if (params.grid) {
                obj.columns = sails.config.services.excelGrid[params.model].columns;
            }
            let response = await CollectionExcelGeneratorService.generateExcelByModel(obj);
            return res.ok(response);
        } catch (e) {
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async exportModelExcel(req, res) {
        try {
            let params = req.allParams();
            if (!params || !params.model) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let filter = {};
            if (params.fields) {
                filter.select = params.fields;
            }
            if (params.where) {
                filter.where = params.where;
            }
            let query = sails.models[params.model.toLowerCase()].find(filter);
            for (let key in params.subData) {
                if (!key) {
                    continue;
                }
                query.populate(key, { select: params.subData[key].fields });
            }
            if (params.limit) {
                query.limit(params.limit);
            }
            let data = await query;
            for (let index in data) {
                for (let key in params.subData) {
                    if (!key) {
                        continue;
                    }
                    let fields = params.subData[key].fields;
                    if (data[index][key]) {
                        for (let field in fields) {
                            data[index][
                                `${params.subData[key].prefix} ${fields[field]}`
                            ] = data[index][key][fields[field]];
                            if (
                                fields[field] === "emails" &&
                                data[index][key][fields[field]].length > 0
                            ) {
                                data[index][
                                    `${params.subData[key].prefix} ${fields[field]}`
                                ] = UtilService.getPrimaryEmail(
                                    data[index][key][fields[field]]
                                );
                            }
                            if (
                                fields[field] === "mobiles" &&
                                data[index][key][fields[field]].length > 0
                            ) {
                                data[index][
                                    `${params.subData[key].prefix} ${fields[field]}`
                                ] = UtilService.getPrimaryValue(
                                    data[index][key][fields[field]],
                                    "mobile"
                                );
                            }
                        }
                    }
                    delete data[index][key];
                }
            }
            for (let index in data) {
                if (!index) {
                    continue;
                }
                if ("emails" in data[index]) {
                    data[index]["email"] = UtilService.getPrimaryEmail(
                        data[index]["emails"]
                    );
                    delete data[index]["emails"];
                }
                if ("mobiles" in data[index]) {
                    let countryCode = "";
                    if (data[index]["mobiles"] && data[index]["mobiles"][0] && data[index]["mobiles"][0].countryCode) {
                        countryCode = data[index]["mobiles"][0].countryCode;
                    }
                    data[index]["mobile"] = UtilService.getPrimaryValue(
                        data[index]["mobiles"],
                        "mobile"
                    );
                    delete data[index]["mobiles"];
                    if (countryCode) {
                        data[index]["countryCode"] = countryCode;
                    }
                }
                if (params.model === "User") {
                    let { rideSummary } = await UserService.getUserSummary(data[index].id);
                    data[index]["totalRides"] = rideSummary.booked;
                    data[index]["completedRides"] = rideSummary.completed;
                }
            }
            if (!data || data.length === 0) {
                return res.ok({});
            }
            let destination = `${sails.config.appPath}/assets/model-export.xlsx`;
            let objFields = [];
            let firstObj = data[0];
            _.forEach(Object.keys(firstObj), (key) => {
                objFields.push(key);
            });
            const json2csvParser = new Parser({ objFields });
            const csv = json2csvParser.parse(data);
            fs.writeFileSync(destination, csv);
            return res.ok({ data, destination });
        } catch (e) {
            console.log("err", e);
            res.serverError({}, error);
        }
    },
};

