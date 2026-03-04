import { Empty, Modal, Table, Button, Popover, Tag, TimePicker, Radio, Icon } from 'antd'
import React, { Component } from 'react'
import http from '../../../common/http'
import moment from 'moment'
import appConfig from '../../../common/appConfig'
const language = appConfig.language
const tagStyle = {
    float: "right",
    marginRight: 3,
    borderRadius: 15,
    width: 15,
    height: 15,
    marginTop: 4
}
const timeStyle = {
    padding: '0 2px',
    border: '1px solid',
    cursor: 'pointer',
}
const editTimeStyle = {
    marginRight: '8px',
    borderRadius: '4px',
    padding: '0px 5px',
    float: 'right',
}

const TimeFormat = 'HH:mm'
const RadioGroup = Radio.Group

class EditModeEnvModalView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [],
            loading: false,
            timeValue: '',
            timeIndex: ''
        }
    }

    componentDidMount() {

    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.visible != nextProps.visible) {
            if (nextProps.visible == true) {
                this.getModeContent(nextProps.modeInfo.modeId)
            }
            return true
        }
        if (this.state.loading != nextState.loading) {
            return true
        }
        if (this.state.timeValue != nextState.timeValue) {
            return true
        }
        if (this.state.timeIndex != nextState.timeIndex) {
            return true
        }
        if (JSON.stringify(this.state.dataSource) != JSON.stringify(nextState.dataSource)) {
            return true
        }
        return false
    }

    getModeContent = (modeId) => {
        this.setState({
            loading: true
        })
        http.post('/mode/getContentById', {
            modeId: modeId,
            lan: language
        }).then(res => {
            if (res.err == 0) {
                this.setState({
                    dataSource: res.data.detail,
                    loading: false
                })
            } else {
                Modal.error({
                    title: language == 'en' ? 'Reminder' : '提示',
                    content: res.msg
                })
                this.setState({
                    dataSource: [],
                    loading: false
                })
            }
        }).catch(err => {
            Modal.error({
                title: language == 'en' ? 'Reminder' : '提示',
                content: err.message
            })
            this.setState({
                loading: false,
                dataSource: []
            })
        })
    }

    runEnv = (text, id) => {
        Modal.confirm({
            title: language == 'en' ? 'Reminder' : '确认信息',
            content: language == 'en' ? `Confirm to run Scene${text}?` : `确定运行场景${text}？`,
            onOk: () => {
                this.getScenePointList(id)
            }
        })
    }

    getScenePointList = (id) => {
        http.post('/env/get', {
            lan: language,
            id: id
        }).then(
            res => {
                if (res.err === 0) {
                    if (res.data.detail.length === 0) {
                        Modal.info({
                            title: language == 'en' ? 'Reminder' : '提示',
                            content: language == 'en' ? 'The content of this scene is empty.' : "该场景内容为空"
                        })
                    } else {
                        this.runScene(res.data.detail, res.data.name)
                    }
                } else {
                    Modal.error({
                        title: language == 'en' ? 'Alert' : '警告',
                        content: res.msg
                    })
                }
            }
        ).catch(
            error => {
                Modal.error({
                    title: language == 'en' ? 'Alert' : '警告',
                    content: error.msg
                })
            }
        )
    }

    runScene = (data, name) => {
        let pointValue = []
        let pointName = []
        data.map(item => {
            pointValue.push(item.pointValue)
            pointName.push(item.pointName)
        })
        http.post(appConfig.token ? '/pointData/setValueV2' : '/pointData/setValue', {
            token: appConfig.token,
            pointList: pointName,
            valueList: pointValue,
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            res => {
                if (!res.err) {
                    Modal.success({
                        content: `${name}${language == 'en' ? 'Scene ran successfully' : '场景运行成功'}`
                    })
                    //增加操作记录
                    http.post('/operationRecord/add', {
                        "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
                        "content": `${language == 'en' ? 'Run Scene' : '运行场景'}${name}`,
                        "address": ''
                    }).then(data => { })
                } else {
                    Modal.info({
                        content: res.msg
                    })
                }
            }
        ).catch(err => {
            Modal.info({
                title: language == 'en' ? 'API request failed' : '接口请求失败',
            })
        })
    }

    //选择单选时间列表
    handelRadioTime = (e) => {
        this.setState({
            timeIndex: e.target.value
        })
    }

    //选择时间
    handelTime = (time, timeString) => {
        this.setState({
            timeValue: timeString
        })
    }

    editEnvTime = (record) => {
        this.setState({
            timeIndex: record.triggerTimeType,
            timeValue: record.triggerTime,
        })
        Modal.confirm({
            width: 450,
            title: language == 'en' ? 'Scene execution time modified:' : '场景执行时间修改：' + record['envName'],
            content: (
                <div style={{ marginTop: 25 }}>
                    <RadioGroup defaultValue={record.triggerTimeType} onChange={this.handelRadioTime}>
                        <Radio value={1}>
                            {
                                language == 'en' ? 'Same day' : '当日'
                            }

                        </Radio>
                        <Radio value={2}>
                            {
                                language == 'en' ? 'Next day' : '隔日'
                            }
                        </Radio>
                    </RadioGroup>
                    <TimePicker defaultValue={moment(record.triggerTime, 'HH:mm')} onChange={this.handelTime} format={TimeFormat} />
                </div>
            ),
            onOk: () => {
                const { timeIndex, timeValue } = this.state
                this.edit({
                    modeId: this.props.modeInfo.modeId,
                    newTime: timeValue,
                    newTimeType: timeIndex,
                    oldTime: record.triggerTime,
                    oldTimeType: record.triggerTimeType,
                    oldEnvId: record.envId,
                    newEnvId: record.envId,
                    onduty: appConfig.onduty,
                    cloudUserId: appConfig.cloudUser.cloudUserId,
                    projectId: appConfig.projectId
                })
            }
        })
    }

    edit = (data) => {
        http.post('/mode/editContent', data).then(res => {
            if (res.err == 0) {
                Modal.success({
                    title: language == 'en' ? 'Reminder' : '提示',
                    content: res.msg
                })
                this.getModeContent(this.props.modeInfo.modeId)
            } else {
                Modal.error({
                    title: language == 'en' ? 'Alert' : '警告',
                    content: res.msg
                })
            }
        }).catch(err => {
            Modal.error({
                title: language == 'en' ? 'Alert' : '警告',
                content: err.message
            })
        })
    }

    render() {
        const { modeInfo, visible, handleCancel } = this.props
        const columns = [{
            title: language == 'en' ? 'Time' : '时间',
            dataIndex: 'triggerTime',
            key: 'triggerTime',
            width: 144,
            render: (text, record, index) => {
                if (record.triggerTimeType == 2) {
                    if (record.actionOnce != undefined) {
                        if (record.actionOnce == 0) {
                            return (<div>
                                <span > {language == 'en' ? 'Next day' : '隔日'}{record.triggerTime}</span>
                                <Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Ongoing' : '持续执行中'}></Tag>
                                <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                            </div>)
                        } else {
                            return (<div>
                                <span > {language == 'en' ? 'Next day' : '隔日'}  {record.triggerTime}</span>
                                <Tag style={tagStyle} color="#87d068" title={language == 'en' ? 'Run Once' : '执行一次'}></Tag>
                                <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                            </div>)
                        }
                    } else {
                        return (<div>
                            <span > {language == 'en' ? 'Next day' : '隔日'}  {record.triggerTime}</span>
                            <Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Ongoing' : '持续执行中'}></Tag>
                            <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                        </div>)
                    }
                } else if (record.triggerTimeType == 0) {
                    if (record.actionOnce != undefined) {
                        if (record.actionOnce == 0) {
                            return (
                                <div>
                                    <Popover content={<div style={{ userSelect: 'text' }}>{record.SystemTimePointName}</div>} title={language == 'en' ? "Time Point Name" : "时间点名"} trigger="click">
                                        <span style={timeStyle}>{record.triggerTime}</span>
                                    </Popover>
                                    <Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Ongoing' : '持续执行中'}></Tag>
                                    <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                                </div>
                            )
                        } else {
                            let nowTime = moment().add(1, 'minutes')
                            let time = moment(record.triggerTime, 'HH:mm')
                            if (moment(nowTime).isBefore(time)) {
                                return (
                                    <div>
                                        <Popover content={<div style={{ userSelect: 'text' }}>{record.SystemTimePointName}</div>} title={language == 'en' ? "Time Point Name" : "时间点名"} trigger="click">
                                            <span style={timeStyle}>{record.triggerTime}</span>
                                        </Popover>
                                        <Tag style={tagStyle} color="#87d068" title={language == 'en' ? 'Run Once' : '执行一次'}></Tag>
                                        <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                                    </div>
                                )
                            } else {
                                return (
                                    <div>
                                        <Popover content={<div style={{ userSelect: 'text' }}>{record.SystemTimePointName}</div>} title={language == 'en' ? "Time Point Name" : "时间点名"} trigger="click">
                                            <span style={timeStyle}>{record.triggerTime}</span>
                                        </Popover>
                                        <Tag style={tagStyle} color="gray" title={language == 'en' ? 'Run Once' : '执行一次'}></Tag>
                                        <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                                    </div>
                                )
                            }

                        }
                    } else {
                        return (
                            <div>
                                <Popover content={<div style={{ userSelect: 'text' }}>{record.SystemTimePointName}</div>} title={language == 'en' ? "Time Point Name" : "时间点名"} trigger="click">
                                    <span style={timeStyle}>{record.triggerTime}</span>
                                </Popover>
                                <Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Ongoing' : '持续执行中'}></Tag>
                                <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                            </div>
                        )
                    }
                } else {
                    if (record.actionOnce != undefined) {
                        if (record.actionOnce == 0) {
                            return (<div>
                                <span >{record.triggerTime}</span>
                                <Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Ongoing' : '持续执行中'}></Tag>
                                <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                            </div>)
                        } else {
                            let nowTime = moment().add(1, 'minutes')
                            let time = moment(record.triggerTime, 'HH:mm')
                            if (moment(nowTime).isBefore(time)) {
                                return (<div>
                                    <span>{record.triggerTime}</span>
                                    <Tag style={tagStyle} color="#87d068" title={language == 'en' ? 'Run Once' : '执行一次'}></Tag>
                                    <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                                </div>)
                            } else {
                                return (<div>
                                    <span >{record.triggerTime}</span>
                                    <Tag style={tagStyle} color="gray" title={language == 'en' ? 'Run Once' : '执行一次'}></Tag>
                                    <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                                </div>)
                            }

                        }
                    } else {
                        return (<div>
                            <span >{record.triggerTime}</span>
                            <Tag style={tagStyle} color="#FFCC33" title={language == 'en' ? 'Ongoing' : '持续执行中'}></Tag>
                            <Button type='link' size='small' style={editTimeStyle} onClick={() => { this.editEnvTime(record) }}><Icon type="edit" /></Button>
                        </div>)
                    }
                }

            }
        },
        {
            title: language == 'en' ? 'ID' : '场景id',
            dataIndex: 'envId',
            key: 'envId',
            width: 75,
            align: 'center'
        },
        {
            title: language == 'en' ? 'Name' : '场景名称',
            dataIndex: 'envName',
            key: 'envName',
            width: 400,
            render: (text, record) => {
                return <div style={{ background: 'rgba(255,255,255,0.1)', paddingLeft: 5, cursor: 'pointer' }} onClick={() => this.runEnv(text, record['envId'])}>{text}</div>
            }
        },
        {
            title: language == 'en' ? 'Operation' : '操作',
            dataIndex: 'mark',
            key: 'mark',
            render: (text, record) => {
                return (<div>

                    <Button size='small' style={{ padding: '0 5px', borderRadius: '4px' }} onClick={() => this.runEnv(record['envName'], record['envId'])}>{language == 'en' ? 'Run' : '运行'}</Button>
                </div>
                )
            }
        }]
        return (
            <Modal
                title={language == 'en' ? 'Edit Mode Scene Time' : '模式场景时间编辑（' + modeInfo.name + '）'}
                visible={visible}
                onCancel={handleCancel}
                footer={null}
                maskClosable={false}
                width={800}
            >
                <Table
                    pagination={false}
                    bordered
                    loading={this.state.loading}
                    scroll={{ y: 526 }}
                    columns={columns}
                    size='small'
                    locale={{
                        emptyText: <Empty description={language == 'en' ? 'No scene data available' : "暂无场景数据"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }}
                    dataSource={this.state.dataSource}
                />
            </Modal>
        )
    }
}

export default EditModeEnvModalView