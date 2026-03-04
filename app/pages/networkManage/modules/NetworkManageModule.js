import {combineReducers} from 'redux'
import appConfig from '../../../common/appConfig'
import http from '../../../common/http'
import { message,Modal } from 'antd'

const TOGGLE_NETWORKMANAGE_MODAL = 'TOGGLE_NETWORKMANAGE_MODAL'; 

//网络拓扑模态框显示和隐藏
export function toggleNetworkManageModal(){ 
    return function(dispatch,getState){
        let visible = getState().networkManage.networkManageModalVisible
        dispatch({
            type : TOGGLE_NETWORKMANAGE_MODAL,
            networkManageModalVisible : !visible
        })
    }
}

/**
 * Action Handlers 
 */
const ACTION_HANDLERS = {
    [TOGGLE_NETWORKMANAGE_MODAL] : (state,action) => {
        return Object.assign( {},state,{ networkManageModalVisible : action.networkManageModalVisible } )
    }
}

const initialState = {
    networkManageModalVisible : false,
    defaultValue:'minutsWarning'
}

function networkManageReducer(state = initialState,action){

    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(state,action) : state
}

export default networkManageReducer