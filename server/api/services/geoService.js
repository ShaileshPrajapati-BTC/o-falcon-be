const CommonService = require('./common');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    async intersectNest(coordinates, nestId) {
        let query = {
            isDeleted: false
        };
        if (nestId) {
            query._id = { "$nin": [ObjectId(nestId)] };
        }
        let newQuery = {
            ...query,
            currentLocation: {
                $geoIntersects: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: coordinates
                    }
                }
            }
        };
        // console.log("query============", JSON.stringify(newQuery));
        let matchedNest = await CommonService.runFindNativeQuery(
            newQuery,
            'nest'
        );

        if (matchedNest && matchedNest.length > 0) {
            throw sails.config.message.NEST_INTERSECT;
        }

        return matchedNest;
    },

    async intersectZone(coordinates, zoneId) {
        let query = {
            isDeleted: false
        };
        if (zoneId) {
            query._id = { "$nin": [ObjectId(zoneId)] };
        }
        let newQuery = {
            ...query,
            boundary: {
                $geoIntersects: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: coordinates
                    }
                }
            }
        };
        // console.log(("query============", newQuery));
        let matchedZone = await CommonService.runFindNativeQuery(
            newQuery,
            'zone'
        );

        if (matchedZone && matchedZone.length) {
            throw sails.config.message.ZONE_INTERSECT;
        }

        return matchedZone;
    },

    async validateNestWithinZone(coordinates) {
        let geoQuery = [];
        for (let coordinate of coordinates[0]) {
            let newQuery = {
                boundary: {
                    $geoIntersects: {
                        $geometry: {
                            type: "Point",
                            coordinates: coordinate
                        }
                    }
                }
            }
            geoQuery.push(newQuery);
        }
        let query = {
            isDeleted: false,
            '$and': geoQuery
        };
        // console.log("query============", JSON.stringify(query));
        let matchedZone = await CommonService.runFindNativeQuery(
            query,
            'zone'
        );
        if (matchedZone && matchedZone.length > 0) {
            return matchedZone;
        }

        throw sails.config.message.NEST_OUT_OF_ZONE;
    },

    async checkNestData(newBoundary, zone) {
        let nestCount = await Nest.count({ zoneId: zone.id, isDeleted: false });
        let query = {
            isDeleted: false,
            zoneId: ObjectId(zone.id),
            currentLocation: {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: newBoundary
                    }
                }
            }
        };
        // console.log("query============", JSON.stringify(query));
        let matchedNest = await CommonService.runFindNativeQuery(
            query,
            'nest'
        );
        // console.log("Matched Length => ", matchedNest.length);

        if (matchedNest && matchedNest.length !== nestCount) {
            throw sails.config.message.ZONE_NOT_CONTAINS_ALL_NEST;
        }

        return matchedNest;
    }
}