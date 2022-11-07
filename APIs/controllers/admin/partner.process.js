const db = require('../../models');
const sanitize = require('mongo-sanitize');
const bcrypt = require('bcryptjs');
const { resProcess, formater } = require('../../helpers');


module.exports = {
  
  partnerProductCategoryList : async (req, res) => {
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
        result = await db.PartnerProductCategory.find(condition)
          .select('-description')
          .sort({ order: 1 }); 
      }else{
        result = await db.PartnerProductCategory.find(condition)
          .select('-description')
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerProductCategory.countDocuments(condition);
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
  partnerProductCategoryRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const category = await db.PartnerProductCategory.findById(sanitize(_id));
      if(!category){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: category
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductCategoryCreate : async (req, res) => {
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
  partnerProductCategoryUpdate : async (req, res) => {
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
  partnerProductCategoryDelete : async (req, res) => {
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
  
  partnerProductSubCategoryList : async (req, res) => {
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
        if(dataFilter.categoryId){
          const category = await db.PartnerProductCategory
            .findById(sanitize(dataFilter.categoryId)).select('_id');
          if(category) condition['category'] = category;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerProductSubCategory.find(condition)
          .populate({ path: 'category', select: '-description' })
          .sort({ order: 1 }); 
      }else{
        result = await db.PartnerProductSubCategory.find(condition)
          .populate({ path: 'category', select: '-description' })
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerProductSubCategory.countDocuments(condition);
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
  partnerProductSubCategoryRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const subCategory = await db.PartnerProductSubCategory.findById(sanitize(_id));
      if(!subCategory){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: subCategory
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductSubCategoryCreate : async (req, res) => {
    try {
      var error = {};
      const { categoryId, name, description, url, image, icon, order, status } = req.body;
      
      if(!categoryId) error['categoryId'] = 'categoryId is required.';
      if(!name) error['name'] = 'name is required.';
      if(!url) error['url'] = 'url is required.';
      if(!image) error['image'] = 'image is required.';
      if(!icon) error['icon'] = 'icon is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const category = await db.PartnerProductCategory.findById(sanitize(categoryId)).select('_id');
      if(!category){
        error['categoryId'] = 'categoryId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateName = await db.PartnerProductSubCategory.findOne({ category: category, name: name }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProductSubCategory.findOne({ url: url }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        category: category,
        name: name,
        url: url,
        image: image,
        icon: icon,
        order: order,
        status: status
      };
      if(description!==undefined) updateInput['description'] = description;
      await db.PartnerProductSubCategory(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductSubCategoryUpdate : async (req, res) => {
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
  
      const subCategory = await db.PartnerProductSubCategory.findById(sanitize(_id))
        .populate({ path: 'category' });
      if(!subCategory){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateName = await db.PartnerProductSubCategory.findOne({
        category: subCategory.category, name: name, _id: { $ne: sanitize(_id) }
      }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProductSubCategory.findOne({ url: url, _id: { $ne: sanitize(_id) } }).select('_id');
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
      await subCategory.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductSubCategoryDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const subCategory = await db.PartnerProductSubCategory.findById(sanitize(_id));
      if(!subCategory){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await subCategory.remove();
      await db.PartnerProduct.updateMany({ subCategory: subCategory }, { subCategory: null });
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerProductBrandList : async (req, res) => {
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
        result = await db.PartnerProductBrand.find(condition)
          .select('-description')
          .sort({ order: 1 }); 
      }else{
        result = await db.PartnerProductBrand.find(condition)
          .select('-description')
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerProductBrand.countDocuments(condition);
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
  partnerProductBrandRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const brand = await db.PartnerProductBrand.findById(sanitize(_id));
      if(!brand){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: brand
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductBrandCreate : async (req, res) => {
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
  
      const duplicateName = await db.PartnerProductBrand.findOne({ name: name }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProductBrand.findOne({ url: url }).select('_id');
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
      await db.PartnerProductBrand(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductBrandUpdate : async (req, res) => {
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
  
      const brand = await db.PartnerProductBrand.findById(sanitize(_id));
      if(!brand){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateName = await db.PartnerProductBrand.findOne({ name: name, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProductBrand.findOne({ url: url, _id: { $ne: sanitize(_id) } }).select('_id');
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
      await brand.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductBrandDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const brand = await db.PartnerProductBrand.findById(sanitize(_id));
      if(!brand){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await brand.remove();
      await db.PartnerProduct.updateMany({ brand: brand }, { brand: null });
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerProductList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { sku: new RegExp(dataFilter.keywords, 'i') },
            { name: new RegExp(dataFilter.keywords, 'i') },
            { keywords: new RegExp(dataFilter.keywords, 'i') },
            { nameEN: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.categoryId){
          const category = await db.PartnerProductCategory
            .findById(sanitize(dataFilter.categoryId)).select('_id');
          if(category) condition['category'] = category;
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
      }
      
      let sort = {};
      if(dataFilter && dataFilter.sort){
        if(dataFilter.sort.includes('desc-')){
          sort[dataFilter.sort.replace('desc-', '')] = -1;
        }else if(dataFilter.sort.includes('asc-')){
          sort[dataFilter.sort.replace('asc-', '')] = 1;
        }
      }else{
        sort = { status: -1, name: 1 };
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerProduct.find(condition)
          .select('-description -keywords -specification -videoUrl -gallery -descriptionEN')
          .populate({ path: 'category', select: '_id name url icon status', options: { sort: { order: 1 } } })
          .populate({ path: 'subCategory', select: '_id name url icon status' })
          .populate({ path: 'brand', select: '_id name url icon status' })
          .sort(sort);
      }else{
        result = await db.PartnerProduct.find(condition)
          .select('-description -keywords -specification -videoUrl -gallery -descriptionEN')
          .populate({ path: 'category', select: '_id name url icon status', options: { sort: { order: 1 } } })
          .populate({ path: 'subCategory', select: '_id name url icon status' })
          .populate({ path: 'brand', select: '_id name url icon status' })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp)
          .sort(sort);
        paginate.total = await db.PartnerProduct.countDocuments(condition);
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
  partnerProductRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const product = await db.PartnerProduct.findById(sanitize(_id))
        .populate({ path: 'category' })
        .populate({ path: 'subCategory' })
        .populate({ path: 'brand' });
      if(!product){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: product
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductCreate : async (req, res) => {
    try {
      var error = {};
      const {
        categoryId, subCategoryId, brandId, sku, barcode, url,
        name, shortDescription, description, keywords, specification, youtubeVideoId,
        unit, unitLF, unitDescription, unitVariantName, price, memberPrice,
        partnerCommission, pointMultiplier, image, gallery,
        preparingDays, isPackagingReady, weight, width, length, height, status,
        nameEN, shortDescriptionEN, descriptionEN, specificationEN
      } = req.body;
      
      if(!sku) error['sku'] = 'sku is required.';
      if(!url) error['url'] = 'url is required.';
      if(!name) error['name'] = 'name is required.';
      if(!unit) error['unit'] = 'unit is required.';
      if(!price && price!==0) error['price'] = 'price is required.';
      if(!memberPrice && memberPrice!==0) error['memberPrice'] = 'memberPrice is required.';
      if(!partnerCommission && partnerCommission!==0) error['partnerCommission'] = 'partnerCommission is required.';
      if(!pointMultiplier && pointMultiplier!==0) error['pointMultiplier'] = 'pointMultiplier is required.';
      if(!isPackagingReady && isPackagingReady!==0) error['isPackagingReady'] = 'isPackagingReady is required.';
      if(!weight) error['weight'] = 'weight is required.';
      if(!width) error['width'] = 'width is required.';
      if(!length) error['length'] = 'length is required.';
      if(!height) error['height'] = 'height is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const duplicateSku = await db.PartnerProduct.findOne({ sku: sku }).select('_id');
      if(duplicateSku){
        error['sku'] = 'sku is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProduct.findOne({ url: url }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        sku: sku,
        url: url,
        name: name,
        unit: unit,
        price: price,
        memberPrice: memberPrice,
        partnerCommission: partnerCommission,
        pointMultiplier: pointMultiplier,
        preparingDays: preparingDays? preparingDays: 0,
        isPackagingReady: isPackagingReady,
        weight: weight,
        width: width,
        length: length,
        height: height,
        status: status
      };
      if(categoryId!==undefined){
        updateInput['category'] = null;
        updateInput['subCategory'] = null;
        if(categoryId){
          const category = await db.PartnerProductCategory.findById(sanitize(categoryId)).select('_id');
          if(category){
            updateInput['category'] = category;
            if(subCategoryId!==undefined){
              if(subCategoryId){
                const subCategory = await db.PartnerProductSubCategory
                  .findOne({ category: category, _id: sanitize(subCategoryId) }).select('_id');
                if(subCategory) updateInput['subCategory'] = subCategory;
              }
            }
          }
        }
      }
      if(brandId!==undefined){
        updateInput['brand'] = null;
        if(brandId){
          const brand = await db.PartnerProductBrand.findById(sanitize(brandId)).select('_id');
          if(brand) updateInput['brand'] = brand;
        }
      }
      if(barcode!==undefined) updateInput['barcode'] = barcode;
      if(shortDescription!==undefined) updateInput['shortDescription'] = shortDescription;
      if(description!==undefined) updateInput['description'] = description;
      if(keywords!==undefined) updateInput['keywords'] = keywords;
      if(specification!==undefined) updateInput['specification'] = specification;
      if(youtubeVideoId!==undefined) updateInput['youtubeVideoId'] = youtubeVideoId;
      if(unitLF!==undefined) updateInput['unitLF'] = unitLF;
      if(unitDescription!==undefined) updateInput['unitDescription'] = unitDescription;
      if(unitVariantName!==undefined) updateInput['unitVariantName'] = unitVariantName;
      if(image!==undefined) updateInput['image'] = image;
      if(gallery!==undefined) updateInput['gallery'] = gallery;
      if(nameEN!==undefined) updateInput['nameEN'] = nameEN;
      if(shortDescriptionEN!==undefined) updateInput['shortDescriptionEN'] = shortDescriptionEN;
      if(descriptionEN!==undefined) updateInput['descriptionEN'] = descriptionEN;
      if(specificationEN!==undefined) updateInput['specificationEN'] = specificationEN;
      const product = await db.PartnerProduct(updateInput).save();
  
      const partnerShops = await db.PartnerShop.find({}).select('_id');
      let promises = [];
      partnerShops.forEach(d => {
        promises.push(
          new Promise(async (resolve, reject) => {
            await db.PartnerShopStock({
              shop: d,
              product: product,
              stock: 0,
              status: 0
            }).save();
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
  partnerProductUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, categoryId, subCategoryId, brandId, sku, barcode, url,
        name, shortDescription, description, keywords, specification, youtubeVideoId,
        unit, unitLF, unitDescription, unitVariantName, price, memberPrice,
        partnerCommission, pointMultiplier, image, gallery,
        preparingDays, isPackagingReady, weight, width, length, height, status,
        nameEN, shortDescriptionEN, descriptionEN, specificationEN
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!sku) error['sku'] = 'sku is required.';
      if(!url) error['url'] = 'url is required.';
      if(!name) error['name'] = 'name is required.';
      if(!unit) error['unit'] = 'unit is required.';
      if(!price && price!==0) error['price'] = 'price is required.';
      if(!memberPrice && memberPrice!==0) error['memberPrice'] = 'memberPrice is required.';
      if(!partnerCommission && partnerCommission!==0) error['partnerCommission'] = 'partnerCommission is required.';
      if(!pointMultiplier && pointMultiplier!==0) error['pointMultiplier'] = 'pointMultiplier is required.';
      if(!isPackagingReady && isPackagingReady!==0) error['isPackagingReady'] = 'isPackagingReady is required.';
      if(!weight) error['weight'] = 'weight is required.';
      if(!width) error['width'] = 'width is required.';
      if(!length) error['length'] = 'length is required.';
      if(!height) error['height'] = 'height is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const product = await db.PartnerProduct.findById(sanitize(_id));
      if(!product){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateSku = await db.PartnerProduct.findOne({ sku: sku, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateSku){
        error['sku'] = 'sku is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerProduct.findOne({ url: url, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        sku: sku,
        url: url,
        name: name,
        unit: unit,
        price: price,
        memberPrice: memberPrice,
        partnerCommission: partnerCommission,
        pointMultiplier: pointMultiplier,
        preparingDays: preparingDays? preparingDays: 0,
        isPackagingReady: isPackagingReady,
        weight: weight,
        width: width,
        length: length,
        height: height,
        status: status
      };
      if(categoryId!==undefined){
        updateInput['category'] = null;
        updateInput['subCategory'] = null;
        if(categoryId){
          const category = await db.PartnerProductCategory.findById(sanitize(categoryId)).select('_id');
          if(category){
            updateInput['category'] = category;
            if(subCategoryId!==undefined){
              if(subCategoryId){
                const subCategory = await db.PartnerProductSubCategory
                  .findOne({ category: category, _id: sanitize(subCategoryId) }).select('_id');
                if(subCategory) updateInput['subCategory'] = subCategory;
              }
            }
          }
        }
      }
      if(brandId!==undefined){
        if(brandId){
          const brand = await db.PartnerProductBrand.findById(sanitize(brandId)).select('_id');
          if(brand) updateInput['brand'] = brand;
          else updateInput['brand'] = null;
        }else updateInput['brand'] = null;
      }
      if(barcode!==undefined) updateInput['barcode'] = barcode;
      if(shortDescription!==undefined) updateInput['shortDescription'] = shortDescription;
      if(description!==undefined) updateInput['description'] = description;
      if(keywords!==undefined) updateInput['keywords'] = keywords;
      if(specification!==undefined) updateInput['specification'] = specification;
      if(youtubeVideoId!==undefined) updateInput['youtubeVideoId'] = youtubeVideoId;
      if(unitLF!==undefined) updateInput['unitLF'] = unitLF;
      if(unitDescription!==undefined) updateInput['unitDescription'] = unitDescription;
      if(unitVariantName!==undefined) updateInput['unitVariantName'] = unitVariantName;
      if(image!==undefined) updateInput['image'] = image;
      if(gallery!==undefined) updateInput['gallery'] = gallery;
      if(nameEN!==undefined) updateInput['nameEN'] = nameEN;
      if(shortDescriptionEN!==undefined) updateInput['shortDescriptionEN'] = shortDescriptionEN;
      if(descriptionEN!==undefined) updateInput['descriptionEN'] = descriptionEN;
      if(specificationEN!==undefined) updateInput['specificationEN'] = specificationEN;
      await product.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const product = await db.PartnerProduct.findById(sanitize(_id));
      if(!product){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await product.remove();
      await db.PartnerProductUnit.deleteMany({ product: product });
      await db.PartnerShopStock.deleteMany({ product: product });
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerProductUnitList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.productId){
          const product = await db.PartnerProduct
            .findById(sanitize(dataFilter.productId)).select('_id');
          if(product) condition['product'] = product;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerProductUnit.find(condition)
          .populate({ path: 'product', populate: 'category subCategory brand' })
          .sort({ convertedQuantity: 1 });
      }else{
        result = await db.PartnerProductUnit.find(condition)
          .populate({ path: 'product', populate: 'category subCategory brand' })
          .sort({ convertedQuantity: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerProductUnit.countDocuments(condition);
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
  partnerProductUnitCreate : async (req, res) => {
    try {
      var error = {};
      const {
        productId, sku, barcode, unit, unitLF, unitDescription,
        convertedQuantity, price, memberPrice, isPackagingReady,
        weight, width, length, height, status
      } = req.body;
      
      if(!productId) error['productId'] = 'productId is required.';
      if(!sku) error['sku'] = 'sku is required.';
      if(!unit) error['unit'] = 'unit is required.';
      if(!convertedQuantity) error['convertedQuantity'] = 'convertedQuantity is required.';
      if(!price && price!==0) error['price'] = 'price is required.';
      if(!memberPrice && memberPrice!==0) error['memberPrice'] = 'memberPrice is required.';
      if(!isPackagingReady && isPackagingReady!==0) error['isPackagingReady'] = 'isPackagingReady is required.';
      if(!weight) error['weight'] = 'weight is required.';
      if(!width) error['width'] = 'width is required.';
      if(!length) error['length'] = 'length is required.';
      if(!height) error['height'] = 'height is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const product = await db.PartnerProduct.findById(sanitize(productId)).select('_id');
      if(!product){
        error['productId'] = 'productId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateUnit = await db.PartnerProductUnit.findOne({ product: product, unit: unit }).select('_id');
      if(duplicateUnit){
        error['unit'] = 'unit is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        product: product,
        sku: sku,
        unit: unit,
        convertedQuantity: convertedQuantity,
        price: price,
        memberPrice: memberPrice,
        isPackagingReady: isPackagingReady,
        weight: weight,
        width: width,
        length: length,
        height: height,
        status: status
      };
      if(barcode!==undefined) updateInput['barcode'] = barcode;
      if(unitLF!==undefined) updateInput['unitLF'] = unitLF;
      if(unitDescription!==undefined) updateInput['unitDescription'] = unitDescription;
      await db.PartnerProductUnit(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductUnitUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, sku, barcode, unit, unitLF, unitDescription,
        convertedQuantity, price, memberPrice, isPackagingReady,
        weight, width, length, height, status
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!sku) error['sku'] = 'sku is required.';
      if(!unit) error['unit'] = 'unit is required.';
      if(!convertedQuantity) error['convertedQuantity'] = 'convertedQuantity is required.';
      if(!price && price!==0) error['price'] = 'price is required.';
      if(!memberPrice && memberPrice!==0) error['memberPrice'] = 'memberPrice is required.';
      if(!isPackagingReady && isPackagingReady!==0) error['isPackagingReady'] = 'isPackagingReady is required.';
      if(!weight) error['weight'] = 'weight is required.';
      if(!width) error['width'] = 'width is required.';
      if(!length) error['length'] = 'length is required.';
      if(!height) error['height'] = 'height is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const productUnit = await db.PartnerProductUnit.findById(sanitize(_id))
        .populate({ path: 'product' });
      if(!productUnit){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateUnit = await db.PartnerProductUnit.findOne({
        product: productUnit.product, unit: unit, _id: { $ne: sanitize(_id) }
      }).select('_id');
      if(duplicateUnit){
        error['unit'] = 'unit is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        sku: sku,
        unit: unit,
        convertedQuantity: convertedQuantity,
        price: price,
        memberPrice: memberPrice,
        isPackagingReady: isPackagingReady,
        weight: weight,
        width: width,
        length: length,
        height: height,
        status: status
      };
      if(barcode!==undefined) updateInput['barcode'] = barcode;
      if(unitLF!==undefined) updateInput['unitLF'] = unitLF;
      if(unitDescription!==undefined) updateInput['unitDescription'] = unitDescription;
      await productUnit.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductUnitDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const productUnit = await db.PartnerProductUnit.findById(sanitize(_id));
      if(!productUnit){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await productUnit.remove();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerShippingList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { name: new RegExp(dataFilter.keywords, 'i') },
            { displayName: new RegExp(dataFilter.keywords, 'i') },
            { nadescriptionme: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerShipping.find(condition)
          .select('-packingDays -forAllProvinces -forProvinces')
          .sort({ order: 1 }); 
      }else{
        result = await db.PartnerShipping.find(condition)
          .select('-packingDays -forAllProvinces -forProvinces')
          .sort({ order: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerShipping.countDocuments(condition);
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
  partnerShippingRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const shipping = await db.PartnerShipping.findById(sanitize(_id));
      if(!shipping){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: shipping
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerShippingUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, displayName, description, minimumOrder, maximumOrder, icon,
        lfWeightFactor, kerryMaximumOrder, kerryEnableCOD, kerryMaximumCOD,
        packingDays, order, status, forAllProvinces, forProvinces
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!displayName) error['displayName'] = 'displayName is required.';
      if(!icon) error['icon'] = 'icon is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const shipping = await db.PartnerShipping.findById(sanitize(_id));
      if(!shipping){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateDisplayName = await db.PartnerShipping.findOne({
        displayName: displayName, _id: { $ne: sanitize(_id) }
      }).select('_id');
      if(duplicateDisplayName){
        error['displayName'] = 'displayName is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        displayName: displayName,
        icon: icon,
        order: order,
        status: status
      };
      if(shipping.type === 1){
        if(!lfWeightFactor && lfWeightFactor!==0) error['lfWeightFactor'] = 'lfWeightFactor is required.';
        if(!kerryMaximumOrder && kerryMaximumOrder!==0) error['kerryMaximumOrder'] = 'kerryMaximumOrder is required.';
        if(!kerryEnableCOD && kerryEnableCOD!==0) error['kerryEnableCOD'] = 'kerryEnableCOD is required.';
        if(!kerryMaximumCOD && kerryMaximumCOD!==0) error['kerryMaximumCOD'] = 'kerryMaximumCOD is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['lfWeightFactor'] = lfWeightFactor;
        updateInput['kerryMaximumOrder'] = kerryMaximumOrder;
        updateInput['kerryEnableCOD'] = kerryEnableCOD;
        updateInput['kerryMaximumCOD'] = kerryMaximumCOD;
      }
      if(description!==undefined) updateInput['description'] = description;
      if(minimumOrder!==undefined || minimumOrder===0) updateInput['minimumOrder'] = minimumOrder;
      else updateInput['minimumOrder'] = null;
      if(maximumOrder!==undefined || maximumOrder===0) updateInput['maximumOrder'] = maximumOrder;
      else updateInput['maximumOrder'] = null;
      if(packingDays!==undefined) updateInput['packingDays'] = packingDays;
      if(forAllProvinces!==undefined) updateInput['forAllProvinces'] = forAllProvinces;
      if(forProvinces!==undefined) updateInput['forProvinces'] = forProvinces;
      await shipping.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerShopList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { code: new RegExp(dataFilter.keywords, 'i') },
            { name: new RegExp(dataFilter.keywords, 'i') },
            { nameEN: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
        if(dataFilter.partnerId){
          const partner = await db.User.findById(sanitize(dataFilter.partnerId)).select('_id');
          if(partner) condition['partner'] = partner;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerShop.find(condition)
          .select('-description -gallery')
          .populate({ path: 'address' })
          .populate({ path: 'partner', select: '-password -fcmToken -refreshToken' })
          .sort({ type: 1 }); 
      }else{
        result = await db.PartnerShop.find(condition)
          .select('-description -gallery')
          .populate({ path: 'address' })
          .populate({ path: 'partner', select: '-password -fcmToken -refreshToken' })
          .sort({ type: 1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerShop.countDocuments(condition);
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
  partnerShopRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const shop = await db.PartnerShop.findById(sanitize(_id))
        .populate({ path: 'partner', select: '-password -fcmToken -refreshToken' })
        .populate({ path: 'address' });
      if(!shop){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: shop
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerShopCreate : async (req, res) => {
    try {
      var error = {};
      const {
        partnerId, code, erpCode, name, nameEN, description,
        type, url, image, gallery, email, address, telephones,
        line, facebook, instagram, website, workingHours, status
      } = req.body;
      
      if(!code) error['code'] = 'code is required.';
      if(!name) error['name'] = 'name is required.';
      if(!type) error['type'] = 'type is required.';
      if(!url) error['url'] = 'url is required.';
      if(!image) error['image'] = 'image is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const duplicateCode = await db.PartnerShop.findOne({ code: code }).select('_id');
      if(duplicateCode){
        error['code'] = 'code is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateName = await db.PartnerShop.findOne({ name: name }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerShop.findOne({ url: url }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let partner;
      const rolePartner = await db.UserRole.find({ level: 10 }).select('_id');
      const shopAddress = await db.PartnerShopAddress(formater.address(address)).save();
  
      let updateInput = {
        address: shopAddress,
        code: code,
        name: name,
        type: type,
        url: url,
        image: image,
        status: status
      };
      if(partnerId!==undefined){
        updateInput['partner'] = null;
        if(partnerId){
          partner = await db.User.findOne({ _id: sanitize(partnerId), role: rolePartner });
          if(partner) updateInput['partner'] = partner;
        }
      }
      if(erpCode!==undefined) updateInput['erpCode'] = erpCode;
      if(nameEN!==undefined) updateInput['nameEN'] = nameEN;
      if(description!==undefined) updateInput['description'] = description;
      if(gallery!==undefined) updateInput['gallery'] = gallery;
      if(email!==undefined) updateInput['email'] = email;
      if(telephones!==undefined) updateInput['telephones'] = telephones;
      if(line!==undefined) updateInput['line'] = line;
      if(facebook!==undefined) updateInput['facebook'] = facebook;
      if(instagram!==undefined) updateInput['instagram'] = instagram;
      if(website!==undefined) updateInput['website'] = website;
      if(workingHours!==undefined) updateInput['workingHours'] = workingHours;
      const shop = await db.PartnerShop(updateInput).save();
      
      const products = await db.PartnerProduct.find({}).select('_id');
      if(products && products.length){
        await db.PartnerShopStock.insertMany(
          products.map(k => {
            return { shop: shop, product: k, stock: 0, status: 0 };
          })
        );
      }
      
      const shippings = await db.PartnerShipping.find({}).select('_id');
      if(shippings && shippings.length){
        await db.PartnerShopShipping.insertMany(
          shippings.map(k => {
            return {
              shop: shop, shipping: k, status: 0,
              durations: [{ isDefault: 1, minDuration: 1, maxDuration: 1 }]
            };
          })
        );
      }

      if(partner){
        const partnerShops = await db.PartnerShop.find({ partner: partner }).select('_id');
        await partner.updateOne({ partnerShops: partnerShops }, []);
      }
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerShopUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, partnerId, code, erpCode, name, nameEN, description,
        type, url, image, gallery, email, address, telephones,
        line, facebook, instagram, website, workingHours, status
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!code) error['code'] = 'code is required.';
      if(!name) error['name'] = 'name is required.';
      if(!type) error['type'] = 'type is required.';
      if(!url) error['url'] = 'url is required.';
      if(!image) error['image'] = 'image is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const shop = await db.PartnerShop.findById(sanitize(_id))
        .populate({ path: 'address' });
      if(!shop){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateCode = await db.PartnerShop.findOne({ code: code, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateCode){
        error['code'] = 'code is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateName = await db.PartnerShop.findOne({ name: name, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateName){
        error['name'] = 'name is already in use.';
        return resProcess['checkError'](res, error);
      }
      const duplicateUrl = await db.PartnerShop.findOne({ url: url, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
      
      let partner;
      const rolePartner = await db.UserRole.find({ level: 10 }).select('_id');
  
      let updateInput = {
        code: code,
        name: name,
        type: type,
        url: url,
        image: image,
        status: status
      };
      if(partnerId!==undefined){
        updateInput['partner'] = null;
        if(partnerId){
          partner = await db.User.findOne({ _id: sanitize(partnerId), role: rolePartner });
          if(partner) updateInput['partner'] = partner;
        }
      }
      if(erpCode!==undefined) updateInput['erpCode'] = erpCode;
      if(nameEN!==undefined) updateInput['nameEN'] = nameEN;
      if(description!==undefined) updateInput['description'] = description;
      if(gallery!==undefined) updateInput['gallery'] = gallery;
      if(email!==undefined) updateInput['email'] = email;
      if(telephones!==undefined) updateInput['telephones'] = telephones;
      if(line!==undefined) updateInput['line'] = line;
      if(facebook!==undefined) updateInput['facebook'] = facebook;
      if(instagram!==undefined) updateInput['instagram'] = instagram;
      if(website!==undefined) updateInput['website'] = website;
      if(workingHours!==undefined) updateInput['workingHours'] = workingHours;
      await shop.updateOne(updateInput, []);
      await shop.address.updateOne(formater.address(address), []);

      const oldPartner = await db.User
        .findOne({ partnerShops: shop, role: rolePartner }).select('_id');
      if(oldPartner){
        const oldShops = await db.PartnerShop.find({ partner: oldPartner }).select('_id');
        await oldPartner.updateOne({ partnerShops: oldShops }, []);
      }
      if(partner){
        const partnerShops = await db.PartnerShop.find({ partner: partner }).select('_id');
        await partner.updateOne({ partnerShops: partnerShops }, []);
      }
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerShopDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const shop = await db.PartnerShop.findById(sanitize(_id));
      if(!shop){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await shop.remove();
      await db.PartnerShopStock.deleteMany({ shop: shop });
      await db.PartnerShopShipping.deleteMany({ shop: shop });
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerShopStockList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let productCondition = {};
      if(dataFilter){
        if(dataFilter.keywords){
          productCondition['$or'] = [
            { sku: new RegExp(dataFilter.keywords, 'i') },
            { name: new RegExp(dataFilter.keywords, 'i') },
            { keywords: new RegExp(dataFilter.keywords, 'i') },
            { nameEN: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.categoryId){
          const category = await db.PartnerProductCategory
            .findById(sanitize(dataFilter.categoryId)).select('_id');
          if(category) productCondition['category'] = category;
        }
      }
      const products = await db.PartnerProduct.find(productCondition).select('_id');
  
      let condition = { product: products };
      if(dataFilter){
        if(dataFilter.partnerShopId){
          const shop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(shop) condition['shop'] = shop;
        }
      }

      let sort = {};
      if(dataFilter && dataFilter.sort){
        if(dataFilter.sort.includes('desc-')){
          sort[dataFilter.sort.replace('desc-', '')] = -1;
        }else if(dataFilter.sort.includes('asc-')){
          sort[dataFilter.sort.replace('asc-', '')] = 1;
        }
      }else{
        sort = { status: -1, stock: -1 };
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerShopStock.find(condition)
          .populate({
            path: 'product',
            select: 'category subCategory brand sku name unit price memberPrice image status',
            populate: 'category subCategory brand'
          })
          .populate({ path: 'shop' })
          .sort(sort);
      }else{
        result = await db.PartnerShopStock.find(condition)
          .populate({
            path: 'product',
            select: 'category subCategory brand sku name unit price memberPrice image status',
            populate: 'category subCategory brand'
          })
          .populate({ path: 'shop' })
          .sort(sort)
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerShopStock.countDocuments(condition);
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
  partnerShopStockUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, stock, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!stock && stock!==0) error['stock'] = 'stock is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const productStock = await db.PartnerShopStock.findById(sanitize(_id));
      if(!productStock){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        stock: stock,
        status: status
      };
      await productStock.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerShopShippingList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {};
      if(dataFilter){
        if(dataFilter.partnerShopId){
          const shop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(shop) condition['shop'] = shop;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerShopShipping.find(condition)
          .populate({ path: 'shipping', options: { sort: { order: 1 } } })
          .populate({ path: 'shop' });
      }else{
        result = await db.PartnerShopShipping.find(condition)
          .populate({ path: 'shipping', options: { sort: { order: 1 } } })
          .populate({ path: 'shop' })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerShopShipping.countDocuments(condition);
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
  partnerShopShippingUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, durations, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!durations) error['durations'] = 'durations is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const productShipping = await db.PartnerShopShipping.findById(sanitize(_id))
        .populate({ path: 'shop' })
        .populate({ path: 'shipping' });
      if(!productShipping){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const shop = productShipping.shop;
      const shipping = productShipping.shipping;
      if(!shop || !shipping){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }else if(shipping.type == 1 && shop.type != 1){
        error['_id'] = 'No permission.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        durations: durations,
        status: status
      };
      if(shipping.type == 1){
        await db.PartnerShopShipping.updateMany({ shipping: shipping }, updateInput);
      }else{
        await productShipping.updateOne(updateInput, []);
      }
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerShopCommissionList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let conditionOrders = {};
      if(dataFilter){
        if(dataFilter.partnerShopId){
          const shop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(shop) conditionOrders['shop'] = shop;
        }
        if(dataFilter.paymentStatus){
          conditionOrders['paymentStatus'] = dataFilter.paymentStatus
        }
      }
      const orders = await db.CustomerOrder.find(conditionOrders).select('_id');
      
      let condition = { order: orders };
      
      let sort = {};
      if(dataFilter && dataFilter.sort){
        if(dataFilter.sort.includes('desc-')){
          sort[dataFilter.sort.replace('desc-', '')] = -1;
        }else if(dataFilter.sort.includes('asc-')){
          sort[dataFilter.sort.replace('asc-', '')] = 1;
        }
      }else{
        sort = { createdAt: -1 };
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerShopCommission.find(condition)
          .populate({ path: 'shop', select: 'code name type image status' })
          .populate({ path: 'customer', select: 'code firstname lastname username email avatar telephone' })
          .populate({ path: 'order', select: 'orderId paymentStatus' })
          .sort(sort);
      }else{
        result = await db.PartnerShopCommission.find(condition)
          .populate({ path: 'shop', select: 'code name type image status' })
          .populate({ path: 'customer', select: 'code firstname lastname username email avatar telephone' })
          .populate({ path: 'order', select: 'orderId paymentStatus' })
          .sort(sort)
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerShopCommission.countDocuments(condition);
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
  partnerShopCommissionRead : async (req, res) => {
    try {
      var error = {};
      const { orderId } = req.query;
      
      if(!orderId) error['orderId'] = 'orderId is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const order = await db.CustomerOrder.findById(sanitize(orderId)).select('_id');
      if(!order){
        error['orderId'] = 'orderId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const commission = await db.PartnerShopCommission.findOne({ order: order })
        .populate({ path: 'shop', select: 'code name type image status' })
        .populate({ path: 'customer', select: 'code firstname lastname username email avatar telephone' })
        .populate({ path: 'order', select: 'orderId paymentStatus' });
      if(!commission){
        error['commission'] = 'commission is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: commission
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerProductCouponList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {
        channel: 'C2U'
      };
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { code: new RegExp(dataFilter.keywords, 'i') },
            { name: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
        if(dataFilter.available){
          condition['leftQuantity'] = { $gt: 0 };
        }
        if(dataFilter.channel){
          condition['channel'] = dataFilter.channel;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerProductCoupon.find(condition)
          .select(`code name image quantity leftQuantity limitPerCustomer limitCustomerFrequency 
            startAt endAt status isRedeemPoints redeemPoints type discountType discount maximumDiscount 
            createdAt updatedAt`)
          .populate({ path: 'createdBy', select: 'firstname lastname username email avatar status' })
          .populate({ path: 'updatedBy', select: 'firstname lastname username email avatar status' })
          .sort({ createdAt: -1 }); 
      }else{
        result = await db.PartnerProductCoupon.find(condition)
          .select(`code name image quantity leftQuantity limitPerCustomer limitCustomerFrequency 
            startAt endAt status isRedeemPoints redeemPoints type discountType discount maximumDiscount 
            createdAt updatedAt`)
          .populate({ path: 'createdBy', select: 'firstname lastname username email avatar status' })
          .populate({ path: 'updatedBy', select: 'firstname lastname username email avatar status' })
          .sort({ createdAt: -1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerProductCoupon.countDocuments(condition);
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
  partnerProductCouponRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const coupon = await db.PartnerProductCoupon.findById(sanitize(_id))
        .populate({ path: 'promoteProductCategories', select: 'name status' })
        .populate({ path: 'promoteProducts', select: 'sku name status' })
        .populate({ path: 'forProductCategories', select: 'name status' })
        .populate({ path: 'forProducts', select: 'sku name status' })
        .populate({ path: 'forPartnerShops', select: 'code name type status' })
        .populate({ path: 'forCustomerTiers', select: 'name status' })
        .populate({ path: 'createdBy', select: 'firstname lastname username email avatar status' })
        .populate({ path: 'updatedBy', select: 'firstname lastname username email avatar status' });
      if(!coupon){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: coupon
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductCouponCreate : async (req, res) => {
    try {
      var error = {};
      const {
        channel, code, name, shortDescription, description, image, quantity,
        limitPerCustomer, limitCustomerFrequency, startAt, endAt, status,
        isRedeemPoints, redeemPoints,
        type, minimumOrder, maximumOrder, discountType, discount, maximumDiscount,
        promoteAvailableType,
        promoteAllProductCategories, promoteProductCategoryIds,
        promoteAllProducts, promoteProductIds,
        promoteCount, forCount,
        forAvailableType,
        forAllProductCategories, forProductCategoryIds,
        forAllProducts, forProductIds,
        forAllPartnerShops, forPartnerShopIds,
        forAllCustomerTiers, forCustomerTierIds
      } = req.body;
      
      if(!code) error['code'] = 'code is required.';
      if(!name) error['name'] = 'name is required.';
      if(!image) error['image'] = 'image is required.';
      if(!quantity && quantity!==0) error['quantity'] = 'quantity is required.';
      if(!limitPerCustomer && limitPerCustomer!==0) error['limitPerCustomer'] = 'limitPerCustomer is required.';
      if(!limitCustomerFrequency && limitCustomerFrequency!==0) error['limitCustomerFrequency'] = 'limitCustomerFrequency is required.';
      if(!startAt) error['startAt'] = 'startAt is required.';
      if(!endAt) error['endAt'] = 'endAt is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(!isRedeemPoints && isRedeemPoints!==0) error['isRedeemPoints'] = 'isRedeemPoints is required.';
      if(!type) error['type'] = 'type is required.';
      if(!forAllPartnerShops && forAllPartnerShops!==0) error['forAllPartnerShops'] = 'forAllPartnerShops is required.';
      if(!forAllCustomerTiers && forAllCustomerTiers!==0) error['forAllCustomerTiers'] = 'forAllCustomerTiers is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const duplicateCode = await db.PartnerProductCoupon.findOne({ code: code }).select('_id');
      if(duplicateCode){
        error['code'] = 'code is already in use.';
        return resProcess['checkError'](res, error);
      }
      
      let updateInput = {
        channel: channel? channel: 'C2U',
        code: code,
        name: name,
        image: image,
        quantity: quantity,
        leftQuantity: quantity,
        limitPerCustomer: limitPerCustomer,
        limitCustomerFrequency: limitCustomerFrequency,
        startAt: startAt,
        endAt: endAt,
        status: status,
        isRedeemPoints: isRedeemPoints,
        type: type,
        forAllPartnerShops: forAllPartnerShops,
        forPartnerShops: [],
        forAllCustomerTiers: forAllCustomerTiers,
        forCustomerTiers: [],
        minimumOrder: null,
        maximumOrder: null,
        forAvailableType: 1,
        forAllProductCategories: 1,
        forProductCategories: [],
        forAllProducts: 1,
        forProducts: [],
        createdBy: req.user,
        updatedBy: req.user,
      };
      if(shortDescription!==undefined) updateInput['shortDescription'] = shortDescription;
      if(description!==undefined) updateInput['description'] = description;
  
      if(isRedeemPoints == 1){
        if(!redeemPoints && redeemPoints!==0) error['redeemPoints'] = 'redeemPoints is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['redeemPoints'] = redeemPoints;
      }
  
      if(type == 1){
        if(!discountType) error['discountType'] = 'discountType is required.';
        if(!discount && discount!==0) error['discount'] = 'discount is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['discountType'] = discountType;
        updateInput['discount'] = discount;
        updateInput['maximumDiscount'] = discountType==2 && maximumDiscount? maximumDiscount: null;
        if(minimumOrder!==undefined) updateInput['minimumOrder'] = minimumOrder;
        if(maximumOrder!==undefined) updateInput['maximumOrder'] = maximumOrder;
      }else if(type == 2){
        if(!discountType) error['discountType'] = 'discountType is required.';
        if(!discount && discount!==0) error['discount'] = 'discount is required.';
        if(!promoteCount) error['promoteCount'] = 'promoteCount is required.';
        if(!forCount) error['forCount'] = 'forCount is required.';
        if(!promoteAvailableType && promoteAvailableType!==0) error['promoteAvailableType'] = 'promoteAvailableType is required.';
        if(!promoteAllProductCategories && promoteAllProductCategories!==0) error['promoteAllProductCategories'] = 'promoteAllProductCategories is required.';
        if(!promoteAllProducts && promoteAllProducts!==0) error['promoteAllProducts'] = 'promoteAllProducts is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['discountType'] = discountType;
        updateInput['discount'] = discount;
        updateInput['maximumDiscount'] = discountType==2 && maximumDiscount? maximumDiscount: null;
        updateInput['promoteCount'] = promoteCount;
        updateInput['forCount'] = forCount;
  
        updateInput['promoteAvailableType'] = promoteAvailableType;
        updateInput['promoteAllProductCategories'] = promoteAllProductCategories;
        updateInput['promoteAllProducts'] = promoteAllProducts;
        if(promoteAvailableType == 0 && promoteAllProductCategories == 0){
          const promoteProductCategories = await db.PartnerProductCategory.find({ _id: promoteProductCategoryIds.map(d => sanitize(d)) }).select('_id');
          if(promoteProductCategories) updateInput['promoteProductCategories'] = promoteProductCategories;
        }else if(promoteAvailableType == 0 && promoteAllProducts == 0){
          const promoteProducts = await db.PartnerProduct.find({ _id: promoteProductIds.map(d => sanitize(d)) }).select('_id');
          if(promoteProducts) updateInput['promoteProducts'] = promoteProducts;
        }
      }else if(type == 3){
        if(!discount && discount!==0) error['discount'] = 'discount is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
        
        updateInput['discountType'] = 1;
        updateInput['discount'] = discount;
        updateInput['maximumDiscount'] = null;
      }
  
      if([1, 2].indexOf(type) > -1){
        if(!forAvailableType && forAvailableType!==0) error['forAvailableType'] = 'forAvailableType is required.';
        if(!forAllProductCategories && forAllProductCategories!==0) error['forAllProductCategories'] = 'forAllProductCategories is required.';
        if(!forAllProducts && forAllProducts!==0) error['forAllProducts'] = 'forAllProducts is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['forAvailableType'] = forAvailableType;
        updateInput['forAllProductCategories'] = forAllProductCategories;
        updateInput['forAllProducts'] = forAllProducts;
        if(forAvailableType == 0 && forAllProductCategories == 0){
          const forProductCategories = await db.PartnerProductCategory.find({ _id: forProductCategoryIds.map(d => sanitize(d)) }).select('_id');
          if(forProductCategories) updateInput['forProductCategories'] = forProductCategories;
        }else if(forAvailableType == 1 && forAllProducts == 0){
          const forProducts = await db.PartnerProduct.find({ _id: forProductIds.map(d => sanitize(d)) }).select('_id');
          if(forProducts) updateInput['forProducts'] = forProducts;
        }
      }    
  
      if(forAllPartnerShops == 0){
        const forPartnerShops = await db.PartnerShop.find({ _id: forPartnerShopIds.map(d => sanitize(d)) }).select('_id');
        if(forPartnerShops) updateInput['forPartnerShops'] = forPartnerShops;
      }
      if(forAllCustomerTiers == 0){
        const forCustomerTiers = await db.CustomerTier.find({ _id: forCustomerTierIds.map(d => sanitize(d)) }).select('_id');
        if(forCustomerTiers) updateInput['forCustomerTiers'] = forCustomerTiers;
      }
  
      await db.PartnerProductCoupon(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductCouponUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, code, name, shortDescription, description, image, quantity,
        limitPerCustomer, limitCustomerFrequency, startAt, endAt, status,
        isRedeemPoints, redeemPoints,
        type, minimumOrder, maximumOrder, discountType, discount, maximumDiscount,
        promoteAvailableType,
        promoteAllProductCategories, promoteProductCategoryIds,
        promoteAllProducts, promoteProductIds,
        promoteCount, forCount,
        forAvailableType,
        forAllProductCategories, forProductCategoryIds,
        forAllProducts, forProductIds,
        forAllPartnerShops, forPartnerShopIds,
        forAllCustomerTiers, forCustomerTierIds
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!code) error['code'] = 'code is required.';
      if(!name) error['name'] = 'name is required.';
      if(!quantity && quantity!==0) error['quantity'] = 'quantity is required.';
      if(!limitPerCustomer && limitPerCustomer!==0) error['limitPerCustomer'] = 'limitPerCustomer is required.';
      if(!limitCustomerFrequency && limitCustomerFrequency!==0) error['limitCustomerFrequency'] = 'limitCustomerFrequency is required.';
      if(!startAt) error['startAt'] = 'startAt is required.';
      if(!endAt) error['endAt'] = 'endAt is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(!isRedeemPoints && isRedeemPoints!==0) error['isRedeemPoints'] = 'isRedeemPoints is required.';
      if(!type) error['type'] = 'type is required.';
      if(!forAllPartnerShops && forAllPartnerShops!==0) error['forAllPartnerShops'] = 'forAllPartnerShops is required.';
      if(!forAllCustomerTiers && forAllCustomerTiers!==0) error['forAllCustomerTiers'] = 'forAllCustomerTiers is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const coupon = await db.PartnerProductCoupon.findById(sanitize(_id));
      if(!coupon){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateCode = await db.PartnerProductCoupon.findOne({ code: code, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateCode){
        error['code'] = 'code is already in use.';
        return resProcess['checkError'](res, error);
      }
      
      let updateInput = {
        code: code,
        name: name,
        quantity: quantity,
        leftQuantity: Math.max(0, coupon.leftQuantity - coupon.quantity + quantity),
        limitPerCustomer: limitPerCustomer,
        limitCustomerFrequency: limitCustomerFrequency,
        startAt: startAt,
        endAt: endAt,
        status: status,
        isRedeemPoints: isRedeemPoints,
        type: type,
        forAllPartnerShops: forAllPartnerShops,
        forPartnerShops: [],
        forAllCustomerTiers: forAllCustomerTiers,
        forCustomerTiers: [],
        minimumOrder: null,
        maximumOrder: null,
        forAvailableType: 1,
        forAllProductCategories: 1,
        forProductCategories: [],
        forAllProducts: 1,
        forProducts: [],
        updatedBy: req.user,
      };
      if(image!==undefined) updateInput['image'] = image;
      if(shortDescription!==undefined) updateInput['shortDescription'] = shortDescription;
      if(description!==undefined) updateInput['description'] = description;
  
      if(isRedeemPoints == 1){
        if(!redeemPoints && redeemPoints!==0) error['redeemPoints'] = 'redeemPoints is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['redeemPoints'] = redeemPoints;
      }
  
      if(type == 1){
        if(!discountType) error['discountType'] = 'discountType is required.';
        if(!discount && discount!==0) error['discount'] = 'discount is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['discountType'] = discountType;
        updateInput['discount'] = discount;
        updateInput['maximumDiscount'] = discountType==2 && maximumDiscount? maximumDiscount: null;
        if(minimumOrder!==undefined) updateInput['minimumOrder'] = minimumOrder;
        if(maximumOrder!==undefined) updateInput['maximumOrder'] = maximumOrder;
      }else if(type == 2){
        if(!discountType) error['discountType'] = 'discountType is required.';
        if(!discount && discount!==0) error['discount'] = 'discount is required.';
        if(!promoteCount) error['promoteCount'] = 'promoteCount is required.';
        if(!forCount) error['forCount'] = 'forCount is required.';
        if(!promoteAvailableType && promoteAvailableType!==0) error['promoteAvailableType'] = 'promoteAvailableType is required.';
        if(!promoteAllProductCategories && promoteAllProductCategories!==0) error['promoteAllProductCategories'] = 'promoteAllProductCategories is required.';
        if(!promoteAllProducts && promoteAllProducts!==0) error['promoteAllProducts'] = 'promoteAllProducts is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['discountType'] = discountType;
        updateInput['discount'] = discount;
        updateInput['maximumDiscount'] = discountType==2 && maximumDiscount? maximumDiscount: null;
        updateInput['promoteCount'] = promoteCount;
        updateInput['forCount'] = forCount;
  
        updateInput['promoteAvailableType'] = promoteAvailableType;
        updateInput['promoteAllProductCategories'] = promoteAllProductCategories;
        updateInput['promoteAllProducts'] = promoteAllProducts;
        if(promoteAvailableType == 0 && promoteAllProductCategories == 0){
          const promoteProductCategories = await db.PartnerProductCategory.find({ _id: promoteProductCategoryIds.map(d => sanitize(d)) }).select('_id');
          if(promoteProductCategories) updateInput['promoteProductCategories'] = promoteProductCategories;
        }else if(promoteAvailableType == 1 && promoteAllProducts == 0){
          const promoteProducts = await db.PartnerProduct.find({ _id: promoteProductIds.map(d => sanitize(d)) }).select('_id');
          if(promoteProducts) updateInput['promoteProducts'] = promoteProducts;
        }
      }else if(type == 3){
        if(!discount && discount!==0) error['discount'] = 'discount is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
        
        updateInput['discountType'] = 1;
        updateInput['discount'] = discount;
        updateInput['maximumDiscount'] = null;
      }
  
      if([1, 2].indexOf(type) > -1){
        if(!forAvailableType && forAvailableType!==0) error['forAvailableType'] = 'forAvailableType is required.';
        if(!forAllProductCategories && forAllProductCategories!==0) error['forAllProductCategories'] = 'forAllProductCategories is required.';
        if(!forAllProducts && forAllProducts!==0) error['forAllProducts'] = 'forAllProducts is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['forAvailableType'] = forAvailableType;
        updateInput['forAllProductCategories'] = forAllProductCategories;
        updateInput['forAllProducts'] = forAllProducts;
        if(forAvailableType == 0 && forAllProductCategories == 0){
          const forProductCategories = await db.PartnerProductCategory.find({ _id: forProductCategoryIds.map(d => sanitize(d)) }).select('_id');
          if(forProductCategories) updateInput['forProductCategories'] = forProductCategories;
        }else if(forAvailableType == 1 && forAllProducts == 0){
          const forProducts = await db.PartnerProduct.find({ _id: forProductIds.map(d => sanitize(d)) }).select('_id');
          
          if(forProducts) updateInput['forProducts'] = forProducts;
        }
      }    
  
      if(forAllPartnerShops == 0){
        const forPartnerShops = await db.PartnerShop.find({ _id: forPartnerShopIds.map(d => sanitize(d)) }).select('_id');
        if(forPartnerShops) updateInput['forPartnerShops'] = forPartnerShops;
      }
      if(forAllCustomerTiers == 0){
        const forCustomerTiers = await db.CustomerTier.find({ _id: forCustomerTierIds.map(d => sanitize(d)) }).select('_id');
        if(forCustomerTiers) updateInput['forCustomerTiers'] = forCustomerTiers;
      }
  
      await coupon.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerProductCouponDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const coupon = await db.PartnerProductCoupon.findById(sanitize(_id));
      if(!coupon){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await coupon.remove();
      await db.PartnerProductCouponLog.deleteMany({ coupon: coupon, isUsed: 0 });
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerShippingCouponList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {
        channel: 'C2U'
      };
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { code: new RegExp(dataFilter.keywords, 'i') },
            { name: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
        if(dataFilter.available){
          condition['leftQuantity'] = { $gt: 0 };
        }
        if(dataFilter.channel){
          condition['channel'] = dataFilter.channel;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.PartnerShippingCoupon.find(condition)
          .select(`code name image quantity leftQuantity limitPerCustomer limitCustomerFrequency 
            startAt endAt status isRedeemPoints redeemPoints discountType discount maximumDiscount 
            createdAt updatedAt`)
          .populate({ path: 'shippings', select: 'name displayName status' })
          .populate({ path: 'createdBy', select: 'firstname lastname username email avatar status' })
          .populate({ path: 'updatedBy', select: 'firstname lastname username email avatar status' })
          .sort({ createdAt: -1 }); 
      }else{
        result = await db.PartnerShippingCoupon.find(condition)
          .select(`code name image quantity leftQuantity limitPerCustomer limitCustomerFrequency 
            startAt endAt status isRedeemPoints redeemPoints discountType discount maximumDiscount 
            createdAt updatedAt`)
          .populate({ path: 'shippings', select: 'name displayName status' })
          .populate({ path: 'createdBy', select: 'firstname lastname username email avatar status' })
          .populate({ path: 'updatedBy', select: 'firstname lastname username email avatar status' })
          .sort({ createdAt: -1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.PartnerShippingCoupon.countDocuments(condition);
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
  partnerShippingCouponRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const coupon = await db.PartnerShippingCoupon.findById(sanitize(_id))
        .populate({ path: 'shippings', select: 'name displayName status' })
        .populate({ path: 'forProductCategories', select: 'name status' })
        .populate({ path: 'forProducts', select: 'sku name status' })
        .populate({ path: 'forPartnerShops', select: 'code name type status' })
        .populate({ path: 'forCustomerTiers', select: 'name status' })
        .populate({ path: 'createdBy', select: 'firstname lastname username email avatar status' })
        .populate({ path: 'updatedBy', select: 'firstname lastname username email avatar status' });
      if(!coupon){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: coupon
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerShippingCouponCreate : async (req, res) => {
    try {
      var error = {};
      const {
        channel, shippingIds, code, name, shortDescription, description, image, quantity,
        limitPerCustomer, limitCustomerFrequency, startAt, endAt, status,
        isRedeemPoints, redeemPoints,
        minimumOrder, maximumOrder, discountType, discount, maximumDiscount,
        forAvailableType,
        forAllProductCategories, forProductCategoryIds,
        forAllProducts, forProductIds,
        forAllPartnerShops, forPartnerShopIds,
        forAllCustomerTiers, forCustomerTierIds
      } = req.body;
      
      if(!shippingIds || !shippingIds.length) error['shippingIds'] = 'shippingIds is required.';
      if(!code) error['code'] = 'code is required.';
      if(!name) error['name'] = 'name is required.';
      if(!image) error['image'] = 'image is required.';
      if(!quantity && quantity!==0) error['quantity'] = 'quantity is required.';
      if(!limitPerCustomer && limitPerCustomer!==0) error['limitPerCustomer'] = 'limitPerCustomer is required.';
      if(!limitCustomerFrequency && limitCustomerFrequency!==0) error['limitCustomerFrequency'] = 'limitCustomerFrequency is required.';
      if(!startAt) error['startAt'] = 'startAt is required.';
      if(!endAt) error['endAt'] = 'endAt is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(!isRedeemPoints && isRedeemPoints!==0) error['isRedeemPoints'] = 'isRedeemPoints is required.';
      if(!discountType) error['discountType'] = 'discountType is required.';
      if(!discount && discount!==0) error['discount'] = 'discount is required.';
      if(!forAllPartnerShops && forAllPartnerShops!==0) error['forAllPartnerShops'] = 'forAllPartnerShops is required.';
      if(!forAllCustomerTiers && forAllCustomerTiers!==0) error['forAllCustomerTiers'] = 'forAllCustomerTiers is required.';
      if(!forAvailableType && forAvailableType!==0) error['forAvailableType'] = 'forAvailableType is required.';
      if(!forAllProductCategories && forAllProductCategories!==0) error['forAllProductCategories'] = 'forAllProductCategories is required.';
      if(!forAllProducts && forAllProducts!==0) error['forAllProducts'] = 'forAllProducts is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const duplicateCode = await db.PartnerShippingCoupon.findOne({ code: code }).select('_id');
      if(duplicateCode){
        error['code'] = 'code is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      const shippings = await db.PartnerShipping.find({ _id: shippingIds.map(d => sanitize(d)) }).select('_id');
      
      let updateInput = {
        channel: channel? channel: 'C2U',
        shippings: shippings,
        code: code,
        name: name,
        image: image,
        quantity: quantity,
        leftQuantity: quantity,
        limitPerCustomer: limitPerCustomer,
        limitCustomerFrequency: limitCustomerFrequency,
        startAt: startAt,
        endAt: endAt,
        status: status,
        isRedeemPoints: isRedeemPoints,
        forAllPartnerShops: forAllPartnerShops,
        forPartnerShops: [],
        forAllCustomerTiers: forAllCustomerTiers,
        forCustomerTiers: [],
        minimumOrder: null,
        maximumOrder: null,
        forAvailableType: 1,
        forAllProductCategories: 1,
        forProductCategories: [],
        forAllProducts: 1,
        forProducts: [],
        discountType: discountType,
        discount: discount,
        maximumDiscount: discountType==2 && maximumDiscount? maximumDiscount: null,
        forAvailableType: forAvailableType,
        forAllProductCategories: forAllProductCategories,
        forAllProducts: forAllProducts,
        createdBy: req.user,
        updatedBy: req.user,
      };
      if(shortDescription!==undefined) updateInput['shortDescription'] = shortDescription;
      if(description!==undefined) updateInput['description'] = description;
      if(minimumOrder!==undefined) updateInput['minimumOrder'] = minimumOrder;
      if(maximumOrder!==undefined) updateInput['maximumOrder'] = maximumOrder;
  
      if(isRedeemPoints == 1){
        if(!redeemPoints && redeemPoints!==0) error['redeemPoints'] = 'redeemPoints is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['redeemPoints'] = redeemPoints;
      }
  
      if(forAvailableType == 0 && forAllProductCategories == 0){
        const forProductCategories = await db.PartnerProductCategory.find({ _id: forProductCategoryIds.map(d => sanitize(d)) }).select('_id');
        if(forProductCategories) updateInput['forProductCategories'] = forProductCategories;
      }else if(forAvailableType == 1 && forAllProducts == 0){
        const forProducts = await db.PartnerProduct.find({ _id: forProductIds.map(d => sanitize(d)) }).select('_id');
        if(forProducts) updateInput['forProducts'] = forProducts;
      }
  
      if(forAllPartnerShops == 0){
        const forPartnerShops = await db.PartnerShop.find({ _id: forPartnerShopIds.map(d => sanitize(d)) }).select('_id');
        if(forPartnerShops) updateInput['forPartnerShops'] = forPartnerShops;
      }
      if(forAllCustomerTiers == 0){
        const forCustomerTiers = await db.CustomerTier.find({ _id: forCustomerTierIds.map(d => sanitize(d)) }).select('_id');
        if(forCustomerTiers) updateInput['forCustomerTiers'] = forCustomerTiers;
      }
  
      await db.PartnerShippingCoupon(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerShippingCouponUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, shippingIds, code, name, shortDescription, description, image, quantity,
        limitPerCustomer, limitCustomerFrequency, startAt, endAt, status,
        isRedeemPoints, redeemPoints,
        minimumOrder, maximumOrder, discountType, discount, maximumDiscount,
        forAvailableType,
        forAllProductCategories, forProductCategoryIds,
        forAllProducts, forProductIds,
        forAllPartnerShops, forPartnerShopIds,
        forAllCustomerTiers, forCustomerTierIds
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!shippingIds || !shippingIds.length) error['shippingIds'] = 'shippingIds is required.';
      if(!code) error['code'] = 'code is required.';
      if(!name) error['name'] = 'name is required.';
      if(!quantity && quantity!==0) error['quantity'] = 'quantity is required.';
      if(!limitPerCustomer && limitPerCustomer!==0) error['limitPerCustomer'] = 'limitPerCustomer is required.';
      if(!limitCustomerFrequency && limitCustomerFrequency!==0) error['limitCustomerFrequency'] = 'limitCustomerFrequency is required.';
      if(!startAt) error['startAt'] = 'startAt is required.';
      if(!endAt) error['endAt'] = 'endAt is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(!isRedeemPoints && isRedeemPoints!==0) error['isRedeemPoints'] = 'isRedeemPoints is required.';
      if(!discountType) error['discountType'] = 'discountType is required.';
      if(!discount && discount!==0) error['discount'] = 'discount is required.';
      if(!forAllPartnerShops && forAllPartnerShops!==0) error['forAllPartnerShops'] = 'forAllPartnerShops is required.';
      if(!forAllCustomerTiers && forAllCustomerTiers!==0) error['forAllCustomerTiers'] = 'forAllCustomerTiers is required.';
      if(!forAvailableType && forAvailableType!==0) error['forAvailableType'] = 'forAvailableType is required.';
      if(!forAllProductCategories && forAllProductCategories!==0) error['forAllProductCategories'] = 'forAllProductCategories is required.';
      if(!forAllProducts && forAllProducts!==0) error['forAllProducts'] = 'forAllProducts is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const coupon = await db.PartnerShippingCoupon.findById(sanitize(_id));
      if(!coupon){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateCode = await db.PartnerShippingCoupon.findOne({ code: code, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateCode){
        error['code'] = 'code is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      const shippings = await db.PartnerShipping.find({ _id: shippingIds.map(d => sanitize(d)) }).select('_id');
      
      let updateInput = {
        shippings: shippings,
        code: code,
        name: name,
        quantity: quantity,
        leftQuantity: Math.max(0, coupon.leftQuantity - coupon.quantity + quantity),
        limitPerCustomer: limitPerCustomer,
        limitCustomerFrequency: limitCustomerFrequency,
        startAt: startAt,
        endAt: endAt,
        status: status,
        isRedeemPoints: isRedeemPoints,
        forAllPartnerShops: forAllPartnerShops,
        forPartnerShops: [],
        forAllCustomerTiers: forAllCustomerTiers,
        forCustomerTiers: [],
        minimumOrder: null,
        maximumOrder: null,
        forAvailableType: 1,
        forAllProductCategories: 1,
        forProductCategories: [],
        forAllProducts: 1,
        forProducts: [],
        discountType: discountType,
        discount: discount,
        maximumDiscount: discountType==2 && maximumDiscount? maximumDiscount: null,
        forAvailableType: forAvailableType,
        forAllProductCategories: forAllProductCategories,
        forAllProducts: forAllProducts,
        updatedBy: req.user,
      };
      if(image!==undefined) updateInput['image'] = image;
      if(shortDescription!==undefined) updateInput['shortDescription'] = shortDescription;
      if(description!==undefined) updateInput['description'] = description;
      if(minimumOrder!==undefined) updateInput['minimumOrder'] = minimumOrder;
      if(maximumOrder!==undefined) updateInput['maximumOrder'] = maximumOrder;
  
      if(isRedeemPoints == 1){
        if(!redeemPoints && redeemPoints!==0) error['redeemPoints'] = 'redeemPoints is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        updateInput['redeemPoints'] = redeemPoints;
      }
  
      if(forAvailableType == 0 && forAllProductCategories == 0){
        const forProductCategories = await db.PartnerProductCategory.find({ _id: forProductCategoryIds.map(d => sanitize(d)) }).select('_id');
        if(forProductCategories) updateInput['forProductCategories'] = forProductCategories;
      }else if(forAvailableType == 1 && forAllProducts == 0){
        const forProducts = await db.PartnerProduct.find({ _id: forProductIds.map(d => sanitize(d)) }).select('_id');
        if(forProducts) updateInput['forProducts'] = forProducts;
      }
  
      if(forAllPartnerShops == 0){
        const forPartnerShops = await db.PartnerShop.find({ _id: forPartnerShopIds.map(d => sanitize(d)) }).select('_id');
        if(forPartnerShops) updateInput['forPartnerShops'] = forPartnerShops;
      }
      if(forAllCustomerTiers == 0){
        const forCustomerTiers = await db.CustomerTier.find({ _id: forCustomerTierIds.map(d => sanitize(d)) }).select('_id');
        if(forCustomerTiers) updateInput['forCustomerTiers'] = forCustomerTiers;
      }
  
      await coupon.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerShippingCouponDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const coupon = await db.PartnerShippingCoupon.findById(sanitize(_id));
      if(!coupon){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await coupon.remove();
      await db.PartnerShippingCouponLog.deleteMany({ coupon: coupon, isUsed: 0 });
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  partnerFreeShippingRuleRead : async (req, res) => {
    try {
      const result = await db.PartnerFreeShippingRule.findOne()
        .populate({ path: 'shippings', select: 'name displayName status' })
        .populate({ path: 'forProductCategories', select: 'name status' })
        .populate({ path: 'forProducts', select: 'sku name status' })
        .populate({ path: 'forPartnerShops', select: 'code name type status' })
        .populate({ path: 'forCustomerTiers', select: 'name status' })
        .populate({ path: 'updatedBy', select: 'firstname lastname username email avatar status' });
      return resProcess['200'](res, {
        result: result? result: {}
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  partnerFreeShippingRuleUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        status, shippingIds,
        minimumOrder, maximumOrder,
        forAvailableType,
        forAllProductCategories, forProductCategoryIds,
        forAllProducts, forProductIds,
        forAllPartnerShops, forPartnerShopIds,
        forAllCustomerTiers, forCustomerTierIds
      } = req.body;
  
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      let updateInput = {
        status: status,
        updatedBy: req.user
      };
      if(status == 1){
        if(!shippingIds || !shippingIds.length) error['shippingIds'] = 'shippingIds is required.';
        if(!forAllPartnerShops && forAllPartnerShops!==0) error['forAllPartnerShops'] = 'forAllPartnerShops is required.';
        if(!forAllCustomerTiers && forAllCustomerTiers!==0) error['forAllCustomerTiers'] = 'forAllCustomerTiers is required.';
        if(!forAvailableType && forAvailableType!==0) error['forAvailableType'] = 'forAvailableType is required.';
        if(!forAllProductCategories && forAllProductCategories!==0) error['forAllProductCategories'] = 'forAllProductCategories is required.';
        if(!forAllProducts && forAllProducts!==0) error['forAllProducts'] = 'forAllProducts is required.';
        if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
        if(minimumOrder!==undefined) updateInput['minimumOrder'] = minimumOrder;
        if(maximumOrder!==undefined) updateInput['maximumOrder'] = maximumOrder;
  
        const shippings = await db.PartnerShipping.find({ _id: shippingIds.map(d => sanitize(d)) }).select('_id');
        updateInput['shippings'] = shippings;
  
        updateInput['forAvailableType'] = forAvailableType;
        updateInput['forAllProductCategories'] = forAllProductCategories;
        updateInput['forAllProducts'] = forAllProducts;
        if(forAvailableType == 0 && forAllProductCategories == 0){
          const forProductCategories = await db.PartnerProductCategory.find({ _id: forProductCategoryIds.map(d => sanitize(d)) }).select('_id');
          if(forProductCategories) updateInput['forProductCategories'] = forProductCategories;
        }else if(forAvailableType == 1 && forAllProducts == 0){
          const forProducts = await db.PartnerProduct.find({ _id: forProductIds.map(d => sanitize(d)) }).select('_id');
          if(forProducts) updateInput['forProducts'] = forProducts;
        }
  
        updateInput['forAllPartnerShops'] = forAllPartnerShops;
        if(forAllPartnerShops == 0){
          const forPartnerShops = await db.PartnerShop.find({ _id: forPartnerShopIds.map(d => sanitize(d)) }).select('_id');
          if(forPartnerShops) updateInput['forPartnerShops'] = forPartnerShops;
        }
        
        updateInput['forAllCustomerTiers'] = forAllCustomerTiers;
        if(forAllCustomerTiers == 0){
          const forCustomerTiers = await db.CustomerTier.find({ _id: forCustomerTierIds.map(d => sanitize(d)) }).select('_id');
          if(forCustomerTiers) updateInput['forCustomerTiers'] = forCustomerTiers;
        }
      }
  
      const rule = await db.PartnerFreeShippingRule.findOne();
      if(rule) await rule.updateOne(updateInput, []);
      else await db.PartnerFreeShippingRule(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

};