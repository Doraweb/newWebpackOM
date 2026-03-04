import React from 'react';
import { Button, Modal, Radio, message, Form, Input, Select, DatePicker, Row, Col, Upload, Icon } from 'antd';
import moment from 'moment';
import appConfig from '../../../common/appConfig';

import http from '../../../common/http';

const language = appConfig.language;
const isEnglish = language == 'en'

const RadioGroup = Radio.Group;
const { TextArea } = Input;

const Option = Select.Option;
const FormItem = Form.Item;

let info = ""
class ImportRulesModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fileList: [],
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.visible != nextProps.visible && nextProps.visible) {
            http.get('/logic/getLogicList').then(res => {
                if (res.err == 0) {
                    const targetStrategy = res.data.find(item => item.dllFileName === 'StandardAIRuleLearning');
                    if (targetStrategy) {
                        const match = targetStrategy.logicName.match(/^Process(\d+)_/);
                        if (match) {
                            info += language == 'en' ? `Strategy Pool ${match[1]}` : `${match[1]}号策略池`
                        } else {
                            info += language == 'en' ? "Main Strategy Pool" : "主策略池"
                        }
                    } else {
                        console.log(language == 'en' ? 'Strategy with dllFileName StandardAIRuleLearning not found.' : '未找到dllFileName为StandardAIRuleLearning的策略。');
                    }
                } else {
                    Modal.info({
                        title: res.msg
                    })
                }
            }).catch(err => {
                message.error(language == 'en' ? 'Failed to get strategy thread' : '获取策略线程失败')
            })
        }
        return true
    }



    handleSubmit = (e) => {
        e.preventDefault();

        Modal.confirm({
            title: isEnglish ? 'Prompt' : '提示',
            content: isEnglish
                ? `After successful import, domlogic will restart ${info}. All strategies in this strategy pool will be restarted uniformly. Do you want to continue the import operation?`
                : `导入成功后将重启domlogic${info}，该策略池内策略将统一被重启，是否继续该导入操作？`,
            onOk: () => {
                this.props.form.validateFields((err, values) => {
                    if (!err) {
                        let formData = new FormData()
                        formData.append('file', this.state.fileList[0]);
                        formData.append('type', values.type);
                        formData.append('lan', language == 'en' ? 'en' : '');

                        http.post('/importRules', formData, {
                            headers: {
                                authorization: 'authorization-text',
                            }
                        }).then(res => {
                            if (res.err == 0) {
                                message.success(isEnglish ? 'Import successful' : '导入成功')
                                this.props.handleCancel()
                                this.props.getScriptRuleFromConfig()
                            } else {
                                Modal.error({
                                    title: res.msg
                                })
                            }
                            this.setState({
                                fileList: []
                            })
                        }).catch(err => {
                            Modal.error({
                                title: isEnglish ? 'Rule import interface request failed' : '规则导入接口请求失败'
                            })
                            this.setState({
                                fileList: []
                            })
                        })
                    }
                })
            }
        })
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 17
            },
        };
        const { fileList } = this.state;


        const prop = {
            onRemove: file => {
                const index = this.state.fileList.indexOf(file);
                const newFileList = this.state.fileList.slice();
                newFileList.splice(index, 1);
                this.setState({
                    fileList: newFileList
                })
            },
            beforeUpload: file => {
                this.setState(state => ({
                    fileList: [...state.fileList, file],
                }));
                return false
            },
            fileList
        }


        return (
            <Modal
                title={language == 'en' ? "Import All Rules" : "全量导入规则"}
                width={480}
                visible={this.props.visible}
                onCancel={this.props.handleCancel}
                onOk={this.handleSubmit}
                maskClosable={false}
                cancelText={language == 'en' ? "Cancel" : "取消"}
                okText={language == 'en' ? "OK" : "确定"}
            >
                <Form style={{ marginTop: '10px' }}>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? "Rule File Selection" : "规则文件选择"}
                    >
                        {getFieldDecorator('file', {
                            rules: [{ required: true, message: language == 'en' ? 'Rule file must be uploaded' : '必须上传规则文件' }],
                        })(
                            <Upload {...prop}>
                                <Button style={{ marginLeft: '20px' }}>
                                    <Icon type="upload" />{language == 'en' ? 'Select Rule File' : '选择规则文件'}
                                </Button>
                            </Upload>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}
const ImportRulesModalView = Form.create()(ImportRulesModal);

export default ImportRulesModalView
