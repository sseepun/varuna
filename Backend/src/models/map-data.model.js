import { MapProjectModel, FileModel } from '.';

export class MapDataModel {
  constructor(data) {
    this._id = data._id? data._id: null;

    this.mapProject = new MapProjectModel(data.mapProject? data.mapProject: {});
    this.name = data.name? data.name: null;

    this.data = new FileModel(data.data? data.data: {});
    this.data2 = new FileModel(data.data2? data.data2: {});
    this.data3 = new FileModel(data.data3? data.data3: {});
    this.data4 = new FileModel(data.data4? data.data4: {});
    this.data5 = new FileModel(data.data5? data.data5: {});
    this.data6 = new FileModel(data.data6? data.data6: {});
    this.data7 = new FileModel(data.data7? data.data7: {});
    this.data8 = new FileModel(data.data8? data.data8: {});
    this.data9 = new FileModel(data.data9? data.data9: {});
    this.data10 = new FileModel(data.data10? data.data10: {});

    this.startAt = data.startAt? new Date(data.startAt): null;
    this.endAt = data.endAt? new Date(data.endAt): null;
    
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

          if(data1 && data1.features){
            let promises = [];
            [2,3,4,5,6,7,8,9,10].forEach(async (i) => {
              promises.push(
                new Promise(async (resolve, reject) => {
                  try {
                    let d = this[`data${i}`];
                    if(d && d.path){
                      let d1 = await fetch(d.path, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                      });
                      if(d1 && d1.status === 200){
                        d1 = await d1.json();
                        if(d1 && d1.features && d1.features.length){
                          data1.features = [
                            ...data1.features,
                            ...d1.features
                          ];
                        }
                      }
                    }
                    resolve(true);
                  } catch (err) {
                    console.log(err);
                    reject(false);
                  }
                })
              );
            });
            await Promise.all(promises);
          }

          return data1;
        }else{
          return null;
        }
      } catch(err) {
        console.log(err);
        return null;
      }
    }
  }
}
