const fs = require('fs');
const moment = require('moment');
module.exports = {
    async downloadFile(req, res) {
        try {
            let params = req.allParams();
            let string = await fs.readFileSync(sails.config.appPath + '/api/data/discount-price/shape/' + params.fileName);
            res.set('Content-Type', 'application/octet-stream');
            return res.status(200).send(string);
        } catch (e) {
            console.log(e);
            return res.serverError(err, sails.config.message.SERVER_ERROR)
        }
    },
    async sync(req, res) {
        let params = req.allParams();
        if (!params || !params.lastSyncDate || !params.homeId) {
            return res.badRequest({}, sails.config.message.BAD_REQUEST);
        }
        let loggedInUser = req.user;
        try {
            let syncResponse = {}
            let home = await Clientele.findOne({
                type: sails.config.CLIENTELE.TYPE.HOME,
                id: params.homeId
            });
            syncResponse.homes = [home];
            if (home.parentId) {
                syncResponse.pharmacy = await Clientele.findOne({ where: { id: home.parentId, updatedAt: { ">=": params.lastSyncDate } }, select: ["name", "phone", "faxes"] });
            }
            //home areas details
            syncResponse.homeAreas = await Clientele.find({
                updatedAt: { ">=": params.lastSyncDate },
                type: sails.config.CLIENTELE.TYPE.HOME_AREA,
                parentId: params.homeId
            });
            //homes
            if (syncResponse.homeAreas && _.size(syncResponse.homeAreas) > 0) {

                //doctors
                syncResponse.loggedInUser = loggedInUser;
                syncResponse.doctors = await User.find({
                    updatedAt: { ">=": params.lastSyncDate },
                    type: sails.config.USER.TYPE.HOME.HOME_AREA.DOCTOR,
                    "parentClientele.id": _.map(syncResponse.homeAreas, "id")
                }).meta({ enableExperimentalDeepTargets: true });
                syncResponse.patients = await User.find({
                    where: {
                        type: sails.config.USER.TYPE.HOME.HOME_AREA.PATIENT,
                        "parentClientele.id": _.map(syncResponse.homeAreas, "id"),
                        "updatedAt": { ">=": params.lastSyncDate }
                    }
                }).populate("patientInfoId").meta({ enableExperimentalDeepTargets: true });
                console.log(syncResponse.patients.length)
                let patients = _.filter(syncResponse.patients, function (a) {
                    return !a.patientInfoId.nhDeceasedDate.length;
                });
                syncResponse.patients = patients;
                _.each(syncResponse.patients, function (patient) {
                    patient.homeAreaId = _.first(patient.parentClientele).id;
                });
                syncResponse.forms = await PrescriptionForm.find({
                    updatedAt: { ">=": params.lastSyncDate },
                    homeId: params.homeId,
                    type: [sails.config.PRESCRIPTION_FORM.TYPE.DIGITAL_LTC_PRESCRIBER_FORM, sails.config.PRESCRIPTION_FORM.TYPE.COMPRESSION_STOCKING_FORM],
                    isDeleted: false
                });
            }
            syncResponse.chartMeasurementUnit = sails.config.CHART_MEASUREMENT_UNIT;
            syncResponse.lastSyncDate = moment().toISOString();
            return res.ok(syncResponse, sails.config.message.OK)
        } catch (error) {
            console.log(error);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
};