const db = require('../../models/import');
const { Op } = require('sequelize');
const { resProcess, formater } = require('../../helpers');


module.exports = {

  mapLayerList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {
        status: 1,
      };
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

      const mapLayer = await db.MapLayer.findOne({ where: { _id: _id, status: 1 } });
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

  mapProjectList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let projectIds = await db.MapPermission.findAll({ where: { userId: req.userId } });
      projectIds = projectIds.filter(d => d.read).map(d => d.mapProjectId);

      let condition = {
        _id: projectIds,
        status: 1
      };
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
      
      let projectIds = await db.MapPermission.findAll({ where: { userId: req.userId } });
      projectIds = projectIds.filter(d => d.read).map(d => d.mapProjectId);
      if(projectIds.indexOf(Number(_id)) < 0){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

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

};