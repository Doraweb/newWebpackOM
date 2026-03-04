/**
 * 编辑、删除 输入规则-模态框
 */
import React from 'react';
import { Button, Modal, Radio, message, Form, Input, Select, DatePicker, Row, Col, Checkbox } from 'antd';
import moment from 'moment';
import { modalTypes } from '../../../common/enum'
import s from './EditOutputModalView.css';
import PointModalView from '../containers/PointModalContainer';
import appConfig from '../../../common/appConfig';

import http from '../../../common/http';

const language = appConfig.language;

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

const titleByOption = {
	'option1': language == 'en' ? 'Point Assignment' : '点位赋值',
	'option2': language == 'en' ? 'Raise Hot Water Temp' : '提升热水温度',
	'option3': language == 'en' ? 'Lower Hot Water Temp' : '降低热水温度',
	'option4': language == 'en' ? 'Wait for a Period' : '等待一段时间',
	'option5': language == 'en' ? 'Add Equipment' : '增开设备',
	'option6': language == 'en' ? 'Remove Equipment' : '减开设备',
	'option7': language == 'en' ? 'Raise Frequency' : '提升频率',
	'option8': language == 'en' ? 'Lower Frequency' : '降低频率',
	'option9': language == 'en' ? 'Wait for Condition' : '等待一定条件',
	'option10': language == 'en' ? 'Send Alarm to System' : '发送报警到系统',
	'option11': language == 'en' ? 'Send Alarm to User' : '发送报警到用户',
	'option12': language == 'en' ? 'Custom Script' : '自定义脚本',
	'option13': language == 'en' ? 'Raise Point Setting' : '点位升高设定',
	'option14': language == 'en' ? 'Lower Point Setting' : '点位降低设定',
	'option15': language == 'en' ? 'Raise Chilled Water Temp' : '提升冷水温度',
	'option16': language == 'en' ? 'Lower Chilled Water Temp' : '降低冷水温度',


}


let modalToggleClass, calendarToggleClass, selectToggleClass, btnStyle;
if (localStorage.getItem('serverOmd') == "persagy") {
	modalToggleClass = 'persagy-modal-style persagy-history-label persagy-history-modal';
	calendarToggleClass = 'persagy-history-calendar-picker';
	selectToggleClass = 'persagy-history-select-selection';
	btnStyle = {
		background: "rgba(255,255,255,1)",
		border: '1px solid rgba(195,198,203,1)',
		color: "rgba(38,38,38,1)",
		borderRadius: '4px',
		fontSize: "14px",
		fontFamily: 'MicrosoftYaHei'
	}
}

const Option = Select.Option;
const FormItem = Form.Item;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

class EditOutputModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			week: 0,
			month: 0,
			type: 1,
			userList: [],
			formIndex: 0,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleHidePointModal = this.handleHidePointModal.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handlePdfModal = this.handlePdfModal.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible && nextProps.selectedPoint !== this.props.selectedPoint && nextProps.selectedPoint.name !== this.props.selectedPoint.name && nextProps.selectedPoint.name != undefined) {
			let pointName = nextProps.selectedPoint.name
			let outputScript = nextProps.form.getFieldValue('outputScript') != undefined ? nextProps.form.getFieldValue('outputScript') : '';
			let scriptDesc = nextProps.form.getFieldValue('scriptDesc') != undefined ? nextProps.form.getFieldValue('scriptDesc') : '';
			let outputScript_pointName = nextProps.form.getFieldValue('outputScript_pointName') != undefined ? nextProps.form.getFieldValue('outputScript_pointName') : '';
			let outputScript_nMax = nextProps.form.getFieldValue('outputScript_nMax') != undefined ? nextProps.form.getFieldValue('outputScript_nMax') : ''; const { setFieldsValue } = this.props.form
			if (this.props.option == 'option1' || this.props.option == 'option9'
			) {
				setFieldsValue({
					outputScript_pointName: `${pointName}`,
				})
			}
			if (this.props.option == 'option13' || this.props.option == 'option14'

			) {
				if (this.state.formIndex == 2) {
					setFieldsValue({
						outputScript_pointName: `${pointName}`,
					})
				} else if (this.state.formIndex == 3) {
					setFieldsValue({
						outputScript_nMax: `${pointName}`
					})
				}
			}
		}
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (err) return; // 验证失败直接返回

			const { option } = this.props;
			let obj = {
				title: values.scriptDesc
			};

			switch (option) {
				case 'option12':
					if (values.outputScript !== "") {
						obj.script = values.outputScript;
						this.commitAction(obj);
					}
					break;

				case 'option1':
					if (values.outputScript_pointName !== "" && values.outputScript_value !== "") {
						obj.script = `point,${values.outputScript_pointName},${values.outputScript_value}`;
						this.commitAction(obj);
					}
					break;

				case 'option2':
					if (values.outputScript_equipment !== "" &&
						values.outputScript_equipmentId !== "" &&
						values.outputScript_value !== "") {
						obj.script = `action,add-chiller-hw-leave-temp-setting,${values.outputScript_value},` +
							`${values.outputScript_project},${values.outputScript_equipment},` +
							values.outputScript_equipmentId;
						this.commitAction(obj);
					}
					break;

				case 'option3':
					if (values.outputScript_equipment !== "" &&
						values.outputScript_equipmentId !== "" &&
						values.outputScript_value !== "") {
						obj.script = `action,sub-chiller-hw-leave-temp-setting,${values.outputScript_value},` +
							`${values.outputScript_project},${values.outputScript_equipment},` +
							values.outputScript_equipmentId;
						this.commitAction(obj);
					}
					break;

				case 'option4':
					if (values.outputScript_value !== "") {
						obj.script = `action,sleep,${values.outputScript_value}`;
						this.commitAction(obj);
					}
					break;

				case 'option5':
					if (values.outputScript_equipment !== "" && values.outputScript_equipmentId !== "") {
						obj.script = `action,start-one-equipment,${values.outputScript_project},` +
							`${values.outputScript_equipment},${values.outputScript_equipmentId}`;
						this.commitAction(obj);
					}
					break;

				case 'option6':
					if (values.outputScript_equipment !== "" && values.outputScript_equipmentId !== "") {
						obj.script = `action,stop-one-equipment,${values.outputScript_project},` +
							`${values.outputScript_equipment},${values.outputScript_equipmentId}`;
						this.commitAction(obj);
					}
					break;

				case 'option7':
					if (values.outputScript_equipment !== "" &&
						values.outputScript_equipmentId !== "" &&
						values.outputScript_value !== "") {
						obj.script = `action,add-equipment-group-freqsetting,${values.outputScript_value},` +
							`${values.outputScript_project},${values.outputScript_equipment},` +
							values.outputScript_equipmentId;
						this.commitAction(obj);
					}
					break;

				case 'option8':
					if (values.outputScript_equipment !== "" &&
						values.outputScript_equipmentId !== "" &&
						values.outputScript_value !== "") {
						obj.script = `action,sub-equipment-group-freqsetting,${values.outputScript_value},` +
							`${values.outputScript_project},${values.outputScript_equipment},` +
							values.outputScript_equipmentId;
						this.commitAction(obj);
					}
					break;

				case 'option9':
					if (values.outputScript_pointName !== "" && values.outputScript_value !== "") {
						obj.script = `action,wait,${values.outputScript_pointName},${values.outputScript_value}`;
						this.commitAction(obj);
					}
					break;

				case 'option10':
					if (values.outputScript_value !== "") {
						obj.script = `action,add-system-warning,${values.outputScript_value}`;
						this.commitAction(obj);
					}
					break;

				case 'option11':
					if (values.outputScript_value !== "" && values.outputScript_pointName !== "" && values.scriptDesc !== "") {
						const userValue = values.outputScript_pointName.join(';') + ';';
						const methodBinary = ['100', '010', '001'].reduce((acc, code) => {
							return acc + (values.outputScript_value.includes(code) ? '1' : '0')
						}, '').padStart(3, '0');
						obj.script = `action,send-user-notice,${userValue},${methodBinary},${values.scriptDesc}`,
							this.commitAction(obj);
					}
					break;

				case 'option15':
					if (values.outputScript_equipment !== "" &&
						values.outputScript_equipmentId !== "" &&
						values.outputScript_value !== "") {
						obj.script = `action,add-chiller-chw-leave-temp-setting,${values.outputScript_value},` +
							`${values.outputScript_project},${values.outputScript_equipment},` +
							values.outputScript_equipmentId;
						this.commitAction(obj);
					}
					break;

				case 'option16':
					if (values.outputScript_equipment !== "" &&
						values.outputScript_equipmentId !== "" &&
						values.outputScript_value !== "") {
						obj.script = `action,sub-chiller-chw-leave-temp-setting,${values.outputScript_value},` +
							`${values.outputScript_project},${values.outputScript_equipment},` +
							values.outputScript_equipmentId;
						this.commitAction(obj);
					}
					break;

				case 'option13':
					if (values.outputScript_pointName !== "" && values.outputScript_value !== "") {
						obj.script = `action,add-point-delta,${values.outputScript_pointName},${values.outputScript_value},${values.outputScript_nMax}`;
						this.commitAction(obj);
					}
					break;

				case 'option14':
					if (values.outputScript_pointName !== "" && values.outputScript_value !== "") {
						obj.script = `action,sub-point-delta,${values.outputScript_pointName},${values.outputScript_value},${values.outputScript_nMax}`;
						this.commitAction(obj);
					}
					break;

				default:
					break;
			}
		});
	}

	commitAction(obj) {
		this.props.handleOk(obj);
		// this.props.handleHide();
		this.handleModalClose();
	}


	handleChangeType = e => {
		this.setState({ type: e.target.value });
	}

	handleHidePointModal = () => {
		const { showPointModal, onSelectChange } = this.props
		onSelectChange([])
		showPointModal(modalTypes.POINT_MODAL)
	}

	handleDelete = () => {
		let _this = this
		Modal.confirm({
			title: language == 'en' ? 'Confirm Delete Input Condition?' : '是否确定删除该输入条件？',
			content: language == 'en' ? 'Click "OK" button to delete this input condition!' : '点击"确定"按钮删除该输入条件！',
			onOk() {
				_this.props.deleteOutput();
			},
			onCancel() { }
		})

	}

	// changeScript = () => {
	// 	let pointName = this.props.selectedPoint.name

	// 	let outputScript = this.props.form.getFieldValue('outputScript');

	// 	const { setFieldsValue } = this.props.form



	// 	setFieldsValue({
	// 		outputScript: timeStart
	// 	})

	// }	

	handlePdfModal() {
		Modal.info({
			title: language == 'en' ? 'API Documentation' : 'API文档',
			width: '1200px',
			content: (
				<div>
					<iframe src='https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/API%E6%96%87%E6%A1%A3.pdf' width='1100' height='700'></iframe>
				</div>
			)
		})
	}

	//测试公式
	modifyPointDescription = () => {
		let inputScript = this.props.form.getFieldValue('inputScript');
		http.post('/tool/evalStringExpression', {
			"str": inputScript,
			"debug": 1
		}).then(data => {
			if (data.err >= 0) {
				Modal.info({
					title: language == 'en' ? 'Test Information' : '测试信息',
					content: (
						<div>
							<p>{language == 'en' ? 'Calculation result:' : '计算结果为：'}{data.data}</p>
							<TextArea autoSize={{ minRows: 9, maxRows: 18 }} value={data.debugInfo} />

						</div>
					)
				})
			} else {
				Modal.error({
					title: language == 'en' ? 'Error' : '错误提示',
					content: language == 'en' ? 'Communication failed, please try again later' : '通讯失败,请稍后再试'
				})
			}
		})
	}


	getOptionModal = () => {
		const _this = this;
		const { getFieldDecorator } = this.props.form;
		let optionContent;

		switch (this.props.option) {
			case 'option1':
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								className={calendarToggleClass}
								label=""
							>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getFieldDecorator('outputScript_pointName', {
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[1] : '',
										rules: [{
											required: true, message: language == 'en' ? 'Please select point name' : '请选择点名',
										}],
									})(
										<Input
											autoSize={{ minRows: 3, maxRows: 10 }}
											style={{ flex: 1, marginRight: 8 }}
										/>
									)}
									<Button type="primary" onClick={_this.handleHidePointModal}>{language == 'en' ? 'Select Point Name' : '选择点名'}</Button>
								</div>
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Set Value' : '设定值'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: (() => {
										if (this.props.editOutputScript) {
											if (
												this.props.editOutputScript.split(',')[2] &&
												this.props.editOutputScript.split(',')[2].includes('(') &&
												!this.props.editOutputScript.split(',')[2].includes(')') &&
												this.props.editOutputScript.split(',')[3] &&
												this.props.editOutputScript.split(',')[3].includes(')')
											) {
												return this.props.editOutputScript.split(',')[2] + ',' + this.props.editOutputScript.split(',')[3]
											} else {
												return this.props.editOutputScript.split(',')[2]
											}
										} else {
											return ''
										}
									})(),

									rules: [{
										required: true, message: language == 'en' ? 'Please enter set value' : '请输入设定值',
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				);
				break;
			case 'option9':
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								className={calendarToggleClass}
								label=""
							>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getFieldDecorator('outputScript_pointName', {
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
										rules: [{
											required: true, message: language == 'en' ? 'Please select point name' : '请选择点名',
										}],
									})(
										<Input
											autoSize={{ minRows: 3, maxRows: 10 }}
											style={{ flex: 1, marginRight: 8 }}
										/>
									)}
									<Button type="primary" onClick={_this.handleHidePointModal}>{language == 'en' ? 'Select Point Name' : '选择点名'}</Button>
								</div>
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Condition' : '条件'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: (() => {
										if (this.props.editOutputScript) {
											return this.props.editOutputScript.split(',')[3]
										} else {
											return ''
										}
									})(),

									rules: [{
										required: true, message: language == 'en' ? 'Please enter the condition the point needs to reach' : '请输入点位需要达到的条件',
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				);
				break;
			case 'option3': // 降低热水温度
			case 'option8': // 降低频率
			case 'option16':  	// 降低冷水温度
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								label={language == 'en' ? 'Project Prefix (e.g. Plant01)' : '项目前缀 (如 Plant01)'}
							>
								{getFieldDecorator('outputScript_project',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[3] : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
								)}
							</FormItem>
							<FormItem
								label={language == 'en' ? 'Equipment Type' : '设备类型'}
							>
								{getFieldDecorator('outputScript_equipment',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[4] : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
								)}
							</FormItem>
							<FormItem
								label={language == 'en' ? 'Equipment ID' : '设备ID'}
							>
								{getFieldDecorator('outputScript_equipmentId',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',').slice(5).join(',') : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
									//多选组件备用
									// <MultiSelectInput/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Lower Value' : '降低值'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
									rules: [{
										required: true, message: language == 'en' ? 'Please enter how much to lower' : '请输入降低多少'
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				)
				break;
			case 'option7':	// 提升频率
			case 'option15':  // 提升冷水温度
			case 'option2': // 提升热水温度
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								label={language == 'en' ? 'Project Prefix (e.g. Plant01)' : '项目前缀 (如 Plant01)'}
							>
								{getFieldDecorator('outputScript_project',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[3] : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
								)}
							</FormItem>
							<FormItem
								label={language == 'en' ? 'Equipment Type' : '设备类型'}
							>
								{getFieldDecorator('outputScript_equipment',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[4] : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
								)}
							</FormItem>
							<FormItem
								label={language == 'en' ? 'Equipment ID' : '设备ID'}
							>
								{getFieldDecorator('outputScript_equipmentId',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',').slice(5).join(',') : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
									//多选组件备用
									// <MultiSelectInput/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Raise Value' : '提升值'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
									rules: [{
										required: true, message: language == 'en' ? 'Please enter how much to raise' : '请输入提升多少'
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				)
				break;
			case 'option4':
				optionContent = (
					<div>
						<Form>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Set Time' : '设定时间'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {

									initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
									rules: [{
										required: true, message: language == 'en' ? 'Please enter the time to wait' : '请输入需要等待的时间'
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
										addonAfter={language == 'en' ? 'seconds(s)' : '秒(s)'}
									></Input>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				);
				break;
			case 'option5':
			case 'option6':
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								label={language == 'en' ? 'Project Prefix (e.g. Plant01)' : '项目前缀 (如 Plant01)'}
							>
								{getFieldDecorator('outputScript_project',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
								)}
							</FormItem>
							<FormItem
								label={language == 'en' ? 'Equipment Type (e.g. ReHWP)' : '设备类型 （如 ReHWP)'}
							>
								{getFieldDecorator('outputScript_equipment',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[3] : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
								)}
							</FormItem>
							<FormItem
								label={language == 'en' ? 'Equipment ID (e.g. 01,02)' : '设备ID (如 01,02)'}
							>
								{getFieldDecorator('outputScript_equipmentId',
									{
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',').slice(4).join(',') : '',
									}
								)(
									<Input autoSize={{ minRows: 3, maxRows: 10 }} />
									// <MultiSelectInput/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				)
				break;
			case 'option10':
				optionContent = (
					<div>
						<Form>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Alarm Content' : '报警内容'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
									rules: [{
										required: true, message: language == 'en' ? 'Please enter alarm content' : '请输入报警内容'
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				);
				break;
			case 'option11':
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								// className={calendarToggleClass}
								label=""
							>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getFieldDecorator('outputScript_pointName', {
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2].split(';').filter(item => item !== '') : '',
										rules: [{
											required: true, message: language == 'en' ? 'Please select user' : '请选择用户'
										}],
									})(

										<Select
											mode="multiple"
											className={s['custom-select']}
											placeholder={language == 'en' ? 'Please select user' : '请选择用户'}
											// onChange={this.handleUserSelectionChange}
											onFocus={() => {
												if (this.state.userList.length === 0) {
													http.get('/allusers').then(res => {
														if (res.status === "OK") {
															this.setState({
																userList: res.data
															})
														}
													}).catch(err => {
														console.log(err)
													})
												}
											}}
										>
											{
												this.state.userList.map((point) => (
													<Option key={point.username} value={point.username}>{point.username}</Option>
												))
											}
										</Select>
									)}
								</div>
								{/* <Button type="primary" onClick={_this.handleHidePointModal}>选择点名</Button> */}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Notification Method' : '通知方式'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: this.props.editOutputScript ?
										(() => {
											const binaryStr = this.props.editOutputScript.split(',')[3].padStart(3, '0');
											const value = [];
											if (binaryStr[0] === '1') value.push('100')
											if (binaryStr[1] === '1') value.push('010')
											if (binaryStr[2] === '1') value.push('001')
											return value;
										})() : '',

								})(
									<CheckboxGroup style={{ width: '100%' }}>
										<Checkbox value="001">{language == 'en' ? 'Email' : '邮件'}</Checkbox>
										<Checkbox value="010">{language == 'en' ? 'SMS' : '短信'}</Checkbox>
										<Checkbox value="100">{language == 'en' ? 'Phone' : '电话'}</Checkbox>
									</CheckboxGroup>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Alarm Content' : '报警内容'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[4] : '',
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				);
				break;
			case 'option13':
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								className={calendarToggleClass}
								label=""
							>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getFieldDecorator('outputScript_pointName', {
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
										rules: [{
											required: true, message: '请选择点名'
										}],
									})(
										<Input
											autoSize={{ minRows: 3, maxRows: 10 }}
											style={{ flex: 1, marginRight: 8 }}
										/>
									)}
									<Button type="primary" onClick={() => {
										this.setState({
											formIndex: 2,
										}, () =>
											_this.handleHidePointModal()
										)
									}}>{language == 'en' ? 'Select Point Name' : '选择点名'}</Button>
								</div>
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Raise Value' : '提升值'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[3] : '',
									rules: [{
										required: true, message: language == 'en' ? 'Please enter how much to raise' : '请输入提升多少'
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
							<FormItem
								className={calendarToggleClass}
								label={language == 'en' ? 'Upper Limit' : '上限值'}
							>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getFieldDecorator('outputScript_nMax', {
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[4] : '',
										rules: [{
											required: true, message: language == 'en' ? 'Please select upper limit point name or enter upper limit value' : '请选择上限点名或填写上限值'
										}],
									})(
										<Input
											autoSize={{ minRows: 3, maxRows: 10 }}
											style={{ flex: 1, marginRight: 8 }}
										/>
									)}
									<Button type="primary" onClick={() => {
										this.setState({
											formIndex: 3,
										}, () =>
											_this.handleHidePointModal()
										)
									}
									}>{language == 'en' ? 'Select Point Name' : '选择点名'}</Button>
								</div>
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				);
				break;
			case 'option14':
				optionContent = (
					<div>
						<Form style={{ marginTop: '10px' }}>
							<FormItem
								className={calendarToggleClass}
								label=""
							>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getFieldDecorator('outputScript_pointName', {
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[2] : '',
										rules: [{
											required: true, message: '请选择点名'
										}],
									})(
										<Input
											autoSize={{ minRows: 3, maxRows: 10 }}
											style={{ flex: 1, marginRight: 8 }}
										/>
									)}
									<Button type="primary" onClick={() => {
										this.setState({
											formIndex: 2,
										}, () =>
											_this.handleHidePointModal()
										)
									}}>{language == 'en' ? 'Select Point Name' : '选择点名'}</Button>
								</div>
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Lower Value' : '降低值'}
								className={selectToggleClass}
							>
								{getFieldDecorator('outputScript_value', {
									initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[3] : '',
									rules: [{
										required: true, message: language == 'en' ? 'Please enter how much to lower' : '请输入降低多少'
									}],
								})(
									<Input
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
							<FormItem
								className={calendarToggleClass}
								label={language == 'en' ? 'Lower Limit' : '下限'}
							>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getFieldDecorator('outputScript_nMax', {
										initialValue: this.props.editOutputScript ? this.props.editOutputScript.split(',')[4] : '',
										rules: [{
											required: true, message: language == 'en' ? 'Please select lower limit point name or enter lower limit value' : '请选择下限点名或填写下限值'
										}],
									})(
										<Input
											autoSize={{ minRows: 3, maxRows: 10 }}
											style={{ flex: 1, marginRight: 8 }}
										/>
									)}
									<Button type="primary" onClick={() => {
										this.setState({
											formIndex: 3,
										}, () =>
											_this.handleHidePointModal()
										)
									}}>{language == 'en' ? 'Select Point Name' : '选择点名'}</Button>
								</div>
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								label={language == 'en' ? 'Description' : '脚本释义'}
								className={selectToggleClass}
							>
								{getFieldDecorator('scriptDesc', {
									initialValue: this.props.editOutputDesc,
								})(
									<TextArea
										autoSize={{ minRows: 3, maxRows: 10 }}
									/>
								)}
							</FormItem>
						</Form>
					</div>
				);
				break;
		}

		return optionContent;
	}

	handleModalClose = () => {
		this.setState({
			formIndex: 0,
		}, () => {
			this.props.handleHide()
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 4
			},
			wrapperCol: {
				span: 20
			},
		};

		return (
			<Modal
				className={modalToggleClass}
				title={language == 'en' ? `Action Configuration (${titleByOption[this.props.option]})` : `动作配置(${titleByOption[this.props.option]})`}
				width={680}
				visible={this.props.visible}
				onCancel={this.handleModalClose}
				onOk={this.handleSubmit}
				maskClosable={false}
				destroyOnClose={true}    //关闭时消除子组件，防止多个弹框打开点表框时，层叠顺序错乱，点名弹框在下面的bug
				cancelText={language == 'en' ? "Cancel" : "取消"}
				okText={language == 'en' ? "OK" : "确定"}
			>
				{this.props.option == 'option12' ?
					(
						<div>

							<Button type="primary" onClick={this.handleHidePointModal}>{language == 'en' ? 'Insert Point Name' : '插入点名'}</Button>
							<Button style={{ marginLeft: '10px' }} onClick={this.handlePdfModal}>{language == 'en' ? 'Help Me Write Script' : '帮我编制脚本'}</Button>
							<Button style={{ marginLeft: '10px' }} onClick={() => this.modifyPointDescription()}>{language == 'en' ? 'Test Script' : '测试脚本'}</Button>
							<Button style={{ float: 'right', marginRight: '5px', marginTop: '10px', }} type="danger" onClick={this.handleDelete}>{language == 'en' ? 'Delete' : '删除'}</Button>
							<Form style={{ marginTop: '10px' }}>
								<FormItem
									className={calendarToggleClass}
									{...formItemLayout}
									label={language == 'en' ? 'Edit Script' : '编辑脚本'}
								>
									{getFieldDecorator('outputScript', {
										initialValue: this.props.editOutputScript,
										rules: [{
											required: true, message: language == 'en' ? 'Please edit the "output action" script!' : '请编辑"输出动作"脚本!'
										}],
									})(
										<TextArea
											autoSize={{ minRows: 2, maxRows: 10 }}
										/>
									)}
								</FormItem>
								<FormItem
									style={{ marginBottom: 10 }}
									{...formItemLayout}
									label={language == 'en' ? 'Description' : '脚本释义'}
									className={selectToggleClass}
								>
									{getFieldDecorator('scriptDesc', {
										initialValue: this.props.editOutputDesc
									})(
										<TextArea
											autoSize={{ minRows: 3, maxRows: 10 }}
										/>
									)}
								</FormItem>
							</Form>
						</div>
					) :
					<div>
						<Button style={{ float: 'right', marginRight: '5px', marginTop: '1px', marginLeft: '3px', zIndex: 1 }} type="danger" onClick={() => this.handleDelete()}>{language == 'en' ? 'Delete' : '删除'}</Button>
						{this.getOptionModal()}
					</div>
				}
			</Modal>
		);
	}
}
const WrappedEditOutputModal = Form.create(
)(EditOutputModal);

export default WrappedEditOutputModal
