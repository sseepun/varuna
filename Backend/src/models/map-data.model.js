import { MapProjectModel, FileModel } from '.';

export class MapDataModel {
  constructor(data) {
    this._id = data._id? data._id: null;

    this.mapProject = new MapProjectModel(data.mapProject? data.mapProject: {});
    this.name = data.name? data.name: null;

    this.data = new FileModel(data.data? data.data: {});

    this.startAt = data.startAt? new Date(data.startAt): null;
    this.endAt = data.endAt? new Date(data.endAt): null;
    
    this.status = data.status? Number(data.status): 0;
  }

  isValid() { return this._id? true: false; }

  displayStatus() {
    if(this.isValid()){
      if(this.status === 1) return (<span className="ss-tag bg-success">Active</span>);
      else return (<span className="ss-tag bg-danger">Inactive</span>);
    }else{
      return (<span className="ss-tag bg-danger">Inactive</span>);
    }
  }

  async getData() {
    if(!this.isValid() || !this.data || !this.data.path){
      return null;
    }else{
      try {
        let fetch1 = await fetch(this.data.path, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if(fetch1 && fetch1.status === 200){
          let data1 = await fetch1.json();
          return data1;
        }else{
          return null;
        }
      } catch(err) {
        console.log(123)
        console.log(err);
        return null;
      }
    }
  }
}
