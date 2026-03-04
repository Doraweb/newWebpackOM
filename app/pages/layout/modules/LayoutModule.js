import http from '../../../common/http';
import { modalTypes } from '../../../common/enum'
import { message, Modal } from 'antd'
import moment from 'moment'
import { history } from '../../../index';
import { addOperation } from '../../../common/utils'
import { closeAppWindow } from '../../../core/cmdRenderer'
import { func } from 'prop-types';
import { stat } from 'fs';
import { hideModalToLayout } from '../../modal/modules/ModalModule';
import appConfig from '../../../common/appConfig';
import { CHANGE_RECONNECT_MODAL_VISIBLE } from './ReconnectionModule';
// ------------------------------------
// Constants
// ------------------------------------
export const RESET = 'Layout.RESET';
export const SHOW_MODAL = 'Layout.SHOW_MODAL';
export const SHOW_ALARM_MODAL = 'layout.SHOW_ALARM_MODAL';
export const HIDE_ALARM_MODAL = 'Layout.HIDE_ALARM_MODAL';
export const HIDE_MODAL = 'Layout.HIDE_MODAL';
export const SET_MENUS = 'Layout.SET_MENUS';
export const SET_GROUP_MENUS = 'Layout.SET_GROUP_MENUS';
export const GET_REALTIME_WARNING = 'Layout.GET_REALTIME_WARNING';
export const CHOSED_KEYS = 'Layout.CHOSED_KEYS'
export const SHOW_DEFAULT_PAGE = 'Layout.SHOW_DEFAULT_PAGE';
export const TOGGLE_TIMESHAFT = 'Layout.TOGGLE_TIMESHAFT';
export const TOGLE_DATE_CONFIG = 'Layout.TOGLE_DATE_CONFIG'
export const SAVE_TIME_ARR = 'Layout.SAVE_TIME_ARR'
export const UPDATE_CUR_VALUE = 'Layout.UPDATE_CUR_VALUE'
export const UPDATE_DATA_CONFIG = 'Layout.UPDATE_DATA_CONFIG'
export const SHOW_SWITCH = 'Layout.SHOW_SWITCH'
export const HIDE_SWITCH = 'Layout.HIDE_SWITCH';
export const GET_WORKER_DICT = 'GET_WORKER_DICT';
export const UPDATE_TIME_SHAFT_STATE = 'UPDATE_TIME_SHAFT_STATE';
export const UPDATE_FULL_PAGE = 'UPDATE_FULL_PAGE';
export const SHOW_POINT_MODAL = 'SHOW_POINT_MODAL';
export const HIDE_POINT_MODAL = 'HIDE_POINT_MODAL';
export const ADD_SCHEDULE = "ADD_SCHEDULE";  //新增日程
export const DEL_SCHEDULE = "DEL_SCHEDULE"; //删除日程
export const SCHEDULE_LOADING = 'SCHEDULE_LOADING' //刷新日程
export const RENDER_TABLE = 'RENDER_TABLE' //加载table数据
export const RENDER_DATE = 'RENDER_DATE' //加载日期数据
export const LOADING_DATE = 'LOADING_DATE' //加载日期
export const FETCH_ID = 'FETCH_ID' //获取点位ID
export const SAVE_HEALTH_DATA = 'SAVE_HEALTH_DATA'
export const CHANGE_HEALTH_STATUS = 'CHANGE_HEALTH_STATUS'
export const UPDATE_LOGOUT_LAST_TIME = 'UPDATE_LOGOUT_LAST_TIME'
export const SEARCH_POINT = 'SEARCH_POINT'
export const SECHEDULE_ID = 'SECHEDULE_ID' //添加按钮ID
export const SCENE_LOADING = 'SCENE_LOADING'
export const SAVE_SCENE_LIST = 'SAVE_SCENE_LIST'
export const SAVE_SELECT_LIST_ID = 'SAVE_SELECT_LIST_ID'
export const SAVE_POINTS_DATA = 'SAVE_POINTS_DATA'
export const SAVE_MODEL_LIST = 'SAVE_MODEL_LIST'
export const SAVE_MODEBUTTONS_LIST = 'SAVE_MODEBUTTONS_LIST'
export const MODEL_LOADING = 'MODEL_LOADING'
export const SAVE_MODEL_SELECT_LIST_ID = 'SAVE_MODEL_SELECT_LIST_ID'
export const SAVE_MODEL_CONTENT = 'SAVE_MODEL_CONTENT'
export const MODEL_CONTENT_LOADING = 'MODEL_CONTENT_LOADING'
export const LAYOUT_REPAIR_DARA = 'LAYOUT_REPAIR_DARA'
export const UPDATE_FAULT_NUM = 'UPDATE_FAULT_NUM'
export const IS_DELETED = 'IS_DELETED'
// ------------------------------------
// Actions
// ------------------------------------
let fireTimer
const language = appConfig.language
const isEnglish = language === 'en';

// 文本映射
const textMap = {
	zhCN: {
		workingNormal: '工作正常',
		backendDomcoreEngine: '后台domcore引擎',
		backendDomlogicEngine: '后台domlogic引擎',
		backendHistoryData: '后台历史数据'
	},
	en: {
		workingNormal: 'Working Normal',
		backendDomcoreEngine: 'Backend DOM Core Engine ',
		backendDomlogicEngine: 'Backend DOM Logic Engine ',
		backendHistoryData: 'Backend History Data '
	}
};

const getText = (key) => {
	return textMap[language] ? textMap[language][key] : textMap.zhCN[key];
};

export function initialize(initFlag) {
	return function (dispatch, getState) {
		dispatch(updateLogoutLastTime());
		//获取项目所有点的释义信息
		http.get(`/analysis/get_pointList_from_s3db/1/50000${language == 'en' ? '?lan=en' : ''}`)
			.then(
				data => {
					if (data.status === 'OK') {
						var pointList = [].concat(data['data']['pointList']);
						localStorage.setItem('allPointList', JSON.stringify(pointList));
						appConfig.allPointList = pointList
					}
				}
			).catch(
				err => {
					console.error('初始化-获取点名清单失败!');
				}
			);
		let userId = JSON.parse(window.localStorage.getItem('userData')).id
		//flagNewVersion,版本号标志，1是新版本，支持页面权限设置功能
		let flagNewVersion = JSON.parse(window.localStorage.getItem('flagNewVersion'))
		if (flagNewVersion === 1) {
			return http.get('/get_plant_pagedetails/1/' + userId + (language == 'en' ? '?lan=en' : '')).then(
				data => {
					//关闭模态框
					dispatch(hideModalToLayout())
					if (data.length) {
						dispatch({
							type: SET_MENUS,
							menus: data
						});
						//一级菜单：处理初始化跳转initPageId
						// if(String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId')!=null){
						// 	if( localStorage.getItem('initPageId') == '策略管理'||
						// 		localStorage.getItem('initPageId') == '数据管理'||
						// 		localStorage.getItem('initPageId') == '数据导入管理'||
						// 		localStorage.getItem('initPageId') == '报表进度管理'||
						// 		localStorage.getItem('initPageId') == '点位监控'||
						// 		localStorage.getItem('initPageId') == '日志信息'||
						// 		localStorage.getItem('initPageId') == '全局配置'||
						// 		localStorage.getItem('initPageId') == '策略指令查询'){
						// 		setTimeout(function(){
						// 			history.push('systemToolCx')
						// 		},1000)
						// 	}else{
						// 		history.push("/observer/" + String(localStorage.getItem('initPageId')))
						// 	}
						// }
					} else {
						let Menus = data
						let pageMenus = []
						let userName = JSON.parse(window.localStorage.getItem('userData')).name
						let projectRightsDefine = localStorage.getItem('projectRightsDefine')
						Menus.GroupList.map((item) => {
							item.pageList = item.pageList.filter(item2 => {
								let flag = 0
								if (projectRightsDefine != undefined) {
									let { pageRights, userRights } = JSON.parse(projectRightsDefine)
									if (userRights[userName] && userRights[userName].viewPages && userRights[userName].viewPages.length > 0) {
										flag = 1
										userRights[userName].viewPages.map(pageName => {
											if (item2.name == pageName) {
												flag = 0
											}
										})
									} else {
										for (let item3 in pageRights) {
											if (item3 == item2.name) {
												if (pageRights[item3].blockVisitUsers && pageRights[item3].blockVisitUsers[0] != undefined) {
													pageRights[item3].blockVisitUsers.map(item4 => {
														if (userName == item4) {
															flag = 1
														}
													})
												}
											}
										}
									}
								}
								return flag == 0
							})
							if (item.pageList[0] != undefined) {
								pageMenus.push(item)
							}
						})
						data.GroupList = pageMenus

						if ((data.GroupMenuEnable == true || data.GroupMenuEnable == 1 || data.GroupMenuEnable == 2) && data.GroupList.length) {
							dispatch({
								type: SET_GROUP_MENUS,
								menus: data
							});


							if (String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {
								if (localStorage.getItem('initPageId') == '策略管理' ||
									localStorage.getItem('initPageId') == '数据管理' ||
									localStorage.getItem('initPageId') == '数据导入管理' ||
									localStorage.getItem('initPageId') == '报表进度管理' ||
									localStorage.getItem('initPageId') == '点位监控' ||
									localStorage.getItem('initPageId') == '日志信息' ||
									localStorage.getItem('initPageId') == '全局配置' ||
									localStorage.getItem('initPageId') == '策略指令查询') {
									setTimeout(function () {
										history.push('systemToolCx')
									}, 1000)
								} else {
									history.push("/observer/" + String(localStorage.getItem('initPageId')))
								}
							} else {
								if (localStorage.getItem('creatAppWindow') != undefined && localStorage.getItem('creatAppWindow') == 1) {
									const recentVisitPageId = localStorage.getItem('recentVisitPageId')
									if (recentVisitPageId) {
										history.push("/observer/" + recentVisitPageId);
										localStorage.removeItem('recentVisitPageId')
									} else {
										history.push("/observer/" + data.GroupList[0].pageList[0]['id']);
									}
									localStorage.removeItem('creatAppWindow')
								}
							}

						}
					}
					//打开超时自动退回guest用户
					dispatch(settingLogout())
				}
			).catch(
				err => {
					return false;
				}
			)
		} else {
			return http.get('/get_plant_pagedetails/1' + (language == 'en' ? '?lan=en' : '')).then(
				data => {
					if (data.length) {
						dispatch({
							type: SET_MENUS,
							menus: data
						});
						//一级菜单：处理初始化跳转initPageId
						if (String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {
							if (localStorage.getItem('initPageId') == '策略管理' ||
								localStorage.getItem('initPageId') == '数据管理' ||
								localStorage.getItem('initPageId') == '数据导入管理' ||
								localStorage.getItem('initPageId') == '报表进度管理' ||
								localStorage.getItem('initPageId') == '点位监控' ||
								localStorage.getItem('initPageId') == '日志信息' ||
								localStorage.getItem('initPageId') == '全局配置' ||
								localStorage.getItem('initPageId') == '策略指令查询') {
								setTimeout(function () {
									history.push('systemToolCx')
								}, 1000)
							} else {
								history.push("/observer/" + String(localStorage.getItem('initPageId')))
							}
						}
					} else {
						if ((data.GroupMenuEnable == true || data.GroupMenuEnable == 1 || data.GroupMenuEnable == 2) && data.GroupList.length) {
							dispatch({
								type: SET_GROUP_MENUS,
								menus: data
							});
							if (String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {
								if (localStorage.getItem('initPageId') == '策略管理' ||
									localStorage.getItem('initPageId') == '数据管理' ||
									localStorage.getItem('initPageId') == '数据导入管理' ||
									localStorage.getItem('initPageId') == '报表进度管理' ||
									localStorage.getItem('initPageId') == '点位监控' ||
									localStorage.getItem('initPageId') == '日志信息' ||
									localStorage.getItem('initPageId') == '全局配置' ||
									localStorage.getItem('initPageId') == '策略指令查询') {
									setTimeout(function () {
										history.push('systemToolCx')
									}, 1000)
								} else {
									history.push("/observer/" + String(localStorage.getItem('initPageId')))
								}
							} else {
								const recentVisitPageId = localStorage.getItem('recentVisitPageId')
								if (recentVisitPageId) {
									history.push("/observer/" + recentVisitPageId);
									localStorage.removeItem('recentVisitPageId')
								} else {
									history.push("/observer/" + data.GroupList[0].pageList[0]['id']);
								}
							}
						} else {
							//message.error('设备页面为空，无法查看',2.5)   
							// console.log("设备页面为空，无法查看")       
						}
					}
					//打开超时自动退回guest用户
					dispatch(settingLogout())
				}
			)
		}
	}
}

//试用5分钟
export function onTrial() {
	return function (dispatch, getState) {
		let lastTime = getState().layout.logoutLastTime
		let currentTime = new Date().getTime()
		let timer = setTimeout(function (e) {
			Modal.info({
				title: '信息提示',
				content: '软件试用时间已过，即将退出!',
				onOk: closeAppWindow
			})
		}, 5 * 60 * 1000)
	}
}
//超时自动退回guest用户的计时函数
export function settingLogout() {
	return function (dispatch, getState) {
		var timer = setInterval(function (e) {
			var jsonUserData = undefined;
			var jsonAccountManageConfig = undefined;
			try {
				jsonUserData = JSON.parse(localStorage.getItem('userData')); //localStorage中保存的用户信息结构体
				jsonAccountManageConfig = JSON.parse(localStorage.getItem('accountManageConfig'));//后台自动登出选项配置结构体
			}
			catch (e) {
				// console.log('ERROR in settingLogout JSON.parse');
				return
			}
			if (jsonUserData == undefined || jsonAccountManageConfig == undefined)
				return
			if (jsonUserData.role === 1) {//1代表guest访客，当前已经是访客，那就不需要退回
				return
				// } else if (jsonUserData.role === 4 && jsonAccountManageConfig.auto_log_out === 0 && localStorage.getItem('isOnline') != 1 && appConfig.onduty != 1) {
				// 	let lastTime = getState().layout.logoutLastTime
				// 	let currentTime = new Date().getTime()
				// 	if (currentTime - lastTime > 10 * 60 * 1000) {
				// 		dispatch({
				// 			type: 'TOGGLE_WARNINGMANAGE_MODAL',
				// 			warningManageModalVisible: false
				// 		})
				// 		dispatch(hideModal())
				// 		// console.log("==退出1==")
				// 		dispatch(switchUser("guest", "guest", false, jsonUserData.name))
				// 		window.clearInterval(timer)
				// 		Modal.info({
				// 			title: '信息提示',
				// 			content: '系统过长时间未操作，自动登录guest账号，仅供浏览',
				// 		})
				// 	}
			} else if (jsonAccountManageConfig.auto_log_out === 1
				&& jsonAccountManageConfig.auto_log_out_timeout != undefined
				&& typeof (jsonAccountManageConfig.auto_log_out_timeout) === 'number'
				&& localStorage.getItem('isOnline') != 1 && appConfig.onduty != 1) {
				let logoutTimeout = jsonAccountManageConfig.auto_log_out_timeout
				//分钟数取整
				logoutTimeout = Math.floor(logoutTimeout)
				if (logoutTimeout <= 0) {
					return
				}
				let lastTime = getState().layout.logoutLastTime
				let currentTime = new Date().getTime()
				if (currentTime - lastTime > logoutTimeout * 60 * 1000) {
					dispatch({
						type: 'TOGGLE_WARNINGMANAGE_MODAL',
						warningManageModalVisible: false
					})
					dispatch(hideModal())
					// console.log("==退出2==")
					dispatch(switchUser("guest", "guest", false, jsonUserData.name))
					window.clearInterval(timer)
					Modal.info({
						title: '信息提示',
						content: '系统过长时间未操作，自动登录guest账号，仅供浏览',
					})
				}
			}
			if (localStorage.getItem('fireMode') != undefined && localStorage.getItem('fireMode') == 1) {
				dispatch(switchUser("guest", "guest", false, jsonUserData.name))
				Modal.info({
					title: '火灾警报',
					content: '系统检测到当前处于火灾报警中，自动退出到访客账号，禁止进行操作！',
				})
				let i = 0
				fireTimer = setInterval(() => {
					if (localStorage.getItem('fireMode') != undefined && localStorage.getItem('fireMode') == 0) {
						clearInterval(fireTimer)
						Modal.info({
							title: '火灾警报解除',
							content: '系统检测到火灾警报已经解除，可以正常操作软件!',
						})
					} else {
						i++
						if (i == 6) {
							i = 0
							Modal.destroyAll()
							Modal.info({
								title: '火灾警告',
								content: '系统检测到当前处于火灾报警中，自动退出到访客账号，禁止进行操作！',
							})
						}
					}
				}, 1000 * 10)
			}
		}, 10000);
	}
}

//切换用户
export function switchUser(name, pwd, isRemember, originalName) {
	return function (dispatch, getState) {
		// login valid
		if (name === 'guest' && pwd === 'guest') {
			// 将返回的用户信息（权限，ID，名称）放到 localStorage 里
			window.localStorage.setItem('userData', JSON.stringify({
				id: 9999,
				name: name,
				role: 1
			}));
			appConfig.userData = {
				id: 9999,
				name: name,
				role: 1
			}
			if (isRemember) {
				// 将用户名和密码存储到 localStorage 中
				window.localStorage.setItem('userInfo', JSON.stringify({
					name: name,
					pwd: pwd,
					isRemember: isRemember
				}));
			} else {
				window.localStorage.setItem('userInfo', JSON.stringify({
					name: name,
					pwd: "",
					isRemember: false
				}))
			}
			addOperation('/operationRecord/addLogin', {
				"userName": originalName,
				"type": 0,
				"address": '',
				"lang": "zh-cn"
			}, '用户登录记录失败')
			dispatch(initialize(true))
		}
	}
}

export function updateLogoutLastTime() {
	return {
		type: UPDATE_LOGOUT_LAST_TIME,
		time: new Date().getTime()
	}
}

export function refreshRealWarning(data) {
	return {
		type: GET_REALTIME_WARNING,
		data
	}
}

//添加日程的id
export function AddIdSchedule(id) {
	return {
		type: SECHEDULE_ID,
		CheckId: id
	}
}

//添加日程
export function addSchedule(values) {
	return function (dispatch, getstate) {
		return http.post('/schedule/add', {
			"scheduleName": values[0],
			"userName": values[1],
			"pointDefines": values[2],
			"isloop": values[3]
		}).then(
			data => {
				dispatch(searchSchedule())
			}
		)
	}
}
//修改日程
export function editSchedule(values) {
	return function (dispatch) {
		return http.post('/schedule/edit', {
			"id": values[0],
			"scheduleName": values[1],
			"pointDefines": values[2],
			"isloop": values[3]
		}).then(
			data => {
				dispatch(searchSchedule())
			}
		)
	}
}
//搜索刷新 
export function searchSchedule() {
	return function (dispatch, getstate) {
		dispatch(scheduleLoading(true))
		return http.get('/schedule/getscheduleList').
			then(
				data => {
					dispatch(renderTbale(data))
					dispatch(scheduleLoading(false))
				}
			)
	}
}
//删除日程
export function delSchedule(selectId) {
	return function (dispatch, getstate) {
		dispatch(loadDate(true))
		return http.post('/schedule/remove', {
			"id": selectId
		}).then(
			data => {
				dispatch(renderDate([]))
				dispatch(searchSchedule())
				dispatch(loadDate(false))
			}
		)
	}
}
//查询五分钟内实时报警
export function searchPoint(value, startTime, endTime) {
	return function (dispatch, getState) {
		dispatch(scheduleLoading(true))
		return http.post('/warning/getHistory', {
			timeFrom: startTime, //变量
			timeTo: endTime,
			lan: language
		}).then(
			data => {
				dispatch(searchPointData(data))
				dispatch(scheduleLoading(false))
			}
		)
	}
}
export function searchPointData(data) {
	return {
		type: SEARCH_POINT,
		warningData: data
	}
}
//loading日程
export function scheduleLoading(loading) {
	return {
		type: SCHEDULE_LOADING,
		scheduleLoading: loading
	}
}
//加载日程数据
export function renderTbale(data) {
	return {
		type: RENDER_TABLE,
		data: data
	}
}
//禁止或者启用
export function useSchedule(id, num) {
	return function (dispatch) {
		return http.post('/schedule/enableSchedule', {
			"id": id,
			"enable": num
		}).then(
			data => {
				dispatch(searchSchedule())
			}
		)
	}
}
//点击每一个点位请求数据
export function obtainSchedule(id) {
	return function (dispatch) {
		dispatch(loadDate(true))
		return http.post('/schedule/simpleGetScheduleTaskByGroupId/v2', {
			"groupid": id
		}).then(
			data => {
				dispatch(renderDate(data))
				dispatch(loadDate(false))
			}
		)
	}
}
//获取点位的id
export function fetchID(id) {
	return {
		type: FETCH_ID,
		id: id
	}
}
//确认修改
export function ModifySchedule(id, content) {
	return function (dispatch) {
		dispatch(loadDate(true))
		return http.post('/schedule/simpleEditWeeks/v2', {
			"groupid": id,
			"content": content
		}).then(
			data => {
				dispatch(obtainSchedule(id))
				dispatch(loadDate(false))
			}
		)
	}
}
//渲染数据 
export function renderDate(data) {
	return {
		type: RENDER_DATE,
		data: data
	}
}
//loading日期
export function loadDate(loading) {
	return {
		type: LOADING_DATE,
		loadDate: loading
	}
}
//保存选中的li的索引
export function refreshChoseKey(key) {
	return {
		type: CHOSED_KEYS,
		key
	}
}

//保存worker方法
export function getWorkerDict(workerDict) {
	return {
		type: GET_WORKER_DICT,
		workerDict
	}
}

//实时报警的分组
export function getWarningGroupList() {
	return function (dispatch, getState) {
		let realtimeWarningPoint = getState().layout.realtimeWarningData[0].strBindPointName
		return http.post('/warningConfig/getGroupList', {
			pointname: realtimeWarningPoint,
			type: 0
		}).then(
			data => {
				// console.log(data);
			}
		)
	}
}

//添加场景
export function addScene(values) {
	return function (dispatch, getstate) {
		return http.post('/env/create', {
			lan: language,
			name: values.sceneName,
			description: values.sceneDescription,
			creator: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
				JSON.parse(localStorage.getItem('userInfo')).name : '',
			tags: values.sceneTag,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				dispatch(getSceneList("add"))
				if (!data.err) {
					return true
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: language == 'en' ? 'Failed to add the scene' : '新建场景失败:' + data.msg
					})
					return false
				}
			}
		).catch(
			() => {

			}
		)
	}
}

//获取所有场景列表 
export function getSceneList(flag) {
	return function (dispatch, getstate) {
		dispatch(sceneLoading(true))
		return http.get(language == 'en' ? '/env/getAll?lan=en' : '/env/getAll').
			then(
				data => {
					if (!data.err) {
						dispatch(saveSceneList(data.data))
						if (flag == "add") {
							dispatch(saveSceneListId([(data.data[data.data.length - 1].id)], data.data[data.data.length - 1].name))
						}
					} else {
						Modal.error({
							title: language == 'en' ? 'Alert' : '警告',
							content: language == 'en' ? 'Failed to retrieve the scene list' : '获取场景列表失败'
						})
					}
					dispatch(sceneLoading(false))
				}
			).catch(
				() => {
					dispatch(sceneLoading(false))

				}
			)
	}
}

//修改场景列表
export function editScene(id, values) {
	return function (dispatch, getstate) {
		return http.post('/env/edit', {
			lan: language,
			id: id,
			name: values.sceneName,
			description: values.sceneDescription,
			creator: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
				JSON.parse(localStorage.getItem('userInfo')).name : '',
			tags: values.sceneTag,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					dispatch(getSceneList())
					getstate().layout.sceneListSelectedId = []
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: language == 'en' ? 'Failed to modify the scene' : '修改场景失败'
					})
				}
			}
		).catch(
			() => {

			}
		)
	}
}

//保存场景列表数据
export function saveSceneList(data) {
	return {
		type: SAVE_SCENE_LIST,
		data: data
	}
}

//保存场景列表的选中id
export function saveSceneListId(id, name) {
	return {
		type: SAVE_SELECT_LIST_ID,
		sceneListSelectedId: id,
		sceneListSelectedName: name
	}
}

//删除场景
export function delScene(selectId) {
	return function (dispatch, getstate) {
		dispatch(loadDate(true))
		return http.post('/env/remove', {
			id: selectId,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					dispatch(isDeleted(true))
					dispatch(getSceneList())
					getstate().layout.sceneListSelectedId = []
					getstate().layout.sceneListSelectedName = ''
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: language == 'en' ? 'Failed to delete the scene' : '删除场景失败'
					})
				}
				//dispatch(renderDate([]))

				dispatch(loadDate(false))
			}
		).catch(
			() => {

			}
		)
	}
}

export function savePoint(pointValue, pointName, selectedId, hideLoadTable) {
	return function (dispatch, getstate) {
		dispatch(loadDate(true))
		return http.post('/env/saveContent', {
			id: selectedId,
			pointNameList: pointName,
			pointValueList: pointValue,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					Modal.success({
						title: language == 'en' ? 'Reminder' : '提示',
						content: data.msg
					})
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
				//dispatch(renderDate([]))

				dispatch(loadDate(false))
				hideLoadTable()
			}
		).catch(
			() => {
				hideLoadTable()
			}
		)
	}
}

//切换场景时，保存场景内容
export function changeSceneSavePoint(pointValue, pointName, selectedId) {
	return function (dispatch, getstate) {
		dispatch(loadDate(true))
		return http.post('/env/saveContent', {
			id: selectedId,
			pointNameList: pointName,
			pointValueList: pointValue,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
			}
		).catch(
			() => {

			}
		)
	}
}

export function preSavePoint(pointValue, pointName, selectedId) {
	return function (dispatch, getstate) {
		dispatch(loadDate(true))
		return http.post('/env/saveContent', {
			id: selectedId,
			pointNameList: pointName,
			pointValueList: pointValue,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					Modal.success({
						title: language == 'en' ? 'Reminder' : '提示',
						content: data.msg,
						onOk() {
							dispatch(hideModal())
						}
					})
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
				//dispatch(renderDate([]))      
			}
		).catch(
			() => {

			}
		)
	}
}

//仿真请求
export function handleSimulation(id) {
	return function (dispatch, getstate) {
		//dispatch(loadDate(true))    
		return http.post('/env/loadSimulation', {
			"envId": id
		}).then(
			data => {
				if (!data.err) {
					Modal.success({
						title: language == 'en' ? 'Reminder' : '提示',
						content: language == 'en' ? 'Simulation successful' : '仿真成功'
					})
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
			}
		).catch(
			() => {
			}
		)
	}
}

export function searchList(keyList) {
	return function (dispatch, getstate) {
		//dispatch(loadDate(true))    
		return http.post('/env/keywordSearch', {
			keyword: keyList,
			lan: language
		})
			.then(
				data => {
					if (!data.err) {
						dispatch(saveSceneList(data.data))
					} else {
						Modal.error({
							title: language == 'en' ? 'Alert' : '警告',
							content: language == 'en' ? 'Failed to search the scene list' : '搜索场景列表失败'
						})
					}
					dispatch(sceneLoading(false))
				}
			).catch(
				() => {
					dispatch(sceneLoading(false))

				}
			)
	}
}

//loading场景列表
export function sceneLoading(loading) {
	return {
		type: SCENE_LOADING,
		sceneLoading: loading
	}
}

export function savePointsData(data) {
	return {
		type: SAVE_POINTS_DATA,
		data
	}
}

//添加模式
export function addModel(values) {
	return function (dispatch, getstate) {
		return http.post('/mode/create', {
			lan: language,
			type: Number(values.modelType),
			name: values.modelName,
			description: values.modelDescription,
			creator: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
				JSON.parse(localStorage.getItem('userInfo')).name : '',
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				dispatch(getModelList())
				if (!data.err) {
					return true
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
					return false
				}
			}
		).catch(
			() => {

			}
		)
	}
}

//复制模式
export function copyModel(id, values) {
	return function (dispatch, getstate) {
		return http.post('/mode/copyOneMode', {
			lan: language,
			fromModeId: id,
			name: values.modelName,
			creator: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
				JSON.parse(localStorage.getItem('userInfo')).name : '',
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					dispatch(getModelList())
					getstate().layout.modelListSelectedId = [data.data]
					Modal.success({
						title: language == 'en' ? 'Reminder' : '成功提示',
						content: data.msg
					})
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
			}
		).catch(
			() => {

			}
		)
	}
}

//修改模式列表
export function editModel(id, values) {
	return function (dispatch, getstate) {
		return http.post('/mode/edit', {
			modeId: id,
			lan: language,
			name: values.modelName,
			description: values.modelDescription,
			creator: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
				JSON.parse(localStorage.getItem('userInfo')).name : '',
			type: parseInt(values.modelType),
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					dispatch(getModelList())
					getstate().layout.modelListSelectedId = [id]
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
			}
		).catch(
			() => {

			}
		)
	}
}

//删除模式
export function delModel(selectId) {
	return function (dispatch, getstate) {
		dispatch(loadDate(true))
		return http.post('/mode/remove', {
			modeId: selectId,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					dispatch(getModelList())
					getstate().layout.modelListSelectedId = []
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: language == 'en' ? 'Failed to delete the mode' : '删除模式失败'
					})
				}
				//dispatch(renderDate([]))

				dispatch(loadDate(false))
			}
		).catch(
			() => {

			}
		)
	}
}

//获取所有模式列表 
export function getModelList() {
	return function (dispatch, getstate) {
		dispatch(sceneLoading(true))
		return http.get(language == 'en' ? '/mode/getAll?lan=en' : '/mode/getAll').
			then(
				data => {
					if (!data.err) {
						dispatch(saveModelList(data.data))
					} else {
						Modal.error({
							title: language == 'en' ? 'Alert' : '警告',
							content: language == 'en' ? 'Failed to retrieve the mode list' : '获取模式列表失败'
						})
					}
					dispatch(modelLoading(false))
				}
			).catch(
				() => {
					dispatch(modelLoading(false))

				}
			)
	}
}

//loading模式列表
export function modelLoading(loading) {
	return {
		type: MODEL_LOADING,
		modelLoading: loading
	}
}

//loading模式内容
export function modelContentLoading(loading) {
	return {
		type: MODEL_CONTENT_LOADING,
		modelContentLoading: loading
	}
}

//保存模式列表数据
export function saveModelList(data) {
	return {
		type: SAVE_MODEL_LIST,
		data: data
	}
}

//保存模式列表的选中id
export function saveModelListId(id) {
	return {
		type: SAVE_MODEL_SELECT_LIST_ID,
		modelListSelectedId: id
	}
}
//给模式添加内容
export function addModelContent(modelId, envId, timeType, time, evnActionOnce) {
	let pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))
	let obj = {
		modeId: modelId,
		triggerTime: time,
		timeType: timeType,
		envId: envId,
		onduty: appConfig.onduty,
		cloudUserId: appConfig.cloudUser.cloudUserId,
		projectId: appConfig.projectId
	}
	if (pysiteVersion >= 704) {
		obj["actionOnce"] = Number(evnActionOnce)
	}
	return function (dispatch, getstate) {
		return http.post('/mode/addContent', obj).then(
			data => {
				if (!data.err) {
					dispatch(getModelContent(modelId))
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
			}
		).catch(
			() => {

			}
		)
	}
}

//修改模式里的场景或者时间
export function editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce) {
	let pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))
	let obj = {
		modeId: oldData.modeId,
		oldTime: oldData.oldTime,
		oldEnvId: oldData.oldEnvId,
		newEnvId: newData.newEnvId,
		SystemTimePointName: sysTimePointName,
		oldTimeType: oldData.oldTimeType,
		onduty: appConfig.onduty,
		cloudUserId: appConfig.cloudUser.cloudUserId,
		projectId: appConfig.projectId
	}
	if (pysiteVersion >= 704) {
		obj["actionOnce"] = Number(evnActionOnce)
	}
	return function (dispatch, getstate) {
		//只改了场景，没改时间
		if (editType == 1) {
			return http.post('/mode/editContent', obj).then(
				data => {
					if (!data.err) {
						dispatch(getModelContent(oldData.modeId))
					} else {
						Modal.error({
							title: language == 'en' ? 'Alert' : '警告',
							content: language == 'en' ? 'Scene modification failed:' : '修改场景失败:' + data.msg
						})
					}
				}
			).catch(
				() => {

				}
			)
		} else {
			return http.post('/mode/editContent', {
				modeId: oldData.modeId,
				oldTime: oldData.oldTime,
				oldEnvId: oldData.oldEnvId,
				newEnvId: newData.newEnvId,
				newTime: newData.timeValue,
				newTimeType: newData.timeType,
				SystemTimePointName: sysTimePointName,
				oldTimeType: oldData.oldTimeType,
				actionOnce: Number(evnActionOnce),
				onduty: appConfig.onduty,
				cloudUserId: appConfig.cloudUser.cloudUserId,
				projectId: appConfig.projectId
			}).then(
				data => {
					if (!data.err) {
						dispatch(getModelContent(oldData.modeId))

					} else {
						Modal.error({
							title: language == 'en' ? 'Alert' : '警告',
							content: language == 'en' ? 'Failed to modify the scene:' : '修改场景失败:' + data.msg
						})
					}
				}
			).catch(
				() => {

				}
			)
		}
	}
}

//获取模式内容 
export function getModelContent(id) {
	return function (dispatch, getstate) {
		dispatch(modelContentLoading(true))
		return http.post('/mode/getContentById', {
			"modeId": id,
			'lan': language
		}).
			then(
				data => {
					if (!data.err) {
						dispatch(saveModelContent(data.data))
					} else {
						Modal.error({
							title: language == 'en' ? 'Alert' : '警告',
							content: language == 'en' ? 'API Response:' : '接口返回：' + data.msg
						})
					}
					dispatch(modelContentLoading(false))
				}
			).catch(
				() => {
					dispatch(modelContentLoading(false))

				}
			)
	}
}

//保存模式内容数据
export function saveModelContent(data) {
	return {
		type: SAVE_MODEL_CONTENT,
		data: data
	}
}

//删除模式里的内容
export function delModelContent(id, data) {
	return function (dispatch, getstate) {
		//dispatch(loadDate(true))    
		return http.post('/mode/removeContent', {
			modeId: id,
			triggerTime: data.triggerTime,
			envId: data.envId,
			triggerTimeType: data.triggerTimeType,
			systemTimePointName: data.SystemTimePointName,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					dispatch(getModelContent(id))
				} else {
					Modal.error({
						title: language == 'en' ? 'Alert' : '警告',
						content: data.msg
					})
				}
				//dispatch(renderDate([]))

				//dispatch(loadDate(false))        
			}
		).catch(
			() => {

			}
		)
	}
}

//获取左下角按钮列表
export function getModeButtonsList() {
	return function (dispatch, getstate) {
		let configType = JSON.parse(window.localStorage.modeButtons) != undefined ? JSON.parse(window.localStorage.modeButtons).type : []
		if (configType.length != 0) {
			return http.post('/mode/getTodayModeListOfTypes', {
				type: configType,
				lan: language
			}).then(
				res => {
					if (res.err === 0 && res.data.length != 0) {
						dispatch(saveModeButtonsList(res.data))
					}
				}
			).catch(
				err => {
				}
			)
		}

	}
}

export function saveModeButtonsList(data) {
	return {
		type: SAVE_MODEBUTTONS_LIST,
		data: data
	}
}


export function reset() {
	return {
		type: RESET
	}
}

export function showModal(type, props) {
	return {
		type: SHOW_MODAL,
		modal: {
			type,
			props
		}
	}
}

export function hideModal() {
	return {
		type: HIDE_MODAL
	}
}

//弹出实时报警弹框RealtimeWarningModal
export function showAlarmModal(type, props) {
	return {
		type: SHOW_ALARM_MODAL,
		alarmModal: {
			type,
			props
		}
	}
}
//隐藏实时报警弹框RealtimeWarningModal
export function hideAlarmModal() {
	return {
		type: HIDE_ALARM_MODAL
	}
}

export const toggleTimeShaft = (timeShaft) => {
	return {
		type: TOGGLE_TIMESHAFT,
		timeShaft
	}
}
//切换模态框显示状态
export const toggleDateConfigModal = (visible, props, onlyCloseModel) => {
	return {
		type: TOGLE_DATE_CONFIG,
		modal: {
			visible: visible,
			props: props || {},
			onlyCloseModel: onlyCloseModel
		}
	}
}
//更新初始时间
export const updateConfigModalProps = (specificTime) => {
	return {
		type: UPDATE_DATA_CONFIG,
		specificTime
	}
}

export const saveTimeArr = (timeArr) => {
	return {
		type: SAVE_TIME_ARR,
		timeArr
	}
}






//获取时间轴需要的时间数组
export function getTimeArr(values) {
	return function (dispatch, getState) {
		let dateDict = JSON.parse(localStorage.dateDict)
		console.log('values', values)
		let timediff = moment(dateDict.endTime).diff(moment(dateDict.startTime))  //时差（毫秒）
		console.info(timediff)
		//values.startTime.add(60,'minute').format('YYYY-MM-DD HH:mm:00') 
		let timelag = 60 * 1000   //时间间隔默认为1分钟
		switch (values.timeFormat) {
			case 'm1':
				timelag = 60 * 1000;
				break;
			case 'm5':
				timelag = 60 * 1000 * 5;
				break;
			case 'h1':
				timelag = 60 * 1000 * 60
				break;
			case 'd1':
				timelag = 60 * 1000 * 60 * 24
				break;
		}

		let valueLength = timediff / timelag
		console.info(valueLength)
		let arr = []
		arr.push(moment(values.startTime).format('YYYY-MM-DD HH:mm:00'))
		let item
		for (let i = 0; i < valueLength; i++) {
			switch (values.timeFormat) {
				case 'm1':
					item = values.startTime.add(1, 'minute').format('YYYY-MM-DD HH:mm:00')
					break;
				case 'm5':
					item = values.startTime.add(5, 'minute').format('YYYY-MM-DD HH:mm:00')
					break;
				case 'h1':
					item = values.startTime.add(60, 'minute').format('YYYY-MM-DD HH:mm:00')
					break;
				case 'd1':
					item = values.startTime.add(1440, 'minute').format('YYYY-MM-DD HH:mm:00')
			}
			arr.push(item)
		}
		console.info(arr)
		if (arr) {
			dispatch(saveTimeArr(arr))
		}
	}
}

export function upDateCurValue(value) {
	const dateDict = JSON.parse(localStorage.dateDict)
	dateDict.curValue = value
	localStorage.dateDict = JSON.stringify(dateDict)
	return {
		type: UPDATE_CUR_VALUE,
		value
	}
}

//点击按钮，若全屏页面调用
export function updateFullPage(props) {
	return {
		type: UPDATE_FULL_PAGE,
		props
	}
}

//更新组件内状态的reducer
export function updateTimeShaftState(props) {
	return {
		type: UPDATE_TIME_SHAFT_STATE,
		props
	}
}

//弹出设备开关模态框
export function showOperatingModal(modalProps) {
	return showSwitch(true, modalProps);
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

//日程点位选择模态框的显示
export function showPointModal(visible, modalProps) {
	return {
		type: SHOW_POINT_MODAL,
		visible,
		modalProps
	}
}

export function hidePointModal() {
	return {
		type: HIDE_POINT_MODAL
	}
}

export function saveHealthData(data) {
	return {
		type: SAVE_HEALTH_DATA,
		data
	}
}

export function changeHealthDataStatus(status) {
	return {
		type: CHANGE_HEALTH_STATUS,
		status
	}
}

export function RepairDataAction(time1, time2) {
	return function (dispatch, getstate) {
		return http.post('/fix/getByPeriod', {
			"timeFrom": time1,
			"timeTo": time2
		}).then(
			data => {
				if (data.err == 0) {
					dispatch(getRepairData(data.data))
					dispatch(showModal(modalTypes.REPAIR_MANAGEMENT_MODAL))
				} else {
					dispatch(showModal(modalTypes.REPAIR_MANAGEMENT_MODAL))
					dispatch(getRepairData(data.data))
				}
			}
		).catch(
			err => {
				dispatch(showModal(modalTypes.REPAIR_MANAGEMENT_MODAL))
				dispatch(getRepairData([]))
				// Modal.error('请求数据失败')
			}
		)
	}
}
export function getRepairData(data) {
	return {
		type: LAYOUT_REPAIR_DARA,
		RepairManageData: data
	}
}

export function updateFaultNum(num, faultInfo) {
	return function (dispatch, getstate) {
		dispatch(updateNum(num, faultInfo))
	}
}

export function updateNum(num, faultInfo) {
	return {
		type: UPDATE_FAULT_NUM,
		faultNum: num,
		faultInfo: faultInfo
	}
}

export function isDeletedUpdate(state) {
	return function (dispatch, getstate) {
		dispatch(isDeleted(state))
	}
}

export function isDeleted(state) {
	return {
		type: IS_DELETED,
		isDeleted: state
	}
}

export const actions = {
	reset,
	showModal,
	hideModal,
	showAlarmModal
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[RESET]: () => {
		return initialState;
	},
	//报修列表信息
	[LAYOUT_REPAIR_DARA]: (state, action) => {
		return { ...state, RepairManageData: action.RepairManageData }
	},
	//日程表单刷新
	[SCHEDULE_LOADING]: (state, action) => {
		return { ...state, scheduleLoading: action.scheduleLoading }
	},
	//加载表单数据
	[RENDER_TABLE]: (state, action) => {
		return { ...state, scheduleData: action.data }
	},
	//加载子节点
	[LOADING_DATE]: (state, action) => {
		return { ...state, loadDate: action.loadDate }
	},
	//获取节点ID
	[FETCH_ID]: (state, action) => {
		return { ...state, scheduleId: action.id }
	},
	//加载日期
	[RENDER_DATE]: (state, action) => {
		return {
			...state, nodeData: action.data.data !== undefined ? action.data.data.map((row, index) => {
				let datatime = new Date().getTime()
				row['workid'] = row['weekday']
				// 根据语言环境，将数字（1-7）映射为对应星期文本（中文/英文）
				switch (row['weekday']) {
					case 1:
						row['weekday'] = isEnglish ? 'Sunday' : '星期日';
						break;
					case 2:
						row['weekday'] = isEnglish ? 'Monday' : '星期一';
						break;
					case 3:
						row['weekday'] = isEnglish ? 'Tuesday' : '星期二';
						break;
					case 4:
						row['weekday'] = isEnglish ? 'Wednesday' : '星期三';
						break;
					case 5:
						row['weekday'] = isEnglish ? 'Thursday' : '星期四';
						break;
					case 6:
						row['weekday'] = isEnglish ? 'Friday' : '星期五';
						break;
					case 7:
						row['weekday'] = isEnglish ? 'Saturday' : '星期六';
						break;
				}
				row['key'] = index + datatime
				return row
			}) : []
		}
	},
	[SECHEDULE_ID]: (state, action) => {
		return { ...state, CheckId: action.CheckId }
	},
	[SHOW_MODAL]: (state, action) => {
		return { ...state, modal: action.modal }
	},
	[SHOW_ALARM_MODAL]: (state, action) => {
		return { ...state, alarmModal: action.alarmModal }
	},
	[HIDE_ALARM_MODAL]: (state) => {
		return { ...state, alarmModal: initialState.alarmModal }
	},
	[HIDE_MODAL]: (state) => {
		return { ...state, modal: initialState.modal };
	},
	[SET_MENUS]: (state, action) => {
		return { ...state, menus: action.menus }
	},
	[SET_GROUP_MENUS]: (state, action) => {
		return { ...state, menus: action.menus.GroupList, gMenusFlag: true, newMenusFlag: action.menus.GroupMenuEnable == 2 ? true : false }
	},
	[GET_REALTIME_WARNING]: (state, action) => {
		return { ...state, realtimeWarningData: action.data }
	},
	[CHOSED_KEYS]: (state, action) => {
		return { ...state, chosedKey: action.key }
	},
	[GET_WORKER_DICT]: (state, action) => {
		return { ...state, workerDict: action.workerDict }
	},
	[SHOW_DEFAULT_PAGE]: (state) => {
		if (state.menus[0].id === 'undefined') {
			hashHistory.push('/observer/' + state.menus[0].pageList[0].id)
		} else {
			hashHistory.push('/observer/' + state.menus[0].id)
		}
		return state;
	},
	[TOGGLE_TIMESHAFT]: (state, action) => {
		return { ...state, bShowTimeShaft: action.timeShaft }
	},
	[TOGLE_DATE_CONFIG]: (state, action) => {
		return { ...state, dateModal: action.modal }
	},
	[SAVE_TIME_ARR]: (state, action) => {
		return { ...state, timeArr: action.timeArr }
	},
	[UPDATE_CUR_VALUE]: (state, action) => {
		return { ...state, curValue: action.value }
	},
	[UPDATE_DATA_CONFIG]: (state, action) => {
		return {
			...state,
			dateModal: {
				visible: state.dateModal.visible,
				props: {
					...state.dateModal.props,
					startTime: action.specificTime
				},
				onlyCloseModel: state.dateModal.onlyCloseModel
			}
		}
	},
	[UPDATE_FULL_PAGE]: (state, action) => {
		return {
			...state,
			updateFullPageState: action.props
		}
	},
	[UPDATE_TIME_SHAFT_STATE]: (state, action) => {
		return {
			...state,
			updateTimeshaftState: action.props
		}
	},
	[SHOW_POINT_MODAL]: (state, action) => {
		return { ...state, pointModalDict: { visible: action.visible, props: action.modalProps } }
	},
	[HIDE_POINT_MODAL]: (state) => {
		return { ...state, modal: initialState.modal }
	},
	[SAVE_HEALTH_DATA]: (state, action) => {
		return { ...state, healthData: action.data }
	},
	[CHANGE_HEALTH_STATUS]: (state, action) => {
		return { ...state, healthDataStatus: action.status }
	},
	[UPDATE_LOGOUT_LAST_TIME]: (state, action) => {
		return { ...state, logoutLastTime: action.time }
	},
	[SEARCH_POINT]: (state, action) => {
		return {
			...state, warningData: action.warningData.filter((item, i) => {
				item['no'] = i + 1
				if (item['level'] == 1) {
					item['level'] = '一般'
				}
				if (item['level'] == 2) {
					item['level'] = '严重'
				}
				if (item['level'] == 3) {
					item['level'] = '非常严重'
				}
				return new RegExp(value, "i").test(item.strBindPointName) || new RegExp(value, "i").test(item.info)
			})
		}
	},
	//场景loading
	[SCHEDULE_LOADING]: (state, action) => {
		return { ...state, sceneLoading: action.sceneLoading }
	},
	[MODEL_CONTENT_LOADING]: (state, action) => {
		return { ...state, modelContentLoading: action.modelContentLoading }
	},
	[SAVE_SCENE_LIST]: (state, action) => {
		return { ...state, sceneList: action.data }
	},
	[SAVE_SELECT_LIST_ID]: (state, action) => {
		return { ...state, sceneListSelectedId: action.sceneListSelectedId, sceneListSelectedName: action.sceneListSelectedName }
	},
	[SAVE_POINTS_DATA]: (state, action) => {
		return { ...state, scenePointsData: action.data.realtimeValue }
	},
	[MODEL_LOADING]: (state, action) => {
		return { ...state, modelLoading: action.modelLoading }
	},
	[SAVE_MODEL_LIST]: (state, action) => {
		return { ...state, modelList: action.data }
	},
	[SAVE_MODEBUTTONS_LIST]: (state, action) => {
		return { ...state, modeButtonsList: action.data }
	},
	[SAVE_MODEL_SELECT_LIST_ID]: (state, action) => {
		return { ...state, modelListSelectedId: action.modelListSelectedId }
	},
	[SAVE_MODEL_CONTENT]: (state, action) => {
		return { ...state, modelContent: action.data }
	},
	[UPDATE_FAULT_NUM]: (state, action) => {
		return { ...state, faultNum: action.faultNum, faultInfo: action.faultInfo }
	},
	[IS_DELETED]: (state, action) => {
		return { ...state, isDeleted: action.isDeleted }
	},
}
// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
	modal: {
		type: undefined,
		props: {}
	},
	alarmModal: {
		type: undefined,
		props: {}
	},
	menus: [],
	gMenusFlag: false,
	newMenusFlag: false,
	realtimeWarningData: [],
	chosedKey: 0,
	bShowTimeShaft: false,
	dateModal: {
		visible: false,
		props: {},
		onlyCloseModel: false
	},
	healthData: [
		{
			err: 0,
			msg: getText('workingNormal'),
			name: getText('backendDomcoreEngine')
		},
		{
			err: 0,
			msg: getText('workingNormal'),
			name: getText('backendDomlogicEngine')
		},
		{
			err: 0,
			msg: getText('workingNormal'),
			name: getText('backendHistoryData')
		}
	],
	healthDataStatus: true,
	timeArr: [],
	curValue: 0,
	updateFullPageState: {},
	updateTimeshaftState: {},
	logoutLastTime: 0,
	pointModalDict: {},
	scheduleLoading: false,       //日程加载
	scheduleData: [],             //日程数据
	loadDate: false,              //日期loading
	nodeData: [],                 //节点数据 
	scheduleId: '',               //ID
	warningData: [],
	CheckId: [],                  //
	saveMenuId: [],               //保存列头的ID 
	sceneLoading: false,
	sceneListSelectedId: [],
	sceneListSelectedName: '',
	scenePointsData: [],
	sceneList: [],
	modelList: [],
	modeButtonsList: [],
	modelLoading: false,
	modelListSelectedId: [],
	modelContent: {},
	modelContentLoading: false,
	RepairManageData: [],  //报修管理信息列表
	faultNum: 0,
	faultInfo: [],//实时报警信息
	isDeleted: false //是否删除成功
};
export default function homeReducer(state = initialState, action) {
	const handler = ACTION_HANDLERS[action.type]

	return handler ? handler(state, action) : state
}
