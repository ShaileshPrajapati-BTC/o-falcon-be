module.exports = {
    async upsertReview(options) {
        let params = options.params;
        try {
            let reviews = await Review.find({ to: params.to });
            let review;
            delete options.params.ratings;
            if (reviews && _.size(reviews)) {
                options.params.updatedBy = options.loginUser.id;

                review = await Review.update({
                    to: params.to
                }, options.params).fetch();
                review = review[0];
            } else {
                delete options.params.ratings;
                options.params.addedBy = options.loginUser.id;
                review = await Review.create(options.params).fetch();
            }
            return review;
        } catch (e) {
            throw new Error(e);
        }
    },

    /**
     * @description: getting filter of complaint dispute master
     * @param options
     * @param callback
     */
    async getFilter(options) {
        let filter = await common.getFilter(options);


        // filter by user
        if (options.userId) {
            filter.where.to = options.userId
        }

        return await common.gcFilter(filter);
    },
};