
/**
 * 工具菜单-脚本规则控制
 */

import React from 'react'
import { Menu, Layout, Modal, Button, Input, Icon, Spin, InputNumber, Tabs, Badge, Select, Switch, Upload, message, Table, Row, Col, Checkbox, Dropdown } from 'antd';
import s from '../components/ScriptRuleModalView.css'
import http from '../../../common/http';
import ReactEcharts from '../../../lib/echarts-for-react';
import RealWorker from '../../observer/components/core/observer.worker';
import appConfig from '../../../common/appConfig';

const language = appConfig.language;
import AddInputModal from '../components/AddInputModalView';
import EditInputModal from '../components/EditInputModalView';
import PointModalView from '../containers/PointModalContainer';
import AddOutputModal from '../components/AddOutputModalView';
import EditOutputModal from '../components/EditOutputModalView';
import ImportRulesModalView from './ImportRulesModalView';
import { downloadUrl } from "../../../common/utils";
import eventBus from '../../../common/eventBus';
import moment from 'moment';
let option1, option2, option3, option4, option5, option6, option7, option8, option9, option10, option11, option12, option13, option14, option15, option16;
if (language === 'en') {
	option1 = require('../../../static/image/option1_en.png');
	option2 = require('../../../static/image/option2_en.png');
	option3 = require('../../../static/image/option3_en.png');
	option4 = require('../../../static/image/option4_en.png');
	option5 = require('../../../static/image/option5_en.png');
	option6 = require('../../../static/image/option6_en.png');
	option7 = require('../../../static/image/option7_en.png');
	option8 = require('../../../static/image/option8_en.png');
	option9 = require('../../../static/image/option9_en.png');
	option10 = require('../../../static/image/option10_en.png');
	option11 = require('../../../static/image/option11_en.png');
	option12 = require('../../../static/image/option12_en.png');
	option13 = require('../../../static/image/option13_en.png');
	option14 = require('../../../static/image/option14_en.png');
	option15 = require('../../../static/image/option15_en.png');
	option16 = require('../../../static/image/option16_en.png');
} else {
	option1 = require('../../../static/image/option1.png');
	option2 = require('../../../static/image/option2.png');
	option3 = require('../../../static/image/option3.png');
	option4 = require('../../../static/image/option4.png');
	option5 = require('../../../static/image/option5.png');
	option6 = require('../../../static/image/option6.png');
	option7 = require('../../../static/image/option7.png');
	option8 = require('../../../static/image/option8.png');
	option9 = require('../../../static/image/option9.png');
	option10 = require('../../../static/image/option10.png');
	option11 = require('../../../static/image/option11.png');
	option12 = require('../../../static/image/option12.png');
	option13 = require('../../../static/image/option13.png');
	option14 = require('../../../static/image/option14.png');
	option15 = require('../../../static/image/option15.png');
	option16 = require('../../../static/image/option16.png');
}


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

const { Sider, Content, Header } = Layout;
const Option = Select.Option;
const MenuItem = Menu.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const tabNumArr = Array.from({ length: 50 }, (_, i) => String(i + 1));
const scriptRuleListNameArr = Object.keys(Array.from({ length: 750 })).map(function (item) {
	if (+item < 9) {
		return "script_rule_00" + (+item + 1);
	} else {
		if (+item < 99) {
			return "script_rule_0" + (+item + 1);
		} else {
			return "script_rule_" + (+item + 1);
		}
	}
});

var timer;


//右侧脚本逻辑展示部分
class TreeView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			option: {},
			scriptList: [],
			dataList: [],
			inputTree: [],
			outputTree: [],
			isChartEmpty: false,
			loading: false,
			switchData: db.has("ruleScriptShowCode").value() ? JSON.parse(db.getState().ruleScriptShowCode) : false,
			dateDict: {},

		};


		this.workerUpdate = null;

		this.getChartOption = this.getChartOption.bind(this);
		this.stopWorker = this.stopWorker.bind(this);
		this.startWorker = this.startWorker.bind(this);
		this.refreshData = this.refreshData.bind(this);

	}


	componentWillReceiveProps(nextProps) {
		if (nextProps.currentKey != this.props.currentKey || nextProps.currentScript != this.props.currentScript) {
			const { currentKey, allContentList } = nextProps
			if (currentKey != "") {
				if (allContentList[currentKey] != undefined) {
					let content = allContentList[currentKey]
					let inputTree = {
						name: language == 'en' ? "Operation Module" : "运算模块", children: [], symbolSize: 50, symbol: "image://data:image/png;base64,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"
					};
					let outputTree = {
						name: language == 'en' ? "Operation Module" : "运算模块", children: [], symbolSize: 50, symbol: "image://data:image/png;base64,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"
					};
					let scriptList = [];
					if (content.inputList != undefined && content.inputList.length != 0) {
						content.inputList.forEach(inputItem => {
							inputTree.children.push({ name: inputItem.title, value: inputItem.script });
							scriptList.push(inputItem.script);
						})
					}
					if (content.outputList != undefined && content.outputList.length != 0) {
						content.outputList.forEach(outputItem => {
							outputTree.children.push({ name: outputItem.title, value: outputItem.script });
						})
					}

					// this.getChartOption(inputTree, outputTree);

					window.setTimeout(() => {
						this.setState({
							scriptList: scriptList,
							inputTree: inputTree,
							outputTree: outputTree,
							isChartEmpty: false,
							loading: true
						}, () => {
							if (localStorage.getItem('ruleReplay') == null) {
								this.startWorker();
								this.getChartOption();
							} else {
								this.refreshData();
								this.getChartOption();
							}
						});
					}, 0);
				} else {
					this.setState({
						isChartEmpty: true
					})
				}
			}
		}
	}

	componentWillUnmount() {
		localStorage.removeItem('ruleHistoryData')
		localStorage.removeItem('ruleReplay')
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
		}
		this.setState({
			scriptList: [],
			dataList: [],
			inputTree: [],
			outputTree: []
		})
	}

	//开始建立一个实时请求
	startWorker() {
		this.stopWorker()

		// 创建Worker实例
		this.workerUpdate = new RealWorker();
		this.workerUpdate.self = this;

		this.workerUpdate.addEventListener("message", this.refreshData, true);

		this.workerUpdate.addEventListener("error", function (e) {
			console.warn(e);
		}, true);

		if (!this.state.scriptList.length) {
			this.stopWorker();
			return;
		}

		// if (timer) {
		// 	clearInterval(timer);
		// }
		var _this = this;
		// //传数据
		// timer = setInterval(function () {
		// 	_this.workerUpdate.postMessage({
		// 		scriptList: _this.state.scriptList,
		// 		serverUrl: appConfig.serverUrl,
		// 		type: "scriptRuleRealtime"
		// 	});
		// }, 3000);

		//暂时关闭动态刷新，注掉上面的计时器，执行下面的一次性代码

		_this.workerUpdate.postMessage({
			scriptList: _this.state.scriptList,
			serverUrl: appConfig.serverUrl,
			type: "scriptRuleRealtime",
			language: appConfig.language
		});



	}

	stopWorker() {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
			this.workerUpdate.removeEventListener("message", this.refreshData, true);
		}
	}



	//脚本值刷新
	async refreshData(e) {
		let dateDict = this.state.dateDict
		let newData = []
		//历史回放中
		if (this.props.bShowTimeShaft && this.props.replyTime) {
			this.setState({
				loading: true,
			})
			let newData = []
			let scriptList = this.state.scriptList;
			let newdateDict = JSON.parse(localStorage.getItem('dateDict'))
			let res
			if (newdateDict.pattern == 2) {
				let originalObj = JSON.parse(localStorage.getItem('ruleHistoryData'))
				const filterObj = Object.keys(originalObj.map)
					.filter(key => scriptList.includes(key))
					.reduce((acc, key) => {
						acc[key] = originalObj.map[key]
						return acc
					}, {})
				res = JSON.parse(localStorage.getItem('ruleHistoryData'))
				res.map = filterObj
				Object.keys(res.map).forEach(key => {
					res.map[key] = res.map[key][newdateDict.curValue] || res.map[key][newdateDict.curValue] === 0 ? [res.map[key][newdateDict.curValue]] : []
				})
			} else {
				res = await http.post('/get_history_data_padded', {
					...(language == 'en' ? { "lan": "en" } : {}),
					pointList: ['1'],
					scriptList: scriptList,
					timeStart: this.props.replyTime,
					timeEnd: this.props.replyTime,
					timeFormat: newdateDict.timeFormat,
				})
			}

			let testnewData = []
			Object.keys(res.map).forEach((item, i) => {
				let obj = {
					name: item,
					value: res.map[item][0],
				}

				newData.push(obj)
			})
			const dataSize = JSON.stringify(newData).length

			// localStorage.setItem('ruleHistoryData', JSON.stringify(res))

			let inputString = JSON.stringify(this.state.inputTree)

			let inputTree = this.state.inputTree;
			//输入脚本的颜色	
			if (newData.length != 0 && inputTree.length != 0) {

				newData.forEach(item => {
					if (inputTree.children && inputTree.children.length != 0) {
						inputTree.children.map(input => {
							if (item.name == input.value) {
								if (item.value == 1) {
									input["itemStyle"] = { color: "#00FF33" };
									input["lineStyle"] = { color: "#00FF33" };
									input["label"] = this.state.switchData ? {
										color: "#00FF33", width: 320, overflow: "break",
										formatter: function (params) {
											const text = params.name;
											let newName = text + '\n' + item.name
											return newName
										}
									}
										:
										{ color: "#00FF33", width: 320, overflow: "break" }
								} else if (item.value == 0) {
									input["itemStyle"] = { color: "#ccc" };
									input["lineStyle"] = { color: "#ccc" };
									input["label"] = this.state.switchData ? {
										color: "#ccc", width: 320, overflow: "break",
										formatter: function (params) {
											const text = params.name;
											let newName = text + '\n' + item.name
											return newName
										}
									}
										:
										{ color: "#ccc", width: 320, overflow: "break" }
								} else if (item.value == null) {
									input["itemStyle"] = { color: "rgb(255 0 10)" };
									input["lineStyle"] = { color: "rgb(255 0 10)" };
									input["label"] = {
										color: "rgb(255 0 10)",
										rich: {

											del: {
												fontWeight: 'bold',
												color: 'rgb(255 0 10)',
												lineHeight: 20,
												borderWidth: 1,
												borderColor: 'rgb(255 0 10)',
												padding: [3, 5]
											}
										}
									}
								}
							}
						})
					}
				})
			}
			this.setState({
				dataList: newData,
				inputTree: inputTree,
			}, () => { this.getChartOption() })

		} else
			if (e) {
				if (e.data && !e.data.error) {

					e.data.forEach((item, i) => {
						if (item.time == undefined) {
							newData.push(item)
						}
					})
					let inputString = JSON.stringify(this.state.inputTree)

					let inputTree = this.state.inputTree;
					//输入脚本的颜色	
					if (newData.length != 0 && inputTree.length != 0) {
						newData.forEach(item => {
							if (inputTree.children && inputTree.children.length != 0) {
								inputTree.children.map(input => {
									if (item.name == input.value) {
										if (item.value == 1) {
											input["itemStyle"] = { color: "#00FF33" };
											input["lineStyle"] = { color: "#00FF33" };
											input["label"] = this.state.switchData ? {
												color: "#00FF33", width: 320, overflow: "break",
												formatter: function (params) {
													const text = params.name;
													let newName = text + '\n' + item.name
													return newName
												}
											}
												:
												{ color: "#00FF33", width: 320, overflow: "break" }
										} else if (item.value == 0) {
											input["itemStyle"] = { color: "#ccc" };
											input["lineStyle"] = { color: "#ccc" };
											input["label"] = this.state.switchData ? {
												color: "#ccc", width: 320, overflow: "break",
												formatter: function (params) {
													const text = params.name;
													let newName = text + '\n' + item.name
													return newName
												}
											}
												:
												{ color: "#ccc", width: 320, overflow: "break" }
										} else if (item.value == null) {
											input["itemStyle"] = { color: "rgb(255 0 10)" };
											input["lineStyle"] = { color: "rgb(255 0 10)" };
											input["label"] = {
												color: "rgb(255 0 10)",
												rich: {

													del: {
														fontWeight: 'bold',
														color: 'rgb(255 0 10)',
														lineHeight: 20,
														borderWidth: 1,
														borderColor: 'rgb(255 0 10)',
														padding: [3, 5]
													}
												}
											}
										}
									}
								})
							}
						})
					}
					//当输入条件的颜色或者内容不同时，再调用渲染函数
					// if ( inputString !== JSON.stringify(inputTree)) {   //暂时关闭动态刷新功能，为了使刷新按钮每次都生效，就不判断内容是否不同了
					// this.getChartOption(inputTree, this.state.outputTree);
					this.setState({
						dataList: newData,
						inputTree: inputTree
					}, () => { this.getChartOption() })

				}
			}
	}


	treeNodeclick = (param) => {
		/* true 代表点击的是圆点
			fasle 表示点击的是当前节点的文本
		*/
		if (param.event.target.culling === true) {
			if (param.name === (language == 'en' ? "Operation Module" : "运算模块")) {
				//如果是根节点，则显示"修改规则信息"
				this.props.editTitleModal(this.props.currentKey)
			} else {
				//第一个tree应该是输入
				if (param.seriesIndex == 0) {
					this.props.showEditInputModal(param.value, param.name)
				} else {
					this.props.showEditOutputModal(param.value, param.name)
				}
			}

		} else if (param.event.target.culling === false) {
			return
		}
	}

	saveChartRef = (chart) => {
		if (chart) {
			this.chart = chart.getEchartsInstance();
			this.chart.on('click', this.treeNodeclick)
		} else {
			this.chart = chart;
		}
	}

	// 画图
	getChartOption() {
		let option = {}
		let inputData = JSON.parse(JSON.stringify(this.state.inputTree))
		if (this.state.switchData) {
			option = {
				series: [
					{
						type: 'tree',
						data: [inputData],
						top: '1%',
						left: '400',
						bottom: '1%',
						symbolSize: 15,
						orient: 'RL',
						width: 400,
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left',
							fontSize: 16
						},
						leaves: {
							label: {
								position: 'left',
								verticalAlign: 'middle',
								align: 'right',
								formatter: function (params) {
									const text = params.name;
									let codeText = params.value;
									const length = codeText === undefined ? 0 : codeText.length;
									const maxLineLength = 40;
									let lineCount = Math.ceil(length / maxLineLength);
									let lines = [];
									for (let i = 0; i < lineCount; i++) {
										let line = codeText.substr(i * maxLineLength, maxLineLength);
										lines.push(line);
									}
									let newNameOutput = text + '\n' + lines.join('\n');
									if (params.name === "运算模块") {
										newNameOutput = ""
									}
									return newNameOutput;
								}
							}
						},
						expandAndCollapse: false //不支持折叠、展开功能
					},
					{
						type: 'tree',
						data: [this.state.outputTree],
						top: '1%',
						bottom: '1%',
						left: '800',
						symbol: function (params) {
							if (params && params.includes('|')) {
								return `image://${option12}`
							} else if (params && params.includes('point,')) {
								return `image://${option1}`;
							} else if (params && params.includes('action,add-chiller-hw-leave-temp-setting')) {
								return `image://${option2}`;
							} else if (params && params.includes('action,sub-chiller-hw-leave-temp-setting')) {
								return `image://${option3}`;
							} else if (params && params.includes('action,sleep,')) {
								return `image://${option4}`;
							} else if (params && params.includes('action,start-one-equipment,')) {
								return `image://${option5}`;
							} else if (params && params.includes('action,stop-one-equipment,')) {
								return `image://${option6}`;
							} else if (params && params.includes('action,add-equipment-group-freqsetting,')) {
								return `image://${option7}`;
							} else if (params && params.includes('action,sub-equipment-group-freqsetting,')) {
								return `image://${option8}`;
							} else if (params && params.includes('action,wait,')) {
								return `image://${option9}`;
							} else if (params && params.includes('action,add-system-warning,')) {
								return `image://${option10}`;
							} else if (params && params.includes('action,send-user-notice')) {
								return `image://${option11}`;
							} else if (params && params.includes('action,add-chiller-chw-leave-temp-setting')) {
								return `image://${option15}`;
							} else if (params && params.includes('action,sub-chiller-chw-leave-temp-setting')) {
								return `image://${option16}`;
							} else if (params && params.includes('action,add-point-delta')) {
								return `image://${option13}`;
							} else if (params && params.includes('action,sub-point-delta')) {
								return `image://${option14}`;
							}
							return `image://${option12}`
						},
						symbolSize: [60, 60],     // 控制显示尺寸
						orient: 'LR',
						width: 400,
						label: {
							position: 'left',
							verticalAlign: 'middle',
							align: 'right',
							fontSize: 16
						},
						leaves: {
							label: {
								position: 'right',
								verticalAlign: 'middle',
								align: 'left',
								formatter: function (params) {
									const text = params.name;
									let codeText = params.value;
									const length = codeText === undefined ? 0 : codeText.length;
									const maxLineLength = 26;
									let lineCount = Math.ceil(length / maxLineLength);
									let lines = [];
									for (let i = 0; i < lineCount; i++) {
										let line = codeText.substr(i * maxLineLength, maxLineLength);
										lines.push(line);
									}
									let newNameInput = text + '\n' + lines.join('\n');
									if (params.name === "运算模块") {
										newNameInput = ""
									}
									return newNameInput;
								}
							}
						},
						expandAndCollapse: false //不支持折叠、展开功能
					}

				]
			}
		} else {
			option = {
				series: [
					{
						type: 'tree',
						data: [inputData],
						top: '1%',
						left: '400',
						bottom: '1%',
						symbolSize: 15,
						orient: 'RL',
						width: 400,
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left',
							fontSize: 16
						},
						leaves: {
							label:
							{
								position: 'left',
								verticalAlign: 'middle',
								align: 'right',
								formatter: function (params) {
									return params.name;
								}
							}
						},
						expandAndCollapse: false //不支持折叠、展开功能
					},
					{
						type: 'tree',
						data: [this.state.outputTree],
						top: '1%',
						bottom: '1%',
						left: '800',
						symbol: function (params) {
							if (params && params.includes('|')) {
								return `image://${option12}`
							} else if (params && params.includes('point,')) {
								return `image://${option1}`;
							} else if (params && params.includes('action,add-chiller-hw-leave-temp-setting')) {
								return `image://${option2}`;
							} else if (params && params.includes('action,sub-chiller-hw-leave-temp-setting')) {
								return `image://${option3}`;
							} else if (params && params.includes('action,sleep,')) {
								return `image://${option4}`;
							} else if (params && params.includes('action,start-one-equipment,')) {
								return `image://${option5}`;
							} else if (params && params.includes('action,stop-one-equipment,')) {
								return `image://${option6}`;
							} else if (params && params.includes('action,add-equipment-group-freqsetting,')) {
								return `image://${option7}`;
							} else if (params && params.includes('action,sub-equipment-group-freqsetting,')) {
								return `image://${option8}`;
							} else if (params && params.includes('action,wait,')) {
								return `image://${option9}`;
							} else if (params && params.includes('action,add-system-warning,')) {
								return `image://${option10}`;
							} else if (params && params.includes('action,send-user-notice')) {
								return `image://${option11}`
							} else if (params && params.includes('action,add-chiller-chw-leave-temp-setting')) {
								return `image://${option15}`;
							} else if (params && params.includes('action,sub-chiller-chw-leave-temp-setting')) {
								return `image://${option16}`;
							} else if (params && params.includes('action,add-point-delta')) {
								return `image://${option13}`;
							} else if (params && params.includes('action,sub-point-delta')) {
								return `image://${option14}`;
							}
							return `image://${option12}`
						},
						symbolSize: [60, 60],
						orient: 'LR',
						width: 400,
						label: {
							position: 'left',
							verticalAlign: 'middle',
							align: 'right',
							fontSize: 16
						},
						leaves: {
							label:
							{
								position: 'right',
								verticalAlign: 'middle',
								align: 'left',
								formatter: function (params) {
									return params.name;
								}
							}
						},
						expandAndCollapse: false //不支持折叠、展开功能
					}


				]
			}
		}
		this.setState({
			option: option,
			loading: false
		})
	}



	handleRender = () => {
		let _this = this
		if (_this.state.scriptList.length != 0) {
			_this.setState({
				loading: true
			})
			_this.startWorker()
		}
	}

	showCode = (checked) => {
		let _this = this
		_this.setState({
			switchData: checked
		}, () => { _this.getChartOption() })
		db.set('ruleScriptShowCode', JSON.stringify(checked)).write();
		localStorage.setItem('ruleScriptShowCode', checked)
	}


	render() {
		const { height, width } = this.props.style

		return (
			<div>
				<Spin tip={language == 'en' ? "Loading page..." : "Loading..."} spinning={this.props.ruleLoading} style={{ paddingTop: '20%' }}>
					{
						this.state.isChartEmpty ?
							""
							:
							(
								<div>
									<div style={{ display: 'inline-block', position: 'absolute', top: '-48px', left: '210px' }}>
										<Button type="primary" onClick={() => { this.handleRender(); this.props.callback(this.props.curTabkey, true) }}>{language == 'en' ? 'Refresh Condition Status' : '刷新条件状态'}</Button>
										<Switch style={{ marginLeft: 30, marginTop: -3 }} checkedChildren={language == 'en' ? 'On' : '开'} unCheckedChildren={language == 'en' ? 'Off' : '关'} checked={this.state.switchData} onClick={this.showCode} /><span style={{ marginLeft: 10 }}>{language == 'en' ? 'Script View' : '脚本视图'}</span>
									</div>
									<ReactEcharts
										style={{
											height: height - 180,
											width: width
										}}
										id="chart"
										ref={this.saveChartRef}
										option={this.state.option}
										theme="dark"
										notMerge={true}
										lazyUpdate={false}
									/>
								</div>
							)
					}
				</Spin>
			</div>
		)
	}

}




class ScriptRuleModalView extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			allContentList: {}, //项目配置里的所有键值对内容
			ruleTitleList: [], //项目配置里提取出所有的外层title
			ruleNameList: [],   //项目配置里键名列表
			currentKey: "",  //当前菜单
			currentScript: {}, //当前脚本
			addChangeScript: "", //修改添加的规则
			addChangeTitle: "", //修改页面标题
			isShowAddInputModal: false,
			addChangeTime: 10,
			isShowEditInputModal: false,
			editInputScript: "",
			editInputDesc: "",
			isShowAddOutputModal: false,
			isShowEditOutputModal: false,
			editOutputScript: "",
			editOutputDesc: "",
			editTime: null,
			editTitle: "",
			curTabkey: "1",
			copyFlag: false,
			statusList: {},
			satisfyPercent: {},
			runningNubList: new Array(50).fill(0),
			copyTab: '',
			exportRulesLoading: false,
			importRulesVisible: false,
			contextMenuVisible: false,
			contextMenuPosition: { x: 0, y: 0 },
			enableCopyTabList: [],
			checkedDomlogicNameList: [],
			showAiModal: false,
			columns: [],
			dataSources: [],
			ruleList: [],
			checkVisible: false,
			replyTime: "",
			ruleDateDict: {},
			outputOption: "option12",
			jsonVisible: false,
			jsonKey: '',
			jsonText: '',
			ruleButLoading: false,//全局刷新按钮
			allRuleLoading: false,//全局界面刷新
			ruleLoading: false,//规则详情页面刷新
			lastTabKey: "1",  // 记录上次选中的分组
			lastRuleKey: "",  // 记录上次选中的规则
		};

		this.getScriptRuleList = this.getScriptRuleList.bind(this);
		this.getScriptRuleFromConfig = this.getScriptRuleFromConfig.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.editModal = this.editModal.bind(this);
		this.saveScript = this.saveScript.bind(this);
		this.changeScript = this.changeScript.bind(this);
		this.addRuleModal = this.addRuleModal.bind(this);
		this.changeAddScript = this.changeAddScript.bind(this);
		this.addRulePage = this.addRulePage.bind(this);
		this.deleteModal = this.deleteModal.bind(this);
		this.changeTitle = this.changeTitle.bind(this);
		this.addTitleModal = this.addTitleModal.bind(this);
		this.hideAddInputModal = this.hideAddInputModal.bind(this);
		this.showAddInputModal = this.showAddInputModal.bind(this);
		this.handleAddInputModalSubmit = this.handleAddInputModalSubmit.bind(this);
		this.changeTime = this.changeTime.bind(this);
		this.showEditInputModal = this.showEditInputModal.bind(this);
		this.hideEditInputModal = this.hideEditInputModal.bind(this);
		this.showEditOutputModal = this.showEditOutputModal.bind(this);
		this.hideEditOutputModal = this.hideEditOutputModal.bind(this);
		this.hideAddOutputModal = this.hideAddOutputModal.bind(this);
		this.showAddOutputModal = this.showAddOutputModal.bind(this);
		this.handleAddOutputModalSubmit = this.handleAddOutputModalSubmit.bind(this);
		this.editChangeTime = this.editChangeTime.bind(this);
		this.editChangeTitle = this.editChangeTitle.bind(this);
		this.editRulePage = this.editRulePage.bind(this);
		this.getTabRuleStatus = this.getTabRuleStatus.bind(this);
		this.handleContextMenu = this.handleContextMenu.bind(this);
	}


	shouldComponentUpdate(nextProps, nextState) {
		const { bShowTimeShaft, startRulePlayback, stopRulePlayback } = this.props
		if (nextProps.visible !== this.props.visible) {
			if (nextProps.visible == true) {
				// 如果当前处于历史回放模式，启动规则回放
				if (bShowTimeShaft) {
					startRulePlayback();
				}
				// 恢复上次的状态
				this.getScriptRuleFromConfig(this.state.lastRuleKey || undefined);
				this.setState({
					curTabkey: this.state.lastTabKey || "1"
				});
			} else {
				// 弹窗关闭时停止规则回放
				if (bShowTimeShaft) {
					stopRulePlayback();
				}
				// 关闭时保存当前状态
				this.setState({
					lastTabKey: this.state.curTabkey,
					lastRuleKey: this.state.currentKey
				});
			}
			return true
		} else {
			if (nextState == this.state && nextProps == this.props) {
				return false
			} else {
				return true
			}
		}
	}
	changeLayoutVisible = (or) => {

	}

	isEmptyFun = () => {
		let isEmpty = false;
		//先判断该分组tab中，数量是否为空
		let newRuleKey = 0
		let key = Number(this.state.curTabkey)
		let curRuleNum = 0
		//判断符合该tab下的已有规则后缀的数量
		if (this.state.ruleNameList.length != 0) {
			this.state.ruleNameList.forEach((item, i) => {
				if ((key - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (key * 15 + 1)) {
					curRuleNum++
				}
			});
		}
		//判断该tab下的数量是否为0
		if (curRuleNum < 1) {
			isEmpty = true
		}
		return isEmpty
	}

	handleHidePointModal = () => {
		const { showPointModal } = this.props
		showPointModal(modalTypes.POINT_MODAL)

	}

	hideAddInputModal = () => {
		this.setState({
			isShowAddInputModal: false
		})
	}

	showAddInputModal = () => {
		//添加输入条件前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: language == 'en' ? 'Error' : '错误提示',
				content: language == 'en' ? "Please create a rule in the current group first!" : "请先在当前分组中创建规则！"
			})
		} else {
			this.setState({
				isShowAddInputModal: true
			})
		}
	}

	showEditInputModal = (value, name) => {
		this.setState({
			isShowEditInputModal: true,
			editInputScript: value,
			editInputDesc: name
		})
	}

	hideEditInputModal = () => {
		this.setState({
			isShowEditInputModal: false
		})
	}

	//输出
	hideAddOutputModal = () => {
		this.setState({
			isShowAddOutputModal: false
		})
	}

	showAddOutputModal = () => {
		//添加输出动作前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: language == 'en' ? 'Error' : '错误提示',
				content: language == 'en' ? "Please create a rule in the current group first!" : "请先在当前分组中创建规则！"
			})
		} else {
			this.setState({
				isShowAddOutputModal: true
			})
		}
	}

	setOption = (params) => {
		if (params && params.includes('|')) {
			return 'option12'
		} else if (params && params.includes('point,')) {
			return 'option1'
		} else if (params && params.includes('action,add-chiller-hw-leave-temp-setting')) {
			return 'option2'
		} else if (params && params.includes('action,sub-chiller-hw-leave-temp-setting')) {
			return 'option3'
		} else if (params && params.includes('action,sleep,')) {
			return 'option4'
		} else if (params && params.includes('action,start-one-equipment,')) {
			return 'option5'
		} else if (params && params.includes('action,stop-one-equipment,')) {
			return 'option6'
		} else if (params && params.includes('action,add-equipment-group-freqsetting,')) {
			return 'option7'
		} else if (params && params.includes('action,sub-equipment-group-freqsetting,')) {
			return 'option8'
		} else if (params && params.includes('action,wait,')) {
			return 'option9'
		} else if (params && params.includes('action,add-system-warning,')) {
			return 'option10'
		} else if (params && params.includes('action,send-user-notice')) {
			return 'option11'
		} else if (params && params.includes('action,add-chiller-chw-leave-temp-setting')) {
			return 'option15'
		} else if (params && params.includes('action,sub-chiller-chw-leave-temp-setting')) {
			return 'option16'
		} else if (params && params.includes('action,add-point-delta')) {
			return 'option13'
		} else if (params && params.includes('action,sub-point-delta')) {
			return 'option14'
		}
		return 'option12'
	}

	showEditOutputModal = (value, name) => {
		let option = this.setOption(value)
		this.setState({
			outputOption: option,
			isShowEditOutputModal: true,
			editOutputScript: value,
			editOutputDesc: name
		})
	}

	hideEditOutputModal = () => {
		this.setState({
			isShowEditOutputModal: false
		})
	}

	handleCopy = () => {
		Modal.confirm({
			title: language == 'en' ? 'Confirm' : '确认提示',
			content: language == 'en' ? 'Are you sure you want to copy this rule and add a new rule?' : '确定要复制此规则，并添加一条新规则吗？',
			onOk: () => { this.copyRule() },
			onCancel() { }
		});
	}

	copyRule = () => {
		let currentScript = this.state.currentScript
		//复制的规则，默认是关闭状态
		let copyScript = Object.assign({}, currentScript);
		copyScript.enabled = 0
		this.setState({
			copyFlag: true
		}, () => { this.addTitleModal(copyScript) })

	}

	handlePlay = () => {
		Modal.confirm({
			title: language == 'en' ? 'Confirm' : '确认提示',
			content: language == 'en' ? 'Are you sure you want to run this rule?' : '确定要运行此规则吗？',
			onOk: () => { this.playRule() },
			onCancel() { }
		});
	}

	playRule = () => {
		let currentScript = this.state.currentScript
		currentScript.enabled = 1
		this.saveScript(this.state.currentKey, currentScript);
		//增加操作记录
		http.post('/operationRecord/add', {
			"userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
				JSON.parse(localStorage.getItem('userInfo')).name : '',
			"content": language == 'en' ? `Enable rule - ${currentScript.title}` : `开启规则 - ${currentScript.title}`,
			"address": ''
		}).then(
			data => {

			}
		)
		//自动检测rule策略是否存在，否则自动新建rule策略
		http.post('/logic/autoCheckRun', {
			"logicOrgName": "StandardRuleControl",
			"logicName": 'Process5_StandardRuleControl'
		}).then(
			data => {
				if (data.err) {
					Modal.error({
						title: data.msg
					})
				}
			}
		)
	}

	handlePause = () => {
		Modal.confirm({
			title: language == 'en' ? 'Confirm' : '确认提示',
			content: language == 'en' ? 'Are you sure you want to stop this rule?' : '确定要停止此规则吗？',
			onOk: () => { this.pauseRule() },
			onCancel() { }
		});
	}

	pauseRule = () => {
		let currentScript = this.state.currentScript
		currentScript.enabled = 0
		this.saveScript(this.state.currentKey, currentScript);
		//增加操作记录
		http.post('/operationRecord/add', {
			"userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
				JSON.parse(localStorage.getItem('userInfo')).name : '',
			"content": language == 'en' ? `Disable rule - ${currentScript.title}` : `关闭规则 - ${currentScript.title}`,
			"address": ''
		}).then(
			data => {

			}
		)
	}




	//删除输入条件
	deleteInput = () => {
		let currentKey = this.state.currentKey
		if (this.state.currentScript.inputList.length != 0) {
			let deleteIndex = -1
			let newInputList = []
			let currentScript = this.state.currentScript
			let inputList = this.state.currentScript.inputList
			inputList.forEach((item, i) => {
				if (item.script == this.state.editInputScript) {
					deleteIndex = i
				}
			})
			if (deleteIndex != -1) {
				for (let m = 0, len = inputList.length; m < len; m++) {
					if (m != deleteIndex) {
						newInputList.push(inputList[m])
					}
				}
				currentScript.inputList = newInputList


				if (currentScript.outputList != undefined) {
					currentScript.outputList.forEach((item, i) => {
						if (item) {
							currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
						}
					})
				}

				//保存删除后的结构
				http.post('/project/saveConfig', {
					key: currentKey,
					config: JSON.stringify(currentScript),
					cloudUserId: appConfig.cloudUser.cloudUserId,
					projectId: appConfig.projectId,
					...(language == 'en' ? { "lan": "en" } : {})
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {

							Modal.error({
								title: language == 'en' ? 'Error' : '错误提示',
								content: language == 'en' ? "Failed to delete input condition" : "删除输入条件失败"
							})
						}
						this.hideEditInputModal();
					}
				).catch(
					err => {

						Modal.error({
							title: '错误提示',
							content: "删除输入条件失败"
						})
					}
				)

			}
		}
	}

	//输入
	handleAddInputModal = () => {
		this.showAddInputModal()
	}

	convertScriptToNewVersion = (obj) => {
		let newObj = {
			...obj,
			script: null
		};

		if (obj.script) {
			if (typeof (obj.script) === 'string') {
				const parts = obj.script.split(',');
				if (parts.length >= 2) {
					const type = parts[0];
					const result = {
						type: type,
						API: '',
						paramList: []
					};

					if (type === 'point') {
						result.API = '';
						result.paramList = parts.slice(1);
					}
					else if (type === 'action') {
						if (parts.length >= 3) {
							result.API = parts[1];
							result.paramList = parts.slice(2);
						}
					} else {
						result.API = '';
						result.type = '';
						result.paramList = parts
					}

					newObj.script = result;
				} else {
					newObj.script = {
						type: '',
						API: '',
						paramList: parts
					}
				}
			} else {
				newObj.script = obj.script
			}
		}

		return newObj;
	}

	convertScriptToOldVersion = (obj) => {
		let newObj = {
			...obj, // 保留原始属性
			script: null
		};

		if (obj.script && typeof obj.script === 'object') {
			const { type, API, paramList } = obj.script;
			let scriptStr = type;

			if (type === 'action' && API) {
				scriptStr += `,${API}`;
			}

			if (paramList && paramList.length > 0) {
				if (scriptStr) {
					scriptStr += `,${paramList.join(',')}`;
				} else {
					scriptStr += `${paramList.join(',')}`;
				}
			}

			newObj.script = scriptStr;
		}
		return newObj;
	}

	//添加输入条件
	handleAddInputModalSubmit = (obj) => {
		let currentKey = this.state.currentKey
		let currentScript = this.state.currentScript
		if (currentScript != undefined && currentScript.inputList != undefined) {
			currentScript.inputList.push(obj)



			if (currentScript.outputList != undefined) {
				currentScript.outputList.forEach((item, i) => {
					if (item) {
						currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
					}
				})
			}

			http.post('/project/saveConfig', {
				key: currentKey,
				config: JSON.stringify(currentScript),
				cloudUserId: appConfig.cloudUser.cloudUserId,
				projectId: appConfig.projectId,
				...(language == 'en' ? { "lan": "en" } : {})
			}).then(
				data => {
					if (data.status) {
						this.getScriptRuleFromConfig(currentKey);

					} else {

						Modal.error({
							title: '错误提示',
							content: "添加规则页面失败"
						})
					}
				}
			).catch(
				err => {

					Modal.error({
						title: '错误提示',
						content: "添加条件失败"
					})
				}
			)
		} else {
			Modal.error({
				title: '错误提示',
				content: "添加条件失败，该规则结构错误，请点击“清空”后重新操作！"
			})
		}
	}

	handleEditInputModalSubmit = (obj) => {
		let currentKey = this.state.currentKey
		if (this.state.currentScript.inputList.length != 0) {
			let editIndex = -1
			let newInputList = []
			let currentScript = this.state.currentScript
			let inputList = this.state.currentScript.inputList
			inputList.forEach((item, i) => {
				if (item.script == this.state.editInputScript) {
					editIndex = i
				}
			})
			if (editIndex != -1) {
				for (let m = 0, len = inputList.length; m < len; m++) {
					if (m != editIndex) {
						newInputList.push(inputList[m])
					} else {
						newInputList.push(obj)
					}
				}
				currentScript.inputList = newInputList



				if (currentScript.outputList != undefined) {
					currentScript.outputList.forEach((item, i) => {
						if (item) {
							currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
						}
					})
				}

				//保存编辑后的条件
				http.post('/project/saveConfig', {
					key: currentKey,
					config: JSON.stringify(currentScript),
					cloudUserId: appConfig.cloudUser.cloudUserId,
					projectId: appConfig.projectId,
					...(language == 'en' ? { "lan": "en" } : {})
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {

							Modal.error({
								title: '错误提示',
								content: "修改输入条件失败"
							})
						}
					}
				).catch(
					err => {

						Modal.error({
							title: '错误提示',
							content: "修改输入条件失败"
						})
					}
				)
			} else {
				Modal.error({
					title: '错误提示',
					content: "修改输入条件失败"
				})
			}
		} else {
			Modal.error({
				title: '错误提示',
				content: "修改输入条件失败"
			})
		}

	}

	//输出
	handleAddOutputModal = (currentKey, key) => {
		this.setState({
			outputOption: key,
		}, () => {
			this.showAddOutputModal()
		})
	}
	//添加 输出动作
	handleAddOutputModalSubmit = (obj) => {
		let currentKey = this.state.currentKey
		let currentScript = JSON.parse(JSON.stringify(this.state.currentScript))
		if (currentScript.outputList != undefined) {
			currentScript.outputList.forEach((item, i) => {
				if (item) {
					currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
				}
			})

			// 转换并添加新对象
			const convertedObj = this.convertScriptToNewVersion(obj);
			currentScript.outputList.push(convertedObj);


			http.post('/project/saveConfig', {
				key: currentKey,
				config: JSON.stringify(currentScript),
				cloudUserId: appConfig.cloudUser.cloudUserId,
				projectId: appConfig.projectId,
				...(language == 'en' ? { "lan": "en" } : {})
			}).then(
				data => {
					if (data.status) {
						this.getScriptRuleFromConfig(currentKey);

					} else {

						Modal.error({
							title: '错误提示',
							content: "添加输出动作失败"
						})
					}
				}
			).catch(
				err => {

					Modal.error({
						title: '错误提示',
						content: "添加输出动作失败"
					})
				}
			)
		} else {
			Modal.error({
				title: '错误提示',
				content: "添加输出动作失败，该规则结构错误，请点击“清空”后重新操作！"
			})
		}
	}

	handleEditOutputModalSubmit = (obj) => {

		let currentKey = JSON.parse(JSON.stringify(this.state.currentKey))
		if (this.state.currentScript.outputList.length != 0) {
			let editIndex = -1
			let newInputList = []
			let currentScript = JSON.parse(JSON.stringify(this.state.currentScript))
			let outputList = this.state.currentScript.outputList
			outputList.forEach((item, i) => {
				if (item.script == this.state.editOutputScript) {
					editIndex = i
				}
			})


			// 转换并添加新对象
			if (editIndex != -1) {
				for (let m = 0, len = outputList.length; m < len; m++) {
					if (m != editIndex) {
						newInputList.push(outputList[m])
					} else {
						newInputList.push(obj)
					}
				}
				currentScript.outputList = newInputList

				if (currentScript.outputList != undefined) {
					currentScript.outputList.forEach((item, i) => {
						if (item) {
							currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
						}
					})
				}


				//保存编辑后的条件
				http.post('/project/saveConfig', {
					key: currentKey,
					config: JSON.stringify(currentScript),
					cloudUserId: appConfig.cloudUser.cloudUserId,
					projectId: appConfig.projectId,
					...(language == 'en' ? { "lan": "en" } : {})
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {

							Modal.error({
								title: '错误提示',
								content: "修改输出动作失败"
							})
						}
					}
				).catch(
					err => {

						Modal.error({
							title: '错误提示',
							content: "修改输出动作失败"
						})
					}
				)
			} else {
				Modal.error({
					title: '错误提示',
					content: "修改输出动作失败"
				})
			}
		} else {
			Modal.error({
				title: '错误提示',
				content: "修改输出动作失败"
			})
		}

	}

	//删除输出动作
	deleteOutput = () => {
		let currentKey = this.state.currentKey
		if (this.state.currentScript.outputList.length != 0) {
			let deleteIndex = -1
			let newOutputList = []
			let currentScript = JSON.parse(JSON.stringify(this.state.currentScript))
			let outputList = this.state.currentScript.outputList
			outputList.forEach((item, i) => {
				if (item.script == this.state.editOutputScript) {
					deleteIndex = i
				}
			})
			if (currentScript.outputList != undefined) {
				currentScript.outputList.forEach((item, i) => {
					if (item) {
						currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
					}
				})
			}
			if (deleteIndex != -1) {
				for (let m = 0, len = outputList.length; m < len; m++) {
					if (m != deleteIndex) {
						newOutputList.push(outputList[m])
					}
				}
				currentScript.outputList = newOutputList


				if (currentScript.outputList != undefined) {
					currentScript.outputList.forEach((item, i) => {
						if (item) {
							currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
						}
					})
				}

				//保存删除后的结构
				http.post('/project/saveConfig', {
					key: currentKey,
					config: JSON.stringify(currentScript),
					cloudUserId: appConfig.cloudUser.cloudUserId,
					projectId: appConfig.projectId,
					...(language == 'en' ? { "lan": "en" } : {})
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {

							Modal.error({
								title: '错误提示',
								content: "删除输出动作失败"
							})
						}
						this.hideEditOutputModal();
					}
				).catch(
					err => {

						Modal.error({
							title: '错误提示',
							content: "删除输出动作失败"
						})
					}
				)

			}
		}
	}

	changeValueToTime(value) {
		const dateDict = JSON.parse(localStorage.getItem('dateDict'))
		if (dateDict.timeFormat == 'm1') {
			return moment(dateDict.startTime).add(value, 'minutes')
		} else if (dateDict.timeFormat == 'm5') {
			return moment(dateDict.startTime).add(value * 5, 'minutes')
		} else if (dateDict.timeFormat == 'h1') {
			return moment(dateDict.startTime).add(value, 'hours')
		} else if (dateDict.timeFormat == 'd1') {
			return moment(dateDict.startTime).add(value, 'days')
		}
	}

	setReplyTime = (value) => {
		let replyTime = this.changeValueToTime(value)
		this.setState({
			replyTime: replyTime.format('YYYY-MM-DD HH:mm:ss')
		}, () => {
			this.getScriptRuleFromConfig(this.state.currentKey);
		})
	}


	componentDidMount() {

		eventBus.on('timeChanged', this.setReplyTime)
		this.getScriptRuleFromConfig();
		localStorage.setItem("scriptTabKey", '1');
		this.handleGetDomlogicNames();
	}

	componentWillUnmount() {
		eventBus.off('timeChanged', this.setReplyTime)
		this.props.toggleTimeShaft(false)
	}

	//检测对比新数据
	componentWillReceiveProps(nextProps) {
		if (this.props.scriptRefreshFlag != nextProps.scriptRefreshFlag) {
			//刷新时，是刷新所有的规则，并保留在当前tab,自动跳转到当前tab的第一个
			if (localStorage.getItem("scriptTabKey") != undefined) {
				let tabKey = localStorage.getItem("scriptTabKey")
				let newRuleKey = (Number(tabKey) - 1) * 15 + 1
				let scriptKey = ""
				if (newRuleKey < 10) {
					scriptKey = "script_rule_00" + newRuleKey;
				} else {
					if (newRuleKey < 100) {
						scriptKey = "script_rule_0" + newRuleKey;
					} else {
						scriptKey = "script_rule_" + newRuleKey;
					}
				}
				this.setState({
					currentKey: scriptKey,
					curTabkey: tabKey
				}, () => {
					this.getScriptRuleFromConfig(scriptKey);
				});
			} else {
				this.getScriptRuleFromConfig();
			}
		} else if (this.props.bShowTimeShaft == true && nextProps.bShowTimeShaft == false) {
			this.getScriptRuleFromConfig(this.state.currentKey)
		}
	}

	//从项目配置中获取所有的脚本规则配置
	getScriptRuleFromConfig(currentKey) {
		this.setState({
			ruleButLoading: true,
			allRuleLoading: true
		})
		let curTabkey = this.state.curTabkey
		if (currentKey !== undefined) {
			let currentKeyNum = parseInt(currentKey.slice(-3), 10)
			if (currentKeyNum <= (curTabkey - 1) * 15 || currentKeyNum > curTabkey * 15) {
				currentKey = null
			}
		}
		http.post('/project/getConfigMul', {
			"keyList": scriptRuleListNameArr,
			...(language == 'en' ? { "lan": "en" } : {})
		}).then(
			res => {
				if (res.status && Object.keys(res.data).length != 0) {
					let titleList = [];
					let nubList = new Array(50).fill(0)
					let nameList = Object.keys(res.data);
					Object.values(res.data).forEach((element, ele) => {
						if (element.title != undefined) {
							titleList.push(element.title)
						} else {
							titleList.push("暂无标题")
						}
						if (element.outputList != undefined) {
							element.outputList.forEach((item, i) => {
								if (item && item.script != undefined) {
									if (Object.keys(item.script).length != 0 && Object.keys(item.script).includes('API')
										&& Object.keys(item.script).includes('paramList')
										&& Object.keys(item.script).includes('type')) {
										item = this.convertScriptToOldVersion(item)
										res.data[nameList[ele]].outputList[i] = item
									} else {

									}

								} else {
									res.data[nameList[ele]].outputList[i] = {}
								}
							})
						}
						//整理每组正在运行的规则数量
						for (let i = 0; i < 50; i++) {
							if (i * 15 < Number(nameList[ele].substr(-3)) && Number(nameList[ele].substr(-3)) < ((i + 1) * 15 + 1)) {
								if (element.enabled == 1 || element.enabled == undefined) {
									nubList[i] += 1;
								}
							}
						}
					});
					if (currentKey != null) {
						if (nameList.length == 1) {
							this.getTabRuleStatus(this.state.curTabkey, nameList, res.data, true).then(([statusList, satisfyPercent]) => {
								this.setState({
									allContentList: res.data,
									ruleNameList: nameList,
									ruleTitleList: titleList,
									currentKey: currentKey,
									currentScript: res.data[currentKey],
									statusList: statusList,
									satisfyPercent: satisfyPercent,
									runningNubList: nubList,
									editInputScript: "",
									editOutputScript: "",
									editInputDesc: "",
									editOutputDesc: "",
								})
							})
						} else {
							this.getTabRuleStatus(this.state.curTabkey, nameList, res.data, true).then(([statusList, satisfyPercent]) => {
								this.setState({
									allContentList: res.data,
									ruleNameList: nameList,
									ruleTitleList: titleList,
									currentKey: currentKey,
									currentScript: res.data[currentKey],
									statusList: statusList,
									satisfyPercent: satisfyPercent,
									runningNubList: nubList,
									editInputScript: "",
									editOutputScript: "",
									editInputDesc: "",
									editOutputDesc: "",
								})
							})
						}
					} else {
						this.getTabRuleStatus(1, nameList, res.data, true).then(([statusList, satisfyPercent]) => {
							this.setState({
								allContentList: res.data,
								ruleNameList: nameList,
								ruleTitleList: titleList,
								currentKey: nameList[0],
								currentScript: res.data[nameList[0]],
								statusList: statusList,
								satisfyPercent: satisfyPercent,
								runningNubList: nubList,
								editInputScript: "",
								editOutputScript: "",
								editInputDesc: "",
								editOutputDesc: "",
							})
						})
					}

				} else {
				}
				this.setState({
					ruleButLoading: false,
					allRuleLoading: false
				})
			}
		).catch(
			err => {
				this.setState({
					ruleButLoading: false,
					allRuleLoading: false
				})
			}
		)
	}

	//获取规则的输入条件当前状态
	async getTabRuleStatus(key, nameList, allContent, flag) {
		const _this = this
		let ruleNameList = flag == true ? nameList : this.state.ruleNameList
		let allContentList = flag == true ? allContent : this.state.allContentList

		return new Promise(async (resolve, reject) => {
			let scriptList = []
			let statusList = {}
			let satisfyPercent = {}
			let scriptDataObj = {}
			if (ruleNameList.length != 0) {
				//将tab里的所有规则里的输入条件点名整理出来，一起去请求实时数据，然后检测每个规则当前输入条件是否全部满足，满足则“规则名称”显示红色；否则显示绿色
				ruleNameList.forEach((jtem, j) => {
					if ((key - 1) * 15 < Number(jtem.substr(-3)) && Number(jtem.substr(-3)) < (key * 15 + 1)) {
						if (allContentList[jtem].inputList != undefined) {
							if (allContentList[jtem].inputList.length != 0) {
								//  && (allContentList[jtem].enabled != 0 || allContentList[jtem].enabled == undefined)) {
								//先默认开着的规则输入条件都不满足
								statusList[jtem] = false
								satisfyPercent[jtem] = 0
								//取脚本
								allContentList[jtem].inputList.forEach((item, i) => {
									if (item.script != undefined) {
										scriptList.push(item.script)
									}
								})
							}
						} else {
							console.log("规则脚本有误" + JSON.stringify(allContentList[jtem]))
						}

					}
				})
				if (scriptList.length != 0) {
					let res = []
					let dateDict = JSON.parse(localStorage.getItem('dateDict'))
					if (this.props.bShowTimeShaft) {
						let data
						if (dateDict.pattern == 2) {
							if (localStorage.getItem('ruleHistoryData') != null
								&& this.state.ruleDateDict
								&& this.state.ruleDateDict.startTime == dateDict.startTime
								&& this.state.ruleDateDict.endTime == dateDict.endTime
								&& this.state.ruleDateDict.timeFormat == dateDict.timeFormat
								&& key == this.state.ruleDateDict.curTabkey
							) {
								// data = JSON.parse(localStorage.getItem('ruleHistoryData'))
							} else {

								let resdata = await http.post('/get_history_data_padded', {
									...(language == 'en' ? { "lan": "en" } : {}),
									pointList: ['1'],
									scriptList: scriptList,
									timeStart: dateDict.startTime,
									timeEnd: dateDict.endTime,
									timeFormat: dateDict.timeFormat,
								})
								localStorage.setItem('ruleHistoryData', JSON.stringify(resdata))
								let ruleDateDict = JSON.parse(JSON.stringify(dateDict))
								ruleDateDict.curTabkey = key
								this.setState({
									ruleDateDict: ruleDateDict
								})
							}
							data = JSON.parse(localStorage.getItem('ruleHistoryData'))
							Object.keys(data.map).forEach(key => {
								data.map[key] = data.map[key][dateDict.curValue] || data.map[key][dateDict.curValue] === 0 ? [data.map[key][dateDict.curValue]] : []
							})
						} else {
							data = await http.post('/get_history_data_padded', {
								...(language == 'en' ? { "lan": "en" } : {}),
								pointList: ['1'],
								scriptList: scriptList,
								timeStart: _this.state.replyTime,
								timeEnd: _this.state.replyTime,
								timeFormat: 'm1',
							})
						}
						for (let key in data.map) {
							res.push({ name: key, value: data.map[key][0] })
						}

						if (res.length != 0) {
							try {
								res.forEach(row => {
									scriptDataObj[row.name] = row.value
								})
								ruleNameList.forEach((jtem, j) => {
									if ((key - 1) * 15 < Number(jtem.substr(-3)) && Number(jtem.substr(-3)) < (key * 15 + 1)) {
										//如果没有enabled字段，默认是开着（即enabled为1）
										if (allContentList[jtem].inputList != undefined) {
											if (allContentList[jtem].inputList.length != 0) {
												// && (allContentList[jtem].enabled != 0 || allContentList[jtem].enabled == undefined)) {
												try {
													let total = allContentList[jtem].inputList.length
													let satisfyNum = 0
													let item = allContentList[jtem].inputList
													for (let i = 0; i < allContentList[jtem].inputList.length; i++) {
														if (scriptDataObj[item[i].script] == null) {
															satisfyPercent[jtem] = -1
															break;
														} else {
															if (scriptDataObj[item[i].script]) {
																satisfyNum++
																if (i == allContentList[jtem].inputList.length - 1) {
																	satisfyPercent[jtem] = satisfyNum / total
																	if (satisfyNum == total) {
																		statusList[jtem] = true
																	}
																}
															} else {
																if (i == allContentList[jtem].inputList.length - 1) {
																	satisfyPercent[jtem] = satisfyNum / total
																}
															}
														}
													}
												} catch (error) {

												}
											}
										} else {
											console.log("规则脚本有误" + JSON.stringify(allContentList[jtem]))
										}
									}
								})

								resolve([statusList, satisfyPercent])
							} catch (e) {
								Modal.error({
									title: '错误提示',
									content: "后台请求实时数据失败！"
								});
								resolve([])
							}
						} else {
							Modal.error({
								title: '错误提示',
								content: "后台请求实时数据失败！"
							});
							resolve([])
						}


					} else {
						this.setState({
							ruleLoading: true
						})
						http.post('/get_realtimedata', {
							proj: 1,
							pointList: [],
							scriptList: scriptList,
							...(language == 'en' ? { "lan": "en" } : {})
						}).then(
							res => {
								if (res.length != 0) {
									try {
										res.forEach(row => {
											scriptDataObj[row.name] = row.value
										})
										ruleNameList.forEach((jtem, j) => {
											if ((key - 1) * 15 < Number(jtem.substr(-3)) && Number(jtem.substr(-3)) < (key * 15 + 1)) {
												//如果没有enabled字段，默认是开着（即enabled为1）
												if (allContentList[jtem].inputList != undefined) {
													if (allContentList[jtem].inputList.length != 0) {
														//  && (allContentList[jtem].enabled != 0 || allContentList[jtem].enabled == undefined)) {
														try {
															let total = allContentList[jtem].inputList.length
															let satisfyNum = 0
															let item = allContentList[jtem].inputList
															for (let i = 0; i < allContentList[jtem].inputList.length; i++) {
																if (scriptDataObj[item[i].script] == null) {
																	satisfyPercent[jtem] = -1
																	break;
																} else {
																	if (scriptDataObj[item[i].script]) {
																		satisfyNum++
																		if (i == allContentList[jtem].inputList.length - 1) {
																			satisfyPercent[jtem] = satisfyNum / total
																			if (satisfyNum == total) {
																				statusList[jtem] = true
																			}
																		}
																	} else {
																		if (i == allContentList[jtem].inputList.length - 1) {
																			satisfyPercent[jtem] = satisfyNum / total
																		}
																	}
																}
															}
														} catch (error) {

														}
													}
												} else {
													console.log("规则脚本有误" + JSON.stringify(allContentList[jtem]))
												}
											}
										})

										resolve([statusList, satisfyPercent])
									} catch (e) {
										Modal.error({
											title: '错误提示',
											content: "后台请求实时数据失败！"
										});
										resolve([])
									}
								} else {
									try {
										res.forEach(row => {
											scriptDataObj[row.name] = null
										})
										ruleNameList.forEach((jtem, j) => {
											if ((key - 1) * 15 < Number(jtem.substr(-3)) && Number(jtem.substr(-3)) < (key * 15 + 1)) {
												//如果没有enabled字段，默认是开着（即enabled为1）
												if (allContentList[jtem].inputList != undefined) {
													if (allContentList[jtem].inputList.length != 0) {
														//  && (allContentList[jtem].enabled != 0 || allContentList[jtem].enabled == undefined)) {
														try {
															let total = allContentList[jtem].inputList.length
															let satisfyNum = 0
															let item = allContentList[jtem].inputList
															for (let i = 0; i < allContentList[jtem].inputList.length; i++) {
																if (scriptDataObj[item[i].script] == null) {
																	satisfyPercent[jtem] = -1
																	break;
																} else {
																	if (scriptDataObj[item[i].script]) {
																		satisfyNum++
																		if (i == allContentList[jtem].inputList.length - 1) {
																			satisfyPercent[jtem] = satisfyNum / total
																			if (satisfyNum == total) {
																				statusList[jtem] = true
																			}
																		}
																	} else {
																		if (i == allContentList[jtem].inputList.length - 1) {
																			satisfyPercent[jtem] = satisfyNum / total
																		}
																	}
																}
															}
														} catch (error) {

														}
													}
												} else {
													console.log("规则脚本有误" + JSON.stringify(allContentList[jtem]))
												}
											}
										})
										resolve([statusList, satisfyPercent])
									} catch (e) {
										Modal.error({
											title: '错误提示',
											content: "后台请求实时数据失败！"
										});
										resolve([])
									}
								}
								this.setState({
									ruleLoading: false
								})
							}
						).catch(
							err => {
								this.setState({
									ruleLoading: false
								})
								Modal.error({
									title: '错误提示',
									content: "后台请求实时数据失败！"
								});
								resolve([])
							}
						)

					}

				} else {

					resolve([])

				}
			} else {

				resolve([])
			}
		})
	}

	//处理多选
	handleCheckboxChange = (e) => {
		let ruleList = this.state.ruleList;
		if (e.target.checked) {
			ruleList.push(e.target.value)
			this.setState({
				ruleList: ruleList
			})
		} else {
			let index = ruleList.indexOf(e.target.value)
			ruleList.splice(index, 1)
			this.setState({
				ruleList: ruleList
			})
		}
	}

	//整理左侧菜单
	getScriptRuleList() {
		let menuList = []
		let key = Number(this.state.curTabkey)
		if (this.state.ruleNameList.length != 0) {
			let statusList = this.state.statusList
			let satisfyPercent = this.state.satisfyPercent
			menuList = this.state.ruleNameList.map((item, i) => {
				let satisfyWidth = 0
				if (satisfyPercent != undefined && satisfyPercent != -1) {
					satisfyWidth = Number(satisfyPercent[item]) * 150
				}
				//分tab,每个tab最多显示15个
				if ((key - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (key * 15 + 1)) {
					//默认是白色字体，未启用也是白色
					let titleColor = "#FFFFFF"
					if (statusList != undefined) {
						if (
							// (this.state.allContentList[item].enabled != 0 || this.state.allContentList[item].enabled == undefined) && 
							Object.keys(statusList).length != 0) {
							if (statusList[item]) {
								titleColor = "rgb(55 255 95)"
							} else if (satisfyPercent != undefined && satisfyPercent[item] != undefined && satisfyPercent[item] == -1) {
								titleColor = "rgb(255 76 76)"
							}
						}
					}


					return <MenuItem className={s['menuItem']} style={{ marginTop: "-5px", paddingLeft: "27px", paddingRight: "4px", backgroundColor: this.state.allContentList[item].enabled == 0 ? '#666666' : '#003366', color: "#fff", borderBottom: "1px solid rgb(53 77 86)" }} title={this.state.ruleTitleList[i]} key={item}
						onContextMenu={(e) => this.handleContextMenu(e, item)}
						onClick={() => { if (this.state.contextMenuVisible) { this.closeContextMenu() } this.callback(this.state.curTabkey, true) }}
					>
						{this.state.checkVisible && <Checkbox value={i} onChange={(e) => { this.handleCheckboxChange(e) }} />}
						<span style={{
							fontSize: "10px", display: "inline-block", width: 22, textAlign: 'center', height: 15, lineHeight: "14px", padding: "0 1px", backgroundColor: "#5a6873", color: "#fff", borderRadius: 5, position: 'absolute', left: 2,
							fontWeight: 700
						}}>
							{Number(item.substr(-3))}</span><span style={{ color: titleColor, display: 'inline-block', paddingTop: 5 }}>{this.state.ruleTitleList[i]}</span>
						{/* 启停按钮、复制按钮 */}
						{
							this.state.allContentList[item].enabled == 0 ?
								<Icon style={{ fontSize: "18px" }} type="play-circle" className={s['btnPlay']} onClick={() => { this.handlePlay() }} />
								:
								<Icon style={{ fontSize: "18px" }} type="pause-circle" className={s['btnPause']} onClick={() => { this.handlePause() }} />
						}
						<Icon style={{ fontSize: "18px" }} type="copy" className={s['btnCopy']} onClick={() => { this.handleCopy() }} />
						{/* 进度条 */}
						{
							satisfyPercent != undefined && satisfyPercent[item] != undefined && satisfyPercent[item] == -1 ?
								<div style={{ width: 150, height: 10, display: 'inline-block', border: 'thin solid rgb(255 76 76)', position: 'absolute', left: 36 }}></div>
								:
								(satisfyPercent && satisfyPercent[item] && satisfyPercent[item] == 1 ?
									<div style={{ width: 150, height: 10, display: 'inline-block', border: 'thin solid rgb(55 255 95)', position: 'absolute', left: 36 }}></div>
									:
									<div style={{ width: 150, height: 10, display: 'inline-block', border: 'thin solid #FFFFFF', position: 'absolute', left: 36 }}></div>
								)
						}
						{/* 
						规则管理中当规则未运行时，左侧的进度条显白色
						运行时，有语法错的显示全红，没有语法错误的按百分比显示绿色
						*/}
						{
							satisfyPercent != undefined && satisfyPercent[item] != undefined && satisfyPercent[item] == -1 ?
								<div style={{ width: 150, height: 10, display: 'inline-block', position: 'absolute', left: 36, backgroundColor: 'rgb(255 76 76)' }}></div>
								:
								this.state.allContentList[item].enabled == 0 ?
									<div style={{ width: satisfyWidth, height: 10, display: 'inline-block', position: 'absolute', left: 36, backgroundColor: '#FFFFFF' }}></div>
									:
									<div style={{ width: satisfyWidth, height: 10, display: 'inline-block', position: 'absolute', left: 36, backgroundColor: 'rgb(55 255 95)' }}></div>
						}
					</MenuItem>
				}
			})



		}
		return menuList;
	}

	//左侧菜单点击事件
	handleClick(e) {
		let selectRule = this.state.allContentList[e.key]
		let selectKey = e.key
		this.setState({
			currentKey: selectKey,
			currentScript: selectRule
		})
	}

	handleContextMenu(e, item) {
		let selectRule = this.state.allContentList[item]
		let selectKey = item
		this.setState({
			currentKey: selectKey,
			currentScript: selectRule
		})
		let tabList = []

		tabNumArr.forEach(item => {
			//先判断该分组tab中，数量是否已满

			if (this.getInsertOrReplaceIndex(+item) !== -1) {
				tabList.push(item);
			}
		})
		const { pageX, pageY } = e;
		this.setState({
			contextMenuVisible: true,
			contextMenuPosition: { x: pageX - 81, y: pageY - 188 },
			enableCopyTabList: tabList
		})
	}

	closeContextMenu = () => {
		this.setState({
			contextMenuVisible: false
		})
	}



	deleteModal(currentKey) {
		//修改规则及标题前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: language == 'en' ? 'Error' : '错误提示',
				content: language == 'en' ? "Please create a rule in the current group first!" : "请先在当前分组中创建规则！"
			})
		} else {
			Modal.confirm({
				title: language == 'en' ? 'Confirm' : '确认提示',
				content: language == 'en' ? 'Are you sure you want to delete this rule script?' : '真的要删除此规则脚本吗？',
				onOk: () => { this.deleteRule(currentKey) },
				onCancel() { }
			});
		}
	}

	deleteRule(currentKey) {
		let currentScript = JSON.parse(JSON.stringify(this.state.currentScript))

		if (currentScript.outputList != undefined) {
			currentScript.outputList.forEach((item, i) => {
				if (item) {
					currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
				}
			})
		}

		http.post('/project/saveConfig', {
			key: currentKey,
			config: JSON.stringify({
				"title": "暂无标题",
				"keepMinutes": 10,
				"inputList": [],
				"outputList": [],
				"enabled": 0

			}),
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId,
			...(language == 'en' ? { "lan": "en" } : {})
		}).then(
			data => {
				if (!data.err) {
					this.getScriptRuleFromConfig(currentKey);
				} else {

				}
			}
		).catch(
			err => {

			}
		)
	}


	//修改脚本
	changeScript({ target: { value } }) {
		this.setState({
			currentScript: JSON.parse(value)
		})
	}

	editModal(currentKey) {
		Modal.confirm({
			title: '编辑脚本',
			content: (
				<div>
					<TextArea
						autoSize={{ minRows: 10, maxRows: 20 }}
						defaultValue={JSON.stringify(this.state.currentScript, null, 4)}
						onChange={this.changeScript}
					/>
				</div>
			),
			onOk: () => { this.saveScript(currentKey, this.state.currentScript) },
			onCancel: () => {
				this.setState({
					currentScript: this.state.allContentList[currentKey]
				})
			},
			okText: "保存",
			icon: <Icon type="edit" />,
			width: 800
		})
	}



	saveScript(currentKey, currentScript) {

		if (currentScript.outputList != undefined) {
			currentScript.outputList.forEach((item, i) => {
				if (item) {
					currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
				}
			})
		}
		http.post('/project/saveConfig', {
			key: currentKey,
			config: JSON.stringify(currentScript),
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId,
			...(language == 'en' ? { "lan": "en" } : {})
		}).then(
			data => {
				if (data.status) {
					this.getScriptRuleFromConfig(currentKey);

				} else {

					Modal.error({
						title: '错误提示',
						content: "保存规则失败"
					})
				}
			}
		).catch(
			err => {

				Modal.error({
					title: language == 'en' ? 'Error' : '错误提示',
					content: language == 'en' ? "Failed to save rule" : "保存规则失败"
				})
			}
		)
	}

	addRuleModal() {
		Modal.confirm({
			title: language == 'en' ? 'Add Rule Script' : '添加规则脚本',
			content: (
				<div>
					<TextArea
						autoSize={{ minRows: 10, maxRows: 20 }}
						onChange={this.changeAddScript}
					/>
				</div>
			),
			onOk: () => { this.addRulePage(this.state.addChangeScript) },
			onCancel: () => { },
			okText: language == 'en' ? "Add" : "添加",
			icon: <Icon type="file-add" />,
			width: 800
		})
	}

	changeAddScript({ target: { value } }) {
		this.setState({
			addChangeScript: value
		})
	}

	//修改规则及标题
	editTitleModal = (currentKey) => {
		//修改规则及标题前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: language == 'en' ? 'Error' : '错误提示',
				content: language == 'en' ? "Please create a rule in the current group first!" : "请先在当前分组中创建规则！"
			})
		} else {
			let currentScript = this.state.currentScript
			let orgTitle = currentScript.title
			let orgKeepTime = currentScript.keepMinutes
			//先给state里同步当前信息，防止保存时未修改的信息保存为空
			this.setState({
				editTitle: orgTitle,
				editTime: orgKeepTime
			})
			Modal.confirm({
				title: language == 'en' ? 'Edit Rule' : '修改规则',
				content: (
					<div>
						<span style={{ display: 'inline-block', width: 110 }}>{language == 'en' ? 'Rule Name:' : '规则名称：'}</span>
						<Input
							style={{ width: '234px' }}
							onChange={this.editChangeTitle}
							defaultValue={orgTitle}
						/>
						<div>
							<span style={{ display: 'inline-block', width: 110 }}>{language == 'en' ? 'Condition Keep Time:' : '条件保持时间：'}</span>
							<InputNumber
								style={{ marginTop: '10px' }}
								defaultValue={orgKeepTime}
								onChange={this.editChangeTime}
							/>
							<span> {language == 'en' ? 'minutes' : '分钟'}</span>
						</div>

					</div>
				),
				onOk: () => { this.editRulePage(this.state.editTitle, this.state.editTime, currentKey, currentScript) },
				onCancel: () => { },
				okText: language == 'en' ? "Edit" : "修改",
				width: 470
			})
		}

	}

	editChangeTitle({ target: { value } }) {
		this.setState({
			editTitle: value
		})
	}

	editChangeTime(value) {
		this.setState({
			editTime: value
		})
	}

	//修改规则-保存
	editRulePage(editTitle, editTime, currentKey, currentScript) {

		currentScript.title = editTitle
		currentScript.keepMinutes = editTime
		if (currentScript.outputList != undefined) {
			currentScript.outputList.forEach((item, i) => {
				if (item) {
					currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
				}
			})
		}



		http.post('/project/saveConfig', {
			key: currentKey,
			config: JSON.stringify(currentScript),
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId,
			...(language == 'en' ? { "lan": "en" } : {})
		}).then(
			data => {
				if (data.status) {
					this.getScriptRuleFromConfig(currentKey);

				} else {

					Modal.error({
						title: language == 'en' ? 'Error' : '错误提示',
						content: language == 'en' ? "Failed to modify rule page" : "修改规则页面失败"
					})
				}
			}
		).catch(
			err => {

				Modal.error({
					title: language == 'en' ? 'Error' : '错误提示',
					content: language == 'en' ? "Failed to modify rule page" : " 修改规则页面失败"
				})
			}
		)
	}

	//导出规则
	exportRules = () => {
		Modal.confirm({
			title: language == 'en' ? 'Export Rules?' : '是否要导出规则？',
			onOk: () => {
				this.setState({
					exportRulesLoading: true
				})
				http.get(`/exportRules${language == 'en' ? '?lan=en' : ''}`).then(res => {
					this.setState({
						exportRulesLoading: false
					})
					if (res.err == 0) {
						downloadUrl(appConfig.serverUrl + '/static/temp/' + res.data)
					} else {
						Modal.error({
							title: language == 'en' ? 'Tip' : '提示',
							content: res.msg
						})
					}
				}).catch(err => {
					Modal.error({
						title: language == 'en' ? 'Tip' : '提示',
						content: language == 'en' ? 'Failed to export AI table, please check backend version' : '导出AI表接口请求失败，请检查后台版本'
					})
					this.setState({
						Loading: false
					})
				})
			}
		})
	}

	//打开导入规则的弹窗
	openImportRulesModal = () => {
		this.setState({
			importRulesVisible: true
		})
	}
	//打开导入规则的弹窗
	closeImportRulesModal = () => {
		this.setState({
			importRulesVisible: false
		})
	}


	//获得添加或者替换的位置 key
	getInsertOrReplaceIndex(tabKey) {
		let curRuleNum = 0
		let key;
		if (this.state.ruleNameList.length != 0) {
			// 这边的循环可优化
			this.state.ruleNameList.forEach((item, i) => {
				if ((tabKey - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (tabKey * 15 + 1)) {
					curRuleNum++
					if (!key && this.state.allContentList[item].inputList.length === 0 &&
						this.state.allContentList[item].outputList.length === 0 &&
						this.state.allContentList[item].title === (language == 'en' ? "No Title" : "暂无标题")
					) {
						key = curRuleNum;
					}
				}
			})
		}
		if (curRuleNum < 15) {
			return (tabKey - 1) * 15 + 1 + curRuleNum;
		} else {
			if (key) {
				return (tabKey - 1) * 15 + key;
			}
			return -1;
		}
	}


	//添加规则及标题
	addTitleModal = (currentScript) => {
		//如果是复制，直接调接口添加，无需弹框
		if (this.state.copyFlag) {
			let newRuleKey;
			if (newRuleKey = this.getInsertOrReplaceIndex(this.state.curTabkey), newRuleKey !== -1) {
				this.addRulePage(this.state.addChangeTitle, this.state.addChangeTime, newRuleKey, currentScript);
				this.setState({
					copyFlag: false
				});
			} else {
				this.chooseTagForCopy(currentScript);
			}
		} else {
			Modal.confirm({
				title: language == 'en' ? 'Create New Rule' : '新建规则',
				content: (
					<div>
						<span style={{ display: 'inline-block', width: 110 }}>{language == 'en' ? 'Rule Name:' : '规则名称：'}</span>
						<Input
							style={{ width: '180px' }}
							onChange={this.changeTitle}
						/>
						<div>
							<span style={{ display: 'inline-block', width: 110 }}>{language == 'en' ? 'Condition Keep Time:' : '条件保持时间：'}</span>
							<InputNumber
								style={{ marginTop: '10px' }}
								defaultValue={this.state.addChangeTime}
								onChange={this.changeTime}
							/>
							<span> {language == 'en' ? 'minutes' : '分钟'}</span>
						</div>

					</div>
				),
				onOk: () => {
					let newRuleKey;
					if (newRuleKey = this.getInsertOrReplaceIndex(this.state.curTabkey), newRuleKey !== -1) {
						this.addRulePage(this.state.addChangeTitle, this.state.addChangeTime, newRuleKey)
					} else {
						Modal.warning({
							title: language == 'en' ? 'Tip' : '提示',
							content: language == 'en' ? "Current group is full with 15 rules" : "当前分组已满15个规则"
						})
					}
				},
				onCancel: () => { },
				okText: language == 'en' ? "Add" : "添加",
				icon: <Icon type="file-add" />,
				width: 400
			})
		}
	}

	//该分组已存满15个规则后，提供选择其他分组的弹框
	chooseTagForCopy = (currentScript) => {
		let tabList = []
		let ruleNumList = []
		tabNumArr.forEach(item => {
			//先判断该分组tab中，数量是否已满
			if (this.getInsertOrReplaceIndex(+item) !== -1) {
				tabList.push(item);
			}
		})
		Modal.confirm({
			title: '复制到分组',
			content: (
				<div>
					<p>当前分组已满15个规则，请选择以下其他未满分组</p>
					<Select placeholder="请选择分组" style={{ width: 250 }} onSelect={this.handleSelect}>
						{
							tabList.map(tab => {
								return (
									<Option key={tab} value={tab}>分组{tab}</Option>
								)
							})
						}
					</Select>
				</div>
			),
			onOk: () => {
				if (this.state.copyTab == '') {
					Modal.info({
						title: '操作提示',
						content: "未选择分组,复制失败！"
					})
				} else {
					let newRuleKey = this.getInsertOrReplaceIndex(this.state.copyTab)
					//如果是复制，直接调接口添加，无需弹框
					this.addRulePage(this.state.addChangeTitle, this.state.addChangeTime, newRuleKey, currentScript);
					this.setState({
						copyFlag: false,
						copyTab: ""
					});
				}
			},
			okText: "复制",
			onCancel: () => {
				this.setState({
					copyTab: ""
				});
			}
		});
	}

	handleSelect = (value) => {
		this.setState({
			copyTab: value
		})
	}

	handleGetDomlogicNames = () => {
		let checkedValues = []
		http.post('/getDomlogicNamesByDllName', {
			dllName: "StandardRuleControl"
		}).then(
			res => {
				checkedValues = res.data.map(item => item.replace('.exe', ''))
				this.setState({
					checkedDomlogicNameList: checkedValues
				})
			}
		)
	}

	handleRestartDomlogic = () => {
		let checkedValues = this.state.checkedDomlogicNameList
		Modal.confirm({
			title: `是否要重启进程 ${checkedValues}？`,
			content: '重启进程可能会影响策略运行，请确保在不会影响项目运行的情况下执行该操作。',
			onOk: () => {
				checkedValues.map((item) => (
					http.post(`/dom/restart/${item}`, {
						cloudUserId: appConfig.cloudUser.cloudUserId,
						projectId: appConfig.projectId
					}).then(
						res => {
							if (res.status == true) {
								message.success(`${item}重启成功`)
							} else {
								message.error(res.msg)
							}
						}
					).catch(
						err => {
							message.error('重启接口请求失败')
						}
					)
				))
			}
		})
	}

	handleMoveSelect = (value) => {
		this.handleSelect(value)
		this.setState({
			copyFlag: true
		}, () => {
			Modal.confirm({
				title: `是否要复制到分组${value}？`,
				content: `复制后，原规则将被删除，请确认是否要复制到分组？${value}`,
				onOk: () => {
					let currentScript = this.state.currentScript
					let newRuleKey = this.getInsertOrReplaceIndex(this.state.copyTab)
					this.addRulePage(this.state.addChangeTitle, this.state.addChangeTime, newRuleKey, currentScript, true);
					this.setState({
						copyFlag: false,
						copyTab: ""
					});
					this.deleteRule(this.state.currentKey)
					this.closeContextMenu();
					this.handleGetDomlogicNames()
					this.handleRestartDomlogic()
				},
			})

		})

	}


	changeTitle({ target: { value } }) {
		this.setState({
			addChangeTitle: value
		})
	}

	changeTime(value) {
		this.setState({
			addChangeTime: value
		})
	}


	//新建规则
	addRulePage(addChangeTitle, addChangeTime, newRuleKey, currentScript, isMove = false) {
		/** 不分tab时的新建编号
		let newItem = "script_rule_450"
		if (this.state.ruleNameList.length == 0) {
			newItem = "script_rule_001"
		} else {
			let ruleMax = this.state.ruleNameList[this.state.ruleNameList.length - 1]
			let newRuleKey = Number(ruleMax.substr(-3)) + 1

			if (newRuleKey < 10) {
				newItem = "script_rule_00" + newRuleKey;
			} else {
				if (newRuleKey < 100) {
					newItem = "script_rule_0" + newRuleKey;
				} else {
					newItem = "script_rule_" + newRuleKey;
				}
			}
		}
		*/
		let newItem = "script_rule_450"
		if (newRuleKey < 10) {
			newItem = "script_rule_00" + newRuleKey;
		} else {
			if (newRuleKey < 100) {
				newItem = "script_rule_0" + newRuleKey;
			} else {
				newItem = "script_rule_" + newRuleKey;
			}
		}



		let obj = {
			"title": addChangeTitle,
			"keepMinutes": addChangeTime,
			"inputList": [],
			"outputList": [],
			"enabled": 0   //新建的规则默认是停止的，enabled是0，0是停止
		}

		//判断是不是点击的复制，复制的话，直接给脚本
		if (currentScript != undefined) {
			if (isMove) {
				obj.title = currentScript.title;
			} else {
				obj.title = currentScript.title + "_copy" + newRuleKey
			}
			obj.keepMinutes = currentScript.keepMinutes
			obj.inputList = currentScript.inputList
			obj.outputList = currentScript.outputList
			obj.enabled = currentScript.enabled
			currentScript.outputList.forEach((item, i) => {
				if (item) {
					currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
				}
			})
		}

		http.post('/project/saveConfig', {
			key: newItem,
			config: JSON.stringify(obj),
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId,
			...(language == 'en' ? { "lan": "en" } : {})
		}).then(
			data => {
				if (data.status) {
					this.getScriptRuleFromConfig(newItem);

				} else {

					Modal.error({
						title: '错误提示',
						content: "添加规则页面失败"
					})
				}
			}
		).catch(
			err => {

				Modal.error({
					title: '错误提示',
					content: "添加规则页面失败"
				})
			}
		)
	}

	/**
	 * 参数添加treeRender，用于判断是否是Tree组件刷新调用
	 * 目前treeRender只在点击刷新条件状态时调用，其他情况不调用
	 */
	callback = (key, treeRender = false) => {
		this.getTabRuleStatus(key).then(([statusList, satisfyPercent]) => {
			this.setState({
				curTabkey: key,
				statusList: statusList,
				satisfyPercent: satisfyPercent,
			})
			//当切换的分组不为空时，自动选中分组中的第一个
			if (treeRender && this.state.currentKey && this.state.currentScript) {

			} else if (this.isEmptyFun) {
				let firstNo = (Number(key) - 1) * 15 + 1
				let firstRuleName = ""
				if (firstNo < 10) {
					firstRuleName = "script_rule_00" + firstNo;
				} else {
					if (firstNo < 100) {
						firstRuleName = "script_rule_0" + firstNo;
					} else {
						firstRuleName = "script_rule_" + firstNo;
					}
				}
				let selectRule = this.state.allContentList[firstRuleName]
				let selectKey = firstRuleName
				this.setState({
					currentKey: selectKey,
					currentScript: selectRule
				})
			}
			localStorage.setItem("scriptTabKey", key);
		})

	}

	handleCheckVisible = () => {
		if (this.state.checkVisible) {
			this.setState({
				checkVisible: false,
				ruleList: []
			})
		} else {
			this.setState({
				checkVisible: true
			})
		}
	}

	handleJsonVisible = (key) => {
		this.setState({
			jsonVisible: true,
			jsonKey: key
		})
	}

	handleJsonCopy = () => {
		if (this.textAreaRef && this.textAreaRef.resizableTextArea) {
			const textarea = this.textAreaRef.resizableTextArea.textArea;
			textarea.select();
			try {
				document.execCommand('copy');
				message.success('复制成功');
			} catch (err) {
				message.error('复制失败');
			}
		}
	};

	handleJsonImport = () => {
		const { jsonText, currentKey } = this.state;
		let currentScript = JSON.parse(JSON.stringify(this.state.currentScript))

		try {
			const jsonObj = JSON.parse(jsonText);

			// 检查必需字段
			const requiredFields = ['enabled', 'inputList', 'keepMinutes', 'outputList', 'title']
			const missingFields = requiredFields.filter(field => !jsonObj.hasOwnProperty(field))

			if (missingFields.length > 0) {
				message.error(`缺少必需字段：${missingFields.join('、')}`);
				return;
			}

			// 检查字段类型
			if (!Array.isArray(jsonObj.inputList) || !Array.isArray(jsonObj.outputList)) {
				message.error('inputList 和 outputList 必须为数组')
				return;
			}

			// 验证enabled字段
			if (typeof jsonObj.enabled !== 'number' || ![0, 1].includes(jsonObj.enabled)) {
				message.error('enabled 必须为数字且只能是 0 或 1')
				return;
			}

			// 验证keepMinutes字段
			if (typeof jsonObj.keepMinutes !== 'number' || jsonObj.keepMinutes < 0 || jsonObj.keepMinutes > 1440) {
				message.error('keepMinutes 必须为数字且范围为 0-1440 分钟')``
				return;
			}

			// 验证inputList中的元素
			if (jsonObj.inputList.length > 0) {
				const invalidInput = jsonObj.inputList.some(item =>
					typeof item !== 'object' ||
					!item.hasOwnProperty('script') ||
					!item.hasOwnProperty('title')
				);
				if (invalidInput) {
					message.error('inputList 中的每个元素必须是包含 script 和 title 字段的对象');
					return;
				}
			}

			// 验证outputList中的元素
			if (jsonObj.outputList.length > 0) {
				const invalidOutput = jsonObj.outputList.some(item =>
					typeof item !== 'object' ||
					!item.hasOwnProperty('script') ||
					!item.hasOwnProperty('title')
				);
				if (invalidOutput) {
					message.error('outputList 中的每个元素必须是包含 script 和 title 字段的对象');
					return;
				}
			}
			message.success('JSON格式正确');
			this.setState({
				jsonVisible: false,
			})

			if (currentScript.outputList != undefined) {
				currentScript.outputList.forEach((item, i) => {
					if (item) {
						currentScript.outputList[i] = this.convertScriptToNewVersion(currentScript.outputList[i])
					}
				})
			}

			http.post('/project/saveConfig', {
				key: currentKey,
				config: JSON.stringify(
					jsonObj
				),
				cloudUserId: appConfig.cloudUser.cloudUserId,
				projectId: appConfig.projectId,
				...(language == 'en' ? { "lan": "en" } : {})
			}).then(
				data => {
					this.getScriptRuleFromConfig(currentKey)
				}
			).catch(
				err => {

				}
			)
		} catch (e) {
			message.error('JSON格式错误');
		}

	}

	handleJsonChange = (e) => {
		this.setState({
			jsonText: e.target.value
		})
	}

	render() {
		const style = { height: 850, width: '100%' }
		const {
			hidePointModal,
			selectedIds,
			pointData,
			showPointModal,
			onSelectChange
		} = this.props

		let selectedPoint = pointData != undefined ? pointData.filter(item => {
			if (selectedIds != undefined && selectedIds[0] != undefined && selectedIds[0] === item.name) return item
		})[0] || {} : {};


		let title_input, title_output, ds_input, ds_output, col_input, col_output;



		return (
			<Modal
				title={<div>
					{language == 'en' ? 'Rule Control' : '规则控制'}
					<Button
						loading={this.state.ruleButLoading}
						style={{ marginLeft: 10 }}
						icon="reload"
						onClick={() => { this.getScriptRuleFromConfig(this.state.currentKey) }}
					>
					</Button>
				</div>}
				visible={this.props.visible}
				onCancel={this.props.closeScriptRuleModal}
				footer={null}
				width={1800}
				maskClosable={false}
			>
				<Spin tip={language == 'en' ? "Reading data..." : "Loading…"} spinning={this.state.allRuleLoading}>
					<Tabs activeKey={this.state.curTabkey} onChange={this.callback} >
						{
							tabNumArr.map((item, i) => {
								return (
									<TabPane
										tab={<Badge
											count={this.state.runningNubList[i]}
											offset={[5, 0]}
											style={{ backgroundColor: 'rgb(26 165 196)', height: 15, lineHeight: '15px', color: '#fff' }}>
											<span>{language == 'en' ? "Group " + item : "分组" + item}</span>
										</Badge>}
										key={item}
									>
										{/* 一整页的展示 */}
										<Layout>
											<Sider width={260}>
												<div style={{ height: '636px', borderBottom: '1px solid white' }}>
													<Menu
														selectedKeys={[this.state.currentKey]}
														mode="inline"
														onClick={this.handleClick}
														className='scriptRule'
													>
														{this.getScriptRuleList()}
													</Menu>
												</div>

												<div className={s['sider-footer']} >
													<Button type='primary' icon="plus"
														onClick={this.addTitleModal}
													>
														{language == 'en' ? 'Add Rule' : '添加规则'}
													</Button>
												</div>
												<Button
													style={{
														position: 'absolute',
														left: '130px',
														bottom: '0px',
														height: '25px',
														width: '130px',
													}}
													onClick={() => { this.handleCheckVisible() }}>{
														this.state.checkVisible ? (language == 'en' ? "Close Multi-Select" : "关闭多选") : (language == 'en' ? "Multi-Select Rules" : "多选规则")}</Button>
												<Button
													style={{
														position: 'absolute',
														left: '130px',
														bottom: '35px',
														height: '25px',
														width: '130px',
													}}

													onClick={() => {
														let ruleList = this.state.ruleList.length !== 0 ? this.state.ruleList : [...Array(15).keys()]
														let ruleIdList = ruleList.map(i => (i + 1) + (this.state.curTabkey - 1) * 15)


														http.post('/mergeRulesToAI', {
															ruleIdList: ruleIdList,
														}).then(
															res => {
																if (res.err === 0) {
																	title_input = res.data.intputDescList.map((item, i) => {
																		return (item + '(' + res.data.intputPointNameList[i] + ')')
																	})
																	title_output = res.data.outputDescList.map((item, i) => {
																		return (item + ' ' + res.data.outputPointNameList[i] + '')
																	})
																	let titles = [...title_input, ...title_output]

																	let columns = titles.map((title, index) => {
																		if (index < title_input.length) {
																			return {
																				title: title,
																				dataIndex: title,
																				key: title,
																				render: (text) => <div style={{ backgroundColor: 'rgb(6, 138, 116)' }}>{text}</div>,
																			}
																		} else {
																			return {
																				title: title,
																				dataIndex: title,
																				key: title,
																			}
																		}
																	})


																	const dataSource = res.data.dataList.map((item, rowIndex) => {
																		const rowData = {};

																		titles.forEach((title, colIndex) => {
																			rowData[title] = item[colIndex] ? item[colIndex] : "";

																		})
																		rowData.key = (rowIndex + 1).toString();

																		return rowData;
																	})
																	this.setState({
																		columns: columns,
																		dataSources: dataSource
																	})

																}

															}
														).then(
															this.setState({
																showAiModal: true
															})
														)
													}
													} >
													{language == 'en' ? 'Show AI Table' : 'AI表展示'}
												</Button>
												<Button
													style={{
														position: 'absolute',
														left: '0px',
														bottom: '35px',
														width: '125px',
														height: '25px',
														textAlign: 'center',
													}}
													onClick={this.exportRules} loading={this.state.exportRulesLoading}>
													<Icon type="download" />{language == 'en' ? 'Export All' : '全量导出规则'}
												</Button>
												<Button
													style={{
														position: 'absolute',
														left: '0px',
														bottom: '0px',
														width: '125px',
														height: '25px',
														textAlign: 'center',
													}}
													onClick={this.openImportRulesModal}><Icon type="upload" />{language == 'en' ? 'Import All' : '全量导入规则'}</Button>
											</Sider>
											<Layout>
												<Header>
													{
														this.state.ruleNameList.length != 0 ?
															<div style={{ overflow: 'hidden' }}>
																<div style={{ float: "left" }}>
																	<Button type="primary" onClick={() => { this.handleAddInputModal(this.state.currentKey) }}>{language == 'en' ? 'Add Input Condition' : '添加输入条件'}</Button>
																</div>
																<div style={{ float: "right" }}>
																	{/* <Button type="primary" onClick={() => { this.handleAddOutputModal(this.state.currentKey) }}>添加输出动作</Button>
																	 */}
																	<Dropdown
																		overlay={
																			<Menu onClick={({ key }) => this.handleAddOutputModal(this.state.currentKey, key)}>
																				<MenuItem key="option1">{language == 'en' ? 'Point Assignment' : '点位赋值'}</MenuItem>
																				<MenuItem key="option13">{language == 'en' ? 'Raise Point Setting' : '点位升高设定'}</MenuItem>
																				<MenuItem key="option14">{language == 'en' ? 'Lower Point Setting' : '点位降低设定'}</MenuItem>
																				<MenuItem key="option15">{language == 'en' ? 'Raise Chilled Water Temp' : '提升冷水温度'}</MenuItem>
																				<MenuItem key="option16">{language == 'en' ? 'Lower Chilled Water Temp' : '降低冷水温度'}</MenuItem>
																				<MenuItem key="option2">{language == 'en' ? 'Raise Hot Water Temp' : '提升热水温度'}</MenuItem>
																				<MenuItem key="option3">{language == 'en' ? 'Lower Hot Water Temp' : '降低热水温度'}</MenuItem>
																				<MenuItem key="option4">{language == 'en' ? 'Wait for a Period' : '等待一段时间'}</MenuItem>
																				<MenuItem key="option5">{language == 'en' ? 'Add Equipment' : '增开设备'}</MenuItem>
																				<MenuItem key="option6">{language == 'en' ? 'Remove Equipment' : '减开设备'}</MenuItem>
																				<MenuItem key="option7">{language == 'en' ? 'Raise Frequency' : '提升频率'}</MenuItem>
																				<MenuItem key="option8">{language == 'en' ? 'Lower Frequency' : '降低频率'}</MenuItem>
																				<MenuItem key="option9">{language == 'en' ? 'Wait for Condition' : '等待一定条件'}</MenuItem>
																				<MenuItem key="option10">{language == 'en' ? 'Send Alarm to System' : '发送报警到系统'}</MenuItem>
																				<MenuItem key="option11">{language == 'en' ? 'Send Alarm to User' : '发送报警到用户'}</MenuItem>
																				<MenuItem key="option12">{language == 'en' ? 'Add Script' : '脚本添加'}</MenuItem>

																			</Menu>
																		}
																	>
																		<Button type="primary" style={{ marginLeft: 15 }}>{language == 'en' ? 'Add Output Action' : '添加输出动作'} ▼</Button>
																	</Dropdown>
																	<Button style={{ marginLeft: "15px" }} onClick={() => { this.editTitleModal(this.state.currentKey) }}>{language == 'en' ? 'Edit Rule Info' : '修改规则信息'}</Button>
																	<Button type="danger" style={{ marginLeft: "10px" }} icon="delete" onClick={() => { this.deleteModal(this.state.currentKey) }}>{language == 'en' ? 'Clear' : '清空'}</Button>
																	{/* <Button type='primary' style={{ marginLeft: "10px" }} onClick={() => { this.setState({jsonVisible: true})}}>json导入导出</Button>			 */}
																	<Dropdown
																		overlay={
																			<Menu onClick={({ key }) => this.handleJsonVisible(key)}>
																				<MenuItem key="option1">{language == 'en' ? 'JSON Import' : 'json导入'}</MenuItem>
																				<MenuItem key="option2">{language == 'en' ? 'JSON Export' : 'json导出'}</MenuItem>
																			</Menu>
																		}
																	>
																		<Button type="primary" style={{ marginLeft: 15 }}>{language == 'en' ? 'JSON Import/Export' : 'json导入导出'} ▼</Button>
																	</Dropdown>
																</div>
															</div>
															:
															""
													}
												</Header>
												<Content>
													<div id={item} style={{ height: style.height - 180 }}>
														<TreeView
															allContentList={this.state.allContentList}
															currentKey={this.state.currentKey}
															style={style}
															currentScript={this.state.currentScript}
															showEditInputModal={this.showEditInputModal}
															showEditOutputModal={this.showEditOutputModal}
															editTitleModal={this.editTitleModal}
															curTabkey={this.state.curTabkey}
															callback={this.callback}
															replyTime={this.state.replyTime}
															bShowTimeShaft={this.props.bShowTimeShaft}
															ruleLoading={this.state.ruleLoading}
														/>
													</div>
												</Content>
											</Layout>
										</Layout>

										{/** 右键选择框 */}
										{this.state.contextMenuVisible && (
											<div className={s['context-menu']}
												onBlur={this.closeContextMenu}
												style={{ left: this.state.contextMenuPosition.x, top: this.state.contextMenuPosition.y, display: 'flex', alignItems: 'center' }}
											>
												<Icon style={{ fontSize: "18px", marginLeft: '8px', marginRight: '8px' }} type="copy" onClick={() => { this.handleCopy() }} />
												<span style={{ marginRight: '8px' }}>{language == 'en' ? 'Move to' : '移动至'}</span>
												<Select placeholder={language == 'en' ? 'Please select group' : '请选择分组'} style={{ width: '125px' }} onSelect={this.handleMoveSelect}>
													{
														this.state.enableCopyTabList.map(tab => {
															return (
																<Option key={tab} value={tab}>{language == 'en' ? 'Group ' + tab : '分组' + tab}</Option>
															)
														})
													}
												</Select>
											</div>
										)}
									</TabPane>
								)
							})
						}
					</Tabs>
				</Spin>
				<ImportRulesModalView
					handleCancel={this.closeImportRulesModal}
					visible={this.state.importRulesVisible}
					getScriptRuleFromConfig={this.getScriptRuleFromConfig}
					changeLayoutVisible={() => this.changeLayoutVisible()}
				/>
				<AddInputModal
					visible={this.state.isShowAddInputModal}
					handleHide={this.hideAddInputModal}
					handleOk={this.handleAddInputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					onSelectChange={onSelectChange}
					hidePointModal={hidePointModal}
				/>

				<EditInputModal
					visible={this.state.isShowEditInputModal}
					handleHide={this.hideEditInputModal}
					handleOk={this.handleEditInputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					editInputScript={this.state.editInputScript}
					editInputDesc={this.state.editInputDesc}
					deleteInput={this.deleteInput}
					hidePointModal={hidePointModal}
					onSelectChange={onSelectChange}
					bShowTimeShaft={this.props.bShowTimeShaft}
					replyTime={this.state.replyTime}
				/>
				<AddOutputModal
					visible={this.state.isShowAddOutputModal}
					handleHide={this.hideAddOutputModal}
					handleOk={this.handleAddOutputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					onSelectChange={onSelectChange}
					hidePointModal={hidePointModal}
					option={this.state.outputOption}
				/>

				<EditOutputModal
					visible={this.state.isShowEditOutputModal}
					handleHide={this.hideEditOutputModal}
					handleOk={this.handleEditOutputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					editOutputScript={this.state.editOutputScript}
					editOutputDesc={this.state.editOutputDesc}
					deleteOutput={this.deleteOutput}
					hidePointModal={hidePointModal}
					onSelectChange={onSelectChange}
					option={this.state.outputOption}
				/>
				<PointModalView
					hidePointModal={this.props.hidePointModal}
				/>
				<Modal
					title={this.state.jsonKey === 'option1' ? (language == 'en' ? "JSON Import" : "json导入") : (language == 'en' ? "JSON Export" : "json导出")}
					cancelText={language == 'en' ? "Cancel" : "取消"}
					okText={language == 'en' ? "Confirm" : "确认"}
					onCancel={() => { this.setState({ jsonVisible: false, jsonText: '' }) }}
					onOk={this.handleJsonImport}
					visible={this.state.jsonVisible}
					footer={this.state.jsonKey === 'option2' ? (
						<div>
							<Button onClick={this.handleJsonCopy}>{language == 'en' ? 'One-Click Copy' : '一键复制'}</Button>
						</div>
					) : undefined}
				>

					<TextArea rows={20}
						ref={el => { this.textAreaRef = el }}
						value={
							this.state.jsonKey === 'option1' ?
								this.state.jsonText :
								JSON.stringify(this.state.currentScript, null, 2)
						}
						onChange={this.handleJsonChange}
					/>
				</Modal>
				<Modal
					width="100%"
					height="100%"
					visible={this.state.showAiModal}
					onCancel={() => { this.setState({ showAiModal: false }) }}
					onOk={() => { this.setState({ showAiModal: false }) }}
				>
					<Table pagination={false} bordered scroll={{ x: 120, y: 400 }} dataSource={this.state.dataSources} columns={this.state.columns} />
				</Modal>
			</Modal>
		)
	}
}
export default ScriptRuleModalView;
