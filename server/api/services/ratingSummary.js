const CommonService = require("./common");
module.exports = {
    async getReferenceIdWiseRatings(options) {
        let db = RatingSummary.getDatastore().manager;
        let overallRating = {rating: 0, userCount: 0};
        await new Promise((resolve, reject) => {
            db.collection(RatingSummary.tableName).find({"_id.referenceId": options.referenceId}, async function (err, ratings) {
                if (err) {
                    reject(err)
                } else {
                    ratings = await ratings.toArray();
                    if (ratings && ratings.length) {
                        let totalUserCount = 0;
                        _.each(ratings, function (rating) {
                            overallRating.rating += rating.value.totalRating;
                            if (overallRating.userCount === 0 || overallRating.userCount < rating.value.userCount) {
                                overallRating.userCount = rating.value.totalUserCount;
                            }
                            totalUserCount += rating.value.totalUserCount;
                        });
                        overallRating.rating = parseFloat(overallRating.rating);
                        overallRating.rating = (overallRating.rating / totalUserCount).toFixed(2);
                        resolve()
                    } else {
                        resolve()
                    }
                }
            });
        });
        return overallRating;
    },
    //for web
    async getReferenceIdWiseRatings2(options) {
        let db = RatingSummary.getDatastore().manager;
        let overallRating = {rating: 0, userCount: 0};
        let averageRatings = [];
        await new Promise((resolve, reject) => {
            db.collection(RatingSummary.tableName).find({"_id.referenceId": options.referenceId}, async function (err, ratings) {
                if (err) {
                    reject(err)
                } else {
                    ratings = await ratings.toArray();
                    if (ratings && ratings.length) {
                        let totalUserCount = 0;
                        _.each(ratings, function (rating) {
                            overallRating.rating += rating.value.totalRating;
                            if (overallRating.userCount === 0 || overallRating.userCount < rating.value.userCount) {
                                overallRating.userCount = rating.value.totalUserCount;
                            }
                            totalUserCount += rating.value.totalUserCount;
                            //average ratings
                            let referenceId = rating['_id']['referenceId'];
                            let type = rating['_id']['ratingType'] ? rating['_id']['ratingType'].toString() : '';

                            let ratingParamSummary = _.cloneDeep(rating.value);
                            ratingParamSummary['ratingType'] = type;

                            let existsRefId = _.find(averageRatings, {referenceId: referenceId});
                            if (existsRefId) {
                                existsRefId['ratingParams'].push(ratingParamSummary)
                            } else {
                                averageRatings.push({
                                    referenceId: referenceId,
                                    ratingParams: [ratingParamSummary]
                                })
                            }

                            /* if (!averageRatings[rating._id.ratingType]) {
                                 averageRatings[rating._id.ratingType] = [];
                             }
                             let reference_id = rating['_id']['referenceId'];
                             let type = rating['_id']['ratingType'].toString();
                             if (!averageRatings[reference_id]) {//group by reference id
                                 averageRatings[reference_id] = {}
                             }
                             if (!averageRatings[reference_id][type]) { //group by type
                                 averageRatings[reference_id][type] = [];
                             }
                             averageRatings[reference_id][type].push({
                                 avgRating: rating.value.avgRating,
                                 rating: rating.value.rating,
                                 totalRating: rating.value.totalRating,
                                 totalUserCount: rating.value.totalUserCount,
                                 userCountByRating: rating.value.userCountByRating
                             });*/
                        });
                        overallRating.rating = parseFloat(overallRating.rating);
                        overallRating.rating = (overallRating.rating / totalUserCount).toFixed(2);
                        resolve()
                    } else {
                        resolve()
                    }
                }
            });
        });
        return {overallRating, averageRatings};
    },
    async getRatingReviews(options) {
        try {
            let ratingReviews = [];
            let filter = {
                where: {
                    to: options.userId
                }
            };

            if (options.limit) {
                if (options.page) {
                    filter.skip = (options.page - 1) * options.limit;
                }
                filter.limit = options.limit;
            }
            if (options.sort) {
                filter.sort = options.sort
            }
            let countFilter = await CommonService.removePagination(_.clone(filter));
            let count = await Review.count(countFilter);

            return {count: count, ratingReviews: ratingReviews};
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
};
