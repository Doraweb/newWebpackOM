/**
 * 编辑、删除 输入规则-模态框
 */
import React from 'react';
import { Button, Modal, Radio, message, Form, Input, Select, DatePicker, Row, Col, Spin } from 'antd';
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

class EditInputModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			week: 0,
			month: 0,
			type: 1,
			loading: false,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleHidePointModal = this.handleHidePointModal.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
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
				inputScript: nextProps.editInputScript,
				scriptDesc: nextProps.editInputDesc
			})
		}
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
			title: language == 'en' ? 'Are you sure to delete this input condition?' : '是否确定删除该输入条件？',
			content: language == 'en' ? 'Click "OK" button to delete this input condition!' : '点击"确定"按钮删除该输入条件！',
			onOk() {
				_this.props.deleteInput();
			},
			onCancel() { }
		})

	}

	// changeScript = () => {
	// 	let pointName = this.props.selectedPoint.name

	// 	let inputScript = this.props.form.getFieldValue('inputScript');

	// 	const { setFieldsValue } = this.props.form



	// 	setFieldsValue({
	// 		inputScript: timeStart
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
		if (this.props.bShowTimeShaft) {
			this.setState({ loading: true })
			http.post('/get_history_data_padded', {
				...(language == 'en' ? { "lan": "en" } : {}),
				pointList: ['1'],
				scriptList: [inputScript],
				timeStart: this.props.replyTime,
				timeEnd: this.props.replyTime,
				timeFormat: 'm1',
			}).then(
				data => {


					if (data && data.map) {
						let result = ''
						let text = "\r\n读取点值错误的点位有：\r\n\r\n"
						let text2 = "\r\n读取点值成功的点位有：\r\n\r\n"
						let text3 = ""
						Object.keys(data.map).forEach((key, i) => {
							if (key.includes('<%') && key.includes('%>')) {
								text3 = key;
								if (data && data.map && data.map[key] && data.map[key][0] != undefined) {
									result = data.map[key][0]
								} else {
									result = '计算错误'
								}
							} else if (key != '1' && key != 'in') {
								if (data && data.map && data.map[key][0] != undefined) {
									text2 += key + '\t' + data.map[key][0] + '\r\n'
								} else {
									text += key + '\r\n'
								}
							}
						})
						text = text + text2 + "\r\n\r\n公式表达式以点值代入后的转换表达式为:\r\n"
						if (result != '计算错误' && text3) {
							const result = text3.replace(/<%(\w+)%>/g, (match, p1) => {
								return data.map[p1][0] != undefined ? data.map[p1][0] : '点值不存在'
							})
							text = text + result
						}
						this.setState({ loading: false })
						Modal.info({
							title: `测试信息 (在${this.props.replyTime})历史测试`,
							content:
								(
									<div>
										<p>测试结果为：{result}</p>
										<TextArea autoSize={{ minRows: 9, maxRows: 18 }} value={text} />
									</div>
								)
						})
					} else {
						Modal.error({
							title: '错误提示',
							content: '获取历史数据失败,请稍后再试'
						})
					}
				}
			)
		} else {
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
				title={language == 'en' ? 'Edit Input Condition' : '编辑输入条件'}
				width={language == 'en' ? 760 : 680}
				visible={this.props.visible}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
				destroyOnClose={true} //关闭时消除子组件，防止多个弹框打开点表框时，层叠顺序错乱，点名弹框在下面的bug
				cancelText={language == 'en' ? 'Cancel' : '取消'}
				okText={language == 'en' ? 'OK' : '确定'}
			>

				<Spin spinning={this.state.loading}>
					<div style={{ overflow: 'hidden' }}>
						<Button type="primary" onClick={this.handleHidePointModal}>{language == 'en' ? 'Insert Point Name' : '插入点名'}</Button>
						<Button style={{ marginLeft: '10px' }} onClick={this.handlePdfModal}>{language == 'en' ? 'Help Me Write Script' : '帮我编制脚本'}</Button>
						<Button style={{ marginLeft: '10px' }} onClick={() => this.modifyPointDescription()}>{language == 'en' ? 'Test Script' : '测试脚本'}</Button>
						<Button style={{ float: 'right', marginRight: '10px' }} type="danger" onClick={this.handleDelete}>{language == 'en' ? 'Delete' : '删除'}</Button>
					</div>
					<Form style={{ marginTop: '10px' }}>
						<FormItem
							className={calendarToggleClass}
							{...formItemLayout}
							label={language == 'en' ? 'Edit Script' : '编辑脚本'}
						>
							{getFieldDecorator('inputScript', {
								rules: [{
									required: true, message: language == 'en' ? 'Please enter script!' : '请输入脚本!'
								}],
								initialValue: this.props.editInputScript
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
								initialValue: this.props.editInputDesc
							})(
								<TextArea
									autoSize={{ minRows: 3, maxRows: 10 }}
								/>
							)}
						</FormItem>

					</Form>
				</Spin>

			</Modal>
		);
	}
}
const WrappedEditInputModal = Form.create(
)(EditInputModal);

export default WrappedEditInputModal
