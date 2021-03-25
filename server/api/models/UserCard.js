module.exports = {
  tableName: 'UserCard',
  schema: true,
  attributes: {
      userId: {
        model: 'User',
      },
      cardNumber: { 
        type: "string",
        required: true,
        unique: true
      },
      nameOnCard: {
        type: "string",
        required: true 
      },
      month: { 
        type: "string",
        required: true 
      },
      year: { 
        type: "string",
        required: true 
      },
      isDefault: {
        type: "boolean",
        defaultsTo: false,
      },
  }
};

