const moment = require('moment');
const fs = require('fs');
const uuid = require('uuid');
const UtilService = require('./util');
module.exports = {
    checkDirectorySync(directoryPath, folder) {
        let folders = folder.split('.');
        try {
            fs.statSync(directoryPath);
            fs.statSync(`${directoryPath}${folders[0]}`);
            if (folders.length > 1) {
                fs.statSync(`${directoryPath}${folders[0]}/${folders[1]}`);
            }
            return true;
        } catch (e) {
            try {
                fs.mkdirSync(directoryPath);
                fs.statSync(`${directoryPath}${folders[0]}`);
                if (folders.length > 1) {
                    fs.statSync(`${directoryPath}${folders[0]}/${folders[1]}`);
                }
                return true;
            } catch (e) {
                try {
                    fs.mkdirSync(`${directoryPath}${folders[0]}`);
                    if (folders.length > 1) {
                        fs.statSync(`${directoryPath}${folders[0]}/${folders[1]}`);
                    }
                    return true;
                } catch (e) {
                    try {
                        fs.mkdirSync(`${directoryPath}${folders[0]}/${folders[1]}`);
                        return true;
                    } catch (e) {
                        throw e;
                    }

                }
            }

        }
    },
    async createLogFile(json, folder) {
        let folders = folder.split('.');
        develop.checkDirectorySync(`${sails.config.appPath}/api/log/`, folder);
        let fileName = 'matched-log-' + moment(new Date()).format('DD-MM-YYYY_HH-mm-ss');
        let subFolder = '/';
        if (folders.length > 1) {
            subFolder = '/' + folders[1] + '/'
        }
        let filePath = `${sails.config.appPath}/api/log/${folders[0]}${subFolder}${fileName}.json`;

        await fs.writeFileSync(filePath, JSON.stringify(json), 'utf8');
        return filePath;
    }
}