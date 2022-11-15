const db = require('../../models/import');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { resProcess, formater } = require('../../helpers');


module.exports = {

  settingsUpdate : async (req, res) => {
    try {
      var error = {};
      const { settings } = req.body;
      
      if(!settings || !settings.length) error['settings'] = 'settings are required.';

      let promises = [];
      settings.forEach(d => {
        promises.push(
          new Promise(async (resolve, reject) => {
            await db.Setting.findOneAndUpdate({ name: d.name }, { value: d.value });
            resolve(true);
          })
        );
      });
      await Promise.all(promises);

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  userList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          let cleanKeyword = formater.cleanKeyword(dataFilter.keywords);
          cleanKeyword = `%${cleanKeyword}%`;
          condition = {
            [Op.or]: [
              { firstname: { [Op.like]: cleanKeyword } },
              { lastname: { [Op.like]: cleanKeyword } },
              { username: { [Op.like]: cleanKeyword } },
              { email: { [Op.like]: cleanKeyword } },
            ],
          };
        }
        if([-1, 0, 1].indexOf(dataFilter.status) > -1){
          condition['status'] = dataFilter.status;
        }
        if(dataFilter.levels && dataFilter.levels.length){
          condition['$user_role.level$'] = dataFilter.levels;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.User.findAll({
          where: condition,
          include: [ db.UserRole ],
          order: [ [ db.UserRole, 'level', 'ASC' ], [ 'firstname', 'ASC' ], [ 'lastname', 'ASC' ] ]
        });
      }else{
        result = await db.User.findAll({
          where: condition,
          include: [ db.UserRole ],
          offset: (paginate.page - 1) * paginate.pp,
          limit : paginate.pp,
          subQuery: false,
          order: [ [ db.UserRole, 'level', 'ASC' ], [ 'firstname', 'ASC' ], [ 'lastname', 'ASC' ] ]
        })
        paginate.total = await db.User
          .count({ where: condition, include: [ db.UserRole ] });
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result.map(d => {
          return {
            _id: d._id,
            role: d.user_role,
            username: d.username,
            email: d.email,
            firstname: d.firstname,
            lastname: d.lastname,
            telephone: d.telephone,
            avatar: formater.cleanFile(d.avatar),
            status: d.status,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          };
        }),
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  userRead : async (req, res) => {
    try {
      var error = {};
      const { _id, isAdmin } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      let condition = { _id: { [Op.eq]: _id } };
      if(isAdmin){
        let roles = await db.UserRole.findOne({ where: { level: { [Op.gt] : 97 } }, attributes: [ '_id' ] });
        if(!roles) {
          error['role'] = 'role is invalid.';
          return resProcess['checkError'](res, error);
        }
      }

      const user = await db.User.findOne({ 
        where: condition,
        include: [db.UserRole]
      });
      if(!user){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      return resProcess['200'](res, {
        result: user
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  userCreate : async (req, res) => {
    try {
      var error = {};
      const { 
        roleLevel, firstname, lastname, username, email, telephone,
        password, confirmPassword, avatar, status
      } = req.body;

      if(!roleLevel) error['roleLevel'] = 'roleLevel is required.';
      if(!username) error['username'] = 'username is required.';
      if(!email) error['email'] = 'email is required.';
      if(!password) error['password'] = 'password is required.';
      else{
        if(password.length < 6) error['password'] = 'password must be at least 6 characters.';
        else if(!(/^(?=.*[0-9]).*$/).test(password)) error['password'] = 'password must contain 0-9 least 1 character.';
        else if(!(/^(?=.*[!@#$&*?%^()]).*$/).test(password)) error['password'] = 'password must contain * ! @ # $ & ? % ^ ( ) at least 1 character.';
      }
      if(!confirmPassword) error['confirmPassword'] = 'confirmPassword is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      if(password !== confirmPassword){
        error['confirmPassword'] = 'password and confirmPassword do not match.';
        return resProcess['checkError'](res, error);
      }
      
      const role = await db.UserRole.findOne({ 
        where: { level: roleLevel }, 
        attributes: [ 'level' ] 
      });
      console.log(role);
      if(!role){
        error['roleLevel'] = 'roleLevel is invalid.';
        return resProcess['checkError'](res, error);
      }else if(role.level >= req.role.level){
        error['roleLevel'] = 'No permission.';
        return resProcess['checkError'](res, error);
      }

      const duplicateUsername = await db.User.findOne({
        where: { username: username }, attributes: [ '_id' ]  
      });
      if(duplicateUsername){
        error['username'] = 'username is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateEmail = await db.User.findOne({ 
        where: { email: email }, attributes: [ '_id' ] 
      });
      if(duplicateEmail){
        error['email'] = 'email is already in use.';
        return resProcess['checkError'](res, error);
      }

      const salt = await bcrypt.genSalt(10);
      const bcryptPassword = await bcrypt.hash(password, salt);
      let updateInput = {
        role: role,
        username: username,
        email: email,
        password: bcryptPassword,
        status: status
      };
      if(telephone!==undefined) updateInput['telephone'] = telephone;
      if(firstname!==undefined) updateInput['firstname'] = firstname;
      if(lastname!==undefined) updateInput['lastname'] = lastname;
  

      await db.User.create(updateInput);

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  userUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, firstname, lastname, username, email, telephone,
        password, confirmPassword, avatar, status
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!username) error['username'] = 'username is required.';
      if(!email) error['email'] = 'email is required.';
      if(password){
        if(password.length < 6) error['password'] = 'password must be at least 6 characters.';
        else if(!(/^(?=.*[0-9]).*$/).test(password)) error['password'] = 'password must contain 0-9 least 1 character.';
        else if(!(/^(?=.*[!@#$&*?%^()]).*$/).test(password)) error['password'] = 'password must contain * ! @ # $ & ? % ^ ( ) at least 1 character.';
        if(!confirmPassword) error['confirmPassword'] = 'confirmPassword is required.';
        else if(password!==confirmPassword) error['confirmPassword'] = 'password and confirmPassword do not match.';
      }
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      if(sanitize(_id) == sanitize(req.user._id)){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      const user = await db.User.findById(sanitize(_id))
        .populate('role')
        .populate('address');
      if(!user){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }else if(user.role && user.role.level >= req.user.role.level){
        error['_id'] = 'No permission.';
        return resProcess['checkError'](res, error);
      }
      
      const duplicateUsername = await db.User.findOne({ username: username, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateUsername){
        error['username'] = 'username is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateEmail = await db.User.findOne({ email: email, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateEmail){
        error['email'] = 'email is already in use.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        username: username,
        email: email,
        status: status
      };
      if(telephone!==undefined) updateInput['telephone'] = telephone;
      if(firstname!==undefined) updateInput['firstname'] = firstname;
      if(lastname!==undefined) updateInput['lastname'] = lastname;
      if(avatar!==undefined) updateInput['avatar'] = avatar;
      if(password!==undefined){
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);
        updateInput['password'] = bcryptPassword;
      }
      await user.updateOne(updateInput, []);
      await user.address.updateOne(formater.address(address), []);

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  userDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const user = await db.User.findById(sanitize(_id))
        .populate({ path: 'role' })
        .populate({ path: 'address' });
      if(!user){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }else if(user.role && user.role.level >= req.user.role.level){
        error['roleLevel'] = 'No permission.';
        return resProcess['checkError'](res, error);
      }

      await user.remove();
      await user.address.remove();

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  userPermissionRead : async (req, res) => {
    try {
      var error = {};
      const { userId } = req.query;
      
      if(!userId) error['userId'] = 'userId is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      let condition = {};

      const user = await db.User.findOne({ _id: sanitize(userId) }).select('_id');
      if(user) condition['user'] = user;
      else{
        error['userId'] = 'userId is invalid.';
        return resProcess['checkError'](res, error);
      }

      var permission = await db.UserPermission.findOne(condition);
      if(!permission){
        permission = await db.UserPermission({ user: user }).save();
      }

      return resProcess['200'](res, {
        result: permission
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  userPermissionUpdate : async (req, res) => {
    try {
      var error = {};
      const { userId, permissions } = req.body;
      
      if(!userId) error['userId'] = 'userId is required.';
      if(!permissions) error['permissions'] = 'permissions is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      if(sanitize(userId) == sanitize(req.user._id)){
        error['userId'] = 'userId is invalid.';
        return resProcess['checkError'](res, error);
      }

      const user = await db.User.findOne({ _id: sanitize(userId) }).select('_id')
        .populate({ path: 'role', select: 'level' });
      if(!user){
        error['userId'] = 'userId is invalid.';
        return resProcess['checkError'](res, error);
      }else if(user.role.level > 98){
        error['userId'] = 'No permission.';
        return resProcess['checkError'](res, error);
      }

      const data = await db.UserPermission.findOne({ user: user });
      if(data){
        let result = [ ...permissions ];
        let temp = data._doc.permissions? [ ...data._doc.permissions ]: [];
        temp.forEach(d => {
          let t = result.filter(k => k.type == d.type && k.value == d.value);
          if(!t.length) result.push(t);
        });
        await data.updateOne({ permissions: result }, []);
      }else{
        await db.UserPermission({ user: user, permissions: permissions }).save();
      }

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
};