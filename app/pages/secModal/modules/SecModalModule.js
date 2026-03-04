import { modalTypes, SecModalTypes } from '../../../common/enum';
import http from '../../../common/http';
import { message, Modal } from 'antd';
import CheckWorker from '../../../common/checkWorker'
import { syncFunc, addOperation } from '../../../common/utils';
import { saveCustomTableData, saveSetCustomTableData, isSettingFun, getCustomTableData } from '../../observer/modules/ObserverModule';

import moment from 'moment'
import appConfig from '../../../common/appConfig';
import { showUpdateTokenModal } from '../../modal/modules/ModalModule';
const language = appConfig.language


// ------------------------------------
// Constants
// ------------------------------------
export const RESET = 'secModal.RESET';
export const SHOW_MODAL = 'secModal.SHOW_MODAL';
export const HIDE_MODAL = 'secModal.HIDE_MODAL';
export const SHOW_POINT_MODAL = 'secModal.SHOW_POINT_MODAL';
export const SHOW_OBSERVER_MODAL = 'secModal.SHOW_OBSERVER_MODAL';
export const SHOW_OPTIMIZE_VALUE_MODAL = 'secModal.SHOW_OPTIMIZE_VALUE_MODAL';
export const TIME_PICKER_MODAL = 'secModal.TIME_PICKER_MODAL';
export const VALUE_LOADING = 'secModal.VALUE_LOADING';
export const GET_POINT_INFO = 'secModal.GET_POINT_INFO';
export const GET_DICTBINDSTRING = 'secModal.GET_DICTBINDSTRING';
export const OPERATE_SWITCH_MODAL = 'secModal.OPERATE_SWITCH_MODAL';
export const SHOW_SWITCH = 'secModal.SHOW_SWITCH';
export const HIDE_SWITCH = 'secModal.HIDE_SWITCH';
export const SHOW_CHECKBOX = 'secModal.SHOW_CHECKBOX';
export const HIDE_CHECKBOX = 'secModal.HIDE_CHECKBOX';
export const SHOW_TEXT = 'secModal.SHOW_TEXT';
export const HIDE_TEXT = 'secModal.HIDE_TEXT';
export const SHOW_RADIO = 'secModal.SHOW_RADIO';
export const HIDE_RADIO = 'secModal.HIDE_RADIO';
export const SHOW_SELECT = 'secModal.SHOW_SELECT';
export const HIDE_SELECT = 'secModal.HIDE_SELECT';
export const SHOW_ALARM = 'secModal.SHOW_ALARM';
export const HIDE_ALARM = 'secModal.HIDE_ALARM';
export const OBSERVER_MODAL_DICT = 'secModal.OBSERVER_MODAL_DICT';
export const UPDATE_OPERATE_DATA = 'secModal.UPDATE_OPERATE_DATA';
export const TABLE_LOADING = 'secModal.TABLE_LOADING';



// let user_info = localStorage.getItem('userInfo') ? 
//                 JSON.parse(localStorage.getItem('userInfo')) : {}

// ------------------------------------
// Actions
// ------------------------------------
export function reset() {
    return {
        type: RESET
    }
}

export function showModal(modalType, modalProps) {
    return {
        type: SHOW_MODAL,
        modalType,
        modalProps
    }
}

export function hideModal() {
    localStorage.setItem("ModalOnOff", 0)
    return {
        type: HIDE_MODAL
    }
}

export function hideModalToLayout() {
    return {
        type: HIDE_MODAL
    }
}

//设备开关的展示模态框
export function showSwitch(switchVisible, switchData) {
    return {
        type: SHOW_SWITCH,
        switchVisible,
        switchData
    }
}

//设备开关的隐藏模态框
export function switchHide() {
    return {
        type: HIDE_SWITCH
    }
}

//优化选项的展示模态框
export function showCheckbox(checkboxVisible, checkboxData) {
    return {
        type: SHOW_CHECKBOX,
        checkboxVisible,
        checkboxData
    }
}

//优化选项的隐藏模态框
export function checkboxHide() {
    return {
        type: HIDE_CHECKBOX
    }
}

//展示设备详情框里所有设置值的模态框
export function showText(textVisible, textData) {
    return {
        type: SHOW_TEXT,
        textVisible,
        textData
    }
}

//隐藏设备详情框里所有设置值的模态框
export function textHide() {
    return {
        type: HIDE_TEXT
    }
}

//展示设备详情中启用／禁用单选按钮的模态框
export function showRadio(radioVisible, radioData) {
    return {
        type: SHOW_RADIO,
        radioVisible,
        radioData
    }
}

//隐藏设备详情中启用／禁用单选按钮的模态框
export function radioHide() {
    return {
        type: HIDE_RADIO
    }
}

//展示设备详情里的控制模式选项的模态框
export function showSelect(selectVisible, selectData) {
    return {
        type: SHOW_SELECT,
        selectVisible,
        selectData
    }
}

//隐藏设备详情里的控制模式选项的模态框
export function selectHide() {
    return {
        type: HIDE_SELECT
    }
}

//展示设备详情里的添加报警的模态框
export function showAlarm(alarmVisible, alarmData) {
    return {
        type: SHOW_ALARM,
        alarmVisible,
        alarmData
    }
}

//隐藏设备详情里的添加报警的模态框
export function alarmHide() {
    return {
        type: HIDE_ALARM
    }
}


export function showPointModal(modalProps) {
    return showModal(modalTypes.POINT_MODAL, modalProps);
}


export function showObserverSecModal(modalProps) {
    return showModal(SecModalTypes.OBSERVER_SEC_MODAL, modalProps);
}

export function showSwitchUserModal(modalProps) {
    return showModal(modalTypes.SWITCH_USER_MODAL, modalProps);
}

//切换到按钮选中的全屏页面
export function showFullScreen(data) {
    return
}

//弹出添加报警模态框
export function showCommonAlarm(modalProps) {
    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
        return showAlarm(true, modalProps)
    } else {
        Modal.info({
            title: '提示',
            content: '用户权限不足'
        })
    }
}

//主界面浮动框弹出添加报警
export function showMainInterfaceModal(modalProps) {
    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
        return showModal(modalTypes.ALARM_MAININTERFACE_MODAL, modalProps)
    } else {
        Modal.info({
            title: '提示',
            content: '用户权限不足'
        })
    }
}
//主界面弹出确认checkbox确认对话框
export function showMainCheckboxModal(modalProps) {
    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
        return showModal(modalTypes.MAIN_CHECKBOX_SET_VALUE_MODAL, modalProps)
    } else {
        Modal.info({
            title: '提示',
            content: '用户权限不足'
        })
    }
}

//弹出优化设置值模块
export function showOptimizeModal(modalProps) {
    return getPointInfo(modalProps);
}

//弹出时间控件改值模块
export function showTimeModal(modalProps) {
    return showTimePicker(modalProps);
}

//弹出设备开关模态框
export function showOperatingModal(modalProps) {
    return showSwitch(true, modalProps);
}

//弹出优化选项模态框
export function showCheckboxModal(modalProps) {
    return showCheckbox(true, modalProps);
}

//弹出设备详情中所有设置值的模态框
export function showOperatingTextModal(modalProps) {
    return getObserverPointInfo(modalProps);
}

//弹出设备详情中启用／禁用单选按钮的模态框
export function showRadioModal(modalProps) {
    return showRadio(true, modalProps);
}

//弹出设备详情里的控制模式选项的模态框
export function showSelectControlModal(modalProps) {
    return showSelect(true, modalProps);
}

//获取点名信息
export function getPointInfo(modalProps) {
    let pointInfo, pointList = []
    if (localStorage.getItem('allPointList') != undefined) {
        JSON.parse(localStorage.getItem('allPointList')).map(item => {
            if (item.name == modalProps.idCom) {
                pointInfo = item
            }
        })
    }
    if (typeof (pointInfo.highhigh) != 'number' && pointInfo.highhigh != '' && pointInfo.highhigh != undefined) {
        pointList.push(pointInfo.highhigh)
    }
    if (typeof (pointInfo.low) != 'number' && pointInfo.low != '' && pointInfo.low != undefined) {
        pointList.push(pointInfo.low)
    }
    return function (dispatch, getState) {
        dispatch({
            type: GET_DICTBINDSTRING,
            dictBindString: modalProps.dictBindString
        });
        if (pointList.length != 0) {
            if (pointInfo.pointInfo == undefined) {
                let pointStr = { hight: '', low: '' }
                pointInfo.pointInfo = pointStr
            }
            http.post('/get_realtimedata', {
                proj: 1,
                pointList: pointList,
                scriptList: [],
                ...(language == 'en' ? { "lan": "en" } : {})
            }).then(
                data => {
                    if (data.length != 0) {
                        data.map(item => {
                            if (item.name == pointInfo.low) {
                                pointInfo['pointInfo']['low'] = Number(item.value)
                            } else if (item.name == pointInfo.highhigh) {
                                pointInfo['pointInfo']['hight'] = Number(item.value)
                            }
                        })
                        dispatch({
                            type: GET_POINT_INFO,
                            pointInfo: pointInfo
                        });
                        if (pointInfo.param10 != undefined && pointInfo.param10 != "" && pointInfo.param10.indexOf('|') != -1) {
                            if (pointInfo.param10.slice(pointInfo.param10.indexOf('|') + 1) > JSON.parse(window.localStorage.getItem('userData')).role) {
                                Modal.info({
                                    title: '提示',
                                    content: '用户权限不足'
                                })
                                return
                            }
                        }
                        dispatch(showModal(modalTypes.OPTIMIZE_VALUE_MODAL, modalProps));
                    }
                }
            )
        } else {
            dispatch({
                type: GET_POINT_INFO,
                pointInfo: pointInfo
            });
            if (pointInfo.param10 != undefined && pointInfo.param10 != "" && pointInfo.param10.indexOf('|') != -1) {
                if (pointInfo.param10.slice(pointInfo.param10.indexOf('|') + 1) > JSON.parse(window.localStorage.getItem('userData')).role) {
                    Modal.info({
                        title: '提示',
                        content: '用户权限不足'
                    })
                    return
                }
            }
            dispatch(showModal(modalTypes.OPTIMIZE_VALUE_MODAL, modalProps));
        }
    }
}

export function showTimePicker(modalProps) {
    return function (dispatch, getState) {
        dispatch(showModal(modalTypes.TIME_PICKER_MODAL, modalProps));

    }
}

//设备详情框里的获取点名信息
export function getObserverPointInfo(modalProps) {
    let pointInfo, pointList = []
    if (localStorage.getItem('allPointList') != undefined) {
        JSON.parse(localStorage.getItem('allPointList')).map(item => {
            if (item.name == modalProps.idCom) {
                pointInfo = item
            }
        })
    }
    if (typeof (pointInfo.highhigh) != 'number' && pointInfo.highhigh != '' && pointInfo.highhigh != undefined) {
        pointList.push(pointInfo.highhigh)
    }
    if (typeof (pointInfo.low) != 'number' && pointInfo.low != '' && pointInfo.low != undefined) {
        pointList.push(pointInfo.low)
    }
    return function (dispatch, getState) {
        if (pointList.length != 0) {
            if (pointInfo.pointInfo == undefined) {
                let pointStr = { hight: '', low: '' }
                pointInfo.pointInfo = pointStr
            }
            http.post('/get_realtimedata', {
                proj: 1,
                pointList: pointList,
                scriptList: [],
                ...(language == 'en' ? { "lan": "en" } : {})
            }).then(
                data => {
                    if (data.length != 0) {
                        data.map(item => {
                            if (item.name == pointInfo.low) {
                                pointInfo['pointInfo']['low'] = Number(item.value)
                            } else if (item.name == pointInfo.highhigh) {
                                pointInfo['pointInfo']['hight'] = Number(item.value)
                            }
                        })
                        dispatch({
                            type: GET_POINT_INFO,
                            pointInfo: pointInfo
                        });
                        if (pointInfo.param10 != undefined && pointInfo.param10 != "" && pointInfo.param10.indexOf('|') != -1) {
                            if (pointInfo.param10.slice(pointInfo.param10.indexOf('|') + 1) > JSON.parse(window.localStorage.getItem('userData')).role) {
                                Modal.info({
                                    title: '提示',
                                    content: '用户权限不足'
                                })
                                return
                            }
                        }
                        dispatch(showText(true, modalProps));
                    }
                }
            )
        } else {
            dispatch({
                type: GET_POINT_INFO,
                pointInfo: pointInfo
            });
            if (pointInfo.param10 != undefined && pointInfo.param10 != "" && pointInfo.param10.indexOf('|') != -1) {
                if (pointInfo.param10.slice(pointInfo.param10.indexOf('|') + 1) > JSON.parse(window.localStorage.getItem('userData')).role) {
                    Modal.info({
                        title: '提示',
                        content: '用户权限不足'
                    })
                    return
                }
            }
            dispatch(showText(true, modalProps));
        }
    }
}

//设备开关设置-弹框中按钮
export function operateSwitch(idCom, setValue, description) {
    let setValueString = setValue.toString()
    //往后台传的都是数组格式
    let valueList = []

    if (setValueString != undefined && setValueString.indexOf(',') != -1) {
        //多个值（一个按钮要给多个点位赋值情况）
        valueList = setValueString.split(",")
    } else {
        if (setValueString != undefined) {
            //单个值（常见一个按钮给一个点赋值情况）
            valueList.push(setValue.toString()) //兼容按钮设置所有数值
        }
    }

    let pointName = []
    if (idCom != undefined && idCom.toString().indexOf(',') != -1) {
        pointName = idCom.toString().split(",")
    } else {
        if (idCom != undefined) {
            pointName.push(idCom)
        }
    }

    //处理意外情况：如果多值设置中，数量比点名数量少，则缺少的值用最后一个点值补齐
    if (valueList.length < pointName.length) {
        for (let i = valueList.length; i < pointName.length; i++) {
            valueList.push(Number(valueList[length - 1]))
        }
    }

    return function (dispatch, getState) {
        let modal = getState().modal
        // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
        if (modal.isLoading) {
            //syncFunc in utils
            return syncFunc(() => {
                dispatch(switchHide())
            }).then(
                first => {
                    first()
                }
            ).then(
                () => {
                    dispatch(valueLoading(false));
                }
            )
        }
        dispatch(getOperateData(true, ''))

        if (localStorage.getItem('hideLoading') == 1) {
            dispatch(switchHide())
        } else {
            dispatch(valueLoading(true))
        }

        if (description) {
            description = localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? '用户' + JSON.parse(localStorage.getItem('userInfo')).name + '操作 ' + description : description
        } else {
            description = undefined
        }

        if (pointName.length == 1 && valueList.length == 2) {
            return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
                token: appConfig.token,
                pointList: pointName,
                valueList: [valueList[0]],
                waitSuccess: 1,
                addOperationLog: 1,
                clickEventDesc: description,
                userName: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
                source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
                onduty: appConfig.onduty,
                cloudUserId: appConfig.cloudUser.cloudUserId,
                projectId: appConfig.projectId
            }).then(
                serverData => {
                    if (serverData.err === 0) {
                        http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
                            token: appConfig.token,
                            pointList: pointName,
                            valueList: [valueList[1]],
                            waitSuccess: 1,
                            addOperationLog: 1,
                            userName: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
                            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
                        }).then(
                            res => {
                                dispatch(switchHide())
                                dispatch(valueLoading(false))
                                if (res.err == 1) {
                                    if (res.msg == 'token已过期' || res.msg == 'token无效') {
                                        Modal.info({
                                            title: '命令发送被系统舍弃',
                                            content: '原因：' + res.msg + '，请重新登录验证获取token后继续尝试',
                                            onOk: () => {
                                                showUpdateTokenModal()
                                            }
                                        })
                                    } else {
                                        if (localStorage.getItem('hideLoading') != 1) {
                                            Modal.error({
                                                title: '提示',
                                                content: res.msg
                                            })
                                        }
                                    }
                                }
                            }
                        )
                    } else {
                        dispatch(switchHide())
                        dispatch(valueLoading(false))
                        if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                            Modal.info({
                                title: '命令发送被系统舍弃',
                                content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                                onOk: () => {
                                    showUpdateTokenModal()
                                }
                            })
                        } else {
                            if (localStorage.getItem('hideLoading') != 1) {
                                Modal.error({
                                    title: '提示',
                                    content: serverData.msg
                                })
                            }
                        }
                    }
                }
            )
        } else {
            return alternateWrite(pointName, valueList, description, dispatch)
        }
    }
}

function alternateWrite(pointList, valueList, description, dispatch) {
    let newPointList = []
    let newValueList = []
    let nextPointList = []
    let nextValueList = []
    pointList.map((item, index) => {
        if (!newPointList.includes(item)) {
            newPointList.push(item)
            newValueList.push(valueList[index])
        } else {
            nextPointList.push(item)
            nextValueList.push(valueList[index])
        }
    })
    http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
        token: appConfig.token,
        pointList: newPointList,
        valueList: newValueList,
        waitSuccess: nextPointList.length > 0 ? 1 : 0,
        addOperationLog: 1,
        clickEventDesc: description,
        userName: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
        source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
        onduty: appConfig.onduty,
        cloudUserId: appConfig.cloudUser.cloudUserId,
        projectId: appConfig.projectId
    }).then(
        res => {
            if (res.err === 0) {
                if (nextPointList.length > 0) {
                    alternateWrite(nextPointList, nextValueList, description, dispatch)
                } else {
                    dispatch(switchHide())
                    dispatch(valueLoading(false))
                }
            } else {
                dispatch(switchHide())
                dispatch(valueLoading(false))
                if (res.msg == 'token已过期' || res.msg == 'token无效') {
                    Modal.info({
                        title: '命令发送被系统舍弃',
                        content: '原因：' + res.msg + '，请重新登录验证获取token后继续尝试',
                        onOk: () => {
                            showUpdateTokenModal()
                        }
                    })
                } else {
                    if (localStorage.getItem('hideLoading') != 1) {
                        Modal.error({
                            title: '提示',
                            content: res.msg
                        })
                    }
                }
            }
        }
    )
}

//设备开关的刷新检查
export function refreshSwitch(pointName, value) {
    return function (dispatch, getState) {
        //得到后台更新的点值,对比,2s循环检测，正确后结束loading
        new CheckWorker(function (info, next, stop) {
            http.post('/get_realtimedata', {
                pointList: pointName,
                proj: 1,
                ...(language == 'en' ? { "lan": "en" } : {})
            }).then(
                data => {
                    let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
                    if (diffData != value) {
                        //执行下一次check，触发progress事件
                        //如果达到设置的check次数，会还会触发complete
                        next();
                    } else {
                        // 直接停止，无需执行下一次 check
                        // 会触发 progress 和 stop 事件

                        dispatch(switchHide());
                        dispatch(valueLoading(false))
                        stop();
                    }
                }
            )
        }, {
            // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
        })
            .on('progress', function ({ progress }) { console.info('progress', progress) })
            .on('stop', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送成功'))
            })
            .on('complete', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送失败，请重试。'))
            })
            .start()
    }
}


//优化选项设置
export function checkboxSetting(idCom, setValue, text, unsetValue, checkboxState, currentValue) {
    let pointName = [idCom]
    var nextValue, fromValue
    return function (dispatch, getState) {
        let secModal = getState().secModal
        // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
        if (secModal.isLoading) {
            //syncFunc in utils
            return syncFunc(() => {
                dispatch(checkboxHide())
            }).then(
                first => {
                    first()
                }
            ).then(
                () => {
                    dispatch(valueLoading(false));
                }
            )
        }
        dispatch(getOperateData(true, ''))
        return http.post('/pointData/getRealtime', {
            pointList: [idCom]
        }).then(
            data => {
                if (localStorage.getItem('hideLoading') == 1) {
                    dispatch(checkboxHide())
                }
                let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
                if (diffData == parseInt(setValue)) { //如果点击的时候点值等于自带的setvalue就表示要取消选中
                    // nextValue = unsetValue.toString();
                    // fromValue = parseInt(setValue).toString()
                    nextValue = parseInt(unsetValue).toString()
                    fromValue = parseInt(currentValue).toString()
                } else if (diffData == '') { //如果点击的时候点值等于 ‘’ 就表示要选中
                    //  nextValue = parseInt(setValue).toString()
                    //  fromValue = unsetValue.toString()
                    nextValue = parseInt(setValue).toString()
                    fromValue = parseInt(currentValue).toString()
                } else { //其他都是就表示要选中
                    nextValue = parseInt(setValue).toString()
                    fromValue = parseInt(currentValue).toString()
                    //  nextValue = setValue.toString()
                    //  fromValue = unsetValue.toString()
                }
                http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
                    token: appConfig.token,
                    pointList: [idCom],
                    valueList: [nextValue],
                    source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
                }).then(
                    serverData => {
                        if (serverData.err === 0) {
                            if (localStorage.getItem('hideLoading') != 1) {
                                dispatch(valueLoading(true));
                                dispatch(refreshCheckbox(pointName, nextValue, idCom, text));
                            }
                            http.post('/get_realtimedata', {
                                pointList: [idCom],
                                proj: 1,
                                ...(language == 'en' ? { "lan": "en" } : {})
                            }).then(
                                pointData => {
                                    if (pointData[0]) {
                                        //let value = pointData[0] ? pointData[0].value : ''
                                        addOperation('/operationRecord/addChangeValue', {
                                            "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                                JSON.parse(localStorage.getItem('userInfo')).name : '',
                                            "pointName": idCom,
                                            "pointDescription": text,
                                            "valueChangeFrom": fromValue,
                                            "valueChangeTo": nextValue,
                                            "address": localStorage.getItem('serverUrl'),
                                            "lang": "zh-cn"
                                        }, (`${idCom}改值操作记录失败`))
                                    }
                                }
                            )
                        } else if (serverData.err > 0) {
                            if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                                Modal.info({
                                    title: '命令发送被系统舍弃',
                                    content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                                    onOk: () => {
                                        showUpdateTokenModal()
                                    }
                                })
                            } else {
                                Modal.error({
                                    title: '提示',
                                    content: serverData.msg
                                })
                            }
                        }
                    }
                )
            }
        );
    }
}
//主页面checkbox设置(作废)
export function checkboxMainSetting(idCom, setValue, description) {
    //往后台传的都是数组格式
    let valueList = []
    if (setValue !== 'undefined') {
        valueList.push(setValue.toString())
    }
    let pointName = []
    if (idCom) {
        pointName.push(idCom)
    }
    return function (dispatch, getState) {
        return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
            token: appConfig.token,
            pointList: pointName,
            valueList: valueList,
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            serverData => {
                if (serverData.err === 0) {
                    dispatch(valueLoading(true));
                    dispatch(refreshCheckbox(pointName, valueList[0]))
                    //获取点名的对应信息
                    http.post('/analysis/get_point_info_from_s3db', {
                        pointList: [idCom],
                        "lan": language
                    }).then(
                        pointData => {
                            if (pointData.status) {
                                // console.info( pointData["data"]  )
                                let value = pointData[0] ? pointData[0].value : ''
                                addOperation("/operationRecord/addChangeValue", {
                                    "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                        JSON.parse(localStorage.getItem('userInfo')).name : '',
                                    "pointName": idCom,
                                    "pointDescription": description,
                                    "valueChangeFrom": value,
                                    "valueChangeTo": setValue.toString(),
                                    "address": localStorage.getItem('serverUrl'),
                                    "lang": "zh-cn"
                                }, idCom + '改值操作记录失败')
                            }
                        }
                    )
                } else {
                    if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                        Modal.info({
                            title: '命令发送被系统舍弃',
                            content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                            onOk: () => {
                                showUpdateTokenModal()
                            }
                        })
                    } else {
                        Modal.error({
                            title: '提示',
                            content: serverData.msg
                        })
                    }
                }
            }
        )
    }
}

//优化选项的刷新检查
export function refreshCheckbox(pointName, value) {
    return function (dispatch, getState) {
        new CheckWorker(function (info, next, stop) {
            http.post('/get_realtimedata', {
                pointList: pointName,
                proj: 1,
                ...(language == 'en' ? { "lan": "en" } : {})
            }).then(
                data => {
                    let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
                    if (diffData != value) {
                        //执行下一次check，触发progress事件
                        //如果达到设置的check次数，会还会触发complete
                        next();
                    } else {
                        // 直接停止，无需执行下一次 check
                        // 会触发 progress 和 stop 事件
                        dispatch(checkboxHide());
                        dispatch(valueLoading(false));
                        stop();
                    }
                }
            )
        }, {
            // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
        })
            .on('progress', function ({ progress }) { console.info('progress', progress) })
            .on('stop', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送成功'))
            })
            .on('complete', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送失败，请重试。'))
            })
            .start()
    }
}



//优化设置值模块
export function optimizeSetting(data, idCom) {
    //往后台传的都是数组格式
    let setValue = []

    if (data.settingValue !== 'undefined') {
        setValue.push(String(data.settingValue))
    }
    let pointName = []
    if (idCom) {
        pointName.push(idCom)
    }
    console.info(data, idCom)
    return function (dispatch, getState) {
        let secModal = getState().secModal
        // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
        if (secModal.isLoading) {
            //syncFunc in utils
            return syncFunc(() => {
                dispatch(hideModal())
            }).then(
                first => {
                    first()
                }
            ).then(
                () => {
                    dispatch(valueLoading(false));
                }
            )
        }
        dispatch(getOperateData(true, ''))
        return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
            token: appConfig.token,
            pointList: pointName,
            valueList: setValue,
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            serverData => {
                if (localStorage.getItem('hideLoading') == 1) {
                    dispatch(hideModal())
                }
                if (serverData.err === 0) {
                    if (localStorage.getItem('hideLoading') != 1) {
                        dispatch(valueLoading(true));
                        dispatch(refreshData(pointName, setValue[0]))
                    }
                    //获取点名的对应信息
                    http.post('/analysis/get_point_info_from_s3db', {
                        pointList: [idCom],
                        "lan": language
                    }).then(
                        pointData => {
                            if (pointData.status) {
                                // console.info( pointData["data"]  )
                                let description = pointData.data[idCom] ? pointData.data[idCom].description : ''

                                addOperation('/operationRecord/addChangeValue', {
                                    "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                        JSON.parse(localStorage.getItem('userInfo')).name : '',
                                    "pointName": idCom,
                                    "pointDescription": description,
                                    "valueChangeFrom": data.currentValue,
                                    "valueChangeTo": data.settingValue,
                                    "address": localStorage.getItem('serverUrl'),
                                    "lang": "zh-cn"
                                }, idCom + '改值操作记录失败')
                            }
                        }
                    )
                } else if (serverData.err > 0) {
                    if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                        Modal.info({
                            title: '命令发送被系统舍弃',
                            content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                            onOk: () => {
                                showUpdateTokenModal()
                            }
                        })
                    } else {
                        Modal.error({
                            title: '提示',
                            content: serverData.msg
                        })
                    }
                }
            }
        )
    }
}

//时间控件修改模块
export function timeSetting(data, idCom, timeFormat) {
    //往后台传的都是数组格式
    let setValue = []

    if (data.settingTime !== 'undefined') {
        setValue.push(moment(data.settingTime).format(timeFormat))
    }
    let pointName = []
    if (idCom) {
        pointName.push(idCom)
    }
    console.info(data, idCom)
    return function (dispatch, getState) {
        let secModal = getState().secModal
        // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
        if (secModal.isLoading) {
            //syncFunc in utils
            return syncFunc(() => {
                dispatch(hideModal())
            }).then(
                first => {
                    first()
                }
            ).then(
                () => {
                    dispatch(valueLoading(false));
                }
            )
        }
        dispatch(getOperateData(true, ''))
        return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
            token: appConfig.token,
            pointList: pointName,
            valueList: setValue,
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            serverData => {
                if (localStorage.getItem('hideLoading') == 1) {
                    dispatch(hideModal())
                }
                if (serverData.err === 0) {
                    if (localStorage.getItem('hideLoading') != 1) {
                        dispatch(valueLoading(true));
                        dispatch(refreshData(pointName, setValue[0]))
                    }
                    //获取点名的对应信息
                    http.post('/analysis/get_point_info_from_s3db', {
                        pointList: [idCom],
                        "lan": language
                    }).then(
                        pointData => {
                            if (pointData.status) {
                                // console.info( pointData["data"]  )
                                let description = pointData.data[idCom] ? pointData.data[idCom].description : ''

                                addOperation('/operationRecord/addChangeValue', {
                                    "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                        JSON.parse(localStorage.getItem('userInfo')).name : '',
                                    "pointName": idCom,
                                    "pointDescription": description,
                                    "valueChangeFrom": '',
                                    "valueChangeTo": data.settingTime,
                                    "address": localStorage.getItem('serverUrl'),
                                    "lang": "zh-cn"
                                }, idCom + '改值操作记录失败')
                            }
                        }
                    )
                } else if (serverData.err > 0) {
                    if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                        Modal.info({
                            title: '命令发送被系统舍弃',
                            content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                            onOk: () => {
                                showUpdateTokenModal()
                            }
                        })
                    } else {
                        Modal.error({
                            title: '提示',
                            content: serverData.msg
                        })
                    }
                }
            }
        )
    }
}



//动态表格一键改值
export function tableOneClick(valueList) {
    return function (dispatch, getState) {
        const { settingValue, idCom, firstKey, secondKey, pointvalue, clickAll } = valueList
        const { customList } = Object.assign({}, { customList: getState().observer.customList })

        let setValue = [], pointName = [], cur = [], obj = { name: idCom, value: '' }, data = [];
        // 根据idCom获取到是哪一个表格需要改值
        cur = customList.filter(o => {
            if (o.idCom === idCom) return o
        })
        let copyPointValue = pointvalue

        //如果只是点击修改某一个值，才执行以下赋值语句
        if (!clickAll) {
            copyPointValue[firstKey][Number(secondKey)] = settingValue
        }

        if (copyPointValue) {
            setValue.push(JSON.stringify({ "data": copyPointValue }))
            obj.value = JSON.stringify({ "data": copyPointValue })
            data.push(obj)
            dispatch(saveCustomTableData(data))
        }

        if (idCom) {
            pointName.push(idCom)
        }
        let setObj = {
            pointList: pointName,
            valueList: setValue
        }
        dispatch(saveSetCustomTableData(setObj))
        dispatch(isSettingFun(true))

    }
}

//动态表格一键改值时的loading
export function tableLoadingFun(tableLoading) {
    return {
        type: TABLE_LOADING,
        tableLoading
    }
}



//动态表格模态框改值 （schedule排班组件的action）
export function tableCellSetting(data, idCom, defaultValue) {
    return function (dispatch, getState) {
        const { firstKey, secondKey, pointvalue } = getState().secModal.props
        const { customList } = Object.assign({}, { customList: getState().observer.customList })
        data = JSON.stringify(data) === '{}' ? defaultValue : data

        let setValue = [], pointName = [], cur = [];
        // 根据idCom获取到是哪一个表格需要改值
        cur = customList.filter(o => {
            if (o.idCom === idCom) return o
        })
        let copyPointValue = pointvalue

        copyPointValue[firstKey][Number(secondKey)] = data.settingValue

        if (copyPointValue) {
            setValue.push(JSON.stringify({ "data": copyPointValue }))
        }

        if (idCom) {
            pointName.push(idCom)
        }
        let secModal = getState().secModal
        // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
        if (secModal.isLoading) {
            //syncFunc in utils
            return syncFunc(() => {
                dispatch(hideModal())
            }).then(
                first => {
                    first()
                }
            ).then(
                () => {
                    dispatch(valueLoading(false));
                }
            )
        }
        dispatch(getOperateData(true, ''))
        return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
            token: appConfig.token,
            pointList: pointName,
            valueList: setValue,
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            serverData => {
                if (serverData.err === 0) {
                    //dispatch(valueLoading(true));
                    //dispatch(refreshData(pointName,setValue[0]))
                    dispatch(getCustomTableData(idCom))
                    dispatch(hideModal())
                    //获取点名的对应信息
                    http.post('/analysis/get_point_info_from_s3db', {
                        pointList: [idCom],
                        "lan": language
                    }).then(
                        pointData => {
                            if (pointData.status) {
                                console.info(JSON.stringify(cur[0].pointvalue), JSON.stringify(copyPointValue))
                                // console.info( pointData["data"]  )
                                let description = pointData.data[idCom] ? pointData.data[idCom].description : ''
                                addOperation('/operationRecord/addChangeValue', {
                                    "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                        JSON.parse(localStorage.getItem('userInfo')).name : '',
                                    "pointName": idCom,
                                    "pointDescription": description,
                                    "valueChangeFrom": JSON.stringify(cur[0].pointvalue),
                                    "valueChangeTo": JSON.stringify(copyPointValue),
                                    "address": localStorage.getItem('serverUrl'),
                                    "lang": "zh-cn"
                                }, idCom + '改值操作记录失败')
                            }
                        }
                    )
                } else if (serverData.err > 0) {
                    if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                        Modal.info({
                            title: '命令发送被系统舍弃',
                            content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                            onOk: () => {
                                showUpdateTokenModal()
                            }
                        })
                    } else {
                        Modal.error({
                            title: '提示',
                            content: serverData.msg
                        })
                    }
                }
            }
        )
    }
}

//新table表格模态框改值
export function newTableCellSetting(data, idCom, defaultValue) {
    return function (dispatch, getState) {
        const { firstKey, secondKey, pointvalue } = getState().secModal.props
        const { customList } = Object.assign({}, { customList: getState().observer.customList })
        data = JSON.stringify(data) === '{}' ? defaultValue : data

        let setValue = [], pointName = [], cur = [];
        // 根据idCom获取到是哪一个表格需要改值
        cur = customList.filter(o => {
            if (o.idCom === idCom) return o
        })
        let copyPointValue = pointvalue

        copyPointValue[firstKey][Number(secondKey)] = data.settingValue

        if (copyPointValue) {
            setValue.push(JSON.stringify({ "data": copyPointValue }))
        }

        if (idCom) {
            pointName.push(idCom)
        }
        let secModal = getState().secModal
        // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
        if (secModal.isLoading) {
            //syncFunc in utils
            return syncFunc(() => {
                dispatch(hideModal())
            }).then(
                first => {
                    first()
                }
            ).then(
                () => {
                    dispatch(valueLoading(false));
                }
            )
        }
        dispatch(getOperateData(true, ''))
        return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
            token: appConfig.token,
            pointList: pointName,
            valueList: setValue,
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            serverData => {
                if (localStorage.getItem('hideLoading') == 1) {
                    dispatch(hideModal())
                }
                if (serverData.err === 0) {
                    if (localStorage.getItem('hideLoading') != 1) {
                        dispatch(valueLoading(true));
                        dispatch(refreshData(pointName, setValue[0]))
                    }
                    //获取点名的对应信息
                    http.post('/analysis/get_point_info_from_s3db', {
                        pointList: [idCom],
                        "lan": language
                    }).then(
                        pointData => {
                            if (pointData.status) {
                                console.info(JSON.stringify(cur[0].pointvalue), JSON.stringify(copyPointValue))
                                // console.info( pointData["data"]  )
                                let description = pointData.data[idCom] ? pointData.data[idCom].description : ''
                                addOperation('/operationRecord/addChangeValue', {
                                    "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                        JSON.parse(localStorage.getItem('userInfo')).name : '',
                                    "pointName": idCom,
                                    "pointDescription": description,
                                    "valueChangeFrom": JSON.stringify(cur[0].pointvalue),
                                    "valueChangeTo": JSON.stringify(copyPointValue),
                                    "address": localStorage.getItem('serverUrl'),
                                    "lang": "zh-cn"
                                }, idCom + '改值操作记录失败')
                            }
                        }
                    )
                } else if (serverData.err > 0) {
                    if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                        Modal.info({
                            title: '命令发送被系统舍弃',
                            content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                            onOk: () => {
                                showUpdateTokenModal()
                            }
                        })
                    } else {
                        Modal.error({
                            title: '提示',
                            content: serverData.msg
                        })
                    }
                }
            }
        )
    }
}

//报表页面修改历史数据
export function reportCellSetting(data, pointTime, pointName) {
    return function (dispatch, getState) {
        let original = data.currentValue
        let pointValue = data.settingValue
        let userName = localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
            JSON.parse(localStorage.getItem('userInfo')).name : ''
        let refreshReport = getState().observer.refreshReport

        dispatch(valueLoading(true));
        if (pointTime.length == 7) {
            pointTime = pointTime + "-01 00:00:00"
        } else if (pointTime.length == 10) {
            pointTime = pointTime + " 00:00:00"
        }

        http.post('/insert_history_data', {
            pointname: pointName,
            pointtime: pointTime,
            pointvalue: pointValue,
            userid: userName,
            original: original
        }).then(
            data => {
                if (data.err == 0) {
                    refreshReport()
                } else {
                    message.error(data.msg)
                }
                dispatch(hideModal())
                dispatch(valueLoading(false));
            }
        )
    }
}

//刷新数据，检测修改是否与显示的一致
export function refreshData(pointName, value) {
    return function (dispatch, getState) {
        let checkWorker = new CheckWorker(function (info, next, stop) {
            http.post('/get_realtimedata', {
                pointList: pointName,
                proj: 1,
                ...(language == 'en' ? { "lan": "en" } : {})
            }).then(
                data => {
                    let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
                    if (diffData != value) {
                        //执行下一次check，触发progress事件
                        //如果达到设置的check次数，会还会触发complete
                        next();
                    } else {
                        // 直接停止，无需执行下一次 check
                        // 会触发 progress 和 stop 事件
                        dispatch(hideModal());
                        dispatch(valueLoading(false));
                        stop();
                    }
                }
            )
        }, {
            // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
        })

        checkWorker
            .on('progress', function ({ progress }) { console.info('progress', progress) })
            .on('stop', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送成功。'))
            })
            .on('complete', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送失败，请重试。'))
            })
            .start()
    }
}



//设备详情框的设置值模块
export function observerSetting(data, idCom) {
    //往后台传的都是数组格式
    let setValue = []
    if (data.settingValue !== 'undefined') {
        setValue.push(String(data.settingValue))
    }
    let pointName = []
    if (idCom) {
        pointName.push(idCom)
    }
    return function (dispatch, getState) {
        let secModal = getState().secModal
        // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
        if (secModal.isLoading) {
            //syncFunc in utils
            return syncFunc(() => {
                dispatch(textHide())
            }).then(first => {
                first()
            }).then(
                () => {
                    dispatch(valueLoading(false));
                }
            )
        }
        dispatch(getOperateData(true, ''))

        if (localStorage.getItem('hideLoading') == 1) {
            dispatch(textHide())
        } else {
            dispatch(valueLoading(true));
        }

        return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
            token: appConfig.token,
            pointList: pointName,
            valueList: setValue,
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            serverData => {

                // if(serverData.err===0) {
                if (localStorage.getItem('hideLoading') != 1) {
                    dispatch(refreshObserverData(pointName, setValue[0]))
                }
                //获取点名的对应信息
                http.post('/analysis/get_point_info_from_s3db', {
                    pointList: [idCom],
                    lan: language
                }).then(
                    pointData => {
                        if (pointData.status) {
                            console.info(pointData)
                            let description = pointData.data[idCom] ? pointData.data[idCom].description : ''
                            addOperation("/operationRecord/addChangeValue", {
                                "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                    JSON.parse(localStorage.getItem('userInfo')).name : '',
                                "pointName": idCom,
                                "pointDescription": description,
                                "valueChangeFrom": data.currentValue,
                                "valueChangeTo": data.settingValue,
                                "address": localStorage.getItem('serverUrl'),
                                "lang": "zh-cn"
                            }, idCom + '改值操作记录失败')
                        }
                    }
                )
            }
            //  else if (serverData.err > 0) {
            // message.error(serverData.msg)
            // }
            // }
        ).catch(
            err => {
                message.error(err.msg)
            }
        )
    }
}

//设备详情框-刷新数据，检测修改是否与显示的一致
export function refreshObserverData(pointName, value) {
    return function (dispatch, getState) {

        new CheckWorker(function (info, next, stop) {
            http.post('/get_realtimedata', {
                pointList: pointName,
                proj: 1,
                ...(language == 'en' ? { "lan": "en" } : {})
            }).then(
                data => {
                    let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
                    if (diffData != value) {
                        //执行下一次check，触发progress事件
                        //如果达到设置的check次数，会还会触发complete
                        next();
                    } else {
                        // 直接停止，无需执行下一次 check
                        // 会触发 progress 和 stop 事件
                        dispatch(textHide());
                        dispatch(valueLoading(false));
                        stop();
                    }
                }
            )
        }, {
            // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
        })
            .on('progress', function ({ progress }) { console.info('progress', progress) })
            .on('stop', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送成功'))
            })
            .on('complete', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送失败，请重试。'))
            })
            .start()
    }
}

//设备详情中所有设置值的模态框-设置值
//兼设备详情中启用／禁用单选按钮的模态框-设置值
//兼设备详情里的控制模式选项的模态框-设置值
export function textSetting(idCom, setValue, description) {
    if (setValue === undefined) {
        message.error('请输入要设置的值！')
    } else {
        return function (dispatch, getState) {
            let secModal = getState().secModal
            // 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
            if (secModal.isLoading) {
                //syncFunc in utils
                return syncFunc(function () {
                    dispatch(selectHide());
                    dispatch(textHide());
                    dispatch(radioHide());
                }).then(first => {
                    first()
                }).then(
                    () => {
                        dispatch(valueLoading(false));
                    }
                )
            }
            dispatch(getOperateData(true, ''))
            return http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
                token: appConfig.token,
                pointList: [idCom],
                valueList: [setValue.toString()],
                source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
                userName: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
            }).then(
                serverData => {
                    if (localStorage.getItem('hideLoading') == 1) {
                        dispatch(selectHide());
                        dispatch(textHide());
                        dispatch(radioHide());
                    }
                    if (serverData.err === 0) {
                        if (localStorage.getItem('hideLoading') != 1) {
                            dispatch(valueLoading(true));
                            dispatch(refreshText([idCom], setValue.toString(), description))
                        }
                    } else if (serverData.err > 0) {
                        if (serverData.msg == 'token已过期' || serverData.msg == 'token无效') {
                            Modal.info({
                                title: '命令发送被系统舍弃',
                                content: '原因：' + serverData.msg + '，请重新登录验证获取token后继续尝试',
                                onOk: () => {
                                    showUpdateTokenModal()
                                }
                            })
                        } else {
                            Modal.error({
                                title: '提示',
                                content: serverData.msg
                            })
                        }
                    }
                }
            )
        }
    }
}



//设备详情中所有设置值的模态框-刷新检测
//兼设备详情中启用／禁用单选按钮的模态框-刷新检测
//兼设备详情里的控制模式选项的模态框-刷新检测
export function refreshText(pointName, value, description) {
    return function (dispatch, getState) {

        new CheckWorker(function (info, next, stop) {
            http.post('/get_realtimedata', {
                pointList: pointName,
                proj: 1,
                ...(language == 'en' ? { "lan": "en" } : {})
            }).then(
                data => {

                    let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
                    if (diffData != value) {
                        //执行下一次check，触发progress事件
                        //如果达到设置的check次数，会还会触发complete
                        next();
                    } else {
                        dispatch(valueLoading(false));
                        if (getState().secModal.textVisible) {
                            addOperation('/operationRecord/addChangeValue', {
                                "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                    JSON.parse(localStorage.getItem('userInfo')).name : '',
                                "pointName": pointName[0],
                                "pointDescription": ' ',
                                "valueChangeFrom": info,
                                "valueChangeTo": value,
                                "address": localStorage.getItem('serverUrl'),
                                "lang": "zh-cn"
                            }, pointName[0] + '改值操作记录失败')
                        } else {
                            if (getState().secModal.radioVisible) {
                                addOperation('/operationRecord/add', {
                                    "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                        JSON.parse(localStorage.getItem('userInfo')).name : '',
                                    "content": description,
                                    "valueChangeFrom": parseInt(value) ? '0' : '1',
                                    "address": ''
                                }, description + '改值操作记录失败')
                            } else {
                                if (getState().secModal.selectVisible) {

                                    addOperation('/operationRecord/addChangeValue', {
                                        "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                                            JSON.parse(localStorage.getItem('userInfo')).name : '',
                                        "pointName": pointName[0],
                                        "pointDescription": '是否故障',
                                        "valueChangeFrom": parseInt(value) ? '0' : '1',
                                        "valueChangeTo": value,
                                        "address": localStorage.getItem('serverUrl'),
                                        "lang": "zh-cn"
                                    }, pointName[0] + '改值操作记录失败')
                                }
                            }
                        }
                        dispatch(textHide());
                        dispatch(radioHide());
                        dispatch(selectHide());
                        dispatch(valueLoading(false))
                        stop();
                    }
                }
            )
        }, {
            // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
        })
            .on('progress', function ({ progress }) { console.info('progress', progress) })
            .on('stop', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送成功'))
            })
            .on('complete', function ({ progress }) {
                dispatch(getOperateData(false, '指令发送失败，请重试。'))
            })
            .start()
    }
}



//正在设置值
export function valueLoading(isLoading) {
    return {
        type: VALUE_LOADING,
        isLoading
    }
}

//保存observerModalParms
export function observerModalDict(modalDict) {
    return {
        type: OBSERVER_MODAL_DICT,
        modalDict
    }
}

//获取修改点值时的状态
export function getOperateData(status, description) {
    return {
        type: UPDATE_OPERATE_DATA,
        modalConditionDict: {
            status: status,
            description: description || ''
        }
    }
}



export const actions = {
    showModal,
    hideModal,
    hideModalToLayout,
    showPointModal,
    showObserverSecModal,
    showSwitchUserModal,
    showOptimizeModal,
    showTimeModal,
    showOperatingModal,
    showCheckboxModal,
    showSwitch,
    showTimePicker,
    switchHide,
    checkboxHide,
    showOperatingTextModal,
    textHide,
    showRadioModal,
    showSelectControlModal,
    selectHide,
    showSelect
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [RESET]: (state) => {
        return initialState;
    },
    [SHOW_MODAL]: (state, action) => {
        return { ...state, type: action.modalType, props: action.modalProps }
    },
    [HIDE_MODAL]: (state) => {
        return initialState;
    },
    [VALUE_LOADING]: (state, action) => {
        return { ...state, isLoading: action.isLoading }
    },
    [GET_POINT_INFO]: (state, action) => {
        return { ...state, pointInfo: action.pointInfo }
    },
    [GET_DICTBINDSTRING]: (state, action) => {
        return { ...state, dictBindString: action.dictBindString }
    },
    [SHOW_SWITCH]: (state, action) => {
        return { ...state, switchVisible: true, switchData: action.switchData }
    },
    [HIDE_SWITCH]: (state) => {
        return { ...state, switchVisible: false, modalConditionDict: { status: false, description: '' } }
    },
    [SHOW_CHECKBOX]: (state, action) => {
        return { ...state, checkboxVisible: true, checkboxData: action.checkboxData }
    },
    [HIDE_CHECKBOX]: (state) => {
        return { ...state, checkboxVisible: false, modalConditionDict: { status: false, description: '' } }
    },
    [SHOW_TEXT]: (state, action) => {
        return { ...state, textVisible: true, textData: action.textData }
    },
    [HIDE_TEXT]: (state) => {
        return { ...state, textVisible: false, modalConditionDict: { status: false, description: '' }, isLoading: false }
    },
    [SHOW_RADIO]: (state, action) => {
        return { ...state, radioVisible: true, radioData: action.radioData }
    },
    [HIDE_RADIO]: (state) => {
        return { ...state, radioVisible: false, modalConditionDict: { status: false, description: '' } }
    },
    [SHOW_SELECT]: (state, action) => {
        return { ...state, selectVisible: true, selectData: action.selectData }
    },
    [HIDE_SELECT]: (state) => {
        return { ...state, selectVisible: false, modalConditionDict: { status: false, description: '' } }
    },
    [SHOW_ALARM]: (state, action) => {
        return { ...state, alarmVisible: true, alarmData: action.alarmData }
    },
    [HIDE_ALARM]: (state) => {
        return { ...state, alarmVisible: false, modalConditionDict: { status: false, description: '' } }
    },
    [OBSERVER_MODAL_DICT]: (state, action) => {
        return { ...state, modalDict: action.modalDict }
    },
    [UPDATE_OPERATE_DATA]: (state, action) => {
        return { ...state, modalConditionDict: action.modalConditionDict }
    },
    [TABLE_LOADING]: (state, action) => {
        return { ...state, tableLoading: action.tableLoading }
    },
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
    type: null,
    props: {},
    isLoading: false,
    //pointInfo: '',
    pointInfo: {},
    dictBindString: {},
    switchVisible: false,
    switchData: {},
    checkboxVisible: false,
    checkboxData: {},
    textVisible: false,
    textData: {},
    radioVisible: false,
    radioData: {},
    selectVisible: false,
    selectData: {},
    alarmVisible: false,
    alarmData: {},
    modalDict: {},
    modalConditionDict: {
        status: false,
        description: ''
    },
    tableLoading: false
};
export default function homeReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}
