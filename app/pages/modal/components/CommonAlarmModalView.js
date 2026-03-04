import React from 'react';
import { Modal, Button, Form, Input, Select, Checkbox, Col, Row, message } from 'antd';
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/python/python';
import cx from 'classnames';
import s from './CommonAlarmModalView.css';
import http from '../../../common/http';
import appConfig from '../../../common/appConfig';

// 常量定义（统一管理，便于维护）
const language = appConfig.language;
const Option = Select.Option;
const FormItem = Form.Item;
const TAB = '    '; // 4个空格的Tab
const codeMirrorOptions = {
    lineNumbers: true,
    extraKeys: {
        Tab: (cm) => {
            if (cm.getSelection().length) {
                CodeMirror.commands.indentMore(cm);
            } else {
                cm.replaceSelection(TAB);
            }
        }
    },
    mode: 'python'
};

// 国际化文案常量
const I18N = {
    en: {
        tip: 'Tip',
        addSuccess: 'Addition successful!',
        addFailed: 'Addition failed!',
        pleaseFillPointName: 'Please fill in the point name',
        pleaseFillAlarmLevel: 'Please fill in the alarm level',
        pleaseFillGroup: 'Please fill in the group',
        pleaseFillAlarmInfo: 'Please fill in the alarm information',
        testInfo: 'Test Information',
        calcResult: 'The calculation result is ',
        commFailed: 'Communication failed. Please try again later.',
        enableHighHighAlarm: 'Enable High-High Limit Alarm',
        enableHighAlarm: 'Enable High Limit Alarm',
        enableLowAlarm: 'Enable Low Limit Alarm',
        enableLowLowAlarm: 'Enable Low-Low Limit Alarm',
        highHighValue: 'High-High Limit Value',
        highValue: 'High Limit Value',
        lowValue: 'Low Limit Value',
        lowLowValue: 'Low Limit Value',
        highHighAlarmInfo: 'High-High Limit Alarm Information',
        highAlarmInfo: 'High Limit Alarm Information',
        lowAlarmInfo: 'Low Limit Alarm Information',
        lowLowAlarmInfo: 'Low-Low Limit Alarm Information',
        enableScript: 'Enable Script',
        test: 'Test',
        numberOnly: '0-9 digits',
        pleaseFillValue: 'Please fill in value',
        pleaseFillInfo: 'Please fill in information',
        allowedChars: 'Uppercase and lowercase letters, numbers, and Chinese characters are allowed.',
        ruleScript: 'Rule Script',
        ruleScriptEmpty: 'Rule script cannot be empty!',
        scriptExample: 'Script Example',
        scriptTest: 'Script Test',
        testError: 'Test Error',
        testResults: 'Test Results',
        requestError: 'Tip',
        serverCommError: 'Server communication error!',
        enableScriptExample: 'Enable Script Example',
        addAlarm: 'Add Alarm',
        booleanAlarm: 'Boolean Alarm',
        highLowAlarm: 'High-Low Limit Alarm',
        ruleAlarm: 'Rule-based Alarm',
        alarmLevel: 'Alarm Level',
        general: 'General',
        moderate: 'Moderate',
        severe: 'Severe',
        department: 'Department',
        group: 'Group',
        system: 'System',
        tag: 'Tag',
        alarmLocation: 'Alarm Location',
        cancel: 'Cancel',
        confirm: 'Confirm',
        pointName: 'Point Name',
        alarmType: 'Alarm Type',
        alarmInfo: 'Alarm Information',
        returnFalse: 'return False No alarm',
        returnTrue: 'return True Alarm',
        scriptCalcFailed: 'Script calculation failed'
    },
    cn: {
        tip: '提示',
        addSuccess: '添加成功',
        addFailed: '添加失败',
        pleaseFillPointName: '请填写点名',
        pleaseFillAlarmLevel: '请填写报警等级',
        pleaseFillGroup: '请填写分组',
        pleaseFillAlarmInfo: '请填写报警信息',
        testInfo: '测试信息',
        calcResult: '计算结果为：',
        commFailed: '通讯失败,请稍后再试',
        enableHighHighAlarm: '启用高高限报警',
        enableHighAlarm: '启用高限值报警',
        enableLowAlarm: '启用低限值报警',
        enableLowLowAlarm: '启用低低限值报警',
        highHighValue: '高高限值',
        highValue: '高限值',
        lowValue: '低限值',
        lowLowValue: '低低限值',
        highHighAlarmInfo: '高高限报警信息',
        highAlarmInfo: '高限报警信息',
        lowAlarmInfo: '低限报警信息',
        lowLowAlarmInfo: '低低限报警信息',
        enableScript: '使能脚本',
        test: '试算',
        numberOnly: '0-9数字',
        pleaseFillValue: '请填写数值',
        pleaseFillInfo: '请填写信息',
        allowedChars: '可填写大小写字母／数字／汉字',
        ruleScript: '规则脚本',
        ruleScriptEmpty: '规则脚本不能为空！',
        scriptExample: '脚本示例',
        scriptTest: '脚本测试',
        testError: '测试错误',
        testResults: '测试结果',
        requestError: '请求错误',
        serverCommError: '服务器通讯出错！',
        enableScriptExample: '使能脚本示例',
        addAlarm: '添加报警',
        booleanAlarm: '布尔报警',
        highLowAlarm: '高低限报警',
        ruleAlarm: '规则报警',
        alarmLevel: '报警等级',
        general: '一般',
        moderate: '较重',
        severe: '严重',
        department: '部门',
        group: '分组',
        system: '系统',
        tag: '标签',
        alarmLocation: '报警位置',
        cancel: '取消',
        confirm: '确认',
        pointName: '点名',
        alarmType: '报警类型',
        alarmInfo: '报警信息',
        returnFalse: 'return False 无报警',
        returnTrue: 'return True 报警',
        scriptCalcFailed: '脚本计算失败'
    }
};

const t = I18N[language === 'en' ? 'en' : 'cn'];

// 表单布局常量
const FORM_LAYOUT = {
    base: {
        labelCol: { sm: { span: 4 } },
        wrapperCol: { sm: { span: 20 } }
    },
    info: {
        labelCol: { sm: { span: language === 'en' ? 7 : 5 } },
        wrapperCol: { sm: { span: language === 'en' ? 17 : 19 } }
    },
    number: {
        labelCol: { sm: { span: language === 'en' ? 18 : 16 } },
        wrapperCol: { sm: { span: language === 'en' ? 6 : 8 } }
    },
    itemInfo: {
        labelCol: { sm: { span: language === 'en' ? 6 : 4 } },
        wrapperCol: { sm: { span: language === 'en' ? 18 : 20 } }
    },
    layout3: {
        labelCol: { sm: { span: language === 'en' ? 5 : 4 } },
        wrapperCol: { sm: { span: language === 'en' ? 19 : 20 } }
    },
    layout2: {
        labelCol: { sm: { span: language === 'en' ? 1 : 3 } },
        wrapperCol: { sm: { span: language === 'en' ? 23 : 21 } }
    },
    withoutLabel: {
        wrapperCol: {
            xs: { span: 24, offset: 0 },
            sm: { span: 16, offset: language === 'en' ? 10 : 8 }
        }
    }
};

// 代码编辑器组件
class CodeEditor extends React.Component {
    state = {
        script: this.props.value || ''
    };

    handleChange = (value) => {
        if (!('value' in this.props)) {
            this.setState({ script: value });
        }
        this.props.onChange && this.props.onChange(value);
    };

    componentWillReceiveProps(nextProps) {
        if ('value' in nextProps && nextProps.value !== this.state.script) {
            this.setState({ script: nextProps.value });
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

// 主组件
class MainInterfaceModalView extends React.Component {
    state = {
        type: this.props.addType
    };

    // 报警类型切换
    handleTypeChange = (value) => {
        this.setState({ type: value });
        // 切换类型时重置相关字段校验状态
        this.props.form.resetFields([
            'hhenable', 'henable', 'lenable', 'llenable',
            'hhlimit', 'hlimit', 'llimit', 'lllimit',
            'hhinfo', 'hinfo', 'linfo', 'llinfo'
        ]);
    };

    // 通用校验规则
    validateRules = {
        pointname: {
            required: true,
            message: t.pleaseFillPointName
        },
        boolWarningLevel: {
            required: true,
            message: t.pleaseFillAlarmLevel
        },
        warningGroup: {
            required: true,
            message: t.pleaseFillGroup
        },
        boolWarningInfo: {
            required: true,
            pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-\s#！!]+$/,
            message: t.allowedChars
        },
        numberField: {
            pattern: /^-?\d+$/, // 支持负数
            message: t.numberOnly
        }
    };

    // 高低限字段联动校验（核心需求：启用报警则对应信息必填）
    validateLimitField = (enableField, valueField, infoField) => {
        const { getFieldValue } = this.props.form;
        const isEnabled = getFieldValue(enableField);
        
        // 启用状态下，数值和信息必填
        if (isEnabled) {
            const value = getFieldValue(valueField);
            const info = getFieldValue(infoField);
            
            if (!value) return Promise.reject(new Error(t.pleaseFillValue));
            if (!info) return Promise.reject(new Error(t.pleaseFillInfo));
        }
        return Promise.resolve();
    };

    // 提交表单处理
    handleSubmit = (e) => {
        e.preventDefault();
        const { form } = this.props;
        const { type } = this.state;

        // 先校验基础字段
        form.validateFields((err, values) => {
            if (err) return;

            // 高低限报警额外校验联动字段
            if (type === "0") {
                const limitFields = [
                    { enable: 'hhenable', value: 'hhlimit', info: 'hhinfo' },
                    { enable: 'henable', value: 'hlimit', info: 'hinfo' },
                    { enable: 'lenable', value: 'llimit', info: 'linfo' },
                    { enable: 'llenable', value: 'lllimit', info: 'llinfo' }
                ];

                // 逐个校验启用的字段
                const validatePromises = limitFields.map(item => 
                    this.validateLimitField(item.enable, item.value, item.info)
                );

                Promise.all(validatePromises)
                    .then(() => this.submitData(values))
                    .catch(validateErr => {
                        message.error(validateErr.message);
                    });
            } else {
                // 布尔/规则报警直接提交
                this.submitData(values);
            }
        });
    };

    // 提交数据到后端
    submitData = (values) => {
        const { type } = this.state;
        const apiUrl = type === "3" ? '/warningConfig/addRule' : '/warningConfig/add';
        
        // 构造通用参数
        const baseParams = {
            pointname: values.pointname,
            boolWarningLevel: Number(values.boolWarningLevel),
            warningGroup: values.warningGroup,
            ofPosition: values.ofPosition || '',
            ofDepartment: values.ofDepartment || '',
            ofGroup: values.ofGroup || '',
            ofSystem: values.ofSystem || '',
            tag: values.tag || '',
            lan: language
        };

        // 根据类型构造不同参数
        let submitParams = {};
        switch (type) {
            case "1": // 布尔报警
                submitParams = {
                    ...baseParams,
                    boolWarningInfo: values.boolWarningInfo,
                    type: 1,
                    hhenable: 0,
                    henable: 0,
                    llenable: 0,
                    lenable: 0,
                    hhlimit: "0",
                    hlimit: "0",
                    llimit: "0",
                    lllimit: "0",
                    hhinfo: "布尔报警",
                    hinfo: "布尔报警",
                    llinfo: "布尔报警",
                    linfo: "布尔报警",
                    EnabledScript_BOOL: values.EnabledScript_BOOL || ''
                };
                break;
            case "0": // 高低限报警
                submitParams = {
                    ...baseParams,
                    boolWarningInfo: "",
                    type: 0,
                    hhenable: values.hhenable ? 1 : 0,
                    henable: values.henable ? 1 : 0,
                    llenable: values.llenable ? 1 : 0,
                    lenable: values.lenable ? 1 : 0,
                    hhlimit: values.hhlimit || '',
                    hlimit: values.hlimit || '',
                    llimit: values.llimit || '',
                    lllimit: values.lllimit || '',
                    hhinfo: values.hhinfo || '',
                    hinfo: values.hinfo || '',
                    llinfo: values.llinfo || '',
                    linfo: values.linfo || '',
                    EnabledScript_HH: values.EnabledScript_HH || '',
                    EnabledScript_H: values.EnabledScript_H || '',
                    EnabledScript_L: values.EnabledScript_L || '',
                    EnabledScript_LL: values.EnabledScript_LL || ''
                };
                break;
            case "3": // 规则报警
                submitParams = {
                    ...baseParams,
                    boolWarningInfo: values.boolWarningInfo,
                    type: 3,
                    script: values.script
                };
                break;
        }

        // 发送请求
        http.post(apiUrl, submitParams)
            .then(data => {
                if (!data.err) {
                    Modal.success({
                        title: t.tip,
                        content: t.addSuccess
                    });
                    this.props.hideModal();
                } else {
                    Modal.error({
                        title: t.tip,
                        content: t.addFailed
                    });
                }
            })
            .catch(() => {
                Modal.error({
                    title: t.tip,
                    content: t.commFailed
                });
            });
    };

    // 测试公式
    testScript = (fieldName) => {
        const script = this.props.form.getFieldValue(fieldName);
        if (!script) {
            message.warning(t.ruleScriptEmpty);
            return;
        }

        http.post('/tool/evalStringExpression', { str: script, debug: 1 })
            .then(data => {
                if (data.err >= 0) {
                    Modal.info({
                        title: t.testInfo,
                        content: (
                            <div>
                                <p>{t.calcResult}{data.data}</p>
                                <Input.TextArea autoSize={{ minRows: 9, maxRows: 18 }} value={data.debugInfo} />
                            </div>
                        )
                    });
                } else {
                    Modal.error({ title: t.tip, content: t.commFailed });
                }
            });
    };

    // 显示脚本示例
    showRuleExample = () => {
        Modal.info({
            width: 450,
            content: (
                <Input.TextArea
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
    return False`}
                />
            )
        });
    };

    // 测试规则脚本
    testRuleScript = () => {
        const script = this.props.form.getFieldValue('script');
        if (!script) {
            Modal.info({ title: t.tip, content: t.ruleScriptEmpty });
            return;
        }

        http.post('/warning/testScript', { script })
            .then(data => {
                if (data.err) {
                    Modal.error({ title: t.testError, content: data.msg });
                } else {
                    const result = String(data.data) === "false" 
                        ? t.returnFalse 
                        : String(data.data) === "true" 
                            ? t.returnTrue 
                            : t.scriptCalcFailed;
                    Modal.info({ title: t.testResults, content: result });
                }
            })
            .catch(() => {
                Modal.error({ title: t.requestError, content: t.serverCommError });
            });
    };

    // 显示使能脚本示例
    showEnableScriptExample = () => {
        Modal.info({
            title: t.enableScriptExample,
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
        });
    };

    // 渲染布尔报警内容
    renderBooleanAlarm = () => {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Row gutter={60} style={{ marginLeft: language === 'en' ? "-110px" : "-120px" }}>
                    <Col span={24}>
                        <FormItem
                            label={t.alarmInfo}
                            {...FORM_LAYOUT.base}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('boolWarningInfo', {
                                rules: [this.validateRules.boolWarningInfo]
                            })(<Input />)}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={60} style={{ marginLeft: language === 'en' ? "-276px" : "-120px" }}>
                    <Col>
                        <FormItem
                            label={t.enableScript}
                            className={s['row-margin-min']}
                            {...FORM_LAYOUT.itemInfo}
                        >
                            <Col span={21}>
                                {getFieldDecorator('EnabledScript_BOOL', { initialValue: '' })(<Input />)}
                            </Col>
                            <Col span={1}>
                                <Button
                                    size='small'
                                    type='link'
                                    shape='circle'
                                    icon='question-circle'
                                    onClick={this.showEnableScriptExample}
                                />
                            </Col>
                            <Col span={2} style={{ paddingLeft: 5 }}>
                                <Button
                                    size='small'
                                    onClick={() => this.testScript("EnabledScript_BOOL")}
                                >
                                    {t.test}
                                </Button>
                            </Col>
                        </FormItem>
                    </Col>
                </Row>
            </div>
        );
    };

    // 渲染高低限报警内容（核心：启用则必填）
    renderHighLowAlarm = () => {
        const { getFieldDecorator } = this.props.form;
        // 渲染单个高低限行
        const renderLimitRow = (type) => {
            const config = {
                hh: {
                    enableField: 'hhenable',
                    valueField: 'hhlimit',
                    infoField: 'hhinfo',
                    scriptField: 'EnabledScript_HH',
                    enableLabel: t.enableHighHighAlarm,
                    valueLabel: t.highHighValue,
                    infoLabel: t.highHighAlarmInfo
                },
                h: {
                    enableField: 'henable',
                    valueField: 'hlimit',
                    infoField: 'hinfo',
                    scriptField: 'EnabledScript_H',
                    enableLabel: t.enableHighAlarm,
                    valueLabel: t.highValue,
                    infoLabel: t.highAlarmInfo
                },
                l: {
                    enableField: 'lenable',
                    valueField: 'llimit',
                    infoField: 'linfo',
                    scriptField: 'EnabledScript_L',
                    enableLabel: t.enableLowAlarm,
                    valueLabel: t.lowValue,
                    infoLabel: t.lowAlarmInfo
                },
                ll: {
                    enableField: 'llenable',
                    valueField: 'lllimit',
                    infoField: 'llinfo',
                    scriptField: 'EnabledScript_LL',
                    enableLabel: t.enableLowLowAlarm,
                    valueLabel: t.lowLowValue,
                    infoLabel: t.lowLowAlarmInfo
                }
            }[type];

            return (
                <div>
                    <Row gutter={60} style={{ marginLeft: language === 'en' ? "-8px" : "-2px" }}>
                        <Col span={5}>
                            <FormItem className={s['row-margin-min']} {...FORM_LAYOUT.layout2}>
                                {getFieldDecorator(config.enableField, {
                                    valuePropName: 'checked',
                                    initialValue: false
                                })(<Checkbox>{config.enableLabel}</Checkbox>)}
                            </FormItem>
                        </Col>
                        <Col span={14} style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <FormItem
                                label={t.enableScript}
                                className={s['row-margin-min']}
                                {...FORM_LAYOUT.itemInfo}
                            >
                                <Col span={20}>
                                    {getFieldDecorator(config.scriptField, { initialValue: '' })(<Input />)}
                                </Col>
                                <Col span={1}>
                                    <Button
                                        size='small'
                                        type='link'
                                        shape='circle'
                                        icon='question-circle'
                                        onClick={this.showEnableScriptExample}
                                    />
                                </Col>
                                <Col span={3} style={{ paddingLeft: 5 }}>
                                    <Button
                                        size='small'
                                        onClick={() => this.testScript(config.scriptField)}
                                    >
                                        {t.test}
                                    </Button>
                                </Col>
                            </FormItem>
                        </Col>
                        <Col span={4} style={{ marginLeft: language === 'en' ? 8 : '' }}>
                            <FormItem
                                label={config.valueLabel}
                                className={s['row-margin-min-num']}
                                {...FORM_LAYOUT.number}
                            >
                                {getFieldDecorator(config.valueField, {
                                    initialValue: '',
                                    rules: [this.validateRules.numberField]
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} style={{ marginLeft: this.getInfoRowMargin(type) }}>
                        <Col span={24}>
                            <FormItem
                                label={config.infoLabel}
                                {...FORM_LAYOUT.info}
                                className={s['row-margin']}
                                style={type === 'hh' ? { marginLeft: language === 'en' ? -70 : '' } : undefined}
                            >
                                {getFieldDecorator(config.infoField, {
                                    initialValue: '',
                                    rules: [{
                                        pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-\s#！!]+$/,
                                        message: t.allowedChars
                                    }]
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            );
        };

        return (
            <div>
                {renderLimitRow('hh')}
                {renderLimitRow('h')}
                {renderLimitRow('l')}
                {renderLimitRow('ll')}
            </div>
        );
    };

    // 获取高低限信息行的margin
    getInfoRowMargin = (type) => {
        const marginMap = {
            hh: language === 'en' ? "-110px" : "-130px",
            h: language === 'en' ? "-230px" : "-148px",
            l: language === 'en' ? "-234px" : "-148px",
            ll: language === 'en' ? "-190px" : "-130px"
        };
        return marginMap[type];
    };

    // 渲染规则报警内容
    renderRuleAlarm = () => {
        const { getFieldDecorator } = this.props.form;
        return (
            <Row gutter={60}>
                <Col span={24}>
                    <FormItem
                        label={t.alarmInfo}
                        {...FORM_LAYOUT.base}
                        className={s['row-margin']}
                    >
                        {getFieldDecorator('boolWarningInfo', {
                            rules: [this.validateRules.boolWarningInfo]
                        })(<Input />)}
                    </FormItem>
                </Col>
                <Col span={24}>
                    <FormItem label={t.ruleScript} className={s['row-margin']}>
                        {getFieldDecorator('script', {
                            initialValue: '',
                            rules: [{ required: true, message: t.ruleScriptEmpty }]
                        })(<CodeEditor />)}
                    </FormItem>
                    <Button
                        style={{ position: 'absolute', left: 115, bottom: 340 }}
                        size='small'
                        onClick={this.showRuleExample}
                    >
                        {t.scriptExample}
                    </Button>
                    <Button
                        style={{ position: 'absolute', left: language === 'en' ? 240 : 228, bottom: 340 }}
                        size='small'
                        onClick={this.testRuleScript}
                    >
                        {t.scriptTest}
                    </Button>
                </Col>
            </Row>
        );
    };

    // 渲染报警内容
    renderAlarmContent = () => {
        const { type } = this.state;
        switch (type) {
            case "1": return this.renderBooleanAlarm();
            case "0": return this.renderHighLowAlarm();
            case "3": return this.renderRuleAlarm();
            default: return null;
        }
    };

    render() {
        const { visible, hideModal, form } = this.props;
        const { getFieldDecorator } = form;
        const finalVisible = typeof visible === 'undefined' ? true : visible;

        return (
            <Modal
                title={t.addAlarm}
                visible={finalVisible}
                onCancel={hideModal}
                footer={null}
                maskClosable={false}
                width={language === 'en' ? 1200 : 1000}
            >
                <Form onSubmit={this.handleSubmit}>
                    {/* 基础表单字段 */}
                    <Row gutter={60} style={{ marginLeft: -160 }}>
                        <Col span={24}>
                            <FormItem
                                label={t.pointName}
                                {...FORM_LAYOUT.base}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('pointname', {
                                    rules: [this.validateRules.pointname]
                                })(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={60}>
                        <Col span={12}>
                            <FormItem
                                label={t.alarmType}
                                {...FORM_LAYOUT.itemInfo}
                                className={s['row-margin']}
                                style={{ marginLeft: language === 'en' ? -70 : '' }}
                            >
                                {getFieldDecorator('type', {
                                    initialValue: String(this.props.addType),
                                    rules: [{ required: true }]
                                })(
                                    <Select onChange={this.handleTypeChange}>
                                        <Option value='1'>{t.booleanAlarm}</Option>
                                        <Option value='0'>{t.highLowAlarm}</Option>
                                        <Option value='3'>{t.ruleAlarm}</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={t.alarmLevel}
                                {...FORM_LAYOUT.itemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('boolWarningLevel', {
                                    initialValue: "2",
                                    rules: [this.validateRules.boolWarningLevel]
                                })(
                                    <Select>
                                        <Option value='1'>{t.general}</Option>
                                        <Option value='2'>{t.moderate}</Option>
                                        <Option value='3'>{t.severe}</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={60}>
                        <Col span={8}>
                            <FormItem
                                label={t.department}
                                {...FORM_LAYOUT.itemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofDepartment')(<Input />)}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem
                                label={t.group}
                                {...FORM_LAYOUT.itemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofGroup')(<Input />)}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem
                                label={t.system}
                                {...FORM_LAYOUT.itemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofSystem')(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={60} style={{ marginLeft: -29 }}>
                        <Col span={8}>
                            <FormItem
                                label={t.tag}
                                {...FORM_LAYOUT.itemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('tag')(<Input />)}
                            </FormItem>
                        </Col>
                        <Col span={16} style={{ marginLeft: language === 'en' ? -30 : -36, paddingLeft: 0, paddingRight: 0 }}>
                            <FormItem
                                label={t.alarmLocation}
                                {...FORM_LAYOUT.layout3}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofPosition')(<Input />)}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* 报警类型对应的内容 */}
                    {this.renderAlarmContent()}

                    {/* 操作按钮 */}
                    <FormItem {...FORM_LAYOUT.withoutLabel}>
                        <Button onClick={hideModal} className={s['cancel-btn']}>{t.cancel}</Button>
                        <Button type="primary" htmlType='submit'>{t.confirm}</Button>
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

// 包装Form
const MainInterfaceModal = Form.create({
    mapPropsToFields: (props) => ({
        pointname: Form.createFormField({ value: props.pointName }),
        type: Form.createFormField({ value: String(props.addType) })
    })
})(MainInterfaceModalView);

export default MainInterfaceModal;