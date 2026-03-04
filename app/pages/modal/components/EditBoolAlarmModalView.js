import React from 'react';
import { Modal, Select, Form, Input, Button, Col, Row, Checkbox, Icon, message } from 'antd'
import s from './EditBoolAlarmModalView.css'
import http from '../../../common/http';
import 'codemirror/mode/python/python';
import appConfig from '../../../common/appConfig';

const language = appConfig.language;
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;
const ModalInfo = Modal.info

const formItemLayout = {
    labelCol: {
        sm: { span: 4 },
    },
    wrapperCol: {
        sm: { span: 20 },
    },
};

const formItemInfo = {
    labelCol: {
        sm: { span: language == 'en' ? 6 : 4 },
    },
    wrapperCol: {
        sm: { span: language == 'en' ? 18 : 20 },
    },
};


const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
    },
};

class EditBoolAlarmModalView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            type: "1"
        }
    }


    //报警配置的方法
    handleModalHide(e) { //关闭模态窗并添加报警配置
        const { form } = this.props
        const { validateFields, getFieldsValue } = form
        const valueList = getFieldsValue()
        const { type } = this.state
        validateFields(['pointname', 'warningGroup', 'boolWarningLevel', "boolWarningInfo", "ofDepartment", "script", "ofPosition", "ofGroup", "ofSystem", "tag"], (err, value) => {
            if (!err) {
                http.post('/warningConfig/edit', {
                    "pointname": value.pointname,
                    "boolWarningLevel": Number(valueList.boolWarningLevel),
                    "warningGroup": value.warningGroup,
                    "boolWarningInfo": valueList.boolWarningInfo,
                    "type": 1,
                    "hhenable": 0,
                    "henable": 0,
                    "llenable": 0,
                    "lenable": 0,
                    "hhlimit": "0",
                    "hlimit": "0",
                    "llimit": "0",
                    "lllimit": "0",
                    "hhinfo": "布尔报警",
                    "hinfo": "布尔报警",
                    "llinfo": "布尔报警",
                    "linfo": "布尔报警",
                    "ofPosition": valueList.ofPosition ? valueList.ofPosition : '',
                    "ofDepartment": valueList.ofDepartment ? valueList.ofDepartment : '',
                    "ofGroup": valueList.ofGroup ? valueList.ofGroup : '',
                    "ofSystem": valueList.ofSystem ? valueList.ofSystem : '',
                    "tag": valueList.tag ? valueList.tag : '',
                    "EnabledScript_BOOL": valueList.EnabledScript_BOOL ? valueList.EnabledScript_BOOL : '',
                    lan: language
                }).then(
                    data => {
                        if (!data.err) {
                            Modal.success({
                                title: language == 'en' ? 'Tip' : '信息提示',
                                content: language == 'en' ? 'Modification succeeded.' : '修改成功'
                            })
                            this.props.hideModal();
                        } else {
                            Modal.error({
                                title: language == 'en' ? 'Tip' : '信息提示',
                                content: language == 'en' ? 'Modification failed.' : '修改失败'
                            })
                        }
                    }
                )
            }
        })
        e.preventDefault()
    }


    //表单校验
    pointnameValidate = (rule, value, callback) => {
        if (value) {
            callback()
            return
        }
        callback(language == 'en' ? 'Please fill in the point name. ' : '请填写点名')
    }

    boolWarningLevelValidate = (rule, value, callback) => {
        if (value) {
            callback()
            return
        }
        callback(language == 'en' ? 'Please fill in the alarm level. ' : '请填写报警等级')
    }

    warningGroupValidate = (rule, value, callback) => {
        if (value) {
            callback()
            return
        }
        callback(language == 'en' ? 'Please fill in the group. ' : '请填写分组')
    }

    boolWarningInfoValidate = (rule, value, callback) => {
        if (value) {
            callback()
            return
        }
        callback(language == 'en' ? 'Please fill in the alarm information.' : '请填写报警信息')
    }

    showText() {
        ModalInfo({
            title: language == 'en' ? 'Enable Script Example' : '使能脚本示例',
            content: (
                <div>
                    <div style={{ userSelect: "text" }}>
                        {language == 'en' ? 'Example 1: Enable alarm detection only during daytime 10:00-19:00, and non-weekends' : '示范1：仅在白天10：00-19：00，且非周末使能该报警检测'}
                        datetime.now().hour {'>'}=10 and datetime.now().hour{'<'}=19 and datetime.now().isoweekday(){'<'}=5
                    </div >
                    <div style={{ userSelect: "text" }}>
                        {language == 'en' ? 'Example 2: Enable alarm detection only when both chiller and chilled water pump are running (unit count point can use Plant01NumberChRunning)' : '示范2：仅在冷机和冷冻泵都运行时（台数点位可以用Plant01NumberChRunning）使能该报警检测'}
                        {'<%'}Plant01NumberChRunning{'%>'}{'>'}0 and {'<%'}Plant01NumberPriChWPRunning{'%>'}{'>'}0
                    </div>
                </div>

            ),
            onOk() { }
        })
    }

    //测试公式
    modifyPointDescription = (str) => {
        let script = this.props.form.getFieldValue(str);
        http.post('/tool/evalStringExpression', {
            "str": script,
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

    //渲染组件
    render() {
        let {
            visible,
            hideModal
        } = this.props

        const { getFieldDecorator } = this.props.form;
        visible = typeof visible === 'undefined' ? true : visible;
        return (
            <Modal
                title={language == 'en' ? 'Edit Boolean Alarm' : '修改布尔报警'}
                visible={visible}
                onCancel={hideModal}
                footer={null}
                destroyOnClose={true}
                maskClosable={false}
                width={language == 'en' ? 750 : 550}
            >
                <Form
                    onSubmit={(e) => { this.handleModalHide(e) }}
                >
                    <Row gutter={60} style={{ marginLeft: -78 }}>
                        <Col span={24} >
                            <FormItem
                                label={language == 'en' ? 'Point Name' : '点名'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('pointname', {
                                })(
                                    <Input disabled />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ marginLeft: -38 }}>
                        <Col span={24} style={{ marginLeft: language == 'en' ? -34 : '' }}>
                            <FormItem
                                label={language == 'en' ? 'Alarm Level' : '报警等级'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('boolWarningLevel', {
                                    initialValue: "2",
                                    rules: [{
                                        required: true
                                    }]
                                })(
                                    <Select>
                                        <Option value='1' >{language == 'en' ? 'General' : '一般'}</Option>
                                        <Option value='2' >{language == 'en' ? 'Moderate' : '较重'}</Option>
                                        <Option value='3' >{language == 'en' ? 'Severe' : '严重'}</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        {/* <Col span={24} >
                            <FormItem
                                label='自定义分组'
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('warningGroup', {
                                    rules: [{
                                        pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/,
                                        required: true,
                                        message: '可填写大小写字母／数字／汉字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写自定义分组')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col> */}
                    </Row>
                    <Row gutter={60} style={{ marginLeft: -50 }}>
                        <Col span={24} >
                            <FormItem
                                label={language == 'en' ? 'Alarm Location' : '报警位置'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofPosition', {
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label={language == 'en' ? 'Department' : '部门'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofDepartment', {
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={language == 'en' ? 'Group' : '分组'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofGroup', {
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label={language == 'en' ? 'System' : '系统'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofSystem', {
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={language == 'en' ? 'Tag' : '标签'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('tag', {
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ paddingLeft: 20, marginLeft: -60 }}>
                        <Col span={24} >
                            <FormItem
                                label={language == 'en' ? 'Alarm Information' : '报警信息'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('boolWarningInfo', {
                                    rules: [{

                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(language == 'en' ? 'Please fill in alarm information' : '请填写报警信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ paddingLeft: 20, marginLeft: language == 'en' ? -140 : -70 }}>
                        <Col >
                            <FormItem
                                label={language == 'en' ? 'Enable Script' : '使能脚本'}
                                className={s['row-margin-min']}
                                {...formItemInfo}
                            >
                                <Col span={21}>
                                    {getFieldDecorator('EnabledScript_BOOL', {
                                        initialValue: '',
                                    })(
                                        <Input />
                                    )}
                                </Col>
                                <Col span={1}>
                                    <Button size='small' type='link' shape='circle' icon='question-circle' onClick={this.showText}></Button>
                                </Col>
                                <Col span={2} style={{ paddingLeft: 5 }}>
                                    <Button size='small' onClick={() => this.modifyPointDescription("EnabledScript_BOOL")}>{language == 'en' ? 'Test' : '试算'}</Button>
                                </Col>
                            </FormItem>
                        </Col>
                    </Row>
                    <FormItem
                        {...formItemLayoutWithOutLabel}
                    >
                        <Button onClick={hideModal} className={s['cancel-btn']} >{language == 'en' ? 'Cancel' : '取消'}</Button>
                        <Button type="primary" htmlType='submit'>{language == 'en' ? 'Confirm' : '确认'}</Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}



const EditBoolAlarmModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            pointname: Form.createFormField({
                value: props.pointname
            }),
            boolWarningLevel: Form.createFormField({
                value: String(props.boolWarningLevel)
            }),
            warningGroup: Form.createFormField({
                value: props.warningGroup
            }),
            boolWarningInfo: Form.createFormField({
                value: props.boolWarningInfo !== '' ? props.boolWarningInfo : '暂无'
            }),
            ofPosition: Form.createFormField({
                value: props.ofPosition
            }),
            ofDepartment: Form.createFormField({
                value: props.ofDepartment
            }),
            ofGroup: Form.createFormField({
                value: props.ofGroup
            }),
            ofSystem: Form.createFormField({
                value: props.ofSystem
            }),
            tag: Form.createFormField({
                value: props.tag
            }),
            EnabledScript_BOOL: Form.createFormField({
                value: props.EnabledScript_BOOL
            })
        }
    }
})(EditBoolAlarmModalView);


export default EditBoolAlarmModal