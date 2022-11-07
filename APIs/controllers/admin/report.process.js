const db = require('../../models');
const sanitize = require('mongo-sanitize');
const { resProcess, formater } = require('../../helpers');


module.exports = {

  reportPartnerCouponTotal : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['shop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.partnerId){
          const partner = await db.User.findById(sanitize(dataFilter.partnerId)).select('_id');
          if(partner) condition['partner'] = partner._id;
          else{
            error['partnerId'] = 'partnerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.customerId){
          const customer = await db.Customer.findById(sanitize(dataFilter.customerId)).select('_id');
          if(customer) condition['customer'] = customer._id;
          else{
            error['customerId'] = 'customerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }

        if(dataFilter.productCouponId){
          const productCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.productCouponId), type: { $in: [1, 2] } }).select('_id');
          if(productCoupon) condition['coupon'] = productCoupon._id;
          else{
            error['productCouponId'] = 'productCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.shippingCouponId){
          const shippingCoupon = await db.PartnerShippingCoupon
            .findById(sanitize(dataFilter.shippingCouponId)).select('_id');
          if(shippingCoupon) condition['shippingCoupon'] = shippingCoupon._id;
          else{
            error['shippingCouponId'] = 'shippingCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.cashCouponId){
          const cashCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.cashCouponId), type: 3 }).select('_id');
          if(cashCoupon) condition['cashCoupon'] = cashCoupon._id;
          else{
            error['cashCouponId'] = 'cashCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
      }
      
      const usedToday = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            customer: '$customer',
            coupon: '$coupon',
            shippingCoupon: '$shippingCoupon',
            cashCoupon: '$cashCoupon',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM-DD') }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);
      const usedThisMonth = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            customer: '$customer',
            coupon: '$coupon',
            shippingCoupon: '$shippingCoupon',
            cashCoupon: '$cashCoupon',
            date: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM') }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);
      const usedThisYear = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            customer: '$customer',
            coupon: '$coupon',
            shippingCoupon: '$shippingCoupon',
            cashCoupon: '$cashCoupon',
            date: { $dateToString: { format: '%Y', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY') }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);
      const usedTotal = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            customer: '$customer',
            coupon: '$coupon',
            shippingCoupon: '$shippingCoupon',
            cashCoupon: '$cashCoupon',
          }
        }, {
          $match: { ...condition }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);

      const result = {
        usedToday: usedToday && usedToday.length? usedToday[0].total: 0,
        usedThisMonth: usedThisMonth && usedThisMonth.length? usedThisMonth[0].total: 0,
        usedThisYear: usedThisYear && usedThisYear.length? usedThisYear[0].total: 0,
        usedTotal: usedTotal && usedTotal.length? usedTotal[0].total: 0
      };

      return resProcess['200'](res, {
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  reportPartnerCouponUsage : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = {};
      if(dataFilter){
        if(!dataFilter.year){
          error['year'] = 'year is required.';
          return resProcess['checkError'](res, error);
        }

        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['shop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.partnerId){
          const partner = await db.User.findById(sanitize(dataFilter.partnerId)).select('_id');
          if(partner) condition['partner'] = partner._id;
          else{
            error['partnerId'] = 'partnerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.customerId){
          const customer = await db.Customer.findById(sanitize(dataFilter.customerId)).select('_id');
          if(customer) condition['customer'] = customer._id;
          else{
            error['customerId'] = 'customerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        
        if(dataFilter.productCouponId){
          const productCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.productCouponId), type: { $in: [1, 2] } }).select('_id');
          if(productCoupon) condition['coupon'] = productCoupon._id;
          else{
            error['productCouponId'] = 'productCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.shippingCouponId){
          const shippingCoupon = await db.PartnerShippingCoupon
            .findById(sanitize(dataFilter.shippingCouponId)).select('_id');
          if(shippingCoupon) condition['shippingCoupon'] = shippingCoupon._id;
          else{
            error['shippingCouponId'] = 'shippingCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.cashCouponId){
          const cashCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.cashCouponId), type: 3 }).select('_id');
          if(cashCoupon) condition['cashCoupon'] = cashCoupon._id;
          else{
            error['cashCouponId'] = 'cashCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
      }else{
        error['year'] = 'year is required.';
        return resProcess['checkError'](res, error);
      }

      const result = await db.CustomerOrder.aggregate([
        { $match: condition },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            date: { $first: '$createdAt' },
            total: { $sum: 1 }
          }
        }, {
          $project: {
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'Asia/Bangkok' } },
            year: { $year: { date: '$date', timezone: 'Asia/Bangkok' } },
            month: { $month: { date: '$date', timezone: 'Asia/Bangkok' } },
            total: '$total'
          }
        },
        { $match: { year: dataFilter.year } },
      ]);

      return resProcess['200'](res, {
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  reportPartnerCouponOrderTotal : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = { paymentStatus: { $gte: 2 } };
      if(dataFilter){
        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['shop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.partnerId){
          const partner = await db.User.findById(sanitize(dataFilter.partnerId)).select('_id');
          if(partner) condition['partner'] = partner._id;
          else{
            error['partnerId'] = 'partnerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.customerId){
          const customer = await db.Customer.findById(sanitize(dataFilter.customerId)).select('_id');
          if(customer) condition['customer'] = customer._id;
          else{
            error['customerId'] = 'customerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        
        if(dataFilter.productCouponId){
          const productCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.productCouponId), type: { $in: [1, 2] } }).select('_id');
          if(productCoupon) condition['coupon'] = productCoupon._id;
          else{
            error['productCouponId'] = 'productCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.shippingCouponId){
          const shippingCoupon = await db.PartnerShippingCoupon
            .findById(sanitize(dataFilter.shippingCouponId)).select('_id');
          if(shippingCoupon) condition['shippingCoupon'] = shippingCoupon._id;
          else{
            error['shippingCouponId'] = 'shippingCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.cashCouponId){
          const cashCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.cashCouponId), type: 3 }).select('_id');
          if(cashCoupon) condition['cashCoupon'] = cashCoupon._id;
          else{
            error['cashCouponId'] = 'cashCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
      }

      const salesToday = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            coupon: '$coupon',
            shippingCoupon: '$shippingCoupon',
            cashCoupon: '$cashCoupon',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            allTotal: { $sum: ['$grandTotal', '$couponDiscount', '$shippingDiscount', '$cashDiscount'] },
            grandTotal: '$grandTotal',
            productDiscountTotal: '$couponDiscount',
            shippingDiscountTotal: '$shippingDiscount',
            cashDiscountTotal: '$cashDiscount'
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM-DD') }
        }, {
          $group: {
            _id: 1,
            allTotal: { $sum: '$allTotal' },
            grandTotal: { $sum: '$grandTotal' },
            productDiscountTotal: { $sum: '$productDiscountTotal' },
            shippingDiscountTotal: { $sum: '$shippingDiscountTotal' },
            cashDiscountTotal: { $sum: '$cashDiscountTotal' }
          }
        }
      ]);

      const salesThisMonth = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            coupon: '$coupon',
            shippingCoupon: '$shippingCoupon',
            cashCoupon: '$cashCoupon',
            date: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            allTotal: { $sum: ['$grandTotal', '$couponDiscount', '$shippingDiscount', '$cashDiscount'] },
            grandTotal: '$grandTotal',
            productDiscountTotal: '$couponDiscount',
            shippingDiscountTotal: '$shippingDiscount',
            cashDiscountTotal: '$cashDiscount'
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM') }
        }, {
          $group: {
            _id: 1,
            allTotal: { $sum: '$allTotal' },
            grandTotal: { $sum: '$grandTotal' },
            productDiscountTotal: { $sum: '$productDiscountTotal' },
            shippingDiscountTotal: { $sum: '$shippingDiscountTotal' },
            cashDiscountTotal: { $sum: '$cashDiscountTotal' }
          }
        }
      ]);

      const salesThisYear = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            coupon: '$coupon',
            shippingCoupon: '$shippingCoupon',
            cashCoupon: '$cashCoupon',
            date: { $dateToString: { format: '%Y', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            allTotal: { $sum: ['$grandTotal', '$couponDiscount', '$shippingDiscount', '$cashDiscount'] },
            grandTotal: '$grandTotal',
            productDiscountTotal: '$couponDiscount',
            shippingDiscountTotal: '$shippingDiscount',
            cashDiscountTotal: '$cashDiscount'
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY') }
        }, {
          $group: {
            _id: 1,
            allTotal: { $sum: '$allTotal' },
            grandTotal: { $sum: '$grandTotal' },
            productDiscountTotal: { $sum: '$productDiscountTotal' },
            shippingDiscountTotal: { $sum: '$shippingDiscountTotal' },
            cashDiscountTotal: { $sum: '$cashDiscountTotal' }
          }
        }
      ]);

      return resProcess['200'](res, {
        result: {
          salesToday: salesToday.length
            ? salesToday[0]: {
              allTotal: 0,
              grandTotal: 0,
              productDiscountTotal: 0,
              shippingDiscountTotal: 0,
              cashDiscountTotal: 0
            },
          salesThisMonth: salesThisMonth.length
            ? salesThisMonth[0]: {
              allTotal: 0,
              grandTotal: 0,
              productDiscountTotal: 0,
              shippingDiscountTotal: 0,
              cashDiscountTotal: 0
            },
          salesThisYear: salesThisYear.length
            ? salesThisYear[0]: {
              allTotal: 0,
              grandTotal: 0,
              productDiscountTotal: 0,
              shippingDiscountTotal: 0,
              cashDiscountTotal: 0
            }
        }
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  reportPartnerCouponOrderUsage : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = { paymentStatus: { $gte: 2 } };
      if(dataFilter){
        if(!dataFilter.year){
          error['year'] = 'year is required.';
          return resProcess['checkError'](res, error);
        }

        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['shop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.partnerId){
          const partner = await db.User.findById(sanitize(dataFilter.partnerId)).select('_id');
          if(partner) condition['partner'] = partner._id;
          else{
            error['partnerId'] = 'partnerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.customerId){
          const customer = await db.Customer.findById(sanitize(dataFilter.customerId)).select('_id');
          if(customer) condition['customer'] = customer._id;
          else{
            error['customerId'] = 'customerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        
        if(dataFilter.productCouponId){
          const productCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.productCouponId), type: { $in: [1, 2] } }).select('_id');
          if(productCoupon) condition['coupon'] = productCoupon._id;
          else{
            error['productCouponId'] = 'productCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.shippingCouponId){
          const shippingCoupon = await db.PartnerShippingCoupon
            .findById(sanitize(dataFilter.shippingCouponId)).select('_id');
          if(shippingCoupon) condition['shippingCoupon'] = shippingCoupon._id;
          else{
            error['shippingCouponId'] = 'shippingCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.cashCouponId){
          const cashCoupon = await db.PartnerProductCoupon
            .findOne({ _id: sanitize(dataFilter.cashCouponId), type: 3 }).select('_id');
          if(cashCoupon) condition['cashCoupon'] = cashCoupon._id;
          else{
            error['cashCouponId'] = 'cashCouponId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
      }else{
        error['year'] = 'year is required.';
        return resProcess['checkError'](res, error);
      }

      const result = await db.CustomerOrder.aggregate([
        { $match: condition },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            date: { $first: '$createdAt' },
            allTotal: { $sum: { $sum: ['$grandTotal', '$couponDiscount', '$shippingDiscount', '$cashDiscount'] } },
            grandTotal: { $sum: '$grandTotal' },
            productDiscountTotal: { $sum: '$couponDiscount' },
            shippingDiscountTotal: { $sum: '$shippingDiscount' },
            cashDiscountTotal: { $sum: '$cashDiscount' }
          }
        }, {
          $project: {
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'Asia/Bangkok' } },
            year: { $year: { date: '$date', timezone: 'Asia/Bangkok' } },
            month: { $month: { date: '$date', timezone: 'Asia/Bangkok' } },
            allTotal: '$allTotal',
            grandTotal: '$grandTotal',
            productDiscountTotal: '$productDiscountTotal',
            shippingDiscountTotal: '$shippingDiscountTotal',
            cashDiscountTotal: '$cashDiscountTotal'
          }
        },
        { $match: { year: dataFilter.year } },
      ]);

      return resProcess['200'](res, {
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

  reportCustomerTotal : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = {
        type: 'C2U',
        isGuest: 0
      };
      if(dataFilter){
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
        }
        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['partnerShop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(!dataFilter.partnerShopId && dataFilter.partnerId){
          const partnerShops = await db.PartnerShop.find({ partner: sanitize(dataFilter.partnerId) }).select('_id');
          condition['partnerShop'] = { $in: partnerShops.map(d => d._id) };
        }
      }
      
      const newToday = await db.Customer.aggregate([
        {
          $project: {
            _id: '$_id',
            type: '$type',
            partnerShop: '$partnerShop',
            salesManager: '$salesManager',
            isGuest: '$isGuest',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM-DD') }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);
      const newThisMonth = await db.Customer.aggregate([
        {
          $project: {
            _id: '$_id',
            type: '$type',
            partnerShop: '$partnerShop',
            salesManager: '$salesManager',
            isGuest: '$isGuest',
            date: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM') }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);
      const newThisYear = await db.Customer.aggregate([
        {
          $project: {
            _id: '$_id',
            type: '$type',
            partnerShop: '$partnerShop',
            salesManager: '$salesManager',
            isGuest: '$isGuest',
            date: { $dateToString: { format: '%Y', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY') }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);
      const total = await db.Customer.aggregate([
        {
          $project: {
            _id: '$_id',
            type: '$type',
            partnerShop: '$partnerShop',
            salesManager: '$salesManager',
            isGuest: '$isGuest',
          }
        }, {
          $match: { ...condition }
        }, {
          $group: {
            _id: 1,
            total: { $sum: 1 }
          }
        }
      ]);

      const result = {
        newToday: newToday && newToday.length? newToday[0].total: 0,
        newThisMonth: newThisMonth && newThisMonth.length? newThisMonth[0].total: 0,
        newThisYear: newThisYear && newThisYear.length? newThisYear[0].total: 0,
        total: total && total.length? total[0].total: 0
      };

      return resProcess['200'](res, {
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  reportCustomerSignup : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = {
        type: 'C2U',
        isGuest: 0
      };
      if(dataFilter){
        if(!dataFilter.year){
          error['year'] = 'year is required.';
          return resProcess['checkError'](res, error);
        }
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
        }
        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['partnerShop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(!dataFilter.partnerShopId && dataFilter.partnerId){
          const partnerShops = await db.PartnerShop.find({ partner: sanitize(dataFilter.partnerId) }).select('_id');
          condition['partnerShop'] = { $in: partnerShops.map(d => d._id) };
        }
      }else{
        error['year'] = 'year is required.';
        return resProcess['checkError'](res, error);
      }

      const result = await db.Customer.aggregate([
        { $match: condition },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            date: { $first: '$createdAt' },
            total: { $sum: 1 }
          }
        }, {
          $project: {
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'Asia/Bangkok' } },
            year: { $year: { date: '$date', timezone: 'Asia/Bangkok' } },
            month: { $month: { date: '$date', timezone: 'Asia/Bangkok' } },
            total: '$total'
          }
        },
        { $match: { year: dataFilter.year } },
      ]);

      return resProcess['200'](res, {
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  reportCustomerOrderTotal : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = {
        type: 'C2U',
        paymentStatus: { $gte: 2 }
      };
      if(dataFilter){
        if(dataFilter.type){
          condition['type'] = dataFilter.type;
        }
        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['shop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.partnerId){
          const partner = await db.User.findById(sanitize(dataFilter.partnerId)).select('_id');
          if(partner) condition['partner'] = partner._id;
          else{
            error['partnerId'] = 'partnerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
      }

      let newCustomersToday = await db.Customer.aggregate([
        {
          $project: {
            _id: '$_id',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, { $match: { date: formater.date('YYYY-MM-DD') } }
      ]);
      newCustomersToday = newCustomersToday.map(d => d._id);
      const salesToday = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            type: '$type',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            grandTotal: '$grandTotal',
            grandTotalNew: { $cond: [{ $in: ['$customer', newCustomersToday] }, '$grandTotal', 0] },
            grandTotalOld: { $cond: [{ $not: { $in: ['$customer', newCustomersToday] } }, '$grandTotal', 0] }
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM-DD') }
        }, {
          $group: {
            _id: 1,
            grandTotalNew: { $sum: '$grandTotalNew' },
            grandTotalOld: { $sum: '$grandTotalOld' },
            grandTotal: { $sum: '$grandTotal' }
          }
        }
      ]);
      
      let newCustomersThisMonth = await db.Customer.aggregate([
        {
          $project: {
            _id: '$_id',
            date: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, { $match: { date: formater.date('YYYY-MM') } }
      ]);
      newCustomersThisMonth = newCustomersThisMonth.map(d => d._id);
      const salesThisMonth = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            type: '$type',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            date: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            grandTotal: '$grandTotal',
            grandTotalNew: { $cond: [{ $in: ['$customer', newCustomersThisMonth] }, '$grandTotal', 0] },
            grandTotalOld: { $cond: [{ $not: { $in: ['$customer', newCustomersThisMonth] } }, '$grandTotal', 0] }
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM') }
        }, {
          $group: {
            _id: 1,
            grandTotalNew: { $sum: '$grandTotalNew' },
            grandTotalOld: { $sum: '$grandTotalOld' },
            grandTotal: { $sum: '$grandTotal' }
          }
        }
      ]);
      
      let newCustomersThisYear = await db.Customer.aggregate([
        {
          $project: {
            _id: '$_id',
            date: { $dateToString: { format: '%Y', date: '$createdAt', timezone: 'Asia/Bangkok' } },
          }
        }, { $match: { date: formater.date('YYYY') } }
      ]);
      newCustomersThisYear = newCustomersThisYear.map(d => d._id);
      const salesThisYear = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            type: '$type',
            shop: '$shop',
            partner: '$partner',
            salesManager: '$salesManager',
            date: { $dateToString: { format: '%Y', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            grandTotal: '$grandTotal',
            grandTotalNew: { $cond: [{ $in: ['$customer', newCustomersThisYear] }, '$grandTotal', 0] },
            grandTotalOld: { $cond: [{ $not: { $in: ['$customer', newCustomersThisYear] } }, '$grandTotal', 0] }
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY') }
        }, {
          $group: {
            _id: 1,
            grandTotalNew: { $sum: '$grandTotalNew' },
            grandTotalOld: { $sum: '$grandTotalOld' },
            grandTotal: { $sum: '$grandTotal' }
          }
        }
      ]);

      return resProcess['200'](res, {
        result: {
          salesToday: salesToday.length
            ? salesToday[0]: { grandTotalNew: 0, grandTotalOld: 0, grandTotal: 0 },
          salesThisMonth: salesThisMonth.length
            ? salesThisMonth[0]: { grandTotalNew: 0, grandTotalOld: 0, grandTotal: 0 },
          salesThisYear: salesThisYear.length
            ? salesThisYear[0]: { grandTotalNew: 0, grandTotalOld: 0, grandTotal: 0 }
        }
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  reportCustomerOrders : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = {
        type: 'C2U',
        paymentStatus: { $gte: 2 }
      };
      if(dataFilter){
        if(!dataFilter.year){
          error['year'] = 'year is required.';
          return resProcess['checkError'](res, error);
        }
        if(dataFilter.partnerShopId){
          const partnerShop = await db.PartnerShop.findById(sanitize(dataFilter.partnerShopId)).select('_id');
          if(partnerShop) condition['shop'] = partnerShop._id;
          else{
            error['partnerShopId'] = 'partnerShopId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.salesManagerId){
          const salesManager = await db.User.findById(sanitize(dataFilter.salesManagerId)).select('_id');
          if(salesManager) condition['salesManager'] = salesManager._id;
          else{
            error['salesManagerId'] = 'salesManagerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.partnerId){
          const partner = await db.User.findById(sanitize(dataFilter.partnerId)).select('_id');
          if(partner) condition['partner'] = partner._id;
          else{
            error['partnerId'] = 'partnerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
        if(dataFilter.customerId){
          const customer = await db.Customer.findById(sanitize(dataFilter.customerId)).select('_id');
          if(customer) condition['customer'] = customer._id;
          else{
            error['customerId'] = 'customerId is invalid.';
            return resProcess['checkError'](res, error);
          }
        }
      }else{
        error['year'] = 'year is required.';
        return resProcess['checkError'](res, error);
      }

      const result = await db.CustomerOrder.aggregate([
        { $match: condition },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            date: { $first: '$createdAt' },
            total: { $sum: '$grandTotal' }
          }
        }, {
          $project: {
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'Asia/Bangkok' } },
            year: { $year: { date: '$date', timezone: 'Asia/Bangkok' } },
            month: { $month: { date: '$date', timezone: 'Asia/Bangkok' } },
            total: '$total'
          }
        },
        { $match: { year: dataFilter.year } },
      ]);

      return resProcess['200'](res, {
        result: result
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },
  
  reportCustomerPersonalOrderTotal : async (req, res) => {
    try {
      var error = {};
      const { dataFilter } = req.body;

      let condition = {
        paymentStatus: { $gte: 2 }
      };
      if(dataFilter){
        if(dataFilter.customerId){
          const customer = await db.Customer.findById(sanitize(dataFilter.customerId)).select('_id');
          if(customer) condition['customer'] = customer._id;
          else{
            error['customerId'] = 'customerId is required.';
            return resProcess['checkError'](res, error);
          }
        }else{
          error['customerId'] = 'customerId is required.';
          return resProcess['checkError'](res, error);
        }
      }else{
        error['customerId'] = 'customerId is required.';
        return resProcess['checkError'](res, error);
      }


      const salesToday = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            customer: '$customer',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            grandTotal: '$grandTotal'
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM-DD') }
        }, {
          $group: {
            _id: 1,
            grandTotal: { $sum: '$grandTotal' }
          }
        }
      ]);
      
      const salesThisMonth = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            customer: '$customer',
            date: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            grandTotal: '$grandTotal'
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY-MM') }
        }, {
          $group: {
            _id: 1,
            grandTotal: { $sum: '$grandTotal' }
          }
        }
      ]);
      
      const salesThisYear = await db.CustomerOrder.aggregate([
        {
          $project: {
            _id: '$_id',
            customer: '$customer',
            date: { $dateToString: { format: '%Y', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            paymentStatus: '$paymentStatus',
            grandTotal: '$grandTotal'
          }
        }, {
          $match: { ...condition, date: formater.date('YYYY') }
        }, {
          $group: {
            _id: 1,
            grandTotal: { $sum: '$grandTotal' }
          }
        }
      ]);

      const salesTotal = await db.CustomerOrder.aggregate([
        {
          $match: condition
        }, {
          $group: {
            _id: 1,
            grandTotal: { $sum: '$grandTotal' }
          }
        }
      ]);


      return resProcess['200'](res, {
        result: {
          salesToday: salesToday.length? salesToday[0]['grandTotal']: 0,
          salesThisMonth: salesThisMonth.length? salesThisMonth[0]['grandTotal']: 0,
          salesThisYear: salesThisYear.length? salesThisYear[0]['grandTotal']: 0,
          salesTotal: salesTotal.length? salesTotal[0]['grandTotal']: 0
        }
      });
    } catch(err) {
      return resProcess['500'](res, err);
    }
  },

};