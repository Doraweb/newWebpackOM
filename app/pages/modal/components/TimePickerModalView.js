/**
 * 制冷系统的优化控制信息设定值模态框
 */
import React from 'react';
import { Modal, Form, Spin, Alert, Input, Button, DatePicker, TimePicker } from 'antd'
import moment from 'moment'
import appConfig from '../../../common/appConfig';

const FormItem = Form.Item;

class SettingValueModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLimit: false,
            language: appConfig.language,
        };

        this.translations = {
            '修改日期': 'Modify Date',
            '修改时间': 'Modify Time',
            '修改日期时间': 'Modify DateTime',
            '指令设置进度提示': 'Command Setting Progress',
            '确认指令': 'Confirm Command',
            '确认': 'Confirm',
            '取消': 'Cancel',
            '正在修改设定值': 'Modifying setting value',
            '数据正在更新': 'Data is being updated',
            '提示': 'Notification',
            '点名': 'Point Name',
            '释义': 'Description'
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getPicker = this.getPicker.bind(this);
    }

    componentDidMount() {
        const { setFieldsValue } = this.props.form
        if (localStorage.getItem('allPointList')) {
            const allPointList = JSON.parse(localStorage.getItem('allPointList'))
            for (let i = 0; i < allPointList.length; i++) {
                if (allPointList[i]['name'] == this.props.name) {
                    setFieldsValue({
                        desc: allPointList[i]['description']
                    })
                    break
                }
            }
        } else {
            setFieldsValue({
                desc: this.props.name
            })
        }
        setFieldsValue({
            settingTime: moment(this.props.value, this.props.timeFormat)
        })
        setFieldsValue({
            point: this.props.name
        })
    }

    //点击确定，提交
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.handleOk(values, this.props.name, this.props.timeFormat);
            }
        });
    }

    onChange(value) {
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            settingTime: moment(value)
        })
    }

    getPicker(formItemLayout, getFieldDecorator) {
        //timeFixed=1,仅日期 
        if (this.props.timeFixed == 1) {
            return (
                <FormItem
                    {...formItemLayout}
                    label={this.state.language === 'en' ? this.translations['修改日期'] : "修改日期"}
                >
                    {getFieldDecorator('settingTime', {
                    })(
                        <DatePicker
                            style={{ width: 160 }}
                            format={this.props.timeFormat}
                            placeholder="Select Date"
                            onChange={this.onChange}
                        />
                    )}
                </FormItem>
            )
        } else {
            //timeFixed=2,仅时间
            if (this.props.timeFixed == 2) {
                return (
                    <FormItem
                        {...formItemLayout}
                    label={this.state.language === 'en' ? this.translations['修改时间'] : "修改时间"}
                    >
                        {getFieldDecorator('settingTime', {
                        })(
                            <TimePicker
                                style={{ width: 160 }}
                                format={this.props.timeFormat}
                                placeholder="Select Time"
                                onChange={this.onChange}
                            />
                        )}
                    </FormItem>
                )
            } else {
                return (
                    <FormItem
                        {...formItemLayout}
                    label={this.state.language === 'en' ? this.translations['修改日期时间'] : "修改日期时间"}
                    >
                        {getFieldDecorator('settingTime', {
                        })(
                            <DatePicker
                                style={{ width: 160 }}
                                showTime
                                format={this.props.timeFormat}
                                placeholder="Select Date"
                                onChange={this.onChange}
                            />
                        )}
                    </FormItem>
                )
            }
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let { visible } = this.props;
        const formItemLayout = {
            labelCol: {
                span: 6
            },
            wrapperCol: {
                span: 16
            },
        };
        visible = typeof visible === 'undefined' ? true : visible;
        let description
        if (this.props.pointInfo) {
            if (this.props.pointInfo.hight > this.props.pointInfo.low) {  //判断有无高低限
                this.setState({
                    isLimit: true
                })
            };
            description = this.props.pointInfo && this.props.pointInfo.description
        }

        return (
            <Modal
                title={this.props.isLoading ? 
                    (this.state.language === 'en' ? this.translations['指令设置进度提示'] : '指令设置进度提示') : 
                    (this.state.language === 'en' ? this.translations['确认指令'] : '确认指令')}
                width={400}
                visible={visible}
                onCancel={this.props.hideModal}
                onOk={this.handleSubmit}
                maskClosable={false}
                footer={
                    this.props.isLoading ?
                        [
                            <Button onClick={this.handleSubmit} >{this.state.language === 'en' ? this.translations['确认'] : "确认"}</Button>
                        ] :
                        [

                            <Button onClick={this.props.hideModal} >{this.state.language === 'en' ? this.translations['取消'] : "取消"}</Button>,
                            <Button onClick={this.handleSubmit} >{this.state.language === 'en' ? this.translations['确认'] : "确认"}</Button>
                        ]
                }
            >
                {
                    this.props.isLoading ?
                        <Spin tip={this.props.modalConditionDict.status ? 
                            (this.state.language === 'en' ? this.translations['正在修改设定值'] : '正在修改设定值') : 
                            this.props.modalConditionDict.description}>
                            <Alert
                                message={this.state.language === 'en' ? this.translations['提示'] : "提示"}
                                description={this.state.language === 'en' ? this.translations['数据正在更新'] : "数据正在更新"}
                                type="info"
                            />
                        </Spin>
                        :
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label={this.state.language === 'en' ? this.translations['点名'] : "点名"}
                            >
                                {getFieldDecorator('point', {
                                })(
                                    <Input disabled style={{ color: '#eee' }} />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={this.state.language === 'en' ? this.translations['释义'] : "释义"}
                            >
                                {getFieldDecorator('desc', {
                                })(
                                    <Input disabled style={{ color: '#eee' }} />
                                )}
                            </FormItem>
                            <div style={{ marginBottom: -26 }}>
                                {
                                    this.getPicker(formItemLayout, getFieldDecorator)
                                }
                            </div>
                        </Form>
                }
            </Modal>
        );
    }
}
// 注：Form.create方法会自动收集数据并进行处理
const TimePickerModal = Form.create()(SettingValueModal);

export default TimePickerModal


