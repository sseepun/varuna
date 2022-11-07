const config = require('../../config');
const fetch = require('node-fetch');
const db = require('../../models/import');
const { Op } = require('sequelize');
const { resProcess, formater } = require('../../helpers');


module.exports = {

  robotRoomTypeList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition = {
            [Op.or]: [
              { name: { [Op.like]: `%${dataFilter.keywords}%` } },
            ],
          };
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.RobotRoomType.findAll({
          where: condition,
          order: [[ 'name', 'ASC' ]],
        }); 
      }else{
        result = await db.RobotRoomType.findAll({
          where: condition,
          offset: (paginate.page - 1) * paginate.pp,
          limit: paginate.pp,
          order: [[ 'name', 'ASC' ]],
        });
        paginate.total = await db.RobotRoomType.count({ where: condition });
      }
  
      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          d = d.dataValues;
          return {
            ...d,
            image: formater.cleanFile(d.image),
            icon: formater.cleanFile(d.icon),
          };
        })
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  robotFeatureList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition = {
            [Op.or]: [
              { code: { [Op.like]: `%${dataFilter.keywords}%` } },
              { name: { [Op.like]: `%${dataFilter.keywords}%` } },
            ],
          };
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.RobotFeature.findAll({
          where: condition,
          order: [[ 'name', 'ASC' ]],
        }); 
      }else{
        result = await db.RobotFeature.findAll({
          where: condition,
          offset: (paginate.page - 1) * paginate.pp,
          limit: paginate.pp,
          order: [[ 'name', 'ASC' ]],
        });
        paginate.total = await db.RobotFeature.count({ where: condition });
      }
  
      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          d = d.dataValues;
          return {
            ...d,
            image: formater.cleanFile(d.image),
            icon: formater.cleanFile(d.icon),
          };
        })
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },


  // START: External
  externalRobotRead : async (req, res) => {
    try {
      var error = {};
      const { secretId, model, serialNumber } = req.query;
      
      if(!secretId) error['secretId'] = 'secretId is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      let input = {
        robotSecretId: secretId,
      };
      if(model) input['robotModel'] = model;
      if(serialNumber) input['robotSerialNumber'] = serialNumber;
  
      let fetch1 = await fetch(`${config.externalRobotUrl}register/check-robot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      });
      if(!fetch1 || fetch1.status != 200){
        error['secretId'] = 'secretId is invalid.';
        return resProcess['checkError'](res, error);
      }
      
      let data1 = await fetch1.json();
      if(data1.status != 200 || !data1.result || !data1.result.registerUrl){
        error['secretId'] = 'secretId is invalid.';
        return resProcess['checkError'](res, error);
      }

      let secret = '';
      let params = data1.result.registerUrl.split('?')[1].split('&');
      params.forEach(d => {
        if(d.includes('secret=')) secret = d.replace('secret=', '');
      });
  
      return resProcess['200'](res, {
        result: {
          ...data1.result,
          secret: secret,
        }
      }, data1.message);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  // END: External

};