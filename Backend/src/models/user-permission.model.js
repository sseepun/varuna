import { UserModel } from '.';

export class UserPermissionModel {
  constructor(data) {
    this._id = data._id? data._id: null;
    
    this.user = new UserModel(data.user? data.user: {});
    
    this.permissions = [];
    if(data.permissions && data.permissions.length){
      data.permissions.forEach(d => {
        if(d.type && d.value){
          this.permissions.push({
            type: d.type,
            value: d.value,
            read: d.read? Number(d.read): 0,
            create: d.create? Number(d.create): 0,
            update: d.update? Number(d.update): 0,
            delete: d.delete? Number(d.delete): 0
          });
        }
      });
    }
  }

  isValid() {
    return this._id? true: false;
  }
}
