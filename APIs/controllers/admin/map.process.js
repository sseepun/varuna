const db = require('../../models/import');
const { Op } = require('sequelize');
const { resProcess, formater } = require('../../helpers');


module.exports = {

  mapLayerList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          let cleanKeyword = formater.cleanKeyword(dataFilter.keywords);
          cleanKeyword = `%${cleanKeyword}%`;
          condition = {
            [Op.or]: [
              { name: { [Op.like]: cleanKeyword } },
              { description: { [Op.like]: cleanKeyword } },
            ],
          };
        }
        if([0, 1].indexOf(dataFilter.status) > -1){
          condition['status'] = dataFilter.status;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.MapLayer.findAll({
          where: condition,
          order: [ [ 'isDeletable', 'ASC' ], [ 'createdAt', 'DESC' ] ]
        });
      }else{
        result = await db.MapLayer.findAll({
          where: condition,
          offset: (paginate.page - 1) * paginate.pp,
          limit : paginate.pp,
          subQuery: false,
          order: [ [ 'isDeletable', 'ASC' ], [ 'createdAt', 'DESC' ] ]
        })
        paginate.total = await db.MapLayer.count({ where: condition });
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          return {
            ...d.dataValues,
            image: formater.cleanFile(d.image),
            icon: formater.cleanFile(d.icon),
          };
        }),
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapLayerRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapLayer = await db.MapLayer.findOne({ where: { _id: _id } });
      if(!mapLayer){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      return resProcess['200'](res, {
        result: {
          ...mapLayer.dataValues,
          image: formater.cleanFile(mapLayer.image),
          icon: formater.cleanFile(mapLayer.icon),
        },
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapLayerCreate : async (req, res) => {
    try {
      var error = {};
      const { name, description, image, icon, status } = req.body;

      if(!name) error['name'] = 'name is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      let updateInput = {
        name: name,
        status: status,
        isDeletable: 1,
      };
      if(description!==undefined) updateInput['description'] = description;
      if(image!==undefined) updateInput['image'] = formater.cleanFileObject(image);
      if(icon!==undefined) updateInput['icon'] = formater.cleanFileObject(icon);
      await db.MapLayer.create(updateInput);
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapLayerUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, name, description, image, icon, status } = req.body;

      if(!_id) error['_id'] = '_id is required.';
      if(!name) error['name'] = 'name is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapLayer = await db.MapLayer.findOne({ where: { _id: _id } });
      if(!mapLayer){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        name: name,
        status: status,
      };
      if(description!==undefined) updateInput['description'] = description;
      if(image!==undefined) updateInput['image'] = formater.cleanFileObject(image);
      if(icon!==undefined) updateInput['icon'] = formater.cleanFileObject(icon);
      await mapLayer.update(updateInput);
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapLayerDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;

      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapLayer = await db.MapLayer.findOne({ where: { _id: _id, isDeletable: 1 } });
      if(!mapLayer){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
      
      await mapLayer.destroy();
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  mapDataList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          let cleanKeyword = formater.cleanKeyword(dataFilter.keywords);
          cleanKeyword = `%${cleanKeyword}%`;
          condition = {
            [Op.or]: [
              { name: { [Op.like]: cleanKeyword } },
              { description: { [Op.like]: cleanKeyword } },
              { '$map_location.subdistrict$': { [Op.like]: cleanKeyword } },
              { '$map_location.district$': { [Op.like]: cleanKeyword } },
              { '$map_location.province$': { [Op.like]: cleanKeyword } },
            ],
          };
        }
        if([0, 1].indexOf(dataFilter.status) > -1){
          condition['status'] = dataFilter.status;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.MapData.findAll({
          where: condition,
          include: [ db.MapLocation ],
          order: [ [ 'createdAt', 'DESC' ] ]
        });
      }else{
        result = await db.MapData.findAll({
          where: condition,
          include: [ db.MapLocation ],
          offset: (paginate.page - 1) * paginate.pp,
          limit : paginate.pp,
          subQuery: false,
          order: [ [ 'createdAt', 'DESC' ] ]
        })
        paginate.total = await db.MapData.count({ where: condition, include: [ db.MapLocation ] });
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          let gallery = d.gallery? JSON.parse(d.gallery): [];
          return {
            ...d.dataValues,
            mapLocation: d.map_location,
            image: formater.cleanFile(d.image),
            gallery: gallery.map(k => formater.cleanFile(k)),
          };
        }),
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapDataCreate : async (req, res) => {
    try {
      var error = {};
      const { name, description, image, gallery, status, mapLocation, data } = req.body;

      if(!name) error['name'] = 'name is required.';
      // if(!data) error['data'] = 'data is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      delete mapLocation['_id'];
      const address = await db.MapLocation.create(mapLocation, { isNewRecord: true });
      let updateInput = {
        mapLocationId: address['null'],
        name: name,
        data: data,
        status: status,
      };
      if(description!==undefined) updateInput['description'] = description;
      if(image!==undefined) updateInput['image'] = formater.cleanFileObject(image);
      if(gallery!==undefined) updateInput['gallery'] = formater.cleanFileObject(gallery);
      await db.MapData.create(updateInput);
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapDataDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;

      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapData = await db.MapData.findOne({ where: { _id: _id } });
      if(!mapData){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      await mapData.destroy();
      const mapLocation = await db.MapLocation.findOne({ where: { _id: mapData.mapLocationId } });
      if(mapLocation) await mapLocation.destroy();
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
};