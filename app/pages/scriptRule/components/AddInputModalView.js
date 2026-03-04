/**
 * 添加输入规则-模态框
 */
import React from 'react';
import { Button, Modal, Radio, message, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import { modalTypes } from '../../../common/enum'
import PointModalView from '../containers/PointModalContainer';
import appConfig from '../../../common/appConfig';

import http from '../../../common/http';

const language = appConfig.language;

const RadioGroup = Radio.Group;
const { TextArea } = Input;


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

class AddInputModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			week: 0,
			month: 0,
			type: 1
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleHidePointModal = this.handleHidePointModal.bind(this);
		this.handlePdfModal = this.handlePdfModal.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err && values.inputScript != "") {
				let obj = {}
				obj['script'] = values.inputScript
				obj['title'] = values.scriptDesc
				this.props.handleOk(obj);
				this.props.handleHide();
			}
		});
	}


	handleChangeType = e => {
		this.setState({ type: e.target.value });
	}

	handleHidePointModal = () => {
		const { showPointModal, onSelectChange } = this.props
		onSelectChange([])
		showPointModal(modalTypes.POINT_MODAL)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.selectedPoint !== this.props.selectedPoint && nextProps.selectedPoint.name !== this.props.selectedPoint.name && nextProps.selectedPoint.name != undefined) {
			let pointName = nextProps.selectedPoint.name
			let inputScript = nextProps.form.getFieldValue('inputScript') != undefined ? nextProps.form.getFieldValue('inputScript') : '';
			let scriptDesc = nextProps.form.getFieldValue('scriptDesc') != undefined ? nextProps.form.getFieldValue('scriptDesc') : '';
			const { setFieldsValue } = this.props.form
			setFieldsValue({
				inputScript: `${inputScript}<%${pointName}%>`,
				scriptDesc: scriptDesc + nextProps.selectedPoint.description
			})
		}
		if (nextProps.visible && !this.props.visible) {
			const { setFieldsValue } = this.props.form
			setFieldsValue({
				inputScript: "",
				scriptDesc: ""
			})
		}

	}

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
							<p>{language == 'en' ? 'Calculation result: ' : '计算结果为：'}{data.data}</p>
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
				title={language == 'en' ? 'Add Input Condition' : '添加输入条件'}
				width={language == 'en' ? 760 : 680}
				visible={this.props.visible}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				destroyOnClose={true}    //关闭时消除子组件，防止多个弹框打开点表框时，层叠顺序错乱，点名弹框在下面的bug
				cancelText={language == 'en' ? 'Cancel' : '取消'}
				okText={language == 'en' ? 'OK' : '确定'}
			>
				<Button type="primary" onClick={this.handleHidePointModal}>{language == 'en' ? 'Insert Point Name' : '插入点名'}</Button>
				<Button style={{ marginLeft: '10px' }} onClick={this.handlePdfModal}>{language == 'en' ? 'Help Me Write Script' : '帮我编制脚本'}</Button>
				<Button style={{ marginLeft: '10px' }} onClick={() => this.modifyPointDescription()}>{language == 'en' ? 'Test Script' : '测试脚本'}</Button>
				<Form style={{ marginTop: '10px' }}>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayout}
						label={language == 'en' ? 'Edit Script' : '编辑脚本'}
					>
						{getFieldDecorator('inputScript', {
							rules: [{
								required: true, message: language == 'en' ? 'Please edit the "input condition" script!' : '请编辑"输入条件"脚本!'
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

						})(
							<TextArea
								autoSize={{ minRows: 3, maxRows: 10 }}
							/>
						)}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedAddInputModal = Form.create()(AddInputModal);

export default WrappedAddInputModal
