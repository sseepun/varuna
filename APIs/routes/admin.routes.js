module.exports = function(app) {
  var router = require('express').Router();
  const { authJwt } = require('../middlewares');
  const AdminController = require('../controllers/admin');

  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });


  // START: App
  router.patch(
    '/settings',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.settingsUpdate
  );
  
  router.post(
    '/users',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userList
  );
  router.get(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userRead
  );
  router.post(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userCreate
  );
  router.patch(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userUpdate
  );
  router.delete(
    '/user',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userDelete
  );
  
  router.get(
    '/user-permission',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.userPermissionRead
  );
  router.patch(
    '/user-permission',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.userPermissionUpdate
  );
  
  router.post(
    '/payment-methods',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.paymentMethodList
  );
  router.patch(
    '/payment-method',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.paymentMethodUpdate
  );
  
  router.post(
    '/send-email-test',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.sendEmailTest
  );
  // END: App


  // START: Partner
  router.post(
    '/partner-product-categories',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductCategoryList
  );
  router.get(
    '/partner-product-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductCategoryRead
  );
  router.post(
    '/partner-product-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductCategoryCreate
  );
  router.patch(
    '/partner-product-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductCategoryUpdate
  );
  router.delete(
    '/partner-product-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductCategoryDelete
  );
  
  router.post(
    '/partner-products',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductList
  );
  router.get(
    '/partner-product',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductRead
  );
  router.post(
    '/partner-product',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductCreate
  );
  router.patch(
    '/partner-product',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductUpdate
  );
  router.delete(
    '/partner-product',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerProductDelete
  );
  
  router.post(
    '/partner-shops',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerShopList
  );
  router.get(
    '/partner-shop',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerShopRead
  );
  router.post(
    '/partner-shop',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerShopCreate
  );
  router.patch(
    '/partner-shop',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerShopUpdate
  );
  router.delete(
    '/partner-shop',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.partnerShopDelete
  );

  router.post(
    '/partner-shop-stocks',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerShopStockList
  );
  router.patch(
    '/partner-shop-stock',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.partnerShopStockUpdate
  );
  // END: Partner


  // START: Customer
  router.post(
    '/customer-tiers',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerTierList
  );
  router.get(
    '/customer-tier',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerTierRead
  );
  router.post(
    '/customer-tier',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerTierCreate
  );
  router.patch(
    '/customer-tier',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerTierUpdate
  );
  router.delete(
    '/customer-tier',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerTierDelete
  );
  
  router.post(
    '/customers',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerList
  );
  router.get(
    '/customer',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerRead
  );
  router.post(
    '/customer',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerCreate
  );
  router.patch(
    '/customer',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerUpdate
  );
  router.delete(
    '/customer',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.customerDelete
  );

  router.post(
    '/customer-push-notis',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerPushNotiList
  );
  router.get(
    '/customer-push-noti',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerPushNotiRead
  );
  router.post(
    '/customer-push-noti',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerPushNotiCreate
  );
  router.patch(
    '/customer-push-noti',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerPushNotiUpdate
  );
  router.delete(
    '/customer-push-noti',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerPushNotiDelete
  );

  router.post(
    '/customer-chatrooms',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerChatroomList
  );
  router.post(
    '/customer-chatroom',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerChatroomCreate
  );
  router.post(
    '/customer-message',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerMessageCreate
  );
  
  router.patch(
    '/customer-cart',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerCartUpdate
  );
  
  router.post(
    '/customer-shipping-addresses',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingAddressList
  );
  router.post(
    '/customer-shipping-address',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingAddressCreate
  );
  router.patch(
    '/customer-shipping-address',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingAddressUpdate
  );
  router.delete(
    '/customer-shipping-address',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingAddressDelete
  );
  router.patch(
    '/customer-shipping-address-set-selected',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingAddressSetSelected
  );
  router.patch(
    '/customer-shipping-address-set-primary',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingAddressSetPrimary
  );
  
  router.post(
    '/customer-billing-addresses',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerBillingAddressList
  );
  router.post(
    '/customer-billing-address',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerBillingAddressCreate
  );
  router.patch(
    '/customer-billing-address',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerBillingAddressUpdate
  );
  router.delete(
    '/customer-billing-address',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerBillingAddressDelete
  );
  router.patch(
    '/customer-billing-address-set-selected',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerBillingAddressSetSelected
  );
  router.patch(
    '/customer-billing-address-set-primary',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerBillingAddressSetPrimary
  );
  
  router.post(
    '/customer-product-coupons',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerProductCouponList
  );
  router.post(
    '/customer-product-coupon',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerProductCouponCreate
  );
  router.delete(
    '/customer-product-coupon',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerProductCouponDelete
  );
  
  router.post(
    '/customer-shipping-coupons',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingCouponList
  );
  router.post(
    '/customer-shipping-coupon',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingCouponCreate
  );
  router.delete(
    '/customer-shipping-coupon',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerShippingCouponDelete
  );
  
  router.get(
    '/customer-total-points',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerTotalPoints
  );
  router.post(
    '/customer-points',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerPointList
  );
  
  router.post(
    '/customer-orders',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerOrderList
  );
  router.get(
    '/customer-order',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerOrderRead
  );
  router.patch(
    '/customer-order',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerOrderUpdate
  );

  router.post(
    '/customer-order-shops',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerOrderShopList
  );
  router.post(
    '/customer-frequently-bought-products',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerFrequentlyBoughtProductList
  );
  router.post(
    '/customer-never-bought-products',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.customerNeverBoughtProductList
  );
  
  router.post(
    '/customer-payment-2c2p',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.customerPayment2C2P
  );

  router.post(
    '/customer-checkout-test',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.customerCheckoutTest
  );
  // END: Customer


  // START: Seller
  router.post(
    '/seller-shop-types',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopTypeList
  );
  router.get(
    '/seller-shop-type',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopTypeRead
  );
  router.post(
    '/seller-shop-type',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopTypeCreate
  );
  router.patch(
    '/seller-shop-type',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopTypeUpdate
  );
  router.delete(
    '/seller-shop-type',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopTypeDelete
  );

  router.post(
    '/seller-shops',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopList
  );
  router.get(
    '/seller-shop',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopRead
  );
  router.post(
    '/seller-shop',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopCreate
  );
  router.patch(
    '/seller-shop',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopUpdate
  );
  router.delete(
    '/seller-shop',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopDelete
  );

  router.post(
    '/seller-shop-ratings',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopRatingList
  );
  router.get(
    '/seller-shop-rating',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopRatingRead
  );
  router.post(
    '/seller-shop-rating',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopRatingCreate
  );
  router.patch(
    '/seller-shop-rating',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopRatingUpdate
  );
  router.delete(
    '/seller-shop-rating',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.sellerShopRatingDelete
  );
  router.get(
    '/report-seller-shop-rating',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportSellerShopRating
  );
  // END: Seller


  // START: Report
  router.post(
    '/report-partner-coupon-total',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportPartnerCouponTotal
  );
  router.post(
    '/report-partner-coupon-usage',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportPartnerCouponUsage
  );

  router.post(
    '/report-partner-coupon-order-total',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportPartnerCouponOrderTotal
  );
  router.post(
    '/report-partner-coupon-order-usage',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportPartnerCouponOrderUsage
  );

  router.post(
    '/report-customer-total',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportCustomerTotal
  );
  router.post(
    '/report-customer-signup',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportCustomerSignup
  );
  
  router.post(
    '/report-customer-order-total',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportCustomerOrderTotal
  );
  router.post(
    '/report-customer-orders',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportCustomerOrders
  );
  
  router.post(
    '/report-customer-personal-order-total',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.reportCustomerPersonalOrderTotal
  );
  // END: Report


  // START: CMS
  router.post(
    '/cms-content-categories',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentCategoryList
  );
  router.get(
    '/cms-content-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentCategoryRead
  );
  router.post(
    '/cms-content-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentCategoryCreate
  );
  router.patch(
    '/cms-content-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentCategoryUpdate
  );
  router.delete(
    '/cms-content-category',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentCategoryDelete
  );
  
  router.post(
    '/cms-contents',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentList
  );
  router.get(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentRead
  );
  router.post(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentCreate
  );
  router.patch(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentUpdate
  );
  router.delete(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentDelete
  );
  
  router.post(
    '/cms-contents',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentList
  );
  router.get(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentRead
  );
  router.post(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentCreate
  );
  router.patch(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentUpdate
  );
  router.delete(
    '/cms-content',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsContentDelete
  );
  
  router.post(
    '/cms-banners',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsBannerList
  );
  router.get(
    '/cms-banner',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsBannerRead
  );
  router.post(
    '/cms-banner',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsBannerCreate
  );
  router.patch(
    '/cms-banner',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsBannerUpdate
  );
  router.delete(
    '/cms-banner',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsBannerDelete
  );
  
  router.post(
    '/cms-popups',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsPopupList
  );
  router.get(
    '/cms-popup',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsPopupRead
  );
  router.post(
    '/cms-popup',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsPopupCreate
  );
  router.patch(
    '/cms-popup',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsPopupUpdate
  );
  router.delete(
    '/cms-popup',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.cmsPopupDelete
  );
  
  router.patch(
    '/cms-setting',
    [ authJwt.verifyToken, authJwt.isSuperAdmin ],
    AdminController.cmsSettingUpdate
  );
  // END: CMS


  // START: Export
  router.post(
    '/export-partner-coupons',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.exportPartnerCouponList
  );

  router.post(
    '/export-customer-orders',
    [ authJwt.verifyToken, authJwt.isAdmin ],
    AdminController.exportCustomerOrderList
  );
  // END: Export

  
  app.use('/admin', router);
};