import {message} from 'antd'
import http from '../../../common/http'
import appConfig from '../../../common/appConfig'
const language = appConfig.language
const isEnglish = language === 'en'

/**
 * Constants
 */
export const Point_TABLE_DATA = 'Point_TABLE_DATA'
export const Point_UPDATE_TABLE_DATA = 'Point_UPDATE_TABLE_DATA'
export const Point_LOADING = 'Point_LOADING'
export const Point_SEARCH_VALUE = 'Point_SEARCH_VALUE'
export const Point_POINT_TABLE_SELECT_CHANGE = "Point_POINT_TABLE_SELECT_CHANGE"
/**
 * Actions
 */

//初始化
export function initialize(){
    return function(dispatch,getState){
        const current = getState().alarmManage.pointTable.current
        const pageSize = getState().alarmManage.pointTable.pageSize
        // let searchValue = getState().alarmManage.pointTable.searchValue
        // searchValue = searchValue.trim().split(' ')
        // searchValue = searchValue.filter(item=>item)
        dispatch(tableLoading(true))
        http.post('/point/findByKeyword',{
            keyword: "",
            searchArea:0
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
                type : Point_SEARCH_VALUE,
                value
            })
            dispatch(tableLoading(true))
            value = value.trim().split(' ')
            value = value.filter(item=>item)
            http.post('/point/findByKeyword',{
                keyword: value,
                searchArea:0
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


export function onSelectChange(selectedRowIds) {
    return {
        type: Point_POINT_TABLE_SELECT_CHANGE,
        selectedIds: selectedRowIds
    };
}


//保存点位数据
export function savePointTableData(data){
    return {
        type : Point_TABLE_DATA,
        pointData : data.pointList,
        total : data.total
    }
}

//loading
export function tableLoading(loading){
    return {
        type : Point_LOADING,
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
        type:Point_UPDATE_TABLE_DATA,
        condition : {
            current : pagination.current,
            pageSize : pagination.pageSize
        }
    }
}


/**
 * Action Handles
 */

const ACTION_HANDLES = {
    [Point_TABLE_DATA] : (state,action) => {
        return Object.assign({},{...state,pointData:action.pointData,total: action.total})
    },
    [Point_UPDATE_TABLE_DATA] : (state,action)=>{
        return Object.assign({},state,action.condition)
    },
    [Point_LOADING] : (state,action) => {
        return Object.assign({},state,{loading:action.loading})
    },
    [Point_SEARCH_VALUE] : (state,action) => {
        return Object.assign({},state,{searchValue:action.value})
    },
    [Point_POINT_TABLE_SELECT_CHANGE] : (state,action) => {
        return {...state,selectedIds:action.selectedIds}
    }
}

const initialState = {
    pointData : [],
    current : 1,
    pageSize : 50,
    total : 0,
    loading : false,
    searchValue:'',
    selectedIds:[]
}

const pointTableReducer = function(state=initialState,action){
    const handler = ACTION_HANDLES[action.type]
    return handler ? handler(state,action) : state
}

export default pointTableReducer
