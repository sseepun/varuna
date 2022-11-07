const config = require('../config');
const db = require('../models/import');
const jwt = require('jsonwebtoken');
const { resProcess } = require('../helpers');


const verifyToken = async (req, res, next) => {
  try {
    var error = {};

    if(!req.headers['authorization']){
      error['accessToken'] = 'authorization is required.';
      return resProcess['checkError'](res, error);
    }

    const authHeader = req.headers['authorization'].split(' ');
    if(authHeader[0] != 'Bearer'){
      error['accessToken'] = 'authorization must be of type Bearer.';
      return resProcess['checkError'](res, error);
    }else if(authHeader.length != 2) {
      error['accessToken'] = 'accessToken is required in authorization.';
      return resProcess['checkError'](res, error);
    }
    
    const token = authHeader[1];
    jwt.verify(token, config.tokenSecret, async (err, decoded) => {
      if(err){
        error['accessToken'] = 'accessToken is invalid.';
        return resProcess['checkError'](res, error);
      }

      const user = await db.User.findOne({ where: { _id: decoded._id }, include: [ db.UserRole ] });
      if(!user){
        error['accessToken'] = 'accessToken is invalid.';
        return resProcess['checkError'](res, error);
      }else{
        if(user.refreshToken && user.user_role && user.user_role.level > 0){
          if(user.status == 1){
            req.user = user;
            req.userId = user._id;
            req.role = user.user_role;
            return next();
          }else{
            if(user.status == 0) error['username'] = 'Your account has not been activated.';
            else if(user.status == -1) error['username'] = 'We are processing to delete your account within 24 hours.';
            else error['username'] = 'Your account has been blocked.';
            return resProcess['checkError'](res, error);
          }
        }else{
          error['accessToken'] = 'accessToken is invalid.';
          return resProcess['checkError'](res, error);
        }
      }
    });
  } catch(err) {
    return resProcess['500'](res, err);
  }
};

const isSuperAdmin = async (req, res, next) => {
  try {
    var error = {};
    if(!req.user){
      error['user'] = 'user is invalid.';
      return resProcess['checkError'](res, error);
    }
    if(!req.role || req.role.level < 99){
      error['role'] = 'You are not a super admin.';
      return resProcess['checkError'](res, error);
    }
    return next();
  } catch (err) {
    return resProcess['500'](res, err);
  }
};
const isAdmin = async (req, res, next) => {
  try {
    var error = {};
    if(!req.user){
      error['user'] = 'user is invalid.';
      return resProcess['checkError'](res, error);
    }
    if(!req.role || req.role.level < 98){
      error['role'] = 'You are not an admin.';
      return resProcess['checkError'](res, error);
    }
    return next();
  } catch (err) {
    return resProcess['500'](res, err);
  }
};
const isUser = async (req, res, next) => {
  try {
    var error = {};
    if(!req.user){
      error['user'] = 'user is invalid.';
      return resProcess['checkError'](res, error);
    }
    if(!req.role || req.role.level != 1){
      error['role'] = 'You are not a user.';
      return resProcess['checkError'](res, error);
    }
    return next();
  } catch (err) {
    return resProcess['500'](res, err);
  }
};


const authJwt = {
  verifyToken,
  isSuperAdmin,
  isAdmin,
  isUser,
};

module.exports = authJwt;