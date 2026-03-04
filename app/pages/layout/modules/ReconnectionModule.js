import http from '../../../common/http';
import {modalTypes} from '../../../common/enum'
import {message} from 'antd'
import moment from 'moment'
import { history } from '../../../index';
// ------------------------------------
// Constants
// ------------------------------------
export const RESET_FAILED_TIME = 'RESET_FAILED_TIME';
export const CHANGE_RECONNECT_MODAL_VISIBLE = 'CHANGE_RECONNECT_MODAL_VISIBLE';

// ------------------------------------
// Actions
// ------------------------------------

//清空失败记录
export function resetFailedTime(delayFlag){
  return function (dispatch, getState) {
    //在每次请求正常的情况下，先跟store里的visible对比，状态不同，才去改变store，这样就解决了日历控件总是刷新的问题
    if (getState().reconnection.reconnectModal.visible === true ) {
      if (delayFlag != undefined) {
        dispatch({
          type : RESET_FAILED_TIME,
          delayFlag
        })
      }else {
        dispatch({
          type : RESET_FAILED_TIME
        })
      }
    }
  }
}


//更改重新连接模态框状态
export function changeReconnectModalVisible(){
  return {
    type : CHANGE_RECONNECT_MODAL_VISIBLE
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RESET_FAILED_TIME] : (state,action) => {
    if (action.delayFlag != undefined) {
      return {
        ...state,
        reconnectModal:{
          visible : false,
          delayFlag: action.delayFlag
        }  
      }
    }else {
      return {
        ...state,
        reconnectModal:{
          visible : false
        }  
      }
    }
    
  },
  [CHANGE_RECONNECT_MODAL_VISIBLE] : (state,action) => {
    return {
      ...state,
      reconnectModal:{
        visible : true
      }  
    }
  }
}
// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  reconnectModal:{
    visible : false,
    delayFlag: false
  }      
};
export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
