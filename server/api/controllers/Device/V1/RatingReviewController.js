const RatingService = require(sails.config.appPath + '/api/services/rating');
const ReviewService = require(sails.config.appPath + '/api/services/review');
const RatingSummaryService = require(sails.config.appPath + '/api/services/ratingSummary');
module.exports = {
    async upsert(req, res) {
        let params = req.allParams();
        let loginUser = req.user;
        try {
            if (!params || !params.to || (!params.ratings && !params.review) || !params.rideId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let ratings = [];
            if (params.ratings && _.size(params.ratings)) {
                ratings = await RatingService.upsertRating({
                    loginUser: loginUser,
                    params: params
                });
            }
            let review = {};
            if (params.review) {
                review = await ReviewService.upsertReview({
                    loginUser: loginUser,
                    params: params
                });
            }

            return res.ok({}, sails.config.message.RATING_CUSTOMER_CREATED);
        } catch (e) {
            console.log(e);

            return res.serverError(e, sails.config.message.SERVER_ERROR);
        }

    },
    async listRatingReviews(req, res) {
        let params = req.allParams();
        if (!params || !params.userId) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let user = await User.find({ where: { id: params.userId }, select: ['type'] });
            let response = await RatingSummaryService.getRatingReviews({
                userId: params.userId,
                userType: user.type,
                limit: params.limit,
                page: params.page,
                sort: 'createdAt DESC'
            });

            return res.ok(response, sails.config.message.OK);
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }
};