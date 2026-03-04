import http from '../../../common/http'
import {message} from 'antd'
import CheckWorker from '../../../common/checkWorker'
import {syncFunc,addOperation} from '../../../common/utils';
import moment from 'moment';
import {modalTypes} from '../../../common/enum'
import { showModal} from  '../../modal/modules/ModalModule'
import { func } from 'prop-types';
export const LAYOUT_REPAIR_DARA = 'LAYOUT_REPAIR_DARA'
export const REPAIR_VISIABLE = 'REPAIR_VISIABLE'
export const CURRENT_DATA = 'CURRENT_DATA'


//时间查询
export function RepairDataAction(time1,time2){
  return function(dispatch,getstate){
    dispatch(RepairVisiable(true))
    return http.post('/fix/getByPeriod',{
      "timeFrom":time1,
      "timeTo":time2
    }).then(
      data=>{
          if(data.err==0){
            dispatch(getRepairData(data.data))
            dispatch(CurrentData(data.data[0]))
          }else{
            dispatch(getRepairData(data.data))
          }
      }
    ).catch(
       err=>{
            dispatch(getRepairData([]))
          // Modal.error('请求数据失败')
       }
    )
  }
}
export function getRepairData(data){
  return{
    type:LAYOUT_REPAIR_DARA,
    RepairManageData:data
  }
}
export function RepairVisiable(data){
  return{
    type:REPAIR_VISIABLE,
    visiable:data
  }
}
export function CurrentData(data){
  return{
    type:CURRENT_DATA,
    RepairCurrentData:data
  }
}
const ACTION_HANDLERS = {
  //报修列表信息
  [LAYOUT_REPAIR_DARA]:(state,action)=>{
    return{...state,RepairManageData:action.RepairManageData}
  },
  [REPAIR_VISIABLE]:(state,action)=>{
    return{...state,visiable:action.visiable}
  },
  [CURRENT_DATA]:(state,action)=>{
    return{...state,RepairCurrentData:action.RepairCurrentData}
  }
}
const initialState = {
  RepairManageData:undefined,                            //报修管理信息列表
  visiable:false,
  RepairCurrentData:undefined
};  
export default function homeReducer (state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
  }
  
  