import { Button, Dropdown, Menu, Icon, Modal, Table, message, Spin, Descriptions, Avatar, Tag, DatePicker } from 'antd'
import React, { Component } from 'react'
import http from '../../../common/http'
import appConfig from '../../../common/appConfig'
import userImg from '../../../static/image/user.png'
import moment from 'moment'
import { ipcRenderer } from 'electron'

const language = appConfig.language
const MenuItem = Menu.Item
const DescriptionsItem = Descriptions.Item
const projectId = parseInt(appConfig.serverUrl.slice(-3))
appConfig.projectId = projectId

const tagStyle = {
    borderRadius: '6px',
    marginLeft: 10,
    cursor: 'pointer',
}
const tagStyle2 = {
    borderRadius: '6px',
    marginLeft: -20,
    position: 'absolute',
    marginTop: 30,
    zoom: 0.8,
    cursor: 'pointer',
}
const textStyle = {
    fontSize: '18px',
    fontWeight: 600
}
//定时推送数据弹窗
class DataModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [],
            errNum: 0,
            protectClick: false
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.visible != nextProps.visible) {
            if (nextProps.visible == true) {
                this.getDataList(nextProps.appPointView)
            }
            return true
        }
        if (this.props.updateTime !== nextProps.updateTime) {
            this.getDataList(nextProps.appPointView)
            return true
        }
        if (JSON.stringify(this.state.dataSource) != JSON.stringify(nextState.dataSource)) {
            return true
        }
        if (JSON.stringify(this.props.appPointView) != JSON.stringify(nextProps.appPointView)) {
            this.getDataList(nextProps.appPointView)
            return true
        }
        if (this.state.errNum != nextState.errNum) {
            return true
        }
        if (this.state.protectClick != nextState.protectClick) {
            return true
        }
        if (this.props.countDown != nextProps.countDown) {
            return true
        }
        return false
    }

    //获取数据推送
    getDataList = (data) => {
        if (data.EquipmentList) {
            let dataArr = []
            let pointList = []
            data.EquipmentList.map(group => {
                group.pointList.map(point => {
                    dataArr.push({ ...point, value: '--' })
                    pointList.push(point.pointName)
                })
            })
            let seen = new Set();
            dataArr = dataArr.filter(item => {
                let pointName = item.pointName;
                return seen.has(pointName) ? false : seen.add(pointName);
            })
            pointList = [...new Set(pointList)]

            http.post('/analysis/get_point_info_from_s3db', {
                pointList: pointList,
                lan: language
            }).then(res => {
                if (res.err == 0) {
                    res.data.realtimeValue.map(item => {
                        dataArr = dataArr.map(data => {
                            if (data.pointName == item.name) {
                                return {
                                    ...data,
                                    description: item.description,
                                    value: item.value ? Number(item.value).toFixed(2) : '',
                                    time: item.time,
                                    err: data.min && data.min > item.value ? -1 : data.max && data.max < item.value ? 1 : 0
                                }
                            } else {
                                return {
                                    ...data
                                }
                            }
                        })
                    })
                    let errNum = 0
                    dataArr.find(item => {
                        if (item.err && item.err != 0) {
                            errNum++
                        }
                    })
                    this.setState({
                        dataSource: dataArr,
                        errNum: errNum
                    })
                }
            }).catch(err => {
                this.setState({
                    dataSource: dataArr,
                    errNum: 0
                })
                console.log(err.message)
            })
        } else {
            this.setState({
                dataSource: [],
                errNum: 0
            })
        }
    }

    handleSubmit = (e) => {
        this.props.handleCancel()
        this.props.reportEvent({
            cloudUserId: appConfig.cloudUser.cloudUserId,
            projectId: projectId,
            eventContent: language == 'en' ? 'No abnormality' : '无异常',
            responseTimeSpanSeconds: parseInt((new Date().getTime() - this.props.updateTime) / 1000),
            ontimeOndutyChecklistStatus: 1,
        })
    }

    //异常处理
    errCheck = (record) => {
        this.setState({
            protectClick: true
        })
        setTimeout(() => {
            this.setState({
                protectClick: false
            })
        }, 200)
        this.props.reportEvent({
            cloudUserId: appConfig.cloudUser.cloudUserId,
            projectId: projectId,
            eventContent: language == 'en' ? 'Scheduled watch check item content' : '定时值守检查项内容',
            responseTimeSpanSeconds: parseInt((new Date().getTime() - this.props.updateTime) / 1000),
            ontimeOndutyChecklistStatus: 1,
            abnormalDataList: [{ point: record['pointName'], value: record['value'], max: record['max'], min: record['min'] }]
        })

        let dataSource = this.state.dataSource
        dataSource.map(item => {
            if (item.pointName == record['pointName']) {
                item['isChecked'] = true
            }
        })

        if (this.state.errNum == 1) {
            this.props.handleCancel()
        }
        this.setState({
            errNum: this.state.errNum - 1,
            dataSource: dataSource
        })
    }

    onMouseDown = (e) => {
        e.preventDefault()
        let isDragging = true
        let watchOver = document.querySelector('.watchOver')

        let startPosX = watchOver.style.marginLeft ? e.clientX - parseInt(watchOver.style.marginLeft) / 2 : e.clientX
        let startPosY = window.getComputedStyle(watchOver).marginTop ? e.clientY - parseInt(window.getComputedStyle(watchOver).marginTop) : e.clientY

        document.addEventListener('mousemove', drag)
        document.addEventListener('mouseup', dragEnd)

        function drag(event) {
            if (!isDragging) return

            const deltaX = event.clientX - startPosX
            const deltaY = event.clientY - startPosY

            if (deltaX < -1000 || deltaX > 800) return
            if (deltaY > 900) return
            watchOver.style.marginTop = `${deltaY}px`
            watchOver.style.marginLeft = `${deltaX * 2}px`
        }
        function dragEnd() {
            isDragging = false

            document.removeEventListener('mousemove', drag)
            document.removeEventListener('mouseup', dragEnd)
        }
    }


    render() {
        const columns = [
            {
                title: language == 'en' ? 'Point Name' : '点名',
                dataIndex: 'pointName',
                key: 'pointName',
                width: 240,
                render: (text, record) => {
                    if (record['value'] && record['value'] != '--') {
                        if (record['err'] == 1 || record['err'] == -1) {
                            return <div style={{ color: 'red', fontSize: '14px', fontWeight: '600', userSelect: 'text' }}>{text}</div>
                        } else {
                            return <div style={{ color: '#00FF99', fontSize: '14px', fontWeight: '600', userSelect: 'text' }}>{text}</div>
                        }
                    } else {
                        return <div>{text}</div>
                    }
                }
            },
            {
                title: language == 'en' ? 'Point Description' : '点释义',
                dataIndex: 'description',
                key: 'description',
                width: 300,
                render: (text, record) => {
                    if (record['value'] && record['value'] != '--') {
                        if (record['err'] == 1 || record['err'] == -1) {
                            return <div style={{ color: 'red', fontSize: '14px', fontWeight: '600' }}>{text}</div>
                        } else {
                            return <div style={{ color: '#00FF99', fontSize: '14px', fontWeight: '600' }}>{text}</div>
                        }
                    } else {
                        return <div>{text}</div>
                    }
                }
            },
            {
                title: language == 'en' ? 'Point Value' : '点值',
                dataIndex: 'value',
                key: 'value',
                width: 100,
                render: (text, record) => {
                    if (text && text != '--') {
                        if (record['err'] == 1 || record['err'] == -1) {
                            return <div style={{ color: 'red', fontSize: '18px', fontWeight: '600' }}>{text}</div>
                        } else {
                            return <div style={{ color: '#00FF99', fontSize: '18px', fontWeight: '600' }}>{text}</div>
                        }
                    } else {
                        return <div>{text}</div>
                    }
                }
            },
            {
                title: language == 'en' ? 'Range' : '范围',
                dataIndex: 'dataRange',
                key: 'dataRange',
                width: 150,
                render: (text, record) => {
                    return <div>
                        {record['min'] != undefined && record['min'] != "" ? record['min'] : '***'} - {record['max'] != undefined && record['max'] != "" ? record['max'] : '***'}
                    </div>
                }
            },
            {
                title: language == 'en' ? 'Action' : '处理',
                dataIndex: 'err',
                key: 'err',
                render: (text, record) => {
                    if (text == 1 || text == -1) {
                        if (record['isChecked']) {
                            return <div>{language == 'en' ? 'OK' : '已确认'}</div>
                        } else {
                            return <Button type='danger' size='small' disabled={this.state.protectClick} onClick={() => this.errCheck(record)}>{language == 'en' ? 'Confirm' : '确认'}</Button>
                        }
                    }
                }
            },
        ]
        return (
            <Modal
                title={(
                    <div onMouseDown={this.onMouseDown} style={{ cursor: 'move' }}>{language == 'en' ? 'Watch Data' : '值守数据'}</div>
                )}
                zIndex={1001}
                visible={this.props.visible}
                onCancel={this.props.handleCancel}
                width={820}
                closable={false}
                mask={false}
                footer={(
                    <div>
                        <span style={{ color: this.props.countDown <= 3 ? 'red' : '' }}>
                            {language == 'en' ? `Please confirm watch within ${this.props.countDown} minutes (unconfirmed watch will automatically go off duty)` : `请在 ${this.props.countDown} 分钟内确认值守（未确认值守将自动离岗）`}
                        </span>
                        <Button onClick={this.handleSubmit} disabled={this.state.errNum > 0}>{language == 'en' ? 'Confirm' : '确认'}</Button>
                    </div>
                )}
                maskClosable={false}
                wrapClassName='watchOver'
            >
                <div style={{ margin: -10 }}>
                    <Table
                        dataSource={this.state.dataSource}
                        columns={columns}
                        style={{ zoom: 0.9 }}
                        pagination={false}
                        size='small'
                        scroll={{
                            y: 400
                        }}
                    />
                </div>
            </Modal>
        )
    }
}

//值守人员分析弹窗
class UserStaticsModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userStaticsInfo: {},
            userStaticsDetail: {},
            userStaticsDetailVisible: false,
            columns: [],
            dataSource: [],
            detailName: '',
            time: moment().format('YYYY-MM-DD')
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.visible != nextProps.visible) {
            if (nextProps.visible) {
                this.getUserStaticsInfo(nextProps.userId)
            }
            return true
        }
        if (JSON.stringify(this.state.userStaticsInfo) != JSON.stringify(nextState.userStaticsInfo)) {
            return true
        }
        if (JSON.stringify(this.state.columns) != JSON.stringify(nextState.columns)) {
            return true
        }
        if (JSON.stringify(this.state.dataSource) != JSON.stringify(nextState.dataSource)) {
            return true
        }
        if (this.state.detailName != nextState.detailName) {
            return true
        }
        if (this.state.time != nextState.time) {
            return true
        }
        if (this.state.userStaticsDetailVisible != nextState.userStaticsDetailVisible) {
            return true
        }
        if (JSON.stringify(this.state.userStaticsDetail) != JSON.stringify(nextState.userStaticsDetail)) {
            return true
        }
        if (this.props.userName != nextProps.userName) {
            return true
        }
        if (this.props.userInfoLoading != nextProps.userInfoLoading) {
            return true
        }
        return false
    }

    getUserStaticsInfo = (userId) => {
        http.post('/onduty/getUserStaticsInfo', {
            cloudUserId: parseInt(userId),
            timeFrom: moment(this.state.time).format('YYYY-MM-DD 00:00:00'),
            timeTo: moment(this.state.time).format('YYYY-MM-DD 23:59:59')
        }).then(res => {
            if (res.err == 0) {
                this.setState({
                    userStaticsInfo: res.data
                })
            } else {
                Modal.error({
                    title: language == 'en' ? 'Tip' : '提示',
                    content: res.msg
                })
                this.setState({
                    userStaticsInfo: {}
                })
            }
            this.props.closeloading()
        }).catch(err => {
            this.setState({
                userStaticsInfo: {},
            })
            Modal.error({
                title: language == 'en' ? 'Tip' : '提示',
                content: err.message
            })
            this.props.closeloading()
        })

        http.post('/onduty/getUserStaticsDetail', {
            cloudUserId: parseInt(userId),
            timeFrom: moment(this.state.time).format('YYYY-MM-DD 00:00:00'),
            timeTo: moment(this.state.time).format('YYYY-MM-DD 23:59:59'),
            lan: language
        }).then(res => {
            if (res.err == 0) {
                this.setState({
                    userStaticsDetail: res.data
                })
            } else {
                this.setState({
                    userStaticsDetail: {}
                })
                console.log(res.msg)
            }
        }).catch(err => {
            this.setState({
                userStaticsDetail: {}
            })
            console.log(err.message)
        })
    }

    showUserStaticsDetailModal = (type) => {
        const { userStaticsDetail } = this.state
        if (JSON.stringify(userStaticsDetail) == '{}') {
            message.info(language == 'en' ? 'No watch detail information found, please check if backend version supports it' : '未发现值守详细信息，请检查后台版本是否支持')
            return
        }
        let dataSource = []
        let columns = []
        let name = ''

        if (type == 'dataAnalysis') {

            name = language == 'en' ? 'Data Query' : '数据查询'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Query Time' : '查询时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'dealWithSysOperation') {

            name = language == 'en' ? 'System Operation Intervention' : '干预设备运行'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Intervention Time' : '干预设备运行时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'editModEnv') {

            name = language == 'en' ? 'Edit Mode' : '编辑模式'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Edit Mode Time' : '编辑模式时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'ondutyAccumSeconds') {

            name = language == 'en' ? 'Total Watch Time' : '总值守时间'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Watch Time (minutes)' : '值守时间（分钟）',
                    dataIndex: 'seconds',
                    key: 'seconds',
                    render: (text) => {
                        return <div>{parseInt(Number(text) / 60)}{language == 'en' ? ' minutes' : '分钟'}</div>
                    }
                },
            ]

        } else if (type == 'ontimeOndutyCheck') {

            name = language == 'en' ? 'Watch Check Item Submissions' : '值守检查项提交次数'
            for (let projId in userStaticsDetail[type]) {
                dataSource.push(userStaticsDetail[type][projId])
            }
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Watch Check Item Submissions' : '值守检查项提交次数',
                    dataIndex: 'qty',
                    key: 'qty',
                },
            ]

        } else if (type == 'ontimeOndutyRespondSecondsAvg') {

            name = language == 'en' ? 'Average Watch Check Response Time' : '定时值守检查项平均响应时间'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Average Response Time (seconds)' : '值守检查项平均响应时间（秒）',
                    dataIndex: 'seconds',
                    key: 'seconds',
                },
            ]


        } else if (type == 'ontimeOndutySuccessRate') {

            name = language == 'en' ? 'Watch Check Submission Success Rate' : '定时值守检查项提交成功率'
            dataSource.push(userStaticsDetail[type])
            columns = [
                {
                    title: language == 'en' ? 'Total Submissions (including timeout auto-submit)' : '总提交次数（包含超时自动提交）',
                    dataIndex: 'total',
                    key: 'total',
                },
                {
                    title: language == 'en' ? 'Successful Submissions' : '成功提交次数',
                    dataIndex: 'success',
                    key: 'success',
                },
            ]

        } else if (type == 'ontimeOndutyTimeoutQty') {

            name = language == 'en' ? 'Watch Check Timeout Submissions' : '定时值守检查项超时提交'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Timeout Auto-submit Count' : '值守检查项超时自动提交次数',
                    dataIndex: 'qty',
                    key: 'qty',
                },
            ]

        } else if (type == 'respondWorkOrder') {

            name = language == 'en' ? 'Respond to Customer Work Orders' : '响应客户的发出的工单'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Work Order ID' : '响应客户的发出的工单id',
                    dataIndex: 'workOrderId',
                    key: 'workOrderId',
                },
                {
                    title: language == 'en' ? 'Response Time' : '响应时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'sendWorkOrder_EnergyVerify') {

            name = language == 'en' ? 'Issue Work Order - Energy Verification' : '发出工单-能效校核'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Work Order ID' : '发出的工单id',
                    dataIndex: 'workOrderId',
                    key: 'workOrderId',
                },
                {
                    title: language == 'en' ? 'Time' : '时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'sendWorkOrder_Maintain') {

            name = language == 'en' ? 'Issue Work Order - Maintenance Check' : '发出工单-维保检查'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Work Order ID' : '发出的工单id',
                    dataIndex: 'workOrderId',
                    key: 'workOrderId',
                },
                {
                    title: language == 'en' ? 'Issue Time' : '发出时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'sendWorkOrder_Risk') {

            name = language == 'en' ? 'Issue Work Order - Risk Hazard' : '发出工单-隐患风险'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Work Order ID' : '发出的工单id',
                    dataIndex: 'workOrderId',
                    key: 'workOrderId',
                },
                {
                    title: language == 'en' ? 'Issue Time' : '发出时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'sendWorkOrder_Usual') {

            name = language == 'en' ? 'Issue Work Order - General' : '发出工单-普通工单'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Work Order ID' : '发出的工单id',
                    dataIndex: 'workOrderId',
                    key: 'workOrderId',
                },
                {
                    title: language == 'en' ? 'Issue Time' : '发出时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        } else if (type == 'writeKnowledge') {

            name = language == 'en' ? 'Write Knowledge Base' : '写知识库'
            dataSource = userStaticsDetail[type]
            columns = [
                {
                    title: language == 'en' ? 'Project Name' : '项目名称',
                    dataIndex: 'projectName',
                    key: 'projectName',
                },
                {
                    title: language == 'en' ? 'Knowledge ID' : '写入知识的id',
                    dataIndex: 'knowledgeId',
                    key: 'knowledgeId',
                },
                {
                    title: language == 'en' ? 'Write Time' : '写入时间',
                    dataIndex: 'opTime',
                    key: 'opTime',
                },
            ]

        }

        this.setState({
            userStaticsDetailVisible: true,
            detailName: name,
            dataSource: dataSource,
            columns: columns
        })
    }

    closeUserStaticsDetailModal = () => {
        this.setState({
            userStaticsDetailVisible: false,
        })
    }

    changeTime = (date, dateString) => {
        this.setState({
            time: dateString
        })
    }

    disabledDate = (current) => {
        // Can not select days before today and today
        return current && current > moment().endOf('day');
    }

    search = () => {
        this.props.showloading()
        this.getUserStaticsInfo(this.props.userId)
    }

    handleCancel = () => {
        this.setState({
            time: moment().format('YYYY-MM-DD')
        })
        this.props.handleCancel()
    }

    render() {
        const { userStaticsInfo, detailName, dataSource, columns, userStaticsDetailVisible } = this.state
        const { todayVariation, userInfo } = userStaticsInfo
        return (
            <Modal
                title={language == 'en' ? 'Watch Personnel Information' : '值守人员信息'}
                visible={this.props.visible}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={null}
                width={900}
            >
                <Spin spinning={this.props.userInfoLoading}>
                    <div className='watchOver'>
                        <Descriptions bordered column={2}>
                            <DescriptionsItem label={language == 'en' ? 'Watch Personnel' : '值守人员'} span={2}>
                                <Avatar size={64} src={userInfo && userInfo.userPic ? appConfig.serverUrl + userInfo.userPic : userImg} alt={language == 'en' ? 'Failed to get' : '获取失败'}></Avatar>
                                <span style={{ marginLeft: 30, fontSize: '24px', fontWeight: 600 }}>{this.props.userName}</span>
                                （&nbsp;
                                <span>{language == 'en' ? 'Experience:' : '经验值：'}{userStaticsInfo.experience} &nbsp;&nbsp;</span>
                                <span>{language == 'en' ? 'Level:' : '等级：'}{parseInt(userStaticsInfo.experience / 100)}</span>
                                &nbsp;）
                                <div style={{ display: 'inline-block', float: 'right' }}>
                                    <DatePicker
                                        value={moment(this.state.time, 'YYYY-MM-DD')}
                                        format={'YYYY-MM-DD'}
                                        disabledDate={this.disabledDate}
                                        onChange={this.changeTime}
                                        size='small'
                                        style={{ width: 110, verticalAlign: 'top' }}
                                    />
                                    <Button size='small' onClick={this.search}>{language == 'en' ? 'Search' : '查询'}</Button>
                                </div>
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Cumulative Watch Time (minutes)' : '累积值守时间（分钟）'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.ondutyAccumSeconds ? parseInt(userStaticsInfo.ondutyAccumSeconds / 60) : '--'}
                                </span>
                                {
                                    todayVariation && todayVariation.ondutyAccumSeconds ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('ondutyAccumSeconds')} color="#00CC33" style={tagStyle}>+{parseInt(todayVariation.ondutyAccumSeconds / 60)}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Average Watch Response Time (seconds)' : '值守平均响应时间（秒）'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.ontimeOndutyRespondSecondsAvg}
                                </span>
                                {
                                    todayVariation && todayVariation.ontimeOndutyRespondSecondsAvg ?
                                        todayVariation.ontimeOndutyRespondSecondsAvg < 0 ?
                                            <Tag onClick={() => this.showUserStaticsDetailModal('ontimeOndutyRespondSecondsAvg')} color="#00CC33" style={tagStyle}>{parseInt(todayVariation.ontimeOndutyRespondSecondsAvg)}</Tag>
                                            :
                                            <Tag onClick={() => this.showUserStaticsDetailModal('ontimeOndutyRespondSecondsAvg')} color="#CC0000" style={tagStyle}>+{parseInt(todayVariation.ontimeOndutyRespondSecondsAvg)}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Watch Check Item Submissions' : '值守检查项提交次数'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.ontimeOndutyCheck}
                                </span>
                                {
                                    todayVariation && todayVariation.ontimeOndutyCheck ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('ontimeOndutyCheck')} color="#00CC33" style={tagStyle}>+{todayVariation.ontimeOndutyCheck}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Watch Submission Timeouts' : '值守提交超时次数'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.ontimeOndutyTimeoutQty}
                                </span>
                                {
                                    todayVariation && todayVariation.ontimeOndutyTimeoutQty ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('ontimeOndutyTimeoutQty')} color="#CC0000" style={tagStyle}>+{todayVariation.ontimeOndutyTimeoutQty}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Watch Submission Success Rate' : '值守提交成功比例'}>
                                <span style={textStyle}>
                                    {(Number(userStaticsInfo.ontimeOndutySuccessRate) * 100).toFixed(1)}%
                                </span>
                                {
                                    todayVariation && todayVariation.ontimeOndutySuccessRate ?
                                        todayVariation.ontimeOndutySuccessRate > 0 ?
                                            <Tag onClick={() => this.showUserStaticsDetailModal('ontimeOndutySuccessRate')} color="#00CC33" style={tagStyle}>+{(Number(todayVariation.ontimeOndutySuccessRate) * 100).toFixed(1)}%</Tag>
                                            :
                                            <Tag onClick={() => this.showUserStaticsDetailModal('ontimeOndutySuccessRate')} color="#CC0000" style={tagStyle}>{(Number(todayVariation.ontimeOndutySuccessRate) * 100).toFixed(1)}%</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'System Operation Interventions' : '干预系统运行次数'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.dealWithSysOperation}
                                </span>
                                {
                                    todayVariation && todayVariation.dealWithSysOperation ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('dealWithSysOperation')} color="#00CC33" style={tagStyle}>+{todayVariation.dealWithSysOperation}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Data Analysis Count' : '数据分析次数'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.dataAnalysis}
                                </span>
                                {
                                    todayVariation && todayVariation.dataAnalysis ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('dataAnalysis')} color="#00CC33" style={tagStyle}>+{todayVariation.dataAnalysis}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Edit Mode Scenarios' : '编辑模式场景次数'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.editModEnv}
                                </span>
                                {
                                    todayVariation && todayVariation.editModEnv ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('editModEnv')} color="#00CC33" style={tagStyle}>+{todayVariation.editModEnv}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Knowledge Base Writes' : '写知识库次数'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.writeKnowledge}
                                </span>
                                {
                                    todayVariation && todayVariation.writeKnowledge ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('writeKnowledge')} color="#00CC33" style={tagStyle}>+{todayVariation.writeKnowledge}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Customer Work Order Responses' : '响应客户发出的工单次数'}>
                                <span style={textStyle}>
                                    {userStaticsInfo.respondWorkOrder}
                                </span>
                                {
                                    todayVariation && todayVariation.respondWorkOrder ?
                                        <Tag onClick={() => this.showUserStaticsDetailModal('respondWorkOrder')} color="#00CC33" style={tagStyle}>+{todayVariation.respondWorkOrder}</Tag>
                                        :
                                        ''
                                }
                            </DescriptionsItem>
                            <DescriptionsItem label={language == 'en' ? 'Work Orders Issued' : '发出工单次数'} span={2}>
                                <Descriptions bordered column={4}>
                                    <DescriptionsItem label={language == 'en' ? 'Energy Verification' : '能效核查'}>
                                        <span style={textStyle}>
                                            {userStaticsInfo.sendWorkOrder_EnergyVerify}
                                        </span>
                                        {
                                            todayVariation && todayVariation.sendWorkOrder_EnergyVerify ?
                                                <Tag onClick={() => this.showUserStaticsDetailModal('sendWorkOrder_EnergyVerify')} color="#00CC33" style={tagStyle2}>+{todayVariation.sendWorkOrder_EnergyVerify}</Tag>
                                                :
                                                ''
                                        }
                                    </DescriptionsItem>
                                    <DescriptionsItem label={language == 'en' ? 'Maintenance Check' : '维保检查'}>
                                        <span style={textStyle}>
                                            {userStaticsInfo.sendWorkOrder_Maintain}
                                        </span>
                                        {
                                            todayVariation && todayVariation.sendWorkOrder_Maintain ?
                                                <Tag onClick={() => this.showUserStaticsDetailModal('sendWorkOrder_Maintain')} color="#00CC33" style={tagStyle2}>+{todayVariation.sendWorkOrder_Maintain}</Tag>
                                                :
                                                ''
                                        }
                                    </DescriptionsItem>
                                    <DescriptionsItem label={language == 'en' ? 'Safety Hazards' : '安全隐患'}>
                                        <span style={textStyle}>
                                            {userStaticsInfo.sendWorkOrder_Risk}
                                        </span>
                                        {
                                            todayVariation && todayVariation.sendWorkOrder_Risk ?
                                                <Tag onClick={() => this.showUserStaticsDetailModal('sendWorkOrder_Risk')} color="#00CC33" style={tagStyle2}>+{todayVariation.sendWorkOrder_Risk}</Tag>
                                                :
                                                ''
                                        }
                                    </DescriptionsItem>
                                    <DescriptionsItem label={language == 'en' ? 'General Work Orders' : '普通工单'}>
                                        <span style={textStyle}>
                                            {userStaticsInfo.sendWorkOrder_Usual}
                                        </span>
                                        {
                                            todayVariation && todayVariation.sendWorkOrder_Usual ?
                                                <Tag onClick={() => this.showUserStaticsDetailModal('sendWorkOrder_Usual')} color="#00CC33" style={tagStyle2}>+{todayVariation.sendWorkOrder_Usual}</Tag>
                                                :
                                                ''
                                        }
                                    </DescriptionsItem>
                                </Descriptions>
                            </DescriptionsItem>
                        </Descriptions>
                    </div>
                    <Modal
                        title={(language == 'en' ? 'Today ' : '今日') + detailName}
                        visible={userStaticsDetailVisible}
                        onCancel={this.closeUserStaticsDetailModal}
                        footer={null}
                        width={600}
                        style={{ marginTop: 50 }}
                    >
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            scroll={{
                                y: 300
                            }}
                            size='small'
                            style={{ margin: -14 }}
                            pagination={false}
                        />
                    </Modal>
                </Spin >
            </Modal >
        )
    }
}

class WatchOver extends Component {
    constructor(props) {
        super(props)
        this.state = {
            onlineUserList: [], //值守人员列表
            onduty: 0,  //0代表未上岗，1代表已上岗
            sendDataVisible: false,
            updateTime: 0,    //记录每次弹出时的时间戳
            countDown: 15,
            appPointView: {},
            userStaticsVisible: false,
            userStaticsId: '',
            userName: '',
            userInfoLoading: false,
        }
        this.timer = null   //值守人员列表接口计时器
        this.heartTimer = null   //值守心跳计时器
        this.sendDataTimer = null  //定时推送数据计时器
        this.countDownTimer = null  //倒计时
    }

    componentDidMount() {
        this.getConfig()
        this.getOnlineUserList(1)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(this.props.userInfo) != JSON.stringify(nextProps.userInfo)) {
            if (nextProps.userInfo.name != appConfig.cloudUser.cloudUserName) {
                clearTimeout(this.heartTimer)
                clearTimeout(this.sendDataTimer)
            }
            return true
        }
        if (this.state.onduty !== nextState.onduty) {
            return true
        }
        if (this.state.userStaticsVisible !== nextState.userStaticsVisible) {
            return true
        }
        if (this.state.userInfoLoading !== nextState.userInfoLoading) {
            return true
        }
        if (this.state.userStaticsId !== nextState.userStaticsId) {
            return true
        }
        if (this.state.userName !== nextState.userName) {
            return true
        }
        if (JSON.stringify(this.state.onlineUserList) !== JSON.stringify(nextState.onlineUserList)) {
            return true
        }
        if (JSON.stringify(this.state.appPointView) !== JSON.stringify(nextState.appPointView)) {
            return true
        }
        if (this.state.sendDataVisible !== nextState.sendDataVisible) {
            return true
        }
        if (this.state.updateTime !== nextState.updateTime) {
            return true
        }
        if (this.state.countDown !== nextState.countDown) {
            return true
        }
        return false
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
        clearTimeout(this.heartTimer)
        clearTimeout(this.sendDataTimer)
    }

    //获取值守数据推送配置
    getConfig = () => {
        http.post('/project/getConfigMul', {
            keyList: [
                "app_point_view"
            ]
        }).then(data => {
            //陪伴运维数据推送
            if (data.data && data.data.app_point_view != undefined) {
                this.setState({
                    appPointView: data.data.app_point_view
                })
            } else {
                this.setState({
                    appPointView: {}
                })
            }
        }).catch(err => {
            this.setState({
                appPointView: {}
            })
        })
    }

    //获取值守人员列表  type： 1代表整个软件初始化，2代表退出值守
    getOnlineUserList = (type) => {
        http.get('/onduty/onlineUserList').then(res => {
            if (res.err == 0) {
                let flag = 0
                let nextFlag = appConfig.onduty
                res.data.map(item => {
                    if (item.id == appConfig.cloudUser.cloudUserId && this.props.userInfo.name == appConfig.cloudUser.cloudUserName) {
                        flag = 1
                    }
                })
                this.setState({
                    onduty: flag,
                    onlineUserList: res.data
                })
                appConfig.onduty = flag
                if (flag == 1 && type == 1) {
                    this.sendHeart()
                    this.startQuarterlyTimer()
                } else if (flag == 0 && nextFlag == 1 && type != 2) {
                    this.checkOutFunc(0)
                }
            } else {
                this.setState({
                    onlineUserList: []
                })
            }
            this.timer = setTimeout(this.getOnlineUserList, 120000)
        }).catch(err => {
            this.setState({
                onlineUserList: []
            })
            this.timer = setTimeout(this.getOnlineUserList, 120000)
        })
    }

    //整点15分钟弹一次
    startQuarterlyTimer = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        // 计算下一个15分钟的时间
        let nextQuarterHour;
        if (currentMinutes < 15) {
            nextQuarterHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 15, 0, 0);
        } else if (currentMinutes < 30) {
            nextQuarterHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 30, 0, 0);
        } else if (currentMinutes < 45) {
            nextQuarterHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 45, 0, 0);
        } else {
            nextQuarterHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour + 1, 0, 0, 0);
        }

        const delay = nextQuarterHour.getTime() - now.getTime();
        this.setState({
            countDown: parseInt(delay / 1000 / 60 + 1)
        })
        this.sendDataTimer = setTimeout(() => {
            ipcRenderer.send('show-om-remind')
            this.startQuarterlyTimer(); // 递归调用，实现每15分钟执行一次
            this.showSendDataModalView()
        }, delay);
    }

    //在线值守人员下拉菜单
    getOnlineUserSelect = () => {
        const menu = (
            <Menu onClick={this.showUserStaticsModal}>
                {
                    this.state.onlineUserList.map((item, index) => {
                        return <MenuItem key={item.id}>
                            <Icon type="smile" theme="twoTone" style={{ fontSize: '16px' }} /> {item.userfullname}
                        </MenuItem>
                    })
                }
            </Menu>
        )
        return <Dropdown overlay={menu} placement="bottomCenter">
            <Icon type='user' style={{ color: '#00FF33', marginLeft: 15, marginRight: -10, cursor: 'pointer' }} />
        </Dropdown>
    }

    //展示值守人员信息弹窗
    showUserStaticsModal = (e) => {
        this.setState({
            userStaticsId: e.key,
            userStaticsVisible: true,
            userName: e.item.node.innerText,
            userInfoLoading: true
        })
    }

    //取消用户信息弹窗loading
    closeloading = () => {
        this.setState({
            userInfoLoading: false
        })
    }

    showloading = () => {
        this.setState({
            userInfoLoading: true
        })
    }

    //关闭值守人员信息弹窗
    closeUserStaticsModal = () => {
        this.setState({
            userStaticsId: '',
            userStaticsVisible: false
        })
    }

    //定时推送数据弹窗
    showSendDataModalView = () => {
        if (appConfig.onduty != 1) {
            clearTimeout(this.heartTimer)
            clearInterval(this.countDownTimer)
            clearTimeout(this.sendDataTimer)
            return
        }
        if (this.state.sendDataVisible && (new Date().getTime() - this.state.updateTime > 5 * 60 * 1000)) {
            this.reportEvent({
                cloudUserId: appConfig.cloudUser.cloudUserId,
                projectId: projectId,
                ontimeOndutyChecklistStatus: 0,
            })
            this.closeSendDataModalView()
            this.checkOutFunc(1)
        } else {
            this.setState({
                sendDataVisible: true,
                countDown: 15,
                updateTime: new Date().getTime()
            })
            clearInterval(this.countDownTimer)
            this.countDownTimer = setInterval(() => {
                this.setState({
                    countDown: this.state.countDown - 1
                })
            }, 60000)
        }
    }

    closeSendDataModalView = () => {
        ipcRenderer.send('stop-om-remind')
        clearInterval(this.countDownTimer)
        this.setState({
            sendDataVisible: false
        })
    }

    //推送定时值守检查项检查结果
    reportEvent = (data) => {
        http.post('/onduty/reportEvent', data).then(res => {
            if (res.err == 0) {
            } else {
                message.error(res.msg)
            }
        }).catch(err => {
            console.log(err.message)
        })
    }

    //进入值守
    checkIn = () => {
        Modal.confirm({
            title: language == 'en' ? 'Do you want to start watching this project?' : '是否要开始值守该项目？',
            content: language == 'en' ? 'After entering watch, you need to review push data every 15 minutes.' : '进入值守后，每15分钟需要审查一次推送数据。',
            onOk: () => {
                http.post('/onduty/checkin', {
                    cloudUserId: appConfig.cloudUser.cloudUserId,
                    projectId: projectId
                }).then(res => {
                    if (res.err == 0) {
                        appConfig.onduty = 1
                        clearTimeout(this.timer)
                        clearTimeout(this.sendDataTimer)
                        this.getConfig()
                        this.getOnlineUserList()
                        this.sendHeart()
                        this.showSendDataModalView()
                        this.startQuarterlyTimer()
                    } else {
                        Modal.error({
                            title: language == 'en' ? 'Tip' : '提示',
                            content: res.msg
                        })
                    }
                }).catch(err => {
                    Modal.error({
                        title: language == 'en' ? 'Tip' : '提示',
                        content: language == 'en' ? 'Watch check-in interface request failed, please upgrade backend version and try again.' : '值守上岗接口请求失败，请升级后台版本后重试。'
                    })
                })
            }
        })
    }

    //开始发送值守心跳
    sendHeart = () => {
        http.post('/onduty/reportHeartBeat', {
            cloudUserId: appConfig.cloudUser.cloudUserId,
        }).then(res => {
            if (res.err == 0) {

            } else {
                console.log(res.msg)
            }
            this.heartTimer = setTimeout(this.sendHeart, 120000)
        }).catch(err => {
            console.log(err.message)
            this.heartTimer = setTimeout(this.sendHeart, 120000)
        })
    }

    //退出值守
    checkOut = () => {
        Modal.confirm({
            title: language == 'en' ? 'Do you want to exit watch?' : '是否要退出值守？',
            content: language == 'en' ? 'After exiting watch, data push will no longer be performed' : '退出值守后，将不会再进行数据推送',
            onOk: () => {
                this.checkOutFunc(0)
            }
        })
    }

    checkOutFunc = (checkoutType) => {
        http.post('/onduty/checkout', {
            cloudUserId: appConfig.cloudUser.cloudUserId,
            projectId: projectId,
            checkoutType: checkoutType
        }).then(res => {
            if (res.err == 0) {
                appConfig.onduty = 0
                clearTimeout(this.heartTimer)
                clearTimeout(this.sendDataTimer)
                clearTimeout(this.timer)
                this.heartTimer = null
                this.getOnlineUserList(2)
            } else {
                Modal.error({
                    title: language == 'en' ? 'Tip' : '提示',
                    content: res.msg
                })
            }
        }).catch(err => {
            Modal.error({
                title: language == 'en' ? 'Tip' : '提示',
                content: err.message
            })
        })
    }

    render() {
        const {
            onduty,
            onlineUserList,
            sendDataVisible,
            updateTime,
            countDown,
            appPointView,
            userStaticsVisible,
            userStaticsId,
            userName,
            userInfoLoading
        } = this.state
        return (
            <div style={{ display: 'inline-block', marginLeft: 10 }}>
                {
                    this.props.userInfo.name == appConfig.cloudUser.cloudUserName ?
                        <div style={{ display: 'inline-block' }}>
                            {
                                onduty == 1 ?
                                    <Button type='danger' size='small' onClick={this.checkOut}>{language == 'en' ? 'Be off duty' : '离岗'}</Button>
                                    :
                                    <Button type='primary' size='small' onClick={this.checkIn}>{language == 'en' ? 'Go on duty' : '上岗'}</Button>
                            }
                        </div>
                        :
                        ''
                }
                {
                    onlineUserList.length > 0 ?
                        this.getOnlineUserSelect()
                        :
                        ''
                }
                <DataModal
                    visible={sendDataVisible}
                    handleCancel={this.closeSendDataModalView}
                    updateTime={updateTime}
                    reportEvent={this.reportEvent}
                    countDown={countDown}
                    appPointView={appPointView}
                />
                <UserStaticsModal
                    visible={userStaticsVisible}
                    handleCancel={this.closeUserStaticsModal}
                    userId={userStaticsId}
                    userName={userName}
                    userInfoLoading={userInfoLoading}
                    closeloading={this.closeloading}
                    showloading={this.showloading}
                />
            </div>
        )
    }
}

export default WatchOver