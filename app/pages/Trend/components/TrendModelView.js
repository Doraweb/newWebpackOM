import React from 'react';
import { Button, Modal, Form, InputNumber, DatePicker, Checkbox, Select, message, Icon, Switch, Table, Spin } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import PointModal from '../../debug/components/pointWatch/PointModalView';
import appConfig from '../../../common/appConfig';


const ButtonGroup = Button.Group;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
const language = appConfig.language

const offset = Number(localStorage.getItem('timezone') || 8)
let btnStyle, toggleSelectClass, toggleCalendarClass;
if (localStorage.getItem('serverOmd') == "persagy") {
    themeStyle = 'light';
    toggleModalClass = 'persagy-modal-style';
    btnStyle = {
        background: "rgba(255,255,255,1)",
        border: '1px solid rgba(195,198,203,1)',
        color: "rgba(38,38,38,1)",
        borderRadius: '4px',
        fontSize: "14px",
        fontFamily: 'MicrosoftYaHei',
        marginRight: '2px'
    }
    toggleSelectClass = 'persagy-historyModal-select-selection';
    toggleCalendarClass = 'persagy-historyModal-calendar-picker';
}
let str;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'trend-best'
} else {
    str = 'vertical-center-modal'
}

// 创建一个 Date 对象来表示当前时间
const currentDate = new Date();
// 使用 getTimezoneOffset() 方法获取当前时区与 GMT 时区的偏移量（以分钟为单位）
const offsetInMinutes = currentDate.getTimezoneOffset();
// 将偏移量从分钟转换为小时，取负号是因为 getTimezoneOffset() 返回的偏移方向与通常表示的时区偏移方向相反
const offsetInHours = -Math.round(offsetInMinutes / 60);

//获取时间范围
const getTimeRange = function (period, day) {
    let startTime, endTime;
    switch (period) {
        case 'day':
            startTime = moment().utcOffset(offset).startOf('day');
            endTime = moment().utcOffset(offset);
            break;
        case 'week':
            startTime = moment().utcOffset(offset).startOf('week');
            endTime = moment().utcOffset(offset);
            break;
        case 'month':
            startTime = moment().utcOffset(offset).startOf('month');
            endTime = moment().utcOffset(offset);
            break;
        case 'hour':
        default:
            startTime = moment().utcOffset(offset).subtract(1, 'hour');
            endTime = moment().utcOffset(offset);
            break;
    }
    return [startTime, endTime];
}
const ModalForm = Form.create()(class defaultModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            value: "m1",
            time: '',
            data: '',
            data2: '',
            timeFrom: '',
            timeTo: '',
            filterVisible: false,
            moreYSettingVisible: false,
            maxValue: 0,
            minValue: 0,
            type: '',
            maxChecked: false,
            minChecked: false,
            pointModalVisible: false,
            dataY1: {},
            dataY2: {},
            isLock: false,
            filterNum: 0, //被过滤掉多少个数据
            huanBiDayTime: '',
            dataY3: {},
            dataY4: {},
            isSetting: false,
            yAxisMaxMinWarning: {
                yMax: '',
                yMin: '',
                yWarningMax: '',
                yWarningMin: ''
            },
            huanBiChecked: false
        }
        this.handleSelect = this.handleSelect.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSwitchChange = this.onSwitchChange.bind(this);
        this.getData = this.getData.bind(this);
        this.setTimeRange = this.setTimeRange.bind(this);
        this.ExportData = this.ExportData.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.autoSearch != this.props.autoSearch && nextProps.autoSearch == false) {
            this.setState({
                dataY1: {},
                dataY2: {},
                huanBiChecked: false
            })
        }
        if (nextProps.tendencyData !== this.props.tendencyData && nextProps.autoSearch != false) {
            localStorage.setItem('newPoint', nextProps.tendencyData.point);
            if (nextProps.tendencyData.initTime || nextProps.tendencyData.initDate) {
                let startTime, endTime
                if (nextProps.tendencyData.initTime) {
                    endTime = moment(moment().utcOffset(offset)).isBefore(moment(nextProps.tendencyData.initTime).add(1, 'hour')) ? moment().utcOffset(offset).format(TIME_FORMAT) : moment(nextProps.tendencyData.initTime).add(1, 'hour').format(TIME_FORMAT)
                    startTime = moment(nextProps.tendencyData.initTime).subtract(1, 'hour').format(TIME_FORMAT)
                } else {
                    endTime = moment(nextProps.tendencyData.initDate).format('YYYY-MM-DD 23:59:59')
                    startTime = moment(nextProps.tendencyData.initDate).format('YYYY-MM-DD 00:00:00')
                }
                this.setState({
                    value: 'm1',
                    visible: nextProps.tendencyVisible,
                    data: nextProps.tendencyData.dataSource,
                    time: nextProps.tendencyData.time,
                    point: nextProps.tendencyData.point,
                    timeFrom: startTime,
                    timeTo: endTime,
                    dataY1: {},
                    dataY2: {},
                    huanBiDayTime: '',
                    isSetting: false
                })
                this.props.form.setFieldsValue({
                    range: [moment(startTime), moment(endTime)],
                    timeFormat: 'm1'
                });
                this.onSearch()
            } else {
                if (localStorage.getItem('lockPointTime')) {
                    let lockPointTime = JSON.parse(localStorage.getItem('lockPointTime'))
                    this.setState({
                        value: 'm1',
                        visible: nextProps.tendencyVisible,
                        data: nextProps.tendencyData.dataSource,
                        time: nextProps.tendencyData.time,
                        point: nextProps.tendencyData.point,
                        timeFrom: moment(lockPointTime.timeFrom).utcOffset(offset).format(TIME_FORMAT),
                        timeTo: moment(lockPointTime.timeTo).utcOffset(offset).format(TIME_FORMAT),
                        dataY1: {},
                        dataY2: {},
                        huanBiDayTime: '',
                        isSetting: false
                    })
                    this.props.form.setFieldsValue({
                        range: [moment(lockPointTime.timeFrom).utcOffset(offset), moment(lockPointTime.timeTo).utcOffset(offset)],
                        timeFormat: 'm1'
                    });
                    this.onSearch()
                } else {
                    this.setState({
                        value: 'm1',
                        visible: nextProps.tendencyVisible,
                        data: nextProps.tendencyData.dataSource,
                        time: nextProps.tendencyData.time,
                        point: nextProps.tendencyData.point,
                        timeFrom: moment().utcOffset(offset).subtract(1, 'hour').format(TIME_FORMAT),
                        timeTo: moment().utcOffset(offset).format(TIME_FORMAT),
                        dataY1: {},
                        dataY2: {},
                        huanBiDayTime: '',
                        isSetting: false
                    })
                    this.props.form.setFieldsValue({
                        range: [moment().utcOffset(offset).startOf('hour'), moment().utcOffset(offset)],
                        timeFormat: 'm1'
                    });
                    this.setTimeRange('hour')
                }
            }
        }
    }
    componentDidMount() {
        const { tendencyData } = this.props
        if (tendencyData.initTime || tendencyData.initDate) {
            let endTime, startTime
            if (tendencyData.initTime) {
                endTime = moment(moment().utcOffset(offset)).isBefore(moment(tendencyData.initTime).add(1, 'hour')) ? moment().utcOffset(offset).format(TIME_FORMAT) : moment(tendencyData.initTime).add(1, 'hour').format(TIME_FORMAT)
                startTime = moment(tendencyData.initTime).subtract(1, 'hour').format(TIME_FORMAT)
            } else {
                endTime = moment(tendencyData.initDate).format('YYYY-MM-DD 23:59:59')
                startTime = moment(tendencyData.initDate).format('YYYY-MM-DD 00:00:00')
            }
            this.setState({
                value: 'm1',
                data: tendencyData,
                time: tendencyData.time,
                point: tendencyData.point,
                timeFrom: startTime,
                timeTo: endTime,
                isSetting: false
            })
            this.props.form.setFieldsValue({
                range: [moment(startTime), moment(endTime)],
                timeFormat: 'm1'
            });
            this.onSearch();
        } else {
            this.setState({
                value: 'm1',
                data: tendencyData,
                time: tendencyData.time,
                point: tendencyData.point,
                timeFrom: moment().utcOffset(offset).subtract(1, 'hour').format(TIME_FORMAT),
                timeTo: moment().utcOffset(offset).format(TIME_FORMAT),
                isSetting: false
            })
            this.props.form.setFieldsValue({
                range: [moment().utcOffset(offset).startOf('hour'), moment().utcOffset(offset)],
                timeFormat: 'm1'
            });
            this.setTimeRange('hour');
        }
    }
    // shouldComponentUpdate(nextProps,nextState){
    //     if(nextProps.visible!==this.props.visible){
    //         return true
    //     }else{
    //         if(nextState==this.state){
    //             return false
    //         }else{
    //             return true
    //         }
    //     }
    // }
    onSearch() {
        if (this.state.huanBiChecked == true) {
            let diffDays
            if (this.state.huanBiDayTime) {
                diffDays = moment(this.state.huanBiDayTime).diff(moment(this.props.form.getFieldValue('range')[0]), 'days')
            } else {
                diffDays = -1
            }
            this.TodayHuanBi(diffDays, this.state.huanBiDayTime)
            return
        }

        let _this = this;
        _this.props.showChartLoading()
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            let timediff = moment(values.range[1]).diff(moment(values.range[0]), 'days')
            _this.setState({
                timeFrom: values.range[0].format(TIME_FORMAT),
                timeTo: values.range[1].format(TIME_FORMAT)
            })
            let pointList = localStorage.getItem('newPoint').split(',')
            // pointList = [`${localStorage.getItem('newPoint')}`]
            // console.log(pointList)
            let yAxisMaxMin = [{
                max: document.getElementById('Y1Max') ? document.getElementById('Y1Max').value : '',
                min: document.getElementById('Y1Min') ? document.getElementById('Y1Min').value : '',
            }, {
                max: document.getElementById('Y2Max') ? document.getElementById('Y2Max').value : '',
                min: document.getElementById('Y2Min') ? document.getElementById('Y2Min').value : '',
            }, {
                max: document.getElementById('Y3Max') ? document.getElementById('Y3Max').value : '',
                min: document.getElementById('Y3Min') ? document.getElementById('Y3Min').value : '',
            }, {
                max: document.getElementById('Y4Max') ? document.getElementById('Y4Max').value : '',
                min: document.getElementById('Y4Min') ? document.getElementById('Y4Min').value : '',
            }, {
                max: document.getElementById('Y5Max') ? document.getElementById('Y5Max').value : '',
                min: document.getElementById('Y5Min') ? document.getElementById('Y5Min').value : '',
            }]
            if (localStorage.getItem('lockPointList')) {
                _this.setState({
                    isLock: true
                })
                pointList = [...new Set([...pointList, ...JSON.parse(localStorage.getItem('lockPointList'))])]


                http.post('/get_history_data_padded', {
                    ...(language == 'en' ? { "lan": "en" } : {}),
                    // gmt: offsetInHours,
                    pointList: pointList,
                    timeStart: values.range[0].format(TIME_FORMAT),
                    timeEnd: values.range[1].format(TIME_FORMAT),
                    timeFormat: values.timeFormat,
                    onduty: appConfig.onduty,
                    cloudUserId: appConfig.cloudUser.cloudUserId,
                    projectId: appConfig.projectId
                }).then(res => {
                    if (res && !res.error) {
                        //obj1  obj2  obj3  代表3个Y轴折线数据
                        let obj1 = res.map[pointList[0]] ? { [pointList[0]]: res.map[pointList[0]] } : {}
                        let obj2 = res.map[pointList[1]] ? { [pointList[1]]: res.map[pointList[1]] } : {}
                        if (pointList.length == 2) {
                            _this.setState({
                                dataY1: obj2,
                                time: res.time,
                                data: obj1,
                                data2: '',
                                dataY2: {}
                            })
                            _this.props.renderChartNewY(res.time, { ...obj1, ...obj2 }, yAxisMaxMin)
                        } else {
                            let obj3 = res.map[pointList[2]] ? { [pointList[2]]: res.map[pointList[2]] } : {}
                            _this.setState({
                                dataY1: obj2,
                                time: res.time,
                                data: obj1,
                                data2: '',
                                dataY2: obj3
                            })
                            _this.props.renderChartNewY(res.time, { ...obj1, ...obj2, ...obj3 }, yAxisMaxMin)
                        }
                    } else {
                        Modal.destroyAll()
                        Modal.info({
                            title: '提示',
                            content: res.msg
                        })
                        if (moment().utcOffset(offset).isBefore(moment(values.range[0].format(TIME_FORMAT)))) {
                            this.props.form.setFieldsValue({
                                range: [moment().utcOffset(offset).startOf('day'), moment().utcOffset(offset)],
                            })
                        }
                        _this.props.hideChartLoading()
                    }
                }).catch(error => {
                    //结束请求，且请求不到数据时，界面展示空表
                    _this.props.saveChartOption({
                        tooltip: {
                            trigger: 'axis'
                        },
                        grid: {
                            top: '14%',
                            left: '4%',
                            right: '4%',
                            bottom: '4%',
                            containLabel: true
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: []
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value'
                            }
                        ],
                        series: [{
                            type: 'line',
                            endLabel: {
                                show: true
                            },
                            data: []
                        }]
                    })
                    Modal.error({
                        title: "警告",
                        content: "服务器通讯失败！",
                        zIndex: 1300
                    })
                })
            } else {
                let { dataY1, dataY2, dataY3, dataY4 } = _this.state
                if (JSON.stringify(dataY1) != "{}") {
                    for (let key in dataY1) {
                        pointList.push(key)
                    }
                }
                if (JSON.stringify(dataY2) != "{}") {
                    for (let key in dataY2) {
                        pointList.push(key)
                    }
                }
                pointList = [...new Set(pointList)]

                if (pointList.length == 1) {
                    _this.getData(
                        values.range[0].format(TIME_FORMAT),
                        values.range[1].format(TIME_FORMAT),
                        values.timeFormat
                    ).then(
                        (data) => {
                            if (data && !data.error) {
                                _this.setState({
                                    time: data.time,
                                    data: data.map,
                                    data2: ''
                                })
                                if (_this.state.maxChecked == true || _this.state.minChecked == true) {
                                    let filterNum = 0
                                    for (let i in data.map) {
                                        if (_this.state.maxChecked == true && _this.state.maxValue !== '' && typeof (_this.state.maxValue) == 'number') {
                                            data.map[i].map((item, index) => {
                                                if (Number(item) > Number(_this.state.maxValue)) {
                                                    data.map[i][index] = undefined
                                                    data.time[index] = undefined
                                                    filterNum++
                                                }
                                            })
                                        }
                                        if (_this.state.minChecked == true && _this.state.minValue !== '' && typeof (_this.state.minValue) == 'number') {
                                            data.map[i].map((item, index) => {
                                                if (Number(item) < Number(_this.state.minValue)) {
                                                    data.map[i][index] = undefined
                                                    data.time[index] = undefined
                                                    filterNum++
                                                }
                                            })
                                        }
                                        data.map[i] = data.map[i].filter((item) => {
                                            return item != undefined
                                        })
                                        data.time = data.time.filter((item) => {
                                            return item != undefined
                                        })
                                    }
                                    this.setState({
                                        filterNum: filterNum
                                    })
                                }
                                if (this.state.isSetting) {
                                    let yAxisMaxMinWarning = {
                                        yMax: document.getElementById('YMax') ? document.getElementById('YMax').value : '',
                                        yMin: document.getElementById('YMin') ? document.getElementById('YMin').value : '',
                                        yWarningMax: document.getElementById('YWarningMax') ? document.getElementById('YWarningMax').value : '',
                                        yWarningMin: document.getElementById('YWarningMin') ? document.getElementById('YWarningMin').value : ''
                                    }
                                    if (yAxisMaxMinWarning.yMax || yAxisMaxMinWarning.yMin || (yAxisMaxMinWarning.yWarningMax && yAxisMaxMinWarning.yWarningMin)) {
                                        _this.props.renderChart2(data, { map: {}, time: data.time }, '', yAxisMaxMinWarning);
                                    } else {
                                        _this.props.renderChart(data)
                                    }
                                } else {
                                    appConfig.iDB.pointLimit.get(appConfig.serverUrl + '_' + pointList[0]).then(res => {
                                        if (res && res.yAxisMaxMinWarning) {
                                            _this.props.renderChart2(data, { map: {}, time: data.time }, '', res.yAxisMaxMinWarning);
                                        } else {
                                            _this.props.renderChart(data)
                                        }
                                    }).catch(err => {
                                        _this.props.renderChart(data)
                                    })
                                }
                            } else {
                                Modal.destroyAll()

                                if (moment().utcOffset(offset).isBefore(moment(values.range[0].format(TIME_FORMAT)))) {
                                    this.props.form.setFieldsValue({
                                        range: [moment().utcOffset(offset).startOf('day'), moment().utcOffset(offset)],
                                    })
                                }
                                //结束请求，且请求不到数据时，界面展示空表
                                _this.props.saveChartOption({
                                    tooltip: {
                                        trigger: 'axis'
                                    },
                                    grid: {
                                        top: '14%',
                                        left: '4%',
                                        right: '4%',
                                        bottom: '4%',
                                        containLabel: true
                                    },
                                    xAxis: [
                                        {
                                            type: 'category',
                                            data: []
                                        }
                                    ],
                                    yAxis: [
                                        {
                                            type: 'value'
                                        }
                                    ],
                                    series: [{
                                        type: 'line',
                                        endLabel: {
                                            show: true
                                        },
                                        data: []
                                    }]
                                })
                                Modal.error({
                                    title: "警告",
                                    content: data.msg,
                                    zIndex: 1300
                                })
                            }
                        }
                    ).catch(error => {
                        //结束请求，且请求不到数据时，界面展示空表
                        _this.props.saveChartOption({
                            tooltip: {
                                trigger: 'axis'
                            },
                            grid: {
                                top: '14%',
                                left: '4%',
                                right: '4%',
                                bottom: '4%',
                                containLabel: true
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    data: []
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value'
                                }
                            ],
                            series: [{
                                type: 'line',
                                endLabel: {
                                    show: true
                                },
                                data: []
                            }]
                        })
                        Modal.error({
                            title: "警告",
                            content: "服务器通讯失败！",
                            zIndex: 1300
                        })
                    })
                } else {
                    http.post('/get_history_data_padded', {
                        ...(language == 'en' ? { "lan": "en" } : {}),
                        // gmt: offsetInHours,
                        pointList: pointList,
                        timeStart: values.range[0].format(TIME_FORMAT),
                        timeEnd: values.range[1].format(TIME_FORMAT),
                        timeFormat: values.timeFormat,
                        onduty: appConfig.onduty,
                        cloudUserId: appConfig.cloudUser.cloudUserId,
                        projectId: appConfig.projectId
                    }).then(res => {
                        if (res && !res.error) {
                            //obj1  obj2  obj3  代表3个Y轴折线数据
                            let obj1 = res.map[pointList[0]] ? { [pointList[0]]: res.map[pointList[0]] } : {}
                            let obj2 = res.map[pointList[1]] ? { [pointList[1]]: res.map[pointList[1]] } : {}
                            let obj3 = res.map[pointList[2]] ? { [pointList[2]]: res.map[pointList[2]] } : {}
                            let obj4 = res.map[pointList[3]] ? { [pointList[3]]: res.map[pointList[3]] } : {}
                            let obj5 = res.map[pointList[4]] ? { [pointList[4]]: res.map[pointList[4]] } : {}
                            if (pointList.length == 2) {
                                _this.setState({
                                    dataY1: obj2,
                                    time: res.time,
                                    data: obj1,
                                    data2: '',
                                    dataY2: {}
                                })
                                _this.props.renderChartNewY(res.time, { ...obj1, ...obj2 }, yAxisMaxMin)
                            } else if (pointList.length == 3) {
                                _this.setState({
                                    dataY1: obj2,
                                    time: res.time,
                                    data: obj1,
                                    data2: '',
                                    dataY2: obj3
                                })
                                _this.props.renderChartNewY(res.time, { ...obj1, ...obj2, ...obj3 }, yAxisMaxMin)
                            } else if (pointList.length == 4) {
                                _this.setState({
                                    dataY1: obj2,
                                    time: res.time,
                                    data: obj1,
                                    data2: '',
                                    dataY2: obj3,
                                    dataY3: obj4
                                })
                                _this.props.renderChartNewY(res.time, { ...obj1, ...obj2, ...obj3, ...obj4 }, yAxisMaxMin)
                            } else if (pointList.length == 5) {
                                _this.setState({
                                    dataY1: obj2,
                                    time: res.time,
                                    data: obj1,
                                    data2: '',
                                    dataY2: obj3,
                                    dataY3: obj4,
                                    dataY4: obj5
                                })
                                _this.props.renderChartNewY(res.time, { ...obj1, ...obj2, ...obj3, ...obj4, ...obj5 }, yAxisMaxMin)

                            }
                        } else {
                            Modal.destroyAll()
                            Modal.info({
                                title: '提示',
                                content: res.msg
                            })
                            if (moment().utcOffset(offset).isBefore(moment(values.range[0].format(TIME_FORMAT)))) {
                                this.props.form.setFieldsValue({
                                    range: [moment().utcOffset(offset).startOf('day'), moment().utcOffset(offset)],
                                })
                            }
                            _this.props.hideChartLoading()
                        }
                    }).catch(error => {
                        //结束请求，且请求不到数据时，界面展示空表
                        _this.props.saveChartOption({
                            tooltip: {
                                trigger: 'axis'
                            },
                            grid: {
                                top: '14%',
                                left: '4%',
                                right: '4%',
                                bottom: '4%',
                                containLabel: true
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    data: []
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value'
                                }
                            ],
                            series: [{
                                type: 'line',
                                endLabel: {
                                    show: true
                                },
                                data: []
                            }]
                        })
                        Modal.error({
                            title: "警告",
                            content: "服务器通讯失败！",
                            zIndex: 1300
                        })
                    })
                }
            }
        });
    }
    ExportData() {
        const { tendencyData } = this.props
        let pointList = []
        let pointData = []
        let reportName = '历史数据'
        let strStartTime = this.state.timeFrom
        let strEndTime = this.state.timeTo
        let timeData = this.state.time
        let { data, dataY1, dataY2 } = this.state

        if (data.dataSouce !== undefined) {
            let newdata = data.dataSouce
            Object.keys(newdata).map(item => {
                pointList.push(item)
            })

            pointData = timeData.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((iteml, i) => {
                    if (newdata[iteml] && newdata[iteml].length === 0) {
                        line[iteml] = ''
                    } else {
                        line[iteml] = newdata[iteml][row]
                    }

                })
                return line
            })
            http.post('/reportTool/genExcelReportByTableData', {
                reportName: reportName,
                strStartTime: strStartTime,
                strEndTime: strEndTime,
                headerList: [`${tendencyData.point}`],
                tableDataList: pointData,
                timeList: data.time,
                pointList: [`${tendencyData.point}`],
                lan: appConfig.language
            }).then(
                data => {
                    if (data.err === 0) {
                        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                    } else {
                        message.error('生成下载文件失败')
                    }
                }
            )
        } else {
            Object.keys(data).map(item => {
                pointList.push(item)
            })

            if (JSON.stringify(dataY1) != '{}') {
                Object.keys(dataY1).map(item => {
                    pointList.push(item)
                })
            }
            if (JSON.stringify(dataY2) != '{}') {
                Object.keys(dataY2).map(item => {
                    pointList.push(item)
                })
            }

            pointData = timeData.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((iteml, i) => {
                    if (data[iteml] && data[iteml].length !== 0) {
                        line[iteml] = data[iteml][row]
                    } else if (dataY1[iteml] && dataY1[iteml].length !== 0) {
                        line[iteml] = dataY1[iteml][row]
                    } else if (dataY2[iteml] && dataY2[iteml].length !== 0) {
                        line[iteml] = dataY2[iteml][row]
                    } else {
                        line[iteml] = ''
                    }
                })
                return line
            })
        }
        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: strStartTime,
            strEndTime: strEndTime,
            headerList: pointList,
            tableDataList: pointData,
            timeList: this.state.time,
            pointList: pointList,
            lan: appConfig.language
        }).then(
            data => {
                if (data.err === 0) {
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                } else {
                    message.error('生成下载文件失败')
                }
            }
        )
    }

    onSwitchChange() {
        let _this = this;
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            _this.getData(
                values.range[0].format(TIME_FORMAT),
                values.range[1].format(TIME_FORMAT),
                values.timeFormat
            ).then(
                (data) => {
                    if (!data.error) {
                        let arrValue = [], arrValues = []
                        //先判断点值是非数字还是数字类型
                        if (isNaN(Number(data[0].history[0].value))) {
                            //console.log('非数字')
                            //筛选去掉补齐的内容（error为true即自动补齐的）
                            for (let i = 0; i < data.length; i++) {
                                arrValue = data[i].history.filter(
                                    (row) => {
                                        if (!row.error) {
                                            return row
                                        }
                                    }
                                )
                                //将原data里的数值数组替换成筛选后的
                                data[i].history = arrValue
                            }
                            //console.log(data)
                        }
                        //如果点值为数字类型，补齐的值将为undefind,但条目数量不变，提供给echart的数据视图
                        for (let i = 0; i < data.length; i++) {
                            arrValue = data[i].history.map(
                                (row) => {
                                    if (!row.error) {
                                        return row.value
                                    }
                                }
                            )
                            arrValues.push(arrValue)
                        }
                        let arrName = data.map(
                            (row) => {
                                return row.name
                            }
                        )
                        let obj = {}
                        arrName.forEach(
                            (item, index) => {
                                obj[item] = arrValues[index]
                            }
                        )
                        let arrTime = data[0].history.map(
                            (row) => {
                                return row.time
                            }
                        )
                        let arrData = {
                            data: obj,
                            timeStamp: arrTime
                        }
                        //判断点值是非数字还是数字类型，调用对应方法
                        if (isNaN(Number(arrValue[0]))) {
                            _this.renderTextarea(data, obj);
                        } else {
                            _this.props.renderChart(arrData);
                        }
                    } else {
                        message.error("no history data");
                    }
                }
            )
        });
    }

    getData(timeStart, timeEnd, timeFormat) {
        return http.post('/get_history_data_padded', {
            ...(language == 'en' ? { "lan": "en" } : {}),
            // gmt: offsetInHours,
            pointList: [`${localStorage.getItem('newPoint')}`],
            timeStart: `${moment(timeStart).format('YYYY-MM-DD HH:mm')}:00`,
            timeEnd: `${moment(timeEnd).format('YYYY-MM-DD HH:mm')}:00`,
            timeFormat: timeFormat,
            onduty: appConfig.onduty,
            cloudUserId: appConfig.cloudUser.cloudUserId,
            projectId: appConfig.projectId
        }).catch(
            (error) => {
                Modal.error({
                    title: "警告",
                    content: "服务器通讯失败！",
                    zIndex: 1300
                })
            }
        )
    }

    handleSelect(value) {
        this.setState({
            value: value
        })
    }

    setTimeRange(period) {
        const nowRange = this.props.form.getFieldValue('range')
        const range = getTimeRange(period)
        switch (period) {
            case 'nextday':
                this.props.form.setFieldsValue({
                    range: [moment(nowRange[0]).add(1, 'days').startOf('day'), moment(nowRange[0]).add(1, 'days').endOf('day')],
                    timeFormat: 'm1'
                });
                break;
            case 'lastday':
                this.props.form.setFieldsValue({
                    range: [moment(nowRange[0]).subtract(1, 'days').startOf('day'), moment(nowRange[0]).subtract(1, 'days').endOf('day')],
                    timeFormat: 'm1'
                });
                break;
            case 'hour':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'm1'
                });
                break;
            case 'day':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'm1'
                });
                break;
            case 'week':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'h1'
                }); break;
            case 'month':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'd1'
                }); break;
            default:
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'm1'
                });
                break;
        }
        this.onSearch();
    }

    onOffHuanBi = (e) => {
        this.setState({
            huanBiChecked: e.target.checked
        })
    }

    selectHuanBiDay = () => {
        let startTime = this.props.form.getFieldValue('range')[0]
        Modal.confirm({
            title: language == 'en' ? 'Select a Specified Date for Data Comparison' : '选择指定日期环比',
            zIndex: 1003,
            icon: <Icon type="diff" theme="twoTone" />,
            content: (
                <div style={{ marginTop: 20 }}>
                    <div style={{ marginBottom: 15 }}>
                        <span>{language == 'en' ? 'Currently Selected Start Time' : '当前所选定时间起点'}：<span style={{ marginLeft: 11 }}>{startTime.format('YYYY-MM-DD')}</span></span>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                        <span>{language == 'en' ? 'Comparison Date' : '选择日环比时间起点'}：</span>
                        <DatePicker
                            style={{ width: 140 }}
                            disabledDate={this.disabledDate}
                            onChange={this.onChangeHuanBiDay}
                            defaultValue={this.state.huanBiDayTime ? moment(this.state.huanBiDayTime) : moment(startTime).add(-1, 'days')} format={'YYYY-MM-DD'}
                        />
                    </div>
                    <div>
                        {language == 'en' ? 'Data Comparison Enabled' : '日环比启用'} ：<Checkbox onChange={this.onOffHuanBi} defaultChecked={this.state.huanBiChecked}></Checkbox>
                    </div>
                </div>
            ),
            onOk: () => {
                if (this.state.huanBiChecked == true) {
                    let diffDays
                    if (this.state.huanBiDayTime) {
                        diffDays = moment(this.state.huanBiDayTime).diff(moment(startTime), 'days')
                    } else {
                        diffDays = -1
                        this.setState({
                            huanBiDayTime: moment(startTime).add(-1, 'days').format('YYYY-MM-DD')
                        })
                    }
                    this.TodayHuanBi(diffDays, this.state.huanBiDayTime)
                }
            }
        })
    }

    onChangeHuanBiDay = (date, dateString) => {
        this.setState({
            huanBiDayTime: dateString
        })
    }

    disabledDate = (current) => {
        // Can not select days before today and today
        return current && current >= moment().utcOffset(offset).endOf('day');
    }

    TodayHuanBi(days, type) {

        if (JSON.stringify(this.state.dataY1) != '{}') {
            Modal.info({
                title: language == 'en' ? 'Warning' : '提示',
                content: language == 'en' ? 'The overlay bitmap currently does not support the daily sequential comparison and daily year-on-year comparison functions.' : '叠加点位图暂不支持日环比、日同比功能',
                zIndex: 1003
            })
            return
        }

        let _this = this;
        let data1, data2, starTime, endTime, _starTime, _endTime
        _this.props.showChartLoading()
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            starTime = values.range[0].format(TIME_FORMAT)
            endTime = values.range[1].format(TIME_FORMAT)
            _starTime = moment(starTime).add(days, 'days').format(TIME_FORMAT)
            _endTime = moment(endTime).add(days, 'days').format(TIME_FORMAT)
            _this.getData(
                starTime,
                endTime,
                values.timeFormat
            ).then(
                (data) => {
                    if (!data.error) {
                        _this.setState({
                            time: data.time,
                            data: data.map,
                            type: type
                        })
                        data1 = JSON.parse(JSON.stringify(data))
                        _this.getData(
                            _starTime,
                            _endTime,
                            values.timeFormat
                        ).then(
                            (data) => {
                                if (!data.error) {
                                    _this.setState({
                                        data2: data.map
                                    })
                                    data2 = JSON.parse(JSON.stringify(data))

                                    if (_this.state.maxChecked == true || _this.state.minChecked == true) {
                                        let filterNum = 0
                                        for (let i in data2.map) {
                                            if (_this.state.maxChecked == true && _this.state.maxValue !== '' && typeof (_this.state.maxValue) == 'number') {
                                                data2.map[i].map((item, index) => {
                                                    if (Number(item) > Number(_this.state.maxValue)) {
                                                        data2.map[i][index] = undefined
                                                        data2.time[index] = undefined
                                                        filterNum++
                                                    }
                                                })
                                            }
                                            if (_this.state.minChecked == true && _this.state.minValue !== '' && typeof (_this.state.minValue) == 'number') {
                                                data2.map[i].map((item, index) => {
                                                    if (Number(item) < Number(_this.state.minValue)) {
                                                        data2.map[i][index] = undefined
                                                        data2.time[index] = undefined
                                                        filterNum++
                                                    }
                                                })
                                            }
                                            data2.map[i] = data2.map[i].filter((item) => {
                                                return item != undefined
                                            })
                                            data2.time = data2.time.filter((item) => {
                                                return item != undefined
                                            })
                                        }
                                        for (let i in data1.map) {
                                            if (_this.state.maxChecked == true && _this.state.maxValue !== '' && typeof (_this.state.maxValue) == 'number') {
                                                data1.map[i].map((item, index) => {
                                                    if (Number(item) > Number(_this.state.maxValue)) {
                                                        data1.map[i][index] = undefined
                                                        data1.time[index] = undefined
                                                        filterNum++
                                                    }
                                                })
                                            }
                                            if (_this.state.minChecked == true && _this.state.minValue !== '' && typeof (_this.state.minValue) == 'number') {
                                                data1.map[i].map((item, index) => {
                                                    if (Number(item) < Number(_this.state.minValue)) {
                                                        data1.map[i][index] = undefined
                                                        data1.time[index] = undefined
                                                        filterNum++
                                                    }
                                                })
                                            }
                                            data1.map[i] = data1.map[i].filter((item) => {
                                                return item != undefined
                                            })
                                            data1.time = data1.time.filter((item) => {
                                                return item != undefined
                                            })
                                        }

                                        this.setState({
                                            filterNum: filterNum
                                        })
                                    }

                                    _this.props.renderChart2(data1, data2, type)
                                }
                            }
                        )
                    }
                }
            )
        });
    }

    showModal = () => {
        if (JSON.stringify(this.state.dataY1) != '{}') {
            this.setState({
                moreYSettingVisible: true
            })
        } else {
            this.setState({
                filterVisible: true
            }, () => {
                appConfig.iDB.pointLimit.get(appConfig.serverUrl + '_' + this.props.tendencyData.point).then(res => {
                    if (res && res.yAxisMaxMinWarning) {
                        this.setState({
                            yAxisMaxMinWarning: {
                                yMax: res.yAxisMaxMinWarning.yMax,
                                yMin: res.yAxisMaxMinWarning.yMin,
                                yWarningMax: res.yAxisMaxMinWarning.yWarningMax,
                                yWarningMin: res.yAxisMaxMinWarning.yWarningMin
                            }
                        })
                    } else {
                        this.setState({
                            yAxisMaxMinWarning: {
                                yMax: '',
                                yMin: '',
                                yWarningMax: '',
                                yWarningMin: ''
                            }
                        })
                    }
                }).catch(err => {
                    this.setState({
                        yAxisMaxMinWarning: {
                            yMax: '',
                            yMin: '',
                            yWarningMax: '',
                            yWarningMin: ''
                        }
                    })
                })
            })

        }
    }

    handleOk = (e) => {
        let { time, data, dataY1, dataY2, maxValue, minValue } = this.state
        if (JSON.stringify(dataY1) != '{}') {
            let yAxisMaxMin = [{
                max: document.getElementById('Y1Max') ? document.getElementById('Y1Max').value : '',
                min: document.getElementById('Y1Min') ? document.getElementById('Y1Min').value : '',
            }, {
                max: document.getElementById('Y2Max') ? document.getElementById('Y2Max').value : '',
                min: document.getElementById('Y2Min') ? document.getElementById('Y2Min').value : '',
            }, {
                max: document.getElementById('Y3Max') ? document.getElementById('Y3Max').value : '',
                min: document.getElementById('Y3Min') ? document.getElementById('Y3Min').value : '',
            }]

            this.props.renderChartNewY(time, { ...data, ...dataY1, ...dataY2 }, yAxisMaxMin)

            this.setState({
                moreYSettingVisible: false,
            })
        } else {
            const { tendencyData } = this.props
            let yAxisMaxMinWarning = {
                yMax: document.getElementById('YMax') ? document.getElementById('YMax').value : '',
                yMin: document.getElementById('YMin') ? document.getElementById('YMin').value : '',
                yWarningMax: document.getElementById('YWarningMax') ? document.getElementById('YWarningMax').value : '',
                yWarningMin: document.getElementById('YWarningMin') ? document.getElementById('YWarningMin').value : ''
            }
            const { yWarningMax, yWarningMin, yMax, yMin } = yAxisMaxMinWarning

            if ((yWarningMax === '' && yWarningMin !== '') || (yWarningMax !== '' && yWarningMin === '')) {
                Modal.info({
                    title: language == 'en' ? 'Warning' : "提示",
                    content: language == 'en' ? 'Both the upper warning limit and the lower warning limit must be filled in.' : "警告高限和警告低限必须同时填写",
                    zIndex: 1100
                })
                return
            } else if ((yWarningMax !== '' && yWarningMin !== '') && (Number(yWarningMax) <= Number(yWarningMin))) {
                Modal.info({
                    title: language == 'en' ? 'Warning' : "提示",
                    content: language == 'en' ? 'The upper warning limit must be greater than the lower warning limit.' : "警告高限必须大于警告低限",
                    zIndex: 1100
                })
                return
            } else if ((yWarningMax !== '' && yWarningMin !== '') || yMax !== '' || yMin !== '') {
                appConfig.iDB.pointLimit.put({
                    pointNameId: appConfig.serverUrl + '_' + tendencyData.point,
                    yAxisMaxMinWarning: {
                        'yWarningMax': yWarningMax,
                        'yWarningMin': yWarningMin,
                        'yMax': yMax,
                        'yMin': yMin
                    }
                })
            } else if (yWarningMax == '' && yWarningMin == '' && yMax == '' && yMin == '') {
                appConfig.iDB.pointLimit.delete(appConfig.serverUrl + '_' + tendencyData.point)
            }

            if (maxValue != '' && minValue != '') {
                if (maxValue <= minValue) {
                    Modal.error({
                        title: language == 'en' ? 'Warning' : "提示",
                        content: language == 'en' ? 'The lower limit must be greater than the upper limit.' : "低限必须大于高限！"
                    })
                    return
                }
            }
            this.setState({
                filterVisible: false,
                isSetting: true
            })
            let data11 = this.state.data
            let data22 = this.state.data2
            let time = this.state.time
            let data_1 = [], data_2 = [], time_1 = []
            let data = {}, data2 = {}
            let filterNum = 0
            data[`${tendencyData.point}`] = data11[`${tendencyData.point}`]
            data2[`${tendencyData.point}`] = data22[`${tendencyData.point}`]
            if (this.state.maxChecked == true && this.state.minChecked == false) {
                data[`${tendencyData.point}`] = data[`${tendencyData.point}`].map((item, index) => {
                    if (item < this.state.maxValue) {
                        return item
                    } else {
                        filterNum++
                    }
                })
                for (let i = 0, j = 0, z = 0; i < data[`${tendencyData.point}`].length; i++) {
                    if (data[`${tendencyData.point}`][i] != undefined) {
                        data_1[j++] = data[`${tendencyData.point}`][i]
                        time_1[z++] = time[i]
                    }
                }
                data[`${tendencyData.point}`] = data_1
                if (data22 != '' && data22 != [] && data22 != undefined) {
                    data2[`${tendencyData.point}`] = data2[`${tendencyData.point}`].map((item, index) => {
                        if (item < this.state.maxValue) {
                            return item
                        }
                    })
                    for (let i = 0, j = 0, z = 0; i < data2[`${tendencyData.point}`].length; i++) {
                        if (data2[`${tendencyData.point}`][i] != undefined) {
                            data_2[j++] = data2[`${tendencyData.point}`][i]
                        }
                    }
                    data2[`${tendencyData.point}`] = data_2
                }
            } else if (this.state.maxChecked == false && this.state.minChecked == true) {
                data[`${tendencyData.point}`] = data[`${tendencyData.point}`].map((item, index) => {
                    if (item > this.state.minValue) {
                        return item
                    } else {
                        filterNum++
                    }
                })
                for (let i = 0, j = 0, z = 0; i < data[`${tendencyData.point}`].length; i++) {
                    if (data[`${tendencyData.point}`][i] != undefined) {
                        data_1[j++] = data[`${tendencyData.point}`][i]
                        time_1[z++] = time[i]
                    }
                }
                data[`${tendencyData.point}`] = data_1
                if (data22 != '' && data22 != [] && data22 != undefined) {
                    data2[`${tendencyData.point}`] = data2[`${tendencyData.point}`].map((item, index) => {
                        if (item > this.state.minValue) {
                            return item
                        }
                    })
                    for (let i = 0, j = 0, z = 0; i < data2[`${tendencyData.point}`].length; i++) {
                        if (data2[`${tendencyData.point}`][i] != undefined) {
                            data_2[j++] = data2[`${tendencyData.point}`][i]
                        }
                    }
                    data2[`${tendencyData.point}`] = data_2
                }
            } else if (this.state.maxChecked == true && this.state.minChecked == true) {
                data[`${tendencyData.point}`] = data[`${tendencyData.point}`].map((item, index) => {
                    if (item > this.state.minValue && item < this.state.maxValue) {
                        return item
                    } else {
                        filterNum++
                    }
                })
                for (let i = 0, j = 0, z = 0; i < data[`${tendencyData.point}`].length; i++) {
                    if (data[`${tendencyData.point}`][i] != undefined) {
                        data_1[j++] = data[`${tendencyData.point}`][i]
                        time_1[z++] = time[i]
                    }
                }
                data[`${tendencyData.point}`] = data_1
                if (data22 != '' && data22 != [] && data22 != undefined) {
                    data2[`${tendencyData.point}`] = data2[`${tendencyData.point}`].map((item, index) => {
                        if (item > this.state.minValue && item < this.state.maxValue) {
                            return item
                        }
                    })
                    for (let i = 0, j = 0, z = 0; i < data2[`${tendencyData.point}`].length; i++) {
                        if (data2[`${tendencyData.point}`][i] != undefined) {
                            data_2[j++] = data2[`${tendencyData.point}`][i]
                        }
                    }
                    data2[`${tendencyData.point}`] = data_2
                }
            } else {
                if (data2 != '' && data2 != [] && data2 != undefined) {
                    this.props.renderChart2({ map: data, time: time }, { map: data2, time: time }, this.state.type, yAxisMaxMinWarning)
                } else {
                    this.props.renderChart({ map: data, time: time }, yAxisMaxMinWarning)
                }
                return
            }

            this.setState({
                filterNum: filterNum,
            })

            if (data2 != '' && data2 != [] && data2 != undefined) {
                this.props.renderChart2({ map: data, time: time_1 }, { map: data2, time: time_1 }, this.state.type, yAxisMaxMinWarning)
            } else {
                this.props.renderChart({ map: data, time: time_1 == [] }, yAxisMaxMinWarning)
            }
        }
    }

    handleCancel = (e) => {
        this.setState({
            filterVisible: false,
            moreYSettingVisible: false
        });
    }

    onMaxChange = (value) => {
        this.setState({
            maxValue: value
        })
    }

    onMinChange = (value) => {
        this.setState({
            minValue: value
        })
    }

    onOffMaxChange = (e) => {
        this.setState({
            maxChecked: e.target.checked
        })
    }

    onOffMinChange = (e) => {
        this.setState({
            minChecked: e.target.checked
        })
    }

    showPointModal = () => {
        this.setState({ pointModalVisible: true })
    }

    hidePointModal = () => {
        this.setState({ pointModalVisible: false })
    }

    //选择的点
    addWatchPoints = (willAddPoints) => {
        this.addNewYData(willAddPoints[0])
    }

    addNewYData = (point) => {
        let { timeFrom, timeTo, value, dataY1, dataY2, data, dataY3, dataY4 } = this.state
        let { renderChartNewY } = this.props
        this.props.showChartLoading()
        let yAxisMaxMin = [{
            max: document.getElementById('Y1Max') ? document.getElementById('Y1Max').value : '',
            min: document.getElementById('Y1Min') ? document.getElementById('Y1Min').value : '',
        }, {
            max: document.getElementById('Y2Max') ? document.getElementById('Y2Max').value : '',
            min: document.getElementById('Y2Min') ? document.getElementById('Y2Min').value : '',
        }, {
            max: document.getElementById('Y3Max') ? document.getElementById('Y3Max').value : '',
            min: document.getElementById('Y3Min') ? document.getElementById('Y3Min').value : '',
        }, {
            max: document.getElementById('Y4Max') ? document.getElementById('Y4Max').value : '',
            min: document.getElementById('Y4Min') ? document.getElementById('Y4Min').value : '',
        }, {
            max: document.getElementById('Y5Max') ? document.getElementById('Y5Max').value : '',
            min: document.getElementById('Y5Min') ? document.getElementById('Y5Min').value : '',
        }]
        http.post('/get_history_data_padded', {
            ...(language == 'en' ? { "lan": "en" } : {}),
            // gmt: offsetInHours,
            pointList: [point],
            timeStart: timeFrom,
            timeEnd: timeTo,
            timeFormat: value,
            onduty: appConfig.onduty,
            cloudUserId: appConfig.cloudUser.cloudUserId,
            projectId: appConfig.projectId
        }).then(res => {
            if (JSON.stringify(dataY1) == '{}') {
                this.setState({
                    dataY1: res.map
                })

                if (data) {
                    const maxValueData = Math.max(...Object.values(data)[0])
                    const maxValueY1 = Math.max(...Object.values(res.map)[0])
                    const adjustData = Math.floor(maxValueData / 10.0) * 10 + 10
                    const adjustY1 = Math.floor(maxValueY1 / 10.0) * 10 + 10
                    if (adjustData >= 50 && adjustY1 >= 50 && adjustData <= 100 && adjustY1 <= 100) {
                        if (adjustData > adjustY1) {
                            yAxisMaxMin[0].max = yAxisMaxMin[1].max = String(adjustData)
                        } else {
                            yAxisMaxMin[0].max = yAxisMaxMin[1].max = String(adjustY1)
                        }
                    }
                }
                renderChartNewY(res.time, { ...data, ...res.map, ...dataY2 }, yAxisMaxMin)
            } else if (JSON.stringify(dataY2) == '{}') {
                this.setState({
                    dataY2: res.map
                })
                renderChartNewY(res.time, { ...data, ...dataY1, ...res.map }, yAxisMaxMin)
            } else if (JSON.stringify(dataY3) == '{}') {
                this.setState({
                    dataY3: res.map
                })
                renderChartNewY(res.time, { ...data, ...dataY1, ...dataY2, ...res.map }, yAxisMaxMin)
            } else if (JSON.stringify(dataY4) == '{}') {
                this.setState({
                    dataY4: res.map
                })
                renderChartNewY(res.time, { ...data, ...dataY1, ...dataY2, ...dataY3, ...res.map }, yAxisMaxMin)
            } else {
                this.setState({
                    dataY1: res.map,
                    dataY2: {}
                })
                renderChartNewY(res.time, { ...data, ...res.map }, yAxisMaxMin)
            }
        }).catch(error => {
            //结束请求，且请求不到数据时，界面展示空表
            _this.props.saveChartOption({
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    top: '14%',
                    left: '4%',
                    right: '4%',
                    bottom: '4%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: []
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [{
                    type: 'line',
                    endLabel: {
                        show: true
                    },
                    data: []
                }]
            })
            Modal.error({
                title: language == 'en' ? 'Warning' : "警告",
                content: language == 'en' ? 'Server communication failed!' : "服务器通讯失败！",
                zIndex: 1300
            })
        })
    }

    settingLock = () => {
        const { data, dataY1, dataY2, isLock } = this.state
        if (isLock) {
            this.setState({
                isLock: !isLock
            })
            localStorage.removeItem('lockPointList')
            localStorage.removeItem('lockPointTime')
        } else {
            let newObj = { ...data, ...dataY1, ...dataY2 }
            let pointList = Object.keys(newObj)
            if (pointList.length > 2) {
                Modal.info({
                    title: language == 'en' ? 'Warning' : '提示',
                    content: language == 'en' ? 'At most two points can be locked.' : '至多可以锁定两个点位'
                })
                return
            }
            this.setState({
                isLock: !isLock
            })
            localStorage.setItem('lockPointTime', JSON.stringify({ timeFrom: this.state.timeFrom, timeTo: this.state.timeTo }))
            localStorage.setItem('lockPointList', JSON.stringify(pointList))
        }
    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { yAxisMaxMinWarning, huanBiChecked } = this.state
        return (
            <div>
                {
                    language == 'en' ?
                        <Form layout='inline'>
                            <FormItem
                                label={''}
                            >
                                <ButtonGroup size="small">
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('hour'); }}>Hour</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('day'); }}>Today</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('lastday') }}>The Day Before</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('nextday') }}>The Next Day</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('week'); }}>This Week</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('month'); }}>This Month</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.selectHuanBiDay() }}><span style={{ color: huanBiChecked ? '#52c41a' : '' }}>Day-over-Day</span></Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.TodayHuanBi(-7, "week"); }}>Day-over-Week</Button>
                                    <Button style={btnStyle} type='primary' size="small" onClick={() => { this.showPointModal() }}>Overlay Point</Button>
                                    {
                                        this.state.isLock ?
                                            <Icon type="lock" title="Lock the Current Point" style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer", color: 'RGB(0,145,255)' }} onClick={this.settingLock} />
                                            :
                                            <Icon type="unlock" title="Unlock" style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer" }} onClick={this.settingLock} />
                                    }
                                    {
                                        (this.state.maxChecked || this.state.minChecked) && JSON.stringify(this.state.dataY1) == '{}' ?
                                            <div style={{ display: 'inline-block' }}>
                                                <Icon type="setting" theme="twoTone" twoToneColor="#52c41a" spin style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer" }} onClick={this.showModal} />
                                                <div style={{ position: 'absolute', top: -29, fontSize: '12px', width: 400, marginLeft: '-150px' }}>The current data filtering has effectively screened out {this.state.filterNum} data entries.</div>
                                            </div>
                                            :
                                            <Icon type="setting" style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer" }} onClick={this.showModal} />
                                    }
                                </ButtonGroup>
                            </FormItem>
                            <Modal
                                title="Line Chart Settings"
                                visible={this.state.filterVisible}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                                width={language == 'en' ? 600 : 400}
                                okText="Confirm"
                                cancelText="Cancel"
                                zIndex={1003}
                            >
                                <div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h3>Setting of Y-Axis Range and Warning Lines</h3>
                                    </div>
                                    <div style={{ marginBottom: 10, marginTop: 16 }}>
                                        Upper Limit of the Y-Axis： <InputNumber id='YMax' value={yAxisMaxMinWarning.yMax} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yMax: value,
                                            }
                                        })} />
                                        <span style={{ marginLeft: 10 }}>Lower Limit of the Y-Axis：</span> <InputNumber id='YMin' value={yAxisMaxMinWarning.yMin} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yMin: value,
                                            }
                                        })} />
                                    </div>
                                    <div style={{ marginBottom: 16, marginLeft: 40 }}>
                                        High Warning Line： <InputNumber id='YWarningMax' style={{ width: 90 }} value={yAxisMaxMinWarning.yWarningMax} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yWarningMax: value,
                                            }
                                        })} />
                                        <span style={{ marginLeft: 52 }}>Low Warning Line：</span> <InputNumber id='YWarningMin' style={{ width: 90 }} value={yAxisMaxMinWarning.yWarningMin} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yWarningMin: value,
                                            }
                                        })} />
                                    </div>
                                    <hr />
                                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                                        <h3>Setting of High-Low Limit Filtering and Enabling</h3>
                                    </div>
                                    <div style={{ marginBottom: 10, marginTop: 16 }}>
                                        Upper Limit Filter Settings：<InputNumber onChange={this.onMaxChange} defaultValue={0} disabled={!this.state.maxChecked} />
                                        <span style={{ marginLeft: 30 }}>Upper Limit Filtering Enabled：</span><Checkbox onChange={this.onOffMaxChange}></Checkbox>
                                    </div>
                                    <div>
                                        Lower Limit Filter Settings：<InputNumber onChange={this.onMinChange} defaultValue={0} disabled={!this.state.minChecked} />
                                        <span style={{ marginLeft: 30 }}>Lower Limit Filtering Enabled：</span><Checkbox onChange={this.onOffMinChange}></Checkbox>
                                    </div>
                                </div>
                            </Modal>
                            <Modal
                                title="Line Chart Settings"
                                visible={this.state.moreYSettingVisible}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                                width={400}
                                okText="Confirm"
                                cancelText="Cancel"
                                zIndex={1003}
                            >
                                <div>
                                    <div>
                                        <h4>{this.state.data ? Object.keys(this.state.data)[0] : ''}</h4>
                                        <span>Original Y-Axis</span>
                                        Upper Limit： <InputNumber id='Y1Max' />
                                        <span style={{ marginLeft: 10 }}>Lower Limit：</span> <InputNumber id='Y1Min' />
                                    </div>
                                    <div style={{ marginTop: 20 }}>
                                        <h4>{this.state.dataY1 ? Object.keys(this.state.dataY1)[0] : ''}</h4>
                                        <span>Expand Y-Axis 1</span>
                                        Upper Limit： <InputNumber id='Y2Max' />
                                        <span style={{ marginLeft: 10 }}>Lower Limit：</span> <InputNumber id='Y2Min' />
                                    </div>
                                    {
                                        JSON.stringify(this.state.dataY2) != '{}' ?
                                            <div style={{ marginTop: 20 }}>
                                                <h4>{Object.keys(this.state.dataY2)[0]}</h4>
                                                <span>Expand Y-Axis 2</span>
                                                Upper Limit： <InputNumber id='Y3Max' />
                                                <span style={{ marginLeft: 10 }}>Lower Limit：</span> <InputNumber id='Y3Min' />
                                            </div>
                                            :
                                            ''
                                    }

                                </div>
                            </Modal>
                            <FormItem
                                label="Interval"
                            >
                                {getFieldDecorator('timeFormat', {
                                    initialValue: 'm1'
                                })(
                                    <Select size="small" onSelect={this.handleSelect} className={toggleSelectClass} style={{ width: 70 }}>
                                        {
                                            this.props.tendencyData['storecycle'] && this.props.tendencyData['storecycle'] == '1' ?
                                                <Option value="s5">5 s</Option>
                                                :
                                                ''
                                        }
                                        <Option value="m1">1 min</Option>
                                        <Option value="m5">5 min</Option>
                                        <Option value="h1">1 h</Option>
                                        <Option value="d1">1 day</Option>
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                label="Time"
                                className={toggleCalendarClass}
                            >
                                {getFieldDecorator('range')(
                                    <RangePicker size="small" showTime format={'YYYY-MM-DD HH:mm'} style={{ width: 272 }} />
                                )}
                            </FormItem>
                            <FormItem>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ marginLeft: '-7px' }}
                                    onClick={this.props.switchData ? this.onSwitchChange : this.onSearch}
                                >
                                    Query
                                </Button>

                            </FormItem>
                            <FormItem>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ marginLeft: '-7px' }}
                                    onClick={this.ExportData}
                                >
                                    Download
                                </Button>
                            </FormItem>
                        </Form>
                        :
                        <Form layout='inline'>
                            <FormItem
                                label='快速选择'
                            >
                                <ButtonGroup size="small">
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('hour'); }}>小时</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('day'); }}>今天</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('lastday') }}>前一天</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('nextday') }}>后一天</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('week'); }}>本周</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('month'); }}>本月</Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.selectHuanBiDay() }}><span style={{ color: huanBiChecked ? '#52c41a' : '' }}>日环比</span></Button>
                                    <Button style={btnStyle} size="small" onClick={() => { this.TodayHuanBi(-7, "week"); }}>日同比</Button>
                                    <Button style={btnStyle} type='primary' size="small" onClick={() => { this.showPointModal() }}>叠加点</Button>
                                    {
                                        this.state.isLock ?
                                            <Icon type="lock" title="锁定当前点位" style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer", color: 'RGB(0,145,255)' }} onClick={this.settingLock} />
                                            :
                                            <Icon type="unlock" title="解锁" style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer" }} onClick={this.settingLock} />
                                    }
                                    {
                                        (this.state.maxChecked || this.state.minChecked) && JSON.stringify(this.state.dataY1) == '{}' ?
                                            <div style={{ display: 'inline-block' }}>
                                                <Icon type="setting" theme="twoTone" twoToneColor="#52c41a" spin style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer" }} onClick={this.showModal} />
                                                <div style={{ position: 'absolute', top: -27, fontSize: '12px', width: 300, marginLeft: '-58px' }}>当前数据过滤有效筛除{this.state.filterNum}个数据</div>
                                            </div>
                                            :
                                            <Icon type="setting" style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer" }} onClick={this.showModal} />
                                    }
                                </ButtonGroup>
                            </FormItem>
                            <Modal
                                title="折线图设置"
                                visible={this.state.filterVisible}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                                width={400}
                                okText="确认"
                                cancelText="取消"
                                zIndex={1003}
                            >
                                <div>
                                    <div style={{ marginBottom: 10 }}>
                                        Y轴高限： <InputNumber id='YMax' value={yAxisMaxMinWarning.yMax} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yMax: value,
                                            }
                                        })} />
                                        <span style={{ marginLeft: 10 }}>Y轴低限：</span> <InputNumber id='YMin' value={yAxisMaxMinWarning.yMin} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yMin: value,
                                            }
                                        })} />
                                    </div>
                                    <div style={{ marginBottom: 10 }}>
                                        警告高限： <InputNumber id='YWarningMax' style={{ width: 84 }} value={yAxisMaxMinWarning.yWarningMax} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yWarningMax: value,
                                            }
                                        })} />
                                        <span style={{ marginLeft: 10 }}>警告低限：</span> <InputNumber id='YWarningMin' style={{ width: 84 }} value={yAxisMaxMinWarning.yWarningMin} onChange={(value) => this.setState({
                                            yAxisMaxMinWarning: {
                                                ...yAxisMaxMinWarning,
                                                yWarningMin: value,
                                            }
                                        })} />
                                    </div>
                                    <div style={{ marginBottom: 10 }}>
                                        高限过滤设置：<InputNumber onChange={this.onMaxChange} defaultValue={0} disabled={!this.state.maxChecked} />
                                        <span style={{ marginLeft: 30 }}>高限过滤启用：</span><Checkbox onChange={this.onOffMaxChange}></Checkbox>
                                    </div>
                                    <div>
                                        低限过滤设置：<InputNumber onChange={this.onMinChange} defaultValue={0} disabled={!this.state.minChecked} />
                                        <span style={{ marginLeft: 30 }}>低限过滤启用：</span><Checkbox onChange={this.onOffMinChange}></Checkbox>
                                    </div>
                                </div>
                            </Modal>
                            <Modal
                                title="折线图设置"
                                visible={this.state.moreYSettingVisible}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                                width={400}
                                okText="确认"
                                cancelText="取消"
                                zIndex={1003}
                            >
                                <div>
                                    <div>
                                        <h4>{this.state.data ? Object.keys(this.state.data)[0] : ''}</h4>
                                        <span>原始Y轴</span>
                                        高限： <InputNumber id='Y1Max' />
                                        <span style={{ marginLeft: 10 }}>低限：</span> <InputNumber id='Y1Min' />
                                    </div>
                                    <div style={{ marginTop: 20 }}>
                                        <h4>{this.state.dataY1 ? Object.keys(this.state.dataY1)[0] : ''}</h4>
                                        <span>扩展Y轴一</span>
                                        高限： <InputNumber id='Y2Max' />
                                        <span style={{ marginLeft: 10 }}>低限：</span> <InputNumber id='Y2Min' />
                                    </div>
                                    {
                                        JSON.stringify(this.state.dataY2) != '{}' ?
                                            <div style={{ marginTop: 20 }}>
                                                <h4>{Object.keys(this.state.dataY2)[0]}</h4>
                                                <span>扩展Y轴二</span>
                                                高限： <InputNumber id='Y3Max' />
                                                <span style={{ marginLeft: 10 }}>低限：</span> <InputNumber id='Y3Min' />
                                            </div>
                                            :
                                            ''
                                    }

                                </div>
                            </Modal>
                            <FormItem
                                label="间隔"
                            >
                                {getFieldDecorator('timeFormat', {
                                    initialValue: 'm1'
                                })(
                                    <Select size="small" onSelect={this.handleSelect} className={toggleSelectClass} style={{ width: 70 }}>
                                        {
                                            this.props.tendencyData['storecycle'] && this.props.tendencyData['storecycle'] == '1' ?
                                                <Option value="s5">5秒钟</Option>
                                                :
                                                ''
                                        }
                                        <Option value="m1">1分钟</Option>
                                        <Option value="m5">5分钟</Option>
                                        <Option value="h1">1小时</Option>
                                        <Option value="d1">1天</Option>
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                label="时间"
                                className={toggleCalendarClass}
                            >
                                {getFieldDecorator('range')(
                                    <RangePicker size="small" showTime format={'YYYY-MM-DD HH:mm'} style={{ width: 272 }} />
                                )}
                            </FormItem>
                            <FormItem>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ marginLeft: '-7px' }}
                                    onClick={this.props.switchData ? this.onSwitchChange : this.onSearch}
                                >
                                    查询
                                </Button>

                            </FormItem>
                            <FormItem>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ marginLeft: '-7px' }}
                                    onClick={this.ExportData}
                                >
                                    下载
                                </Button>
                            </FormItem>
                        </Form>
                }
                <PointModal
                    hideModal={this.hidePointModal}
                    visible={this.state.pointModalVisible}
                    onOk={this.addWatchPoints}
                />
            </div>

        );
    }
})




class TendencyModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chartOption: null,
            text: null,
            columnsData: [],
            textArea: false,
            visible: false,
            value: "m1",
            description: '',
            data: '',
            timeFrom: '',
            timeTo: '',
            time: '',
            point: '',
        };
        this.getChartOption = this.getChartOption.bind(this);
        this.getChartOption2 = this.getChartOption2.bind(this);
        this.getChartOptionNewY = this.getChartOptionNewY.bind(this);
        this.saveFormRef = this.saveFormRef.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.renderChart = this.renderChart.bind(this);
        this.renderChart2 = this.renderChart2.bind(this);
        this.showChartLoading = this.showChartLoading.bind(this);
        this.hideChartLoading = this.hideChartLoading.bind(this);
        // this.handleSelect = this.handleSelect.bind(this);
        // this.onSearch = this.onSearch.bind(this);
        // this.onSwitchChange = this.onSwitchChange.bind(this);
        // this.d = this.getData.bind(this);
        // this.setTimeRange = this.setTimeRange.bind(this);
        this.cancel = this.cancel.bind(this);
        // this.ExportData = this.ExportData.bind(this)
        this.form = null;

    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.tendencyData !== this.props.tendencyData) {
            localStorage.setItem('newPoint', nextProps.tendencyData.point);
            this.setState({
                value: 'm1',
                visible: nextProps.tendencyVisible,
                data: nextProps.tendencyData.dataSource,
                time: nextProps.tendencyData.time,
                point: nextProps.tendencyData.point,
                timeFrom: moment().utcOffset(offset).subtract(1, 'hour').format(TIME_FORMAT),
                timeTo: moment().utcOffset(offset).format(TIME_FORMAT)
            })
            // this.props.form.setFieldsValue({
            //     range: [moment().utcOffset(offset).startOf('hour'), moment().utcOffset(offset)],
            //     timeFormat: 'm1'
            // });

        }
    }
    // componentDidMount(){
    //     const { tendencyData,tendencyVisible} = this.props
    //         this.setState({
    //             value: 'm1',
    //             data:tendencyData,
    //             time: tendencyData.time,
    //             point:tendencyData.point,
    //             timeFrom: moment().utcOffset(offset).subtract(1, 'hour').format(TIME_FORMAT),
    //             timeTo: moment().utcOffset(offset).format(TIME_FORMAT)
    //         })
    //         this.props.form.setFieldsValue({
    //             range: [moment().utcOffset(offset).startOf('hour'), moment().utcOffset(offset)],
    //             timeFormat: 'm1'
    //         });
    //         // this.renderChart(tendencyData)
    //         this.setTimeRange('hour');
    // }

    getChartOption(pointsData, yAxisMaxMinWarning) {
        const { tendencyData } = this.props
        let arr = []
        arr = pointsData.map[`${tendencyData.point}`]
        pointsData.map[`${tendencyData.point}`].map((item, index) => {
            if (isNaN(Number(item))) {
                arr[index] = item
            } else {
                if (String(item).indexOf('.') == -1) {
                    arr[index] = item
                } else {
                    if (item >= 10000) {
                        arr[index] = Number(item).toFixed(0)
                    } else if (item >= 1) {
                        arr[index] = Number(item).toFixed(2)
                    } else {
                        arr[index] = Number(item).toFixed(4)
                    }
                }
            }
        })
        try {
            return {
                title: {
                    text: tendencyData.point,
                    subtext: tendencyData.description,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {
                            show: true
                        }
                    },
                    right: '2%'
                },
                grid: {
                    top: '14%',
                    left: '4%',
                    right: '4%',
                    bottom: '4%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: pointsData.time
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        max: yAxisMaxMinWarning && yAxisMaxMinWarning.yMax ? yAxisMaxMinWarning.yMax : null,
                        min: yAxisMaxMinWarning && yAxisMaxMinWarning.yMin ? yAxisMaxMinWarning.yMin : null,
                    }
                ],
                series: [{
                    name: tendencyData.point,
                    type: 'line',
                    endLabel: {
                        show: true
                    },

                    data: arr
                }]
            };
        } catch (err) {
            console.log('23')
        }
    }

    getChartOption2(pointsData, pointsData2, flag, yAxisMaxMinWarning) {
        const { tendencyData } = this.props
        let name
        if (flag == "week") {
            name = language == 'en' ? 'Value at the Same Time of the Previous Week' : "上一周同时刻数值"
        } else {
            if (flag) {
                name = flag + (language == 'en' ? ' Daily Sequential Comparison Data' : ' 日环比数据')
            } else {
                name = language == 'en' ? 'Value at the Same Time of the Previous Day' : "上一日同时刻数值"
            }
        }

        try {
            let pieces = [], markline = {}

            if (yAxisMaxMinWarning && yAxisMaxMinWarning.yWarningMin && yAxisMaxMinWarning.yWarningMax) {
                pieces = [{
                    lt: Number(yAxisMaxMinWarning.yWarningMin),
                    color: "red"
                },
                {
                    gt: Number(yAxisMaxMinWarning.yWarningMax),
                    color: "red"
                }]
                markline = {
                    symbol: "none",
                    data: [
                        {
                            name: '低限警告',
                            yAxis: Number(yAxisMaxMinWarning.yWarningMin),
                            lineStyle: {
                                type: 'dashed',
                                color: 'red'
                            },
                        },
                        {
                            name: '高限警告',
                            yAxis: Number(yAxisMaxMinWarning.yWarningMax),
                            lineStyle: {
                                type: 'dashed',
                                color: 'red'
                            },
                        }
                    ],
                }
            }
            let options = {
                title: {
                    text: tendencyData.point,
                    subtext: tendencyData.description,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {
                            show: true
                        }
                    },
                    right: '2%'
                },
                grid: {
                    top: '14%',
                    left: '4%',
                    right: '4%',
                    bottom: '4%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: pointsData.time
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        max: yAxisMaxMinWarning && yAxisMaxMinWarning.yMax ? yAxisMaxMinWarning.yMax : null,
                        min: yAxisMaxMinWarning && yAxisMaxMinWarning.yMin ? yAxisMaxMinWarning.yMin : null,
                    }
                ],
                series: [{
                    name: tendencyData.point,
                    type: 'line',
                    markLine: markline,
                    data: pointsData.map[`${tendencyData.point}`]
                }, {
                    name: name,
                    type: 'line',
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    },
                    data: pointsData2.map[`${tendencyData.point}`]
                },]
            };

            if (yAxisMaxMinWarning && yAxisMaxMinWarning.yWarningMin && yAxisMaxMinWarning.yWarningMax) {
                options.visualMap = {
                    show: false,//标签是否显示
                    pieces: pieces,
                    outOfRange: { // 在选中范围外 的视觉元素，这里设置在正常范围内的图形颜色
                        color: 'rgb(0,145,255)'
                    }
                }
            }

            return options
        } catch (err) {
        }
    }

    getChartOptionNewY(time, obj, yAxisMaxMin) {
        let name = [], series = [], yAxis = []
        const colorList = ["RGB(0,145,255)", "#ff9966", "#99cc00", "#338833", "#ff0000"]
        let index = 0
        const allPointList = JSON.parse(localStorage.getItem('allPointList'))
        for (let key in obj) {
            let newName = key
            allPointList.forEach(item => {
                if (item.name == key && item.description != '') {
                    newName += ' (' + item.description + ')'
                }
            })
            name.push(newName)
            series.push({
                name: newName,
                type: 'line',
                data: obj[key],
                yAxisIndex: index
            })
            yAxis.push({
                type: 'value',
                position: 'left',
                axisTick: {
                    show: true
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: colorList[index]
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: colorList[index]
                    }
                },
                min: yAxisMaxMin && yAxisMaxMin[index].min ? yAxisMaxMin[index].min : null,
                max: yAxisMaxMin && yAxisMaxMin[index].max ? yAxisMaxMin[index].max : null,
                offset: String(index * 50)
            })
            index++
        }

        return {
            color: colorList,
            tooltip: {
                trigger: 'axis'
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: {
                        show: true
                    }
                },
                right: '2%'
            },
            legend: {
                data: name
            },
            grid: {
                top: '10%',
                left: '8%',
                right: '4%',
                bottom: '4%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: time
                }
            ],
            yAxis: yAxis,
            series: series
        };
    }

    //点值为非数值时，处理数据格式
    renderTextarea(data, obj) {
        let tableData, arrTextValue, arrTextValues = []
        //dataSource
        for (let j = 0; j < data.length; j++) {
            arrTextValue = data[j].history.map(
                (row) => {
                    return row.value
                }
            )
            // arrTextValues.push(arrTextValue)
            tableData = data[0].history.map(function (row, i) {
                row['key'] = i;
                row[`value${j}`] = arrTextValue[i];
                row.value = null
                return row;
            });
        }
        //columns动态生成列
        let columnsData = Object.keys(obj).map(
            (name, i) => ({
                title: name,
                dataIndex: `value${i}`,
                key: `value${i}`,
                width: 200
            })
        )
        let defaultColumn = {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: 60
        }
        columnsData.unshift(defaultColumn)



        this.setState({
            textArea: true,
            text: tableData,
            columnsData: columnsData
        })
    }

    renderChart(data, yAxisMaxMinWarning) {
        this.setState({
            chartOption: this.getChartOption(data, yAxisMaxMinWarning)
        });
        this.hideChartLoading();
    }

    renderChart2(data1, data2, flag, yAxisMaxMinWarning) {
        this.setState({
            chartOption: this.getChartOption2(data1, data2, flag, yAxisMaxMinWarning)
        });
        this.hideChartLoading();
    }

    renderChartNewY = (time, obj, yAxisMaxMin) => {
        this.setState({
            chartOption: this.getChartOptionNewY(time, obj, yAxisMaxMin)
        })
        this.hideChartLoading();
    }

    saveChartOption = (value) => {
        this.setState({
            chartOption: value
        })
    }

    showChartLoading() {  //动画
        if (this.chart) {
            this.chart.showLoading();
        }
    }

    hideChartLoading() {
        if (this.chart) {
            this.chart.hideLoading();
        }
    }

    saveFormRef(form) {
        this.form = form;
    }

    saveChartRef(chart) {
        if (chart) {
            this.chart = chart.getEchartsInstance();
        } else {
            this.chart = chart;
        }
    }

    cancel() {
        this.props.hideTendencyModal();
        this.setState({
            chartOption: null
        })
    }
    render() {
        const { tendencyData } = this.props;
        return (
            <div>
                <Modal
                    visible={this.state.visible}
                    title=''
                    onCancel={this.cancel}
                    wrapClassName={str}
                    footer=''
                    width={1540}
                    maskClosable={false}
                    zIndex={1002}
                >
                    <ModalForm
                        ref={this.saveFormRef}
                        autoSearch={this.state.visible}
                        tendencyData={tendencyData}
                        renderChart={this.renderChart}
                        renderChart2={this.renderChart2}
                        renderChartNewY={this.renderChartNewY}
                        showChartLoading={this.showChartLoading}
                        hideChartLoading={this.hideChartLoading}
                        renderTextarea={this.renderTextarea}
                        saveChartOption={this.saveChartOption}
                    />
                    {this.state.chartOption == null ? <div
                        style={{
                            margin: '16px 0 8px',
                            height: '480px',
                            textAlign: 'center'
                        }}>
                        <Spin tip="Loading…" />
                    </div> :
                        <ReactEcharts
                            style={{
                                margin: '16px 0 8px',
                                height: '480px'
                            }}
                            ref={this.saveChartRef}
                            option={this.state.chartOption}
                            theme="dark"
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    }

                </Modal>
            </div>

        );
    }
}
const TrendModelView = Form.create()(TendencyModal);
export default TrendModelView
