/**
 * Master.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
  module.exports = {
    tableName: "Country",
    attributes: {
      name: {
        type: "STRING",
        required: true
      },
      normalizeName: {
        type: "STRING",
      },
      code: {
        type: "STRING",
        required: true
      },
      ISDCode: {
        type: "STRING",
        required: true
      },
      timeZone: {
        type: "STRING",
      },
      localIsoTime: {
        type: "STRING",
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
      }
    }
  };
  