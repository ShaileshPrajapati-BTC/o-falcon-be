const UtilService = require(sails.config.appPath + "/api/services/util");
var arrayToTree = require("array-to-tree");

module.exports = {
  async paginate(req, res) {
    let params = req.allParams();
    try {
      // get filter
      let filter = await common.getFilter(params);
      if (params.isOnlyParents) {
        filter.where["and"] = [
          {
            or: [
              // parent id is null
              {
                parentId: null
              },
              // parent id is blank
              {
                parentId: ""
              }
            ]
          }
        ];
      }
      if (filter.where.franchiseeId) {
        delete filter.where.franchiseeId;
      }
      console.log('filter ', filter);
      let recordsList = await Location.find(filter)
        .populate("parentId", { select: ["name", "parentId"] })
        .populate("subLocations", { select: ["id"] })
        .meta({ enableExperimentalDeepTargets: true });
      if (!recordsList.length) {
        return res.ok({}, sails.config.message.LIST_NOT_FOUND);
      }
      let response = {
        list: recordsList
      };
      // count
      let countFilter = await common.removePagination(filter);
      response.count = await Location.count(countFilter).meta({
        enableExperimentalDeepTargets: true
      });
      return res.ok(response, sails.config.message.OK);
    } catch (error) {
      console.log(error);
      return res.serverError(null, sails.config.message.SERVER_ERROR);
    }
  },

  async update(req, res) {
    try {
      let params = req.allParams();
      if (!params || !params.id) {
        return res.badRequest(null, sails.config.message.BAD_REQUEST);
      }

      if (params.name) {
        let filter = { name: params.name, id: { "!=": params.id } };
        let existingLocation = await Location.findOne(filter);
        if (existingLocation) {
          return res.ok({}, sails.config.message.LOCATION_EXISTS);
        }
      }
      let where = {
        id: params.id
      };

      let location = await Location.findOne(where);
      let oldLocation = _.cloneDeep(location);
      if (location) {
        let update = {};
        /* generate local id if parentId changed*/
        if (params.parentId) {
          if (oldLocation && oldLocation.parentId !== params.parentId) {
            let generatedModelId = await new Promise(resolve => {
              let options = { model: "location", parentId: params.parentId };
              UtilService.generateModelLocalId(options, function (err, result) {
                if (err) {
                  console.log(err);
                  return res.serverError(
                    null,
                    sails.config.message.SERVER_ERROR
                  );
                }
                resolve(result);
              });
            });
            if (generatedModelId.localId) {
              update.localId = generatedModelId.localId;
            }
            if (generatedModelId.localIdSequence) {
              update.localIdSequence = generatedModelId.localIdSequence;
            }
            if (generatedModelId.parentLocalId) {
              update.parentLocalId = generatedModelId.parentLocalId;
            }
          }
        }

        // append data into from params
        _.each(params, function (val, key) {
          update[key] = val;
        });
        update = _.omit(update, ["id"]);
        location = await Location.update({ id: location.id }, update).fetch();
        return res.ok(location[0], sails.config.message.LOCATION_UPDATED);
      } else {
        return res.ok(false, sails.config.message.NOT_FOUND);
      }
    } catch (e) {
      console.log(e);
      return res.serverError(null, sails.config.message.SERVER_ERROR);
    }
  },

  async view(req, res) {
    try {
      let params = req.allParams();
      if (!params || !params.id) {
        return res.badRequest(null, sails.config.message.BAD_REQUEST);
      }
      let where = {
        id: params.id
      };
      let location = await Location.findOne(where).populate("parentId");
      return res.ok(location, sails.config.message.OK);
    } catch (e) {
      console.log(e);
      return res.serverError(null, sails.config.message.SERVER_ERROR);
    }
  },
  async create(req, res) {
    try {
      let params = req.allParams();

      if (!params || !params.name) {
        return res.badRequest(null, sails.config.message.BAD_REQUEST);
      }

      let generatedModelId = await new Promise(resolve => {
        let options = {};
        if (params.parentId) {
          options.parentId = params.parentId;
        }
        options.model = "location";
        UtilService.generateModelLocalId(options, function (err, result) {
          if (err) {
            console.log(err);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
          }
          resolve(result);
        });
      });
      if (generatedModelId.localId) {
        params.localId = generatedModelId.localId;
      }
      if (generatedModelId.localIdSequence) {
        params.localIdSequence = generatedModelId.localIdSequence;
      }
      if (generatedModelId.parentLocalId) {
        params.parentLocalId = generatedModelId.parentLocalId;
      }
      let filter = {
        where: {
          name: params.name
        }
      };

      let existingLocation = await Location.findOne(filter);
      if (existingLocation) {
        return res.ok({}, sails.config.message.LOCATION_EXISTS);
      }

      let location = await Location.create(params).fetch();
      if (!location) {
        return res.badRequest({}, sails.config.message.LOCATION_FAILED_CREATED);
      }
      return res.ok(location, sails.config.message.LOCATION_CREATED);
    } catch (e) {
      console.log(e);
      return res.serverError(null, sails.config.message.SERVER_ERROR);
    }
  },

  async getCasCaderLocationList(req, res) {
    try {
      let response = [];
      let params = req.allParams();
      // get Country list
      let where = {
        where: { type: sails.config.LOCATION.TYPE.COUNTRY },
        select: ["name", "parentId", "isActive"]
      };

      let countries = await Location.find(where);
      if (!countries || !countries.length) {
        return res.ok([], sails.config.message.RECORD_NOT_FOUND);
      }
      _.each(countries, function (country) {
        country.disabled = !country.isActive;
      });
      response = response.concat(countries);
      let countryIds = _.map(countries, "id");
      if (countryIds && countryIds.length) {
        let states = await Location.find({
          where: {
            type: sails.config.LOCATION.TYPE.STATE,
            parentId: countryIds
          },
          select: ["name", "parentId", "isActive"]
        });
        if (states && states.length) {
          _.each(states, function (state) {
            state.disabled = !state.isActive;
          });
          response = response.concat(states);
          let stateIds = _.map(states, "id");
          if (!params.isOnlyState) {
            let cities = await Location.find({
              where: {
                type: sails.config.LOCATION.TYPE.CITY,
                parentId: stateIds
              },
              select: ["name", "parentId", "isActive"]
            });
            _.each(cities, function (city) {
              city.disabled = !city.isActive;
            });
            response = response.concat(cities);
          }
        }
      }

      response = arrayToTree(response, {
        parentProperty: "parentId",
        customID: "id"
      });
      return res.ok(response, sails.config.message.OK);
    } catch (e) {
      console.log(e);
      return res.serverError(null, { message: "Error.", data: e });
    }
  }
};
