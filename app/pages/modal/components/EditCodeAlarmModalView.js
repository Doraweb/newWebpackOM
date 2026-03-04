import React from 'react';
import { Modal, Spin, Alert, InputNumber, Select, Form, Input, Button, Col, Row, Checkbox, Icon, message } from 'antd'
import s from './EditCodeAlarmModalView.css'
import cx from 'classnames';
import http from '../../../common/http';
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/python/python';
import appConfig from '../../../common/appConfig';

const language = appConfig.language;
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;
const codeMirrorOptions = {
    lineNumbers: true,
    extraKeys: {
        Tab: function (cm) {
            if (cm.getSelection().length) {
                CodeMirror.commands.indentMore(cm);
            } else {
                cm.replaceSelection(TAB);
            }
        }
    },
    mode: 'python'
};


const formItemLayout = {
    labelCol: {
        xs: { span: language == 'en' ? 9 : 8 },
        sm: { span: language == 'en' ? 6 : 5 },
    },
    wrapperCol: {
        xs: { span: 16 },
        sm: { span: 17 },
    },
};

const formItemInfo = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: language == 'en' ? 10 : 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: language == 'en' ? 14 : 18 },
    },
};

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
    },
};
class EditCodeAlarmModalView extends React.Component {

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
        validateFields(['pointname', 'warningGroup', 'boolWarningLevel', "boolWarningInfo", "ofDepartment", "script", "ofPosition", "ofGroup", "ofSystem", "tag"], (err, value) => {
            if (!err) {
                http.post('/warningConfig/edit', {
                    "pointname": value.pointname,
                    "boolWarningLevel": Number(valueList.boolWarningLevel),
                    "warningGroup": value.warningGroup,
                    "boolWarningInfo": valueList.boolWarningInfo,
                    "type": 3,
                    "script": valueList.script,
                    "ofPosition": valueList.ofPosition ? valueList.ofPosition : '',
                    "ofDepartment": valueList.ofDepartment ? valueList.ofDepartment : '',
                    "ofGroup": valueList.ofGroup ? valueList.ofGroup : '',
                    "ofSystem": valueList.ofSystem ? valueList.ofSystem : '',
                    "tag": valueList.tag ? valueList.tag : '',
                    "id": this.props.id,
                    lan: language
                }).then(
                    data => {
                        if (!data.err) {
                            Modal.success({
                                title: language == 'en' ? 'Tip' : '信息提示',
                                content: language == 'en' ? 'Modified successfully' : '修改成功'
                            })
                            this.props.hideModal();
                        } else {
                            Modal.error({
                                title: language == 'en' ? 'Warning' : '信息提示',
                                content: language == 'en' ? 'Modification failed' : '修改失败'
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

    showRuleExample = () => {
        Modal.info({
            width: 450,
            content: <TextArea readOnly autoSize={{ minRows: 9, maxRows: 18 }}
                value={
                    language == 'en' ?
                        `Method 1: return + Python logical expression (Note: add "return " before the rule (return + a space))
 Example: Script to trigger alarm when chilled water supply temperature exceeds 12 degrees:
 return 1 if <%PriChWTempSupply01%> > 12 else 0
 
 Method 2: Multi-line Python if statement
 Example: Script to trigger alarm when chilled water supply temperature exceeds 12 degrees:
 if <%PriChWTempSupply01%> > 12:
     return True
 else:
     return False
                 ` :
                        `写法1：return + Python逻辑表达式  (注：规则前需加“return ”  (return + 一个空格） )
 示例：当冷冻总管供水温度超过12度时触发报警的脚本：
 return 1 if <%PriChWTempSupply01%> > 12 else 0
 
 写法2：多行Python if 判断语句
 示例：当冷冻总管供水温度超过12度时触发报警的脚本：
 if <%PriChWTempSupply01%> > 12:
     return True
 else:
     return False
                 `} />
        })
    }
    checkJson = () => {
        const script = this.props.form.getFieldValue('script')
        if (script != "") {
            http.post('/warning/testScript', {
                script: script
            }).then(
                data => {
                    if (data.err) {
                        Modal.error({
                            title: language == 'en' ? 'Test Error' : '测试错误',
                            content: data.msg
                        });
                    } else {
                        Modal.info({
                            title: language == 'en' ? 'Test Result' : '测试结果',
                            content: String(data.data) === "false" ? (language == 'en' ? "return False No alarm" : "return False 无报警") : (String(data.data) === "true" ? (language == 'en' ? "return True Alarm" : "return True 报警") : (language == 'en' ? "Script calculation failed" : "脚本计算失败"))
                        });
                    }
                }
            ).catch(
                error => {
                    Modal.error({
                        title: language == 'en' ? 'Request Error' : '请求错误',
                        content: language == 'en' ? "Server communication error!" : "服务器通讯出错！"
                    });
                }
            )
        } else {
            Modal.info({
                title: language == 'en' ? 'Tip' : '提示',
                content: language == 'en' ? "Rule script cannot be empty!" : "规则脚本不能为空！"
            });
        }
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
                title={language == 'en' ? 'Edit Rule-based Alarm' : '修改规则报警'}
                visible={visible}
                onCancel={hideModal}
                destroyOnClose={true}
                footer={null}
                maskClosable={false}
                width={550}
            >
                <Form
                    onSubmit={(e) => { this.handleModalHide(e) }}
                >
                    <Row gutter={60} >
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
                    <Row gutter={60} >
                        <Col span={24}>
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
                                    rules: [{}]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col> */}
                    </Row>
                    <Row gutter={60} >
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
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label={language == 'en' ? 'Alarm Information' : '报警信息'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('boolWarningInfo', {
                                    rules: [{}]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem label={language == 'en' ? 'Rule Script' : '规则脚本'} className={s['row-margin']}>
                                {getFieldDecorator('script', {
                                    initialValue: '',
                                    rules: [{ required: true, message: language == 'en' ? 'Rule script cannot be empty!' : '规则脚本不能为空！' }]
                                })(
                                    <CodeEditor />
                                )}
                            </FormItem>
                            <Button style={{ position: 'absolute', left: 115, bottom: 340 }} size='small' onClick={this.showRuleExample}>{language == 'en' ? 'Script Example' : '脚本示例'}</Button>
                            <Button style={{ position: 'absolute', left: language == 'en' ? 230 : 198, bottom: 340 }} size='small' onClick={this.checkJson}>{language == 'en' ? 'Script Test' : '脚本测试'}</Button>
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



const EditCodeAlarmModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            pointname: Form.createFormField({
                value: props.pointname
            }),
            script: Form.createFormField({
                value: props.script
            }),
            boolWarningLevel: Form.createFormField({
                value: String(props.boolWarningLevel)
            }),
            warningGroup: Form.createFormField({
                value: props.warningGroup
            }),
            boolWarningInfo: Form.createFormField({
                value: props.boolWarningInfo
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
            })
        }
    }
})(EditCodeAlarmModalView);

class CodeEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            script: this.props.value || ''
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(value) {
        const onChange = this.props.onChange;

        if (!('value' in this.props)) {
            this.setState({
                script: value
            });
        }

        if (onChange) {
            onChange(value);
        }
    }

    componentWillReceiveProps(nextProps) {
        if ('value' in nextProps) {
            const value = nextProps.value;
            this.setState({
                script: value
            });
        }
    }

    render() {
        return (
            <CodeMirror
                value={this.state.script}
                className={cx(s['editor'], 'ant-input')}
                options={codeMirrorOptions}
                onChange={this.handleChange}
            />
        );
    }
}

export default EditCodeAlarmModal