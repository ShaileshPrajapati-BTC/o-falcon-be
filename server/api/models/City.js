/**
 * Master.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
  module.exports = {
    tableName: "City",
    schema: true,
    attributes: {
      name: {
        type: "STRING",
      },
      normalizeName: {
        type: "STRING",
      },
      stateId: {
        model: "State",
      },
      countryId: {
        model: "Country",
      },  
      isActive: {
        type: "BOOLEAN",
        defaultsTo: true,
      },  
      isDeleted: {
        type: "BOOLEAN",
        defaultsTo: false,
      },
      updatedBy: {
        model: "User",
      },
      createdBy: {
        model: "User",
      },
      sequence: {
        type: "number",
        allowNull: true,
      },
    }
  };
  