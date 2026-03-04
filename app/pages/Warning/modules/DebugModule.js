import {combineReducers} from 'redux'



/**
 * Constants
 */
export const TOGGLE_PAGE_VISIBLE = 'debug.TOGGLE_PAGE_VISIBLE'
export const SHOW_MODAL = 'debug.SHOW_MODAL'
export const HIDE_MODAL = 'debug.HIDE_MODAL'
export const SELECTED_PAGE_KEY = 'debug.SELECTED_PAGE_KEY'

/**
 * Actions
*/
//切换调试界面
export function toggleDebugLayer(debugVisible){
    return function(dispatch,getState){
        let {closeRealTimeFresh,renderScreen} = getState().observer.parmsDict
        if(debugVisible){
            closeRealTimeFresh()
        }else{
            renderScreen()
        }
        dispatch({
            type : TOGGLE_PAGE_VISIBLE,
            debugVisible
        })
    }
}

export function showModal(modal){
    return {
      type : SHOW_MODAL,
      modal
    }
  }

export function hideModal(){
    return {
        type : HIDE_MODAL,
        modal : {
            type : null,
            props : {}
        }
    }
}
//保存选中页面导航的key
export function choseMenuItem(selectedKey){
    return function(dispatch,getState){
        dispatch(choseMenuItemTo(selectedKey))
    }
}

//保存选中页面导航的key
export function choseMenuItemTo(selectedKey){
    return {
        type : SELECTED_PAGE_KEY,
        selectedKey
    }
}

/**
 * Reducers
 */
const ACTION_HANDLES = {
    [TOGGLE_PAGE_VISIBLE] : (state,action) => {
        if(!action.debugVisible){
            return initialState
        }
        return {...state,debugVisible : action.debugVisible}
    },
    [SHOW_MODAL] : (state,action) =>{
        return {...state,modal:action.modal}
    },
    [HIDE_MODAL] : (state,action) =>{
        return {...state,modal:action.modal,}
    },
    [SELECTED_PAGE_KEY]:(state,action) => {
        return {...state,selectedKey : action.selectedKey}
    }
}


const initialState = {
    debugVisible : false,
    modal : {
        type : null,
        props : {}
    },
    selectedKey : 'FaultHandle'
}

const handleReucer = (state=initialState ,action) => {
    const handler = ACTION_HANDLES[action.type]

    return handler ? handler(state,action) : state
}

export default combineReducers({
    base: handleReucer,

  });
  
  