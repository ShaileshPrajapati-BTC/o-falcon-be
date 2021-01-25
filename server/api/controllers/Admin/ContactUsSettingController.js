/**
 * Common Controller Template
 *
 * @description :: Server-side logic for generating common Template for API.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    async get(req, res) {
        let params = req.allParams();
        try {
            let filter = {
                addedBy: null
            }
            if (req.user.type === sails.config.USER.TYPE.DEALER && params.isInfoPage) {
                filter = {
                    or: [
                        { addedBy: null },
                        { addedBy: params.addedBy }
                    ]
                }
            } else if (params.addedBy) {
                filter.addedBy = params.addedBy;
            }
            let contactUs = await ContactUsSetting.find(filter);

            if (contactUs) {
                return res.ok(contactUs, sails.config.message.OK);
            }

            return res.notFound({}, sails.config.message.NOT_FOUND);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async update(req, res) {
        try {
            let params = req.allParams();

            // update
            let paramsToUpdate = _.omit(params, 'id');
            let updatedRecord = await ContactUsSetting.update({ id: params.id })
                .set(paramsToUpdate)
                .fetch();

            if (updatedRecord && updatedRecord.length) {
                return res.ok(updatedRecord, sails.config.message.SETTING_RECORD_UPDATED);
            }

            return res.notFound({}, sails.config.message.NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }

};
