/**
 * 场景控制面板
 */
import React from 'react';
import { Select, Modal, Table, Slider, DatePicker, Radio, TimePicker, Tabs, Icon, InputNumber, Button, Input, Row, Col, Upload, Layout, Form, Checkbox, Tag, Spin, Alert } from 'antd'
import s from './SceneControlModalView.css'
import appConfig from '../../../common/appConfig'
import ModelText from '../../observer/components/core/entities/modelText';
import http from '../../../common/http';

const TabPane = Tabs.TabPane;
const language = appConfig.language

let str, addEventStyle, toggleModalClass, formClass, btnStyle, btnStyleAll;
if (localStorage.getItem('serverOmd') == "best") {
	str = 'warning-config-best'
	btnStyle = {
		background: "#E1E1E1",
		border: 0,
		color: "#000",
		fontSize: "12px",
		lineHeight: "25px",
		height: '25px',
		marginRight: '5px'
	}
} else if (localStorage.getItem('serverOmd') == "persagy") {
	str = 'PersagyCalendarModal'
	toggleModalClass = 'persagy-modal'
	formClass = 'persagy-dashBoardLine-form'
	btnStyle = {
		background: 'rgba(255,255,255,1)',
		borderRadius: '4px',
		border: '1px solid rgba(195,199,203,1)',
		fontSize: "12px",
		lineHeight: "25px",
		height: '25px',
		marginRight: '5px',
		fontFamily: 'PingFangSC-Regular,PingFang SC',
		color: 'rgba(31,36,41,1)',
	}
} else {
	str = ''
	btnStyle = {
		fontSize: "12px",
		lineHeight: "25px",
		height: '25px',
		marginRight: '5px',
		marginBottom: '5px'

	}
	btnStyleAll = {
		fontSize: "12px",
		lineHeight: "25px",
		height: '25px',
		marginRight: '5px',
		marginBottom: '5px',
		backgroundColor: '#60b8fa'
	}
}

class SceneControlModalView extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modal: this.props.modal,
			selectedData: [],
			selectedId: this.props.selectedId[0],
			tableData: [],
			sceneBtnLoading: false,
			userList: [],
			timeList: [],
			currentValueIndex: 0,
			dataSource: [],
			subData: {},      //数据   
			sceneList: [],
			currentModelId: this.props.selectedId[0],
			tagList: [],
			modalList: [],
			scenePointData: [],
			controlData: [],
			valueData: [],
			pointList: [],
			valueList: [],
			sliderLoading: false,
			paneTitle: "控制设置", //面板名称
			controlData1: [],
			paneTitle1: "控制设置1",
			controlData2: [],
			paneTitle2: "控制设置2",
			controlData3: [],
			paneTitle3: "控制设置3",
			controlData4: [],
			paneTitle4: "控制设置4",
			controlData5: [],
			paneTitle5: "控制设置5",
			allPointList: []
		}
		this.loadTable = this.loadTable.bind(this)
		this.confirm = this.confirm.bind(this);
		this.getSceneList = this.getSceneList.bind(this)
		this.getAllTags = this.getAllTags.bind(this);
		this.getSceneByTag = this.getSceneByTag.bind(this);
		this.getTagBtns = this.getTagBtns.bind(this);
		this.getScenePointList = this.getScenePointList.bind(this);
		this.getSceneBtns = this.getSceneBtns.bind(this);
		this.showRunEnv = this.showRunEnv.bind(this);
		this.runScene = this.runScene.bind(this);
		this.countCompare = this.countCompare.bind(this);
		this.getControlRangeTitle = this.getControlRangeTitle.bind(this);
		this.sendValue = this.sendValue.bind(this);
		this.onContextMenu = this.onContextMenu.bind(this);
		this.getControlData = this.getControlData.bind(this);
	}
	static get defaultProps() {
		return {
			modal: {
				type: null,
				props: {}
			}
		}
	}

	// componentDidMount(){
	// 	new LimitDrag('.ant-modal-content');
	// }


	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.visible !== this.props.visible && nextProps.visible == true) {
			this.setState({
				pointList: [],
				valueList: [],
				sliderLoading: true
			})
			http.post('/project/getConfigMul', {
				keyList: ["control_panel_define",
					"control_panel_define1",
					"control_panel_define2",
					"control_panel_define3",
					"control_panel_define4",
					"control_panel_define5"
				]
			}).then(data => {
				if (data.data) {
					this.getControlData(data)
				}
			}).catch(err => {
				Modal.info({
					title: '获取“控制设置面板”的配置失败',
					content: "请检查后台（dompysite）版本，需0.9.36以上版本才可正常使用！"
				})
				this.setState({
					sliderLoading: false
				})
			})
			return true
		} else {
			if (nextState == this.state) {
				return false
			} else {
				return true
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible != this.props.visible) {
			this.getSceneList()
			this.getAllTags()
		}
	}

	// 处理参数组和参数名称的国际化
	processParamGroupList(paramGroupList) {
		return paramGroupList;
	}

	getControlData(data) {
		//6个面板共用数据存储，可以一起请求点值
		let pointList = []

		//先单独判断是否有control_panel_define，如果没有，也要显示个空面板；有的话，单独存在state里
		if (data.data.control_panel_define) {
			if (data.data.control_panel_define.paramGroupList) {
				let paramGroupList = language == 'en' && data.data.control_panel_define.paramGroupList_EN ? data.data.control_panel_define.paramGroupList_EN : data.data.control_panel_define.paramGroupList
				//设置面板名称
				if (data.data.control_panel_define.title != undefined) {
					this.setState({
						paneTitle: language == 'en' && data.data.control_panel_define.title_EN ? data.data.control_panel_define.title_EN : data.data.control_panel_define.title
					})
				} else {
					this.setState({
						paneTitle: language == 'en' ? "Control settings" : "控制设置"
					})
				}
				if (data.data.control_panel_define.roomName != undefined) {
					//如果配置了点名前缀，就将paramGroupList里的点名先加前缀处理
					paramGroupList.map((oItems) => {
						oItems.params.map((oJ) => {
							if (oJ.type == 'slider') {
								oJ.pointMax = data.data.control_panel_define.roomName + oJ.pointMax;
								oJ.pointMin = data.data.control_panel_define.roomName + oJ.pointMin;
								pointList.push(oJ.pointMax);
								pointList.push(oJ.pointMin);
							}
							if (oJ.type == 'checkbox') {
								oJ.point = data.data.control_panel_define.roomName + oJ.point;
								pointList.push(oJ.point);
							}
							if (oJ.type == 'singleSlider') {
								oJ.point = data.data.control_panel_define.roomName + oJ.point;
								pointList.push(oJ.point);
							}
						})
					});
				} else {
					data.data.control_panel_define.paramGroupList.map((item) => {
						item.params.map((paramsList) => {
							if (paramsList.type == 'slider') {
								pointList.push(paramsList.pointMin)
								pointList.push(paramsList.pointMax)
							}
							if (paramsList.type == 'checkbox') {
								pointList.push(paramsList.point)
							}
							if (paramsList.type == 'singleSlider') {
								pointList.push(paramsList.point)
							}
						})
					});
				};

				this.setState({
					controlData: this.processParamGroupList(paramGroupList)
				})
			}
		}
		//control_panel_define1
		if (data.data.control_panel_define1) {
			if (data.data.control_panel_define1.paramGroupList) {
				let paramGroupList = language == 'en' && data.data.control_panel_define1.paramGroupList_EN ? data.data.control_panel_define1.paramGroupList_EN : data.data.control_panel_define1.paramGroupList
				//设置面板名称
				if (data.data.control_panel_define1.title != undefined) {
					this.setState({
						paneTitle1: language == 'en' && data.data.control_panel_define1.title_EN ? data.data.control_panel_define1.title_EN : data.data.control_panel_define1.title
					})
				} else {
					this.setState({
						paneTitle1: language == 'en' ? "Control settings one" : "控制设置1"
					})
				}
				if (data.data.control_panel_define1.roomName != undefined) {
					//如果配置了点名前缀，就将paramGroupList里的点名先加前缀处理
					paramGroupList.map((oItems) => {
						oItems.params.map((oJ) => {
							if (oJ.type == 'slider') {
								oJ.pointMax = data.data.control_panel_define1.roomName + oJ.pointMax;
								oJ.pointMin = data.data.control_panel_define1.roomName + oJ.pointMin;
								pointList.push(oJ.pointMax);
								pointList.push(oJ.pointMin);
							}
							if (oJ.type == 'checkbox') {
								oJ.point = data.data.control_panel_define1.roomName + oJ.point;
								pointList.push(oJ.point);
							}
							if (oJ.type == 'singleSlider') {
								oJ.point = data.data.control_panel_define1.roomName + oJ.point;
								pointList.push(oJ.point);
							}
						})
					});
				} else {
					data.data.control_panel_define1.paramGroupList.map((item) => {
						item.params.map((paramsList) => {
							if (paramsList.type == 'slider') {
								pointList.push(paramsList.pointMin)
								pointList.push(paramsList.pointMax)
							}
							if (paramsList.type == 'checkbox') {
								pointList.push(paramsList.point)
							}
							if (paramsList.type == 'singleSlider') {
								pointList.push(paramsList.point)
							}
						})
					});
				};
				this.setState({
					controlData1: this.processParamGroupList(paramGroupList)
				})
			}
		}

		//control_panel_define2
		if (data.data.control_panel_define2) {
			if (data.data.control_panel_define2.paramGroupList) {
				let paramGroupList = language == 'en' && data.data.control_panel_define2.paramGroupList_EN ? data.data.control_panel_define2.paramGroupList_EN : data.data.control_panel_define2.paramGroupList
				//设置面板名称
				if (data.data.control_panel_define2.title != undefined) {
					this.setState({
						paneTitle2: language == 'en' && data.data.control_panel_define2.title_EN ? data.data.control_panel_define2.title_EN : data.data.control_panel_define2.title
					})
				} else {
					this.setState({
						paneTitle2: language == 'en' ? "Control settings two" : "控制设置2"
					})
				}
				if (data.data.control_panel_define2.roomName != undefined) {
					//如果配置了点名前缀，就将paramGroupList里的点名先加前缀处理
					paramGroupList.map((oItems) => {
						oItems.params.map((oJ) => {
							if (oJ.type == 'slider') {
								oJ.pointMax = data.data.control_panel_define2.roomName + oJ.pointMax;
								oJ.pointMin = data.data.control_panel_define2.roomName + oJ.pointMin;
								pointList.push(oJ.pointMax);
								pointList.push(oJ.pointMin);
							}
							if (oJ.type == 'checkbox') {
								oJ.point = data.data.control_panel_define2.roomName + oJ.point;
								pointList.push(oJ.point);
							}
							if (oJ.type == 'singleSlider') {
								oJ.point = data.data.control_panel_define2.roomName + oJ.point;
								pointList.push(oJ.point);
							}
						})
					});
				} else {
					data.data.control_panel_define2.paramGroupList.map((item) => {
						item.params.map((paramsList) => {
							if (paramsList.type == 'slider') {
								pointList.push(paramsList.pointMin)
								pointList.push(paramsList.pointMax)
							}
							if (paramsList.type == 'checkbox') {
								pointList.push(paramsList.point)
							}
							if (paramsList.type == 'singleSlider') {
								pointList.push(paramsList.point)
							}
						})
					});
				};
				this.setState({
					controlData2: this.processParamGroupList(paramGroupList)
				})
			}
		}

		//control_panel_define3
		if (data.data.control_panel_define3) {
			if (data.data.control_panel_define3.paramGroupList) {
				let paramGroupList = language == 'en' && data.data.control_panel_define3.paramGroupList_EN ? data.data.control_panel_define3.paramGroupList_EN : data.data.control_panel_define3.paramGroupList
				//设置面板名称
				if (data.data.control_panel_define3.title != undefined) {
					this.setState({
						paneTitle3: language == 'en' && data.data.control_panel_define3.title_EN ? data.data.control_panel_define3.title_EN : data.data.control_panel_define3.title
					})
				} else {
					this.setState({
						paneTitle3: language == 'en' ? "Control settings three" : "控制设置3"
					})
				}
				if (data.data.control_panel_define3.roomName != undefined) {
					//如果配置了点名前缀，就将paramGroupList里的点名先加前缀处理
					paramGroupList.map((oItems) => {
						oItems.params.map((oJ) => {
							if (oJ.type == 'slider') {
								oJ.pointMax = data.data.control_panel_define3.roomName + oJ.pointMax;
								oJ.pointMin = data.data.control_panel_define3.roomName + oJ.pointMin;
								pointList.push(oJ.pointMax);
								pointList.push(oJ.pointMin);
							}
							if (oJ.type == 'checkbox') {
								oJ.point = data.data.control_panel_define3.roomName + oJ.point;
								pointList.push(oJ.point);
							}
							if (oJ.type == 'singleSlider') {
								oJ.point = data.data.control_panel_define3.roomName + oJ.point;
								pointList.push(oJ.point);
							}
						})
					});
				} else {
					data.data.control_panel_define3.paramGroupList.map((item) => {
						item.params.map((paramsList) => {
							if (paramsList.type == 'slider') {
								pointList.push(paramsList.pointMin)
								pointList.push(paramsList.pointMax)
							}
							if (paramsList.type == 'checkbox') {
								pointList.push(paramsList.point)
							}
							if (paramsList.type == 'singleSlider') {
								pointList.push(paramsList.point)
							}
						})
					});
				};
				this.setState({
					controlData3: this.processParamGroupList(paramGroupList)
				})
			}
		}

		//control_panel_define4
		if (data.data.control_panel_define4) {
			if (data.data.control_panel_define4.paramGroupList) {
				let paramGroupList = language == 'en' && data.data.control_panel_define4.paramGroupList_EN ? data.data.control_panel_define4.paramGroupList_EN : data.data.control_panel_define4.paramGroupList
				//设置面板名称
				if (data.data.control_panel_define4.title != undefined) {
					this.setState({
						paneTitle4: language == 'en' && data.data.control_panel_define4.title_EN ? data.data.control_panel_define4.title_EN : data.data.control_panel_define4.title
					})
				} else {
					this.setState({
						paneTitle4: language == 'en' ? "Control settings four" : "控制设置4"
					})
				}
				if (data.data.control_panel_define4.roomName != undefined) {
					//如果配置了点名前缀，就将paramGroupList里的点名先加前缀处理
					paramGroupList.map((oItems) => {
						oItems.params.map((oJ) => {
							if (oJ.type == 'slider') {
								oJ.pointMax = data.data.control_panel_define4.roomName + oJ.pointMax;
								oJ.pointMin = data.data.control_panel_define4.roomName + oJ.pointMin;
								pointList.push(oJ.pointMax);
								pointList.push(oJ.pointMin);
							}
							if (oJ.type == 'checkbox') {
								oJ.point = data.data.control_panel_define4.roomName + oJ.point;
								pointList.push(oJ.point);
							}
							if (oJ.type == 'singleSlider') {
								oJ.point = data.data.control_panel_define4.roomName + oJ.point;
								pointList.push(oJ.point);
							}
						})
					});
				} else {
					data.data.control_panel_define4.paramGroupList.map((item) => {
						item.params.map((paramsList) => {
							if (paramsList.type == 'slider') {
								pointList.push(paramsList.pointMin)
								pointList.push(paramsList.pointMax)
							}
							if (paramsList.type == 'checkbox') {
								pointList.push(paramsList.point)
							}
							if (paramsList.type == 'singleSlider') {
								pointList.push(paramsList.point)
							}
						})
					});
				};
				this.setState({
					controlData4: this.processParamGroupList(paramGroupList)
				})
			}
		}

		//control_panel_define5
		if (data.data.control_panel_define5) {
			if (data.data.control_panel_define5.paramGroupList) {
				let paramGroupList = language == 'en' && data.data.control_panel_define5.paramGroupList_EN ? data.data.control_panel_define5.paramGroupList_EN : data.data.control_panel_define5.paramGroupList
				//设置面板名称
				if (data.data.control_panel_define5.title != undefined) {
					this.setState({
						paneTitle5: language == 'en' && data.data.control_panel_define5.title_EN ? data.data.control_panel_define5.title_EN : data.data.control_panel_define5.title
					})
				} else {
					this.setState({
						paneTitle5: language == 'en' ? "Control settings five" : "控制设置5"
					})
				}
				if (data.data.control_panel_define5.roomName != undefined) {
					//如果配置了点名前缀，就将paramGroupList里的点名先加前缀处理
					paramGroupList.map((oItems) => {
						oItems.params.map((oJ) => {
							if (oJ.type == 'slider') {
								oJ.pointMax = data.data.control_panel_define5.roomName + oJ.pointMax;
								oJ.pointMin = data.data.control_panel_define5.roomName + oJ.pointMin;
								pointList.push(oJ.pointMax);
								pointList.push(oJ.pointMin);
							}
							if (oJ.type == 'checkbox') {
								oJ.point = data.data.control_panel_define5.roomName + oJ.point;
								pointList.push(oJ.point);
							}
							if (oJ.type == 'singleSlider') {
								oJ.point = data.data.control_panel_define5.roomName + oJ.point;
								pointList.push(oJ.point);
							}
						})
					});
				} else {
					data.data.control_panel_define5.paramGroupList.map((item) => {
						item.params.map((paramsList) => {
							if (paramsList.type == 'slider') {
								pointList.push(paramsList.pointMin)
								pointList.push(paramsList.pointMax)
							}
							if (paramsList.type == 'checkbox') {
								pointList.push(paramsList.point)
							}
							if (paramsList.type == 'singleSlider') {
								pointList.push(paramsList.point)
							}
						})
					});
				};
				this.setState({
					controlData5: this.processParamGroupList(paramGroupList)
				})
			}
		}
		this.setState({
			allPointList: pointList
		})
		this.getRealtimeData(pointList)
	}

	getRealtimeData = (pointList) => {
		http.post('/get_realtimedata', {
			proj: 1,
			pointList: pointList,
			...(language == 'en' ? { "lan": "en" } : {})
		}).then(
			data => {
				this.setState({
					valueData: data,
					sliderLoading: false,
					valueList: [],
					pointList: []
				})
			}
		).catch(
			err => {
				this.setState({
					sliderLoading: false,
					valueList: [],
					pointList: []
				})
				console.log('获取点值接口请求失败！')
			}
		)
	}

	loadTable() {
		const _this = this
		this.setState({
			loading: true
		})

	}

	getControlRangeTitle(controlData, valueData) {
		let min, max, step
		let disabled
		return controlData.map((item) => {
			return (
				<div style={{ marginBottom: '10px' }} >
					<div style={{ marginBottom: '10px' }} >{item.name}</div>
					<div style={{ border: '1px solid #ccc', padding: '10px 10px 5px 10px', marginRight: 10 }} >
						{item.params.map((paramsList) => {
							if (paramsList.type == 'slider') {
								if (paramsList.rangeMin !== "" && paramsList.rangeMax !== "" && paramsList.rangeMin !== undefined && paramsList.rangeMax !== undefined) {
									min = paramsList.rangeMin
									max = paramsList.rangeMax
								} else {
									min = 0
									max = 100
								}
								if (paramsList.step) {
									step = paramsList.step
								} else {
									step = 1
								}
								let rangeList = []

								this.state.pointList.map((item, index) => {
									if (item == paramsList.pointMin) {
										rangeList[0] = this.state.valueList[index]
									} else if (item == paramsList.pointMax) {
										rangeList[1] = this.state.valueList[index]
									}
								})
								if (rangeList[0] == undefined && rangeList[1] == undefined) {
									if (valueData != [] && valueData[0] != undefined) {
										valueData.map((item3) => {
											if (paramsList.pointMin == item3.name) {
												rangeList[0] = Number(item3.value)
											}
											if (paramsList.pointMax == item3.name) {
												rangeList[1] = Number(item3.value)
											}
										})
									} else {
										rangeList[0] = 0
										rangeList[1] = 100
									}
								}

								let marks = {}
								marks[min] = { style: { marginTop: -10 }, label: min }
								marks[max] = { style: { marginTop: -10 }, label: max }
								rangeList.map((item) => {
									if (item != min && item != max) {
										marks[item] = { style: { marginTop: -10 }, label: item }
									}
								})
								if (rangeList[0] != undefined && rangeList[1] != undefined && this.props.isLowPower == false) {
									disabled = false
								} else {
									disabled = true
								}
								return (
									<div style={{ marginBottom: -10 }}>
										<div style={{ display: 'inline-block', position: 'relative', top: -29, marginRight: 10, marginLeft: 10, width: 250, cursor: 'pointer' }} onContextMenu={(e) => this.onContextMenu(e, paramsList.pointMin, rangeList[0])}>{paramsList.name} &nbsp;<Button style={{ zoom: 0.6 }} onClick={(e) => { this.onContextMenu(e, paramsList.pointMin, rangeList[0]) }} shape="circle" icon="info" /></div>
										<Slider range step={step} min={min} max={max} disabled={disabled} marks={marks} defaultValue={rangeList} style={{ width: 630, display: 'inline-block' }} onAfterChange={(value) => this.sliderChangeValue(value, paramsList.pointMin, paramsList.pointMax)} />
										<div style={{ display: 'inline-block', position: 'relative', top: -29, marginRight: 10, marginLeft: 10, cursor: 'pointer' }} onContextMenu={(e) => this.onContextMenu(e, paramsList.pointMax, rangeList[1])}>{paramsList.unit ? `（${paramsList.unit}）` : " "}&nbsp;<Button style={{ zoom: 0.6 }} onClick={(e) => { this.onContextMenu(e, paramsList.pointMax, rangeList[1]) }} shape="circle" icon="info" /></div>
									</div>
								)
							}
							if (paramsList.type == 'singleSlider') {
								if (paramsList.rangeMin !== "" && paramsList.rangeMax !== "" && paramsList.rangeMin !== undefined && paramsList.rangeMax !== undefined) {
									min = paramsList.rangeMin
									max = paramsList.rangeMax
								} else {
									min = 0
									max = 100
								}
								if (paramsList.step) {
									step = paramsList.step
								} else {
									step = 1
								}
								let rangeList = []
								this.state.pointList.map((item, index) => {
									if (item == paramsList.point) {
										rangeList[0] = this.state.valueList[index]
									}
								})
								if (rangeList[0] == undefined) {
									if (valueData[0] != undefined) {
										valueData.map((item3) => {
											if (paramsList.point == item3.name) {
												rangeList[0] = Number(item3.value)
											}
										})
									} else {
										rangeList[0] = 0
									}
								}

								let marks = {}
								marks[min] = { style: { marginTop: -10 }, label: min }
								marks[max] = { style: { marginTop: -10 }, label: max }
								rangeList.map((item) => {
									if (item != min && item != max) {
										marks[item] = { style: { marginTop: -10 }, label: item }
									}
								})
								if (rangeList[0] != undefined && this.props.isLowPower == false) {
									disabled = false
								} else {
									disabled = true
								}
								return (
									<div style={{ marginBottom: -10 }}>
										<div style={{ display: 'inline-block', position: 'relative', top: -29, marginRight: 10, marginLeft: 10, width: 250, cursor: 'pointer' }} onContextMenu={(e) => this.onContextMenu(e, paramsList.point, rangeList[0])}>{paramsList.name} &nbsp;<Button style={{ zoom: 0.6 }} onClick={(e) => { this.onContextMenu(e, paramsList.point, rangeList[0]) }} shape="circle" icon="info" /></div>
										<Slider step={step} min={min} max={max} disabled={disabled} marks={marks} defaultValue={rangeList[0]} style={{ width: 630, display: 'inline-block' }} onAfterChange={(value) => this.sliderChangeValue2(value, paramsList.point)} />
										<div style={{ display: 'inline-block', position: 'relative', top: -29, marginRight: 10, marginLeft: 10 }}>{paramsList.unit ? `（${paramsList.unit}）` : ""}</div>
									</div>
								)
							}
							if (paramsList.type == 'checkbox') {
								let flag = 0
								if (valueData[0] != undefined) {
									valueData.map((item3) => {
										if (paramsList.point == item3.name) {
											flag = item3.value
										}
									})
								}
								if (flag == 0) {
									return (
										<div style={{ marginTop: 5, marginBottom: 5 }}>
											<div style={{ display: 'inline-block', height: 25, marginRight: 10, marginLeft: 10, width: 250, cursor: 'pointer' }} onContextMenu={(e) => this.onContextMenu(e, paramsList.point, 0)}>{paramsList.name} &nbsp;<Button style={{ zoom: 0.6 }} onClick={(e) => { this.onContextMenu(e, paramsList.point, 0) }} shape="circle" icon="info" /></div>
											<Checkbox defaultChecked={false} onChange={(e) => { this.checkboxChangeValue(e, paramsList.point) }} disabled={this.props.isLowPower}></Checkbox>
										</div>
									)
								} else {
									return (
										<div style={{ marginTop: 5, marginBottom: 5 }}>
											<div style={{ display: 'inline-block', height: 25, marginRight: 10, marginLeft: 10, width: 250, cursor: 'pointer' }} onContextMenu={(e) => this.onContextMenu(e, paramsList.point, 1)}>{paramsList.name} &nbsp;<Button style={{ zoom: 0.6 }} onClick={(e) => { this.onContextMenu(e, paramsList.point, 1) }} shape="circle" icon="info" /></div>
											<Checkbox defaultChecked={true} onChange={(e) => { this.checkboxChangeValue(e, paramsList.point) }} disabled={this.props.isLowPower} ></Checkbox>
										</div>
									)
								}
							}
						})}
					</div>
				</div>
			)
		})
	}

	checkboxChangeValue(e, point) {
		let value
		if (e.target.checked == true) {
			value = 1
		} else {
			value = 0
		}
		let valueList = this.state.valueList
		let pointList = this.state.pointList
		let flag = 0
		for (let i = 0; i < pointList.length; i++) {
			if (pointList[i] == point) {
				flag = 1
				valueList[i] = value
			}
		}
		if (flag == 0) {
			pointList.push(point)
			valueList.push(value)
		}
		this.setState({
			valueList: valueList,
			pointList: pointList
		})

	}

	sliderChangeValue(List, pointMin, pointMax) {
		let valueList = this.state.valueList
		let pointList = this.state.pointList
		let flag = 0
		for (let i = 0; i < pointList.length; i++) {
			if (pointList[i] == pointMin) {
				flag = 1
				valueList[i] = List[0]
				valueList[i + 1] = List[1]
			}
		}
		if (flag == 0) {
			pointList.push(pointMin)
			pointList.push(pointMax)
			valueList.push(List[0])
			valueList.push(List[1])
		}

		this.setState({
			valueList: valueList,
			pointList: pointList
		})
	}
	sliderChangeValue2(List, point) {
		let valueList = this.state.valueList
		let pointList = this.state.pointList
		let flag = 0
		for (let i = 0; i < pointList.length; i++) {
			if (pointList[i] == point) {
				flag = 1
				valueList[i] = List
			}
		}
		if (flag == 0) {
			pointList.push(point)
			valueList.push(List)
		}

		this.setState({
			valueList: valueList,
			pointList: pointList
		})
	}

	//右击文本事件 
	onContextMenu(e, point, value) {
		let idCom = point
		let _this = this
		e.preventDefault()
		// 设置属性是否在弹窗里面
		let isInfo = {
			"isInModal": false
		}
		//重新定义函数，继承原函数所有的属性和函数        
		let model = new ModelText()
		model.options = {
			getTendencyModal: _this.props.getTendencyModal,
			showCommonAlarm: _this.props.showCommonAlarm,
			showMainInterfaceModal: _this.props.showMainInterfaceModal,
			getToolPoint: _this.props.getToolPoint
		}

		let clientWidth = document.documentElement.clientWidth,
			clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
		let widthScale = 0, heightScale = 0;
		widthScale = clientWidth / 1920
		heightScale = clientHeight / 955
		e.offsetX = e.clientX - 5,
			e.offsetY = e.clientY - 80

		model.idCom = idCom
		model.value = value
		model.showModal(e, isInfo, widthScale, heightScale)
	}

	sendValue(pointList, valueList) {
		let _this = this
		Modal.confirm({
			title: language == 'en' ? 'Do you want to save the modified configuration?' : '是否保存修改配置？',
			content: language == 'en' ? 'Click the "OK" button to save the modified configuration.' : '点击"确认"按钮保存修改配置。',
			onOk() {
				if (pointList[0] != undefined) {
					http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
						token: appConfig.token,
						pointList: pointList,
						valueList: valueList,
						source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
						onduty: appConfig.onduty,
						cloudUserId: appConfig.cloudUser.cloudUserId,
						projectId: appConfig.projectId,
						waitSuccess: 1,
					}).then(
						data => {
							if (data.err == 0) {
								_this.getRealtimeData(_this.state.allPointList)
								console.log("修改点值成功！")
							} else {
								console.log("修改点值失败！")
								Modal.error({
									title: '警告',
									content: data.msg
								})
							}
						}
					).catch(error => {
						Modal.error({
							title: '警告',
							content: error.message
						})
					})
				}
			},
			onCancel() {
			}
		})
	}

	getScenePointList(id) {
		// this.props.SceneLoad(true)
		// this.props.getSceneData([])
		// this.props.SceneSelectId(record.envId)
		http.post('/env/get', {
			lan: language,
			id: id
		}).then(
			data => {
				if (data.err === 0) {
					// this.props.getSceneData(data.data.detail)
					// this.props.SceneLoad(false)
					this.setState({
						scenePointData: data.data.detail
					})
					if (data.data.detail.length === 0) {
						Modal.info({
							title: '信息提示',
							content: "该场景内容为空"
						})
					} else {
						this.runScene(data.data.detail, data.data.name)
					}
				} else {
					Modal.error({
						title: '错误提示',
						content: data.msg
					})
				}

				// this.props.SceneLoad(false)
			}
		).catch(
			error => {
				Modal.error({
					title: '错误提示',
					content: error.msg
				})
				// this.props.SceneLoad(false)
				// console.log(error)
			}
		)
	}

	runScene(data, name) {
		let pointValue = []
		let pointName = []
		data.map(rowObj => {
			pointValue.push(rowObj.pointValue)
			pointName.push(rowObj.pointName)
		})
		http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
			token: appConfig.token,
			pointList: pointName,
			valueList: pointValue,
			source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					Modal.success({
						title: '场景运行成功',
						content: `${name}场景运行成功！`
					})
					//增加操作记录
					http.post('/operationRecord/add', {
						"userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
							JSON.parse(localStorage.getItem('userInfo')).name : '',
						"content": `运行${name}场景`,
						"address": ''
					}).then(
						data => {

						}
					)
					//记录历史运行次数，根据localstorage中的值增加，并保存一个对应的全局count变量
					appConfig[name + 'Count'] = window.localStorage.getItem(name + 'Count') ? parseInt(window.localStorage.getItem(name + 'Count')) + 1 : 1
					//更新localStorage
					window.localStorage.setItem(name + 'Count', appConfig[name + 'Count'])
					//刷新一下场景控制
					this.getSceneList()
					// tableLoading(true)
					// var lastFailedArr //保存最后一次检查后修改失败的数据
					// let checkWorker = new CheckWorker(function (info, next, stop) {
					//     http.post('/get_realtimedata',{
					//         pointList: selectedIds,
					//         proj: 1
					//       }).then(
					//         data =>{
					//             console.info( data )
					//             var failedSetArr = []

					//             for(let i = 0 ,len = data.length ; i<len ;i++){
					//                 //将没有改值成功的添加到数组中
					//                 if(data[i]['value'] !== value ){
					//                     failedSetArr.push(data[i])
					//                 }
					//             }
					//             lastFailedArr = failedSetArr
					//             // lastFailedArr = [{
					//             //     name:'测试点1'
					//             // },{
					//             //     name:'测试点2'
					//             // },{
					//             //     name:'测试点3'
					//             // }]
					//             if(failedSetArr.length){
					//                 //执行下一次check，触发progress事件
					//                 //如果达到设置的check次数，会还会触发complete
					//                 next(); 
					//             } else {
					//                 // 直接停止，无需执行下一次 check
					//                 // 会触发 progress 和 stop 事件
					//                 stop();
					//             }
					//         }
					//       )
					//   }, {
					//   // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
					// })

					// checkWorker
					// .on('progress', function ({progress}) {console.info('progress', progress)})
					// .on('stop', function ({progress}) {
					//     reloadTable()
					// })
					// .on('complete', function ({progress}) { 
					//     tableLoading(false)
					//     if(lastFailedArr.length){
					//         ModalInfo({
					//             title : '以下点位修改失败',
					//             content: (
					//                 <div>
					//                     {_this.getInfo()}
					//                 </div>
					//             ),
					//             onOk(){}
					//         })
					//     }

					// })
					// .start()
				} else {
					Modal.info({
						title: '场景运行失败',
						content: '通讯失败，本场景没有执行！'
					})
				}
			}
		)
	}

	confirm() {  //确认
		let dataSource = this.state.dataSource
		// console.log(this.props.selectedId[0])
		let pointValue = []
		let pointName = []
		dataSource.map(rowObj => {
			pointValue.push(rowObj.pointValue)
			pointName.push(rowObj.pointName)
		})
		this.props.savePoint(pointValue, pointName, this.props.selectedId[0])
	}

	countCompare(propertyName) {                 //排序函数（根据数组内每个对象元素内的指定的值进行排序）
		return function (projectFirst, projectSecond) {
			let valueFirst = projectFirst[propertyName]
			let valueSecond = projectSecond[propertyName]
			if (valueFirst > valueSecond) {
				return -1
			} else if (valueFirst < valueSecond) {
				return 1
			} else {
				return 0
			}
		}
	}

	//获取所有场景列表
	getSceneList() {
		this.setState({
			sceneBtnLoading: true
		})
		var btns = document.getElementsByClassName('bindBtnTag');
		for (let i = 0; i < btns.length; i++) {
			if (localStorage.getItem('serverOmd') == "best") {
				btns[i].style.backgroundColor = '#E1E1E1';
			} else if (localStorage.getItem('serverOmd') == "persagy") {
				btns[i].style.backgroundColor = '#fff';
			} else {
				btns[i].style.backgroundColor = '';
			}
			if (btns[i].id == "btnAllTag") {
				btns[i].style.backgroundColor = '#60b8fa';
			}
		}
		return http.get(language == 'en' ? '/env/getAll?lan=en' : '/env/getAll').
			then(
				data => {
					if (!data.err) {
						if (data.data.length != 0) {
							let newSceneList = data.data.map((scene) => {
								//根据localstorage中的值添加对应的属性
								scene['Count'] = window.localStorage.getItem(scene.name + 'Count') ? parseInt(window.localStorage.getItem(scene.name + 'Count')) : 0
								return scene
							})
							newSceneList.sort(this.countCompare('Count'))
							this.setState(
								{
									sceneList: newSceneList
								}
							)
						}
					} else {
						Modal.error({
							title: '错误提示',
							content: '获取场景列表失败'
						})
					}
					this.setState({
						sceneBtnLoading: false
					})
				}
			).catch(
				(error) => {
					Modal.error({
						title: '错误提示',
						content: error.msg
					})
					// console.log(error)
					this.setState({
						sceneBtnLoading: false
					})
				}
			)
	}

	//获取所有标签
	getAllTags() {
		http.get('/env/getAllTags').then(
			data => {
				if (!data.err) {
					this.setState({
						tagList: data.data
					})
					// this.getTagBtns()
				} else {
					// console.log("场景控制面板tag获取失败"+data.msg)
				}
			}
		).catch(
			error => {
				// console.log(error)
			}
		)
	}
	//通过tag获取场景
	getSceneBtnByTag(tag) {
		http.post('/env/getEnvByTags', {
			tags: [tag]
		}).then(
			data => {
				if (data.err === 0) {
					if (data.data.length != 0) {
						let newSceneList = data.data.map((scene) => {
							//根据localstorage中的值添加对应的属性
							scene['Count'] = window.localStorage.getItem(scene.name + 'Count') ? parseInt(window.localStorage.getItem(scene.name + 'Count')) : 0
							return scene
						})
						newSceneList.sort(this.countCompare('Count'))
						this.setState({
							sceneList: newSceneList
						})
					}
				}
				this.setState({
					sceneBtnLoading: false
				})
			}
		).catch(
			error => {
				Modal.error({
					title: '错误提示',
					content: error.msg
				})
				this.setState({
					sceneBtnLoading: false
				})
			}
		)
	}

	showRunEnv(index) {
		Modal.confirm({
			title: '确认信息',
			content: `确定运行${index.name}场景吗？`,
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				this.getScenePointList(index.id)
			}
		});
	}

	getSceneByTag(tag) {
		this.setState({
			sceneBtnLoading: true
		})
		this.getSceneBtnByTag(tag)
		var btns = document.getElementsByClassName('bindBtnTag');
		for (let i = 0; i < btns.length; i++) {
			// if(localStorage.getItem('serverOmd')=="best") {
			//   btns[i].style.backgroundColor='#E1E1E1';
			// } else if (localStorage.getItem('serverOmd')=="persagy") {
			//   btns[i].style.backgroundColor='#fff';
			// } else {
			//   btns[i].style.backgroundColor='';
			// }
			if (btns[i].id == tag) {
				btns[i].style.backgroundColor = '#60b8fa';
			} else {
				btns[i].style.backgroundColor = '';
			}

			//   if(type===null) {
			//     btns[i].style.backgroundColor='#60b8fa';
			//     break;
			//   } else if(type+1===i){
			//     btns[i].style.backgroundColor='#60b8fa';
			//     break;
			//   }
			// }
			// if(type===null) {
			//   if (nextData != undefined) {
			//     this.setState({modalList:nextData})
			//   }else{
			//     this.setState({modalList:this.props.modelList})
			//   }
			// } else {
			//   let tempList=[]
			//   if (nextData != undefined){
			//     nextData.map((item,index)=>{
			//       if(type===item.type) {
			//         tempList.push(item)
			//       }
			//     })
			//   }else {
			//     this.props.modelList.map((item,index)=>{
			//       if(type===item.type) {
			//         tempList.push(item)
			//       }
			//     })
			//   }
			//   this.setState({modalList:tempList})
		}
	}




	//tag按钮
	getTagBtns() {
		if (this.state.tagList.length != 0) {
			return this.state.tagList.map((item, index) => {
				return (
					<Button id={item} className="bindBtnTag" onClick={() => { this.getSceneByTag(item) }} style={btnStyle}>{item}</Button>
				)
			})
		}
	}

	getSceneBtns() {
		// new LimitDrag('.ant-modal-content');
		// new LimitDrag('.ant-modal-title');
		if (this.state.sceneList.length != 0) {
			return this.state.sceneList.map((item, i) => {
				return (
					<Button style={{ marginRight: "40px", marginBottom: "10px", borderRadius: "5px" }} onClick={() => { this.showRunEnv(item) }}>{item.name}</Button>
				)
			})
		}
	}

	render() {
		const { visible, onCancel } = this.props
		return (
			<div>
				{
					visible ?
						<Modal
							visible={visible}
							onCancel={onCancel}
							footer={null}
							maskClosable={false}
							width={1100}
							title={language == 'en' ? 'Control settings and scene actions' : '控制设置与场景动作'}
							wrapClassName={str}
						>
							<Tabs defaultActiveKey="1">
								<TabPane tab={this.state.paneTitle} key="1" disabled={this.state.sliderLoading}>
									<div style={{ height: 510 }}>
										{
											this.state.sliderLoading ?
												<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
													<Spin tip="Loading…" />
												</div>
												:
												<div>
													<div style={{ height: 465, overflowY: 'scroll', overflowX: 'hidden', marginBottom: 5 }}>
														{this.getControlRangeTitle(this.state.controlData, this.state.valueData)}
													</div>
													<Button style={{ position: 'absolute', right: 0, marginBottom: 5, marginTop: 5 }} onClick={() => this.sendValue(this.state.pointList, this.state.valueList)}>{language == 'en' ? 'Save' : '保存'}</Button>
												</div>
										}
									</div>
								</TabPane>
								{
									this.state.controlData1.length != 0 ?
										<TabPane tab={this.state.paneTitle1} key="2" disabled={this.state.sliderLoading}>
											<div style={{ height: 510 }}>
												{
													this.state.sliderLoading ?
														<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
															<Spin tip="Loading…" />
														</div>
														:
														<div>
															<div style={{ height: 465, overflowY: 'scroll', overflowX: 'hidden', marginBottom: 5 }}>
																{this.getControlRangeTitle(this.state.controlData1, this.state.valueData)}
															</div>
															<Button style={{ position: 'absolute', right: 0, marginBottom: 5, marginTop: 5 }} onClick={() => this.sendValue(this.state.pointList, this.state.valueList)}>{language == 'en' ? 'Save' : '保存'}</Button>
														</div>
												}
											</div>
										</TabPane>
										:
										""

								}
								{
									this.state.controlData2.length != 0 ?
										<TabPane tab={this.state.paneTitle2} key="3" disabled={this.state.sliderLoading}>
											<div style={{ height: 510 }}>
												{
													this.state.sliderLoading ?
														<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
															<Spin tip="Loading…" />
														</div>
														:
														<div>
															<div style={{ height: 465, overflowY: 'scroll', overflowX: 'hidden', marginBottom: 5 }}>
																{this.getControlRangeTitle(this.state.controlData2, this.state.valueData)}
															</div>
															<Button style={{ position: 'absolute', right: 0, marginBottom: 5, marginTop: 5 }} onClick={() => this.sendValue(this.state.pointList, this.state.valueList)}>{language == 'en' ? 'Save' : '保存'}</Button>
														</div>
												}
											</div>
										</TabPane>
										:
										""

								}
								{
									this.state.controlData3.length != 0 ?
										<TabPane tab={this.state.paneTitle3} key="4" disabled={this.state.sliderLoading}>
											<div style={{ height: 510 }}>
												{
													this.state.sliderLoading ?
														<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
															<Spin tip="Loading…" />
														</div>
														:
														<div>
															<div style={{ height: 465, overflowY: 'scroll', overflowX: 'hidden', marginBottom: 5 }}>
																{this.getControlRangeTitle(this.state.controlData3, this.state.valueData)}
															</div>
															<Button style={{ position: 'absolute', right: 0, marginBottom: 5, marginTop: 5 }} onClick={() => this.sendValue(this.state.pointList, this.state.valueList)}>{language == 'en' ? 'Save' : '保存'}</Button>
														</div>
												}
											</div>
										</TabPane>
										:
										""

								}
								{
									this.state.controlData4.length != 0 ?
										<TabPane tab={this.state.paneTitle4} key="5" disabled={this.state.sliderLoading}>
											<div style={{ height: 510 }}>
												{
													this.state.sliderLoading ?
														<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
															<Spin tip="Loading…" />
														</div>
														:
														<div>
															<div style={{ height: 465, overflowY: 'scroll', overflowX: 'hidden', marginBottom: 5 }}>
																{this.getControlRangeTitle(this.state.controlData4, this.state.valueData)}
															</div>
															<Button style={{ position: 'absolute', right: 0, marginBottom: 5, marginTop: 5 }} onClick={() => this.sendValue(this.state.pointList, this.state.valueList)}>{language == 'en' ? 'Save' : '保存'}</Button>
														</div>
												}
											</div>
										</TabPane>
										:
										""

								}
								{
									this.state.controlData5.length != 0 ?
										<TabPane tab={this.state.paneTitle5} key="6" disabled={this.state.sliderLoading}>
											<div style={{ height: 510 }}>
												{
													this.state.sliderLoading ?
														<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
															<Spin tip="Loading…" />
														</div>
														:
														<div>
															<div style={{ height: 465, overflowY: 'scroll', overflowX: 'hidden', marginBottom: 5 }}>
																{this.getControlRangeTitle(this.state.controlData5, this.state.valueData)}
															</div>
															<Button style={{ position: 'absolute', right: 0, marginBottom: 5, marginTop: 5 }} onClick={() => this.sendValue(this.state.pointList, this.state.valueList)}>{language == 'en' ? 'Save' : '保存'}</Button>
														</div>
												}
											</div>
										</TabPane>
										:
										""

								}
								<TabPane tab={language == 'en' ? 'Scene actions' : '场景动作'} key="7">
									<div style={{ height: 500 }}>
										<div style={{ marginBottom: '10px' }} >
											<div style={{ marginBottom: '5px' }} >{language == 'en' ? 'Tag filtering' : '标签筛选'}:</div>
											<Button id='btnAllTag' className="bindBtnTag" onClick={this.getSceneList} style={btnStyleAll} >{language == 'en' ? 'All scenes' : '全部场景'}</Button>
											{this.getTagBtns()}
										</div>
										<div style={{ marginBottom: '5px' }} >{language == 'en' ? 'Scene control' : '场景控制'}:</div>
										<div className={s['schedule-wrap']}>
											{
												this.state.sceneBtnLoading ?
													<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
														<Spin tip="Loading…" />
													</div>
													:
													this.getSceneBtns()
											}
										</div>
									</div>
								</TabPane>
							</Tabs>
						</Modal>
						:
						""
				}
			</div>

		)
	}
}

export default SceneControlModalView