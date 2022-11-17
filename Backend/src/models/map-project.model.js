import { FileModel, AddressModel } from '.';
import { unescape } from 'html-escaper';

export class MapProjectModel {
  constructor(data) {
    this._id = data._id? data._id: null;

    this.mapLocation = new AddressModel(data.mapLocation? data.mapLocation: {});
    
    this.name = data.name? data.name: null;
    this.description = data.description? unescape(data.description): null;

    this.image = new FileModel(
      data.image? data.image: { path: '/assets/img/default/img.jpg' }
    );
    this.gallery = data.gallery && data.gallery.length
      ? data.gallery.map(d => new FileModel(d)): [];

    this.status = data.status? Number(data.status): 0;
  }

  isValid() { return this._id? true: false; }

  displayStatus() {
    if(this.isValid()){
      if(this.status === 1) return (<span className="ss-tag bg-success">เปิดใช้งาน</span>);
      else return (<span className="ss-tag bg-warning">ปิดใช้งาน</span>);
    }else{
      return (<span className="ss-tag bg-warning">ปิดใช้งาน</span>);
    }
  }
}
