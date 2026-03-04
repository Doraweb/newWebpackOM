/**
 * 制冷系统的优化控制信息设定值模态框
 */
import React from 'react';
import { Modal, Form, InputNumber, Spin, Alert, Input, Button, Select, Slider, TimePicker } from 'antd'
import moment from 'moment';
import appConfig from '../../../common/appConfig';

const format = 'HH:mm';
const FormItem = Form.Item;
const { Option } = Select;
const language = appConfig.language;

let str;
if (localStorage.getItem('serverOmd') == "best") {
	str = 'warning-config-best'
} else {
	str = ''
}

class SettingValueModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isLimit: false,
			currentValue: '',
			textValue: this.props.currentValue,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.getOption = this.getOption.bind(this);
	}

	componentDidMount() {
		let description
		if (this.props.pointInfo && this.props.pointInfo.pointInfo) {
			if (this.props.pointInfo.pointInfo.hight > this.props.pointInfo.pointInfo.low || (this.props.pointInfo.pointInfo.hight && this.props.pointInfo.pointInfo.low == undefined) || (this.props.pointInfo.pointInfo.hight == undefined && this.props.pointInfo.pointInfo.low)) {  //判断有无高低限
				this.setState({
					isLimit: true
				})
			};
			description = this.props.pointInfo && this.props.pointInfo.description
		}

		for (var i = 0; i < this.props.dictBindString.length; i++) {
			for (var j = 0; j < this.props.dictBindString[i].length; j++) {
				if (this.props.dictBindString[i][j] === ':') {
					var flagNum = this.props.dictBindString[i].slice(0, j);
					if (flagNum === this.props.currentValue) {
						this.setState({
							currentValue: this.props.dictBindString[i].slice(j + 1)
						})
					}
				}
			}
		}

	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.visible !== this.props.visible) {
			this.setState({
				textValue: this.props.currentValue
			})
			return true
		}
		if (nextState.textValue !== this.state.textValue) {
			return true
		}
		if (nextState.currentValue !== this.state.currentValue) {
			return true
		}
		if (nextState.isLimit !== this.state.isLimit) {
			return true
		}
		if (this.props.isLoading !== nextProps.isLoading) {
			return true
		}
		return false
	}

	handleChange = (value) => {
		if (value == '-' || value == '.') return
		this.setState({
			textValue: value
		})
	}

	handleChangeTime = (time, timeString) => {
		this.setState({
			textValue: timeString
		})
	}

	//点击确定，提交
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (this.props.showMode == 2) {
					if (values.settingValue) {
						values.settingValue = moment(values.settingValue).format(format)
						if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(values.settingValue)) {
							if (language == "en") {
								Modal.warning({
									title: 'Information Prompt',
									content: 'The format of the set value must be the standard time format hh:mm!',
								})
							} else {
								Modal.warning({
									title: '信息提示',
									content: '设定值格式必须是标准时间格式hh:mm！',
								})
							}
							return
						}
					} else {
						values.settingValue = " "
					}
					this.props.handleOk(values, this.props.idCom);
				} else {
					if (values.settingValue === undefined && !this.props.isLoading && this.props.dictBindString === '') {
						if (language == "en") {
							Modal.warning({
								title: 'Information Prompt',
								content: 'Set value cannot be empty!',
							});
						} else {
							Modal.warning({
								title: '信息提示',
								content: '设定值不能为空!',
							});
						}
					} else if (!(/(^-?[0-9]+$)|(^-?[0-9]+\.[0-9]+$)/g).test(values.settingValue) && !isNaN(Number(this.props.currentValue)) && this.props.dictBindString === '') { //如果当前值是空或者数字，且输入的新值为空或者非数字，则弹框警报，设置失败
						if (language == "en") {
							Modal.warning({
								title: 'Information Prompt',
								content: 'The format of the set value is incorrect!',
							});
						} else {
							Modal.warning({
								title: '信息提示',
								content: '设定值格式错误!',
							});
						}
					} else if ((this.state.isLimit === true) && (values.settingValue > this.props.pointInfo.pointInfo.hight || values.settingValue < this.props.pointInfo.pointInfo.low) && this.props.dictBindString == '') {
						if (language == "en") {
							Modal.warning({
								title: 'Information Prompt',
								content: 'The set value exceeds the high and low lines!',
							});
						} else {
							Modal.warning({
								title: '信息提示',
								content: '设定值超出高低线!'
							});
						}
					} else if (this.props.dictBindString != '') {
						for (var i = 0; i < this.props.dictBindString.length; i++) {
							for (var j = 0; j < this.props.dictBindString[i].length; j++) {
								if (this.props.dictBindString[i][j] === ':') {
									var flagStr = this.props.dictBindString[i].slice(j + 1);
									if (flagStr === values.settingValue) {
										values.settingValue = this.props.dictBindString[i].slice(0, j)
									}
								}
							}
						}
						this.props.handleOk(values, this.props.idCom);
					} else {
						this.props.handleOk(values, this.props.idCom);
					}
				}
			}
		});
	}

	getOption() {
		let dictBindString = []
		this.props.dictBindString.map((item, index) => {
			for (let i = 0; i < item.length; i++) {
				if (item[i] === ':') {
					dictBindString.push(item.slice(i + 1));
				}
			}
		})
		return dictBindString.map((item, index) => {
			return (
				<Option value={item}>{item}</Option>
			)
		})
	}

	onChangeSlider = (value) => {
		this.props.form.setFieldsValue({
			settingValue: value
		})
		this.setState({
			textValue: value
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		let { visible, currentValue, idCom, showMode } = this.props;
		const { pointInfo } = this.props.pointInfo
		const formItemLayout = {
			labelCol: {
				span: 8
			},
			wrapperCol: {
				span: 15
			},
		};
		visible = typeof visible === 'undefined' ? true : visible;
		return (
			<Modal
				title={this.props.isLoading ? language == "en" ? "Instruction Setting Progress Prompt" : '指令设置进度提示' : language == "en" ? "Confirm the Instruction" : '确认指令'}
				width={500}
				visible={visible}
				onCancel={this.props.hideModal}
				onOk={this.handleSubmit}
				maskClosable={false}
				wrapClassName={str}
				autoFocusButton
				destroyOnClose
				footer={
					this.props.isLoading ?
						[
							<Button onClick={this.props.hideModal} >{language == "en" ? "Submit" : "确认"}</Button>
						] :
						[

							<Button onClick={this.props.hideModal} >{language == "en" ? "Cancel" : "取消"}</Button>,
							<Button id="textChangeValue" onClick={this.handleSubmit} >{language == "en" ? "Submit" : "确认"}</Button>
						]
				}
			>
				{
					this.props.isLoading ?
						<Spin tip={this.props.modalConditionDict.status ? language == "en" ? "Updating the Set Value" : '正在修改设定值' : this.props.modalConditionDict.description}>
							<Alert
								message={language == "en" ? "Prompt" : "提示"}
								description={language == "en" ? "Updating data" : "数据正在更新"}
								type="info"
							/>
						</Spin>
						:
						<Form>
							{
								this.props.dictBindString != '' ?
									<FormItem
										{...formItemLayout}
										label={language == "en" ? "Current Value" : "当前值"}
									>
										{getFieldDecorator('currentValue', {
											initialValue: this.state.currentValue,
										})(
											<Input style={{ width: 160, backgroundColor: "transparent" }} disabled={true} />
										)}
									</FormItem>
									:
									<FormItem
										{...formItemLayout}
										label={language == "en" ? "Current Value" : "当前值"}
									>
										{getFieldDecorator('currentValue', {
											initialValue: currentValue,
										})(
											<Input style={{ width: 160, backgroundColor: "transparent" }} disabled={true} />
										)}
									</FormItem>
							}
							{
								showMode == 2 ?
									<FormItem
										{...formItemLayout}
										label={language == "en" ? "Set new value" : "设置新值"}
									>
										{getFieldDecorator('settingValue', {
											initialValue: currentValue == " " ? undefined : moment(currentValue, format),
										})(
											<TimePicker format={format} onChange={this.handleChangeTime} />
										)}
									</FormItem>
									:
									this.state.isLimit ?
										this.props.dictBindString != '' ?
											<FormItem
												{...formItemLayout}
												label={language == "en" ? "Set new value" : "设置新值"}
											>
												{getFieldDecorator('settingValue', {
													initialValue: this.state.currentValue,
												})(
													<Select style={{ width: 160 }} onChange={this.handleChange}>
														{this.getOption()}
													</Select>
												)}
											</FormItem>
											:
											!isNaN(Number(currentValue)) ?
												<FormItem
													{...formItemLayout}
													label={language == "en" ? "Set new value" : "设置新值"}
												>
													{getFieldDecorator('settingValue', {
														initialValue: currentValue,
													})(
														<InputNumber
															autoFocus
															ref={(input) => { input.inputNumberRef.input.select() }}
															style={{ width: 160 }}
															min={pointInfo.low}
															max={pointInfo.hight}
															precision={2}
															onChange={this.handleChange}
														/>
													)}
												</FormItem>
												:
												<FormItem
													{...formItemLayout}
													label={language == "en" ? "Set new value" : "设置新值"}
												>
													{getFieldDecorator('settingValue', {
														initialValue: currentValue,
													})(

														<Input autoFocus ref={(input) => { input.input.select() }} style={{ width: 160 }} min={pointInfo.low} max={pointInfo.hight} />
													)}
												</FormItem>


										:
										this.props.dictBindString != '' ?
											<FormItem
												{...formItemLayout}
												label={language == "en" ? "Set new value" : "设置新值"}
											>
												{getFieldDecorator('settingValue', {
													initialValue: this.state.currentValue,
												})(
													<Select style={{ width: 160 }} onChange={this.handleChange}>
														{
															this.getOption()
														}
													</Select>
												)}
												<span style={{ color: 'red' }}>
													&nbsp;&nbsp;{this.state.currentValue == "" ? "请检查枚举模式配置" : ""}
												</span>
											</FormItem>
											:
											!isNaN(Number(currentValue)) ?
												<FormItem
													{...formItemLayout}
													label={language == "en" ? "Set new value" : "设置新值"}
												>
													{getFieldDecorator('settingValue', {
														initialValue: currentValue,
													})(
														<InputNumber
															//自动聚焦
															autoFocus
															//自动全选
															ref={(input) => { input.inputNumberRef.input.select() }}
															style={{ width: 160 }}
															precision={2}
															onChange={this.handleChange}
														/>
													)}
												</FormItem>
												:
												<FormItem
													{...formItemLayout}
													label={language == "en" ? "Set new value" : "设置新值"}
												>
													{getFieldDecorator('settingValue', {
														initialValue: currentValue,
													})(
														< Input autoFocus ref={(input) => { input.input.select() }} onChange={this.handleChange} style={{ width: 160 }} />
													)}
												</FormItem>
							}
							{
								showMode != 2 ?
									this.props.dictBindString != '' ?
										''
										:
										this.state.isLimit ?
											pointInfo && pointInfo.hight !== undefined && pointInfo.low !== undefined && pointInfo.hight !== '' && pointInfo.low !== '' ?
												<FormItem
													{...formItemLayout}
													label={language == "en" ? "Sliding Assignment" : "滑动赋值"}
												>
													<Slider
														marks={{
															[pointInfo.low]: { label: pointInfo.low },
															[pointInfo.hight]: { label: pointInfo.hight }
														}}
														max={
															pointInfo.hight
														}
														min={
															pointInfo.low
														}
														step={(pointInfo.hight - pointInfo.low) > 10 ? 1 : 0.1}
														onChange={this.onChangeSlider}
														defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
													/>
												</FormItem>
												:
												pointInfo && pointInfo.hight !== undefined && pointInfo.hight !== '' ?
													<FormItem
														{...formItemLayout}
														label={language == "en" ? "Sliding Assignment" : "滑动赋值"}
													>
														<Slider
															marks={{
																[Math.floor(Number(currentValue) * 0.9)]: { label: Math.floor(Number(currentValue) * 0.9) },
																[pointInfo.hight]: { label: pointInfo.hight }
															}}
															max={
																pointInfo.hight
															}
															min={
																Math.floor(Number(currentValue) * 0.9)
															}
															step={(pointInfo.hight - Math.floor(Number(currentValue) * 0.9)) > 10 ? 1 : 0.1}
															onChange={this.onChangeSlider}
															defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
														/>
													</FormItem>
													:
													pointInfo && pointInfo.low !== undefined && pointInfo.low !== '' ?
														<FormItem
															{...formItemLayout}
															label={language == "en" ? "Sliding Assignment" : "滑动赋值"}
														>
															<Slider
																marks={{
																	[pointInfo.low]: { label: pointInfo.low },
																	[Math.ceil(Number(currentValue) * 1.1 == 0 ? 1 : Number(currentValue) * 1.1)]: { label: Math.ceil(Number(currentValue) * 1.1 == 0 ? 1 : Number(currentValue) * 1.1) }
																}}
																max={
																	Math.ceil(Number(currentValue) * 1.1 == 0 ? 1 : Number(currentValue) * 1.1)
																}
																min={
																	pointInfo.low
																}
																step={(Math.ceil(Number(currentValue) * 1.1) - pointInfo.low) > 10 ? 1 : 0.1}
																onChange={this.onChangeSlider}
																defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
															/>
														</FormItem>
														:
														''
											:
											<FormItem
												{...formItemLayout}
												label={language == "en" ? "Sliding Assignment" : "滑动赋值"}
											>
												{
													currentValue >= 0 ?
														<Slider
															marks={
																idCom.indexOf('VSDFreqSetting') != -1 && currentValue == 0 ?
																	{
																		[50]: { label: 50 },
																		[20]: { label: 20 }
																	}
																	:
																	{
																		[Math.floor(Number(currentValue) * 0.9)]: { label: Math.floor(Number(currentValue) * 0.9) },
																		[Math.ceil(Number(currentValue) * 1.1 == 0 ? 1 : Number(currentValue) * 1.1)]: { label: Math.ceil(Number(currentValue) * 1.1 == 0 ? 1 : Number(currentValue) * 1.1) }
																	}}
															max={
																idCom.indexOf('VSDFreqSetting') != -1 && currentValue == 0 ?
																	50
																	:
																	Math.ceil(Number(currentValue) * 1.1 == 0 ? 1 : Number(currentValue) * 1.1)
															}
															min={
																idCom.indexOf('VSDFreqSetting') != -1 && currentValue == 0 ?
																	20
																	:
																	Math.floor(Number(currentValue) * 0.9)
															}
															step={0.1}
															onChange={this.onChangeSlider}
															defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
														/>
														:
														<Slider
															marks={{
																[Math.floor(Number(currentValue) * 1.1)]: { label: Math.floor(Number(currentValue) * 1.1) },
																[Math.ceil(Number(currentValue) * 0.9)]: { label: Math.ceil(Number(currentValue) * 0.9) }
															}}
															max={
																Math.ceil(Number(currentValue) * 0.9)
															}
															min={
																Math.floor(Number(currentValue) * 1.1)
															}
															step={0.1}
															onChange={this.onChangeSlider}
															defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
														/>
												}

											</FormItem>
									:
									''
							}
						</Form>
				}
			</Modal>
		);
	}
}
// 注：Form.create方法会自动收集数据并进行处理
const OptimizeValueModal = Form.create()(SettingValueModal);

export default OptimizeValueModal


