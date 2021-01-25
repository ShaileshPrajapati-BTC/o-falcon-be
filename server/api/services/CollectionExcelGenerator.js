/**
 * common functions for all
 * @description
 * @type {{}}
 */

const Excel = require('exceljs');
const path = require('path');
//const findRemoveSync = require("find-remove");
var fs = require('fs');
var _ = require('lodash');
const EXCEL_CELL_FONT_FAMILY = 'arial';
const EXCEL_CELL_FONT_COLOR_NUM = 'red';
const EXCEL_CELL_FONT_SIZE = 8;
const CommonServices = require('./common');
const UtilService = require('./util');
module.exports = {
    /**
     * @function generateExcel
     * @description generate excel from grid
     * @param options : "{
     *                      "data":[{}]
     *                      "extension":<string>
     *                      "columns":[{}]
     *                      "excelName":<string>
     *                      "sheetName":<string>
     *                  }"
     * @param  return <promise>
     * @author Bhavesh Bheda
     */
    async generateExcel(options) {
        var destPath = path.join(sails.config.appPath, '/.tmp/public/excel-temp/');
        var excelName = Math.random() * 1000;
        var extension = '.xlsx';
        var gridColumn = options.columns;
        let PopulateMapper = sails.config.services.populateExcelMapper;
        if (options.excelName) {
            excelName = options.excelName;
        }
        // set extension to excel name
        if (options.extension && options.extension.toLowerCase() == 'csv') {
            extension = '.csv';
        }
        // check file is already exist or note
        excelName = await new Promise((resolve, reject) => {
            fs.stat(destPath + excelName + extension, function (err, stat) {
                if (err == null) {
                    resolve(excelName + '-' + UtilService.randomString(4, '01234567890123456789') + extension);
                } else {
                    resolve(excelName + extension);
                }

            });
        });
        // Creating Workbook
        var workbook = new Excel.Workbook();
        var sheet = workbook.addWorksheet(options.sheetName ? options.sheetName : 'Sheet-1');
        var excelColumn = [];
        // set header
        let columnBasicConfig = {
            alignment: {
                vertical: 'middle',
                horizontal: 'center'
            },
            style: {
                numFmt: '0.00',
                font: {
                    name: EXCEL_CELL_FONT_FAMILY,
                    color: { argb: EXCEL_CELL_FONT_COLOR_NUM },
                    family: 2,
                    size: EXCEL_CELL_FONT_SIZE + 2,
                    bold: true
                }
            }
        };
        _.forEach(gridColumn, (column, cb) => {
            var hidden = false;
            if (sails.config.services.nonExportFields.indexOf(column.field) >= 0) {
                hidden = true;
            }
            excelColumn.push(_.extend({
                header: column.title,
                key: column.field,
                width: column.excel_column_width || 8,
                hidden: hidden
            }, columnBasicConfig));
        });
        _.each(options.model.attributes, (attr, key) => {
            if (attr.model) {
                excelColumn.push(_.extend({
                    header: (key + '_model').toUpperCase(),
                    key: key + '_model',
                    width: 8,
                    hidden: true
                }, columnBasicConfig));
            }
        });
        sheet.columns = excelColumn;
        // set data in sheet by column
        var srNo = 1;
        _.each(options.data, (d) => {
            var obj = {};
            _.each(gridColumn, function (column) {


                if (column.field == 'srNo') {
                    obj[column.field] = srNo;
                    srNo++;
                } else {
                    // separate column info
                    var columnField = column.field.split('.');
                    let fieldSchema = options.model.attributes[column.field];

                    if (columnField.length == 2) {
                        if (d[columnField[0]] != null && d[columnField[0]][columnField[1]] != null) {
                            let value = d[columnField[0]][columnField[1]];
                            // is boolean
                            if (_.isBoolean(value)) {
                                obj[column.field] = value ? 'YES' : 'NO';
                            } else if (_.isNumber(value)) { // is Numeric
                                obj[column.field] = value;
                            } else {// default String
                                obj[column.field] = value.toString();
                            }
                        } else {// Empty
                            obj[column.field] = '-';
                        }
                    }
                    else if (d[columnField[0]] != null) {
                        // is Bool
                        if (_.isBoolean(d[columnField[0]])) {
                            obj[column.field] = d[columnField[0]] ? 'YES' : 'NO';
                        }

                        // is numeric
                        else if (_.isNumber(d[columnField[0]])) {
                            obj[column.field] = d[columnField[0]];
                        } else if (_.isArray(d[columnField[0]])) { // is array
                            if (_.size(d[columnField[0]]) > 0) {//value is not null
                                let firstValue = _.first(d[columnField[0]]);
                                if (_.isObject(firstValue)) {//is object
                                    obj[column.field] = JSON.stringify(d[columnField[0]]);
                                } else {//is string
                                    obj[column.field] = d[columnField[0]].join(',');
                                }
                            } else {//null
                                obj[column.field] = '';
                            }
                        } else {  // string
                            if (fieldSchema.model) {
                                obj[column.field] = d[columnField[0]][PopulateMapper[fieldSchema.model].populateField];
                                obj[column.field + '_model'] = d[columnField[0]].id;
                            } else {
                                obj[column.field] = d[columnField[0]].toString();
                            }
                        }
                    } else {// Empty
                        obj[column.field] = '-';
                    }
                }
            });
            sheet.addRow(obj);
        });
        // Formatting Rows common row style
        sheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            row.style = {
                numFmt: '0000.00',
            };
            // Specify border
            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                if (rowNumber == 1) {
                    cell.style = {
                        font: {
                            name: EXCEL_CELL_FONT_FAMILY,
                            size: EXCEL_CELL_FONT_SIZE + 2,
                            family: 4,
                            underline: true,
                            bold: true
                        },
                        alignment: {
                            vertical: 'middle',
                            horizontal: 'center'
                        },
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    };
                }
                else {
                    cell.style = {
                        font: {
                            name: EXCEL_CELL_FONT_FAMILY,
                            size: EXCEL_CELL_FONT_SIZE,
                            family: 4,
                            //  underline: true,
                            //  bold: true
                        },
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    };
                }
            });
            row.commit();
        });
        return new Promise((resolve, reject) => {
            workbook.xlsx.writeFile(destPath + excelName).then(function () {
                resolve({
                    flag: true,
                    data: '/excel-temp/' + excelName,
                    excelPath: destPath + excelName,
                    excelName: excelName,
                    message: 'Success'
                });
            });
        });
    },

    /**
     * generate excel by model
     * @param options={
     *              Model:<model>
     * }
     * @returns {Promise.<void>}
     */
    async generateExcelByModel(options) {
        let requestObj = {};
        let Model = sails.models[options.Model];
        if (options.columns) {
            requestObj.columns = options.columns;
        }
        else {
            // get all keys of model
            let columns = [];
            _.each(Model.attributes, (attr, key) => {
                if (attr.type === 'json' && attr.columnType !== 'array') {
                    _.each(attr.description, (subField, k) => {
                        columns.push({
                            title: (key + '.' + k).replace(/([A-Z])/g, ' $1').toUpperCase(),
                            field: key + '.' + k
                        });
                    });
                } else {
                    columns.push({
                        title: key.replace(/([A-Z])/g, ' $1').toUpperCase(),
                        field: key
                    });
                }
            });
            requestObj.columns = columns;
        }
        // get data
        if (options.data) {
            requestObj.data = options.data;
        }
        let where = {};
        if (Model.attributes.conference_id) {
            where = {
                conference_id: options.conference_id
            };
        }
        requestObj.data = await Model.find(where).populateAll();
        requestObj.model = Model;
        //add other detail like extension,sheet name, etc...
        if (options.extension) {
            requestObj.extension = options.extension;
        }
        if (options.sheetName) {
            requestObj.sheetName = options.sheetName;
        }
        return this.generateExcel(requestObj);
    },

    /**
     *
     * @param option={
     *          removed:[<dir path from root of project>]
     * }
     * @returns {Promise.<removed>}
     */
    async removeOldFileDir(option) {
        for (let dir in option.removed) {
            return findRemoveSync(path.join(sails.config.appPath, dir), {
                age: { seconds: 3600 },
                dir: '*',
                files: '*.*',
                ignore: 'index.html'
            });
        }

    },
    /**
     *
     * @param path
     * @returns {Array}
     */
    async excelToJson(path) {
        let workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(path);
        let workSheet = workbook.getWorksheet(1);
        let rows = [];
        let column = [];
        workSheet.eachRow({}, function (row, rowNumber) {
            let data = row.values.slice(1);
            if (rowNumber === 1) {
                column = data;
            } else {
                let json = {};
                _.each(column, (key, index) => {
                    json[key] = data[index];
                });
                rows.push(json);
            }
        });
        return rows;
    },
    formatSheetRecordsToImport(records, model) {
        let response = [];
        _.each(records, (row) => {
            let json = {};
            _.each(row, async (fieldValue, key) => {
                if (key !== 'SR NO' && (fieldValue !== '' && fieldValue !== '-')) {
                    key = key.toLowerCase();
                    if (key === 'created at') {
                        key = 'createdAt';
                    } else if (key === 'updated at') {
                        key = 'updatedAt';
                    }
                    if (model.attributes[key]) {
                        if (model.attributes[key].type) {
                            if (model.attributes[key].autoMigrations.columnType && model.attributes[key].autoMigrations.columnType.toLowerCase() === 'array') {
                                if (_.size(fieldValue) > 0 && !_.isObject(fieldValue[0])) {
                                    fieldValue = fieldValue.split(',');
                                }
                            }
                        } else if (model.attributes[key].model) {
                            fieldValue = '';
                            if (row[key.toUpperCase() + '_MODEL']) {
                                fieldValue = row[key.toUpperCase() + '_MODEL'];
                            }
                        }
                    } else {
                        fieldValue = '';
                    }
                    if (fieldValue === 'NO') {
                        fieldValue = false;
                    } else if (fieldValue === 'YES') {
                        fieldValue = true;
                    }
                    json[key] = fieldValue;
                }
            });
            response.push(json);
        });

        return response;
    },

    async demoVehicleExcel(options) {
        var destPath = path.join(sails.config.appPath, '/assets/');
        var excelName = "Vehicle_Details_Export";
        var extension = '.xlsx';
        if (options.excelName) {
            excelName = 'export.xlsx';
        }
        // set extension to excel name
        if (options.extension && options.extension.toLowerCase() == 'csv') {
            extension = '.csv';
        }
        // check file is already exist or note
        excelName = await new Promise((resolve, reject) => {
            fs.stat(destPath + excelName + extension, function (err, stat) {
                if (err == null) {
                    resolve(excelName + extension);
                } else {
                    resolve(excelName + extension);
                }

            });
        });
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("My Sheet");
        let header = [];
        var obj = [];
        let booleanData = false;
        let type = false;
        await Promise.all(_.map(options.data, async (newData, key) => {
            header.push({ header: key.toUpperCase(), key: key.toUpperCase(), width: 16 })
            if (_.isBoolean(newData)) {
                booleanData = true;
            } else if (_.isNumber(newData)) { // is Numeric
                obj.push(newData);
            } else if (key === 'Type') { // is Numeric
                type = true;
            } else {// default String
                obj.push(newData.toString());
            }
        }));
        worksheet.columns = header;
        await worksheet.addRow(obj);

        const vehicle = [];
        let vehicleType = [];
        _.each(sails.config.VEHICLE_TYPE_STRING, (type) => {
            type = type.toUpperCase();
            vehicle.push(type)
        });
        let newString = vehicle.join(", ");
        vehicleType.push(newString);
        worksheet.getCell('D2').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: vehicleType
        };

        // let allUser = await User.find({
        //     select: ["firstName", "lastName"],
        //     where: { type: 2 }
        // });
        // let username = '';
        // let user = [];
        // let newUser = [];
        // _.each(allUser, (userData) => {
        //     username = userData.firstName + " " + userData.lastName;
        //     user.push(username)
        // });
        // let newString1 = user.join(", ");
        // newUser.push(JSON.stringify(newString1));
        // worksheet.getCell('F2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: newUser
        // };

        let parentManufacturer = await Master.findOne({ code: "MANUFACTURER", isDeleted: false });
        let allManufacturer = await Master.find({
            select: ['name'],
            where: { parentId: parentManufacturer.id }
        });
        let newManufacture = await CommonServices.filterData(allManufacturer);
        worksheet.getCell('E2').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: newManufacture
        };

        let parentLockManufacturer = await Master.findOne({ code: "LOCK_MANUFACTURER", isDeleted: false });

        let lockManufacturer = await Master.find({
            select: ['name'],
            where: { parentId: parentLockManufacturer.id }
        });
        let newLockManufacturer = await CommonServices.filterData(lockManufacturer);
        worksheet.getCell('G2').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: newLockManufacturer
        };

        let parentChargingPlug = await Master.findOne({ code: "CHARGING_PLUG", isDeleted: false });

        let chargingPlug = await Master.find({
            select: ['name'],
            where: { parentId: parentChargingPlug.id }
        });
        let newChargingPlug = await CommonServices.filterData(chargingPlug);
        worksheet.getCell('H2').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: newChargingPlug
        };

        let parentChargingPower = await Master.findOne({ code: "CHARGING_POWER", isDeleted: false });
        let chargingPower = await Master.find({
            select: ['name'],
            where: { parentId: parentChargingPower.id }
        });
        let newChargingPower = await CommonServices.filterData(chargingPower);

        worksheet.getCell('I2').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: newChargingPower
        };
        // Formatting Rows common row style
        await worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            row.style = {
                numFmt: '0000.00',
            };
            // Specify border
            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                if (rowNumber == 1) {
                    cell.style = {
                        font: {
                            name: EXCEL_CELL_FONT_FAMILY,
                            size: EXCEL_CELL_FONT_SIZE + 2,
                            family: 4,
                            underline: true,
                            bold: true
                        },
                        alignment: {
                            vertical: 'middle',
                            horizontal: 'center'
                        },
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    };
                }
                else {
                    cell.style = {
                        font: {
                            name: EXCEL_CELL_FONT_FAMILY,
                            size: EXCEL_CELL_FONT_SIZE,
                            family: 4,
                            //  underline: true,
                            //  bold: true
                        },
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    };
                }
            });
            row.commit();
        });

        return new Promise((resolve, reject) => {
            workbook.xlsx.writeFile(destPath + excelName).then(function () {
                resolve({
                    flag: true,
                    data: '/assets/' + excelName,
                    excelPath: destPath + excelName,
                    excelName: excelName,
                    message: 'Success'
                });
            });
        });
    },

    async importVehicleExcel(path) {
        const upperCaseAlp = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        let workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(path);
        let workSheet = workbook.getWorksheet(1);
        let rows = [];
        let newRows = [];
        let column = [];
        let header = sails.config.EXCEL_HEADER;
        let headerTitleError = [];
        let rowError = [];
        let newImei = [];
        let quNumbers = [];
        let macAddress = [];

        workSheet.eachRow({}, function (row, rowNumber) {
            let data = row.values.slice(1);
            console.log(data);

            if (rowNumber === 1) {
                column = data;
                _.each(column, (key, index) => {
                    console.log(UtilService.getFloat(index) > 8);
                    if (UtilService.getFloat(index) > 8) {
                        let cell = UtilService.getFloat(index) + 1;
                        let message = `Headers are right but new header ${upperCaseAlp[index]}${cell} added after all header`;
                        headerTitleError.push(message);
                    }
                });
                for (key in header) {
                    if (column.length >= 9) {
                        if (!column[key]) {
                            let cell = UtilService.getFloat(key) + 1;
                            headerTitleError.push(`Header ${upperCaseAlp[key]}${cell} is empty, It must be ${header[key]}`);
                        }
                    } else if (header[key] !== column[key]) {
                        let cell = UtilService.getFloat(key) + 1;
                        let message = `Header ${upperCaseAlp[key]}${cell} header is invalid, It must be ${header[key]}`;
                        headerTitleError.push(message);
                    }
                };

            } else {
                let json = {};
                let jsonStringKey = {};
                _.each(column, (key, index) => {
                    jsonStringKey[key] = data[index];
                    json[index] = data[index];
                });
                rows.push(json);
                newRows.push(jsonStringKey);
            }
        });
        if (headerTitleError && headerTitleError.length) {
            return headerTitleError;
        }
        for (key in rows) {
            await Promise.all(_.map(rows[key], async (newKey, index) => {
                if ((!rows[key][index]) && sails.config.EXCEL_HEADER[index] !== rows[key][index]) {
                    let cell = UtilService.getFloat(index);
                    let rowIndex = UtilService.getFloat(key) + 2;
                    let keyName = sails.config.EXCEL_HEADER[index];
                    if (
                        keyName === 'NAME'
                        || keyName === 'IMEI'
                        || keyName === 'QR NUMBER'
                        || keyName === 'TYPE'
                        || keyName === 'MANUFACTURER'
                    ) {
                        rowError.push(`Cell ${upperCaseAlp[cell]}${rowIndex} is empty. ${keyName} is required!`);
                    }
                } else {
                    if (sails.config.EXCEL_HEADER[index] == 'IMEI') {
                        // let cell = UtilService.getFloat(key) + 2;
                        // imeiCell = `${upperCaseAlp[key]}${cell}`;
                        newImei.push(rows[key][index]);
                    }
                    if (sails.config.EXCEL_HEADER[index] == 'QR NUMBER') {
                        quNumbers.push(rows[key][index]);
                    }
                    if (sails.config.EXCEL_HEADER[index] == 'MAC ADDRESS') {
                        macAddress.push(rows[key][index]);
                    }
                    if (sails.config.EXCEL_HEADER[index] == 'TYPE') {
                        let rowIndex = UtilService.getFloat(key) + 2;
                        let cell = UtilService.getFloat(index);
                        let message = `Wrong value in ${upperCaseAlp[cell]}${rowIndex}, It must be type and select from drop down menu`;
                        if (typeof rows[key][index] !== 'string') {
                            rowError.push(message);
                        } else {
                            let newVehicle = rows[key][index].toUpperCase();
                            let type = sails.config.VEHICLE_TYPE[newVehicle];
                            let typeString = sails.config.VEHICLE_TYPE_STRING[type];
                            if (!typeString) {
                                rowError.push(message);
                            }
                            newRows[key]['TYPE'] = type ? type : null;
                        }
                    } else if (sails.config.EXCEL_HEADER[index] == 'USER') {
                        let cell = UtilService.getFloat(index);
                        let rowIndex = UtilService.getFloat(key) + 2;
                        if (typeof rows[key][index] !== 'string') {
                            rowError.push(`Wrong value in ${upperCaseAlp[cell]}${rowIndex}, It must be name. Select from drop down.`);
                        } else {
                            let newUser = await CommonServices.getAndCompareMaster(rows[key][index], sails.config.EXCEL_HEADER[5]);
                            if (!newUser) {
                                rowError.push(`Wrong value in ${upperCaseAlp[cell]}${rowIndex}, It must be name`);
                            }
                            newRows[key]['USER'] = newUser ? newUser.id : null;
                        }
                    } else if (sails.config.EXCEL_HEADER[index] == 'MANUFACTURER') {
                        let rowIndex = UtilService.getFloat(key) + 2;
                        let cell = UtilService.getFloat(index);
                        let message = `Wrong value in ${upperCaseAlp[cell]}${rowIndex}, It must be manufacturer and select from drop down menu`;
                        if (typeof rows[key][index] !== 'string') {
                            rowError.push(message);
                        } else {
                            let manufacturer = await CommonServices.getAndCompareMaster(rows[key][index], sails.config.EXCEL_HEADER[6]);
                            if (!manufacturer) {
                                rowError.push(message);
                            }
                            newRows[key]['MANUFACTURER'] = manufacturer.id;
                        }
                    } else if (sails.config.EXCEL_HEADER[index] == 'LOCK MANUFACTURER') {
                        let rowIndex = UtilService.getFloat(key) + 2;
                        let cell = UtilService.getFloat(index);
                        let message = `Wrong value in ${upperCaseAlp[cell]}${rowIndex}, It must be lock manufacturer and select from drop down menu`;
                        if (typeof rows[key][index] !== 'string') {
                            rowError.push(message);
                        } else {
                            let lockManufacturer = await CommonServices.getAndCompareMaster(rows[key][index], sails.config.EXCEL_HEADER[7]);
                            if (!lockManufacturer) {
                                rowError.push(message);
                            }
                            newRows[key]['LOCK MANUFACTURER'] = lockManufacturer ? lockManufacturer.id : null;
                        }
                    } else if (sails.config.EXCEL_HEADER[index] == 'CHARGER PLUG') {
                        let rowIndex = UtilService.getFloat(key) + 2;
                        let cell = UtilService.getFloat(index);
                        let message = `Wrong value in ${upperCaseAlp[cell]}${rowIndex}, It must be charging plug and select from drop down menu`;
                        if (typeof rows[key][index] !== 'string') {
                            rowError.push(message);
                        } else {
                            let chargingPlug = await CommonServices.getAndCompareMaster(rows[key][index], sails.config.EXCEL_HEADER[8]);
                            if (!chargingPlug) {
                                rowError.push(message);
                            }
                            newRows[key]['CHARGER PLUG'] = chargingPlug ? chargingPlug.id : null;
                        }
                    } else if (sails.config.EXCEL_HEADER[index] == 'CHARGER POWER') {
                        let rowIndex = UtilService.getFloat(key) + 2;
                        let cell = UtilService.getFloat(index);
                        let message = `Wrong value in ${upperCaseAlp[cell]}${rowIndex}, It must be charging power and select from drop down menu`;
                        if (typeof rows[key][index] !== 'string') {
                            rowError.push(message);
                        } else {
                            let chargingPower = await CommonServices.getAndCompareMaster(rows[key][index], sails.config.EXCEL_HEADER[9]);
                            if (!chargingPower) {
                                rowError.push(message);
                            }
                            newRows[key]['CHARGER POWER'] = chargingPower ? chargingPower.id : null;
                        }
                    }
                }
            }));
            _.mapKeys(newRows[key], function (value, index) {
                if (index == 'NAME') {
                    newRows[key]['name'] = value;
                    delete newRows[key][index];
                } else if (index == 'IMEI') {
                    newRows[key]['imei'] = value;
                    delete newRows[key][index];
                } else if (index == 'QR NUMBER') {
                    newRows[key]['qrNumber'] = value;
                    delete newRows[key][index];
                } else if (index == 'MAC ADDRESS') {
                    newRows[key]['mac'] = value;
                    delete newRows[key][index];
                } else if (index == 'TYPE') {
                    newRows[key]['type'] = value;
                    delete newRows[key][index];
                } else if (index == 'USER') {
                    newRows[key]['userId'] = value;
                    delete newRows[key][index];
                } else if (index == 'MANUFACTURER') {
                    newRows[key]['manufacturer'] = value;
                    delete newRows[key][index];
                } else if (index == 'LOCK MANUFACTURER') {
                    newRows[key]['lockManufacturer'] = value;
                    delete newRows[key][index];
                } else if (index == 'CHARGER PLUG') {
                    newRows[key]['chargerPlugIds'] = value;
                    delete newRows[key][index];
                } else if (index == 'CHARGER POWER') {
                    newRows[key]['chargerPowerTypes'] = value;
                    delete newRows[key][index];
                }
            });
        }

        if (newImei && newImei.length) {
            let vehicleImeiAlreadyExist = await Vehicle.find({ imei: newImei, isDeleted: false });
            if(vehicleImeiAlreadyExist.length){
                let alreadyExistImei = [];
                for(let duplicateImei of vehicleImeiAlreadyExist){
                    alreadyExistImei.push(duplicateImei.imei)
                }
                if (vehicleImeiAlreadyExist.length) {
                    rowError.push(`IMEI ${alreadyExistImei} already exist!`);
                }
            }
            let duplicateImei = await CommonServices.filterArrayDuplicate(newImei);
            if (duplicateImei.length) {
                rowError.push(`IMEI ${duplicateImei} is duplicate. Invalid IMEI value!`);
            }
        }

        if(quNumbers && quNumbers.length){
            let qrNumberAlreadyExist = await Vehicle.find({ qrNumber: quNumbers, isDeleted: false });
            if(qrNumberAlreadyExist.length){
                let alreadyExistQRNumber = [];
                for(let duplicateQR of qrNumberAlreadyExist){
                    alreadyExistQRNumber.push(duplicateQR.qrNumber)
                }
                if (qrNumberAlreadyExist.length) {
                    rowError.push(`QR number ${alreadyExistQRNumber} already exist!`);
                }
            }
            let duplicateQRNumber = await CommonServices.filterArrayDuplicate(quNumbers);
            if (duplicateQRNumber.length) {
                rowError.push(`QR number ${duplicateQRNumber} is duplicate. Invalid QR Number value!`);
            }
        }

        if(macAddress && macAddress.length){
            let macAddressAlreadyExist = await Vehicle.find({ mac: macAddress, isDeleted: false });
            if(macAddressAlreadyExist.length){
                let alreadyExistMac = [];
                for(let duplicateMac of macAddressAlreadyExist){
                    alreadyExistMac.push(duplicateMac.mac)
                }
                if (alreadyExistMac.length) {
                    rowError.push(`MAC Address ${alreadyExistMac} already exist!`);
                }
            }
            let duplicateMac = await CommonServices.filterArrayDuplicate(macAddress);
            if (duplicateMac.length) {
                rowError.push(`MAC Address ${duplicateMac} is duplicate. Invalid MAC Address value!`);
            }
        }

        if (rowError.length) {
            return rowError;
        }

        let newVehicle = [];
        for(let vehicleData of newRows){
            let createdVehicle = await Vehicle.create(vehicleData).fetch();
            newVehicle.push(createdVehicle);
        }

        if (newVehicle && newVehicle.length) {
                        
            return newVehicle;
        }

        return [];
    },

};
