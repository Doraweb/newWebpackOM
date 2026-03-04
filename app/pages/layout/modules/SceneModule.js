import http from '../../../common/http';
import {modalTypes} from '../../../common/enum'
import {message} from 'antd'
import moment from 'moment'
import { history } from '../../../index';

const GET_SCENEDATA = 'scene.GET_SCENEDATA'
const GET_SCENEID = 'scene.GET_SECNEID'
const GET_SCENELOADING = 'scene.GET_SCENELOADING'
// ------------------------------------
// Constants
// ------------------------------------
// ------------------------------------
// Actions
// -----------------------------------
export function getSceneData(data){
	return {
		type:GET_SCENEDATA,
		SceneDataSource:data
	}
}
export function SceneSelectId(id){
	return{
		type:GET_SCENEID,
		SceneId:id
	}
}
export function SceneLoad(data){
	return{
		type:GET_SCENELOADING,
		SceneDataLoaing:data
	}
}	

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [GET_SCENEDATA] : (state,action) => {
    return {...state,SceneDataSource:action.SceneDataSource}
  },
  [GET_SCENEID]: (state,action) => {
	  return {...state,SceneId:action.SceneId}
  },
  [GET_SCENELOADING]:(state,action)=>{
	  return {...state,SceneDataLoaing:action.SceneDataLoaing}
  }
}
// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
	SceneDataSource:[],
	SceneId:'',
	SceneDataLoaing:false
};
export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
