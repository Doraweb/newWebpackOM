import React from 'react';
import { Form, Modal, Input, Row, Col, Select } from 'antd';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import Editor from './Editor'
import appConfig from '../../../common/appConfig';

const { Option } = Select;
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 10 }
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 12 }
	}
};
const formItemLayout1 = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8 }
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 12 }
	}
}

const language = appConfig.language
const FormItem = Form.Item;
class GuaranteeModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			editorHtml: '',
			editorText: '',
			visible: false,
			content: '',
			key: ''
		}
		this.hide = this.hide.bind(this)
		this.sumbit = this.sumbit.bind(this)
		this.changeContent = this.changeContent.bind(this)
	}
	componentDidMount() {
	}
	changeContent(data) {
		this.setState({
			content: data
		})
	}
	hide() {
		const { form } = this.props
		this.props.createGuarantee(false)
		form.resetFields()
		this.setState({
			key: Math.random()
		})
	}
	sumbit(e) {
		const { form, parmsDict } = this.props
		const { RepairData, createGuarantee } = this.props
		const { validateFields } = this.props.form
		const { content } = this.state
		// this.setState({
		//   key:Math.random()
		// })
		var _this = this
		e.preventDefault();
		validateFields((err, values) => {
			if (!err) {
				createGuarantee(false)
				http.post('/fix/add',
					{
						"title": values.title,
						"pageId": RepairData.pageId.toString(),
						// INT
						"importance": parseInt(values.importance),
						// 重要程度，0低，1中，2高 INT
						"urgent": parseInt(values.urgent),
						// 紧急程度，0低，1中，2高 INT
						"content": content,
						"result": parseInt(values.result),  // 0:未解决，1：已解决，2：已关闭 INT
						// TEXT
						"reportUser": values.reportUser,
						// VARCHAR
						"energyEffects": parseInt(values.energyEffects),
						// 0低，1中，2高 INT
						"x": RepairData.x,
						// INT
						"y": RepairData.y, // INT
						"lan": language
					}
				).then(
					data => {
						if (data.err = 0) {

						}
					}
				).catch(
				)
				form.resetFields()
				setTimeout(function () {
					parmsDict.renderScreen(undefined, undefined, true)
				}, 300)
				_this.setState({
					key: Math.random()
				})
			}
		})
	}
	render() {
		const { createGuarantee, Guarantee, RepairData, parmsDict } = this.props
		const { getFieldDecorator } = this.props.form;
		return (
			language == 'en' ?
				<Modal
					title="Create New Note"
					width={770}
					visible={Guarantee}
					onCancel={this.hide}
					onOk={this.sumbit}
					key={this.state.key}
					maskClosable={false}
					okText="Confirm"
					cancelText="Cancel"
				>
					<Form style={{ marginLeft: '-25px' }}>
						<Row>
							<Col span={12}>
								<FormItem {...formItemLayout} label="Importance">
									{getFieldDecorator('importance', {
										rules: [{ required: true, message: 'Please fill in the content' }],
										initialValue: '1'
									})(
										<Select>
											<Option value='0' >Low</Option>
											<Option value='1' >Medium</Option>
											<Option value='2' >High</Option>
										</Select>
									)}
								</FormItem>
							</Col>
							<Col span={12}>
								<FormItem {...formItemLayout} label="Urgency">
									{getFieldDecorator('urgent', {
										rules: [{ required: true, message: 'Please fill in the content' }],
										initialValue: '1'
									})(
										<Select>
											<Option value='0' >Low</Option>
											<Option value='1' >Medium</Option>
											<Option value='2' >High</Option>
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<FormItem {...formItemLayout} label="Reporter">
									{getFieldDecorator('reportUser', {
										initialValue: JSON.parse(localStorage.getItem('userData')).name,
										rules: [{ required: true, message: 'Please fill in the content' }],
										// initialValue: ''
									})(<Input />)}
								</FormItem>
							</Col>
							<Col span={12}>
								<FormItem {...formItemLayout} label="Energy Saving Impact">
									{getFieldDecorator('energyEffects', {
										rules: [{ required: true, message: 'Please fill in the content' }],
										initialValue: '1'
									})(
										<Select>
											<Option value='0' >Low</Option>
											<Option value='1' >Medium</Option>
											<Option value='2' >High</Option>
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>
						<Row>
							<Col span={18} style={{ marginLeft: '-30px' }}>
								<FormItem {...formItemLayout1} label="Title">
									{getFieldDecorator('title', {
										initialValue: 'Issue Record',
										rules: [{ required: true, message: 'Please enter title' }],
										// initialValue: ''
									})(<Input />)}
								</FormItem>
							</Col>
							<Col span={6} style={{ marginLeft: '-77px' }}>
								<FormItem {...formItemLayout} label="Result">
									{getFieldDecorator('result', {
										// rules: [{ required: true, message:'Please fill in the content' }],
										initialValue: '0'
									})(
										<Select>
											<Option value='0' >Unresolved</Option>
											<Option value='1' >Resolved</Option>
											<Option value='2' >Closed</Option>
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>

					</Form>
					<Editor
						content={this.state.content}
						changeContent={this.changeContent}
					/>
				</Modal>
				:
				<Modal
					title="新建备注"
					width={770}
					visible={Guarantee}
					onCancel={this.hide}
					onOk={this.sumbit}
					key={this.state.key}
					maskClosable={false}
					okText="确认"
					cancelText="取消"
				>
					<Form style={{ marginLeft: '-25px' }}>
						<Row>
							<Col span={12}>
								<FormItem {...formItemLayout} label="重要程度">
									{getFieldDecorator('importance', {
										rules: [{ required: true, message: '请填写内容' }],
										initialValue: '1'
									})(
										<Select>
											<Option value='0' >低</Option>
											<Option value='1' >中</Option>
											<Option value='2' >高</Option>
										</Select>
									)}
								</FormItem>
							</Col>
							<Col span={12}>
								<FormItem {...formItemLayout} label="紧急程度">
									{getFieldDecorator('urgent', {
										rules: [{ required: true, message: '请填写内容' }],
										initialValue: '1'
									})(
										<Select>
											<Option value='0' >低</Option>
											<Option value='1' >中</Option>
											<Option value='2' >高</Option>
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<FormItem {...formItemLayout} label="报告人">
									{getFieldDecorator('reportUser', {
										initialValue: JSON.parse(localStorage.getItem('userData')).name,
										rules: [{ required: true, message: '请填写内容' }],
										// initialValue: ''
									})(<Input />)}
								</FormItem>
							</Col>
							<Col span={12}>
								<FormItem {...formItemLayout} label="节能影响程度">
									{getFieldDecorator('energyEffects', {
										rules: [{ required: true, message: '请填写内容' }],
										initialValue: '1'
									})(
										<Select>
											<Option value='0' >低</Option>
											<Option value='1' >中</Option>
											<Option value='2' >高</Option>
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>
						<Row>
							<Col span={18} style={{ marginLeft: '-30px' }}>
								<FormItem {...formItemLayout1} label="标题">
									{getFieldDecorator('title', {
										initialValue: '问题记录',
										rules: [{ required: true, message: '请输入标题' }],
										// initialValue: ''
									})(<Input />)}
								</FormItem>
							</Col>
							<Col span={6} style={{ marginLeft: '-77px' }}>
								<FormItem {...formItemLayout} label="结果">
									{getFieldDecorator('result', {
										// rules: [{ required: true, message:'请填写内容' }],
										initialValue: '0'
									})(
										<Select>
											<Option value='0' >未解决</Option>
											<Option value='1' >已解决</Option>
											<Option value='2' >已关闭</Option>
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>

					</Form>
					<Editor
						content={this.state.content}
						changeContent={this.changeContent}
					/>
				</Modal>
		)

	}
}
const GuaranteeView = Form.create()(GuaranteeModal);
export default GuaranteeView;
