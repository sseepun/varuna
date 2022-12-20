import { FileModel } from '.';
import { unescape } from 'html-escaper';

/*
  type : Integer
    1 = Table
    2 = Vertical Bar Chart
    3 = Horizontal Bar Chart
    4 = Pie Chart
    5 = Donut Chart

  attributes : Array
    attribute : Object
      name : String
      unit : String
      key : String
*/

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
    
    this.color = data.color? data.color: '#2bc65e';
    this.opacity = data.opacity || data.opacity===0? Number(data.opacity): 25;
    
    this.type = data.type? Number(data.type): 1;
    this.attributes = data.attributes && data.attributes.length? data.attributes: [];

    this.order = data.order? Number(data.order): 1;
    this.status = data.status? Number(data.status): 0;

    this.isDeletable = data.isDeletable || data.isDeletable===0? Number(data.isDeletable): 1;
  }

  isValid() { return this._id? true: false; }

  displayType() {
    if(this.isValid()){
      if(this.type === 1) return 'Table';
      else if(this.type === 2) return 'Vertical Bar Chart';
      else if(this.type === 3) return 'Horizontal Bar Chart';
      else if(this.type === 4) return 'Pie Chart';
      else if(this.type === 5) return 'Donut Chart';
      else return '';
    }else{
      return '';
    }
  }
  displayStatus() {
    if(this.isValid()){
      if(this.status === 1) return (<span className="ss-tag bg-success">เปิดใช้งาน</span>);
      else return (<span className="ss-tag bg-danger">ปิดใช้งาน</span>);
    }else{
      return (<span className="ss-tag bg-danger">ปิดใช้งาน</span>);
    }
  }
}
