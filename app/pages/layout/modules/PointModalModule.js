import {message} from 'antd'
import http from '../../../common/http'
import appConfig from '../../../common/appConfig'
const language = appConfig.language
const isEnglish = language === 'en'


/**
 * Constants
 */
export const Schedule_Point_TABLE_DATA = 'Schedule_Point_TABLE_DATA'
export const Schedule_Point_UPDATE_TABLE_DATA = 'Schedule_Point_UPDATE_TABLE_DATA'
export const Schedule_Point_SELECTED_POINT = 'Schedule_Point_SELECTED_POINT'
export const Schedule_Point_LOADING = 'Schedule_Point_LOADING'
export const Schedule_Point_SEARCH_VALUE = 'Schedule_Point_SEARCH_VALUE'
/**
 * Actions
 */

//初始化
export function initialize(){
    return function(dispatch,getState){
        // const current = getState().alarmManage.pointTable.current
        // const pageSize = getState().alarmManage.pointTable.pageSize
        const searchValue = getState().schedulePoint.searchValue
        let newValue = searchValue.trim()
        if(newValue.indexOf(" ") != -1){
            newValue = newValue.split(" ")
        }
        dispatch(tableLoading(true))
        http.post('/point/findByKeyword',{
            "keyword": newValue
        }).then(
            result=>{
                if(result||result[value]){
                    let pointList = Object.keys(result).map(row => {
                        return {
                            name: row,
                            addr: result[row].addr,
                            sourceType: result[row].sourceType,
                            description: isEnglish ? result[row].descriptionEn:result[row].description
                        }
                    })
                    let data ={
                        pointList:pointList,
                        total: pointList.length
                    }
                    
                    dispatch(tableLoading(false))
                    dispatch(savePointTableData(data))
                    
                    
                }else{
                    dispatch(tableLoading(false))
                    dispatch(savePointTableData({pointList:[],total:0}))
                }
            }
        )
    }
}

export function searchPointData(value){
    return function(dispatch,getState){
        const current = getState().alarmManage.pointTable.current
        const pageSize = getState().alarmManage.pointTable.pageSize
        // if(value){
            dispatch({
                type : Schedule_Point_SEARCH_VALUE,
                value
            })
            dispatch(tableLoading(true))

            let newValue = value.trim()
            if(newValue.indexOf(" ") != -1){
                newValue = newValue.split(" ")
            }
            http.post('/point/findByKeyword',{
                "keyword": newValue
            }).then(
                result=>{
                    if(result||result[value]){
                        let pointList = Object.keys(result).map(row => {
                            return {
                                name: row,
                                addr: result[row].addr,
                                sourceType: result[row].sourceType,
                                description: isEnglish ? result[row].descriptionEn:result[row].description
                            }
                        })
                        let data ={
                            pointList:pointList,
                            total: pointList.length
                        }
                        
                        dispatch(tableLoading(false))
                        dispatch(savePointTableData(data))
                        
                        
                    }else{
                        dispatch(tableLoading(false))
                        dispatch(savePointTableData({pointList:[],total:0}))
                        //console.log(result)
                    }
                }
            )
        // }
    }
}

//保存点位数据
export function savePointTableData(data){
    return {
        type : Schedule_Point_TABLE_DATA,
        pointData : data.pointList,
        total : data.total
    }
}

//loading
export function tableLoading(loading){
    return {
        type : Schedule_Point_LOADING,
        loading : loading
    }
}

//分页器修改函数
export function onPaginationChange(pagination){
    return function(dispatch){
        console.info( pagination )
        dispatch(upDatePointTable(pagination))
        dispatch(initialize()) //用户切换页数后重新发起请求
    }
}

export function upDatePointTable(pagination){
    return {
        type:Schedule_Point_UPDATE_TABLE_DATA,
        condition : {
            current : pagination.current,
            pageSize : pagination.pageSize
        }
    }
}

//用户点击确认后保存数据到全局state
export function saveSelectedPoint(selectedData){
    return {
        type : Schedule_Point_SELECTED_POINT,
        selectedData : selectedData
    }
}

/**
 * Action Handles
 */

const ACTION_HANDLERS = {
    [Schedule_Point_TABLE_DATA] : (state,action) => {
        return Object.assign({},{...state,pointData:action.pointData,total: action.total})
    },
    [Schedule_Point_UPDATE_TABLE_DATA] : (state,action)=>{
        return Object.assign({},state,action.condition)
    },
    [Schedule_Point_SELECTED_POINT] : (state,action) => {
        return {...state, selectedData: action.selectedData}   
    },
    [Schedule_Point_LOADING] : (state,action) => {
        return Object.assign({},state,{loading:action.loading})
    },
    [Schedule_Point_SEARCH_VALUE] : (state,action) => {
        return Object.assign({},state,{searchValue:action.value})
    }
}

const initialState = {
    pointData : [],
    current : 1,
    pageSize : 50,
    total : 0,
    selectedData : [],
    loading : false,
    searchValue:''
}

export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
