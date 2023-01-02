import { FileModel } from '.';
import { unescape } from 'html-escaper';

/*
  type : Integer
    1 = Table
    2 = Vertical Bar Chart
    3 = Horizontal Bar Chart
    4 = Pie Chart
    5 = Donut Chart
    6 = Total Summary

  attributes : Array
    attribute : Object
      key : String
      name : String
      unit : String
      dataType : Number
        1 = Text
        2 = Number
      axis : Number
        1 = X Axis
        2 = Y Axis
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

    // Chart Variables
    this.chartAxisX = null;
    this.chartAxisY = null;
    this.chartDataX = [];
    this.chartDataY = [];
  }

  isValid() { return this._id? true: false; }

  displayType() {
    if(this.isValid()){
      if(this.type === 1) return 'Table';
      else if(this.type === 2) return 'Vertical Bar Chart';
      else if(this.type === 3) return 'Horizontal Bar Chart';
      else if(this.type === 4) return 'Pie Chart';
      else if(this.type === 5) return 'Donut Chart';
      else if(this.type === 6) return 'Total Summary';
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

  initAttributes() {
    if(this.isValid()){
      if(this.type === 1){
        return [{ key: '', name: '', unit: '', dataType: 1, digits: 0 }];
      }else if([2, 3].indexOf(this.type) > -1){
        return [
          { key: '', name: '', unit: '', axis: 1, dataType: 2, digits: 0, color: '#2bc65e' },
          { key: '', name: '', unit: '', axis: 2, dataType: 2, digits: 0, color: '#2bc65e' },
        ];
      }else if([4, 5].indexOf(this.type) > -1){
        return [{ key: '', name: '', unit: '', dataType: 2, digits: 0, color: '#2bc65e' }];
      }else if([6].indexOf(this.type) > -1){
        return [{ key: '', name: '', unit: '', dataType: 2, digits: 0, color: '#2bc65e' }];
      }else{
        return [];
      }
    }else{
      return [];
    }
  }
  rowAttribute() {
    if(this.isValid()){
      if(this.type === 1){
        return { key: '', name: '', unit: '', dataType: 1, digits: 0 };
      }else if([4, 5].indexOf(this.type) > -1){
        return { key: '', name: '', unit: '', dataType: 2, digits: 0 };
      }else{
        return null;
      }
    }else{
      return null;
    }
  }

  initData(mapData=null) {
    this.chartAxisX = null;
    this.chartAxisY = null;
    this.chartDataX = [];
    this.chartDataY = [];
    this.chartMaxX = 0;
    this.chartMaxY = 0;
    if(mapData && mapData.features){

      if([2, 3].indexOf(this.type) > -1){
        let attr1 = this.attributes.filter(d => d.axis === 1);
        let attr2 = this.attributes.filter(d => d.axis === 2);
        if(attr1.length && attr2.length){
          attr1 = attr1[0];
          attr2 = attr2[0];
          let digits1 = !isNaN(attr1.digits)? attr1.digits: 0;
          let digits2 = !isNaN(attr2.digits)? attr2.digits: 0;

          this.chartAxisX = attr1;
          this.chartAxisY = attr2;

          let obj = {};
          if(this.type === 2){ // Vertical Bar Chart
            mapData.features.forEach(d => {
              if(d.properties){
                let x = d.properties[attr1.key];
                let y = d.properties[attr2.key];
                y = Math.round(y * 10**digits2)/10**digits2;
                if(attr1.dataType === 2){
                  x = Math.round(x * 10**digits1)/10**digits1;
                  obj[x] = y;
                }else{
                  if(obj[x]) obj[x] += y;
                  else obj[x] = y;
                }
              }
            });
            this.chartDataX = Object.keys(obj);
            this.chartDataY = this.chartDataX.map(d => obj[d]);
            this.chartMaxY = Math.max(...this.chartDataY);
          }else{ // Horizontal Bar Chart
            mapData.features.forEach(d => {
              if(d.properties){
                let x = d.properties[attr1.key];
                let y = d.properties[attr2.key];
                x = Math.round(x * 10**digits1)/10**digits1;
                if(attr2.dataType === 2){
                  y = Math.round(y * 10**digits2)/10**digits2;
                  obj[y] = x;
                }else{
                  if(obj[y]) obj[y] += x;
                  else obj[y] = x;
                }
              }
            });
            this.chartDataY = Object.keys(obj);
            this.chartDataX = this.chartDataY.map(d => obj[d]);
            this.chartMaxX = Math.max(...this.chartDataX);
          }
        }
      }

    }
  }
  getDataTotal(mapData, attr) {
    if(mapData && mapData.features && attr.key){
      let temp = 0;
      let digits = !isNaN(attr.digits)? attr.digits: 0;
      mapData.features.forEach(d => {
        if(d.properties){
          let k = d.properties[attr.key];
          if(k && !isNaN(k)) temp += k;
        }
      });
      return Math.round(temp * 10**digits)/10**digits;
    }else{
      return 0;
    }
  }
}
