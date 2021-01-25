
module.exports = {
    async aggregate(modelIdentifier, query, options = {}) {
        try {
            let Model = sails.models[modelIdentifier];
            let db = Model.getDatastore().manager;
            let result = await db.collection(Model.tableName).aggregate(query).toArray();
            return result;
        } catch (e) {
            throw e;
        }
    }
}