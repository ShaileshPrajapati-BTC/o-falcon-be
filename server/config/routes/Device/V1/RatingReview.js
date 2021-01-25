module.exports.routes = {
    'POST /api/v1/customer/rating-review/upsert': {
        controller: 'Device/V1/RatingReviewController',
        action: 'upsert',
        swagger: {
            summary: 'upsert rating',
            description: 'This is for upsert rating',
            body: {
                to: { type: 'string', required: true },
                ratings: {
                    type: 'array',
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            rating: {
                                type: 'number'
                            },
                            ratingType: {
                                type: 'string'
                            }
                        }
                    }
                },
                rideId: { type: 'string', required: true }
            }
        }
    },
    'POST /api/v1/customer/rating-reviews/list': {
        controller: 'Device/V1/RatingReviewController',
        action: 'listRatingReviews',
        swagger: {
            summary: 'list user rating reviews',
            description: '',
            body: {
                userId: {
                    type: 'string',
                    required: true
                },
                page: {
                    type: 'number'
                },
                limit: {
                    type: 'number'
                }
            }
        }
    }
};
