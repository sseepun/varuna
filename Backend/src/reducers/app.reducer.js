import {
  CLIENT_IP, SIDENAV_ACTIVE_INDEX,
  APP_SETTINGS, APP_USERS,
  APP_MAP_LAYERS, APP_MAP_PROJECTS, APP_MAP_DATAS,
  APP_MAP_PERMISSIONS,
} from '../actions/types';

const initialState = {
  clientIp: null,
  sidenavActiveIndex: 0,
  settings: {},
  users: [],
  mapLayers: [],
  mapProjects: [],
  mapDatas: [],
  mapPermissions: [],
};

const appReducer = (state = initialState, action) => {
  switch(action.type) {

    case CLIENT_IP:
      return {...state, clientIp: action.payload };
    case SIDENAV_ACTIVE_INDEX:
      return {...state, sidenavActiveIndex: action.payload };

    case APP_SETTINGS:
      return {...state, settings: action.payload };
      
    case APP_USERS:
      return {...state, users: action.payload };
      
    case APP_MAP_LAYERS:
      return {...state, mapLayers: action.payload };
    
    case APP_MAP_PROJECTS:
      return {...state, mapProjects: action.payload };
    case APP_MAP_DATAS:
      return {...state, mapDatas: action.payload };
      
    case APP_MAP_PERMISSIONS:
      return {...state, mapPermissions: action.payload };

    default:
      return state;
  }
};

export default appReducer;