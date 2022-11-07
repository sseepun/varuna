const db = require('../../models');
const sanitize = require('mongo-sanitize');
const bcrypt = require('bcryptjs');
const { resProcess, formater, emailer } = require('../../helpers');


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
          condition['$or'] = [
            { firstname: new RegExp(dataFilter.keywords, 'i') },
            { lastname: new RegExp(dataFilter.keywords, 'i') },
            { username: new RegExp(dataFilter.keywords, 'i') },
            { email: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }

        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop
            .findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['partnerShops'] = partnerShop;
        }
        
        if(dataFilter.onlyAdmin){
          let roles = await db.UserRole.find({ level: { $gt: 97 } }).select('_id');
          if(roles) condition['role'] = roles;
        }
        if(dataFilter.onlySalesManager){
          let roles = await db.UserRole.find({ level: 2 }).select('_id');
          if(roles) condition['role'] = roles;
        }
        if(dataFilter.onlyPartner){
          let roles = await db.UserRole.find({ level: 10 }).select('_id');
          if(roles) condition['role'] = roles;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.User.find(condition)
          .select('-password -fcmToken -refreshToken')
          .populate({ path: 'role' })
          .populate({ path: 'partnerShops', select: '-description -gallery' })
          .sort({ firstname: 1, lastname: 1, createdAt: 1 }); 
      }else{
        result = await db.User.find(condition)
          .select('-password -fcmToken -refreshToken')
          .populate({ path: 'role' })
          .populate({ path: 'partnerShops', select: '-description -gallery' })
          .sort({ firstname: 1, lastname: 1, createdAt: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.User.countDocuments(condition);
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  userRead : async (req, res) => {
    try {
      var error = {};
      const { _id, isAdmin, isSalesManager, isPartner } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      let condition = { _id: sanitize(_id) };
      if(isAdmin){
        let roles = await db.UserRole.find({ level: { $gt: 97 } }).select('_id');
        if(roles) condition['role'] = roles;
        else{
          error['_id'] = 'role is invalid.';
          return resProcess['checkError'](res, error);
        }
      }else if(isSalesManager){
        let roles = await db.UserRole.find({ level: 2 }).select('_id');
        if(roles) condition['role'] = roles;
        else{
          error['_id'] = 'role is invalid.';
          return resProcess['checkError'](res, error);
        }
      }else if(isPartner){
        let roles = await db.UserRole.find({ level: 10 }).select('_id');
        if(roles) condition['role'] = roles;
      }

      var user = await db.User.findOne(condition)
        .select('-password -fcmToken -refreshToken')
        .populate({ path: 'role' })
        .populate({ path: 'partnerShops' })
        .populate({ path: 'address' });
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
        roleLevel, partnerShopIds, address, firstname, lastname, username, email,
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
      
      const role = await db.UserRole.findOne({ level: roleLevel }).select('_id');
      if(!role){
        error['roleLevel'] = 'roleLevel is invalid.';
        return resProcess['checkError'](res, error);
      }else if(role.level >= req.user.role.level){
        error['roleLevel'] = 'No permission.';
        return resProcess['checkError'](res, error);
      }

      const duplicateUsername = await db.User.findOne({ username: username });
      if(duplicateUsername){
        error['username'] = 'username is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateEmail = await db.User.findOne({ email: email });
      if(duplicateEmail){
        error['email'] = 'email is already in use.';
        return resProcess['checkError'](res, error);
      }

      const userAddress = await db.UserAddress(formater.address(address)).save();

      const salt = await bcrypt.genSalt(10);
      const bcryptPassword = await bcrypt.hash(password, salt);
      let updateInput = {
        role: role,
        partnerShops: [],
        address: userAddress,
        username: username,
        email: email,
        password: bcryptPassword,
        status: status
      };
      if(firstname!==undefined) updateInput['firstname'] = firstname;
      if(lastname!==undefined) updateInput['lastname'] = lastname;
      if(avatar!==undefined) updateInput['avatar'] = avatar;
      const user = await db.User(updateInput).save();

      if(role.level==2 && partnerShopIds!==undefined){
        const partnerShops = await db.PartnerShop.find({
          _id: partnerShopIds.map(d => sanitize(d))
        }).select('_id');
        await user.updateOne({
          partnerShops: partnerShops && partnerShops.length? partnerShops: []
        }, []);
      }
      
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  userUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, partnerShopIds, address, firstname, lastname, username, email,
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

      if(user.role.level==2 && partnerShopIds!==undefined){
        const partnerShops = await db.PartnerShop.find({
          _id: partnerShopIds.map(d => sanitize(d))
        }).select('_id');
        await user.updateOne({
          partnerShops: partnerShops && partnerShops.length? partnerShops: []
        }, []);
      }

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

  paymentMethodList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {};

      let result = [];
      if(!paginate){
        result = await db.PaymentMethod.find(condition)
          .sort({ order: 1 }); 
      }else{
        result = await db.PaymentMethod.find(condition)
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PaymentMethod.countDocuments(condition);
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  paymentMethodUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, icon, order, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const paymentMethod = await db.PaymentMethod.findById(sanitize(_id));
      if(!paymentMethod){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        order: order,
        status: status
      };
      if(icon!==undefined) updateInput['icon'] = icon;
      await paymentMethod.updateOne(updateInput, []);

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  packagingList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { name: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.Packaging.find(condition)
          .sort({ order: 1 }); 
      }else{
        result = await db.Packaging.find(condition)
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.Packaging.countDocuments(condition);
      }
  
      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  packagingRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const packaging = await db.Packaging.findById(sanitize(_id));
      if(!packaging){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: packaging
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  packagingCreate : async (req, res) => {
    try {
      var error = {};
      const { name, width, length, height, maxWeight, price, order, status } = req.body;
      
      if(!name) error['name'] = 'name is required.';
      if(!width && width!==0) error['width'] = 'width is required.';
      if(!length && length!==0) error['length'] = 'length is required.';
      if(!height && height!==0) error['height'] = 'height is required.';
      if(!price && price!==0) error['price'] = 'price is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      let updateInput = {
        name: name,
        width: width,
        length: length,
        height: height,
        price: price,
        order: order,
        status: status
      };
      if(maxWeight!==undefined) updateInput['maxWeight'] = maxWeight;
      await db.Packaging(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  packagingUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, name, width, length, height, maxWeight, price, order, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!name) error['name'] = 'name is required.';
      if(!width && width!==0) error['width'] = 'width is required.';
      if(!length && length!==0) error['length'] = 'length is required.';
      if(!height && height!==0) error['height'] = 'height is required.';
      if(!price && price!==0) error['price'] = 'price is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const packaging = await db.Packaging.findById(sanitize(_id));
      if(!packaging){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        name: name,
        width: width,
        length: length,
        height: height,
        price: price,
        order: order,
        status: status
      };
      if(maxWeight!==undefined) updateInput['maxWeight'] = maxWeight;
      await packaging.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  packagingDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const packaging = await db.Packaging.findById(sanitize(_id));
      if(!packaging){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await packaging.remove();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  warehouseAddressRead : async (req, res) => {
    try {
      var error = {};
      const { type } = req.query;
      
      if(!type) error['type'] = 'type is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const warehouseAddress = await db.WarehouseAddress.findOne({ type: type });
      if(!warehouseAddress){
        error['type'] = 'type is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: warehouseAddress
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  warehouseAddressUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        type, pickupName, address, subdistrict, district, province, zipcode,
        lat, lng, addressText, telephone, instruction
      } = req.body;
      
      if(!type) error['type'] = 'type is required.';
      if(!pickupName) error['pickupName'] = 'pickupName is required.';
      if(!address) error['address'] = 'address is required.';
      if(!subdistrict) error['subdistrict'] = 'subdistrict is required.';
      if(!district) error['district'] = 'district is required.';
      if(!province) error['province'] = 'province is required.';
      if(!zipcode) error['zipcode'] = 'zipcode is required.';
      if(!lat) error['lat'] = 'lat is required.';
      if(!lng) error['lng'] = 'lng is required.';
      if(!telephone) error['telephone'] = 'telephone is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const warehouseAddress = await db.WarehouseAddress.findOne({ type: type });
      if(!warehouseAddress){
        error['type'] = 'type is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        pickupName: pickupName,
        address: address,
        subdistrict: subdistrict,
        district: district,
        province: province,
        zipcode: zipcode,
        lat: lat,
        lng: lng,
        telephone: telephone
      };
      if(addressText!==undefined) updateInput['addressText'] = addressText;
      if(instruction!==undefined) updateInput['instruction'] = instruction;
      await warehouseAddress.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  shippingStatusList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { name: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.ShippingStatus.find(condition)
          .sort({ order: 1 }); 
      }else{
        result = await db.ShippingStatus.find(condition)
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.ShippingStatus.countDocuments(condition);
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingStatusRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingStatus = await db.ShippingStatus.findById(sanitize(_id));
      if(!shippingStatus){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      return resProcess['200'](res, {
        result: shippingStatus
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  shippingSubStatusList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
      
      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { name: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
        if(dataFilter.shippingStatusId){
          const shippingStatus = await db.ShippingStatus
            .findById(sanitize(dataFilter.shippingStatusId)).select('_id');
          if(shippingStatus) condition['shippingStatus'] = shippingStatus;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.ShippingSubStatus.find(condition)
          .populate({ path: 'shippingStatus' })
          .sort({ order: 1 }); 
      }else{
        result = await db.ShippingSubStatus.find(condition)
          .populate({ path: 'shippingStatus' })
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.ShippingSubStatus.countDocuments(condition);
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingSubStatusRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingSubStatus = await db.ShippingSubStatus.findById(sanitize(_id))
        .populate({ path: 'shippingStatus' });
      if(!shippingSubStatus){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      return resProcess['200'](res, {
        result: shippingSubStatus
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingSubStatusCreate : async (req, res) => {
    try {
      var error = {};
      const { shippingStatusId, name, description, order, status } = req.body;
      
      if(!shippingStatusId) error['shippingStatusId'] = 'shippingStatusId is required.';
      if(!name) error['name'] = 'name is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingStatus = await db.ShippingStatus.findById(sanitize(shippingStatusId)).select('name');
      if(!shippingStatus){
        error['shippingStatusId'] = 'shippingStatusId is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        shippingStatus: shippingStatus,
        name: name,
        order: order,
        status: status
      };
      if(description!==undefined) updateInput['description'] = description;
      const shippingSubStatus = await db.ShippingSubStatus(updateInput).save();

      await db.ShippingStatusMapping({
        type: 'C2U',
        externalStatus: shippingStatus.name,
        externalSubStatus: name,
        shippingStatus: shippingStatus,
        shippingSubStatus: shippingSubStatus,
        status: status
      }).save();

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingSubStatusUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, name, description, order, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!name) error['name'] = 'name is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingSubStatus = await db.ShippingSubStatus.findById(sanitize(_id))
        .populate({ path: 'shippingStatus' });
      if(!shippingSubStatus){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
      const shippingStatus = shippingSubStatus.shippingStatus;

      let updateInput = {
        name: name,
        order: order,
        status: status
      };
      if(description!==undefined) updateInput['description'] = description;
      await shippingSubStatus.updateOne(updateInput, []);
      
      const mapping = await db.ShippingStatusMapping.findOne({
        type: 'C2U',
        shippingStatus: shippingStatus,
        shippingSubStatus: shippingSubStatus
      });
      if(!mapping){
        await db.ShippingStatusMapping({
          type: 'C2U',
          externalStatus: shippingStatus.name,
          externalSubStatus: name,
          shippingStatus: shippingStatus,
          shippingSubStatus: shippingSubStatus,
          status: status
        }).save();
      }else{
        await mapping.updateOne({
          externalSubStatus: name,
          status: status
        }, []);
      }

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingSubStatusDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingSubStatus = await db.ShippingSubStatus.findById(sanitize(_id));
      if(!shippingSubStatus){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      await shippingSubStatus.remove();
      await db.ShippingStatusMapping.updateMany(
        { shippingSubStatus: shippingSubStatus }, { shippingSubStatus: null }
      );

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  shippingStatusMappingList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
        }
      }

      let result = [];
      if(!paginate){
        result = await db.ShippingStatusMapping.find(condition)
          .populate({ path: 'shippingSubStatus', select: '-description' })
          .populate({
            path: 'shippingStatus',
            options: { sort: { order: 1 } }
          }); 
      }else{
        result = await db.ShippingStatusMapping.find(condition)
          .populate({ path: 'shippingSubStatus', select: '-description' })
          .populate({
            path: 'shippingStatus',
            options: { sort: { order: 1 } }
          })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.ShippingStatusMapping.countDocuments(condition);
      }

      return resProcess['200'](res, {
        paginate: paginate? paginate: {},
        dataFilter: dataFilter? dataFilter: {},
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingStatusMappingCreate : async (req, res) => {
    try {
      var error = {};
      const {
        type, externalStatus, externalSubStatus, externalDescription,
        shippingStatusId, shippingSubStatusId, status
      } = req.body;
      
      if(!type) error['type'] = 'type is required.';
      if(!externalStatus) error['externalStatus'] = 'externalStatus is required.';
      if(!shippingStatusId) error['shippingStatusId'] = 'shippingStatusId is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingStatus = await db.ShippingStatus.findById(sanitize(shippingStatusId)).select('_id');
      if(!shippingStatus){
        error['shippingStatusId'] = 'shippingStatusId is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        type: type,
        externalStatus: externalStatus,
        shippingStatus: shippingStatus,
        status: status
      };
      if(externalSubStatus!==undefined) updateInput['externalSubStatus'] = externalSubStatus;
      if(externalDescription!==undefined) updateInput['externalDescription'] = externalDescription;
      if(shippingSubStatusId!==undefined){
        updateInput['shippingSubStatus'] = null;
        if(shippingSubStatusId){
          const shippingSubStatus = await db.ShippingSubStatus.findOne({
            shippingStatus: shippingStatus, _id: sanitize(shippingSubStatusId)
          }).select('_id');
          if(shippingSubStatus) updateInput['shippingSubStatus'] = shippingSubStatus;
        }
      }
      await db.ShippingStatusMapping(updateInput).save();

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingStatusMappingUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, externalDescription, shippingStatusId, shippingSubStatusId, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingStatusMapping = await db.ShippingStatusMapping.findById(sanitize(_id));
      if(!shippingStatusMapping){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      let updateInput = {
        status: status
      };
      if(externalDescription!==undefined) updateInput['externalDescription'] = externalDescription;
      if(shippingStatusId!==undefined){
        updateInput['shippingStatus'] = null;
        updateInput['shippingSubStatus'] = null;
        if(shippingStatusId){
          const shippingStatus = await db.ShippingStatus.findById(sanitize(shippingStatusId)).select('_id');
          if(shippingStatus){
            updateInput['shippingStatus'] = shippingStatus;
            if(shippingSubStatusId){
              const shippingSubStatus = await db.ShippingSubStatus.findOne({
                shippingStatus: shippingStatus, _id: sanitize(shippingSubStatusId)
              }).select('_id');
              if(shippingSubStatus) updateInput['shippingSubStatus'] = shippingSubStatus;
            }
          }
        }
      }
      await shippingStatusMapping.updateOne(updateInput, []);

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  shippingStatusMappingDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const shippingStatusMapping = await db.ShippingStatusMapping.findById(sanitize(_id));
      if(!shippingStatusMapping){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      await shippingStatusMapping.remove();

      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  sendEmailTest : async (req, res) => {
    try {
      var error = {};
      const { email } = req.body;
      
      if(!email) error['email'] = 'email is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      emailer.test(email);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
};