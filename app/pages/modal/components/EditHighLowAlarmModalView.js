import React from 'react';
import { Modal, Select, Form, Input, Button, Col, Row, Checkbox, message } from 'antd'
import s from './EditHighLowAlarmModalView.css'
import http from '../../../common/http';
import 'codemirror/mode/python/python';
import appConfig from '../../../common/appConfig';

const language = appConfig.language
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;
const ModalInfo = Modal.info

// 统一表单布局配置
const formLayouts = {
    formItemLayout: {
        labelCol: { sm: { span: 4 } },
        wrapperCol: { sm: { span: 20 } },
    },
    formItemLayoutInfo: {
        labelCol: { sm: { span: language === 'en' ? 7 : 5 } },
        wrapperCol: { sm: { span: language === 'en' ? 17 : 19 } },
    },
    formItemLayoutNum: {
        labelCol: { sm: { span: language === 'en' ? 18 : 16 } },
        wrapperCol: { sm: { span: language === 'en' ? 6 : 8 } },
    },
    formItemInfo: {
        labelCol: { sm: { span: language === 'en' ? 6 : 4 } },
        wrapperCol: { sm: { span: language === 'en' ? 18 : 20 } },
    },
    formItemLayout4: {
        labelCol: { sm: { span: 3 } },
        wrapperCol: { sm: { span: 21 } },
    },
    formItemLayout3: {
        labelCol: { sm: { span: 4 } },
        wrapperCol: { sm: { span: 20 } },
    },
    formItemLayout2: {
        labelCol: { sm: { span: language === 'en' ? 1 : 3 } },
        wrapperCol: { sm: { span: language === 'en' ? 23 : 21 } },
    },
    formItemLayoutWithOutLabel: {
        wrapperCol: {
            xs: { span: 24, offset: 0 },
            sm: { span: 16, offset: language === 'en' ? 10 : 8 },
        },
    },
};

class HighLowAlarmModalView extends React.Component {
    constructor(props) {
        super(props);
        this.state = { id: null };
    }

    // 报警配置提交方法
    handleModalHide = (e) => {
        e.preventDefault();
        const { form } = this.props;
        const { validateFields, getFieldsValue } = form;

        validateFields((err, value) => {
            if (err) return;

            const valueList = getFieldsValue();
            const postData = {
                pointname: value.pointname,
                boolWarningLevel: 2,
                warningGroup: value.warningGroup,
                boolWarningInfo: language === 'en' ? 'See alarm editing for details' : "详情见报警编辑",
                type: 0,
                hhenable: valueList.hhenable ? 1 : 0,
                henable: valueList.henable ? 1 : 0,
                llenable: valueList.llenable ? 1 : 0,
                lenable: valueList.lenable ? 1 : 0,
                hhlimit: valueList.hhlimit || '',
                hlimit: valueList.hlimit || '',
                llimit: valueList.llimit || '',
                lllimit: valueList.lllimit || '',
                hhinfo: valueList.hhinfo || '',
                hinfo: valueList.hinfo || '',
                llinfo: valueList.llinfo || '',
                linfo: valueList.linfo || '',
                ofPosition: valueList.ofPosition || '',
                ofDepartment: valueList.ofDepartment || '',
                ofGroup: valueList.ofGroup || '',
                ofSystem: valueList.ofSystem || '',
                tag: valueList.tag || '',
                EnabledScript_HH: valueList.EnabledScript_HH || '',
                EnabledScript_H: valueList.EnabledScript_H || '',
                EnabledScript_L: valueList.EnabledScript_L || '',
                EnabledScript_LL: valueList.EnabledScript_LL || '',
                lan: language,
            };

            http.post('/warningConfig/edit', postData)
                .then((data) => {
                    if (!data.err) {
                        Modal.success({
                            title: language === 'en' ? 'Tip' : '信息提示',
                            content: language === 'en' ? 'Modification succeeded.' : '修改成功',
                        });
                        this.props.hideModal();
                    } else {
                        Modal.error({
                            title: language === 'en' ? 'Tip' : '信息提示',
                            content: language === 'en' ? 'Modification failed.' : '修改失败',
                        });
                    }
                });
        });
    };

    // 通用校验方法
    requiredValidate = (rule, value, callback) => {
        if (value && value.toString().trim()) {
            callback();
            return;
        }
        callback(language === 'en' ? 'Required' : '必填项');
    };

    // 点名校验
    pointnameValidate = (rule, value, callback) => {
        if (value && value.toString().trim()) {
            callback();
            return;
        }
        callback(language === 'en' ? 'Please fill in the point name' : '请填写点名');
    };

    // 报警等级校验
    boolWarningLevelValidate = (rule, value, callback) => {
        if (value) {
            callback();
            return;
        }
        callback(language === 'en' ? 'Please fill in the alarm level.' : '请填写报警等级');
    };


    // 启用报警时的联动校验（信息必填）
    alarmInfoValidator = (enableField, infoField) => (rule, value, callback) => {
        const { form } = this.props;
        const enableValue = form.getFieldValue(enableField);

        // 如果启用了报警，但信息为空
        if (enableValue && (!value || value.toString().trim() === '')) {
            callback(language === 'en' ? 'Required' : '必填项');
            return;
        }
        callback();
    };

    // 启用报警时的数值校验
    alarmValueValidator = (enableField) => (rule, value, callback) => {
        const { form } = this.props;
        const enableValue = form.getFieldValue(enableField);

        // 如果启用了报警，校验数值
        if (enableValue) {
            if (!value || value.toString().trim() === '') {
                callback(language === 'en' ? 'Value' : '数值');
                return;
            }
            // 数值格式校验
            if (!/^-?\d+(\.\d+)?$/.test(value.toString().trim())) {
                callback(language === 'en' ? 'Value' : '数值');
                return;
            }
        }
        callback();
    };

    // 显示规则示例
    showRuleExample = () => {
        Modal.info({
            width: 450,
            content: (
                <TextArea
                    readOnly
                    autoSize={{ minRows: 9, maxRows: 18 }}
                    value={`写法1：return + Python逻辑表达式  (注：规则前需加“return ”  (return + 一个空格） )
示例：当冷冻总管供水温度超过12度时触发报警的脚本：
return 1 if <%PriChWTempSupply01%> > 12 else 0

写法2：多行Python if 判断语句
示例：当冷冻总管供水温度超过12度时触发报警的脚本：
if <%PriChWTempSupply01%> > 12:
    return True
else:
    return False
        `}
                />
            ),
        });
    };

    // 显示使能脚本示例
    showText = () => {
        ModalInfo({
            title: language === 'en' ? 'Enable Script Example' : '使能脚本示例',
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
            onOk: () => { },
        });
    };

    // 测试公式
    modifyPointDescription = (str) => {
        const script = this.props.form.getFieldValue(str);
        if (!script) {
            Modal.warning({
                title: language === 'en' ? 'Tip' : '提示',
                content: language === 'en' ? 'Please enter script content' : '请输入脚本内容',
            });
            return;
        }

        http.post('/tool/evalStringExpression', { str: script, debug: 1 })
            .then((data) => {
                if (data.err >= 0) {
                    Modal.info({
                        title: language === 'en' ? 'Test Information' : '测试信息',
                        content: (
                            <div>
                                <p>{language === 'en' ? 'Calculation result:' : '计算结果为：'}{data.data}</p>
                                <TextArea autoSize={{ minRows: 9, maxRows: 18 }} value={data.debugInfo} />
                            </div>
                        ),
                    });
                } else {
                    Modal.error({
                        title: language === 'en' ? 'Tip' : '提示',
                        content: language === 'en' ? 'Communication failed, please try again later.' : '通讯失败,请稍后再试',
                    });
                }
            })
            .catch(() => {
                Modal.error({
                    title: language === 'en' ? 'Tip' : '提示',
                    content: language === 'en' ? 'Request error' : '请求出错',
                });
            });
    };

    // 渲染组件
    render() {
        const { visible, hideModal, form } = this.props;
        const { getFieldDecorator } = form;
        const isVisible = typeof visible === 'undefined' ? true : visible;
        const {
            formItemLayout, formItemLayoutInfo, formItemLayoutNum,
            formItemInfo, formItemLayout2, formItemLayoutWithOutLabel
        } = formLayouts;

        return (
            <Modal
                title={language === 'en' ? 'Edit High-Low Limit Alarm' : '修改高低限报警'}
                visible={isVisible}
                onCancel={hideModal}
                footer={null}
                maskClosable={false}
                width={language === 'en' ? 1200 : 1000}
            >
                <Form onSubmit={this.handleModalHide}>
                    {/* 点名 */}
                    <Row gutter={60} style={{ marginLeft: '-157px' }}>
                        <Col span={24}>
                            <FormItem
                                label={language === 'en' ? 'Point Name' : '点名'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('pointname', {
                                    rules: [{ validator: this.pointnameValidate }],
                                })(<Input disabled />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 报警等级和自定义分组 */}
                    <Row gutter={60} style={{ marginLeft: '-106px' }}>
                        <Col span={24} style={{ marginLeft: language === 'en' ? '-42px' : '' }}>
                            <FormItem
                                label={language === 'en' ? 'Alarm Level' : '报警等级'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('boolWarningLevel', {
                                    rules: [{ validator: this.boolWarningLevelValidate }],
                                })(
                                    <Select>
                                        <Option value="1">{language === 'en' ? 'General' : '一般'}</Option>
                                        <Option value="2">{language === 'en' ? 'Moderate' : '较重'}</Option>
                                        <Option value="3">{language === 'en' ? 'Severe' : '严重'}</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24} style={{ marginLeft: '-3px' }}>
                            <FormItem
                                label={language === 'en' ? 'Custom Grouping' : '自定义分组'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('warningGroup', {
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 报警位置 */}
                    <Row gutter={60} style={{ marginLeft: '-127px' }}>
                        <Col span={24}>
                            <FormItem
                                label={language === 'en' ? 'Alarm Location' : '报警位置'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofPosition')(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 部门、分组、系统、标签 */}
                    <Row gutter={60} style={{ marginLeft: '-56px' }}>
                        <Col span={12}>
                            <FormItem
                                label={language === 'en' ? 'Department' : '部门'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofDepartment')(<Input />)}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={language === 'en' ? 'Group' : '分组'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofGroup')(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ marginLeft: '-56px' }}>
                        <Col span={12}>
                            <FormItem
                                label={language === 'en' ? 'System' : '系统'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofSystem')(<Input />)}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={language === 'en' ? 'Tag' : '标签'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('tag')(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 高高限报警配置 */}
                    <Row gutter={60} style={{ marginLeft: '-2px' }}>
                        <Col span={5}>
                            <FormItem
                                className={s['row-margin-min']}
                                {...formItemLayout2}
                            >
                                {getFieldDecorator('hhenable', {
                                    valuePropName: 'checked',
                                    initialValue: false,
                                })(
                                    <Checkbox>{language === 'en' ? 'Enable High-High Limit Alarm' : '启用高高限报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={14} style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <FormItem
                                label={language === 'en' ? 'Enable Script' : '使能脚本'}
                                className={s['row-margin-min']}
                                {...formItemInfo}
                            >
                                <Col span={20}>
                                    {getFieldDecorator('EnabledScript_HH')(<Input />)}
                                </Col>
                                <Col span={1}>
                                    <Button size="small" type="link" shape="circle" icon="question-circle" onClick={this.showText} />
                                </Col>
                                <Col span={3} style={{ paddingLeft: 5 }}>
                                    <Button size="small" onClick={() => this.modifyPointDescription('EnabledScript_HH')}>
                                        {language === 'en' ? 'Test' : '试算'}
                                    </Button>
                                </Col>
                            </FormItem>
                        </Col>
                        <Col span={4} style={{ marginLeft: language === 'en' ? 8 : '' }}>
                            <FormItem
                                label={language === 'en' ? 'High-High Limit Value' : '高高限值'}
                                className={s['row-margin-min-num']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('hhlimit', {
                                    initialValue: '',
                                    rules: [{ validator: this.alarmValueValidator('hhenable') }],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ marginLeft: language === 'en' ? '-170px' : '-130px' }}>
                        <Col span={24}>
                            <FormItem
                                label={language === 'en' ? 'High-High Limit Alarm Information' : '高高限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('hhinfo', {
                                    initialValue: '',
                                    rules: [
                                        {
                                            pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-\s#！!]+$/,
                                            message: language === 'en' ? 'Invalid format' : '格式不正确'
                                        },
                                        { validator: this.alarmInfoValidator('hhenable', 'hhinfo') }
                                    ],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 高限报警配置 */}
                    <Row gutter={60} style={{ marginLeft: '-2px' }}>
                        <Col span={5}>
                            <FormItem
                                className={s['row-margin-min']}
                                {...formItemLayout2}
                            >
                                {getFieldDecorator('henable', {
                                    valuePropName: 'checked',
                                    initialValue: false,
                                })(
                                    <Checkbox>{language === 'en' ? 'Enable High Limit Alarm' : '启用高限值报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={14} style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <FormItem
                                label={language === 'en' ? 'Enable Script' : '使能脚本'}
                                className={s['row-margin-min']}
                                {...formItemInfo}
                            >
                                <Col span={20}>
                                    {getFieldDecorator('EnabledScript_H')(<Input />)}
                                </Col>
                                <Col span={1}>
                                    <Button size="small" type="link" shape="circle" icon="question-circle" onClick={this.showText} />
                                </Col>
                                <Col span={3} style={{ paddingLeft: 5 }}>
                                    <Button size="small" onClick={() => this.modifyPointDescription('EnabledScript_H')}>
                                        {language === 'en' ? 'Test' : '试算'}
                                    </Button>
                                </Col>
                            </FormItem>
                        </Col>
                        <Col span={4} style={{ marginLeft: language === 'en' ? 8 : '' }}>
                            <FormItem
                                label={language === 'en' ? 'High Limit Value' : '高限值'}
                                className={s['row-margin-min-num']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('hlimit', {
                                    initialValue: '',
                                    rules: [{ validator: this.alarmValueValidator('henable') }],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ marginLeft: language === 'en' ? '-220px' : '-148px' }}>
                        <Col span={24}>
                            <FormItem
                                label={language === 'en' ? 'High Limit Alarm Information' : '高限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('hinfo', {
                                    initialValue: '',
                                    rules: [
                                        {
                                            pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-\s#！!]+$/,
                                            message: language === 'en' ? 'Invalid format' : '格式不正确'
                                        },
                                        { validator: this.alarmInfoValidator('henable', 'hinfo') }
                                    ],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 低限报警配置 */}
                    <Row gutter={60} style={{ marginLeft: '-2px' }}>
                        <Col span={5}>
                            <FormItem
                                className={s['row-margin-min']}
                                {...formItemLayout2}
                            >
                                {getFieldDecorator('lenable', {
                                    valuePropName: 'checked',
                                    initialValue: false,
                                })(
                                    <Checkbox>{language === 'en' ? 'Enable Low Limit Alarm' : '启用低限值报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={14} style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <FormItem
                                label={language === 'en' ? 'Enable Script' : '使能脚本'}
                                className={s['row-margin-min']}
                                {...formItemInfo}
                            >
                                <Col span={20}>
                                    {getFieldDecorator('EnabledScript_L')(<Input />)}
                                </Col>
                                <Col span={1}>
                                    <Button size="small" type="link" shape="circle" icon="question-circle" onClick={this.showText} />
                                </Col>
                                <Col span={3} style={{ paddingLeft: 5 }}>
                                    <Button size="small" onClick={() => this.modifyPointDescription('EnabledScript_L')}>
                                        {language === 'en' ? 'Test' : '试算'}
                                    </Button>
                                </Col>
                            </FormItem>
                        </Col>
                        <Col span={4} style={{ marginLeft: language === 'en' ? 8 : '' }}>
                            <FormItem
                                label={language === 'en' ? 'Low Limit Value' : '低限值'}
                                className={s['row-margin-min-num']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('llimit', {
                                    initialValue: '',
                                    rules: [{ validator: this.alarmValueValidator('lenable') }],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ marginLeft: language === 'en' ? '-226px' : '-148px' }}>
                        <Col span={24}>
                            <FormItem
                                label={language === 'en' ? 'Low Limit Alarm Information' : '低限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('linfo', {
                                    initialValue: '',
                                    rules: [
                                        {
                                            pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-\s#！!]+$/,
                                            message: language === 'en' ? 'Invalid format' : '格式不正确'
                                        },
                                        { validator: this.alarmInfoValidator('lenable', 'linfo') }
                                    ],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 低低限报警配置 */}
                    <Row gutter={60} style={{ marginLeft: '-2px' }}>
                        <Col span={5}>
                            <FormItem
                                className={s['row-margin-min']}
                                {...formItemLayout2}
                            >
                                {getFieldDecorator('llenable', {
                                    valuePropName: 'checked',
                                    initialValue: false,
                                })(
                                    <Checkbox>{language === 'en' ? 'Enable Low-Low Limit Alarm' : '启用低低限值报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={14} style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <FormItem
                                label={language === 'en' ? 'Enable Script' : '使能脚本'}
                                className={s['row-margin-min']}
                                {...formItemInfo}
                            >
                                <Col span={20}>
                                    {getFieldDecorator('EnabledScript_LL')(<Input />)}
                                </Col>
                                <Col span={1}>
                                    <Button size="small" type="link" shape="circle" icon="question-circle" onClick={this.showText} />
                                </Col>
                                <Col span={3} style={{ paddingLeft: 5 }}>
                                    <Button size="small" onClick={() => this.modifyPointDescription('EnabledScript_LL')}>
                                        {language === 'en' ? 'Test' : '试算'}
                                    </Button>
                                </Col>
                            </FormItem>
                        </Col>
                        <Col span={4} style={{ marginLeft: language === 'en' ? 8 : '' }}>
                            <FormItem
                                label={language === 'en' ? 'Low-Low Limit Value' : '低低限值'}
                                className={s['row-margin-min-num']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('lllimit', {
                                    initialValue: '',
                                    rules: [{ validator: this.alarmValueValidator('llenable') }],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ marginLeft: language === 'en' ? '-182px' : '-130px' }}>
                        <Col span={24}>
                            <FormItem
                                label={language === 'en' ? 'Low-Low Limit Alarm Information' : '低低限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('llinfo', {
                                    initialValue: '',
                                    rules: [
                                        {
                                            pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-\s#！!]+$/,
                                            message: language === 'en' ? 'Invalid format' : '格式不正确'
                                        },
                                        { validator: this.alarmInfoValidator('llenable', 'llinfo') }
                                    ],
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 提交按钮 */}
                    <FormItem {...formItemLayoutWithOutLabel}>
                        <Button onClick={hideModal} className={s['cancel-btn']}>
                            {language === 'en' ? 'Cancel' : '取消'}
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {language === 'en' ? 'Confirm' : '确认'}
                        </Button>
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

const HighLowAlarmModal = Form.create({
    mapPropsToFields: (props) => {
        const fieldMap = {
            pointname: Form.createFormField({ value: props.pointname }),
            boolWarningLevel: Form.createFormField({ value: String(props.boolWarningLevel) }),
            warningGroup: Form.createFormField({ value: props.warningGroup }),
            ofPosition: Form.createFormField({ value: props.ofPosition }),
            ofDepartment: Form.createFormField({ value: props.ofDepartment }),
            ofGroup: Form.createFormField({ value: props.ofGroup }),
            ofSystem: Form.createFormField({ value: props.ofSystem }),
            tag: Form.createFormField({ value: props.tag }),
            hhenable: Form.createFormField({ value: props.hhenable }),
            hhlimit: Form.createFormField({ value: props.hhlimit }),
            hhinfo: Form.createFormField({ value: props.hhinfo }),
            henable: Form.createFormField({ value: props.henable }),
            hlimit: Form.createFormField({ value: props.hlimit }),
            hinfo: Form.createFormField({ value: props.hinfo }),
            lenable: Form.createFormField({ value: props.lenable }),
            llimit: Form.createFormField({ value: props.llimit }),
            linfo: Form.createFormField({ value: props.linfo }),
            llenable: Form.createFormField({ value: props.llenable }),
            lllimit: Form.createFormField({ value: props.lllimit }),
            llinfo: Form.createFormField({ value: props.llinfo }),
            EnabledScript_HH: Form.createFormField({ value: props.EnabledScript_HH }),
            EnabledScript_H: Form.createFormField({ value: props.EnabledScript_H }),
            EnabledScript_L: Form.createFormField({ value: props.EnabledScript_L }),
            EnabledScript_LL: Form.createFormField({ value: props.EnabledScript_LL }),
        };

        // 过滤空值，避免初始值为 undefined
        Object.keys(fieldMap).forEach(key => {
            if (fieldMap[key].value === undefined) {
                fieldMap[key].value = '';
            }
        });

        return fieldMap;
    },
})(HighLowAlarmModalView);

export default HighLowAlarmModal;