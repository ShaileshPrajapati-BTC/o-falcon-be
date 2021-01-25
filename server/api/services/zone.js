const UtilService = require('./util');
const NestService = require('./nest');
const VehicleService = require('./vehicle');
const TaskService = require('./task');

module.exports = {
    getStatusTrack(userId, params, record = {}) {
        let statusTrack = record.statusTrack;
        if (!statusTrack || !_.isArray(statusTrack)) {
            statusTrack = [];
        }
        let remark = 'FareManagement updated.';

        let keysForLog = [
            'baseCurrency',
            'timeFare',
            'distanceFare',
            'ridePauseFare',
            'rideReserveFare',
            'lateFare',
            'cancellationFare',
            'timeFareFreeLimit',
            'distanceFareFreeLimit',
            'minimumFareType,',
            'baseFare',
            'parkingFine',
            'rideDeposit',
            'unlockFees',
            'perXBaseMinute'
        ];
        let updatedData = [];

        for (let key of keysForLog) {
            if (key in record && params[key] !== record[key]) {
                obj = {
                    before: record[key],
                    after: params[key],
                    key: key,
                    remark: `${key} updated: ${record[key]} => ${params[key]}`
                };
                updatedData.push(obj);
            }
        }

        let newStatus = {
            data: updatedData,
            dateTime: UtilService.getTimeFromNow(),
            userId: userId,
            remark: remark
        };
        statusTrack.unshift(newStatus);

        return statusTrack;
    },

    async createDummyZone(currentLocation, vehicleType, vehicleId) {
        const RideBookingService = require('./rideBooking');
        const dummyPolygon = RideBookingService.createDummyPolygon(currentLocation);
        let zoneName = `Dummy Zone ${UtilService.randomNumber(6)}`;
        let newDummyZone = {
            name: zoneName,
            vehicleTypes: [vehicleType],
            boundary: {
                type: 'Polygon',
                coordinates: [dummyPolygon],
                shapeType: 'Polygon',
            },
            isActive: true,
            baseCurrency: 0,
            isAutoCreated: true
        }
        zone = await Zone.create(newDummyZone).fetch();
        let dummyFare = {
            zoneId: zone.id,
            timeFare: 0,
            distanceFare: 0,
            ridePauseFare: 0,
            rideReserveFare: 0,
            cancellationFare: 0,
            timeFareFreeLimit: 0,
            distanceFareFreeLimit: 0,
            minimumFareType: 1,
            baseFare: sails.config.MIN_FARE_FOR_NEW_ZONE,
            statusTrack: [],
            parkingFine: 0,
            unlockFees: 0,
            rideDeposit: 0,
            vehicleType: vehicleType
        };
        fare = await FareManagement.create(dummyFare).fetch();
        this.dummyZoneCreationNotify(vehicleType, zoneName, vehicleId);
        console.log('&&&&&&&&&&& zone &&&&&&&&&&& ', zone);
        return zone;
    },

    async dummyZoneCreationNotify (vehicleType, zoneName, vehicleId) {
        let msg = `New zone created with name ${zoneName}.`;
        let type = sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.DUMMY_ZONE_CREATION;
        let data = {
            title: msg,
            vehicleId: vehicleId,
            // data: vehicle,
            vehicleType: vehicleType,
            status: sails.config.NOTIFICATION.STATUS.SEND,
            type: type,
            module: sails.config.modules.zoneandfaremanagement,
            // addedBy: null
        };
        await Notification.create(data).fetch();
    },

    async deleteZoneRelatedNests(zoneId, userId) {
        let nests = await Nest.find({ zoneId: zoneId }).select(['id']);
        _.forEach(nests, async nest => {
            let vehiclesToBeRetained = await Vehicle.find({
                nestId: nest.id,
            }).select(["id"]);
            let vehicleIds = _.map(vehiclesToBeRetained, (record) => record.id);
            console.log("trying to delete -> vehicleIds", vehicleIds);
            await VehicleService.assignOrRetainVehicleToNest(
                vehicleIds,
                null,
                userId,
                "Vehicle is Retain from the nest!"
            );
            await NestService.deleteNestTrackByNestId(nest.id);
            await TaskService.deleteTasksByNestId(nest.id);
            await NestService.deleteNestById(nest.id);
        });
    },

    afterCreate: async function () {
    },
    afterUpdate: async function () {
    },
    afterDestroy: async function () {
    }
};
