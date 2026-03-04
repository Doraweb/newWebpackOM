import {combineReducers} from 'redux'
import appConfig from '../../../common/appConfig'
import http from '../../../common/http'
import { message,Modal } from 'antd'

const TOGGLE_WARNINGMANAGE_MODAL = 'TOGGLE_WARNINGMANAGE_MODAL';  //报警管理

//报警管理模态框显示和隐藏
export function toggleWarningManageModal(){ 
    return function(dispatch,getState){
        let visible = getState().warningManage.warningManageModalVisible
        dispatch({
            type : TOGGLE_WARNINGMANAGE_MODAL,
            warningManageModalVisible : !visible
        })
    }
}

/**
 * Action Handlers 
 */
const ACTION_HANDLERS = {
    [TOGGLE_WARNINGMANAGE_MODAL] : (state,action) => {
        return Object.assign( {},state,{ warningManageModalVisible : action.warningManageModalVisible } )
    }
}

const initialState = {
    warningManageModalVisible : false,
    defaultValue:'minutsWarning'
}

function warningManageReducer(state = initialState,action){

    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(state,action) : state
}

export default warningManageReducer