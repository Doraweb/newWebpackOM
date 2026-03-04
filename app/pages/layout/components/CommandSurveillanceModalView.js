import { Button, Col, DatePicker, Icon, Modal, Row, Spin, Table, Comment, Tooltip, Avatar } from 'antd'
import React, { Component } from 'react'
import http from '../../../common/http'
import s from './CommandSurveillanceModalView.css'
import ReactEcharts from '../../../lib/echarts-for-react'
import moment from 'moment'
import appConfig from '../../../common/appConfig'

const language = appConfig.language

const { RangePicker } = DatePicker
const FORMAT_TIME = 'YYYY-MM-DD HH:mm:00'
let urgentObj = {}

if (language == 'en') {
    urgentObj = {
        0: 'Optimization',
        1: 'One-click Switch',
        2: 'Standby Control',
        3: 'Protection'
    }
} else {
    urgentObj = {
        0: '优化类',
        1: '一键开关类',
        2: '待机控制类',
        3: '保护类'
    }
}

class HistoryCommandSurveillance extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [],
            loading: false,
            beginTime: moment().subtract(1, 'hour').format(FORMAT_TIME),
            endTime: moment().format(FORMAT_TIME)
        }
        this.columns = language == 'en' ? [
            {
                title: 'No',
                dataIndex: 'equipNo',
                key: 'equipNo',
                width: 45
            },
            {
                title: 'Attributes',
                dataIndex: 'equipType',
                key: 'equipType',
                width: 60
            },
            {
                title: 'Execution Time',
                dataIndex: 'actTime',
                key: 'actTime',
                width: 90
            },
            {
                title: 'Type',
                dataIndex: 'urgent',
                key: 'urgent',
                width: 60,
                render: (text) => {
                    return urgentObj[text]
                }
            },
            {
                title: 'Execution Content',
                dataIndex: 'content',
                key: 'content',
                width: 200
            },
            {
                title: 'Reason',
                dataIndex: 'reason',
                key: 'reason',
                width: 150
            },
            {
                title: 'Group Name',
                dataIndex: 'groupName',
                key: 'groupName',
                width: 80
            },
            {
                title: 'Level',
                dataIndex: 'important',
                key: 'important',
                width: 50
            },

            {
                title: 'Record ID',
                dataIndex: 'recordId',
                key: 'recordId',
                width: 50
            },
            {
                title: 'Room Prefix',
                dataIndex: 'roomName',
                key: 'roomName',
                width: 80
            },
            {
                title: 'Room Name',
                dataIndex: 'positionName',
                key: 'positionName',
                width: 80
            },
            {
                title: 'Relevant Points',
                dataIndex: 'relatedPointNameList',
                key: 'relatedPointNameList',
                width: 200
            },
            {
                title: 'Remarks',
                dataIndex: 'remark',
                key: 'remark',
                width: 60
            }
        ] : [
            {
                title: '设备号',
                dataIndex: 'equipNo',
                key: 'equipNo',
                width: 45
            },
            {
                title: '设备属性',
                dataIndex: 'equipType',
                key: 'equipType',
                width: 60
            },
            {
                title: '执行时间',
                dataIndex: 'actTime',
                key: 'actTime',
                width: 90
            },
            {
                title: '执行类型',
                dataIndex: 'urgent',
                key: 'urgent',
                width: 60,
                render: (text) => {
                    return urgentObj[text]
                }
            },
            {
                title: '执行内容',
                dataIndex: 'content',
                key: 'content',
                width: 200
            },
            {
                title: '策略执行动作原因',
                dataIndex: 'reason',
                key: 'reason',
                width: 150
            },
            {
                title: '分组名称',
                dataIndex: 'groupName',
                key: 'groupName',
                width: 80
            },
            // {
            //     title: '策略指令id',
            //     dataIndex: 'id',
            //     key: 'id',
            //     width:50
            // },
            {
                title: '等级',
                dataIndex: 'important',
                key: 'important',
                width: 50
            },

            {
                title: '记录id',
                dataIndex: 'recordId',
                key: 'recordId',
                width: 50
            },
            {
                title: '机房前缀',
                dataIndex: 'roomName',
                key: 'roomName',
                width: 80
            },
            {
                title: '机房名称',
                dataIndex: 'positionName',
                key: 'positionName',
                width: 80
            },
            {
                title: '相关点名',
                dataIndex: 'relatedPointNameList',
                key: 'relatedPointNameList',
                width: 200
            },
            {
                title: '备注',
                dataIndex: 'remark',
                key: 'remark',
                width: 60
            }
        ]
    }

    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible) {
            if (this.props.visible) {
                this.search()
            } else {
                this.setState({
                    beginTime: moment().subtract(1, 'hour').format(FORMAT_TIME),
                    endTime: moment().format(FORMAT_TIME)
                })
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.visible != this.props.visible) {
            return true
        }
        if (nextState.beginTime != this.state.beginTime) {
            return true
        }
        if (nextState.endTime != this.state.endTime) {
            return true
        }
        if (nextState.loading != this.state.loading) {
            return true
        }
        if (JSON.stringify(nextState.dataSource) != JSON.stringify(this.state.dataSource)) {
            return true
        }
        return false
    }

    search = () => {
        this.setLodaing(true)
        const { beginTime, endTime } = this.state
        http.post('/logicPush/getHistory', {
            beginTime: beginTime,
            endTime: endTime
        }).then(res => {
            if (res.err == 0) {
                this.setState({
                    dataSource: res.data
                })
            } else {
                Modal.error({
                    title: language == 'en' ? 'Tip' : '提示',
                    content: res.msg
                })
            }
            this.setLodaing(false)
        }).catch(err => {
            Modal.error({
                title: language == 'en' ? 'Tip' : '提示',
                content: language == 'en' ? 'The request for the query command record interface failed.' : '查询指令记录接口请求失败'
            })
            this.setLodaing(false)
        })
    }

    setLodaing = (flag) => {
        this.setState({
            loading: flag
        })
    }

    onChangeRangeTime = (value, dateString) => {
        this.setState({
            beginTime: dateString[0],
            endTime: dateString[1]
        })
    }

    disabledDate = (current) => {
        return current && current > moment().endOf('day');
    }

    changeTimeByType = (type) => {
        let { beginTime, endTime } = this.state
        if (type == 1) {
            beginTime = moment().subtract(1, 'hour').format(FORMAT_TIME)
            endTime = moment().format(FORMAT_TIME)
        } else if (type == 2) {
            beginTime = moment().startOf('day').format(FORMAT_TIME)
            endTime = moment().format(FORMAT_TIME)
        } else if (type == 3) {
            beginTime = moment(beginTime).subtract(1, 'day').startOf('day').format(FORMAT_TIME)
            endTime = moment(endTime).subtract(1, 'day').endOf('day').format(FORMAT_TIME)
        } else if (type == 4) {
            beginTime = moment(beginTime).add(1, 'day').startOf('day').format(FORMAT_TIME)
            endTime = moment(endTime).add(1, 'day').endOf('day').format(FORMAT_TIME)
        }
        this.setState({
            beginTime: beginTime,
            endTime: endTime
        }, () => {
            this.search()
        })
    }

    render() {
        const { dataSource, loading, beginTime, endTime } = this.state
        return (
            <Modal
                title={language == 'en' ? 'Historical Command Query' : '历史指令查询'}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                maskClosable={false}
                footer={null}
                width={1200}
            >
                <div>
                    <Button onClick={() => this.changeTimeByType(1)}>{language == 'en' ? 'In the past hour' : '近一小时'}</Button>
                    <Button onClick={() => this.changeTimeByType(2)}>{language == 'en' ? 'Today' : '今天'}</Button>
                    <Button onClick={() => this.changeTimeByType(3)}><Icon type="left" />{language == 'en' ? 'The previous day' : '前一天'}</Button>
                    <Button onClick={() => this.changeTimeByType(4)}>{language == 'en' ? 'The next day' : '后一天'}<Icon type="right" /></Button>
                    <RangePicker
                        disabledDate={this.disabledDate}
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm:00"
                        placeholder={['Start Time', 'End Time']}
                        value={[moment(beginTime), moment(endTime)]}
                        onChange={this.onChangeRangeTime}
                    />
                    <Button type='primary' onClick={() => this.search()}>{language == 'en' ? 'Query' : '查询'}</Button>
                </div>
                <div style={{ height: 560 }}>
                    <Table
                        dataSource={dataSource}
                        loading={loading}
                        columns={this.columns}
                        scroll={{
                            y: 460,
                            x: 2000
                        }}
                        pagination={{
                            pageSize: 15
                        }}
                    />
                </div>
            </Modal>
        )
    }
}

class CommandSurveillanceModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            data: {},
            historySearchVisible: false,
            historydata: []
        }
        this.container = null
        this.chart = null
        this.containerPie = null
        this.chartPie = null
        this.timer = null
    }

    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible) {
            if (this.props.visible) {
                this.getLogicPush()
            } else {
                clearTimeout(this.timer)
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.visible != this.props.visible) {
            return true
        }
        if (nextState.loading != this.state.loading) {
            return true
        }
        if (nextState.historySearchVisible != this.state.historySearchVisible) {
            return true
        }
        if (JSON.stringify(nextState.data) != JSON.stringify(this.state.data)) {
            return true
        }
        if (JSON.stringify(nextState.historydata) != JSON.stringify(this.state.historydata)) {
            return true
        }
        return false
    }

    setLoading = (flag) => {
        this.setState({
            loading: flag
        })
    }

    getHistoryOf30Min = () => {
        http.post('/logicPush/getHistory', {
            beginTime: moment().subtract(30, 'minutes').format(FORMAT_TIME),
            endTime: moment().format(FORMAT_TIME)
        }).then(res => {
            if (res.err == 0) {
                this.setState({
                    historydata: res.data.reverse()
                })
            }
            this.timer = setTimeout(() => {
                this.getHistoryOf30Min()
            }, 60000);
        }).catch(err => {
            this.timer = setTimeout(() => {
                this.getHistoryOf30Min()
            }, 60000);
        })
    }

    getLogicPush = () => {
        this.setLoading(true)
        http.get('/logicPush/static').then(res => {
            if (res.err == 0) {
                this.setState({ data: res.data })
                this.getHistoryOf30Min()
            } else {
                Modal.error({
                    title: language == 'en' ? 'Tip' : '提示',
                    content: res.msg
                })
            }
            this.setLoading(false)
        }).catch(err => {
            Modal.info({
                title: language == 'en' ? 'Tip' : '提示',
                content: language == 'en' ? 'The request for the command data acquisition interface failed.' : '指令数据获取接口请求失败'
            })
            this.props.onCancel()
            this.setLoading(false)
        })
    }

    saveChartRef = (refEchart) => {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }

    saveChartRefOfPie = (refEchart) => {
        if (refEchart) {
            this.chartPie = refEchart.getEchartsInstance();
        } else {
            this.chartPie = null;
        }
    }

    saveContainerRef = (container) => {
        this.container = container
    }

    saveContainerRefOfPie = (container) => {
        this.containerPie = container
    }

    getChartOptionOfBar = () => {
        const { oneClickStartStop, optimize, protect, standby } = this.state.data
        if (language == 'en') {
            return {
                title: {
                    text: '72H Cmd Monitor Chart',
                    subtext: 'Sort starting from the last hour',
                    subtextStyle: {
                        color: '#bbb'
                    },
                    textStyle: {
                        color: '#fff',
                        fontSize: 18,
                    },
                    left: 20
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    textStyle: {
                        color: '#fff'
                    }
                },
                grid: {
                    left: '3%',
                    right: '2%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: [...Array(73).keys()].map(i => i + 1),
                    axisLabel: { color: '#fff' },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#eee',
                            width: 1
                        }
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: { color: '#fff' },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#eee',
                            type: 'dashed'
                        },
                    },
                },
                series: [
                    {
                        name: 'One-click Switch',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        barMaxWidth: 30,
                        data: oneClickStartStop && oneClickStartStop['opTimesPerHour'] ? [...oneClickStartStop['opTimesPerHour']].reverse() : []
                    },
                    {
                        name: 'Optimization',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        data: optimize && optimize['opTimesPerHour'] ? [...optimize['opTimesPerHour']].reverse() : []
                    },
                    {
                        name: 'Protection',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        data: protect && protect['opTimesPerHour'] ? [...protect['opTimesPerHour']].reverse() : []
                    },
                    {
                        name: 'Standby Control',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        data: standby && standby['opTimesPerHour'] ? [...standby['opTimesPerHour']].reverse() : []
                    }
                ]
            }
        } else {
            return {
                title: {
                    text: '近72小时指令监测图',
                    subtext: '由近1小时开始排序',
                    subtextStyle: {
                        color: '#bbb'
                    },
                    textStyle: {
                        color: '#fff',
                        fontSize: 18,
                    },
                    left: 20
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    textStyle: {
                        color: '#fff'
                    }
                },
                grid: {
                    left: '3%',
                    right: '2%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: [...Array(73).keys()].map(i => i + 1),
                    axisLabel: { color: '#fff' },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#eee',
                            width: 1
                        }
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: { color: '#fff' },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#eee',
                            type: 'dashed'
                        },
                    },
                },
                series: [
                    {
                        name: '一键开关类',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        barMaxWidth: 30,
                        data: oneClickStartStop && oneClickStartStop['opTimesPerHour'] ? [...oneClickStartStop['opTimesPerHour']].reverse() : []
                    },
                    {
                        name: '优化类',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        data: optimize && optimize['opTimesPerHour'] ? [...optimize['opTimesPerHour']].reverse() : []
                    },
                    {
                        name: '保护类',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        data: protect && protect['opTimesPerHour'] ? [...protect['opTimesPerHour']].reverse() : []
                    },
                    {
                        name: '待机控制类',
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                            focus: 'series'
                        },
                        data: standby && standby['opTimesPerHour'] ? [...standby['opTimesPerHour']].reverse() : []
                    }
                ]
            }
        }

    }

    getChartOptionOfPie = () => {
        const { oneClickStartStop, optimize, protect, standby } = this.state.data

        let data = []
        if (oneClickStartStop && oneClickStartStop['totalOpTimes'] >= 0) {
            data.push({ value: oneClickStartStop['totalOpTimes'], name: language == 'en' ? 'One-click Switch' : oneClickStartStop['typeName'] })
        }
        if (optimize && optimize['totalOpTimes'] >= 0) {
            data.push({ value: optimize['totalOpTimes'], name: language == 'en' ? 'Optimization' : optimize['typeName'] })
        }
        if (protect && protect['totalOpTimes'] >= 0) {
            data.push({ value: protect['totalOpTimes'], name: language == 'en' ? 'Protection' : protect['typeName'] })
        }
        if (standby && standby['totalOpTimes'] >= 0) {
            data.push({ value: standby['totalOpTimes'], name: language == 'en' ? 'Standby Control' : standby['typeName'] })
        }
        return {
            // title: {
            //     text: '近72小时指令数量图',
            //     textStyle: {
            //         color: '#fff',
            //         fontSize: 18,
            //         fontWeight: 600
            //     },
            //     left: 'center'
            // },
            tooltip: {
                trigger: 'item'
            },
            series: [
                {
                    name: language == 'en' ? 'Number of Commands in the Past 72 Hours' : '近72小时指令数量',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '50%'],
                    emphasis: {
                        itemStyle: {
                            shadowColor: 'rgba(255, 255, 255, 1)'
                        }
                    },
                    label: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(255,255,255, 0.5)',
                        color: '#fff',
                        formatter: '{b}: {d}%',
                        fontSize: 12
                    },
                    data: data
                }
            ]
        }
    }

    showHistoryModal = () => {
        this.setState({
            historySearchVisible: true
        })
    }

    closeHistoryModal = () => {
        this.setState({
            historySearchVisible: false
        })
    }

    getCommandList = () => {
        const { historydata } = this.state
        if (historydata.length > 0) {
            return historydata.map(item => {
                return <div style={{ marginBottom: '-34px', marginTop: '-10px' }}>
                    <Comment
                        author={<a>{language == 'en' ? 'DOM AI Assistant' : 'DOM AI助手'}</a>}
                        avatar={
                            <Avatar style={{ backgroundColor: '#7265e6' }}>dom</Avatar>
                        }
                        content={
                            <p>
                                {item.positionName || item.roomName}：{item.reason}，{item.content}
                            </p>
                        }
                        datetime={
                            <Tooltip title={moment(item.actTime).format('YYYY-MM-DD HH:mm:ss')}>
                                <span>{moment(item.actTime).fromNow()}</span>
                            </Tooltip>
                        }
                    />
                </div>
            })
        } else {

        }
    }

    render() {
        const { loading, data, historySearchVisible } = this.state
        return (
            <Modal
                title={language == 'en' ? 'OM Command Monitoring' : 'OM指令监测'}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                maskClosable={false}
                footer={null}
                width={1200}
            >
                <Spin spinning={loading} tip={language == 'en' ? 'Data is being retrieved for the command.' : '正在获取指令数据'}>
                    <div style={{ height: 600 }}>
                        <div className={s['header']}>
                            <div className={s['box']}>
                                <h2>{language == 'en' ? 'Historical Execution Count' : '历史总执行次数'}
                                    <Icon type='history' title={language == 'en' ? 'Command Record Query' : '指令记录查询'} className={s['historySearch']} onClick={this.showHistoryModal} />
                                </h2>
                                <div className={s['box_value']}>{data.historyTotalOpTimes || data.historyTotalOpTimes == 0 ? data.historyTotalOpTimes : '--'}</div>
                            </div>
                            <div className={s['box']}>
                                <h2>{language == 'en' ? 'Execution Count This Year' : '今年总执行次数'}</h2>
                                <div className={s['box_value']}>{data.thisYearTotalOpTimes || data.thisYearTotalOpTimes == 0 ? data.thisYearTotalOpTimes : '--'}</div>
                            </div>
                            <div className={s['box']}>
                                <h2>{language == 'en' ? "Today's Execution Count" : '今日总执行次数'}</h2>
                                <div className={s['box_value']}>{data.todayTotalOpTimes || data.todayTotalOpTimes == 0 ? data.todayTotalOpTimes : '--'}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <div ref={this.saveContainerRef}>
                                <ReactEcharts
                                    style={{
                                        width: '1160px',
                                        height: '280px',
                                    }}
                                    ref={this.saveChartRef}
                                    option={this.getChartOptionOfBar()}
                                    notMerge={true}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <Row>
                                <Col span={8}>
                                    <div ref={this.saveContainerRefOfPie}>
                                        <ReactEcharts
                                            style={{
                                                width: '400px',
                                                height: '200px',
                                            }}
                                            ref={this.saveChartRefOfPie}
                                            option={this.getChartOptionOfPie()}
                                            notMerge={true}
                                        />
                                    </div>
                                </Col>
                                <Col span={16}>
                                    <div className={s['record']}>
                                        <div style={{ overflowY: 'auto', height: 160 }}>
                                            {this.getCommandList()}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <HistoryCommandSurveillance
                        visible={historySearchVisible}
                        onCancel={this.closeHistoryModal}
                    />
                </Spin>
            </Modal >
        )
    }
}

export default CommandSurveillanceModal