const config = require('../../config');
const db = require('../../models/import');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { resProcess, formater } = require('../../helpers');


module.exports = {

  signup : async (req, res) => {
    try {
      var error = {};
      const {
        email, password, confirmPassword,
        refId, telephone, username, firstname, lastname,
      } = req.body;

      if(!email) error['email'] = 'email is required.';
      if(!password) error['password'] = 'password is required.';
      else{
        if(password.length < 6) error['password'] = 'password must be at least 6 characters.';
        else if(!(/^(?=.*[0-9]).*$/).test(password)) error['password'] = 'password must contain 0-9 least 1 character.';
        else if(!(/^(?=.*[!@#$&*?%^()]).*$/).test(password)) error['password'] = 'password must contain * ! @ # $ & ? % ^ ( ) at least 1 character.';
      }
      if(!confirmPassword) error['confirmPassword'] = 'confirmPassword is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      if(password !== confirmPassword){
        error['confirmPassword'] = 'password and confirmPassword do not match.';
        return resProcess['checkError'](res, error);
      }
      
      const duplicateEmail = await db.User
        .findOne({ where: { email: email }, attributes: [ '_id' ] });
      if(duplicateEmail){
        error['email'] = 'email is already in use.';
        return resProcess['checkError'](res, error);
      }
      
      const userRole = await db.UserRole.findOne({ where: { level: 1 } });
      const salt = await bcrypt.genSalt(10);
      const bcryptPassword = await bcrypt.hash(password, salt);
      let updateInput = {
        userRoleId: userRole._id,
        email: email,
        password: bcryptPassword,
        username: username? username: '',
        firstname: firstname? firstname: '',
        lastname: lastname? lastname: '',
        status: 1,
      };
      if(refId){
        const duplicateRefId = await db.User
          .findOne({ where: { refId: refId }, attributes: [ '_id' ] });
        if(duplicateRefId){
          error['refId'] = 'refId is already in use.';
          return resProcess['checkError'](res, error);
        }else{
          updateInput['refId'] = refId;
        }
      }
      if(telephone){
        const cleanTelephone = formater.cleanTelephone(telephone);
        const duplicateTelephone = await db.User
          .findOne({ where: { telephone: cleanTelephone }, attributes: [ '_id' ] });
        if(duplicateTelephone){
          error['telephone'] = 'telephone is already in use.';
          return resProcess['checkError'](res, error);
        }else{
          updateInput['telephone'] = cleanTelephone;
        }
      }
      if(username){
        const duplicateUsername = await db.User
          .findOne({ where: { username: username }, attributes: [ '_id' ] });
        if(duplicateUsername){
          error['username'] = 'username is already in use.';
          return resProcess['checkError'](res, error);
        }else{
          updateInput['username'] = username;
        }
      }
      await db.User.create(updateInput);

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  signin : async (req, res) => {
    try {
      var error = {};
      const { email, password } = req.body;

      if(!email) error['email'] = 'email is required.';
      if(!password) error['password'] = 'password is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const user = await db.User.findOne({ where: { email: email }, include: [ db.UserRole ] });
      if(!user){
        error['username'] = 'Account associated with your credential is not found.';
        return resProcess['checkError'](res, error);
      }else if(user.status != 1){
        if(user.status == 0) error['username'] = 'Your account has not been activated.';
        else if(user.status == -1) error['username'] = 'We are processing to delete your account within 24 hours.';
        else error['username'] = 'Your account has been blocked.';
        return resProcess['checkError'](res, error);
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if(!validPassword){
        error['username'] = 'Account associated with your credential is not found.';
        return resProcess['checkError'](res, error);
      }

      const accessToken = jwt.sign(
        { _id: user._id }, 
        config.tokenSecret, 
        { expiresIn: config.tokenLife }
      );
      const refreshToken = jwt.sign(
        { _id: user._id }, 
        config.tokenRefreshSecret, 
        { expiresIn: config.tokenRefreshLife }
      );
      await user.update({ refreshToken: refreshToken });
      
      return resProcess['200'](res, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
          _id: user._id,
          refId: user.refId,
          email: user.email,
          username: user.username,
          telephone: user.telephone,
          avatar: formater.cleanFile(user.avatar),
          firstname: user.firstname,
          lastname: user.lastname,
          status: user.status,
          role: user.user_role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      });
    } catch (err) {
      return resProcess['500'](res, err);
    }
  },
  refresh : async (req, res) => {
    try {
      var error = {};
      const { refreshToken } = req.body;
      
      if(!refreshToken) error['refreshToken'] = 'refreshToken is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      jwt.verify(refreshToken, config.tokenRefreshSecret, async (err, decodedToken) => {
        if(err){
          error['refreshToken'] = 'refreshToken is invalid.';
          return resProcess['checkError'](res, error);
        }

        const user = await db.User.findOne({ 
          where: { refreshToken: refreshToken, status: 1 },
          include: [ db.UserRole ]
        });
        if(!user){
          error['refreshToken'] = 'refreshToken is invalid.';
          return resProcess['checkError'](res, error);
        }
        
        const accessToken = jwt.sign(
          { _id: user._id }, 
          config.tokenSecret, 
          { expiresIn: config.tokenLife }
        );
        const newRefreshToken = jwt.sign(
          { _id: user._id }, 
          config.tokenRefreshSecret, 
          { expiresIn: config.tokenRefreshLife }
        );
        await user.update({ refreshToken: newRefreshToken });

        return resProcess['200'](res, {
          accessToken: accessToken,
          refreshToken: newRefreshToken,
          user: {
            _id: user._id,
            refId: user.refId,
            email: user.email,
            username: user.username,
            telephone: user.telephone,
            avatar: formater.cleanFile(user.avatar),
            firstname: user.firstname,
            lastname: user.lastname,
            status: user.status,
            role: user.user_role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        });
      });
    } catch (err) {
      return resProcess['500'](res, err);
    }
  },
  
  checkDuplicate : async (req, res) => {
    try {
      var error = {};
      const { email, refId } = req.body;
      
      if(!email && !refId) error['email'] = 'email or refId is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      if(email){
        const duplicateEmail = await db.User
          .findOne({ where: { email: email }, attributes: [ '_id' ] });
        if(duplicateEmail){
          return resProcess['200'](res, true, 'email is already in use.');
        }
      }
      if(refId){
        const duplicateRefId = await db.User
          .findOne({ where: { refId: refId }, attributes: [ '_id' ] });
        if(duplicateRefId){
          return resProcess['200'](res, true, 'refId is already in use.');
        }
      }

      return resProcess['200'](res, false, 'No duplicate.');
    } catch (err) {
      return resProcess['500'](res, err);
    }
  },

  forgetPassword : async (req, res) => {
    try {
      var error = {};
      const { email } = req.body;
      
      if(!email) error['email'] = 'email is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const user = await db.User.findOne({ where: { email: email }, include: [ db.UserRole ] });
      if(!user){
        error['email'] = 'Account associated with this email is not found.';
        return resProcess['checkError'](res, error);
      }

      const resetToken = Buffer.from(Math.random().toString()).toString('base64');
      await db.UserTemp.destroy({ where: { userId: user._id, action: 'Reset Password' } });
      await db.UserTemp.create({
        userId: user._id,
        action: 'Reset Password',
        token: resetToken,
        isUsed: 0
      });
      
      return resProcess['200'](res, {
        resetToken: resetToken
      });
    } catch (err) {
      return resProcess['500'](res, err);
    }
  },
  checkResetToken : async (req, res) => {
    try {
      var error = {};
      const { resetToken } = req.query;
      
      if(!resetToken) error['resetToken'] = 'resetToken is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      const temp = await db.UserTemp.findOne({
        where: { action: 'Reset Password', token: resetToken, isUsed: 0 }
      });
      if(!temp){
        error['resetToken'] = 'resetToken is invalid.';
        return resProcess['checkError'](res, error);
      }

      return resProcess['200'](res);
    } catch (err) {
      return resProcess['500'](res, err);
    }
  },
  resetPassword : async (req, res) => {
    try {
      var error = {};
      const { resetToken, newPassword, confirmNewPassword } = req.body;
      
      if(!resetToken) error['resetToken'] = 'resetToken is required.';
      if(!newPassword) error['newPassword'] = 'newPassword is required.';
      if(!confirmNewPassword) error['confirmNewPassword'] = 'confirmNewPassword is required.';
      else{
        if(newPassword.length < 6) error['newPassword'] = 'newPassword must be at least 6 characters.';
        else if(!(/^(?=.*[0-9]).*$/).test(newPassword)) error['newPassword'] = 'newPassword must contain 0-9 least 1 character.';
        else if(!(/^(?=.*[!@#$&*?%^()]).*$/).test(newPassword)) error['newPassword'] = 'newPassword must contain * ! @ # $ & ? % ^ ( ) at least 1 character.';
      }
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      if(newPassword!==confirmNewPassword){
        error['confirmNewPassword'] = 'newPassword and confirmNewPassword do not match.';
        return resProcess['checkError'](res, error);
      }
      
      const temp = await db.UserTemp.findOne({
        where: { action: 'Reset Password', token: resetToken, isUsed: 0 }
      });
      if(!temp){
        error['resetToken'] = 'resetToken is invalid.';
        return resProcess['checkError'](res, error);
      }

      const user = await db.User.findOne({
        where: { _id: temp.userId, status: 1 }
      });
      if(!user){
        error['resetToken'] = 'resetToken is invalid.';
        return resProcess['checkError'](res, error);
      }

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(newPassword, salt);
      await user.update({ password: password });
      await temp.destroy();

      return resProcess['200'](res);
    } catch (err) {
      return resProcess['500'](res, err);
    }
  },

};