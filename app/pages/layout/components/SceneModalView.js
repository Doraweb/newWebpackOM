/**
 * 场景管理模态框
 */
import React from 'react';
import { Modal, Table, DatePicker, Radio, TimePicker, Icon, InputNumber, Button, Input, Row, Col, Upload, Layout, Form, Checkbox, Tag, Spin } from 'antd'
const { RangePicker } = DatePicker
import s from './SceneModalView.css'
import moment from 'moment';
import PointModalView from '../containers/PointModalContainer'
import appConfig from '../../../common/appConfig'

import http from '../../../common/http';
import { downloadUrl } from '../../../common/utils'

const { Sider, Content, Header } = Layout;
const FormItem = Form.Item
const Search = Input.Search
const language = appConfig.language

let str, InputStyle, btnStyle, SliderRightStyle, SliderLeftStyle, BtnBorderStyle, formClass, toggleModalClass, btnWrap, pointListLabel;
if (localStorage.getItem('serverOmd') == "best") {
	str = 'warning-config-best';
	InputStyle = {
		width: '50px',
		border: '0px',
		marginRight: '10px',
		outline: 'none',
		cursor: 'auto',
		backgroundColor: "#E1E1E1",
		boxShadow: 'none',
		overflow: 'visible'
	};
	SliderRightStyle = {
		marginRight: '10px'
	};
	SliderLeftStyle = {
		marginLeft: '10px'
	};
	BtnBorderStyle = {
		border: '0',
		padding: 5,
		marginRight: 10,
		fontSize: 10
	}

} else if (localStorage.getItem('serverOmd') == "persagy") {
	str = 'PersagyCalendarModal';
	InputStyle = {
		width: '50px',
		border: '0px',
		marginRight: '10px',
		outline: 'none',
		cursor: 'auto',
		backgroundColor: "rgba(248,249,250,1)",
		boxShadow: 'none',
		overflow: 'visible',
		fontSize: '14px',
		fontFamily: 'MicrosoftYaHei',
		color: 'rgba(31,36,41,1)'
	};
	btnStyle = {
		marginRight: '12px',
		marginBottom: '5px'
	}
	SliderRightStyle = {
		marginRight: 0
	};
	SliderLeftStyle = {
		marginLeft: 0
	};
	BtnBorderStyle = {
		border: '1px solid rgba(195,198,203,1)',
		padding: 5,
		marginRight: 10,
		fontSize: 10
	}
	toggleModalClass = 'persagy-modal'
	formClass = 'persagy-dashBoardLine-form'
	btnWrap = 'persagy-btn-wrap'
	pointListLabel = {
		color: 'rgba(31,35,41,1)'
	}
} else {
	str = '';
	InputStyle = {
		width: '50px',
		border: '0px',
		marginRight: '10px',
		outline: 'none',
		cursor: 'auto',
		backgroundColor: "#001529",
		boxShadow: 'none',
		overflow: 'visible'
	};
	SliderRightStyle = {
		marginRight: '10px'
	};
	SliderLeftStyle = {
		marginLeft: '10px'
	};
	BtnBorderStyle = {
		border: '0',
		padding: 5,
		marginRight: 10,
		fontSize: 10
	}
	btnWrap = 'btn-wrap'
	pointListLabel = {
		top: '-20px',
		left: '20px',
		position: 'absolute',
		color: '#fff'
	}
}
//修改场景列表
class SceneListModifyModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			checked: 0,                //是否checked

		};
		this.handleSubmit = this.handleSubmit.bind(this);

	}

	UNSAFE_componentWillMount() {
		this.setState({
			checked: this.props.newData[0].isloop
		})
	}




	handleSubmit(e) {
		const { editScene, handleHide, selectedId } = this.props
		if (this.props.form.getFieldValue('sceneName') === "" || this.props.form.getFieldValue('sceneName') === undefined) {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Failed to modify the scene' : '修改场景失败'
			})
			return
		}
		let values = this.props.form.getFieldsValue()//获取表单的值

		if (editScene(selectedId[0], values)) {
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
				span: 14
			},
		};
		const { sceneList, selectedId } = this.props
		let newData = []
		if (sceneList && sceneList.length != 0 && selectedId.length != 0) {
			newData = sceneList.filter((item) => {
				if (item.id == selectedId[0]) return item
			})
		}
		let sceneName = ''
		let sceneDes = ''
		let sceneTag = ''
		if (newData.length > 0) {
			sceneName = newData[0].name
			sceneDes = newData[0].description
			sceneTag = newData[0].tags
		}
		let _this = this
		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Scene edit' : '修改场景'}
				width={400}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
			>
				<Form className={formClass}>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Scene name' : '场景名称'}
						hasFeedback
					>
						{getFieldDecorator('sceneName', {
							rules: [{
								required: true, message: language == 'en' ? 'The scene name cannot be empty' : '场景名称不能为空！',
							}],
							initialValue: sceneName
						})(
							<Input />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Scene description' : '场景描述'}
						hasFeedback
					>
						{getFieldDecorator('sceneDescription', {
							initialValue: sceneDes,
						})(
							<Input />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Scene label' : '场景标签'}
						hasFeedback
					>
						{getFieldDecorator('sceneTag', {
							initialValue: sceneTag,
						})(
							<Input />
						)}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedSceneListModifyModal = Form.create()(SceneListModifyModal);


//新增日程
class SceneAddModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSelectPoints = this.handleSelectPoints.bind(this);
	}
	handleSubmit(e) {
		const { addScene, handleHide } = this.props
		if (this.props.form.getFieldValue('sceneName') === "" || this.props.form.getFieldValue('sceneName') === undefined) {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Failed to create a new scene' : '新建场景失败'
			})
			return
		}
		let values = this.props.form.getFieldsValue()//获取表单的值

		if (addScene(values)) {
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
	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 8
			},
			wrapperCol: {
				span: 14
			},
		};

		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Add a new scene' : '新增场景'}
				width={400}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
			>
				<Form className={formClass}>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Scene name' : '场景名称'}
						hasFeedback
					>
						{getFieldDecorator('sceneName', {
							rules: [{
								required: true, message: language == 'en' ? 'The scene name cannot be blank!' : '场景名称不能为空！',
							}],
							initialValue: ""
						})(
							<Input />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Scene description' : '场景描述'}
						hasFeedback
					>
						{getFieldDecorator('sceneDescription', {
							initialValue: "",
						})(
							<Input />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={language == 'en' ? 'Scene label' : '场景标签'}
						hasFeedback
					>
						{getFieldDecorator('sceneTag', {
							initialValue: "",
						})(
							<Input />
						)}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedSceneAddModal = Form.create()(SceneAddModal);

class ValueList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedIds: 0,
			value: this.props.value || [],
			modal: this.props.modal,
			disabled: true,    //禁止或者启用
			number: 0,
			envName: ''
		};
		this.valueTableColumns = [{
			title: 'ID',
			key: 'id',
			dataIndex: 'id',
			width: 50,
			align: 'center'
		},
		{
			title: language == 'en' ? 'Scene name' : '场景名称',
			key: 'name',
			dataIndex: 'name',
			width: 200
		},
		{
			title: language == 'en' ? 'desc' : '描述',
			key: 'description',
			dataIndex: 'description',
			width: 80
		}
		]
		this.handleSelectRow = this.handleSelectRow.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.showSceneAddModal = this.showSceneAddModal.bind(this);
		this.showSceneListModifyModal = this.showSceneListModifyModal.bind(this);
		this.handleSearchList = this.handleSearchList.bind(this);
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
		const { getPointList } = this.props
		this.props.saveSceneListId(selectedRowKeys, selectedRows[0].name)
		//getPointList(selectedRowKeys[0])

	}
	showSceneAddModal() {
		this.showModal('SceneAddModal');
	}
	showSceneListModifyModal(selectedRowKeys) {
		// let user = this.state.value.find(row => row.userid === userid)
		if (selectedRowKeys.length === 0) {
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
			modal: ValueList.defaultProps.modal,
			changeValueModalVisible: false
		});
	}
	//删除
	handleDeleteScene(selectedRowKeys) {
		if (selectedRowKeys.length === 0) {
			return
		}
		const { delScene, sceneList } = this.props
		let deleteItem = sceneList.filter((item) => {
			if (item.id == selectedRowKeys[0]) return item  //匹配选中表单的值
		})
		Modal.confirm({
			title: language == 'en' ? 'Alert' : '确认删除',
			content: `${language == 'en' ? 'Are you sure you want to delete' : '确认删除'}${deleteItem[0].name}？`,
			onOk: () => {
				delScene(selectedRowKeys[0])
			}
		});
	}

	//查询list
	handleSearchList(value) {
		//let keyWordList = value.split(' ')
		//console.info(keyWordList)
		this.props.searchList(value)
	}

	copyOneEnv = (selectedId, sceneList) => {
		if (!selectedId[0]) {
			Modal.info({
				title: language == 'en' ? 'Prompt' : '提示',
				content: language == 'en' ? 'Please select a scene to copy' : '请选择一个需要复制的场景'
			})
			return
		}
		let name = ''
		sceneList.map(item => {
			if (item.id == selectedId[0]) {
				name = item.name + '_Copy'
			}
		})
		this.setState({
			envName: name
		})
		Modal.confirm({
			title: language == 'en' ? 'Scene copy' : '复制场景',
			icon: 'copy',
			content: (
				<div style={{ marginTop: 25, marginLeft: -35 }}>
					<Input defaultValue={name} placeholder={language == 'en' ? 'Please enter the scene name' : '请填写场景名称'} onChange={(e) => this.setState({ envName: e.target.value })} />
				</div>
			),
			onOk: () => {
				if (this.state.envName) {
					http.post('/env/copyOneEnv', {
						lan: language,
						fromEnvId: selectedId[0],
						name: this.state.envName,
						creator: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
							JSON.parse(localStorage.getItem('userInfo')).name : '',
						onduty: appConfig.onduty,
						cloudUserId: appConfig.cloudUser.cloudUserId,
						projectId: appConfig.projectId
					}).then(res => {
						if (res.err == 0) {
							Modal.success({
								title: language == 'en' ? 'Reminder' : '提示',
								content: res.msg
							})
							this.props.getSceneList()
						} else {
							Modal.error({
								title: language == 'en' ? 'Reminder' : '提示',
								content: res.msg
							})
						}
					}).catch(err => {
						Modal.error({
							title: language == 'en' ? 'Reminder' : '提示',
							content: err.message
						})
					})
				} else {
					Modal.info({
						title: language == 'en' ? 'Reminder' : '提示',
						content: '请填写新场景的名称'
					})
				}
			}
		})
	}

	render() {
		const { saveSceneListId, addScene, editScene, sceneList, sceneLoading, delScene,
			useSchedule, selectedId } = this.props
		let newData = []
		if (sceneList && sceneList.length != 0 && selectedId.length != 0) {
			newData = sceneList.filter((item) => {
				if (item.id == selectedId[0]) return item
			})
		}

		return (
			<Layout className={s['value-list-layout']} style={{ overflowX: 'hidden' }}>
				<Header className={s['value-list-header']} style={{ position: 'fixed', zIndex: '50', width: '330px' }}>
					<Button
						size="small"
						className={s['button-right']}
						onClick={this.showSceneAddModal}
						style={btnStyle}
						type='primary'
					><Icon type="plus" />{language == 'en' ? 'add' : '新增'}</Button>
					<Button
						size="small"
						className={s['button-right']}
						onClick={() => { this.handleDeleteScene(selectedId) }}
						style={btnStyle}
						type='danger'
					><Icon type="delete" />{language == 'en' ? 'delete' : '删除'}</Button>
					<Button
						size="small"
						className={s['button-right']}
						onClick={() => { this.showSceneListModifyModal(selectedId) }}
						style={btnStyle}
					><Icon type="edit" />{language == 'en' ? 'edit' : '修改'}</Button>
					<Button
						size="small"
						className={s['button-right']}
						onClick={() => { this.copyOneEnv(selectedId, sceneList) }}
						style={btnStyle}
					><Icon type="copy" />{language == 'en' ? 'copy' : '复制'}</Button>
					{/*
          <Button
            size="small"
            className={s['button-right']}            
            onClick={()=> {this.props.handleSimulation(selectedId)}}
            style={btnStyle}
          >仿真</Button>  */}
					<Search style={{ width: 320 }} placeholder={language == 'en' ? 'Please enter the query content' : '请输入查询内容'} onSearch={value => this.handleSearchList(value)} />
				</Header>
				<Content className={s['table-wrap']} style={{ marginTop: '76px', height: '480px', overflowY: 'auto' }} >
					<Table
						loading={sceneLoading}
						bordered={false}
						pagination={false}
						rowKey="id"
						rowSelection={{
							type: 'radio',
							selectedRowKeys: selectedId,
							onChange: this.handleSelectRow,
						}}
						columns={this.valueTableColumns}
						dataSource={sceneList}
					/>
				</Content>
				{
					this.state.modal.type === 'SceneAddModal' ? (
						<WrappedSceneAddModal
							addScene={addScene}
							zIndex={10000}
							handleHide={this.hideModal}
							data={this.state.modal.props}
							showPointModal={this.props.showPointModal}
						/>
					) : null
				}
				{
					this.state.modal.type === 'SceneListModifyModal' ? (
						<WrappedSceneListModifyModal
							editScene={editScene}
							zIndex={10000}
							handleHide={this.hideModal}
							selectedId={selectedId}
							selectedRowKeys={this.state.selectedIds}
							data={this.state.modal.props}
							sceneList={sceneList}
							newData={newData}
							showPointModal={this.props.showPointModal}
						/>
					) : null
				}
			</Layout>
		);
	}
}

//添加新点
class AddPointModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			selectedPoints: this.props.selectedData,
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSelectPoints = this.handleSelectPoints.bind(this);
	}

	handleSubmit(e) {
		const { searchPointList, handleHide } = this.props

		if (this.state.selectedPoints && this.state.selectedPoints.length > 0) {
			searchPointList(this.state.selectedPoints)
			handleHide()

		} else {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Add point cannot be empty' : '添加点不能为空'
			})
		}
		e.preventDefault();
	}

	// 获取组件
	getComponents() {
		return this.state.selectedPoints.map((point, i) => {
			return (
				<Tag key={point} style={{ backgroundColor: "#1C2530" }} closable onClose={(e) => { this.delSelectedPoints(e, point) }} >{point}</Tag>
			)
		})
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
	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 14
			},
		};

		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Add New Point' : "添加新点"}
				width={400}
				visible={true}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				okText={language == 'en' ? 'OK' : "确认"}
			>
				<Form className={formClass}>
					<FormItem
						wrapperCol={{
							xs: { span: 8 },
							sm: { span: 4 },
						}}
					>
						<div className={s[`${btnWrap}`]} >
							<span style={{ color: "red", position: 'absolute', left: "10px", top: "-18px", width: "20px", fontSize: "20px" }} >*</span><span style={pointListLabel}>点名列表清单</span>
							<div style={{ maxHeight: 300, overflowY: 'auto' }}>
								{this.getComponents()}
							</div>
							{
								<Button
									onClick={
										() => this.props.showPointModal(true, {
											onOk: this.handleSelectPoints
										})
									}
								>+</Button>
							}
						</div>
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedAddPointModal = Form.create()(AddPointModal);

//修改点值
class ChangeValueModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			selectedPoints: this.props.selectedData,
			value: ''
		};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {

		if (this.state.loading != false) {
			return true
		}
		if (this.state.value != nextState.value) {
			return true
		}
		if (this.props.changeValueModalVisible != nextProps.changeValueModalVisible) {
			return true
		}
		return false
	}

	handleSubmit(e) {
		const { changeValue, handleHide, hideLoadTable } = this.props
		let settingValue = this.props.form.getFieldsValue().settingValue
		if (settingValue != undefined && settingValue != null) {
			changeValue(settingValue)
			handleHide()
		} else {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Failed to modify point value' : '修改点值失败'
			})
		}
		e.preventDefault();
		hideLoadTable();
	}

	onChange = (e) => {
		this.setState({
			value: e.target.value
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { currentValue } = this.props;
		const formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 14
			},
		};

		return (
			<Modal
				className={toggleModalClass}
				wrapClassName="user-add-modal-wrap"
				title={language == 'en' ? 'Modify Point Value' : "修改点值"}
				width={360}
				visible={this.props.changeValueModalVisible}
				confirmLoading={this.state.loading}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				okText={language == 'en' ? 'OK' : "确认"}
			>
				<Form className={formClass}>
					<FormItem>
						{
							getFieldDecorator('settingValue', {
								initialValue: currentValue,
							})(
								<Input onChange={this.onChange} style={{ width: 300 }} />
							)
						}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedChangeValueModal = Form.create()(ChangeValueModal);

class SceneView extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modal: this.props.modal,
			selectedData: [],
			selectedId: this.props.selectedId,
			tableData: [],
			pointListLoading: false,
			userList: [],
			timeList: [],
			currentValueIndex: 0,
			dataSource: [],
			subData: {},      //数据
			currentValue: null,
			changeFlag: false,
			layoutLoading: false,
			changeValueModalVisible: false

		}
		this.loadTable = this.loadTable.bind(this);
		this.confirm = this.confirm.bind(this);
		this.handleAddPoint = this.handleAddPoint.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.getExcelData = this.getExcelData.bind(this);
		this.getPointList = this.getPointList.bind(this);
		this.changeValue = this.changeValue.bind(this);
		this.showChangeValueModal = this.showChangeValueModal.bind(this);
		this.searchPointList = this.searchPointList.bind(this);
		this.delPoint = this.delPoint.bind(this);
		this.hideLoadTable = this.hideLoadTable.bind(this);
		this.preCancel = this.preCancel.bind(this);
		this.preConfirm = this.preConfirm.bind(this);
		this.changeSave = this.changeSave.bind(this);
		this.export = this.export.bind(this);
		this.handleExecute = this.handleExecute.bind(this);
		this.executeScene = this.executeScene.bind(this);
		this.cleanDataSource = this.cleanDataSource.bind(this);
	}
	static get defaultProps() {
		return {
			modal: {
				type: null,
				props: {}
			}
		}
	}

	componentDidMount() {
		const { getSceneList, nodeData } = this.props
		getSceneList()
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible != this.props.visible) {
			if (nextProps.selectedId[0] != null && nextProps.selectedId[0] != undefined) {
				this.getPointList(nextProps.selectedId[0])
			}
			this.props.getSceneList()
		}
		if (nextProps.selectedId[0] != null && nextProps.selectedId[0] != undefined && nextProps.selectedId[0] != this.props.selectedId[0]) {
			if (this.state.changeFlag == true) {
				this.changeSave(this.props.selectedId[0], nextProps.selectedId[0])
			} else {
				this.getPointList(nextProps.selectedId[0])
			}
		}

	}

	shouldComponentUpdate(nextProps) {
		if (nextProps.isDeleted != this.props.isDeleted && nextProps.isDeleted) {
			this.cleanDataSource()
		}
		return true
	}

	cleanDataSource() {
		this.setState({
			dataSource: []
		})
		this.props.isDeletedUpdate(false)
	}

	loadTable() {
		this.setState({
			pointListLoading: true
		})
	}

	hideLoadTable() {
		this.setState({
			pointListLoading: false
		})
	}

	handleAddPoint() {
		if (this.props.selectedId.length != 0) {
			this.showModal('AddPointModal');
		} else {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Please select the scene to operate from the list on the left!' : '请在左侧列表选中要操作的场景！'
			})
		}
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
			modal: SceneView.defaultProps.modal
		});
		this.hideLoadTable()
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
	//保存当前场景内容
	confirm() {  //确认
		if (this.props.selectedId.length != 0) {
			let dataSource = this.state.dataSource
			// console.log(this.props.selectedId[0])
			let pointValue = []
			let pointName = []
			dataSource.map(rowObj => {
				pointValue.push(rowObj.pointValue)
				pointName.push(rowObj.pointName)
			})
			this.loadTable();
			this.props.savePoint(pointValue, pointName, this.props.selectedId[0], this.hideLoadTable)
			this.setState({
				changeFlag: false
			})
		} else {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Please select the scene to operate from the list on the left!' : '请在左侧列表选中要操作的场景！'
			})
		}

	}

	//确认是否执行场景
	handleExecute() {
		if (this.props.selectedId.length != 0) {
			if (this.state.dataSource.length != 0) {
				let dataSource = this.state.dataSource
				// console.log(this.props.selectedId[0])
				let pointValue = []
				let pointName = []
				dataSource.map(rowObj => {
					pointValue.push(rowObj.pointValue)
					pointName.push(rowObj.pointName)
				})
				//this.loadTable();
				var _this = this
				Modal.confirm({
					title: language == 'en' ?
						'Are you sure you want to run this scene?' :
						'是否确认运行本场景？',
					content: language == 'en' ?
						`Running this scene will directly send a total of ${this.state.dataSource.length} actions defined and controlled within the scene. Are you sure you want to run the scene: ${this.props.selectedName}?` :
						`运行本场景后将直接发送场景内的设定及控制动作共计${this.state.dataSource.length}个，是否确定要运行场景：${this.props.selectedName}?`,
					onCancel() { },
					onOk() {
						_this.executeScene(pointValue, pointName)
					}
				})
			} else {
				Modal.info({
					title: language == 'en' ? 'Reminder' : '提示',
					content: language == 'en' ? 'No action defined in this scene, execution is invalid!' : '本场景内未定义设定动作，运行无效！'
				})
			}
		} else {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Please select the scene to operate from the list on the left!' : '请在左侧列表选中要操作的场景！'
			})
		}
	}


	//执行场景
	executeScene(pointValue, pointName) {
		http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
			token: appConfig.token,
			pointList: pointName,
			valueList: pointValue,
			source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
		}).then(
			data => {
				if (!data.err) {
					Modal.success({
						title: language == 'en' ? 'Reminder' : '提示',
						content: language == 'en' ? `Scene ${this.props.selectedName} ran successfully!` : `${this.props.selectedName}场景运行成功！`
					})
					//增加操作记录
					http.post('/operationRecord/add', {
						"userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
							JSON.parse(localStorage.getItem('userInfo')).name : '',
						"content": language == 'en' ? `Run Scene${this.props.selectedName}` : `运行${this.props.selectedName}场景`,
						"address": ''
					}).then(
						data => {

						}
					)
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
						title: language == 'en' ? 'Scene execution failed' : '场景运行失败',
						content: language == 'en' ? 'Communication failed, the scene was not executed!' : '通讯失败，本场景没有执行！'
					})
				}
			}
		)
	}

	preConfirm(pointValue, pointName) {  //退出前的确认
		this.props.preSavePoint(pointValue, pointName, this.props.selectedId[0])
	}

	getExcelData(response) {
		this.setState({
			dataSource: response.data,
			changeFlag: false
		})
	}

	getPointList(selectedId) {
		this.loadTable();
		http.post('/env/get', {
			lan: language,
			id: selectedId
		}).then(
			data => {
				if (data.err === 0) {
					this.setState({
						dataSource: data.data.detail
					})
				} else {
					Modal.error({
						title: language == 'en' ? 'Reminder' : '错误提示',
						content: data.msg
					})
				}
				this.hideLoadTable()
			}
		).catch(
			error => {
				Modal.error({
					title: language == 'en' ? 'Reminder' : '错误提示',
					content: error.message
				})
				this.hideLoadTable()
			}
		)
	}

	showChangeValueModal(index, record) {
		this.setState({
			currentValueIndex: index,
			currentValue: record.pointValue,
			changeValueModalVisible: true
		})
		this.loadTable();
		this.showModal('changeValueModal')
	}


	changeValue(settingValue) {
		// console.log(settingValue,this.state.currentValueIndex)
		let data = this.state.dataSource
		data[this.state.currentValueIndex].pointValue = settingValue
		// console.log(data)
		this.setState({
			dataSource: data,
			changeFlag: true
		})
	}
	//获取添加点的点值、点名、释义
	searchPointList(pointList) {
		this.setState({
			changeFlag: true
		});
		http.post('/analysis/get_point_info_from_s3db', {
			pointList: pointList,
			lan: language
		}).then(
			data => {
				if (data.err === 0) {
					let list = []
					//当realtimeValue长度跟请求不一致，表示有的点没有实时值，需要直接写默认值0
					const realtimeValue = data.data.realtimeValue
					if (realtimeValue.length != pointList.length) {
						if (Object.keys(data.data).length > 1) {
							for (let i = 0; i < pointList.length; i++) {
								if (realtimeValue.length === 0) {
									let obj = {};
									obj['pointName'] = pointList[i];
									obj['pointValue'] = 0;
									obj['description'] = data.data[pointList[i]].description;
									list.push(obj)
								} else {
									for (let j = 0; j < realtimeValue.length; j++) {
										if (pointList[i] === realtimeValue[j].name) {
											let obj = {};
											obj['pointName'] = realtimeValue[j].name;
											obj['pointValue'] = realtimeValue[j].value;
											obj['description'] = realtimeValue[j].description;
											list.push(obj)
											break;
										} else {
											if (j === realtimeValue.length - 1) {
												let obj = {};
												obj['pointName'] = pointList[i];
												obj['pointValue'] = 0;
												obj['description'] = data.data[pointList[i]].description;
												list.push(obj)
											}
										}
									}
								}
							}
						}
					} else {
						list = realtimeValue.map(item => {
							let obj = {}
							obj['pointName'] = item.name;
							obj['pointValue'] = item.value;
							obj['description'] = item.description;
							return obj
						})
					}
					if (this.state.dataSource.length != 0) {
						let filteredList = list.filter(item => !this.state.dataSource.some(obj => obj.pointName == item.pointName));
						this.setState({
							dataSource: this.state.dataSource.concat(filteredList)
						})
					} else {
						this.setState({
							dataSource: this.state.dataSource.concat(list)
						})
					}
				}
			}
		).catch(
			error => {
				Modal.error({
					title: language == 'en' ? 'Reminder' : '错误提示',
					content: error.message
				})
			}
		)
	}

	//删除整行
	delPoint(index) {
		Modal.confirm({
			title: language == 'en' ? 'Do you want to delete this point?' : '是否删除该点',
			content: language == 'en' ? 'Click the "Confirm" button to delete this point' : '点击"确认"按钮删除该点',
			onOk: () => {
				this.loadTable();
				this.state.dataSource.splice(index, 1);
				this.setState({
					changeFlag: true
				})
				this.hideLoadTable();
			}
		})
	}

	changeSave(id, nextId) {
		const { preConfirm } = this
		let dataSource = this.state.dataSource
		let pointValue = []
		let pointName = []
		if (this.state.changeFlag == false || this.props.selectedId[0] === undefined) {
			return;
		}
		if (this.state.changeFlag == true && this.props.selectedId[0] != undefined) {
			dataSource.map(rowObj => {
				pointValue.push(rowObj.pointValue)
				pointName.push(rowObj.pointName)
			})
			let _this = this
			Modal.confirm({
				title: language == 'en' ? 'Do you want to save the scene content definition?' : '是否要保存场景内容定义?',
				onOk() {
					_this.props.changeSceneSavePoint(pointValue, pointName, id);
					_this.setState({
						changeFlag: false
					});
					_this.getPointList(nextId)
				},
				onCancel() {
					_this.setState({
						changeFlag: false
					});
					_this.getPointList(nextId)
				}
			});
		}
	}
	// 导出excel
	export() {
		if (this.props.selectedId.length != 0) {
			this.setState({
				layoutLoading: true
			})
			let id = this.props.selectedId[0]

			var timer = setInterval(
				http.post('/env/export', {
					id: id,
					lan: language
				}).then(
					data => {
						if (data.err == 0) {
							downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/${data.data}`)
							this.setState({
								layoutLoading: false
							});
						} else {
							Modal.error({
								title: language == 'en' ? 'Reminder' : '提示',
								content: `${data.msg}`
							})
							this.setState({
								layoutLoading: false
							});
						}
					}
				).catch(
					err => {
						Modal.error({
							title: language == 'en' ? 'Reminder' : '提示',
							content: language == 'en' ? 'Failed to retrieve or no content available' : '获取失败或无内容'
						})
						this.setState({
							layoutLoading: false
						});
					}
				)
				, 3000);
		} else {
			Modal.info({
				title: language == 'en' ? 'Reminder' : '提示',
				content: language == 'en' ? 'Please select the scene to operate from the list on the left!' : '请在左侧列表选中要操作的场景！'
			})
		}


	}
	preCancel() {
		const { preConfirm } = this
		const { onCancel } = this.props
		let dataSource = this.state.dataSource
		let pointValue = []
		let pointName = []
		dataSource.map(rowObj => {
			pointValue.push(rowObj.pointValue)
			pointName.push(rowObj.pointName)
		})
		if (this.props.selectedId[0] === undefined || this.state.changeFlag == false) {
			onCancel()
		} else {
			let _this = this
			Modal.confirm({
				title: language == 'en' ? 'Do you want to save the scene content definition?' : '是否要保存场景内容定义?',
				onOk() {
					preConfirm(pointValue, pointName);
					_this.setState({
						changeFlag: false
					})
				},
				onCancel() {
					onCancel()
				},
			});
		}
	}

	render() {
		const { visible, selectedData, showPointModal, sceneLoading, addScene, editScene, hideModal, getSceneList,
			sceneList, delScene, loadDate, sceneListSelectedId, handleSimulation,
			savePoint, preSavePoint, changeSceneSavePoint, saveSceneListId, selectedId, isDeletedUpdate } = this.props
		const _this = this
		const uploadData = {
			name: 'file',
			action: `${appConfig.serverUrl}/env/import/${this.props.selectedId[0]}`,
			headers: {
				authorization: 'authorization-text'
			},
			onChange(info) {

				_this.setState({
					layoutLoading: true
				});
				if (info.file.status !== 'uploading') {
					// console.log(info.file, info.fileList);
					_this.setState({
						layoutLoading: false
					});
				}
				if (info.file.status === 'done') {
					//message.success(`${info.file.name} file uploaded successfully`);
					// console.log(info.file.response)
					_this.setState({
						layoutLoading: false
					});
					if (info.file.response.err > 0) {
						Modal.error({
							title: language == 'en' ? 'Reminder' : '错误提示',
							content: `${info.file.response.msg}`
						})
					} else {
						_this.getExcelData(info.file.response)
					}
				} else if (info.file.status === 'error') {
					//message.error(`${info.file.name} file upload failed.`);
					Modal.error({
						title: language == 'en' ? 'Reminder' : '错误提示',
						content: language == 'en' ? `${info.file.name} Update Failed` : `${info.file.name} 更新失败.`
					})
					_this.setState({
						layoutLoading: false
					});
				}
			}
		}

		return (
			<div>
				{
					visible ?
						<Modal
							visible={visible}
							onCancel={this.preCancel}
							footer={null}
							maskClosable={false}
							width={1100}
							title={language == 'en' ? 'Scene Management' : '场景管理'}
							wrapClassName={str}
						>
							<div className={s['schedule-wrap']}>
								{
									this.props.layoutLoading ?
										<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
											<Spin tip={language == 'en' ? 'Loading' : "Loading…"} />
										</div>
										:
										<Layout>
											<Sider width={330} style={SliderRightStyle}>
												<ValueList
													value={this.state.userList}
													showPointModal={showPointModal}
													addScene={addScene}
													editScene={editScene}
													delScene={delScene}
													sceneList={sceneList}
													handleSimulation={handleSimulation}
													getPointList={this.getPointList}
													saveSceneListId={saveSceneListId}
													selectedId={selectedId}
													searchList={this.props.searchList}
													getSceneList={getSceneList}
												/>
											</Sider>
											<Content style={SliderLeftStyle}>
												<div style={{ marginTop: '10px', height: '55px' }}>
													<div className={s['scene-containt-left']}>
														{language == 'en' ? 'Scene content' : '场景内容定义'}
														<Button style={{ marginLeft: '10px', backgroundColor: '#F04134' }} onClick={this.handleExecute}>{language == 'en' ? 'Run the scene' : '运行场景'}</Button>
													</div>
													<div className={s['scene-containt-right']}>
														<Button className={s['button-common']} type='default' onClick={this.handleAddPoint}>{language == 'en' ? 'Add points' : '添加新点'}</Button>
														<Upload {...uploadData} showUploadList={false}>
															<Button >
																<Icon type="download" />{language == 'en' ? 'Excel import' : 'Excel导入'}
															</Button>
														</Upload>
														<Button className={s['button-common']} type='default' onClick={this.export}>
															<Icon type='upload' />{language == 'en' ? 'Excel export' : 'Excel导出'}</Button>
														<Button className={s['button-common']} type='primary' onClick={this.confirm}>{language == 'en' ? 'Save' : '保存'}</Button>
													</div>
												</div>
												<Table
													pagination={false}
													bordered
													loading={this.state.pointListLoading}
													scroll={{ y: 440 }}
													columns={[{
														title: language == 'en' ? 'point name' : '点名',
														dataIndex: 'pointName',
														key: 'pointName',
														width: 250
													},
													{
														title: language == 'en' ? 'description' : '释义',
														dataIndex: 'description',
														key: 'description',
														width: 250
													},
													{
														title: language == 'en' ? 'point value' : '点值',
														dataIndex: 'pointValue',
														key: 'pointValue',
														render: (text, record, index) => {
															return (<div><Input readOnly unselectable="on" style={InputStyle} id={record.pointValue} value={record.pointValue} />
																<Button onClick={() => { this.showChangeValueModal(index, record) }} style={BtnBorderStyle}>{language == 'en' ? 'edit' : '修改值'}</Button>
																<Button onClick={() => this.delPoint(index)} style={BtnBorderStyle}>{language == 'en' ? 'delete' : '删除'}</Button>
															</div>
															)
														}
													}
													]}
													dataSource={this.state.dataSource}
												/>
												{
													this.state.modal.type === 'AddPointModal' ? (
														<WrappedAddPointModal
															addScene={addScene}
															zIndex={10000}
															handleHide={this.hideModal}
															data={this.state.modal.props}
															showPointModal={this.props.showPointModal}
															selectedData={this.state.selectedData}
															searchPointList={this.searchPointList}
														/>
													) : null
												}
												{
													this.state.modal.type === 'changeValueModal' ? (
														<WrappedChangeValueModal
															currentValue={this.state.currentValue}
															changeValue={this.changeValue}
															zIndex={10000}
															handleHide={this.hideModal}
															hideLoadTable={this.hideLoadTable}
															changeValueModalVisible={this.state.changeValueModalVisible}
														/>
													) : null
												}
												<PointModalView />
											</Content>
										</Layout>
								}

							</div>
						</Modal>
						:
						''
				}
			</div>

		)
	}
}

export default SceneView