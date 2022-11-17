import { MapProjectModel, UserModel } from '.';

export class MapPermissionModel {
  constructor(data) {
    this._id = data._id? data._id: null;
    
    this.mapProject = new MapProjectModel(data.mapProject? data.mapProject: {});
    this.user = new UserModel(data.user? data.user: {});
    
    this.create = data.create? Number(data.create): 0;
    this.read = data.read? Number(data.read): 0;
    this.update = data.update? Number(data.update): 0;
    this.delete = data.delete? Number(data.delete): 0;
  }

  isValid() {
    return this._id? true: false;
  }
}
