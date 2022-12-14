import { alertLoading, alertChange } from './alert.actions';
import { apiHeader } from '../helpers/header';
import { API_URL } from './variables';
import {
  APP_USERS, APP_MAP_LAYERS, APP_MAP_PROJECTS, APP_MAP_DATAS,
  APP_MAP_PERMISSIONS
} from './types';
import {
  PaginateModel, UserModel, MapLayerModel, MapProjectModel, MapDataModel,
  MapPermissionModel
} from '../models';


export const processClear = (type) => (dispatch) => {
  if(type === 'users') dispatch({ type: APP_USERS, payload: [] });
  else if(type === 'map-layers') dispatch({ type: APP_MAP_LAYERS, payload: [] });
  else if(type === 'map-projects') dispatch({ type: APP_MAP_PROJECTS, payload: [] });
  else if(type === 'map-datas') dispatch({ type: APP_MAP_DATAS, payload: [] });
  else if(type === 'map-permissions') dispatch({ type: APP_MAP_PERMISSIONS, payload: [] });
};


export const processList = (type, input={}, loading=false) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    let isExport = type.includes('export-');
    if(loading) dispatch(alertLoading(true));
    try {
      const fetch1 = await fetch(`${API_URL}admin/${type}`, {
        method: 'POST',
        headers: apiHeader(),
        body: JSON.stringify(input)
      });
      const data1 = await fetch1.json();
      if(!fetch1.ok || fetch1.status !== 200){
        if(loading) dispatch(alertLoading(false));
        reject(data1); return false;
      }

      let res = {
        paginate: new PaginateModel(data1.data.paginate? data1.data.paginate: {}),
        dataFilter: data1.data.dataFilter? data1.data.dataFilter: {},
        result: []
      };
      if(type === 'users'){
        res.result = data1.data.result.map(d => new UserModel(d));
        dispatch({ type: APP_USERS, payload: res.result });
      }else if(type === 'map-layers'){
        res.result = data1.data.result.map(d => new MapLayerModel(d));
        dispatch({ type: APP_MAP_LAYERS, payload: res.result });
      }else if(type === 'map-projects'){
        res.result = data1.data.result.map(d => new MapProjectModel(d));
        dispatch({ type: APP_MAP_PROJECTS, payload: res.result });
      }else if(type === 'map-datas'){
        res.result = data1.data.result.map(d => new MapDataModel(d));
        dispatch({ type: APP_MAP_DATAS, payload: res.result });
      }else if(type === 'map-permissions'){
        res.result = data1.data.result.map(d => new MapPermissionModel(d));
        dispatch({ type: APP_MAP_PERMISSIONS, payload: res.result });
      }else if(isExport){
        if(data1.data.fileName){
          res.result = `${API_URL}frontend/download/${data1.data.fileName}`;
          window.open(res.result);
        }
      }else{
        res.result = data1.data.result;
      }

      if(loading) dispatch(alertLoading(false));
      resolve(res); return true;
    } catch (err) {
      console.log(err);
      if(loading) dispatch(alertLoading(false));
      reject(err); return false;
    }
  });
};
export const processRead = (type, input={}, loading=false) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    if(loading) dispatch(alertLoading(true));
    let url = `${API_URL}admin/${type}`;
    let sep = '?';
    Object.keys(input).forEach(k => {
      if (input[k] || input[k]===0){ url += `${sep}${k}=${input[k]}`; sep = '&'; }
    });
    try {
      const fetch1 = await fetch(url, {
        method: 'GET',
        headers: apiHeader()
      });
      const data1 = await fetch1.json();
      if(!fetch1.ok || fetch1.status !== 200){
        if(loading) dispatch(alertLoading(false));
        reject(data1); return false;
      }
      
      let result = null;
      if(type === 'user'){
        result = new UserModel(data1.data.result);
      }else if(type === 'map-layer'){
        result = new MapLayerModel(data1.data.result);
      }else if(type === 'map-project'){
        result = new MapProjectModel(data1.data.result);
      }else if(type === 'map-data'){
        result = new MapDataModel(data1.data.result);
      }else if(type === 'map-permission'){
        result = new MapPermissionModel(data1.data.result);
      }else{
        result = data1.data.result;
      }

      if(loading) dispatch(alertLoading(false));
      resolve(result); return true;
    } catch (err) {
      console.log(err);
      if(loading) dispatch(alertLoading(false));
      reject(err); return false;
    }
  });
};
export const processCreate = (type, input={}, loading=false) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    if(loading) dispatch(alertLoading(true));
    try {
      const fetch1 = await fetch(`${API_URL}admin/${type}`, {
        method: 'POST',
        headers: apiHeader(),
        body: JSON.stringify(input)
      });
      const data1 = await fetch1.json();
      if(!fetch1.ok || fetch1.status !== 200){
        if(loading) dispatch(alertChange('Warning', data1.message, data1.error? data1.error: []));
        reject(data1); return false;
      }
      
      if(loading) dispatch(alertChange('Info', data1.message));
      resolve(data1); return true;
    } catch (err) {
      console.log(err);
      if(loading) dispatch(alertChange('Danger', 'Internal server error.'));
      reject(err); return false;
    }
  });
};
export const processUpdate = (type, input={}, loading=false) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    if(loading) dispatch(alertLoading(true));
    try {
      const fetch1 = await fetch(`${API_URL}admin/${type}`, {
        method: 'PATCH',
        headers: apiHeader(),
        body: JSON.stringify(input)
      });
      const data1 = await fetch1.json();
      if(!fetch1.ok || fetch1.status !== 200){
        if(loading) dispatch(alertChange('Warning', data1.message, data1.error? data1.error: []));
        reject(data1); return false;
      }
      
      if(loading) dispatch(alertChange('Info', data1.message));
      resolve(data1); return true;
    } catch (err) {
      console.log(err);
      if(loading) dispatch(alertChange('Danger', 'Internal server error.'));
      reject(err); return false;
    }
  });
};
export const processDelete = (type, input={}, loading=false) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    if(loading) dispatch(alertLoading(true));
    try {
      const fetch1 = await fetch(`${API_URL}admin/${type}`, {
        method: 'DELETE',
        headers: apiHeader(),
        body: JSON.stringify(input)
      });
      const data1 = await fetch1.json();
      if(!fetch1.ok || fetch1.status !== 200){
        if(loading) dispatch(alertChange('Warning', data1.message, data1.error? data1.error: []));
        reject(data1); return false;
      }
      
      if(loading) dispatch(alertChange('Info', data1.message));
      resolve(data1); return true;
    } catch (err) {
      console.log(err);
      if(loading) dispatch(alertChange('Danger', 'Internal server error.'));
      reject(err); return false;
    }
  });
};
