module.exports = {
  tableName: "IOTCallbackLocationData",
  schema: true,
  attributes: {
      imei: {
          type: "string"
      },
      vehicleName: {
        type: "string"
      },
      zoneName: {
        type: "string"
      },
      data: { type: 'json' }
  }
};

