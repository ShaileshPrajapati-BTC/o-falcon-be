/**
 * Common Controller Template
 *
 * @description :: Server-side logic for generating common Template for API.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const rideComplaintDisputeService = require(`${sails.config.appPath}/api/services/rideComplaintDispute`);

module.exports = {

    /**
     * add ride complaint dispute
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async create(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;

        try {
            // required params check
            if (!params || !params.userId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            params.franchiseeId = loggedInUser.franchiseeId ? loggedInUser.franchiseeId : null;
            params.dealerId = loggedInUser.dealerId ? loggedInUser.dealerId : null;
            params.loginUser = loggedInUser;
            params.userType = sails.config.USER.TYPE.CUSTOMER;

            // create new entry in collection
            let createdRecord = await rideComplaintDisputeService.create(params);
            let messageType = createdRecord.type === sails.config.COMPLIANT_DISPUTE.TYPE.DISPUTE ?
                'RIDE_COMPLAINT_CREATED' :
                'RIDE_DISPUTE_CREATED';
            if (createdRecord) {
                return res.ok(createdRecord,
                    sails.config.message[messageType]
                );
            }

            return res.serverError({}, sails.config.message.RIDE_COMPLAINT_DISPUTE_CREATED_CREATE_FAILED);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     * list  ride complaint dispute of login user
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async list(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;

        try {
            // required params check
            // if (!params || !params.type) {
            //     params.type = sails.config.COMPLIANT_DISPUTE.TYPE.DISPUTE;
            //     // return res.badRequest(null, sails.config.message.BAD_REQUEST)
            // }

            let filter = await rideComplaintDisputeService.getFilter(params);
            filter.where.type = params.type;
            filter.where.userId = loggedInUser.id;

            // ride complaint dispute list
            let records = await rideComplaintDisputeService.list(filter);
            if (records) {
                return res.ok(records, sails.config.message.OK);
            }

            return res.ok(null, sails.config.message.RIDE_COMPLAINT_DISPUTE_LIST_NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    /**
     * cancel  ride complaint dispute
     * @param req
     * @param res
     * @returns {Promise.<*>}
     */
    async cancelComplaintDispute(req, res) {

        let params = req.allParams();
        let loggedInUser = req.user;
        try {
            // required params check
            if (!params || !params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            params.loginUser = loggedInUser;
            // status updated  record
            let cancelledRecord = await rideComplaintDisputeService.cancelComplaintDispute(params);
            let messageType = cancelledRecord.type === sails.config.COMPLIANT_DISPUTE.TYPE.DISPUTE ?
                'DISPUTE' :
                'COMPLAINT';
            if (cancelledRecord) {
                return res.ok(cancelledRecord, sails.config.message[`RIDE_${messageType}_CANCEL_SUCCESS`]);
            }

            return res.serverError({}, sails.config.message[`RIDE_${messageType}_CANCEL_FAILED`]);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }

    },
    async view(req, res) {
        let params = req.allParams();
        if (!params || !params.id) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let response = await rideComplaintDisputeService.view(params);
            if (response.flag) {
                return res.ok(response.data, sails.config.message.OK);
            }

            return res.serverError(null, sails.config.message.SERVER_ERROR);

        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
};
