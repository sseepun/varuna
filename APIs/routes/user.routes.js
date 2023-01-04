module.exports = function(app) {
  var router = require('express').Router();
  const { authJwt } = require('../middlewares');
  const UserController = require('../controllers/user');

  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });


  // START: User
  router.patch(
    '/signout',
    [ authJwt.verifyToken ],
    UserController.signout
  );
  router.post(
    '/verify-signin',
    [ authJwt.verifyToken ],
    UserController.verifySignIn
  );
  
  router.patch(
    '/account',
    [ authJwt.verifyToken ],
    UserController.updateAccount
  );
  router.patch(
    '/password',
    [ authJwt.verifyToken ],
    UserController.updatePassword
  );

  router.post(
    '/robots',
    [ authJwt.verifyToken ],
    UserController.robotList
  );
  router.post(
    '/robot',
    [ authJwt.verifyToken ],
    UserController.robotCreate
  );
  router.get(
    '/robot',
    [ authJwt.verifyToken ],
    UserController.robotRead
  );
  router.patch(
    '/robot',
    [ authJwt.verifyToken ],
    UserController.robotUpdate
  );
  router.delete(
    '/robot',
    [ authJwt.verifyToken ],
    UserController.robotDelete
  );
  // END: User


  // START: Map
  router.post(
    '/map-layers',
    [ authJwt.verifyToken, authJwt.isUser ],
    UserController.mapLayerList
  );
  router.get(
    '/map-layer',
    [ authJwt.verifyToken, authJwt.isUser ],
    UserController.mapLayerRead
  );
  
  router.post(
    '/map-projects',
    [ authJwt.verifyToken, authJwt.isUser ],
    UserController.mapProjectList
  );
  router.get(
    '/map-project',
    [ authJwt.verifyToken, authJwt.isUser ],
    UserController.mapProjectRead
  );
  
  router.post(
    '/map-datas',
    [ authJwt.verifyToken, authJwt.isUser ],
    UserController.mapDataList
  );
  router.get(
    '/map-data',
    [ authJwt.verifyToken, authJwt.isUser ],
    UserController.mapDataRead
  );
  // END: Map


  app.use('/user', router);
};