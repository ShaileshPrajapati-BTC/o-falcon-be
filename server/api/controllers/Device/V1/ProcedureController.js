module.exports = {
    async list(req, res) {
        try {
            let response = { list: [] };
            let master = await Master.findOne({ code: 'MANUFACTURER' });
            let subMaster = await Master.findOne({
                parentId: master.id,
                isDefault: true
            });
            if (!subMaster || !subMaster.id) {
                return res.ok(response, sails.config.message.LIST_NOT_FOUND);
            }
            let recordsList = await Procedure.find({
                where: { manufacturer: subMaster.id },
                sort: 'sequence asc'
            });
            if (!recordsList || !recordsList.length) {
                return res.ok(response, sails.config.message.LIST_NOT_FOUND);
            }
            response.list = recordsList;

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }

    }
};
