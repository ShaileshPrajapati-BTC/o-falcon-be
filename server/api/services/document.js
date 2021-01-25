var path = require('path');
var fs = require('fs');
module.exports = {
    async checkDuplication(params) {
        let filter = { where: { isDeleted: false } };
        if (params.id) {
            filter.where.id = { '!=': params.id };
        }

        if (params.path) {
            filter.where.type = params.type;
            filter.where.name = params.name;
            filter.where['path'] = params.path;
            // filter.where.status = sails.config.DOCUMENT.STATUS.APPROVED;
            filter.where.referenceId = params.referenceId;

            let document = await Document.find(filter.where).meta({ enableExperimentalDeepTargets: true });
            if (document && document.length > 0) {
                return sails.config.message.DOCUMENT_UPLOADED;
            }
        }

        if (params.backPath) {
            filter.where.type = params.type;
            filter.where.name = params.name;
            filter.where['backPath'] = params.backPath;
            // filter.where.status = sails.config.DOCUMENT.STATUS.APPROVED;
            filter.where.referenceId = params.referenceId;

            let document = await Document.find(filter.where).meta({ enableExperimentalDeepTargets: true });
            if (document && document.length > 0) {
                return sails.config.message.DOCUMENT_UPLOADED;
            }
        }

        if (params.number) {
            filter.where.type = params.type;
            filter.where.name = params.name;
            filter.where['number'] = params.number;
            // filter.where.status = sails.config.DOCUMENT.STATUS.APPROVED;
            filter.where.referenceId = params.referenceId;

            let document = await Document.find(filter.where).meta({ enableExperimentalDeepTargets: true });
            if (document && document.length > 0) {
                return sails.config.message.DUPLICATE_NUMBER;
            }
        }

        return true;
    },

    async removeFiles(params) {
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
                return { isDeleted: true };
            }
            else {
                return(sails.config.message.NOT_FOUND);
            }
        }catch (err) {
            return sails.config.message.SERVER_ERROR;
        }
    }
}