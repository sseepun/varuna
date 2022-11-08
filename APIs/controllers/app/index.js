const db = require('../../models/import');
const { resProcess } = require('../../helpers');


module.exports = {

  settingList : async (req, res) => {
    try {
      const settings = await db.Setting.findAll();
      return resProcess['200'](res, {
        result: settings
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

};