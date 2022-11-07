import { UserRoleModel, FileModel, AddressModel } from '.';
import { unescape } from 'html-escaper';

export class UserModel {
  constructor(data) {
    this._id = data._id? data._id: null;
    
    this.role = new UserRoleModel(data.role? data.role: {});
    
    this.firstname = data.firstname? unescape(data.firstname): null;
    this.lastname = data.lastname? unescape(data.lastname): null;
    this.username = data.username? data.username: null;
    this.email = data.email? data.email: null;
    this.avatar = new FileModel(
      data.avatar? data.avatar: { path: '/assets/img/default/avatar.jpg' }
    );

    this.address = new AddressModel(data.address? data.address: {});

    this.fcmToken = data.fcmToken? data.fcmToken: null;
    
    this.status = data.status? data.status: 0;
  }

  isValid() { return this._id? true: false; }

  displayName() {
    if(this.firstname || this.lastname) return this.firstname+' '+this.lastname;
    else if(this.username) return this.username;
    else return '';
  }
  displayRole() {
    return this.role.displayName();
  }
  displayStatus() {
    if(this.isValid()){
      if(this.status === 1) return (<span className="ss-tag bg-success">เปิดใช้งาน</span>);
      else return (<span className="ss-tag bg-warning">ปิดใช้งาน</span>);
    }else{
      return (<span className="ss-tag bg-warning">ปิดใช้งาน</span>);
    }
  }

  isSignedIn() { return this._id && this.status === 1? true: false; }

  isSuperAdmin() { return this.role.isValid() && this.role.level >= 99? true: false; }
  isAdmin() { return this.role.isValid() && this.role.level >= 98? true: false; }
  isUser() { return this.role.isValid() && this.role.level === 1? true: false; }
  
  isInPartnerShops(shopId) { return this.partnerShopIds.indexOf(shopId) > -1; }

  path() {
    if(this.isSignedIn()){
      if(this.isAdmin()) return '/admin';
      else if(this.isPartner()) return '/partner';
      else if(this.isSalesManager()) return '/sales-manager';
      else return '';
    }else{
      return '';
    }
  }
}
