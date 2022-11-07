const db = require('../../models');
const sanitize = require('mongo-sanitize');
const { resProcess } = require('../../helpers');


module.exports = {

  cmsContentCategoryList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {
        type: 'C2U'
      };
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { title: new RegExp(dataFilter.keywords, 'i') },
            { description: new RegExp(dataFilter.keywords, 'i') },
            { keywords: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
        }
        if(dataFilter.status || dataFilter.status===0){
          condition['status'] = dataFilter.status;
        }
      }
  
      let result = [];
      if(!paginate){
        result = await db.CmsContentCategory.find(condition)
          .select('-description -metaTitle -metaDescription -metaKeywords')
          .sort({ status: -1, order: 1, createdAt: -1 }); 
      }else{
        result = await db.CmsContentCategory.find(condition)
          .select('-description -metaTitle -metaDescription -metaKeywords')
          .sort({ status: -1, order: 1, createdAt: -1 })
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.CmsContentCategory.countDocuments(condition);
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
  cmsContentCategoryRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const category = await db.CmsContentCategory.findById(sanitize(_id));
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
  cmsContentCategoryCreate : async (req, res) => {
    try {
      var error = {};
      const {
        type, title, description, keywords, metaTitle, metaDescription, metaKeywords,
        url, image, showOnMobile, order, status
      } = req.body;
      
      if(!type) error['type'] = 'type is required.';
      if(!title) error['title'] = 'title is required.';
      if(!url) error['url'] = 'url is required.';
      if(!showOnMobile && showOnMobile!==0) error['showOnMobile'] = 'showOnMobile is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const duplicateUrl = await db.CmsContentCategory
        .findOne({ type: type, url: url }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        title: title,
        url: url,
        showOnMobile: showOnMobile,
        order: order,
        status: status
      };
      if(description!==undefined) updateInput['description'] = description;
      if(keywords!==undefined) updateInput['keywords'] = keywords;
      if(metaTitle!==undefined) updateInput['metaTitle'] = metaTitle;
      if(metaDescription!==undefined) updateInput['metaDescription'] = metaDescription;
      if(metaKeywords!==undefined) updateInput['metaKeywords'] = metaKeywords;
      if(image!==undefined) updateInput['image'] = image;
      await db.CmsContentCategory(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsContentCategoryUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, type, title, description, keywords, metaTitle, metaDescription, metaKeywords,
        url, image, showOnMobile, order, status
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!type) error['type'] = 'type is required.';
      if(!title) error['title'] = 'title is required.';
      if(!url) error['url'] = 'url is required.';
      if(!showOnMobile && showOnMobile!==0) error['showOnMobile'] = 'showOnMobile is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      const category = await db.CmsContentCategory.findById(sanitize(_id));
      if(!category){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateUrl = await db.CmsContentCategory
        .findOne({ type: type, url: url, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        title: title,
        url: url,
        showOnMobile: showOnMobile,
        order: order,
        status: status
      };
      if(description!==undefined) updateInput['description'] = description;
      if(keywords!==undefined) updateInput['keywords'] = keywords;
      if(metaTitle!==undefined) updateInput['metaTitle'] = metaTitle;
      if(metaDescription!==undefined) updateInput['metaDescription'] = metaDescription;
      if(metaKeywords!==undefined) updateInput['metaKeywords'] = metaKeywords;
      if(image!==undefined) updateInput['image'] = image;
      await category.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsContentCategoryDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const category = await db.CmsContentCategory.findOne({ _id: sanitize(_id), isDeletable: 1 });
      if(!category){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await category.remove();
      await db.CmsContent.updateMany({ category: category }, { category: null });
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  cmsContentList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {
        type: 'C2U'
      };
      if(dataFilter){
        if(dataFilter.keywords){
          condition['$or'] = [
            { title: new RegExp(dataFilter.keywords, 'i') },
            { description: new RegExp(dataFilter.keywords, 'i') },
            { keywords: new RegExp(dataFilter.keywords, 'i') },
          ];
        }
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
        }
        if(dataFilter.categoryId){
          const category = await db.CmsContentCategory
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
        sort = { status: -1, order: 1, createdAt: -1 };
      }
  
      let result = [];
      if(!paginate){
        result = await db.CmsContent.find(condition)
          .select('type title url image order status isDeletable countVisitors')
          .populate({ path: 'category', select: 'type title url image order status' })
          .sort(sort); 
      }else{
        result = await db.CmsContent.find(condition)
          .select('type title url image order status isDeletable countVisitors')
          .populate({ path: 'category', select: 'type title url image order status' })
          .sort(sort)
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.CmsContent.countDocuments(condition);
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
  cmsContentRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const content = await db.CmsContent.findById(sanitize(_id))
        .populate({ path: 'category', select: 'type title url image order status' })
        .populate({ path: 'relatedPartnerShops', select: 'code name type image status' })
        .populate({ path: 'relatedPartnerProductCategories', select: 'name status' })
        .populate({ path: 'relatedPartnerProducts', select: 'sku name status' })
        .populate({
          path: 'relatedPartnerProductCoupons',
          select: `code name image limitPerCustomer limitCustomerFrequency 
            startAt endAt status isRedeemPoints redeemPoints type discountType discount 
            createdAt updatedAt`
        })
        .populate({
          path: 'relatedPartnerShippingCoupons',
          select: `code name image limitPerCustomer limitCustomerFrequency 
            startAt endAt status isRedeemPoints redeemPoints discountType discount 
            createdAt updatedAt`,
          populate: {  path: 'shippings', select: 'name displayName status' }
        });
      if(!content){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: content
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsContentCreate : async (req, res) => {
    try {
      var error = {};
      const {
        type, categoryId, title, description, keywords,
        metaTitle, metaDescription, metaKeywords,
        url, image, gallery, youtubeVideoId, content,
        relatedPartnerShopIds, relatedPartnerProductCategoryIds, relatedPartnerProductIds,
        relatedPartnerProductCouponIds, relatedPartnerShippingCouponIds,
        order, status
      } = req.body;
      
      if(!type) error['type'] = 'type is required.';
      if(!categoryId) error['categoryId'] = 'categoryId is required.';
      if(!title) error['title'] = 'title is required.';
      if(!url) error['url'] = 'url is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);

      const category = await db.CmsContentCategory.findById(sanitize(categoryId)).select('_id');
      if(!category){
        error['categoryId'] = 'categoryId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateUrl = await db.CmsContent
        .findOne({ type: type, url: url }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        category: category,
        title: title,
        url: url,
        order: order,
        status: status,
        relatedPartnerShops: [],
        relatedPartnerProductCategories: [],
        relatedPartnerProducts: [],
        relatedPartnerProductCoupons: [],
        relatedPartnerShippingCoupons: []
      };
      if(description!==undefined) updateInput['description'] = description;
      if(keywords!==undefined) updateInput['keywords'] = keywords;
      if(metaTitle!==undefined) updateInput['metaTitle'] = metaTitle;
      if(metaDescription!==undefined) updateInput['metaDescription'] = metaDescription;
      if(metaKeywords!==undefined) updateInput['metaKeywords'] = metaKeywords;
      if(image!==undefined) updateInput['image'] = image;
      if(gallery!==undefined) updateInput['gallery'] = gallery;
      if(youtubeVideoId!==undefined) updateInput['youtubeVideoId'] = youtubeVideoId;
      if(content!==undefined) updateInput['content'] = content;
      if(relatedPartnerShopIds && relatedPartnerShopIds.length){
        const partnerShops = await db.PartnerShop
          .find({ _id: { $in: relatedPartnerShopIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerShops) updateInput['relatedPartnerShops'] = partnerShops;
      }
      if(relatedPartnerProductCategoryIds && relatedPartnerProductCategoryIds.length){
        const partnerProductCategories = await db.PartnerProductCategory
          .find({ _id: { $in: relatedPartnerProductCategoryIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerProductCategories) updateInput['relatedPartnerProductCategories'] = partnerProductCategories;
      }
      if(relatedPartnerProductIds && relatedPartnerProductIds.length){
        const partnerProducts = await db.PartnerProduct
          .find({ _id: { $in: relatedPartnerProductIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerProducts) updateInput['relatedPartnerProducts'] = partnerProducts;
      }
      if(relatedPartnerProductCouponIds && relatedPartnerProductCouponIds.length){
        const partnerProductCoupons = await db.PartnerProductCoupon
          .find({ _id: { $in: relatedPartnerProductCouponIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerProductCoupons) updateInput['relatedPartnerProductCoupons'] = partnerProductCoupons;
      }
      if(relatedPartnerShippingCouponIds && relatedPartnerShippingCouponIds.length){
        const partnerShippingCoupons = await db.PartnerShippingCoupon
          .find({ _id: { $in: relatedPartnerShippingCouponIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerShippingCoupons) updateInput['relatedPartnerShippingCoupons'] = partnerShippingCoupons;
      }
      await db.CmsContent(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsContentUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        _id, type, categoryId, title, description, keywords,
        metaTitle, metaDescription, metaKeywords,
        url, image, gallery, youtubeVideoId, content,
        relatedPartnerShopIds, relatedPartnerProductCategoryIds, relatedPartnerProductIds,
        relatedPartnerProductCouponIds, relatedPartnerShippingCouponIds,
        order, status
      } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!type) error['type'] = 'type is required.';
      if(!categoryId) error['categoryId'] = 'categoryId is required.';
      if(!title) error['title'] = 'title is required.';
      if(!url) error['url'] = 'url is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      const cmsContent = await db.CmsContent.findById(sanitize(_id));
      if(!cmsContent){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }

      const category = await db.CmsContentCategory.findById(sanitize(categoryId)).select('_id');
      if(!category){
        error['categoryId'] = 'categoryId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const duplicateUrl = await db.CmsContentCategory
        .findOne({ type: type, url: url, _id: { $ne: sanitize(_id) } }).select('_id');
      if(duplicateUrl){
        error['url'] = 'url is already in use.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        category: category,
        title: title,
        url: url,
        order: order,
        status: status,
        relatedPartnerShops: [],
        relatedPartnerProductCategories: [],
        relatedPartnerProducts: [],
        relatedPartnerProductCoupons: [],
        relatedPartnerShippingCoupons: []
      };
      if(description!==undefined) updateInput['description'] = description;
      if(keywords!==undefined) updateInput['keywords'] = keywords;
      if(metaTitle!==undefined) updateInput['metaTitle'] = metaTitle;
      if(metaDescription!==undefined) updateInput['metaDescription'] = metaDescription;
      if(metaKeywords!==undefined) updateInput['metaKeywords'] = metaKeywords;
      if(image!==undefined) updateInput['image'] = image;
      if(gallery!==undefined) updateInput['gallery'] = gallery;
      if(youtubeVideoId!==undefined) updateInput['youtubeVideoId'] = youtubeVideoId;
      if(content!==undefined) updateInput['content'] = content;
      if(categoryId){
        const category = await db.CmsContentCategory.findById(sanitize(categoryId)).select('_id');
        if(category) updateInput['category'] = category;
      }
      if(relatedPartnerShopIds && relatedPartnerShopIds.length){
        const partnerShops = await db.PartnerShop
          .find({ _id: { $in: relatedPartnerShopIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerShops) updateInput['relatedPartnerShops'] = partnerShops;
      }
      if(relatedPartnerProductCategoryIds && relatedPartnerProductCategoryIds.length){
        const partnerProductCategories = await db.PartnerProductCategory
          .find({ _id: { $in: relatedPartnerProductCategoryIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerProductCategories) updateInput['relatedPartnerProductCategories'] = partnerProductCategories;
      }
      if(relatedPartnerProductIds && relatedPartnerProductIds.length){
        const partnerProducts = await db.PartnerProduct
          .find({ _id: { $in: relatedPartnerProductIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerProducts) updateInput['relatedPartnerProducts'] = partnerProducts;
      }
      if(relatedPartnerProductCouponIds && relatedPartnerProductCouponIds.length){
        const partnerProductCoupons = await db.PartnerProductCoupon
          .find({ _id: { $in: relatedPartnerProductCouponIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerProductCoupons) updateInput['relatedPartnerProductCoupons'] = partnerProductCoupons;
      }
      if(relatedPartnerShippingCouponIds && relatedPartnerShippingCouponIds.length){
        const partnerShippingCoupons = await db.PartnerShippingCoupon
          .find({ _id: { $in: relatedPartnerShippingCouponIds.map(d => sanitize(d)) } }).select('_id');
        if(partnerShippingCoupons) updateInput['relatedPartnerShippingCoupons'] = partnerShippingCoupons;
      }
      await cmsContent.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsContentDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const content = await db.CmsContent.findOne({ _id: sanitize(_id), isDeletable: 1 });
      if(!content){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await content.remove();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  cmsBannerList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {
        type: 'C2U'
      };
      if(dataFilter){
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
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
        sort = { status: -1, order: 1, createdAt: -1 };
      }
  
      let result = [];
      if(!paginate){
        result = await db.CmsBanner.find(condition)
          .populate({
            path: 'content', select: 'type title url image order status',
            populate: { path: 'category', select: 'type title url image order status' }
          })
          .sort(sort); 
      }else{
        result = await db.CmsBanner.find(condition)
          .populate({
            path: 'content', select: 'type title url image order status',
            populate: { path: 'category', select: 'type title url image order status' }
          })
          .sort(sort)
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.CmsBanner.countDocuments(condition);
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
  cmsBannerRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const banner = await db.CmsBanner.findById(sanitize(_id))
        .populate({
          path: 'content', select: 'type title url image order status',
          populate: { path: 'category', select: 'type title url image order status' }
        });
      if(!banner){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: banner
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsBannerCreate : async (req, res) => {
    try {
      var error = {};
      const { type, contentId, image, order, status } = req.body;
      
      if(!type) error['type'] = 'type is required.';
      if(!contentId) error['contentId'] = 'contentId is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const content = await db.CmsContent.findById(sanitize(contentId)).select('_id');
      if(!content){
        error['contentId'] = 'contentId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        content: content,
        order: order,
        status: status
      };
      if(image!==undefined) updateInput['image'] = image;
      await db.CmsBanner(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsBannerUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, type, contentId, image, order, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!type) error['type'] = 'type is required.';
      if(!contentId) error['contentId'] = 'contentId is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      const banner = await db.CmsBanner.findById(sanitize(_id));
      if(!banner){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const content = await db.CmsContent.findById(sanitize(contentId)).select('_id');
      if(!content){
        error['contentId'] = 'contentId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        content: content,
        order: order,
        status: status
      };
      if(image!==undefined) updateInput['image'] = image;
      await banner.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsBannerDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const banner = await db.CmsBanner.findById(sanitize(_id));
      if(!banner){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await banner.remove();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  cmsPopupList : async (req, res) => {
    try {
      const { paginate, dataFilter } = req.body;
  
      let condition = {
        type: 'C2U'
      };
      if(dataFilter){
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
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
        sort = { status: -1, order: 1, createdAt: -1 };
      }
  
      let result = [];
      if(!paginate){
        result = await db.CmsPopup.find(condition)
          .populate({
            path: 'content', select: 'type title url image order status',
            populate: { path: 'category', select: 'type title url image order status' }
          })
          .sort(sort); 
      }else{
        result = await db.CmsPopup.find(condition)
          .populate({
            path: 'content', select: 'type title url image order status',
            populate: { path: 'category', select: 'type title url image order status' }
          })
          .sort(sort)
          .skip((paginate.page - 1) * paginate.pp)
          .limit(paginate.pp);
        paginate.total = await db.CmsPopup.countDocuments(condition);
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
  cmsPopupRead : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.query;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const popup = await db.CmsPopup.findById(sanitize(_id))
        .populate({
          path: 'content', select: 'type title url image order status',
          populate: { path: 'category', select: 'type title url image order status' }
        });
      if(!popup){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      return resProcess['200'](res, {
        result: popup
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsPopupCreate : async (req, res) => {
    try {
      var error = {};
      const { type, contentId, image, order, status } = req.body;
      
      if(!type) error['type'] = 'type is required.';
      if(!contentId) error['contentId'] = 'contentId is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const content = await db.CmsContent.findById(sanitize(contentId)).select('_id');
      if(!content){
        error['contentId'] = 'contentId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        content: content,
        order: order,
        status: status
      };
      if(image!==undefined) updateInput['image'] = image;
      await db.CmsPopup(updateInput).save();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsPopupUpdate : async (req, res) => {
    try {
      var error = {};
      const { _id, type, contentId, image, order, status } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(!type) error['type'] = 'type is required.';
      if(!contentId) error['contentId'] = 'contentId is required.';
      if(!order) error['order'] = 'order is required.';
      if(!status && status!==0) error['status'] = 'status is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      const popup = await db.CmsPopup.findById(sanitize(_id));
      if(!popup){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      const content = await db.CmsContent.findById(sanitize(contentId)).select('_id');
      if(!content){
        error['contentId'] = 'contentId is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      let updateInput = {
        type: type,
        content: content,
        order: order,
        status: status
      };
      if(image!==undefined) updateInput['image'] = image;
      await popup.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  cmsPopupDelete : async (req, res) => {
    try {
      var error = {};
      const { _id } = req.body;
      
      if(!_id) error['_id'] = '_id is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
  
      const popup = await db.CmsPopup.findById(sanitize(_id));
      if(!popup){
        error['_id'] = '_id is invalid.';
        return resProcess['checkError'](res, error);
      }
  
      await popup.remove();
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  cmsSettingUpdate : async (req, res) => {
    try {
      var error = {};
      const {
        type, title, description, keywords, url, favicon, image,
        socialFb, socialIg, socialLn, socialYt
      } = req.body;
      
      if(!type) error['type'] = 'type is required.';
      if(!title) error['title'] = 'title is required.';
      if(!url) error['url'] = 'url is required.';
      if(Object.keys(error).length) return resProcess['checkError'](res, error);
      
      let setting = await db.CmsSetting.findOne({ type: type? type: 'C2U' });
      if(!setting){
        setting = await db.CmsSetting({ type: type? type: 'C2U' }).save();
      }
  
      let updateInput = {
        title: title,
        url: url
      };
      if(description!==undefined) updateInput['description'] = description;
      if(keywords!==undefined) updateInput['keywords'] = keywords;
      if(favicon!==undefined) updateInput['favicon'] = favicon;
      if(image!==undefined) updateInput['image'] = image;
      if(socialFb!==undefined) updateInput['socialFb'] = socialFb;
      if(socialIg!==undefined) updateInput['socialIg'] = socialIg;
      if(socialLn!==undefined) updateInput['socialLn'] = socialLn;
      if(socialYt!==undefined) updateInput['socialYt'] = socialYt;
      await setting.updateOne(updateInput, []);
  
      return resProcess['200'](res);
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

};