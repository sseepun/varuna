import { unescape } from 'html-escaper';

/*
  level :
    1  = User
    98 = Admin
    99 = Super Admin
*/

export class UserRoleModel {
  constructor(data) {
    this._id = data._id? data._id: null;
    this.name = data.name? unescape(data.name): null;
    this.level = data.level? data.level: 0;
  }

  isValid() {
    return this._id? true: false;
  }
  
  displayName() {
    if(this.isValid()) return this.name;
    else return '';
  }
}
