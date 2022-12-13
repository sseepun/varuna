import { FileModel } from '.';
import { unescape } from 'html-escaper';

export class MapLayerModel {
  constructor(data) {
    this._id = data._id? data._id: null;
    
    this.name = data.name? data.name: null;
    this.description = data.description? unescape(data.description): null;

    this.image = new FileModel(
      data.image? data.image: { path: '/assets/img/default/img.jpg' }
    );
    this.icon = new FileModel(
      data.icon? data.icon: { path: '/assets/img/default/img.jpg' }
    );

    this.isDeletable = data.isDeletable || data.isDeletable===0? Number(data.isDeletable): 1;
    
    this.status = data.status? Number(data.status): 0;
  }

  isValid() { return this._id? true: false; }

  displayStatus() {
    if(this.isValid()){
      if(this.status === 1) return (<span className="ss-tag bg-success">เปิดใช้งาน</span>);
      else return (<span className="ss-tag bg-danger">ปิดใช้งาน</span>);
    }else{
      return (<span className="ss-tag bg-danger">ปิดใช้งาน</span>);
    }
  }
}
