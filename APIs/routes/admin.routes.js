module.exports = function(app) {
  var router = require('express').Router();
  const { authJwt } = require('../middlewares');
  const AdminController = require('../controllers/admin');

  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });


  // START: App
  router.patch(
    '/settings',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.settingsUpdate
  );
  
  router.post(
    '/users',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userList
  );
  router.get(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userRead
  );
  router.post(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userCreate
  );
  router.patch(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userUpdate
  );
  router.delete(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userDelete
  );
  
  router.get(
    '/user-permission',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userPermissionRead
  );
  router.patch(
    '/user-permission',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.userPermissionUpdate
  );
  // END: App


  // START: Map
  router.post(
    '/map-layers',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapLayerList
  );
  router.get(
    '/map-layer',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapLayerRead
  );
  router.post(
    '/map-layer',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapLayerCreate
  );
  router.patch(
    '/map-layer',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapLayerUpdate
  );
  router.delete(
    '/map-layer',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapLayerDelete
  );
  
  router.post(
    '/map-projects',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapProjectList
  );
  router.get(
    '/map-project',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapProjectRead
  );
  router.post(
    '/map-project',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapProjectCreate
  );
  router.patch(
    '/map-project',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapProjectUpdate
  );
  router.delete(
    '/map-project',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapProjectDelete
  );
  
  router.post(
    '/map-datas',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapDataList
  );
  router.get(
    '/map-data',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapDataRead
  );
  router.post(
    '/map-data',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapDataCreate
  );
  router.patch(
    '/map-data',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapDataUpdate
  );
  router.delete(
    '/map-data',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapDataDelete
  );
  
  router.post(
    '/map-permissions',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapPermissionList
  );
  router.patch(
    '/map-permission',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.mapPermissionUpdate
  );
  // END: Map

  
  app.use('/admin', router);
};