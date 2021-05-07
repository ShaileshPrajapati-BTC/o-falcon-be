module.exports.routes = {
  "post /admin/common/bulk-boolean-status-update": {
    controller: "Admin/Common/CommonController",
    action: "bulkBooleanStatusUpdate",
    swagger: {
      summary: "Bulk status update  any model",
      description: "This is for updating status",
      body: {
        ids: { type: "array" },
        status: {
          type: "object",
          properties: {
            key: {
              type: "boolean"
            }
          }
        },
        model: { type: "string" }
      }
    }
  },
  "post /admin/common/boolean-status-update": {
    controller: "Admin/Common/CommonController",
    action: "booleanStatusUpdate",
    swagger: {
      summary: " status update  any model",
      description: "This is for updating status",
      body: {
        id: { type: "string" },
        status: {
          type: "boolean"
        },
        fieldName: {
          type: "string"
        },
        model: { type: "string" }
      }
    }
  },
  "post /admin/common/isdefault": {
    controller: "Admin/common/CommonController",
    action: "isDefalutBooleanStatusUpdate",
    swagger: {
      summary: " status update  any model",
      description: "This is for updating status",
      body: {
        id: { type: "string" },
        status: {
          type: "boolean"
        },
        fieldName: {
          type: "string"
        },
        model: { type: "string" }
      }
    }
  },

  'POST /admin/common/check-duplication': {
    controller: 'Admin/common/CommonController',
    action: 'checkDuplicationDynamically',
    swagger: {
      summary: 'List users which have duplicate mobile , email etc...',
      description: '',
      body: {

      }
    }
  },

  "post /admin/remove-record": "Admin/Common/CommonController.deleteRecord"
};
