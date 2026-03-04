/**
 * 模式管理模态框
 */
import React from 'react';
import { Select, Modal, Table, DatePicker, Radio, TimePicker, Icon, InputNumber, Button, Input, Empty, Col, Popover, Layout, Form, Checkbox, Tag, Spin } from 'antd'
import s from './ModelManageModalView.css'
import moment from 'moment';
import SceneView from './SceneModalView';
import http from '../../../common/http';
import PointModalView from '../../debug/components/pointWatch/PointModalView'
import appConfig from '../../../common/appConfig';

const language = appConfig.language
const { Sider, Content, Header } = Layout;
const FormItem = Form.Item
const TimeFormat = 'HH:mm'
const Search = Input.Search
const RadioGroup = Radio.Group;
const Option = Select.Option
const { TextArea } = Input;

// 获取用户菜单显示配置
const user_menu_display = localStorage.getItem('userMenuDisplay') ? JSON.parse(localStorage.getItem('userMenuDisplay')) : {}

let defaultColorArr = ["#99CCFF", "#FF6666", "#00FF99", "#FFFF66", "#669900", "#990066", "#FF9900", "#FF66FF", "#CC6600"]
let str, addEventStyle, toggleModalClass, formClass, btnStyle;
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
} else {
	str = ''
	btnStyle = {
		fontSize: "14px",
		lineHeight: "27px",
		height: '28px',
		marginRight: '2px',
		borderRadius: '2px',
		padding: '0px 10px 0px 5px',
		verticalAlign: 'top'
	}
}

const timeStyle = {
	padding: '0 2px',
	border: '1px solid',
	cursor: 'pointer',
}

const tagStyle = {
	float: "right",
	marginRight: 3,
	height: 15,
	width: 15,
	borderRadius: 15,
	marginTop: 3
}

const headerBtnListStyle = {
	display: 'inline-block',
	overflowX: 'auto',
	maxWidth: 900,
	whiteSpace: 'nowrap',
	verticalAlign: 'top',
	overflowY: 'hidden'
}

//修改按钮模态框
class SceneModModal extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			setValue: this.props.currentValue
		}
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.setValue !== this.state.setValue) {
			return true
		}
		return false
	}

	handleSubmit(e) {
		const { hide, currentValueIndex, SceneId, SceneDataSource } = this.props
		// let settingValue = this.props.form.getFieldsValue().settingValue
		let settingValue = String(this.state.setValue) ? String(this.state.setValue) : this.props.form.getFieldsValue().settingValue
		if (settingValue != undefined && settingValue != null) {
			let data = SceneDataSource
			data[currentValueIndex].pointValue = settingValue
			let pointValue = []
			let pointName = []
			data.map(rowObj => {
				pointValue.push(rowObj.pointValue)
				pointName.push(rowObj.pointName)
			})
			http.post('/env/saveContent', {
				id: SceneId,
				pointNameList: pointName,
				pointValueList: pointValue,
				onduty: appConfig.onduty,
				cloudUserId: appConfig.cloudUser.cloudUserId,
				projectId: appConfig.projectId
			}).then(
				data => {
					hide()
					if (!data.err) {
						Modal.success({
							title: language == 'en' ? 'Success' : '提示',
							content: language == 'en' ? 'Data modified successfully' : '数据修改成功'
						})
					} else {
						Modal.error({
							title: language == 'en' ? 'Error' : '错误提示',
							content: data.msg
						})
					}
				}

			).catch(
				() => {
					hide()
				}
			)

		} else {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Failed to modify point value' : '修改点值失败'
			})
		}
		hide()
		e.preventDefault();
	}

	handleChange = (e) => {
		this.setState({
			setValue: e.target.value
		})
	}


	render() {
		const { getFieldDecorator, SceneDataSource } = this.props.form;
		const { currentValue } = this.props
		return (
			<Modal
				className={toggleModalClass}
				title={language == 'en' ? 'Modify Point Value' : '修改点值'}
				visible={true}
				onCancel={this.props.hide}
				onOk={this.handleSubmit}
				autoFocusButton
			>
				<Form className={formClass}>
					<FormItem>
						{
							getFieldDecorator('settingValue', {
								initialValue: currentValue,
							})(
								<Input
									//自动聚焦
									autoFocus
									//自动全选
									ref={(input) => { input.select() }}
									style={{ width: 300 }}
									onChange={this.handleChange}
								/>
							)
						}
					</FormItem>
				</Form>
			</Modal>
		)
	}
}
const SceneModifyModal = Form.create()(SceneModModal)

//修改场景列表
class ScenePointList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modelData: this.props.modal,
			currentValueIndex: 0,
			currentValue: ''
		}
		this.showChangeValueModal = this.showChangeValueModal.bind(this);
		this.delPoint = this.delPoint.bind(this);
		this.hide = this.hide.bind(this);
	}
	static get defaultProps() {
		return {
			modal: {
				type: null,
				props: {}
			}
		}
	}
	confirm() {
		const { SceneId } = this.props
		let data = this.props.SceneDataSource
		let pointValue = []
		let pointName = []
		data.map(rowObj => {
			pointValue.push(rowObj.pointValue)
			pointName.push(rowObj.pointName)
		})
		http.post('/env/saveContent', {
			id: SceneId,
			pointNameList: pointName,
			pointValueList: pointValue,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					Modal.success({
						title: language == 'en' ? 'Success' : '提示',
						content: data.msg
					})
				} else {
					Modal.error({
						title: language == 'en' ? 'Error' : '错误提示',
						content: data.msg
					})
				}
			}
		).catch(
			() => {

			}
		)
		this.props.handleHide()
	}
	hide() {
		this.setState({
			modelData: ScenePointList.defaultProps.modal
		})
	}
	show(type, props) {
		this.setState({
			modelData: {
				type,
				props
			}
		})
	}

	showChangeValueModal(index, record) {
		this.setState({
			currentValueIndex: index,
			currentValue: record.pointValue
		})
		this.show('SceneModefyModal')
	};
	delPoint(index) {
		const { SceneDataSource, getSceneData, SceneId } = this.props
		let data = SceneDataSource
		let pointValue = []
		let pointName = []
		data.splice(index, 1)
		data.map(rowObj => {
			pointValue.push(rowObj.pointValue)
			pointName.push(rowObj.pointName)
		})
		http.post('/env/saveContent', {
			id: SceneId,
			pointNameList: pointName,
			pointValueList: pointValue,
			onduty: appConfig.onduty,
			cloudUserId: appConfig.cloudUser.cloudUserId,
			projectId: appConfig.projectId
		}).then(
			data => {
				if (!data.err) {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'Data deleted successfully' : '数据删除成功'
					})
				} else {
					Modal.error({
						title: language == 'en' ? 'Error' : '错误提示',
						content: language == 'en' ? 'Failed to delete data' : '数据删除失败'
					})
				}
			}
		).catch(
			() => {
			}
		)
		this.hide()
		// this.show('SceneDelModal')
	};
	render() {
		const { handleHide, getSceneData, SceneDataSource, SceneId, SceneLoading } = this.props
		return (
			<Modal
				title={language == 'en' ? 'Edit Interface' : '编辑界面'}
				visible={true}
				width={1050}
				onCancel={handleHide}
				footer={null}
			>
				<div
					style={{
						margin: '16px 0 8px',
						height: '480px'
					}}
				>
					<Table
						pagination={false}
						bordered
						dataSource={SceneDataSource}
						scroll={{ y: 440 }}
						loading={SceneLoading}
						columns={[{
							title: language == 'en' ? 'Point Name' : '点名',
							dataIndex: 'pointName',
							key: 'pointName',
							width: 380,
							render: (text, record, index) => {
								return (
									<Input readOnly unselectable="on" value={text} />
								)

							}
						},
						{
							title: language == 'en' ? 'Description' : '释义',
							dataIndex: 'description',
							key: 'description',
							width: 380,
							render: (text, record, index) => {
								return (
									<Input readOnly unselectable="on" value={text} />
								)
							}
						},
						{
							title: language == 'en' ? 'Point Value' : '点值',
							dataIndex: 'pointValue',
							key: 'pointValue',
							render: (text, record, index) => {
								return (
									<div>
										<Input readOnly unselectable="on" style={{ "width": "50px", "marginRight": "10px" }} id={record.pointValue} value={record.pointValue} />
										<Button size='small' style={{ "marginRight": "10px" }} onClick={() => { this.showChangeValueModal(index, record) }}>{language == 'en' ? 'Modify' : '修改值'}</Button>
										<Button size='small' onClick={() => this.delPoint(index)} >{language == 'en' ? 'Delete' : '删除'}</Button>
									</div>
								)
							}
						}]
						}
					/>
				</div>
				{
					this.state.modelData.type === 'SceneModefyModal' ?
						(<SceneModifyModal
							hide={this.hide}
							currentValueIndex={this.state.currentValueIndex}
							currentValue={this.state.currentValue}
							SceneDataSource={SceneDataSource}
							getSceneData={getSceneData}
							SceneId={SceneId}
						/>)
						: null
				}
			</Modal>
			// {
			//  this.state.modelData.type === 'SceneDelModal' ? (
			// <SceneDeleteModal
			// SceneDataSource = {SceneDataSource}
			// currentValueIndex = {this.state.currentValueIndex}
			// hide = {this.hide}
			// getSceneData = {getSceneData}
			// />)
			// :null
			// }

		)
	}

}

//复制模式框
class SceneListCopyModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false

		};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		const { copyModel, handleHide, selectedId, modalList } = this.props
		if (this.props.form.getFieldValue('modelName') === "" || this.props.form.getFieldValue('modelName') === undefined) {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Copy mode failed: Mode name cannot be empty' : '复制模式失败：模式名称不能为空'
			})
			return
		}
		let values = this.props.form.getFieldsValue()//获取表单的值
		var modeType
		if (modalList && modalList.length != 0 && selectedId.length != 0) {
			for (let i = 0; i < modalList.length; i++) {
				if (modalList[i].id == selectedId[0]) { modeType = modalList[i].type }
			}
		} //复制模式，默认类型相同
		if (copyModel(selectedId[0], values)) {
			handleHide()
		}
		e.preventDefault();
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 8
			},
			wrapperCol: {
				span: 16
			},
		};
		const { modalList, selectedId } = this.props
		let newData = []
		if (modalList && modalList.length != 0 && selectedId.length != 0) {
			newData = modalList.filter((item) => {
				if (item.id == selectedId[0]) return item
			})
		}
		let modelName = ''
		if (newData.length > 0) {
			modelName = newData[0].name
		}
		var modeType
		if (modalList && modalList.length != 0 && selectedId.length != 0) {
			for (let i = 0; i < modalList.length; i++) {
				if (modalList[i].id == selectedId[0]) {
					modeType = modalList[i].type
				}
			}
		}

		let _this = this
		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Mode copy' : '复制模式'}
				width={500}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				okText={language == 'en' ? 'Copy' : '复制'}
			>
				<Form className={formClass}>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'New mode name' : "新模式名称"}
						hasFeedback
					>
						{getFieldDecorator('modelName', {
							rules: [{
								required: true, message: language == 'en' ? 'The mode name cannot be empty!' : '模式名称不能为空！',
							}],
							initialValue: modelName + '（2）'
						})(
							<Input />
						)}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedSceneListCopyModal = Form.create()(SceneListCopyModal);

//修改模式列表
class SceneListModifyModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false

		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getTypeOptions = this.getTypeOptions.bind(this);
	}

	handleSubmit(e) {
		const { editModel, handleHide, selectedId, modalList } = this.props
		if (this.props.form.getFieldValue('modelName') === "" || this.props.form.getFieldValue('modelName') === undefined) {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Edit mode failed: Mode name cannot be empty' : '修改模式失败：模式名称不能为空'
			})
			return
		}
		let values = this.props.form.getFieldsValue()//获取表单的值
		// var modeType
		// if (modalList && modalList.length != 0 && selectedId.length != 0) {
		//   for (let i = 0; i < modalList.length;i++){
		//     if (modalList[i].id == selectedId[0])
		//       {modeType=modalList[i].type}
		//   }
		// } 
		//模式管理修改模式名称接口需要传递type
		if (editModel(selectedId[0], values)) {
			handleHide()
		}
		e.preventDefault();
	}

	getTypeOptions() {
		if (this.props.typeModeList.length != 0) {
			return this.props.typeModeList.map((item, i) => {
				return (
					<Option value={String(i)} >{language == 'en' && item.name_en ?
						item.name_en :
						item.name}</Option>
				)
			}
			)
		}
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 18
			},
		};
		const { modalList, selectedId } = this.props
		let newData = []
		if (modalList && modalList.length != 0 && selectedId.length != 0) {
			newData = modalList.filter((item) => {
				if (item.id == selectedId[0]) return item
			})
		}
		let modelName = ''
		let modelDescription = ''
		if (newData.length > 0) {
			modelName = newData[0].name
			modelDescription = newData[0].description
		}
		var modeType
		if (modalList && modalList.length != 0 && selectedId.length != 0) {
			for (let i = 0; i < modalList.length; i++) {
				if (modalList[i].id == selectedId[0]) {
					modeType = modalList[i].type
				}
			}
		} //模式管理修改模式名称接口需要传递type
		var typeMode;
		if (this.props.typeModeList.length != 0) {
			this.props.typeModeList.map((item, i) => {
				if (modeType == i) {
					typeMode = language == 'en' && item.name_en ?
						item.name_en :
						item.name
				}
			})
		} else {
			switch (modeType) {
				case 0:
					typeMode = language == 'en' ? 'Cold Station' : "冷站"
					break;
				case 1:
					typeMode = language == 'en' ? 'Hot Station' : "热站"
					break;
				case 2:
					typeMode = language == 'en' ? 'BA Terminal' : "BA末端"
					break;
				case 3:
					typeMode = language == 'en' ? 'Lighting' : "照明"
					break;
				case 4:
					typeMode = language == 'en' ? 'Custom 1' : "自定义1"
					break;
				case 5:
					typeMode = language == 'en' ? 'Custom 2' : "自定义2"
					break;
				case 6:
					typeMode = language == 'en' ? 'Custom 3' : "自定义3"
					break;
				case 7:
					typeMode = language == 'en' ? 'Custom 4' : "自定义4"
					break;
				case 8:
					typeMode = language == 'en' ? 'Custom 5' : "自定义5"
					break;
				case 9:
					typeMode = language == 'en' ? 'Custom 6' : "自定义6"
					break;
				case 10:
					typeMode = language == 'en' ? 'Custom 7' : "自定义7"
					break;
				case 11:
					typeMode = language == 'en' ? 'Custom 8' : "自定义8"
					break;
				case 12:
					typeMode = language == 'en' ? 'Custom 9' : "自定义9"
					break;
				case 13:
					typeMode = language == 'en' ? 'Custom 10' : "自定义10"
					break;
			}
		}

		let _this = this
		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Mode edit' : "修改模式"}
				width={500}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				okText={language == 'en' ? 'Edit' : "修改"}
			>
				<Form className={formClass}>
					{
						this.props.typeModeList.length != 0 ?
							<FormItem
								{...formItemLayout}
								label={language == 'en' ? 'Mode type' : '模式类型'}
								hasFeedback
							>
								{getFieldDecorator('modelType', {
									rules: [{
										required: true, message: language == 'en' ? 'The mode type cannot be empty!' : '模式类型不能为空！',
									}],
									initialValue: typeMode,
								})(
									<Select>
										{
											this.getTypeOptions()
										}
									</Select>
								)}
							</FormItem>
							:
							<FormItem
								{...formItemLayout}
								label={language == 'en' ? 'Mode type' : '模式类型'}
								hasFeedback
							>
								{getFieldDecorator('modelType', {
									rules: [{
										required: true, message: language == 'en' ? 'The mode type cannot be empty!' : '模式类型不能为空！',
									}],
									initialValue: typeMode,
								})(
									<Select>
										<Option value='0' >{language == 'en' ? 'Cold Station' : '冷站'}</Option>
										<Option value='1' >{language == 'en' ? 'Hot Station' : '热站'}</Option>
										<Option value='2' >{language == 'en' ? 'BA Terminal' : 'BA末端'}</Option>
										<Option value='3' >{language == 'en' ? 'Lighting' : '照明'}</Option>
										<Option value='4' >{language == 'en' ? 'Custom 1' : '自定义1'}</Option>
										<Option value='5' >{language == 'en' ? 'Custom 2' : '自定义2'}</Option>
										<Option value='6' >{language == 'en' ? 'Custom 3' : '自定义3'}</Option>
										<Option value='7' >{language == 'en' ? 'Custom 4' : '自定义4'}</Option>
										<Option value='8' >{language == 'en' ? 'Custom 5' : '自定义5'}</Option>
										<Option value='9' >{language == 'en' ? 'Custom 6' : '自定义6'}</Option>
										<Option value='10' >{language == 'en' ? 'Custom 7' : '自定义7'}</Option>
										<Option value='11' >{language == 'en' ? 'Custom 8' : '自定义8'}</Option>
										<Option value='12' >{language == 'en' ? 'Custom 9' : '自定义9'}</Option>
										<Option value='13' >{language == 'en' ? 'Custom 10' : '自定义10'}</Option>
										<Option value='14' >{language == 'en' ? 'Custom 11' : '自定义11'}</Option>
										<Option value='15' >{language == 'en' ? 'Custom 12' : '自定义12'}</Option>
										<Option value='16' >{language == 'en' ? 'Custom 13' : '自定义13'}</Option>
										<Option value='17' >{language == 'en' ? 'Custom 14' : '自定义14'}</Option>
										<Option value='18' >{language == 'en' ? 'Custom 15' : '自定义15'}</Option>
										<Option value='19' >{language == 'en' ? 'Custom 16' : '自定义16'}</Option>
										<Option value='20' >{language == 'en' ? 'Custom 17' : '自定义17'}</Option>
										<Option value='21' >{language == 'en' ? 'Custom 18' : '自定义18'}</Option>
										<Option value='22' >{language == 'en' ? 'Custom 19' : '自定义19'}</Option>
										<Option value='23' >{language == 'en' ? 'Custom 20' : '自定义20'}</Option>
									</Select>
								)}
							</FormItem>
					}
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Mode name' : '模式名称'}
						hasFeedback
					>
						{getFieldDecorator('modelName', {
							rules: [{
								required: true, message: language == 'en' ? 'The mode name cannot be empty!' : '模式名称不能为空！',
							}],
							initialValue: modelName
						})(
							<Input />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'description' : '模式描述'}
						hasFeedback
					>
						{getFieldDecorator('modelDescription', {
							initialValue: modelDescription,
						})(
							<TextArea autoSize={{ minRows: 15 }} />
						)}
					</FormItem>

				</Form>
			</Modal>
		);
	}
}
const WrappedSceneListModifyModal = Form.create()(SceneListModifyModal);


//新增模式
class ModelAddModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSelectPoints = this.handleSelectPoints.bind(this);
		this.getTypeOptions = this.getTypeOptions.bind(this);
	}
	handleSubmit(e) {
		const { addModel, handleHide } = this.props
		if (this.props.form.getFieldValue('modelName') === "" || this.props.form.getFieldValue('modelName') === undefined) {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Please enter mode name' : '请填写模式名称'
			})
			return
		}
		if (this.props.form.getFieldValue('modelType') === undefined || this.props.form.getFieldValue('modelType') === "") {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Please select mode type' : '请选择模式类型'
			})
			return
		}
		let values = this.props.form.getFieldsValue()//获取表单的值

		if (addModel(values)) {
			handleHide()
		}
		e.preventDefault();
	}
	//处理选择点
	handleSelectPoints(points) {
		let selectedPoints = this.state.selectedPoints
		if (points && points.length) {
			this.setState({
				selectedPoints: [...selectedPoints, ...points]
			});
		}
	}

	getChartItem() {
		let obj = this.state.chartItems
		let config = this.props.config
		let list = Object.keys(obj)
		console.log(list)
		return list.map(item => {
			if (config[item] != "" && config[item] != undefined) {
				return (
					<Option style={{ width: 200, backgroundColor: '#D5D5D5', border: '#D5D5D5', color: '#000' }} value={item}> {obj[item]} </Option>
				)
			}
		})

	}

	getTypeOptions() {
		if (this.props.typeModeList.length != 0) {
			return this.props.typeModeList.map((item, i) => {
				return (
					<Option value={String(i)} >{language == 'en' && item.name_en ?
						item.name_en :
						item.name}</Option>
				)
			}
			)
		}
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 18
			},
		};

		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Mode add' : '新增模式'}
				width={500}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				okText={language == 'en' ? 'Save' : '保存'}
			>
				<Form className={formClass}>
					{
						this.props.typeModeList.length != 0 ?
							<FormItem
								{...formItemLayout}
								label={language == 'en' ? 'Mode type' : '模式类型'}
								hasFeedback
							>
								{getFieldDecorator('modelType', {
									rules: [{
										required: true, message: language == 'en' ? 'The mode type cannot be empty!' : '模式类型不能为空！',
									}],
									initialValue: "",
								})(
									<Select>
										{
											this.getTypeOptions()
										}
									</Select>
								)}
							</FormItem>
							:
							<FormItem
								{...formItemLayout}
								label={language == 'en' ? 'Mode type' : '模式类型'}
								hasFeedback
							>
								{getFieldDecorator('modelType', {
									rules: [{
										required: true, message: language == 'en' ? 'The mode type cannot be empty!' : '模式类型不能为空！',
									}],
									initialValue: "",
								})(
									<Select>
										<Option value='0' >{language == 'en' ? 'Cold Station' : '冷站'}</Option>
										<Option value='1' >{language == 'en' ? 'Hot Station' : '热站'}</Option>
										<Option value='2' >{language == 'en' ? 'BA Terminal' : 'BA末端'}</Option>
										<Option value='3' >{language == 'en' ? 'Lighting' : '照明'}</Option>
										<Option value='4' >{language == 'en' ? 'Custom 1' : '自定义1'}</Option>
										<Option value='5' >{language == 'en' ? 'Custom 2' : '自定义2'}</Option>
										<Option value='6' >{language == 'en' ? 'Custom 3' : '自定义3'}</Option>
										<Option value='7' >{language == 'en' ? 'Custom 4' : '自定义4'}</Option>
										<Option value='8' >{language == 'en' ? 'Custom 5' : '自定义5'}</Option>
										<Option value='9' >{language == 'en' ? 'Custom 6' : '自定义6'}</Option>
										<Option value='10' >{language == 'en' ? 'Custom 7' : '自定义7'}</Option>
										<Option value='11' >{language == 'en' ? 'Custom 8' : '自定义8'}</Option>
										<Option value='12' >{language == 'en' ? 'Custom 9' : '自定义9'}</Option>
										<Option value='13' >{language == 'en' ? 'Custom 10' : '自定义10'}</Option>
										<Option value='14' >{language == 'en' ? 'Custom 11' : '自定义11'}</Option>
										<Option value='15' >{language == 'en' ? 'Custom 12' : '自定义12'}</Option>
										<Option value='16' >{language == 'en' ? 'Custom 13' : '自定义13'}</Option>
										<Option value='17' >{language == 'en' ? 'Custom 14' : '自定义14'}</Option>
										<Option value='18' >{language == 'en' ? 'Custom 15' : '自定义15'}</Option>
										<Option value='19' >{language == 'en' ? 'Custom 16' : '自定义16'}</Option>
										<Option value='20' >{language == 'en' ? 'Custom 17' : '自定义17'}</Option>
										<Option value='21' >{language == 'en' ? 'Custom 18' : '自定义18'}</Option>
										<Option value='22' >{language == 'en' ? 'Custom 19' : '自定义19'}</Option>
										<Option value='23' >{language == 'en' ? 'Custom 20' : '自定义20'}</Option>
									</Select>
								)}
							</FormItem>
					}
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Mode name' : '模式名称'}
						hasFeedback
					>
						{getFieldDecorator('modelName', {
							rules: [{
								required: true, message: language == 'en' ? 'The mode name cannot be empty!' : '模式名称不能为空！',
							}],
							initialValue: ""
						})(
							<Input />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'description' : '模式描述'}
						hasFeedback
					>
						{getFieldDecorator('modelDescription', {
							initialValue: "",
						})(
							<TextArea autoSize={{ minRows: 15 }} />
						)}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedModelAddModal = Form.create()(ModelAddModal);

class ValueList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedIds: 0,
			value: this.props.value || [],
			modal: this.props.modal,
			disabled: true,    //禁止或者启用
			number: 0
		};
		// this.valueTableColumns = [{
		//     title:'模式名称',
		//     key:'name',
		//     dataIndex:'name',
		//     width:200
		//   },{
		//     title: '类型',
		//     key:'type',
		//     dataIndex:'type',
		//     width:100
		//   }

		// ]
		this.handleSelectRow = this.handleSelectRow.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.showModelAddModal = this.showModelAddModal.bind(this);
		this.showSceneListModifyModal = this.showSceneListModifyModal.bind(this);
	}
	static get defaultProps() {
		return {
			modal: {
				type: null,
				props: {}
			}
		}
	}
	// componentWillReceiveProps(nextProps) {
	//   this.setState({
	//     selectedIds: [],
	//     value: nextProps.value || [],
	//   });
	// }
	componentDidMount() {

	}
	handleSelectRow(selectedRowKeys, selectedRows) {
		this.props.saveModelListId(selectedRowKeys)
		//获取选择模式的内容
		this.props.getModelContent(selectedRowKeys[0])

	}
	showModelAddModal() {
		this.showModal('ModelAddModal');
	}
	//弹出要复制的模式框
	showSceneListCopyModal(selectedRowKeys) {
		// let user = this.state.value.find(row => row.userid === userid)
		if (selectedRowKeys.length === 0) {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Please select a mode to copy' : '请先选中要复制的模式'
			})
			return
		}
		this.showModal('SceneListCopyModal', selectedRowKeys[0])
	}
	//弹出修改模式框
	showSceneListModifyModal(selectedRowKeys) {
		// let user = this.state.value.find(row => row.userid === userid)
		if (selectedRowKeys.length === 0) {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Please select a mode to edit' : '请先选中要修改的模式'
			})
			return
		}
		this.showModal('SceneListModifyModal', selectedRowKeys[0])
	}
	showModal(type, props) {
		this.setState({
			modal: {
				type,
				props
			}
		});
	}
	hideModal() {
		this.setState({
			modal: ValueList.defaultProps.modal
		});
	}
	//弹出删除模式框
	handleDeleteModel(selectedRowKeys) {
		if (selectedRowKeys.length === 0) {
			Modal.info({
				title: language == 'en' ? 'Info' : '提示',
				content: language == 'en' ? 'Please select a mode to delete' : '请先选中要删除的模式'
			})
			return
		}
		const { delModel, modalList } = this.props
		let deleteItem = modalList.filter((item) => {
			if (item.id == selectedRowKeys[0]) return item  //匹配选中表单的值
		})
		Modal.confirm({
			title: language == 'en' ? 'Confirm Delete' : '确认删除',
			content: language == 'en' ? `Confirm to delete ${deleteItem[0].name}?` : `确认删除${deleteItem[0].name}？`,
			okText: language == 'en' ? 'Delete' : '删除',
			cancelText: language == 'en' ? 'Cancel' : '取消',
			onOk: () => {
				delModel(selectedRowKeys[0])
			}
		});
	}

	render() {
		const { modeButtonsList, addModel, editModel, copyModel, modalList, modelLoading, delModel,
			useSchedule, selectedId } = this.props
		let newData = []
		if (modalList && modalList.length != 0 && selectedId.length != 0) {
			newData = modalList.filter((item) => {
				if (item.id == selectedId[0]) return item
			})
		}

		let activeList = []
		if (modeButtonsList && modeButtonsList.length > 0) {
			modeButtonsList.map(item => {
				item.modeList.map(mode => {
					if (mode.active == 1) {
						activeList.push(mode.modeId)
					}
				})
			})
		}

		return (
			<Layout className={s['value-list-layout']}>
				<Header className={s['value-list-header']} style={{ position: 'fixed', zIndex: '50', width: '326px', textAlign: 'center' }}>
					<Button
						size="small"
						type='primary'
						className={s['button-right']}
						onClick={this.showModelAddModal}
					><Icon type="plus" />{language == 'en' ? 'add' : '新增'}</Button>
					<Button
						size="small"
						type='danger'
						className={s['button-right']}
						onClick={() => { this.handleDeleteModel(selectedId) }}
					><Icon type="delete" />{language == 'en' ? 'delete' : '删除'}</Button>
					<Button
						size="small"
						className={s['button-right']}
						onClick={() => { this.showSceneListModifyModal(selectedId) }}
					><Icon type="edit" />{language == 'en' ? 'edit' : '修改'}</Button>
					<Button
						size="small"
						className={s['button-right']}
						onClick={() => { this.showSceneListCopyModal(selectedId) }}
						style={{ marginRight: 0 }}
					><Icon type="copy" />{language == 'en' ? 'copy' : '复制'}</Button>
				</Header>
				<Content className={s['table-wrap']} style={{ marginTop: '55px', height: '480px', overflowX: 'hidden' }} >
					<Table
						loading={modelLoading}
						bordered={false}
						pagination={false}
						rowKey="id"
						rowSelection={{
							type: 'radio',
							columnWidth: 40,
							selectedRowKeys: selectedId,
							onChange: this.handleSelectRow,
						}}
						size="small"
						columns={
							[{
								title: language == 'en' ? 'id' : '模式id',
								key: 'id',
								dataIndex: 'id',
								width: 70
							}, {
								title: language == 'en' ? 'mode name' : '模式名称',
								key: 'name',
								dataIndex: 'name',
								width: 180,
								render: (text, record) => {
									if (activeList.length > 0 && activeList.indexOf(record['id']) != -1) {
										return <div style={{ color: 'greenyellow' }}>{text}</div>
									} else {
										return <div>{text}</div>
									}
								}
							}, {
								title: language == 'en' ? 'type' : '类型',
								key: 'type',
								dataIndex: 'type',
								width: 80,
								render: (text) => {
									if (this.props.typeModeList.length != 0) {
										return this.props.typeModeList.map((item, index) => {
											if (text === index) {
												return (
													<span>
														{language == 'en' && item.name_en ?
															item.name_en :
															item.name}
													</span>
												)
											}
										})
									} else {
										switch (text) {
											case 0:
												return <span>{language == 'en' ? 'Cold Station' : '冷站'}</span>
												break;
											case 1:
												return <span>{language == 'en' ? 'Hot Station' : '热站'}</span>
												break;
											case 2:
												return <span>{language == 'en' ? 'BA Terminal' : 'BA末端'}</span>
												break;
											case 3:
												return <span>{language == 'en' ? 'Lighting' : '照明'}</span>
												break;
											case 4:
												return <span>{language == 'en' ? 'Custom 1' : '自定义1'}</span>
												break;
											case 5:
												return <span>{language == 'en' ? 'Custom 2' : '自定义2'}</span>
												break;
											case 6:
												return <span>{language == 'en' ? 'Custom 3' : '自定义3'}</span>
												break;
											case 7:
												return <span>{language == 'en' ? 'Custom 4' : '自定义4'}</span>
												break;
											case 8:
												return <span>{language == 'en' ? 'Custom 5' : '自定义5'}</span>
												break;
											default:
												break;
										}
									}
								}
							}

							]
						}
						dataSource={modalList}
					/>
				</Content>
				{
					this.state.modal.type === 'ModelAddModal' ? (
						<WrappedModelAddModal
							addModel={addModel}
							zIndex={10000}
							handleHide={this.hideModal}
							data={this.state.modal.props}
							typeModeList={this.props.typeModeList}
						/>
					) : null
				}
				{
					this.state.modal.type === 'SceneListModifyModal' ? (
						<WrappedSceneListModifyModal
							editModel={editModel}
							zIndex={10000}
							handleHide={this.hideModal}
							selectedId={selectedId}
							selectedRowKeys={this.state.selectedIds}
							data={this.state.modal.props}
							modalList={modalList}
							newData={newData}
							typeModeList={this.props.typeModeList}
						/>
					) : null
				}
				{
					this.state.modal.type === 'SceneListCopyModal' ? (
						<WrappedSceneListCopyModal
							copyModel={copyModel}
							zIndex={10000}
							handleHide={this.hideModal}
							selectedId={selectedId}
							selectedRowKeys={this.state.selectedIds}
							data={this.state.modal.props}
							modalList={modalList}
							newData={newData}
							typeModeList={this.props.typeModeList}
						/>
					) : null
				}
			</Layout>
		);
	}
}

//添加场景
class AddEvnModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			timeIndex: 'customTime',   //radio选中的value
			selectedEvnId: [], //选中的场景id
			timeValue: "00:00",
			sysTimeNameList: this.props.sysTimeList === '{}' ? Object.keys(JSON.parse(this.props.sysTimeList)) : Object.keys(this.props.sysTimeList),
			data: [],
			evnActionOnce: "1",
			pointName: '',
			pointModalVisible: false
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getRadioTime = this.getRadioTime.bind(this);
		this.getEvnListView = this.getEvnListView.bind(this);
		this.onSelectChange = this.onSelectChange.bind(this);
		this.handelRadioTime = this.handelRadioTime.bind(this);
		this.handelTime = this.handelTime.bind(this);
		this.searchList = this.searchList.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
	}

	handleSubmit(e) {
		if (this.state.data && this.state.data[0] != undefined) {
			const { addModelContent, handleHide, sysTimeList, selectedId, sceneList } = this.props
			const { timeIndex, selectedEvnId, timeValue, sysTimeNameList, data, evnActionOnce, pointName } = this.state
			//let settingValue =  this.props.form.getFieldsValue().settingValue
			if (selectedEvnId.length == 0 || timeIndex === '' || (evnActionOnce != '1' && evnActionOnce != '0')) {
				Modal.info({
					title: language == 'en' ? 'Info' : '提示',
					content: language == 'en' ? 'Please select time, scene and execution count' : '请选择时间、场景和执行次数'
				})
			} else {
				//如果是选择的自定义时间，则取出timepicker里的时间
				if (timeIndex === 'customTime') {
					let timeType = 1  //1自定义
					addModelContent(selectedId, data[selectedEvnId[0]].id, timeType, timeValue, evnActionOnce)
					handleHide()
				} else if (timeIndex === 'd2CustomTime') {
					let timeType = 2  //2隔日
					addModelContent(selectedId, data[selectedEvnId[0]].id, timeType, timeValue, evnActionOnce)
					handleHide()
				} else if (timeIndex === 'pointCustomTime') {
					if (pointName == '') {
						Modal.info({
							title: language == 'en' ? 'Info' : '提示',
							content: language == 'en' ? 'Please enter time point name' : '请填写时间点名'
						})
						return
					}

					let timeType = 0
					addModelContent(selectedId, data[selectedEvnId[0]].id, timeType, pointName, evnActionOnce)
					handleHide()
				} else {
					if (sysTimeNameList.length != 0 && sysTimeList.length != 0) {
						let sysTimeName = sysTimeNameList[timeIndex]
						let sysTimePoint = sysTimeList[sysTimeName].point
						let timeType = 0
						addModelContent(selectedId, data[selectedEvnId[0]].id, timeType, sysTimePoint, evnActionOnce)
						handleHide()
					} else {
						Modal.info({
							title: language == 'en' ? 'Info' : '提示',
							content: language == 'en' ? 'Please configure system time' : '请配置系统时间'
						})
					}
				}
			}
			e.preventDefault();
		} else {
			const { addModelContent, handleHide, sysTimeList, selectedId, sceneList } = this.props
			const { timeIndex, selectedEvnId, timeValue, sysTimeNameList, evnActionOnce, pointName } = this.state
			//let settingValue =  this.props.form.getFieldsValue().settingValue
			if (selectedEvnId.length == 0 || timeIndex === '' || (evnActionOnce != '1' && evnActionOnce != '0')) {
				Modal.info({
					title: language == 'en' ? 'Info' : '提示',
					content: language == 'en' ? 'Please select time, scene and execution count' : '请选择时间、场景和执行次数'
				})
			} else {
				//如果是选择的自定义时间，则取出timepicker里的时间
				if (timeIndex === 'customTime') {
					let timeType = 1  //1自定义
					addModelContent(selectedId, sceneList[selectedEvnId[0]].id, timeType, timeValue, evnActionOnce)
					handleHide()
				} else if (timeIndex === 'd2CustomTime') {
					let timeType = 2  //2隔日
					addModelContent(selectedId, sceneList[selectedEvnId[0]].id, timeType, timeValue, evnActionOnce)
					handleHide()
				} else if (timeIndex === 'pointCustomTime') {
					if (pointName == '') {
						Modal.info({
							title: language == 'en' ? 'Info' : '提示',
							content: language == 'en' ? 'Please enter time point name' : '请填写时间点名'
						})
						return
					}
					let timeType = 0
					addModelContent(selectedId, sceneList[selectedEvnId[0]].id, timeType, pointName, evnActionOnce)
					handleHide()
				} else {
					if (sysTimeNameList.length != 0 && sysTimeList.length != 0) {
						let sysTimeName = sysTimeNameList[timeIndex]
						let sysTimePoint = sysTimeList[sysTimeName].point
						let timeType = 0
						addModelContent(selectedId, sceneList[selectedEvnId[0]].id, timeType, sysTimePoint, evnActionOnce)
						handleHide()
					} else {
						Modal.info({
							title: language == 'en' ? 'Info' : '提示',
							content: language == 'en' ? 'Please configure system time' : '请配置系统时间'
						})
					}
				}
			}
			e.preventDefault();
		}
	}

	getRadioTime(sysTimeList) {
		const radioStyle = {
			display: 'block',
			height: '30px',
			lineHeight: '30px',
		};
		return (
			this.state.sysTimeNameList.map((item, i) => (
				<Radio style={radioStyle} value={i}>{item}</Radio>
			))
		)

	}
	//选择要添加到模式的场景
	onSelectChange(selectedRowKey) {
		this.setState({
			selectedEvnId: selectedRowKey
		})
	}
	//选择单选时间列表
	handelRadioTime(e) {
		this.setState({
			timeIndex: e.target.value
		})
	}

	getEvnListView() {
		if (this.state.data && this.state.data[0] != undefined) {
			return (
				<Table
					pagination={false}
					bordered
					loading={this.state.loading}
					scroll={{ y: 300 }}
					columns={[{
						title: language == 'en' ? 'Scene Name' : '场景名称',
						dataIndex: 'name',
						key: 'name',
						width: 100
					},
					{
						title: 'id',
						dataIndex: 'id',
						key: 'id',
						width: 20
					},
					{
						title: language == 'en' ? 'Scene Description' : '场景释义',
						dataIndex: 'description',
						key: 'description',
						width: 50
					}
					]}
					dataSource={this.state.data}
					size="small"
					rowSelection={{
						type: 'radio',
						columnWidth: 30,
						selectedRowKeys: this.state.selectedEvnId,
						onChange: this.onSelectChange
					}}
				/>
			)
		} else {
			return (
				<Table
					pagination={false}
					bordered
					loading={this.state.loading}
					scroll={{ y: 300 }}
					columns={[{
						title: language == 'en' ? 'Scene Name' : '场景名称',
						dataIndex: 'name',
						key: 'name',
						width: 100
					},
					{
						title: 'id',
						dataIndex: 'id',
						key: 'id',
						width: 20
					},
					{
						title: language == 'en' ? 'Scene Description' : '场景释义',
						dataIndex: 'description',
						key: 'description',
						width: 50
					}
					]}
					dataSource={this.props.sceneList}
					size="small"
					rowSelection={{
						type: 'radio',
						columnWidth: 30,
						selectedRowKeys: this.state.selectedEvnId,
						onChange: this.onSelectChange
					}}
				/>
			)
		}
	}
	//选择时间
	handelTime(time, timeString) {
		this.setState({
			timeValue: timeString
		})
	}

	searchList(e) {
		this.setState({
			loading: true
		})
		setTimeout(e => {
			this.setState({
				loading: false
			})
		}, 1000)
		let data = []
		this.props.sceneList.map((item, index) => {
			if (item.name.indexOf(e) != -1) {
				return data.push(item)
			}
		})
		if (data[0] == undefined) {
			Modal.warning({
				title: language == 'en' ? 'No Related Scenes Found' : '未找到相关场景',
				content: (
					<div>
						<p>{language == 'en' ? 'Please check if the scene you are querying exists' : '请检查您查询的场景是否存在'}</p>
					</div>
				)
			});
		}
		this.setState({
			data: data
		})
	}

	handleSelect(value) {
		this.setState({
			evnActionOnce: value
		})
	}

	//选择的点
	addWatchPoints = (willAddPoints) => {
		this.setState({
			pointName: willAddPoints[0]
		})
	}

	showPointModal = () => {
		this.setState({ pointModalVisible: true })
	}

	hidePointModal = () => {
		this.setState({ pointModalVisible: false })
	}

	changePoint = (e) => {
		this.setState({ pointName: e.target.value })
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { sysTimeList } = this.props
		const radioStyle = {
			display: 'block',
			height: '33px',
			lineHeight: '33px',
		};
		const radioStyle2 = {
			display: 'block',
			height: '33px',
			width: '190px',
			lineHeight: '33px',
		};
		const formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 18
			},
		};
		const pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))

		return (
			<Modal
				className={toggleModalClass}
				wrapClassName={addEventStyle}
				title={language == 'en' ? 'Add Scene' : '添加场景'}
				width={600}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				okText={language == 'en' ? 'Confirm' : '确认'}
			>
				<Form className={formClass}>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Execution Time' : '执行时间'}
						hasFeedback
						style={{ marginBottom: 15 }}
					>
						{getFieldDecorator('evnTime', {
							rules: [{
								required: true, message: language == 'en' ? 'Time cannot be empty!' : '时间不能为空！',
							}],
							initialValue: "customTime"
						})(
							<RadioGroup onChange={this.handelRadioTime}>
								{this.getRadioTime(sysTimeList)}
								<Radio style={radioStyle2} value="customTime">
									{language == 'en' ? 'Same Day:' : '当日：'}<TimePicker defaultValue={moment('00:00', 'HH:mm')} onChange={this.handelTime} format={TimeFormat} />
								</Radio>
								<Radio style={radioStyle2} value="d2CustomTime">
									{language == 'en' ? 'Next Day:' : '隔日：'}<TimePicker defaultValue={moment('00:00', 'HH:mm')} onChange={this.handelTime} format={TimeFormat} />
								</Radio>
								<Radio style={radioStyle} value="pointCustomTime">
									{language == 'en' ? 'PointName:' : '点名：'} <Input
										style={{
											width: 200,
											marginRight: 10,
											marginLeft: '-4px'
										}}
										placeholder={language == 'en' ? 'Please select time variable point' : '请选择时间变量点位'}
										onChange={this.changePoint}
										value={this.state.pointName}
									/>
									<Button onClick={this.showPointModal} style={{ marginRight: 15 }} size='small'>{language == 'en' ? 'Select Point' : '选点'}</Button>
								</Radio>
							</RadioGroup>
						)}
					</FormItem>
					{
						pysiteVersion >= 704 ?
							<FormItem
								{...formItemLayout}
								label={language == 'en' ? 'Execution Count' : '执行次数'}
								hasFeedback
								style={{ marginBottom: 15 }}
							>
								{getFieldDecorator('evnActionOnce', {
									rules: [{
										required: true, message: language == 'en' ? 'Please select execution count' : '请选择执行次数',
									}],
									initialValue: "1"
								})(
									<Select style={{ width: 160 }} onChange={this.handleSelect}>
										<Option value='1' >{language == 'en' ? 'Execute Once' : '执行一次'}</Option>
										<Option value='0' >{language == 'en' ? 'Continuous Execution' : '持续执行'}</Option>
									</Select>
								)}
							</FormItem>
							:
							""
					}
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Select Scene' : '选择场景'}
						hasFeedback
					>
						<div style={{ display: 'inline-block', position: "relative", top: 2 }}>
							<Search
								style={{
									width: 160
								}}
								placeholder={language == 'en' ? 'Scene Name' : '场景名称'}
								onSearch={this.searchList}
							/>
						</div>
						{getFieldDecorator('modelDescription', {
							rules: [{
								required: true, message: language == 'en' ? 'Must select a scene!' : '必须选择场景！',
							}],
							initialValue: "",
						})(
							this.getEvnListView()
						)}
					</FormItem>
				</Form>
				<PointModalView
					hideModal={this.hidePointModal}
					visible={this.state.pointModalVisible}
					onOk={this.addWatchPoints}
				/>
			</Modal>
		);
	}
}
const WrappedAddEvnModal = Form.create()(AddEvnModal);

//修改场景
class EditEvnModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			data: [],
			timeIndex: this.props.record.triggerTimeType === 1 ? "customTime" : this.props.record.triggerTimeType === 2 ? "d2CustomTime" : 'pointCustomTime',   //radio选中的value
			selectedEvnId: [this.props.evnNo], //选中的场景id
			timeValue: this.props.record.triggerTime != undefined && this.props.record.triggerTimeType === 1 ? this.props.record.triggerTime : "00:00",
			timeValueD2: this.props.record.triggerTime != undefined && this.props.record.triggerTimeType === 2 ? this.props.record.triggerTime : "00:00",
			sysTimeNameList: this.props.sysTimeList === '{}' ? Object.keys(JSON.parse(this.props.sysTimeList)) : Object.keys(this.props.sysTimeList),
			evnActionOnce: this.props.record.actionOnce != undefined && this.props.record.actionOnce != null ? String(this.props.record.actionOnce) : null,
			pointName: this.props.record.SystemTimePointName,
			pointModalVisible: false
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getRadioTime = this.getRadioTime.bind(this);
		this.getEvnListView = this.getEvnListView.bind(this);
		this.onSelectChange = this.onSelectChange.bind(this);
		this.handelRadioTime = this.handelRadioTime.bind(this);
		this.handelTime = this.handelTime.bind(this);
		this.handelTimeD2 = this.handelTimeD2.bind(this);
		this.searchList = this.searchList.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
	}

	componentDidMount() {
		if (this.props.record.triggerTimeType === 0) {
			Object.values(this.props.sysTimeList).forEach((name, j) => {
				if (this.props.record.SystemTimePointName === name.point) {
					this.setState({
						timeIndex: j
					})
				}
			})
		}
	}

	handleSubmit(e) {
		if (this.state.data && this.state.data[0] != undefined) {
			const { editModelContent, handleHide, sysTimeList, selectedId, sceneList } = this.props
			const { timeIndex, selectedEvnId, timeValue, timeValueD2, sysTimeNameList, data, evnActionOnce, pointName } = this.state
			let settingValue = this.props.form.getFieldsValue().settingValue
			let editType
			//旧的系统时间的点名
			//当选择自定义时间时，时间点名为空字符串，当选择系统时间时，时间点名为旧的点名
			let sysTimePointName = this.props.record.SystemTimePointName != undefined ? this.props.record.SystemTimePointName : ''
			let oldData = {
				oldTimeType: this.props.record.triggerTimeType,
				modeId: selectedId,
				oldTime: this.props.record.SystemTimePointName != '' ? this.props.record.SystemTimePointName : this.props.record.triggerTime,
				oldEnvId: this.props.record.envId
			}
			let newData = {}
			// if (timeIndex === '') {
			//   //只修改了场景
			//   editType = 1
			//   newData = {
			//     newEnvId: sceneList[selectedEvnId[0]].id,
			//     timeType:this.props.record.triggerTimeType,
			//     timeValue:this.props.record.triggerTime,
			//   }
			//   editModelContent(editType,oldData,newData,sysTimePointName)
			//   handleHide()
			// }else {
			//如果是选择的自定义时间，则取出timepicker里的时间
			if (timeIndex === 'customTime') {
				//修改了时间
				let timeType = 1  //1自定义
				editType = 2  //修改了时间的标记
				newData = {
					timeType: timeType,
					newEnvId: data[selectedEvnId[0]].id,
					timeValue: timeValue
				}
				if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
					editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
				} else {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
					})
				}
				handleHide()
			} else if (timeIndex === 'd2CustomTime') {
				//修改了时间
				let timeType = 2  //2隔日
				editType = 2  //修改了时间的标记
				newData = {
					timeType: timeType,
					newEnvId: data[selectedEvnId[0]].id,
					timeValue: timeValueD2
				}
				if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
					editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
				} else {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
					})
				}
				handleHide()
			} else if (timeIndex === 'pointCustomTime') {
				if (pointName == '') {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'Please enter time point name!' : '请填写时间点名！'
					})
					return
				}
				let timeType = 0
				editType = 2  //修改了时间的标记
				newData = {
					timeType: timeType,
					newEnvId: data[selectedEvnId[0]].id,
					timeValue: pointName
				}
				if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
					editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
				} else {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
					})
				}
				handleHide()
			} else {
				if (sysTimeNameList.length != 0 && sysTimeList.length != 0) {
					let sysTimeName = sysTimeNameList[timeIndex]
					let sysTimePoint = sysTimeList[sysTimeName].point
					let timeType = 0
					editType = 2 //修改了时间的标记
					//当选择系统时间时，时间点名为旧的点名
					newData = {
						timeType: timeType,
						newEnvId: data[selectedEvnId[0]].id,
						timeValue: sysTimePoint
					}
					if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
						editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
					} else {
						Modal.info({
							title: language == 'en' ? 'Info' : '提示',
							content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
						})
					}
					handleHide()
				} else {
					Modal.info({
						title: '提示',
						content: '请配置系统时间'
					})
				}
			}

			e.preventDefault();
		} else {
			const { editModelContent, handleHide, sysTimeList, selectedId, sceneList } = this.props
			const { timeIndex, selectedEvnId, timeValue, timeValueD2, sysTimeNameList, evnActionOnce, pointName } = this.state
			let editType
			//旧的系统时间的点名
			//当选择自定义时间时，时间点名为空字符串，当选择系统时间时，时间点名为旧的点名
			let sysTimePointName = this.props.record.SystemTimePointName != undefined ? this.props.record.SystemTimePointName : ''
			let oldData = {
				oldTimeType: this.props.record.triggerTimeType,
				modeId: selectedId,
				oldTime: this.props.record.SystemTimePointName != '' ? this.props.record.SystemTimePointName : this.props.record.triggerTime,
				oldEnvId: this.props.record.envId
			}
			let newData = {}
			// if (timeIndex === '') {
			//   //只修改了场景
			//   editType = 1
			//   newData = {
			//     newEnvId: sceneList[selectedEvnId[0]].id,
			//     timeType:this.props.record.triggerTimeType,
			//     timeValue:this.props.record.triggerTime,
			//   }
			//   editModelContent(editType,oldData,newData,sysTimePointName)
			//   handleHide()
			// }else {
			//如果是选择的自定义时间，则取出timepicker里的时间
			if (timeIndex === 'customTime') {
				//修改了时间
				let timeType = 1  //1自定义
				editType = 2  //修改了时间的标记
				newData = {
					timeType: timeType,
					newEnvId: sceneList[selectedEvnId[0]].id,
					timeValue: timeValue
				}
				if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
					editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
				} else {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
					})
				}
				handleHide()
			} else if (timeIndex === 'd2CustomTime') {
				//修改了时间
				let timeType = 2  //2隔日
				editType = 2  //修改了时间的标记
				newData = {
					timeType: timeType,
					newEnvId: sceneList[selectedEvnId[0]].id,
					timeValue: timeValueD2
				}
				if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
					editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
				} else {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
					})
				}
				handleHide()
			} else if (timeIndex === 'pointCustomTime') {
				if (pointName == '') {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'Please enter time point name!' : '请填写时间点名！'
					})
					return
				}
				let timeType = 0
				editType = 2
				newData = {
					timeType: timeType,
					newEnvId: sceneList[selectedEvnId[0]].id,
					timeValue: pointName
				}
				if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
					editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
				} else {
					Modal.info({
						title: language == 'en' ? 'Info' : '提示',
						content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
					})
				}
				handleHide()
			} else {
				if (sysTimeNameList.length != 0 && sysTimeList.length != 0) {
					let sysTimeName = sysTimeNameList[timeIndex]
					let sysTimePoint = sysTimeList[sysTimeName].point
					let timeType = 0
					editType = 2 //修改了时间的标记
					//当选择系统时间时，时间点名为旧的点名
					newData = {
						timeType: timeType,
						newEnvId: sceneList[selectedEvnId[0]].id,
						timeValue: sysTimePoint
					}
					if (oldData.oldTimeType != newData.timeType || oldData.oldTime != newData.timeValue || oldData.oldEnvId != newData.newEnvId || this.props.record.actionOnce != evnActionOnce) {
						editModelContent(editType, oldData, newData, sysTimePointName, evnActionOnce == null ? 1 : evnActionOnce)
					} else {
						Modal.info({
							title: language == 'en' ? 'Info' : '提示',
							content: language == 'en' ? 'No changes to scene, no need to save!' : '场景无任何修改，无需保存！'
						})
					}
					handleHide()
				} else {
					Modal.info({
						title: '提示',
						content: '请配置系统时间'
					})
				}
			}

			e.preventDefault();
		}

	}

	getRadioTime(sysTimeList) {
		const radioStyle = {
			display: 'block',
			height: '30px',
			lineHeight: '30px',
		};

		return (
			this.state.sysTimeNameList.map((item, i) => (
				<Radio style={radioStyle} value={i}>{item}</Radio>
			))
		)

	}
	//选择要添加到模式的场景
	onSelectChange(selectedRowKey) {
		this.setState({
			selectedEvnId: selectedRowKey
		})
	}
	//选择单选时间列表
	handelRadioTime(e) {
		this.setState({
			timeIndex: e.target.value
		})
	}

	searchList(e) {
		this.setState({
			loading: true
		})
		setTimeout(e => {
			this.setState({
				loading: false
			})
		}, 1000)
		let data = []
		this.props.sceneList.map((item, index) => {
			if (item.name.indexOf(e) != -1) {
				return data.push(item)
			}
		})
		if (data[0] == undefined) {
			Modal.warning({
				title: language == 'en' ? 'No Related Scenes Found' : '未找到相关场景',
				content: (
					<div>
						<p>{language == 'en' ? 'Please check if the scene you are querying exists' : '请检查您查询的场景是否存在'}</p>
					</div>
				)
			});
		}
		this.setState({
			data: data
		})
	}

	getEvnListView() {
		if (this.state.data && this.state.data[0] != undefined) {
			return (
				<Table
					pagination={false}
					bordered
					loading={this.state.loading}
					scroll={{ y: 300 }}
					columns={[{
						title: language == 'en' ? 'Scene Name' : '场景名称',
						dataIndex: 'name',
						key: 'name',
						width: 100
					},
					{
						title: 'id',
						dataIndex: 'id',
						key: 'id',
						width: 20
					},
					{
						title: language == 'en' ? 'Scene Description' : '场景释义',
						dataIndex: 'description',
						key: 'description',
						width: 50
					}
					]}
					dataSource={this.state.data}
					size="small"
					rowSelection={{
						type: 'radio',
						columnWidth: 30,
						selectedRowKeys: this.state.selectedEvnId,
						onChange: this.onSelectChange
					}}
				/>)
		} else {
			return (
				<Table
					pagination={false}
					bordered
					loading={this.state.loading}
					scroll={{ y: 300 }}
					columns={[{
						title: language == 'en' ? 'Scene Name' : '场景名称',
						dataIndex: 'name',
						key: 'name',
						width: 100
					},
					{
						title: 'id',
						dataIndex: 'id',
						key: 'id',
						width: 20
					},
					{
						title: language == 'en' ? 'Scene Description' : '场景释义',
						dataIndex: 'description',
						key: 'description',
						width: 50
					}
					]}
					dataSource={this.props.sceneList}
					size="small"
					rowSelection={{
						type: 'radio',
						columnWidth: 30,
						selectedRowKeys: this.state.selectedEvnId,
						onChange: this.onSelectChange
					}}
				/>)
		}
	}
	//选择当日时间
	handelTime(time, timeString) {
		this.setState({
			timeValue: timeString
		})
	}

	//选择隔日时间
	handelTimeD2(time, timeString) {
		this.setState({
			timeValueD2: timeString
		})
	}

	handleSelect(value) {
		this.setState({
			evnActionOnce: value
		})
	}

	//选择的点
	addWatchPoints = (willAddPoints) => {
		this.setState({
			pointName: willAddPoints[0]
		})
	}

	showPointModal = () => {
		this.setState({ pointModalVisible: true })
	}

	hidePointModal = () => {
		this.setState({ pointModalVisible: false })
	}

	changePoint = (e) => {
		this.setState({ pointName: e.target.value })
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { sysTimeList } = this.props
		const radioStyle = {
			display: 'block',
			height: '33px',
			lineHeight: '33px',
		};
		const radioStyle2 = {
			display: 'block',
			height: '33px',
			width: '190px',
			lineHeight: '33px',
		};
		const formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 18
			},
		};
		const pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))

		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Edit Scene' : '修改场景'}
				width={600}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				okText={language == 'en' ? 'Confirm' : '确认'}
			>
				<Form className={formClass}>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Execution Time' : '修改执行时间'}
						style={{ marginBottom: 15 }}
					>
						{getFieldDecorator('evnTime', {
							rules: [{
								required: true, message: language == 'en' ? 'Time cannot be empty!' : '时间不能为空！',
							}],
							initialValue: this.state.timeIndex
						})(
							<RadioGroup onChange={this.handelRadioTime}>
								{this.getRadioTime(sysTimeList)}
								<Radio style={radioStyle2} value="customTime">
									{language == 'en' ? 'The Same Day：' : '当日：'}<TimePicker defaultValue={this.props.record.triggerTimeType === 1 ? moment(this.props.record.triggerTime, 'HH:mm') : moment('00:00', 'HH:mm')} onChange={this.handelTime} format={TimeFormat} />
								</Radio>
								<Radio style={radioStyle2} value="d2CustomTime">
									{language == 'en' ? 'Next Day：' : '隔日：'}<TimePicker defaultValue={this.props.record.triggerTimeType === 2 ? moment(this.props.record.triggerTime, 'HH:mm') : moment('00:00', 'HH:mm')} onChange={this.handelTimeD2} format={TimeFormat} />
								</Radio>
								<Radio style={radioStyle} value="pointCustomTime">
									{language == 'en' ? 'Point Name：' : '点名：'} <Input
										style={{
											width: 200,
											marginRight: 10,
											marginLeft: '-4px'
										}}
										placeholder={language == 'en' ? 'Point Name' : '点名'}
										onChange={this.changePoint}
										value={this.state.pointName}
									/>
									<Button onClick={this.showPointModal} style={{ marginRight: 15 }} size='small'>{language == 'en' ? 'Select Point' : '选点'}</Button>
								</Radio>
							</RadioGroup>
						)}
					</FormItem>
					{
						pysiteVersion >= 704 ?
							<FormItem
								{...formItemLayout}
								label={language == 'en' ? 'Execution Count' : '修改执行次数'}
								hasFeedback
								style={{ marginBottom: 15 }}
							>
								{getFieldDecorator('evnActionOnce', {
									rules: [{
										required: true, message: language == 'en' ? 'Please select execution count' : '请选择执行次数',
									}],
									initialValue: this.state.evnActionOnce === null ? '1' : this.state.evnActionOnce,
								})(
									<Select style={{ width: language == 'en' ? 220 : 160 }} onChange={this.handleSelect}>
										<Option value='1' >{language == 'en' ? 'Execute Once' : '执行一次'}</Option>
										<Option value='0' >{language == 'en' ? 'Continuous Execution' : '持续执行'}</Option>
									</Select>
								)}
							</FormItem>
							:
							""
					}
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Edit Scene' : '修改场景'}
						hasFeedback
					>
						<div style={{ display: 'inline-block', position: "relative", top: 2 }}>
							<Search
								style={{
									width: 160
								}}
								placeholder={language == 'en' ? 'Scene Name' : '场景名称'}
								onSearch={this.searchList}
							/>
						</div>
						{getFieldDecorator('modelDescription', {
							initialValue: "",
						})(
							this.getEvnListView()
						)}
					</FormItem>
				</Form>
				<PointModalView
					hideModal={this.hidePointModal}
					visible={this.state.pointModalVisible}
					onOk={this.addWatchPoints}
				/>
			</Modal>
		);
	}
}
const WrappedEditEvnModal = Form.create()(EditEvnModal);

class ModelManageView extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modal: this.props.modal,
			selectedData: [],
			selectedId: this.props.selectedId[0],
			tableData: [],
			loading: false,
			userList: [],
			timeList: [],
			currentValueIndex: 0,
			dataSource: [],
			subData: {},      //数据   
			sysTimeList: [],
			sceneList: [],
			currentModelId: this.props.selectedId[0],
			modelData: [],
			record: null,
			evnNo: null,
			typeModeList: [],
			modalList: [],
			curModeType: null,
			SceneDataSource: [],
			sceneVisible: false
		}
		this.loadTable = this.loadTable.bind(this)
		this.handleOk = this.handleOk.bind(this)
		this.confirm = this.confirm.bind(this);
		this.handleAddEvn = this.handleAddEvn.bind(this);
		this.hideModal = this.hideModal.bind(this)
		this.getExcelData = this.getExcelData.bind(this)
		this.getSceneList = this.getSceneList.bind(this)
		this.showDelEnvModal = this.showDelEnvModal.bind(this)
		this.getSysTimeList = this.getSysTimeList.bind(this);
		this.handleEditEvn = this.handleEditEvn.bind(this);
		this.getTypeModlList = this.getTypeModlList.bind(this);
		this.getModelByType = this.getModelByType.bind(this);
		this.getModelBtns = this.getModelBtns.bind(this);
		this.showScneListModel = this.showScneListModel.bind(this);
	}
	static get defaultProps() {
		return {
			modal: {
				type: null,
				props: {}
			}
		}
	}

	// 检查用户权限 - 场景管理相关
	checkSceneManagePermission() {
		try {
			const userData = JSON.parse(window.localStorage.getItem('userData'));
			// 使用与 LayoutView.js 中场景管理菜单项相同的权限逻辑
			if (user_menu_display.scene_manage_display == 0 || userData.role < user_menu_display.scene_manage_display) {
				return false;
			}
			return true;
		} catch (error) {
			console.error('权限检查失败:', error);
			return false;
		}
	}

	componentDidMount() {
		const { getModelList, nodeData } = this.props
		getModelList()
		this.getSysTimeList()
		this.getSceneList()
		this.getTypeModlList()
	}

	componentWillReceiveProps(nextProps) {
		if (JSON.stringify(nextProps.modelContent) != JSON.stringify(this.props.modelContent)) {
			if (this.props.selectedId[0] === nextProps.selectedId[0]) {
				this.setState({
					modelData: nextProps.modelContent.detail
				})
			}
		}
		if (nextProps.visible != this.props.visible && nextProps.visible) {
			if (nextProps.selectedId[0] != null && nextProps.selectedId[0] != undefined) {
				this.props.getModelContent(nextProps.selectedId[0])
			}
			this.props.getModelList()
		}
		if (nextProps.modelList) {
			this.getModelByType(this.state.curModeType, nextProps.modelList)
		}
	}

	loadTable() {
		const _this = this
		this.setState({
			loading: true
		})

	}
	showScneListModel(record) {
		this.props.SceneLoad(true)
		this.props.getSceneData([])
		this.props.SceneSelectId(record.envId)
		http.post('/env/get', {
			lan: language,
			id: record.envId
		}).then(
			data => {
				if (data.err === 0) {
					this.props.getSceneData(data.data.detail)
					this.props.SceneLoad(false)
					// this.setState({
					//   SceneDataSource: data.data.detail
					// })
				} else {
					Modal.error({
						title: language == 'en' ? 'Data retrieval failed, page opening failed' : '数据获取失败,页面打开失败',
						content: data.msg
					})
					this.props.SceneLoad(false)
				}
			}
		).catch(
			error => {
				Modal.error({
					title: language == 'en' ? 'Error' : '错误提示',
					content: error.msg
				})
				this.props.SceneLoad(false)
				console.log(error)
			}
		)
		this.showModal('SceneModal')
	}
	handleAddEvn() {
		if (this.props.selectedId.length != 0) {
			this.showModal('AddEvnModal');
			this.getSceneList()
		} else {
			Modal.info({
				title: language == 'en' ? 'Info' : '信息提示',
				content: language == 'en' ? 'Please select a mode' : '请选择模式'
			})
		}
	}

	handleEditEvn(record) {
		this.showModal('EditEvnModal');
		this.getSceneList()
		let evnNo
		this.state.sceneList.forEach((item, i) => {
			if (item.id === record.envId) {
				evnNo = i
			}
		})
		this.setState({
			record: record,
			evnNo: evnNo
		})

	}

	showModal(type, props) {
		this.setState({
			modal: {
				type,
				props
			}
		});
	}
	hideModal() {
		this.setState({
			modal: ModelManageView.defaultProps.modal,
			record: null,
			evnNo: null
		});
	}
	handleOk() {
		this.loadTable()
	}
	handleCellClick = (line, column, e) => {
		//const {config,showModal,pointvalue,idCom} = this.props
		console.info(line, column, e)
		// e.currentTarget.style.backgroundColor = "#013977" 
		// document.getElementsByClassName("tb").onkeydown = function(event) {
		//  var  e = even;
		//  if (e && e.keyCode == 13) {
		//    console.log("按了 Enter")
		//  }
		// }
		// config.readonly true or false?
		// if(config.readonly) return false
		// let curvalue = pointvalue[record.key][Number(column)];
		// showModal( modalTypes.TABLE_CELL_MODAL , {
		//     currentValue : curvalue,
		//     idCom : idCom,
		//     firstKey : record.key,
		//     secondKey : column
		// })
	}

	confirm() {  //确认
		let dataSource = this.state.dataSource
		let pointValue = []
		let pointName = []
		dataSource.map(rowObj => {
			pointValue.push(rowObj.pointValue)
			pointName.push(rowObj.pointName)
		})
		this.props.savePoint(pointValue, pointName, this.props.selectedId[0])
	}

	getExcelData(response) {
		this.setState({
			dataSource: response.data
		})
	}

	//获取场景列表
	getSceneList() {
		return http.get(
			language == 'en' ? '/env/getAll?lan=en' : '/env/getAll'
		).
			then(
				data => {
					if (!data.err) {
						this.setState(
							{
								sceneList: data.data
							}
						)
					} else {
						Modal.error({
							title: language == 'en' ? 'Error' : '错误提示',
							content: language == 'en' ? 'Failed to get scene list' : '获取场景列表失败'
						})
					}
				}
			).catch(
				(error) => {
					Modal.error({
						title: language == 'en' ? 'Error' : '错误提示',
						content: error.msg
					})
					console.log(error)
				}
			)
	}
	//获取系统时间
	getSysTimeList() {
		http.post('/project/getConfig', {
			key: "system_time_define"
		}).then(
			data => {
				if (data.status) {
					this.setState({
						sysTimeList: data.data
					})
				}
				else {
					Modal.error({
						title: language == 'en' ? 'Error' : '错误提示',
						content: language == 'en' ? `system_time_define configuration error in project config: ${data.msg}` : `项目配置中system_time_define配置有误：${data.msg}`
					})
				}
			}
		).catch(
			error => {
				// Modal.error({
				//   title: '错误提示',
				//   content: `项目配置中system_time_define配置有误：${error.msg}`
				// })
				// console.log(error)
			}
		)
	}

	//获取模式类型列表
	getTypeModlList() {
		http.post('/project/getConfig', {
			key: "mode_group_define"
		}).then(
			data => {
				if (data.status) {
					if (data.data.groupList != undefined) {
						this.setState({
							typeModeList: data.data.groupList
						})
					}
				}
				else {
					Modal.error({
						title: language == 'en' ? 'Error' : '错误提示',
						content: language == 'en' ? "Mode custom type configuration error: " + data.msg : "模式自定义类型配置有误：" + data.msg
					})
				}
			}
		).catch(
			error => {
				// Modal.error({
				//   title: '错误提示',
				//   content: `模式自定义类型配置有误：${error.msg}`
				// })
				console.log(error)
			}
		)
	}

	showDelEnvModal(index) {
		Modal.confirm({
			title: language == 'en' ? 'Confirm Delete' : '确认删除',
			content: language == 'en' ? `Confirm to delete ${index.envName}?` : `确认删除${index.envName}？`,
			okText: language == 'en' ? 'Delete' : '删除',
			cancelText: language == 'en' ? 'Cancel' : '取消',
			onOk: () => {
				this.props.delModelContent(this.props.selectedId[0], index)
			}
		});
	}
	getModelByType(type, nextData) {
		this.setState({ curModeType: type })
		var btns = document.getElementsByClassName('bindBtnType');
		for (let i = 0; i < btns.length; i++) {
			for (let i = 0; i < btns.length; i++) {
				if (localStorage.getItem('serverOmd') == "best") {
					btns[i].style.backgroundColor = '#E1E1E1';
				} else if (localStorage.getItem('serverOmd') == "persagy") {
					btns[i].style.backgroundColor = '#fff';
				} else {
					btns[i].style.backgroundColor = '';
				}
			}
			if (type === null) {
				btns[i].style.backgroundColor = '#2ea2f8';
				break;
			} else if (type + 1 === i) {
				btns[i].style.backgroundColor = '#2ea2f8';
				break;
			}
		}
		if (type === null) {
			if (nextData != undefined) {
				this.setState({ modalList: nextData })
			} else {
				this.setState({ modalList: this.props.modelList })
			}
		} else {
			let tempList = []
			if (nextData != undefined) {
				nextData.map((item, index) => {
					if (type === item.type) {
						tempList.push(item)
					}
				})
			} else {
				this.props.modelList.map((item, index) => {
					if (type === item.type) {
						tempList.push(item)
					}
				})
			}
			this.setState({ modalList: tempList })
		}
	}


	//模式按钮
	getModelBtns() {
		if (this.state.typeModeList.length != 0) {
			return this.state.typeModeList.map((item, index) => {
				let cirColor;
				if (item.color) {
					cirColor = item.color
				} else {
					for (let i = 0; i < defaultColorArr.length; i++) {
						if (index === i) {
							cirColor = defaultColorArr[i]
						}
					}
				}
				return (
					<Button className="bindBtnType" onClick={() => { this.getModelByType(index) }} style={btnStyle}><span style={{ color: cirColor, marginRight: 5, fontSize: 16, verticalAlign: 'center' }}>●</span>{language == 'en' && item.name_en ?
						item.name_en :
						item.name}</Button>
				)
			})
		} else {
			return (
				<span>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(0) }} style={btnStyle}>{language == 'en' ? 'Cold Station' : '冷站'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(1) }} style={btnStyle}>{language == 'en' ? 'Hot Station' : '热站'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(2) }} style={btnStyle}>{language == 'en' ? 'BA Terminal' : 'BA末端'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(3) }} style={btnStyle}>{language == 'en' ? 'Lighting' : '照明'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(4) }} style={btnStyle}>{language == 'en' ? 'Custom 1' : '自定义1'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(5) }} style={btnStyle}>{language == 'en' ? 'Custom 2' : '自定义2'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(6) }} style={btnStyle}>{language == 'en' ? 'Custom 3' : '自定义3'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(7) }} style={btnStyle}>{language == 'en' ? 'Custom 4' : '自定义4'}</Button>
					<Button className="bindBtnType" onClick={() => { this.getModelByType(8) }} style={btnStyle}>{language == 'en' ? 'Custom 5' : '自定义5'}</Button>
				</span>
			)
		}
	}

	showRunEnv = (text, id) => {
		Modal.confirm({
			title: language == 'en' ? 'Confirm Info' : '确认信息',
			content: language == 'en' ? `Confirm to run ${text} scene?` : `确定运行${text}场景吗？`,
			okText: language == 'en' ? 'Confirm' : '确定',
			cancelText: language == 'en' ? 'Cancel' : '取消',
			onOk: () => {
				this.getScenePointList(id)
			}
		})
	}

	getScenePointList = (id) => {
		http.post('/env/get', {
			lan: language,
			id: id
		}).then(
			res => {
				if (res.err === 0) {
					if (res.data.detail.length === 0) {
						Modal.info({
							title: language == 'en' ? 'Info' : '信息提示',
							content: language == 'en' ? "This scene content is empty" : "该场景内容为空"
						})
					} else {
						this.runScene(res.data.detail, res.data.name)
					}
				} else {
					Modal.error({
						title: language == 'en' ? 'Error' : '错误提示',
						content: res.msg
					})
				}
			}
		).catch(
			error => {
				Modal.error({
					title: language == 'en' ? 'Error' : '错误提示',
					content: error.msg
				})
			}
		)
	}

	runScene = (data, name) => {
		let pointValue = []
		let pointName = []
		data.map(item => {
			pointValue.push(item.pointValue)
			pointName.push(item.pointName)
		})
		http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
			token: appConfig.token,
			pointList: pointName,
			valueList: pointValue,
			source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
		}).then(
			res => {
				if (!res.err) {
					Modal.success({
						title: language == 'en' ? 'Scene Run Successfully' : '场景运行成功',
						content: language == 'en' ? `${name} scene run successfully!` : `${name}场景运行成功！`
					})
					//增加操作记录
					http.post('/operationRecord/add', {
						"userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
						"content": `运行${name}场景`,
						"address": ''
					}).then(data => { })
				} else {
					Modal.info({
						title: language == 'en' ? 'Backend Response' : '后台返回信息',
						content: res.msg
					})
				}
			}
		).catch(err => {
			Modal.info({
				title: language == 'en' ? 'API Request Failed' : '接口请求失败',
			})
		})
	}

	showSeceneModal = () => {
		this.setState({
			sceneVisible: true
		})
	}

	closeSeceneModal = () => {
		this.setState({
			sceneVisible: false
		})
	}

	render() {
		const { visible, onCancel, selectedData, modelLoading, modelContentLoading, addModel, editModel, copyModel, hideModal, getModelList,
			searchList, delModel, sceneListSelectedId, addModelContent, getModelContent, editModelContent,
			savePoint, saveModelListId, selectedId, SceneDataSource, getSceneData, sceneListSelectedName, SceneId, SceneLoading,
			saveSceneListId, changeSceneSavePoint, preSavePoint, getSceneList, sceneLoading, delScene, sceneList, editScene,
			addScene, handleSimulation, loadDate, showPointModal, modeButtonsList } = this.props
		return (
			<div>
				{
					visible ?
						<Modal
							visible={visible}
							onCancel={onCancel}
							footer={null}
							maskClosable={false}
							width={1200}
							title={
								<div style={{ marginBottom: -5 }}>
									<span style={{ fontSize: '18px', marginRight: 30, verticalAlign: 'middle' }} >{language == 'en' ? 'Mode management' : '模式管理'}</span>
									<div style={headerBtnListStyle}>
										<Button id='btnAllType' className="bindBtnType" onClick={() => { this.getModelByType(null) }} style={{
											fontSize: '14px',
											lineHeight: '27px',
											height: '28px',
											marginRight: '2px',
											borderRadius: '2px',
											padding: '0px 10px',
											verticalAlign: 'top'
										}}>{language == 'en' ? 'All Types' : '全部类型'}</Button>
										{this.getModelBtns()}
									</div>
								</div>
							}
							wrapClassName={str}
						>
							<div className={s['schedule-wrap']}>
								<Layout style={{ height: "620px", backgroundColor: "#1B2431" }}>
									<Sider width={330} style={{ marginRight: '10px' }}>
										<ValueList
											value={this.state.userList}
											modelLoading={modelLoading}
											addModel={addModel}
											editModel={editModel}
											copyModel={copyModel}
											delModel={delModel}
											modalList={this.state.modalList}
											saveModelListId={saveModelListId}
											selectedId={selectedId}
											getModelContent={getModelContent}
											typeModeList={this.state.typeModeList}
											getModelByType={this.getModelByType}
											curModeType={this.state.curModeType}
											modeButtonsList={modeButtonsList}
										/>
									</Sider>
									<Content className={s['layout-content']}>
										<div style={{ height: 50 }}>
											<div className={s['scene-containt-left']}>{language == 'en' ? 'Definition of mode content' : '模式内容定义'}</div>
											<div className={s['scene-containt-right']}>
												{this.checkSceneManagePermission() && <Button className={s['button-common']} onClick={this.showSeceneModal}>{language == 'en' ? 'Scene management' : '场景管理'}</Button>}
												<Button className={s['button-common']} onClick={this.handleAddEvn}>{language == 'en' ? 'Add Scene' : '添加场景'}</Button>
											</div>
										</div>
										<Table
											pagination={false}
											bordered
											loading={modelContentLoading}
											scroll={{ y: 526 }}
											columns={[{
												title: language == 'en' ? 'time' : '时间',
												dataIndex: 'triggerTime',
												key: 'triggerTime',
												width: 130,
												render: (text, record, index) => {
													if (record.triggerTimeType == 2) {
														if (record.actionOnce == 0) {
															return (<div><span >{language == 'en' ? 'Next Day' : '隔日'}  {record.triggerTime}</span><Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Continuous Execution' : '持续执行中'}></Tag></div>)
														} else {
															return (<div><span >{language == 'en' ? 'Next Day' : '隔日'}  {record.triggerTime}</span><Tag style={tagStyle} color="#87d068" title={language == 'en' ? 'Execute Once' : '执行一次'}></Tag></div>)
														}

													} else if (record.triggerTimeType == 0) {
														if (record.actionOnce == 0) {
															return (
																<div>
																	<Popover content={<div style={{ userSelect: 'text' }}>{record.SystemTimePointName}</div>} title={language == 'en' ? 'Time Point Name' : '时间点名'} trigger="click">
																		<span style={timeStyle}>{record.triggerTime}</span>
																	</Popover>
																	<Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Continuous Execution' : '持续执行中'}></Tag>
																</div>
															)
														} else {
															var nowTime = moment().add(1, 'minutes')
															var time = moment(record.triggerTime, 'HH:mm')
															if (moment(nowTime).isBefore(time)) {
																return (
																	<div>
																		<Popover content={<div style={{ userSelect: 'text' }}>{record.SystemTimePointName}</div>} title={language == 'en' ? 'Time Point Name' : '时间点名'} trigger="click">
																			<span style={timeStyle}>{record.triggerTime}</span>
																		</Popover>
																		<Tag style={tagStyle} color="#87d068" title={language == 'en' ? 'Execute Once' : '执行一次'}></Tag>
																	</div>
																)
															} else {
																return (
																	<div>
																		<Popover content={<div style={{ userSelect: 'text' }}>{record.SystemTimePointName}</div>} title={language == 'en' ? 'Time Point Name' : '时间点名'} trigger="click">
																			<span style={timeStyle}>{record.triggerTime}</span>
																		</Popover>
																		<Tag style={tagStyle} color="gray" title={language == 'en' ? 'Execute Once' : '执行一次'}></Tag>
																	</div>
																)
															}

														}
													} else {
														if (record.actionOnce == 0) {
															return (<div><span >{record.triggerTime}</span><Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Continuous Execution' : '持续执行中'}></Tag></div>)
														} else {
															var nowTime = moment().add(1, 'minutes')
															var time = moment(record.triggerTime, 'HH:mm')
															if (moment(nowTime).isBefore(time)) {
																return (<div><span>{record.triggerTime}</span><Tag style={tagStyle} color="#87d068" title={language == 'en' ? 'Execute Once' : '执行一次'}></Tag></div>)
															} else {
																return (<div><span >{record.triggerTime}</span><Tag style={tagStyle} color="gray" title={language == 'en' ? 'Execute Once' : '执行一次'}></Tag></div>)
															}

														}
													}
												}
											},
											{
												title: language == 'en' ? 'scene id' : '场景id',
												dataIndex: 'envId',
												key: 'envId',
												width: 75,
												align: 'center'
											},
											{
												title: language == 'en' ? 'scene name' : '场景名称',
												dataIndex: 'envName',
												key: 'envName',
												width: 290,
												render: (text, record) => {
													return <div style={{ background: 'rgba(255,255,255,0.1)', paddingLeft: 5, cursor: 'pointer' }} onClick={() => this.showRunEnv(text, record['envId'])}>{text}</div>
												}
											},
											{
												title: language == 'en' ? 'operate' : '操作',
												dataIndex: 'mark',
												key: 'mark',
											render: (text, record) => {
												return (<div>
													<Button size='small' style={{ marginRight: '6px', padding: '0 5px', borderRadius: '4px' }} onClick={() => { this.handleEditEvn(record) }}>{language == 'en' ? 'Edit' : '修改'}</Button>
													<Button size='small' style={{ marginRight: '6px', padding: '0 5px', borderRadius: '4px' }} onClick={() => { this.showDelEnvModal(record) }}>{language == 'en' ? 'Delete' : '删除'}</Button>
													{this.checkSceneManagePermission() && <Button size='small' style={{ marginRight: '6px', padding: '0 5px', borderRadius: '4px' }} onClick={() => { this.showScneListModel(record) }}>{language == 'en' ? 'Edit Scene Value' : '修改场景点值'}</Button>}
													<Button size='small' style={{ padding: '0 5px', borderRadius: '4px' }} onClick={() => this.showRunEnv(record['envName'], record['envId'])}>{language == 'en' ? 'Run' : '运行'}</Button>
												</div>
												)
											}
											}
											]}
											size='small'
											locale={{
												emptyText: <Empty description={language == 'en' ? 'No scene data available at present' : "暂无场景数据"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
											}}
											dataSource={this.state.modelData}
										/>
										{
											this.state.modal.type === 'AddEvnModal' ? (
												<WrappedAddEvnModal
													zIndex={10000}
													handleHide={this.hideModal}
													data={this.state.modal.props}
													sysTimeList={this.state.sysTimeList}
													sceneList={this.state.sceneList}
													addModelContent={addModelContent}
													selectedId={selectedId[0]}
												/>
											) : null
										}
										{
											this.state.modal.type === 'EditEvnModal' ? (
												<WrappedEditEvnModal
													zIndex={10000}
													handleHide={this.hideModal}
													data={this.state.modal.props}
													sysTimeList={this.state.sysTimeList}
													sceneList={this.state.sceneList}
													editModelContent={editModelContent}
													selectedId={selectedId[0]}
													record={this.state.record}
													evnNo={this.state.evnNo}
													getModelList={getModelList}
												/>
											) : null
										}
										{
											this.state.modal.type === 'SceneModal' ? (
												<ScenePointList
													handleHide={this.hideModal}
													SceneDataSource={SceneDataSource}
													getSceneData={getSceneData}
													SceneId={SceneId}
													SceneLoading={SceneLoading}
												/>
											) : null

										}
										<SceneView
											visible={this.state.sceneVisible}
											onCancel={this.closeSeceneModal}
											selectedData={selectedData}
											showPointModal={showPointModal}
											addScene={addScene}
											editScene={editScene}
											sceneList={sceneList}
											delScene={delScene}
											sceneLoading={sceneLoading}
											getSceneList={getSceneList}
											handleSimulation={handleSimulation}
											loadDate={loadDate}
											savePoint={savePoint}
											preSavePoint={preSavePoint}
											changeSceneSavePoint={changeSceneSavePoint}
											hideModal={hideModal}
											saveSceneListId={saveSceneListId}
											selectedId={sceneListSelectedId}
											selectedName={sceneListSelectedName}
											searchList={searchList}
										/>
									</Content>
								</Layout>
							</div>
						</Modal>
						:
						""
				}
			</div>

		)
	}
}

export default ModelManageView