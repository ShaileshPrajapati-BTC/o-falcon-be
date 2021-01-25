const moment = require("moment");
const CommonService = require(sails.config.appPath + "/api/services/common");
module.exports = {
  // get common sync data for admin and customer
  async sync(params, loginUser) {
    try {
      let response = {};
      if (loginUser) {
        response.user = loginUser;
      }
      // get setting
      let setting = await Settings.find()
        .sort("updatedAt DESC")
        .limit(1);
      response.setting = setting && setting.length ? _.first(setting) : {};

      // get master,subMaster
      let masterFilter = await CommonService.getSyncDateFilter(params);
      response.masters = await Master.find(masterFilter);
      response.lastSync = moment().valueOf();
      return response;
    } catch (error) {
      throw new Error(error);
    }
  }
};
