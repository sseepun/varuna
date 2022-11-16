const db = require('../../models/import');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { resProcess, formater } = require('../../helpers');


module.exports = {
  
  signout : async (req, res) => {
    try {
      await req.user.update({ refreshToken: '', fcmToken: '' });
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  verifySignIn : async (req, res) => {
    try {
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  updateAccount : async (req, res) => {
    try {
      var error = {};
      const { firstname, lastname, username, email, telephone, avatar } = req.body;

      if(!firstname) error['firstname'] = 'firstname is required.';
      if(!lastname) error['lastname'] = 'lastname is required.';
      if(!username) error['username'] = 'username is required.';
      if(!email) error['email'] = 'email is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      const user = await db.User.findByPk(req.user._id);
      if(!user){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
      
      const duplicateUsername = await db.User.findOne({
        where: { username: username, _id: { [Op.not]: req.user._id} }
      });
      if(duplicateUsername){
        error['username'] = 'username is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateEmail = await db.User.findOne({ 
        where: { email: email , _id: { [Op.not]: req.user._id} }
      });
      if(duplicateEmail){
        error['email'] = 'email is already in use.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email
      };
      if(telephone!==undefined) updateInput['telephone'] = telephone;
      if(avatar!==undefined) updateInput['avatar'] = formater.cleanFileObject(avatar);
      await user.update(updateInput);

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  updatePassword : async (req, res) => {
    try {
      var error = {};
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      if(!oldPassword) error['oldPassword'] = 'oldPassword is required.';
      if(!newPassword) error['newPassword'] = 'newPassword is required.';
      if(!confirmNewPassword) error['confirmNewPassword'] = 'confirmNewPassword is required.';
      else{
        if(newPassword.length < 6) error['newPassword'] = 'newPassword must be at least 6 characters.';
        else if(!(/^(?=.*[0-9]).*$/).test(newPassword)) error['newPassword'] = 'newPassword must contain 0-9 least 1 character.';
        else if(!(/^(?=.*[!@#$&*?%^()]).*$/).test(newPassword)) error['newPassword'] = 'newPassword must contain * ! @ # $ & ? % ^ ( ) at least 1 character.';
      }
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const user = await db.User.findByPk(req.user._id);
      if(!user){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      if(newPassword!==confirmNewPassword){
        error['confirmNewPassword'] = 'newPassword and confirmNewPassword do not match.';
        return resProcess['checkError'](res, error);
      }

      const validPassword = await bcrypt.compare(oldPassword, req.user.password);
      if(!validPassword){
        error['oldPassword'] = 'oldPassword is invalid.';
        return resProcess['checkError'](res, error);
      }

      const salt = await bcrypt.genSalt(10);
      const bcryptPassword = await bcrypt.hash(newPassword, salt);
      await user.update({ password: bcryptPassword });

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  robotList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {
        ownerId: req.userId,
      };
      if(dataFilter){
        if(dataFilter.keywords){
          condition = {
            [Op.or]: [
              { name: { [Op.like]: `%${dataFilter.keywords}%` } },
              { model: { [Op.like]: `%${dataFilter.keywords}%` } },
              { serialNumber: { [Op.like]: `%${dataFilter.keywords}%` } },
            ],
          };
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.Robot.findAll({
          where: condition,
          include: [ db.User, db.RobotRoomType ],
          order: [[ 'createdAt', 'ASC' ]],
        });
      }else{
        result = await db.Robot.findAll({
          where: condition,
          include: [ db.User, db.RobotRoomType ],
          offset: (paginate.page - 1) * paginate.pp,
          limit: paginate.pp,
          order: [[ 'createdAt', 'ASC' ]],
        });
        paginate.total = await db.Robot.count({ where: condition });
      }
  
      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          d = d.dataValues;
          return {
            ...d,
            owner: d.owner,
            roomType: d.robot_room_type,
          };
        })
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  robotRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const robot = await db.Robot.findOne({
        where: { ownerId: req.userId, _id: _id },
        include: [ db.User, db.RobotRoomType ],
      });
      if(!robot){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: {
          ...robot,
          owner: robot.owner,
          roomType: robot.robot_room_type,
        }
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  robotCreate : async (req, res) => {
    try {
      var error = {};
      const { name, description, url, image, icon, order, status } = req.body;
      
      if(!name) error['name'] = 'name is required.';
      if(!url) error['url'] = 'url is required.';
      if(!image) error['image'] = 'image is required.';
      if(!icon) error['icon'] = 'icon is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const duplicateName = await db.PartnerProductCategory.findOne({ name: name }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProductCategory.findOne({ url: url }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        name: name,
        url: url,
        image: image,
        icon: icon,
        order: order,
        status: status
      };
      if(description!==undefined) updateInput['description'] = description;
      await db.PartnerProductCategory(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  robotUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, name, description, url, image, icon, order, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!name) error['name'] = 'name is required.';
      if(!url) error['url'] = 'url is required.';
      if(!image) error['image'] = 'image is required.';
      if(!icon) error['icon'] = 'icon is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const category = await db.PartnerProductCategory.findById(sanitize(_id));
      if(!category){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateName = await db.PartnerProductCategory.findOne({ name: name, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProductCategory.findOne({ url: url, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        name: name,
        url: url,
        image: image,
        icon: icon,
        order: order,
        status: status
      };
      if(description!==undefined) updateInput['description'] = description;
      await category.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  robotDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const category = await db.PartnerProductCategory.findById(sanitize(_id));
      if(!category){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await category.remove();
      await db.PartnerProduct.updateMany({ category: category }, { category: null });
      const subCategories = await db.PartnerProductSubCategory.find({ category: category }).select('_id');
      if(subCategories){
        await db.PartnerProductSubCategory.deleteMany({ category: category });
        await db.PartnerProduct.updateMany({ subCategory: subCategories }, { subCategory: null });
      }
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

};