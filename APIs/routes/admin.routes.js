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

  
  app.use('/admin', router);
};