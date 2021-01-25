/**
 * @module FileOperator
 * @description :: helps to do file operations
 */
var path = require('path');
var fs = require('fs');
var FileService = require(sails.config.appPath + '/api/services/FileService');
var develop = require(sails.config.appPath + '/api/services/develop');
const _ = require('lodash');
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

            req.file('file').upload(FileService.documentReceiverStream(streamOptions), async (err, uploaded) => {
                if (err) {
                    throw new Error(err);
                } else {
                    /*  streamOptions.uploadedFiles = await Promise.all(_.map(streamOptions.uploadedFiles, async function (s) {
                          const awsUploadedPath = await FileService.compressImageAndUploadToS3(s.absolutePath, true);
                          s.absolutePath = sails.config.S3.baseUrl + awsUploadedPath;
                          return s
                      }));*/
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

    async uploadExcelSheet(req, res) {
        // let params = req.allParams();
        // let headers = req.headers;
        // let options = {};

        // // apply destination from parameters
        // if (params && params.destination) {
        //     options.destination = params.destination;
        //     develop.checkDirectorySync
        //         (`${sails.config.appPath}/assets/sheets/`, params.destination);
        // }

        // // apply destination from headers
        // if (headers && headers.destination) {
        //     develop.checkDirectorySync
        //         (`${sails.config.appPath}/assets/sheets/`, headers.destination);
        //     options.destination = headers.destination;
        // }

        // // append attach information
        // if (params && params.attachInfo) {
        //     options.attachInfo = params.attachInfo;
        // }
        // if (headers && (headers.attachInfo || headers.attachinfo)) {
        //     options.attachInfo = JSON.parse(headers.attachInfo || headers.attachinfo);
        // }
        // try {
        //     let uploadedFiles = [];
        //     let uploadedFilesErrors = [];
        //     let streamOptions = await FileService.buildRequest({
        //         uploadedFiles: uploadedFiles,
        //         uploadedFilesErrors: uploadedFilesErrors,
        //         destination: options.destination ?
        //             `/sheets/${options.destination}` : undefined
        //     });

        //     req.file('file').upload(FileService.documentReceiverStream(streamOptions), async function (err, uploaded) {
        //         if (err) {
        //             throw new Error(err);
        //         }
        //         /*  streamOptions.uploadedFiles = await Promise.all(_.map(streamOptions.uploadedFiles, async function (s) {
        //               const awsUploadedPath = await FileService.compressImageAndUploadToS3(s.absolutePath, true);
        //               s.absolutePath = sails.config.S3.baseUrl + awsUploadedPath;
        //               return s
        //           }));*/
        //         const response = {
        //             files: streamOptions.uploadedFiles,
        //             errors: streamOptions.uploadedFileErrors,
        //             attachInfo: options.attachInfo
        //         };
        //         const excelToJson = require('convert-excel-to-json');
        //         let result = excelToJson({
        //             sourceFile: response.files[0].path
        //         })
        //         result = result.Sheet1;

        //         let postFix = sails.config.VEHICLE_NAME_POSTFIX;
        //         let preFix = sails.config.VEHICLE_NAME_PREFIX;
        //         const vehicleType = sails.config.VEHICLE_TYPE.SCOOTER;
        //         const chargePlugIds = "5d4bc6d018463735adeb6e6f";
        //         const chargerPowerTypes = "5d4bc6e018463735adeb6e71";
        //         const manufacturer = "5d39323e1c18032550427010";
        //         const userId = "5d5e39228b522f078795e109";
        //         const lockManufacturer = "5d39324f1c18032550427012";
        //         let vehicleData = [];

        //         for (let vehicle of result) {
        //             let vehicleDetail = {
        //                 name: preFix + ' ' + postFix++,
        //                 qrNumber: vehicle.B,
        //                 userId: userId,
        //                 manufacturer: manufacturer,
        //                 imei: vehicle.A,
        //                 mac: vehicle.C,
        //                 type: vehicleType,
        //                 chargePlugIds: chargePlugIds,
        //                 chargerPowerTypes: chargerPowerTypes,
        //                 lockManufacturer: lockManufacturer,
        //                 iccid: vehicle.D
        //             }
        //             vehicleData.push(vehicleDetail);
        //         }

        //         response.vehicleData = vehicleData;
        //         await fs.unlinkSync(response.files[0].path);
        //         return res.ok(response, {
        //             message: streamOptions.uploadedFiles.length + sails.config.message.FILE_UPLOADED_SUCCESSFULLY
        //         });
        //     });
        // }
        // catch (err) {
        //     console.log('err', err);
        //     return res.serverError(null, { message: sails.config.message.ERROR, data: err });
        // }
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
                    if (FileService.getFileSize('assets/' + path) > 0) {
                        let isUnlinkFromAssets = await fs.unlinkSync('assets/' + path);
                    }
                    if (FileService.getFileSize('.tmp/public/' + path) > 0) {
                        let isUnlinkFromTemp = await fs.unlinkSync('.tmp/public/' + path);
                    }
                });
                return res.ok(null, { message: `File${params.paths.length > 1 ? 's' : ''} deleted successfully.` });
            }
            else {
                return res.badRequest(null, sails.config.message.NOT_FOUND);
            }
        }
        catch (err) {
            return res.serverError(null, { message: sails.config.message.ERROR, data: err });
        }
    }
};

