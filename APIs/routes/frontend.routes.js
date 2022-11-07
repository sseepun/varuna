module.exports = function(app) {
  var router = require('express').Router();
  const FrontendController = require('../controllers/frontend');

  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });


  router.post(
    '/robot-room-types',
    FrontendController.robotRoomTypeList
  );

  router.post(
    '/robot-features',
    FrontendController.robotFeatureList
  );


  // START: External
  router.get(
    '/external-robot',
    FrontendController.externalRobotRead
  );
  // END: External

  
  app.use('/frontend', router);
};