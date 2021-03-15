var fs = require('fs');
const CommonService = require(`${sails.config.appPath}/api/services/common`);
const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);
module.exports = {

    async bulkBooleanStatusUpdate(req, res) {
        let params = req.allParams();

        if (!params || !params.ids || !params.status || !params.model) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }

        try {
            let model = sails.models[params.model];
            let paramsToUpdate = {};
            _.each(params.status, function (v, k) {
                paramsToUpdate[k] = v;
            });
            let updatedRecord = await model.update({ id: params.ids }, paramsToUpdate).fetch();
            return res.ok(updatedRecord, sails.config.message.RECORDS_STATUS_UPDATE)
        } catch (e) {
            return res.serverError(null, { message: sails.config.message.ERROR, data: err });
        }
    },
    async booleanStatusUpdate(req, res) {
        let params = req.allParams();
        console.log(params)
        if (!params || !params.id || !_.has(params, "status") || !params.fieldName || !params.model) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let model = sails.models[params.model];
            let paramsToUpdate = {};
            paramsToUpdate[params.fieldName] = params.status
            await model.update({ id: params.id }, paramsToUpdate).fetch();
            //await model.update({id:{"!=":params.id}},  {isDefault:false})
            if(params.model === 'vehicle' && !params.status){
                await RideBookingService.stopeRideOnDeActiveVehicle({vehicleIds : [params.id]});
            }
            return res.ok({}, sails.config.message.RECORDS_STATUS_UPDATE)
        } catch (e) {
            console.log(e);
            return res.serverError(null, { message: sails.config.message.ERROR, data: err });
        }
    },
    async isDefalutBooleanStatusUpdate(req, res) {
        let params = req.allParams();
        if (!params || !params.id || !_.has(params, "status") || !params.fieldName || !params.model) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let model = sails.models[params.model];
            let paramsToUpdate = {};
            paramsToUpdate[params.fieldName] = params.status;
            console.log("params to update", paramsToUpdate);
            console.log('')
            await model.update({ id: params.id }, paramsToUpdate);
            let filter = params.filter || {};
            filter.id = { '!=': params.id };
            let v1 = await model.update(filter, { isDefault: false }).fetch();
            if (v1) {
                return res.ok(v1, sails.config.message.RECORDS_STATUS_UPDATE)
            }
            //return res.ok(null, sails.config.message.RECORDS_STATUS_UPDATE)
        } catch (e) {
            return res.serverError(null, { message: sails.config.message.ERROR, data: err });
        }
    },

    async deleteRecord(req, res) {
        let params = req.allParams();
        if (!params || !params.documentId || !params.model) {
            return res.badRequest(null, sails, config.message.BAD_REQUEST);
        }
        try {
            await CommonService.checkIsParent(params.model, params.documentId);
            if (params.deleteFilter) {
                params.deleteFilter.id = params.documentId;
            } else {
                params.deleteFilter = { id: params.documentId };
            }
            if (params.isSoftDelete) {
                await sails.models[params.model].update(params.deleteFilter, { isDeleted: true });
            } else {
                await sails.models[params.model].destroy(params.deleteFilter).fetch();
            }
            return res.ok({}, sails.config.message.RECORD_DELETED_SUCCESSFULLY)
        } catch (error) {
            console.log(error);
            return res.serverError(null, error);
        }
    },

    async checkDuplicationDynamically(req, res) {
        const params = req.allParams();
        if (!params || !params.groupId || !params.modelName) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let data = await CommonService.checkDuplicationDynamically(params);
            if (data && data.length > 0) {
                return res.ok(data, sails.config.message.FOUND_DUPLICATE)
            } else {
                return res.ok(data, sails.config.message.NOT_FOUND_DUPLICATE)
            }
        } catch (error) {
            console.log(error);
            return res.serverError(null, error);
        }
    }
};
