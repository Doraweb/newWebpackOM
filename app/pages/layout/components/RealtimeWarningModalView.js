/**
 * 实时报警模态框
 */
import React from 'react';
import { Modal, Button, Icon, Table, message, Input, Form, Tabs, Badge, Tooltip } from 'antd';
import moment from 'moment';
import http from '../../../common/http';
import s from './RealtimeWarningModalView.css'
import RealWarningWorker from './wanging.worker'
import appConfig from '../../../common/appConfig'
import HistoryWarningView from './HistoryWarningModalView';
import { getTendencyModalByTime } from '../../Trend/modules/TrendModule';
import { closeAppWindow } from '../../../core/cmdRenderer';

const { TabPane } = Tabs
let timer;

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const remote = require('@electron/remote');
const exePath = remote.process.execPath.slice(0, -7).replace(/\\/g, '\/')
let dbPath
if (remote.process.execPath.indexOf("OM.exe") != -1) {
	dbPath = exePath + '/db.json'
} else {
	dbPath = 'db.json'
}
const adapter = new FileSync(dbPath)
const db = low(adapter)
const customMp3 = localStorage.getItem('soundFileName')
const toolbar_display = localStorage.getItem('toolbarDisplay') ? JSON.parse(localStorage.getItem('toolbarDisplay')) : {}
const language = appConfig.language

class RealtimeWarningModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			mounted: false,
			realtimeWarningData: [],
			failedTime: 0,
			healthErrList: [0, 0, 0],
			healthDataStatus: true,
			playFlag: false,
			playState: '未启用',
			warning: '',
			warningVisible: false,
			warningCheckDisabled: '',
			warningInfoList: [],
			warningNum: 0,
			remark: '',
			infoList: [],
			warningStatusBy135: 0,
			currentStatus: [],
			levelList: [],
			warningSoundSetting: db.has("warningSoundSetting").value() ? JSON.parse(db.getState().warningSoundSetting) : true,
			isAlarm2: false,  //警报音2，对应等级2（较重），mp3音频是否存在
			isAlarm1: false, //警报音1，对应等级1（一般），mp3音频是否存在
			levelPlay: 1,  //播放时的最高等级（需要对应不同音频）
			historyWarningVisible: false,
			warningModalDisabled: appConfig.warningModalDisabled ? appConfig.warningModalDisabled : 0
		}

		this.workerUpdate = null
		this.workerUpdateBulb = null
		this.workerUpdateFault = null
		this.workerWarning = null
		this.workerStandby = null
		this.startWorker = this.startWorker.bind(this);
		this.stopWorker = this.stopWorker.bind(this)
		this.refreshData = this.refreshData.bind(this)
		this.refreshHealthData = this.refreshHealthData.bind(this);
		this.timingPlay = this.timingPlay.bind(this);
		this.refreshFaultData = this.refreshFaultData.bind(this);
		this.refreshStandbyData = this.refreshStandbyData.bind(this);

	}

	//组件加载完成
	componentDidMount() {
		//检测本地是否存在非严重报警外的播放音，等级：严重（3）--警报音.mp3（默认有的）；等级：较重（2）--alarm2.mp3；等级：一般（1）--alarm1.mp3
		// 要检查的文件路径
		fetch(`${appConfig.serverUrl}/static/alarm1.mp3`, { method: 'HEAD' })
			.then((response) => this.setState({
				isAlarm1: response.ok
			}));
		fetch(`${appConfig.serverUrl}/static/alarm2.mp3`, { method: 'HEAD' })
			.then((response) => this.setState({
				isAlarm2: response.ok
			}));

		// 示例使用方法：

		http.post('/project/getConfig', {
			key: "warningCheckDisabled"
		}).then(
			data => {
				this.setState({
					warningCheckDisabled: data.data
				})
			}
		).catch(
			err => {

			}
		)

		localStorage.setItem('WarningPages', [])
		this.props.getWorkerDict({ startWorker: this.startWorker, stopWorker: this.stopWorker })
		window.setTimeout(() => {
			this.setState({
				mounted: true
			}, this.startWorker);
		}, 0);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.state.warningVisible != nextState.warningVisible) {
			return true
		}
		if (this.state.warningModalDisabled != nextState.warningModalDisabled) {
			return true
		}
		if (this.state.realtimeWarningData != nextState.realtimeWarningData) {
			return true
		}
		if (this.state.playState != nextState.playState) {
			return true
		}
		if (this.state.warningStatusBy135 != nextState.warningStatusBy135) {
			return true
		}
		if (this.state.warning != nextState.warning) {
			return true
		}
		if (this.state.warningNum != nextState.warningNum) {
			return true
		}
		if (this.state.remark != nextState.remark) {
			return true
		}
		if (this.state.warningInfoList != nextState.warningInfoList) {
			return true
		}
		if (this.state.infoList != nextState.infoList) {
			return true
		}
		if (this.state.currentStatus != nextState.currentStatus) {
			return true
		}
		if (this.state.levelList != nextState.levelList) {
			return true
		}
		if (this.state.warningSoundSetting != nextState.warningSoundSetting) {
			return true
		}
		if (this.state.historyWarningVisible != nextState.historyWarningVisible) {
			return true
		}
		return false
	}

	//组件即将卸载
	componentWillUnmount() {
		this.workerUpdate.terminate();
		this.workerUpdateBulb.terminate();
		this.workerUpdateFault.terminate();
		this.workerWarning.terminate();
		this.workerStandby.terminate();
	}

	//开始建立一个实时请求
	startWorker() {
		this.stopWorker()
		// 创建Worker实例
		this.workerUpdate = new RealWarningWorker();
		this.workerUpdate.self = this;

		this.workerUpdate.addEventListener("message", this.refreshData, true);

		this.workerUpdate.addEventListener("error", function (e) {
			console.warn(e);
		}, true);
		//传数据
		this.workerUpdate.postMessage({
			serverUrl: appConfig.serverUrl,
			language: appConfig.language,
			type: "realWarning"
		});
		// 创建Worker实例
		this.workerUpdateBulb = new RealWarningWorker();
		this.workerUpdateBulb.self = this;

		this.workerUpdateBulb.addEventListener("message", this.refreshHealthData, true);

		this.workerUpdateBulb.addEventListener("error", function (e) {
			console.warn(e);
		}, true);
		//传数据
		this.workerUpdateBulb.postMessage({
			serverUrl: appConfig.serverUrl,
			type: "realHealth",
			language: language
		});



		if (toolbar_display.toolbar_display_workorder == 0) {
			console.log('不创建工单worker')
		} else {
			// 创建Worker实例
			this.workerUpdateFault = new RealWarningWorker();
			this.workerUpdateFault.self = this;

			this.workerUpdateFault.addEventListener("message", this.refreshFaultData, true);

			this.workerUpdateFault.addEventListener("error", function (e) {
				console.warn(e);
			}, true);
			//传数据
			localStorage.setItem('nowUser', JSON.parse(localStorage.getItem('userData')).name)
			this.workerUpdateFault.postMessage({
				serverUrl: appConfig.serverUrl,
				user: JSON.parse(localStorage.getItem('userData')).name,
				type: "realFault"
			});

		}

		// 创建Worker实例
		this.workerWarning = new RealWarningWorker();
		this.workerWarning.self = this;

		this.workerWarning.addEventListener("message", this.refreshWarningData, true);

		this.workerWarning.addEventListener("error", function (e) {
			console.warn(e);
		}, true);
		//传数据
		this.workerWarning.postMessage({
			realtimeDataIntervalRemote: localStorage.getItem('realtimeDataIntervalRemote') ? Number(localStorage.getItem('realtimeDataIntervalRemote')) : 30,
			serverUrl: appConfig.serverUrl,
			language: appConfig.language,
			type: "warningData"
		});

		//判断是否是热备设置
		if (localStorage.getItem('standby') != undefined) {
			const standby = JSON.parse(localStorage.getItem('standby'))
			console.log(`主从配置${standby}`)
			if (standby.enabled && standby.isMasterSlave && standby.master != "" && standby.slave != "") {
				console.log("启动热备实时检测")
				// 创建Worker实例
				this.workerStandby = new RealWarningWorker();
				this.workerStandby.self = this;

				this.workerStandby.addEventListener("message", this.refreshStandbyData, true);

				this.workerStandby.addEventListener("error", function (e) {
					console.warn(e);
				}, true);
				//传数据
				this.workerStandby.postMessage({
					slaveUrl: standby.slave,
					type: "standbyData"
				});
			}
		}
	}

	stopWorker() {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
			this.workerUpdate.removeEventListener("message", this.refreshData, true);
		}
		if (this.workerUpdateBulb) {
			this.workerUpdateBulb.terminate();
			this.workerUpdateBulb.removeEventListener("message", this.refreshHealthData, true);
		}
		if (this.workerUpdateFault) {
			this.workerUpdateFault.terminate();
			this.workerUpdateFault.removeEventListener("message", this.refreshFaultData, true);
		}
		if (this.workerWarning) {
			this.workerWarning.terminate();
			this.workerWarning.removeEventListener("message", this.refreshWarningData, true);
		}
		if (this.workerStandby) {
			this.workerStandby.terminate();
			this.workerStandby.removeEventListener("message", this.refreshStandbyData, true);
		}
	}

	refreshStandbyData(e) {
		console.log(e.data);
		const standby = JSON.parse(localStorage.getItem('standby'))
		const serverUrl = localStorage.getItem('serverUrl')
		const userInfo = JSON.parse(localStorage.getItem('userInfo'))
		let url = serverUrl.substring(0, serverUrl.length - 5)
		console.log(url)
		//当备机状态为true（备机活跃）并且 当前IP不是备机时，则切备机
		if (e.data.data.active === true && url != standby.slave) {
			if (localStorage['standby']) {
				window.localStorage.removeItem('standby')
			}
			let startOM = null;
			startOM = require('child_process').exec(`OM.exe -u ${userInfo.name} -p ${userInfo.pwd} -h ${standby.slave}:5000`);
			setTimeout(() => {
				closeAppWindow()
			}, 10000)
		}
		if (e.data.data.active === false && url != standby.master) {
			if (localStorage['standby']) {
				window.localStorage.removeItem('standby')
			}
			let startOM = null;
			startOM = require('child_process').exec(`OM.exe -u ${userInfo.name} -p ${userInfo.pwd} -h ${standby.master}:5000`);
			setTimeout(() => {
				closeAppWindow()
			}, 10000)
		}
	}

	refreshFaultData(e) {
		if (localStorage.getItem('nowUser') != JSON.parse(localStorage.getItem('userData')).name) {
			if (this.workerUpdateFault) {
				this.workerUpdateFault.terminate();
				this.workerUpdateFault.removeEventListener("message", this.refreshFaultData, true);
				// 创建Worker实例
				this.workerUpdateFault = new RealWarningWorker();
				this.workerUpdateFault.self = this;

				this.workerUpdateFault.addEventListener("message", this.refreshFaultData, true);

				this.workerUpdateFault.addEventListener("error", function (e) {
					console.warn(e);
				}, true);
				//传数据
				localStorage.setItem('nowUser', JSON.parse(localStorage.getItem('userData')).name)
				this.workerUpdateFault.postMessage({
					serverUrl: appConfig.serverUrl,
					user: JSON.parse(localStorage.getItem('userData')).name,
					type: "realFault"
				});
			}
		} else {

			if (e.data.err == 0) {
				this.props.refreshFaultNum(e.data.data.length, this.state.realtimeWarningData)
			} else {
				this.props.refreshFaultNum(0, this.state.realtimeWarningData)
			}
		}

	}

	refreshHealthData(e) {
		let interfaceStatus = !e.data.interfaceStatus
		// console.log(e)
		if (!interfaceStatus) {
			if (this.state.healthDataStatus) {
				//修改接口状态，false时不显示灯
				this.props.changeHealthDataStatus(false)
				this.setState({
					healthDataStatus: false
				})
			}
		}
		if (e.data.err === 0) {
			let healthData = e.data.data
			this.props.changeHealthDataStatus(true)
			//对比state里上次的Err数量，如果没变，则不调用action
			this.state.healthErrList.forEach((item, j) => {
				if (healthData[j].err != item) {
					this.props.saveHealthData(healthData)
					let list = this.state.healthErrList
					list[j] = healthData[j].err
					this.setState({
						healthErrList: list
					})
				}
			})
		} else {
			if (this.state.healthDataStatus) {
				this.props.changeHealthDataStatus(false)
				this.setState({
					healthDataStatus: false
				})
			}
		}

	}

	//刷新数据
	refreshData(e) {
		if (e.data['fireMode'] != undefined) {
			if (localStorage.getItem('fireMode')) {
				if (localStorage.getItem('fireMode') != e.data['fireMode']) {
					localStorage.setItem('fireMode', e.data['fireMode'])
				}
			} else {
				localStorage.setItem('fireMode', e.data['fireMode'])
			}
		}
		//为网络架构图存储 离线 清单
		if (e.data['netDeviceDropWarningList'] != undefined) {
			if (appConfig.netDeviceDropWarningList.length > 0) {
				if (JSON.stringify(appConfig.netDeviceDropWarningList) != JSON.stringify(e.data['netDeviceDropWarningList'])) {
					appConfig.netDeviceDropWarningList = e.data['netDeviceDropWarningList']
				}
			} else {
				appConfig.netDeviceDropWarningList = e.data['netDeviceDropWarningList']
			}
		}

		//为网络架构图存储 在线 清单
		if (e.data['netDeviceOnlineList'] != undefined) {
			if (appConfig.netDeviceOnlineList.length > 0) {
				if (JSON.stringify(appConfig.netDeviceOnlineList) != JSON.stringify(e.data['netDeviceOnlineList'])) {
					appConfig.netDeviceOnlineList = e.data['netDeviceOnlineList']
				}
			} else {
				appConfig.netDeviceOnlineList = e.data['netDeviceOnlineList']
			}
		}

		//为网络架构图存储 无法判断状态 清单
		if (e.data['netDeviceUnclearList'] != undefined) {
			if (localStorage.getItem('netDeviceUnclearList')) {
				if (localStorage.getItem('netDeviceUnclearList') != JSON.stringify(e.data['netDeviceUnclearList'])) {
					localStorage.setItem('netDeviceUnclearList', JSON.stringify(e.data['netDeviceUnclearList']))
				}
			} else {
				localStorage.setItem('netDeviceUnclearList', JSON.stringify(e.data['netDeviceUnclearList']))
			}
		}

		if (this.state.warningCheckDisabled == 1) {
			e.data['warningList'] = []
		}
		let warningData = []
		if (e.data && e.data['warningList'] && e.data['warningList'] != undefined) {
			warningData = e.data['warningList']
			if (localStorage.getItem("WarningPages")) {
				if (e.data['warningPageIdList'] != localStorage.getItem("WarningPages")) {
					localStorage.setItem('WarningPages', e.data['warningPageIdList'])
				}
			} else {
				if (e.data["warningPageIdList"] && e.data["warningPageIdList"][0] != undefined) {
					localStorage.setItem('WarningPages', e.data['warningPageIdList'])
				}
			}

		} else {
			warningData = e.data
		}

		const { resetFailedTime, changeReconnectModalVisible, reconnectModal } = this.props


		//断线连接
		let interfaceStatus = !warningData.interfaceStatus
		if (interfaceStatus) {
			// 请求成功，状态变为 true， 计数清零
			resetFailedTime()
			this.setState({
				failedTime: 0
			})
		} else {
			// 请求失败，累加计数 , 判断 计数>=5 ，状态变为true
			if (this.state.failedTime >= 5) {
				//当点击“取消重新链接”后，延时一分钟再弹框
				if (reconnectModal.delayFlag) {
					if (this.state.failedTime == 5) {
						this.setState({
							failedTime: this.state.failedTime + 1
						})
						let _this = this
						setTimeout(function () {
							changeReconnectModalVisible()
							_this.setState({
								failedTime: 5
							})
						}, 60 * 1000);
					} else {
						if (this.state.failedTime == 6) {
							return
						}
					}

				} else {
					changeReconnectModalVisible()
				}
			} else {
				let num = ++this.state.failedTime;
				this.setState({
					failedTime: num
				})
				//visible() 废弃
			}
		}

		// this.props.refreshNum(warningData.length)
		//刷新设备离线数

		if (e.data['netDeviceDropWarningList'] != undefined && e.data['netDeviceDropWarningList'].length != 0) {
			this.props.refreshOffLineNum(e.data['netDeviceDropWarningList'].length)
		} else {
			this.props.refreshOffLineNum(0)
		}

	}

	removeDuplicateObjects(data) {
		// 创建一个空对象用于存储不重复的pointName及其对应的对象
		const uniqueObjects = {};

		// 遍历data数组
		for (let i = 0; i < data.length; i++) {
			const currentObject = data[i];
			const pointName = currentObject.pointName;
			const level = currentObject.level;

			// 如果uniqueObjects中已经存在相同的pointName，则比较level大小
			if (uniqueObjects.hasOwnProperty(pointName)) {
				if (level > uniqueObjects[pointName].level) {
					// 如果当前对象的level更高，则替换掉uniqueObjects中的对象
					uniqueObjects[pointName] = currentObject;
				}
			} else {
				// 如果uniqueObjects中不存在相同的pointName，则将当前对象添加到uniqueObjects中
				uniqueObjects[pointName] = currentObject;
			}
		}

		// 将uniqueObjects中的对象转换为数组并返回
		const uniqueData = Object.values(uniqueObjects);
		return uniqueData;
	}

	findHighestValue(arr) {
		let highest = 1; // 初始化最小等级1

		for (let i = 0; i < arr.length; i++) {
			if (arr[i].level > highest && arr[i].status == 1) {
				highest = arr[i].level; // 更新最高值
			}
		}

		return highest;
	}

	//仅刷新报警数据
	refreshWarningData = (e) => {

		if (e.data.currentTime) {
			localStorage.setItem('currentTime', e.data.currentTime)
		} else if (localStorage.getItem('currentTime')) {
			localStorage.removeItem('currentTime')
		}
		const { isAlarm1, isAlarm2 } = this.state
		if (e.data && (e.data.interfaceStatus == true || e.data.error)) return

		let warningData = e.data ? (e.data.warningList ? e.data.warningList : e.data) : e.warningList
		warningData.reverse()
		//实时报警内容
		if (JSON.stringify(this.state.realtimeWarningData) != JSON.stringify(warningData)) {

			//存储报警点位,用于界面文本报警闪烁及右击显示
			let warningInfo = []
			warningData.map(item => {
				if (item.strBindPointName && (item.status == 1 || item.status == 3 || item.status == 5)) {
					warningInfo.push({ pointName: item.strBindPointName, warningInfo: item.info, level: item.level, endtime: item.endtime })
				}
			})
			if (warningInfo.length != 0) {
				warningInfo = warningInfo.filter(item => (new Date().getTime() - new Date(item['endtime']).getTime()) < 5 * 60 * 1000)
				const filterData = this.removeDuplicateObjects(warningInfo)
				//只保留近5分钟的报警
				//过滤实时报警数组：相同点名的报警做level对比，保留level级别高的
				if (JSON.stringify(appConfig.warningInfo) != JSON.stringify(filterData)) {
					appConfig.warningInfo = JSON.parse(JSON.stringify(filterData))
				}
			} else {
				appConfig.warningInfo = []
			}

			//报警音
			if (warningData[0] == undefined) {
				// clearInterval(timer);
				let audio = document.getElementById('music1');
				if (audio !== null) {
					audio.pause();// 这个就是暂停
				}
				this.setState({
					warning: '',
					playFlag: false,
				})
			} else {
				// clearInterval(timer);
				let audio = document.getElementById('music1');
				if (audio !== null) {
					audio.pause();// 这个就是暂停
				}
				//筛出最高level的用于播放
				let levelPlay = 1
				levelPlay = this.findHighestValue(warningData);
				this.setState({
					levelPlay
				})

				let flag = false
				let selectedRowKeys = []
				let currentStatus = []
				let infoList = []
				let levelList = []

				warningData.sort((a, b) => new Date(b.endtime).getTime() - new Date(a.endtime).getTime())
				warningData.map((item, index) => {
					if (item.status == 1) {
						selectedRowKeys.push(index)
						currentStatus.push(item.status)
						infoList.push(item.info)
						levelList.push(item.level)
						//automaticAlarm为2，代表有严重报警才弹窗才出声音
						if (localStorage.getItem('automaticAlarm') && localStorage.getItem('automaticAlarm') == 2) {
							if (item.level != 1 && item.level != 2) {
								flag = true
							}
						} else {
							flag = true
						}
					}
				})
				if (localStorage.getItem('automaticAlarm') && localStorage.getItem('automaticAlarm') != '0' && flag && this.state.warningVisible == false) {
					this.setState({
						warningVisible: appConfig.warningModalDisabled == 1 || (appConfig.userData.role && appConfig.userData.role == 1) ? false : true,
						warningInfoList: selectedRowKeys,
						infoList: infoList,
						currentStatus: currentStatus,
						levelList: levelList
					})
				}
				//根据是否弹窗的参数，来判断是否有声音
				if (flag) {
					if (this.state.warningSoundSetting) {
						this.setState({
							playState: '已启用',
							playFlag: true
						})
						//判断alarm1和alarm2音频是否存在，存在才播放
						if (levelPlay == 3 || (levelPlay == 1 && isAlarm1) || (levelPlay == 2 && isAlarm2) || (customMp3 != undefined && customMp3 !== "")) {
							this.timingPlay(flag);
						}
					} else {
						this.setState({
							playState: '已静音',
							playFlag: false
						})
					}
				} else {
					this.setState({
						playState: '暂无未读报警',
						playFlag: false
					})
				}
			}

			let obj = warningData.find(i => i['status'] == 1)
			let status12 = 0, status135 = 0
			for (let i = 0; i < warningData.length; i++) {
				if (warningData[i].status == undefined) {
					status12 = warningData.length
					status135 = warningData.length
					break
				}
				if (warningData[i].status == 1) {
					status12++
					status135++
				} else if (warningData[i].status == 2) {
					status12++
				} else if (warningData[i].status == 3 || warningData[i].status == 5) {
					status135++
				}
			}

			this.setState({
				realtimeWarningData: warningData,
				warningNum: status12,
				warningStatusBy135: status135,
				warning: obj == undefined ? '' : obj['info']
			})
		}
	}

	//注释掉之前的定时播放函数，给标签增加loop循环播放属性，实现循环播放中间无空挡
	////定时20S一循环播放报警音效
	timingPlay(flag) {
		const { levelPlay } = this.state
		let _this = this

		let audio = flag == 0 ? document.getElementById('music2') : document.getElementById('music1');

		let player = function () {
			if (!_this.state.warningSoundSetting || _this.state.playFlag === false || (localStorage.getItem('soundAlarm') && localStorage.getItem('soundAlarm') == 0)) {
				// clearInterval(timer);
				_this.setState({
					playState: '未启用'
				})
				return
			}
			if (_this.state.playFlag === true) {
				if (audio !== null) {
					//检测播放是否已暂停.audio.paused 在播放器播放时返回false.
					// alert(audio.paused);
					try {
						if (audio.paused == true) {
							if (levelPlay == 3) {
								audio.src = appConfig.serverUrl + `/static/警报音.mp3`
								audio.play();
								_this.setState({
									playState: '成功'
								})
							} else {
								if (customMp3 != undefined && customMp3 !== "") {
									audio.src = `${appConfig.serverUrl}/static/files/alarm_sound/${customMp3}`
								} else {
									audio.src = `${appConfig.serverUrl}/static/alarm${levelPlay}.mp3`
								}
								audio.play();
								_this.setState({
									playState: '成功'
								})
							}

						} else {
							// audio.pause();// 这个就是暂停
						}
					} catch (error) {
						console.log(error)
					}
				}
			}
			return player
		}
		player();
		// timer = setInterval(player(), 20 * 1000)
	}

	showWarningModal = () => {
		this.setState({
			warningVisible: !this.state.warningVisible
		})
	}

	handleCancel = () => {
		if (appConfig.userData.role && appConfig.userData.role == 1) {
			this.setState({
				warningVisible: false,
			})
			return
		}
		let infoList = this.state.realtimeWarningData.filter(item => item.status == 1)
		infoList = infoList.map(item => {
			return item.info
		})
		if (infoList.length > 0) {
			Modal.confirm({
				title: language == 'en' ? 'Tip' : '提示',
				content: language == 'en' ? 'Closing the alarm pop-up will automatically ignore all alarms for 5 minutes. Please confirm whether to ignore all alarms for 5 minutes.' : '关闭报警弹框将默认忽略所有报警5分钟，请确认是否忽略所有报警5分钟',
				onOk: () => {
					this.setState({
						remark: '',
						warningInfoList: [],
						warningVisible: false,
					})
					http.post('/warning/deal', {
						userName: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
						info: infoList,
						type: 2,
						remark: '忽略',
						ingnoreMinutes: 5
					}).then(res => {
						if (res.err == 0) {
							this.getRealtime()
						} else {
							Modal.error({
								title: language == 'en' ? 'Tip' : '提示',
								content: res.msg
							})
						}
						this.setState({
							remark: '',
							warningInfoList: [],
							warningVisible: false,
						})
					}).catch(err => {
						this.setState({
							warningVisible: false,
							remark: '',
							warningInfoList: []
						})
					})
				}
			})
		} else {
			this.setState({
				warningVisible: false,
				remark: '',
				warningInfoList: []
			})
		}
	}

	setWarningStatus = (status, ignoreTime) => {
		const { warningInfoList, remark, infoList, currentStatus, levelList } = this.state
		if (warningInfoList.length == 0) {
			message.info(language == 'en' ? 'Please select the alarm to be handled.' : '请选择需要处理的报警')
			return
		}
		const newInfoList = []
		if (status == 2) {
			currentStatus.forEach((item, index) => {
				if (item == 1 && infoList[index]) {
					newInfoList.push(infoList[index])
				}
			})
			if (newInfoList.length == 0) {
				Modal.error({
					title: language == 'en' ? 'Tip' : '提示',
					content: language == 'en' ? 'Tip' : 'No negligible alarms found.'
				})
				return
			}
		}

		http.post('/warning/deal', {
			userName: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
			info: status == 2 ? newInfoList : infoList,
			type: status,
			remark: remark,
			ingnoreMinutes: ignoreTime
		}).then(res => {
			if (res.err == 0) {
				this.setState({
					remark: '',
					warningInfoList: []
				})
				this.getRealtime()
			} else {
				Modal.error({
					title: language == 'en' ? 'Tip' : '提示',
					content: res.msg
				})
			}
		}).catch(err => {

		})
	}

	getRealtime = () => {
		http.post('/warning/getRealtime', {
			seconds: 4 * 3600,
			lan: language
		}).then(res => {
			this.refreshWarningData(res)
		}).catch(err => {

		})
	}

	changeRemark = (e) => {
		this.setState({
			remark: e.target.value.trim()
		})
	}

	changeWarningSound = () => {
		const nowWarningSoundSetting = this.state.warningSoundSetting
		this.setState({
			warningSoundSetting: !nowWarningSoundSetting
		})
		db.set('warningSoundSetting', JSON.stringify(!nowWarningSoundSetting)).write();
		localStorage.setItem('warningSoundSetting', !nowWarningSoundSetting)
	}

	showHistoryWarningModalView = () => {
		this.setState({
			historyWarningVisible: true
		})
	}

	closeHistoryWarningModalView = () => {
		this.setState({
			historyWarningVisible: false
		})
	}

	onMouseDown = (e) => {
		e.preventDefault()
		let isDragging = true
		let realtimeWarning = document.querySelector('.realtimeWarning')

		let startPosX = realtimeWarning.style.marginLeft ? e.clientX - parseInt(realtimeWarning.style.marginLeft) : e.clientX
		let startPosY = window.getComputedStyle(realtimeWarning).marginTop ? e.clientY - parseInt(window.getComputedStyle(realtimeWarning).marginTop) : e.clientY

		document.addEventListener('mousemove', drag)
		document.addEventListener('mouseup', dragEnd)

		function drag(event) {
			if (!isDragging) return

			const deltaX = event.clientX - startPosX
			const deltaY = event.clientY - startPosY

			realtimeWarning.style.marginTop = `${deltaY}px`
			realtimeWarning.style.marginLeft = `${deltaX}px`
		}
		function dragEnd() {
			isDragging = false

			document.removeEventListener('mousemove', drag)
			document.removeEventListener('mouseup', dragEnd)
		}
	}

	onTableMouseDown = (e) => {
		e.preventDefault()
		let isDragging = true
		let tableBody = document.querySelector('.realtimeWarning .ant-table-body')
		let maxHeight = parseInt(tableBody.style.maxHeight) > tableBody.scrollHeight ? tableBody.scrollHeight : parseInt(tableBody.style.maxHeight)
		let startPosY = maxHeight ? e.clientY - maxHeight : e.clientY

		document.addEventListener('mousemove', drag)
		document.addEventListener('mouseup', dragEnd)

		function drag(event) {
			if (!isDragging) return

			const deltaY = event.clientY - startPosY
			if (deltaY < 29) return
			if (deltaY - 1 > tableBody.scrollHeight) return
			tableBody.style.maxHeight = `${deltaY}px`
		}
		function dragEnd() {
			isDragging = false

			document.removeEventListener('mousemove', drag)
			document.removeEventListener('mouseup', dragEnd)
		}
	}

	changeModalDisableStatus = (value) => {
		this.setState({
			warningModalDisabled: value
		})
		appConfig.warningModalDisabled = value
		localStorage.setItem('warningModalDisabled', value)
	}

	render() {
		const { warning, warningNum, remark, realtimeWarningData, warningVisible, warningStatusBy135, warningSoundSetting, historyWarningVisible } = this.state
		const columns = language == 'en' ? [
			{
				title: 'time',
				dataIndex: 'time',
				key: 'time',
				width: 110,
				sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
				render: (text) => {
					return <span style={{ zoom: 0.9 }}>{text}</span>
				}
			}, {
				title: 'activite time',
				dataIndex: 'endtime',
				key: 'endtime',
				width: 110,
				sorter: (a, b) => new Date(a.endtime).getTime() - new Date(b.endtime).getTime(),
				render: (text) => {
					return <span style={{ zoom: 0.9 }}>{text}</span>
				}
			}, {
				title: 'end time',
				dataIndex: 'tCloseOpTime',
				key: 'tCloseOpTime',
				width: 110,
				sorter: (a, b) => {
					let atime = a.tCloseOpTime ? new Date(a.tCloseOpTime).getTime() : new Date().getTime()
					let btime = b.tCloseOpTime ? new Date(b.tCloseOpTime).getTime() : new Date().getTime()
					return atime - btime
				},
				render: (text) => {
					return <span style={{ zoom: 0.9 }}>{text}</span>
				}
			}, {
				title: 'title',
				dataIndex: 'info',
				key: 'info',
				width: 270,
				render: (text, record) => {
					return <Tooltip title={text} placement="bottomRight">
						<div style={{ fontWeight: record['status'] == 1 || record['status'] == 2 ? '700' : '500', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', userSelect: 'text' }}>{text}</div>
					</Tooltip>
				}
			}, {
				title: 'detail',
				dataIndex: 'infoDetail',
				key: 'infoDetail',
				width: 270,
				render: (text, record) => {
					return <Tooltip title={text} placement="bottomRight">
						<div style={{ fontWeight: record['status'] == 1 || record['status'] == 2 ? '700' : '500', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', userSelect: 'text' }}>{text}</div>
					</Tooltip>
				}
			}, {
				title: 'group',
				dataIndex: 'ofGroup',
				key: 'ofGroup',
				width: 65,
			}, {
				title: 'level',
				dataIndex: 'level',
				key: 'level',
				width: 40,
				render: (text) => {
					if (language == 'en') {
						return <div>{text == '1' ? 'Info' : text == '2' ? 'Alert' : 'Fault'}</div>
					} else {
						return <div>{text == '1' ? '信息' : text == '2' ? '警告' : '故障'}</div>
					}
				}
			}, {
				title: 'status',
				dataIndex: 'strStatus',
				key: 'strStatus',
				width: 95,
				render: (text, record) => {
					if (record['status'] == 3 || record['status'] == 4) {
						return <div title={`处理人：${record['ignoreUser']}，忽略原因：${record['ignoreRemark']}`}>{text}</div>
					} else if (record['status'] == 5 || record['status'] == 6) {
						return <div title={`处理人：${record['confirmUser']}，确认原因：${record['confirmRemark']}`}>{text}</div>
					} else {
						return <div>{text}</div>
					}
				}
			}, {
				title: 'Related roll-call',
				dataIndex: 'strBindPointName',
				key: 'strBindPointName',
				width: 160,
				render: (text, record) => {
					return (
						<Tooltip title={text} placement="bottomRight"><div className={s['strBindPointName']}><Button type='link' size='small' title={language == 'en' ? 'Historical Trends' : '历史趋势'} icon='line-chart' onClick={() => getTendencyModalByTime(text, record['info'], record['time'])}></Button>{text}</div></Tooltip>
					)
				}
			}
		]
			:
			[
				{
					title: '发生时间',
					dataIndex: 'time',
					key: 'time',
					width: 110,
					sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
					render: (text) => {
						return <span style={{ zoom: 0.9 }}>{text}</span>
					}
				}, {
					title: '最近活动时间',
					dataIndex: 'endtime',
					key: 'endtime',
					width: 110,
					sorter: (a, b) => new Date(a.endtime).getTime() - new Date(b.endtime).getTime(),
					render: (text) => {
						return <span style={{ zoom: 0.9 }}>{text}</span>
					}
				}, {
					title: '消除时间',
					dataIndex: 'tCloseOpTime',
					key: 'tCloseOpTime',
					width: 110,
					sorter: (a, b) => {
						let atime = a.tCloseOpTime ? new Date(a.tCloseOpTime).getTime() : new Date().getTime()
						let btime = b.tCloseOpTime ? new Date(b.tCloseOpTime).getTime() : new Date().getTime()
						return atime - btime
					},
					render: (text) => {
						return <span style={{ zoom: 0.9 }}>{text}</span>
					}
				}, {
					title: '标题',
					dataIndex: 'info',
					key: 'info',
					width: 270,
					render: (text, record) => {
						return <Tooltip title={text} placement="bottomRight">
							<div style={{ fontWeight: record['status'] == 1 || record['status'] == 2 ? '700' : '500', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', userSelect: 'text' }}>{text}</div>
						</Tooltip>
					}
				}, {
					title: '详细信息',
					dataIndex: 'infoDetail',
					key: 'infoDetail',
					width: 270,
					render: (text, record) => {
						return <Tooltip title={text} placement="bottomRight">
							<div style={{ fontWeight: record['status'] == 1 || record['status'] == 2 ? '700' : '500', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', userSelect: 'text' }}>{text}</div>
						</Tooltip>
					}
				}, {
					title: '分组',
					dataIndex: 'ofGroup',
					key: 'ofGroup',
					width: 65,
				}, {
					title: '等级',
					dataIndex: 'level',
					key: 'level',
					width: 40,
					render: (text) => {
						return <div>{text == '1' ? '信息' : text == '2' ? '警告' : '故障'}</div>
					}
				}, {
					title: '状态',
					dataIndex: 'strStatus',
					key: 'strStatus',
					width: 95,
					render: (text, record) => {
						if (record['status'] == 3 || record['status'] == 4) {
							return <div title={`处理人：${record['ignoreUser']}，忽略原因：${record['ignoreRemark']}`}>{text}</div>
						} else if (record['status'] == 5 || record['status'] == 6) {
							return <div title={`处理人：${record['confirmUser']}，确认原因：${record['confirmRemark']}`}>{text}</div>
						} else {
							return <div>{text}</div>
						}
					}
				}, {
					title: '相关点名',
					dataIndex: 'strBindPointName',
					key: 'strBindPointName',
					width: 160,
					render: (text, record) => {
						return (
							<Tooltip title={text} placement="bottomRight"><div className={s['strBindPointName']}><Button type='link' size='small' title='历史趋势' icon='line-chart' onClick={() => getTendencyModalByTime(text, record['info'], record['time'])}></Button>{text}</div></Tooltip>
						)
					}
				}
			]
		return (
			<div style={{ display: 'inline-block' }}>
				<div style={{ marginRight: '10px' }} title={warning}>
					<span className={s['warning-span']}>{warning.length > 30 ? warning.slice(0, 30) + '...' : warning}</span>
					<Button type='link' onClick={this.showWarningModal} title={language == "en" ? "Alarm" : "报警"} style={{ fontSize: 20, color: warningStatusBy135 != 0 ? 'red' : '' }} icon="warning"></Button>
					<Badge count={warningNum} overflowCount={99} showZero={false} style={{ color: 'white' }} className={s['small-num']}></Badge>
				</div>
				<Modal
					title={
						<div onMouseDown={this.onMouseDown} style={{ cursor: 'move' }}>
							<span style={{ color: 'yellow' }}>{language == 'en' ? 'Alarm info' : '报警信息'}</span>
							{
								appConfig.userData.role && appConfig.userData.role == 1 ?
									""
									:
									language == 'en' ?
										<div style={{ display: 'inline-block' }}>
											<Button size='small' style={{ marginRight: 10, marginLeft: 550 }} onClick={() => { this.setWarningStatus(1) }}>Confirm</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 5) }}>Ignore for 5 minutes</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 30) }}>Ignore for 30 minutes.</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 60) }}>Ignore for 1 hour</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 720) }}>Ignore for half a day</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 1440) }}>Ignore for one day</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(3) }}>Clear</Button>
										</div>
										:
										<div style={{ display: 'inline-block' }}>
											<Button size='small' style={{ marginRight: 10, marginLeft: 550 }} onClick={() => { this.setWarningStatus(1) }}>确认</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 5) }}>忽略5分钟</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 30) }}>忽略30分钟</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 60) }}>忽略1小时</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 720) }}>忽略半天</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(2, 1440) }}>忽略1天</Button>
											<Button size='small' style={{ marginRight: 10 }} onClick={() => { this.setWarningStatus(3) }}>消除</Button>
										</div>
							}
							<div style={{ float: 'right', marginRight: 40, marginTop: 4 }}>
								<Button size='small' shape="circle" title={language == 'en' ? 'Historical Alarms' : '历史报警'} icon='exception' onClick={this.showHistoryWarningModalView}></Button>
								{
									appConfig.warningModalDisabled == 1 ?
										<Button size='small' shape="circle" title={language == 'en' ? 'Enable Pop-up' : '启用弹窗'} style={{ color: 'rgb(138,138,138)', marginLeft: 10 }} icon='eye-invisible' onClick={() => { this.changeModalDisableStatus(0) }}></Button>
										:
										<Button size='small' shape="circle" title={language == 'en' ? 'Block Pop-up' : '屏蔽弹窗'} style={{ marginLeft: 10 }} icon='eye' onClick={() => { this.changeModalDisableStatus(1) }}></Button>
								}
								<Button size='small' shape="circle" onClick={this.changeWarningSound} style={{ paddingTop: 3, verticalAlign: 'top', marginLeft: 10 }}>
									{
										warningSoundSetting ?
											<svg t="1699843749183" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11195" width="15" height="15">
												<path d="M64 362.67v298.67h198.33L512 911V113L262.33 362.67H64zM736 512c0-43.56-11.28-83.22-33.83-119-22.56-35.78-52.5-63-89.83-81.67v399c37.33-17.11 67.28-43.55 89.83-79.33C724.72 595.22 736 555.56 736 512zM612.33 75.67v102.67c71.56 21.78 130.67 63.39 177.33 124.83 46.67 61.44 70 131.06 70 208.83 0 77.78-23.33 147.39-70 208.83C743 782.28 683.89 823.89 612.33 845.66v102.67C677.67 932.78 736.78 904 789.67 862s94.5-93.33 124.83-154S960 582 960 512s-15.17-135.33-45.5-196c-30.34-60.67-71.94-112-124.83-154s-112-70.78-177.34-86.33z" p-id="11196" fill="#1296db" />
											</svg>
											:
											<svg t="1699843573700" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10987" width="15" height="15">
												<path d="M736 512c0-43.56-11.28-83.22-33.83-119-22.56-35.78-52.5-63-89.83-81.67V421l121.33 121.33C735.22 536.11 736 526 736 512z m123.67 0c0 45.11-8.56 88.66-25.67 130.67l74.67 77C942.89 654.33 960 585.89 960 514.33S944.83 376.66 914.5 316c-30.33-60.67-71.95-112-124.84-154s-112-70.78-177.33-86.33v102.66c71.55 21.78 130.67 63.39 177.33 124.84 46.67 61.44 70.01 131.05 70.01 208.83zM127 64l-63 63 235.67 235.67H64v298.67h198.33L512 911V575l212.33 212.33c-37.33 28-74.67 47.44-112 58.33v102.66c66.89-15.55 127.55-45.89 182-91L897 960l63-63-448-448L127 64z m385 49L407 218l105 105V113z" p-id="10988" fill="#8a8a8a" />
											</svg>
									}
								</Button>
							</div>
						</div>
					}
					visible={warningVisible}
					onCancel={() => { this.handleCancel() }}
					footer={null}
					maskClosable={false}
					width={window.innerWidth - 100}
					mask={false}
					wrapClassName='realtimeWarning'
				>
					<div>
						<div onMouseDown={this.onMouseDown} style={{ cursor: 'move' }}>
							<Table
								columns={columns}
								pagination={
									realtimeWarningData.length > 50 ?
										{
											pageSize: 50,
											size: "small",
										}
										:
										false
								}
								dataSource={realtimeWarningData}
								size="small"
								bordered
								scroll={{ y: 178 }}
								rowSelection={{
									columnWidth: 40,
									selectedRowKeys: this.state.warningInfoList,
									onChange: (selectedRowKeys, selectedRows) => {
										let infoList = []
										let currentStatus = []
										let levelList = []
										selectedRows.map(item => {
											infoList.push(item['info'])
											currentStatus.push(item['status'])
											levelList.push(item['level'])
										})
										infoList = [...new Set(infoList)]
										levelList = [...new Set(levelList)]
										this.setState({
											warningInfoList: selectedRowKeys,
											infoList: infoList,
											currentStatus: currentStatus,
											levelList: levelList
										})
									},
								}}

								rowClassName={(record, index) => {
									if (record['status'] == 1) {
										return 'warning-status-1'
									} else if (record['status'] == 2) {
										return 'warning-status-2'
									} else if (record['status'] == 3) {
										return 'warning-status-3'
									} else if (record['status'] == 4) {
										return 'warning-status-4'
									} else if (record['status'] == 5) {
										return 'warning-status-5'
									} else if (record['status'] == 6) {
										return 'warning-status-6'
									}
								}}
							/>
						</div>
						{
							appConfig.userData.role && appConfig.userData.role == 1 ?
								""
								:
								<Input size='small' placeholder={language == 'en' ? 'Please fill in the note information when handling the alarm' : '请填写处理报警时的备注信息'} value={remark} onChange={this.changeRemark} style={{ position: 'absolute', width: 500, top: 6, left: 120 }} />
						}
					</div>
					{
						realtimeWarningData.length > 0 ?
							<div style={{ height: 5, cursor: 'row-resize', position: 'absolute', width: '100%' }} onMouseDown={this.onTableMouseDown}></div>
							:
							''
					}
					<HistoryWarningView
						visible={historyWarningVisible}
						handleCancel={this.closeHistoryWarningModalView}
					/>
				</Modal>
			</div>
		);
	}
}

const RealtimeWarningModalView = Form.create()(RealtimeWarningModal)

export default RealtimeWarningModalView;

