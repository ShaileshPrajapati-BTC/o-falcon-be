const common = require(`${sails.config.appPath}/api/services/common`);
const ObjectId = require('mongodb').ObjectID;

module.exports = {

    // getFilter
    getFilter: async (options) => {
        let filter = await common.getFilter(options);

        if (options.moduleNumber) {
            filter.where.referenceId = options.moduleNumber;
        }

        if (options.moduleName) {
            filter.where.moduleName = options.moduleName;
        }
        if (options.ratingType) {
            filter.where.ratingType = options.ratingType;
        }

        return await common.gcFilter(filter);
        // return filter;
    },
    // after create ,update add,update ratingObject
    rating: function (rating, cb) {
        /**
         * userCountByRating = {<rating val>: <count of users who gives this rating>};
         * e.x
         * userCountByRating = {
         * "1": NumberInt(0),
         * "2": NumberInt(0),
         * "3": NumberInt(0),
         * "4": NumberInt(0),
         * "5": NumberInt(0),
          }
         */
        try {
            let db = Rating.getDatastore().manager;
            let collection = db.collection(Rating.tableName);
            let mapFn = function () {
                let emitReference = {
                    rating: this.rating,
                    avgRating: this.rating,
                    totalRating: this.rating,
                    totalUserCount: 1,
                    userCountByRating: {}
                };
                emitReference['userCountByRating'][this.rating] = 1;
                emit({
                    referenceId: this.to.valueOf(),
                    ratingType: this.ratingType.valueOf()
                }, emitReference);
            };

            let reduceFn = function (referenceId, values) {

                let reduceValue = {
                    totalUserCount: 0,
                    totalRating: 0,
                    avgRating: 0,
                    userCountByRating: {}
                };
                values
                    .forEach((value) => {
                        reduceValue.totalUserCount += value['totalUserCount'];
                        reduceValue.totalRating += value['rating'];
                        if (reduceValue.userCountByRating[value['rating']]) {
                            reduceValue.userCountByRating[value['rating']] += 1;
                        }
                        else {
                            reduceValue.userCountByRating[value['rating']] = 1;
                        }
                    });
                /* if (reduceValue.totalUserCount > 0)
                 reduceValue['avgRating'] = reduceValue.totalRating / reduceValue.totalUserCount;*/

                return reduceValue;
            };

            // finalize reduced values and add another parameter on that
            let finalizeFn = function (key, reducedVal) {

                if (reducedVal.totalUserCount > 0 && reducedVal.totalRating > 0) { reducedVal['avgRating'] = reducedVal.totalRating / reducedVal.totalUserCount; }

                return reducedVal;
            };

            collection.mapReduce(mapFn,
                reduceFn,
                {
                    out: { merge: 'RatingSummary' },
                    query: {
                        to: ObjectId(rating.to),
                        ratingType: ObjectId(rating.ratingType)
                    },
                    finalize: finalizeFn
                },
                (err, result) => {
                    console.log('err', err);
                    if (err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
        } catch (e) {
            throw new Error(e);
        }
    },

    async upsertRating(options) {
        let params = options.params;
        try {
            let ratings = [];
            await Promise.all(_.map(params.ratings, async (dataObj) => {
                if (dataObj.rating) {
                    // check if rating already given by user for event
                    let r = await Rating.findOne({
                        to: params.to,
                        rideId: params.rideId,
                        ratingType: dataObj.ratingType
                    });

                    // If already given rating, then update it
                    if (r) {
                        r.rating = dataObj.rating;
                        let ratingId = r.id;
                        let ratingObj = r;
                        delete ratingObj.id;
                        ratingObj.to = params.to;
                        ratingObj.addedBy = options.loginUser.id;
                        let rat = await Rating.update({ id: ratingId }, ratingObj).fetch();
                        ratings.push(rat[0]);
                    } else {
                        // Create new rating
                        dataObj.to = params.to;
                        dataObj.addedBy = options.loginUser.id;
                        dataObj.rideId = params.rideId;
                        let rat = await Rating.create(dataObj).fetch();
                        ratings.push(rat);
                    }
                } else {
                    return false;
                }
            }));

            return ratings;
        } catch (e) {
            throw new Error(e);
        }
    },
    async getRideRating(rideIds) {
        try {
            let ratings = await Rating.find({ rideId: rideIds });
            return ratings;
        } catch (e) {
            throw new Error(e);
        }
    },

    // hooks
    afterUpdate: function (options) {
        const RatingService = require('./rating');
        let rating = options.records;
        try {
            RatingService
                .rating(rating, (err, result) => {
                    if (err) console.log(err);
                });
        } catch (e) {
            console.log(e);
        }
    },
    afterCreate: function (options) {
        const RatingService = require('./rating');
        let rating = options.records;
        RatingService
            .rating(rating, (err, result) => {
                if (err) console.log(err);
            });
    }
};
