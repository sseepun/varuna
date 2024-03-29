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
          order: [ [ 'isDeletable', 'ASC' ], [ 'order', 'ASC' ], [ 'createdAt', 'DESC' ] ]
        });
      }else{
        result = await db.MapLayer.findAll({
          where: condition,
          offset: (paginate.page - 1) * paginate.pp,
          limit : paginate.pp,
          subQuery: false,
          order: [ [ 'isDeletable', 'ASC' ], [ 'order', 'ASC' ], [ 'createdAt', 'DESC' ] ]
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
            attributes: d.attributes? JSON.parse(d.attributes): [],
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
          attributes: mapLayer.attributes? JSON.parse(mapLayer.attributes): [],
        },
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapLayerCreate : async (req, res) => {
    try {
      var error = {};
      const {
        name, description, image, icon, color, opacity, type, order, status
      } = req.body;

      if(!name) error['name'] = 'name is required.';
      if(!type) error['type'] = 'type is required.';
      if(!order) error['order'] = 'order is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      let updateInput = {
        name: name,
        color: color? color: '',
        opacity: opacity? opacity: 0,
        type: type,
        order: order,
        status: status,
        isDeletable: 1,
      };
      if(description!==undefined) updateInput['description'] = description;
      if(image!==undefined) updateInput['image'] = JSON.stringify(image);
      if(icon!==undefined) updateInput['icon'] = JSON.stringify(icon);
      await db.MapLayer.create(updateInput);
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapLayerUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, name, description, image, icon, color, opacity, type, order, status
      } = req.body;

      if(!_id) error['_id'] = '_id is required.';
      if(!name) error['name'] = 'name is required.';
      if(!type) error['type'] = 'type is required.';
      if(!order) error['order'] = 'order is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapLayer = await db.MapLayer.findOne({ where: { _id: _id } });
      if(!mapLayer){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        name: name,
        color: color? color: '',
        opacity: opacity? opacity: 0,
        type: type,
        order: order,
        status: status,
      };
      if(description!==undefined) updateInput['description'] = description;
      if(image!==undefined) updateInput['image'] = JSON.stringify(image);
      if(icon!==undefined) updateInput['icon'] = JSON.stringify(icon);
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
  
  mapLayerAttributesUpdate : async (req, res) => {
    try {
      var error = {};
      const { mapLayerId, attributes } = req.body;

      if(!mapLayerId) error['mapLayerId'] = 'mapLayerId is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapLayer = await db.MapLayer.findOne({ where: { _id: mapLayerId } });
      if(!mapLayer){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        attributes: attributes && attributes.length
          ? JSON.stringify(attributes): '[]',
      };
      await mapLayer.update(updateInput);
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  mapProjectList : async (req, res) => {
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
        result = await db.MapProject.findAll({
          where: condition,
          include: [ db.MapLocation ],
          order: [ [ 'createdAt', 'DESC' ] ]
        });
      }else{
        result = await db.MapProject.findAll({
          where: condition,
          include: [ db.MapLocation ],
          offset: (paginate.page - 1) * paginate.pp,
          limit : paginate.pp,
          subQuery: false,
          order: [ [ 'createdAt', 'DESC' ] ]
        })
        paginate.total = await db.MapProject.count({ where: condition, include: [ db.MapLocation ] });
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          return {
            ...d.dataValues,
            mapLocation: d.map_location,
            image: formater.cleanFile(d.image),
            gallery: d.gallery? JSON.parse(d.gallery): [],
          };
        }),
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapProjectRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapProject = await db.MapProject
        .findOne({ where: { _id: _id }, include: [ db.MapLocation ] });
      if(!mapProject){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      return resProcess['200'](res, {
        result: {
          ...mapProject.dataValues,
          mapLocation: mapProject.map_location,
          image: formater.cleanFile(mapProject.image),
          gallery: mapProject.gallery? JSON.parse(mapProject.gallery): [],
        },
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapProjectCreate : async (req, res) => {
    try {
      var error = {};
      const { name, description, image, gallery, status, mapLocation } = req.body;

      if(!name) error['name'] = 'name is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      delete mapLocation['_id'];
      const address = await db.MapLocation.create(mapLocation, { isNewRecord: true });
      let updateInput = {
        mapLocationId: address._id,
        name: name,
        status: status,
      };
      if(description!==undefined) updateInput['description'] = description;
      if(image!==undefined) updateInput['image'] = JSON.stringify(image);
      if(gallery!==undefined) updateInput['gallery'] = JSON.stringify(gallery);
      const mapProject = await db.MapProject.create(updateInput);
      
      return resProcess['200'](res, mapProject._id);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapProjectUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, name, description, image, gallery, status, mapLocation } = req.body;

      if(!_id) error['_id'] = '_id is required.';
      if(!name) error['name'] = 'name is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapProject = await db.MapProject.findOne({ where: { _id: _id } });
      if(!mapProject){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      delete mapLocation['_id'];
      const address = await db.MapLocation.findOne({ where: { _id: mapProject.mapLocationId } });
      await address.update(mapLocation);

      let updateInput = {
        name: name,
        status: status,
      };
      if(description!==undefined) updateInput['description'] = description;
      if(image!==undefined) updateInput['image'] = JSON.stringify(image);
      if(gallery!==undefined) updateInput['gallery'] = JSON.stringify(gallery);
      await mapProject.update(updateInput);
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapProjectDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;

      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapProject = await db.MapProject.findOne({ where: { _id: _id } });
      if(!mapProject){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      await mapProject.destroy();
      const mapLocation = await db.MapLocation
        .findOne({ where: { _id: mapProject.mapLocationId } });
      if(mapLocation) await mapLocation.destroy();
      
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
              { '$mapProject.name$': { [Op.like]: cleanKeyword } },
              { '$mapProject.description$': { [Op.like]: cleanKeyword } },
              { '$mapProject.province$': { [Op.like]: cleanKeyword } },
              { '$mapProject.district$': { [Op.like]: cleanKeyword } },
              { '$mapProject.subdistrict$': { [Op.like]: cleanKeyword } },
            ],
          };
        }
        if(dataFilter.mapProjectId){
          condition['mapProjectId'] = dataFilter.mapProjectId;
        }
        if([0, 1].indexOf(dataFilter.status) > -1){
          condition['status'] = dataFilter.status;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.MapData.findAll({
          where: condition,
          include: [ db.MapProject ],
          order: [ [ 'createdAt', 'DESC' ] ]
        });
      }else{
        result = await db.MapData.findAll({
          where: condition,
          include: [ db.MapProject ],
          offset: (paginate.page - 1) * paginate.pp,
          limit : paginate.pp,
          subQuery: false,
          order: [ [ 'createdAt', 'DESC' ] ]
        })
        paginate.total = await db.MapData.count({ where: condition, include: [ db.MapProject ] });
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          let mapProject = d.map_project? d.map_project.dataValues: null;
          return {
            ...d.dataValues,
            data: formater.cleanFile(d.data),
            data2: d.data2? formater.cleanFile(d.data2): null,
            data3: d.data3? formater.cleanFile(d.data3): null,
            data4: d.data4? formater.cleanFile(d.data4): null,
            data5: d.data5? formater.cleanFile(d.data5): null,
            data6: d.data6? formater.cleanFile(d.data6): null,
            data7: d.data7? formater.cleanFile(d.data7): null,
            data8: d.data8? formater.cleanFile(d.data8): null,
            data9: d.data9? formater.cleanFile(d.data9): null,
            data10: d.data10? formater.cleanFile(d.data10): null,
            mapProject: mapProject? {
              ...mapProject,
              image: formater.cleanFile(mapProject.image),
              gallery: mapProject.gallery? JSON.parse(mapProject.gallery): [],
            }: null,
          };
        }),
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapDataRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapData = await db.MapData.findOne({ where: { _id: _id }, include: [ db.MapProject ] });
      if(!mapData){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      let mapProject = mapData.map_project? mapData.map_project.dataValues: null;
      return resProcess['200'](res, {
        result: {
          ...mapData.dataValues,
          data: formater.cleanFile(mapData.data),
          data2: mapData.data2? formater.cleanFile(mapData.data2): null,
          data3: mapData.data3? formater.cleanFile(mapData.data3): null,
          data4: mapData.data4? formater.cleanFile(mapData.data4): null,
          data5: mapData.data5? formater.cleanFile(mapData.data5): null,
          data6: mapData.data6? formater.cleanFile(mapData.data6): null,
          data7: mapData.data7? formater.cleanFile(mapData.data7): null,
          data8: mapData.data8? formater.cleanFile(mapData.data8): null,
          data9: mapData.data9? formater.cleanFile(mapData.data9): null,
          data10: mapData.data10? formater.cleanFile(mapData.data10): null,
          mapProject: mapProject? {
            ...mapProject,
            image: formater.cleanFile(mapProject.image),
            gallery: mapProject.gallery? JSON.parse(mapProject.gallery): [],
          }: null,
        },
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapDataCreate : async (req, res) => {
    try {
      var error = {};
      const {
        mapProjectId, name, data,
        data2, data3, data4, data5, data6, data7, data8, data9, data10,
        startAt, endAt, status
      } = req.body;

      if(!mapProjectId) error['mapProjectId'] = 'mapProjectId is required.';
      if(!name) error['name'] = 'name is required.';
      if(!data) error['data'] = 'data is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapProject = await db.MapProject.findOne({ where: { _id: mapProjectId } });
      if(!mapProject){
        error['mapProjectId'] = 'mapProjectId is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        mapProjectId: mapProjectId,
        name: name,
        data: JSON.stringify(data),
        startAt: startAt? new Date(startAt): null,
        endAt: endAt? new Date(endAt): null,
        status: status,
      };
      if(data2 && data2.path) updateInput['data2'] = JSON.stringify(data2);
      if(data3 && data3.path) updateInput['data3'] = JSON.stringify(data3);
      if(data4 && data4.path) updateInput['data4'] = JSON.stringify(data4);
      if(data5 && data5.path) updateInput['data5'] = JSON.stringify(data5);
      if(data6 && data6.path) updateInput['data6'] = JSON.stringify(data6);
      if(data7 && data7.path) updateInput['data7'] = JSON.stringify(data7);
      if(data8 && data8.path) updateInput['data8'] = JSON.stringify(data8);
      if(data9 && data9.path) updateInput['data9'] = JSON.stringify(data9);
      if(data10 && data10.path) updateInput['data10'] = JSON.stringify(data10);
      const mapData = await db.MapData.create(updateInput);
      
      return resProcess['200'](res, mapData._id);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapDataUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, name, data,
        data2, data3, data4, data5, data6, data7, data8, data9, data10,
        startAt, endAt, status
      } = req.body;

      if(!_id) error['_id'] = '_id is required.';
      if(!name) error['name'] = 'name is required.';
      if([0, 1].indexOf(status) < 0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapData = await db.MapData.findOne({ where: { _id: _id } });
      if(!mapData){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
      
      let updateInput = {
        name: name,
        status: status,
      };
      if(data!==undefined) updateInput['data'] = JSON.stringify(data);
      if(data2!==undefined) updateInput['data2'] = JSON.stringify(data2);
      if(data3!==undefined) updateInput['data3'] = JSON.stringify(data3);
      if(data4!==undefined) updateInput['data4'] = JSON.stringify(data4);
      if(data5!==undefined) updateInput['data5'] = JSON.stringify(data5);
      if(data6!==undefined) updateInput['data6'] = JSON.stringify(data6);
      if(data7!==undefined) updateInput['data7'] = JSON.stringify(data7);
      if(data8!==undefined) updateInput['data8'] = JSON.stringify(data8);
      if(data9!==undefined) updateInput['data9'] = JSON.stringify(data9);
      if(data10!==undefined) updateInput['data10'] = JSON.stringify(data10);
      if(startAt!==undefined) updateInput['startAt'] = new Date(startAt);
      if(endAt!==undefined) updateInput['endAt'] = new Date(endAt);
      await mapData.update(updateInput);
      
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
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  mapPermissionList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(dataFilter.mapProjectId){
          condition['mapProjectId'] = dataFilter.mapProjectId;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.MapPermission.findAll({
          where: condition,
          include: [ db.MapProject, db.User ],
          order: [ [ 'createdAt', 'DESC' ] ]
        });
      }else{
        result = await db.MapPermission.findAll({
          where: condition,
          include: [ db.MapProject, db.User ],
          offset: (paginate.page - 1) * paginate.pp,
          limit : paginate.pp,
          subQuery: false,
          order: [ [ 'createdAt', 'DESC' ] ]
        })
        paginate.total = await db.MapPermission.count({ where: condition });
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          return {
            ...d.dataValues,
            mapLocation: d.map_location,
            image: formater.cleanFile(d.image),
            gallery: d.gallery? JSON.parse(d.gallery): [],
          };
        }),
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  mapPermissionUpdate : async (req, res) => {
    try {
      var error = {};
      const { mapProjectId, permissions } = req.body;

      if(!mapProjectId) error['mapProjectId'] = 'mapProjectId is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const mapProject = await db.MapProject.findOne({ where: { _id: mapProjectId } });
      if(!mapProject){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      await db.MapPermission.destroy({ where: { mapProjectId: mapProjectId } });
      await db.MapPermission.bulkCreate(permissions.map(d => {
        return {
          mapProjectId: mapProjectId,
          userId: d.userId,
          create: d.create? Number(d.create): 0,
          read: d.read? Number(d.read): 0,
          update: d.update? Number(d.update): 0,
          delete: d.delete? Number(d.delete): 0,
        }
      }));

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

};