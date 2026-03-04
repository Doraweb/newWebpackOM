import React from 'react';
import { Button, Modal, Form, DatePicker, Select, message, Switch, Table, Spin } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import appConfig from '../../../common/appConfig';
const ButtonGroup = Button.Group;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
const language = appConfig.language;

let str, btnStyle, formStyle, marginStyle;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'trend-best',
        marginStyle = {
            marginLeft: '10px'
        }
} else if (localStorage.getItem('serverOmd') == "persagy") {
    str = 'PersagyCalendarModal'
    btnStyle = {
        marginLeft: '-5px'
    }
    formStyle = {
        padding: '30px 0 0 0'
    }
    marginStyle = {
        marginLeft: '-2px'
    }
} else {
    str = 'vertical-center-modal',
        marginStyle = {
            marginLeft: '10px'
        }
}

//获取时间范围
const getTimeRange = function (period, day) {
    let startTime, endTime;
    switch (period) {
        case 'day':
            startTime = moment().startOf('day');
            endTime = moment();
            break;
        case 'week':
            startTime = moment().startOf('week');
            endTime = moment();
            break;
        case 'month':
            startTime = moment().startOf('month');
            endTime = moment();
            break;
        case 'hour':
        default:
            startTime = moment().subtract(1, 'hour');
            endTime = moment();
            break;
    }
    return [startTime, endTime];
}

// 创建一个 Date 对象来表示当前时间
const currentDate = new Date();
// 使用 getTimezoneOffset() 方法获取当前时区与 GMT 时区的偏移量（以分钟为单位）
const offsetInMinutes = currentDate.getTimezoneOffset();
// 将偏移量从分钟转换为小时，取负号是因为 getTimezoneOffset() 返回的偏移方向与通常表示的时区偏移方向相反
const offsetInHours = -Math.round(offsetInMinutes / 60);
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
            lastDay: 1,
            nextDay: -1,
            time: '',
            point: ''
        };
        this.getChartOption = this.getChartOption.bind(this);
        this.saveFormRef = this.saveFormRef.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.renderChart = this.renderChart.bind(this);
        this.showChartLoading = this.showChartLoading.bind(this);
        // this.hideChartLoading = this.hideChartLoading.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSwitchChange = this.onSwitchChange.bind(this);
        this.getData = this.getData.bind(this);
        this.setTimeRange = this.setTimeRange.bind(this);
        this.cancel = this.cancel.bind(this);
        this.ExportData = this.ExportData.bind(this)
        this.form = null;

    }
    componentWillReceiveProps(nextProps) {
        const { tendencyData } = this.props
        // localStorage.setItem('pointname', this.props.tendencyData.point);
        try {
            if (!this.props.tendencyVisible && nextProps.tendencyVisible) {
                this.setState({
                    visible: nextProps.tendencyVisible
                })
                if (nextProps.tendencyVisible) {
                    this.setState({
                        value: 'm1',
                        data: nextProps.tendencyData,
                        time: nextProps.tendencyData.time,
                        point: nextProps.tendencyData.point
                    })
                    this.props.form.setFieldsValue({
                        range: [moment().startOf('hour'), moment()],
                        timeFormat: 'm1'
                    });
                    this.setState({
                        timeFrom: moment().subtract(1, 'hour').format(TIME_FORMAT),
                        timeTo: moment().format(TIME_FORMAT)
                    })

                    this.renderChart(nextProps.tendencyData)
                }

            }
            if (this.props.tendencyVisible && !nextProps.tendencyVisible) {
                this.setState({
                    visible: nextProps.tendencyVisible,
                    // time: nextProps.time
                })
                this.setTimeRange('hour');

            }
        } catch (err) {

        }
    }
    getChartOption(pointsData) {
        let { time, dataSouce, point, description } = pointsData;
        let json = JSON.stringify(pointsData);
        if (!point && (json != '{}')) {
            point = Object.keys(pointsData.map).map(key => { return key });
            point = point[0];
            dataSouce = pointsData.map;
            description = this.state.description;
        }
        if (JSON.stringify(pointsData) == '{}') {
            time = [];
            dataSouce = [];
            point = '';
            description = '';
        }
        try {
            return {
                title: {
                    text: point,
                    subtext: description,
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
                        data: time
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: Object.keys(dataSouce).map((key) => ({
                    name: key,
                    type: 'line',
                    data: dataSouce[key]
                }))
            };
        } catch (err) {

        }

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
        // console.log(tableData)
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

        // console.log(columnsData)

        // console.log(tableData)

        this.setState({
            textArea: true,
            text: tableData,
            columnsData: columnsData
        })
    }

    renderChart(data) {
        const { description } = data;
        if (description) {
            this.setState({
                description: description
            })
        }
        this.setState({
            chartOption: this.getChartOption(data)
        });
        // this.hideChartLoading();

    }

    showChartLoading() {  //动画

        this.chart.showLoading({
            text: '正在加载数据'
        });

    }
    // hideChartLoading() {
    //     this.chart.hideLoading();
    // }
    saveFormRef(form) {
        this.form = form;
    }

    saveChartRef(chart) {
        if (chart) {
            console.info(1)
            this.chart = chart.getEchartsInstance();

            console.info(this.chart)
        } else {
            this.chart = chart;
        }
    }

    onSearch() {
        let _this = this;
        _this.showChartLoading();
        //  this.setState({
        //    loading:true
        //  })
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            //int  
            let timediff = moment(values.range[1]).diff(moment(values.range[0]), 'days')
            this.setState({
                timeFrom: values.range[0].format(TIME_FORMAT),
                timeTo: values.range[1].format(TIME_FORMAT)
            })
            _this.getData(
                values.range[0].format(TIME_FORMAT),
                values.range[1].format(TIME_FORMAT),
                values.timeFormat
            ).then(
                (data) => {
                    if (!data.error) {
                        _this.setState({
                            time: data.time,
                            data: data.map
                        })
                        _this.renderChart(data);
                    } else {
                        console.info(_this.state.value, timediff)
                        if (_this.state.value == 'm1') {
                            if (timediff > 7) {
                                Modal.confirm({ title: '取样间隔为1分钟时，最多支持查询7天的数据' })
                            }
                        }
                        if (_this.state.value == 'm5') {
                            if (timediff > 14) {
                                Modal.confirm({ title: '取样间隔为5分钟时，最多支持查询14天的数据' })
                            }
                        }
                        if (_this.state.value == 'h1') {
                            if (timediff > 60) {
                                Modal.confirm({ title: '取样间隔为1小时时，最多支持查询60天的数据' })
                            }
                        }
                        if (_this.state.value == 'd1') {
                            if (timediff > 365) {
                                Modal.confirm({ title: '取样间隔为1天时，最多支持查询365天的数据' })
                            }
                        }

                    }
                }
            )

        });
    }

    ExportData() {
        let pointList = []
        let pointData = []
        let reportName = '历史数据'
        let strStartTime = this.state.timeFrom
        let strEndTime = this.state.timeTo
        let timeData = this.state.time
        let data = this.state.data
        if (data.dataSouce !== undefined) {
            let newdata = data.dataSouce
            Object.keys(newdata).map(item => {
                pointList.push(item)
            })
            pointData = timeData.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((iteml, i) => {
                    if (newdata[iteml].length === 0) {
                        line[1] = ''
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
                headerList: [`${localStorage.getItem('pointname')}`],　 //表头用的点名
                tableDataList: pointData,
                timeList: data.time,
                pointList: [`${localStorage.getItem('pointname')}`],
                lan: appConfig.language
            }).then(
                data => {
                    if (data.err === 0) {
                        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                    }
                    if (status === false) {
                        message.error('生成下载文件失败')
                    }
                }
            )
        } else {
            Object.keys(data).map(item => {
                pointList.push(item)
            })
            pointData = timeData.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((iteml, i) => {
                    if (data[iteml].length === 0) {
                        line[item] = ''
                    } else {
                        line[iteml] = data[iteml][row]
                    }
                })
                return line
            })
        }
        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: strStartTime,
            strEndTime: strEndTime,
            headerList: [`${localStorage.getItem('pointname')}`],　 //表头用的点名
            tableDataList: pointData,
            timeList: this.state.time,
            pointList: [`${localStorage.getItem('pointname')}`],
            lan: appConfig.language
        }).then(
            data => {
                if (data.err === 0) {
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                }
                if (status === false) {
                    message.error('生成下载文件失败')
                }
            }
        )


    }


    onSwitchChange() {
        let _this = this;

        this.showChartLoading();
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
                        //console.log(obj);
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
                            _this.renderChart(arrData);
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
            'pointList': localStorage.getItem('pointname'),
            'timeStart': `${moment(timeStart).format('YYYY-MM-DD HH:mm')}:00`,
            'timeEnd': `${moment(timeEnd).format('YYYY-MM-DD HH:mm')}:00`,
            'timeFormat': timeFormat,
            ...(language == 'en' ? { "lan": "en" } : {})
        }).catch(
            (error) => {
                message.error('服务器通讯失败！');
            }
        )
    }

    handleSelect(value) {
        this.setState({
            value: value
        })
    }

    setTimeRange(period) {
        const { lastDay, nextDay } = this.state
        let _this = this
        if (period == 'lastday') {
            this.setState({
                lastDay: lastDay + 1,
                nextDay: nextDay + 1
            })
            // console.log(this.state.nextDay)
        } else if (period == 'nextday') {
            this.setState({
                lastDay: lastDay - 1,
                nextDay: nextDay - 1
            })
        } else {
            this.setState({
                lastDay: 1,
                nextDay: -1
            })
        }
        let range = getTimeRange(period, this.state.lastDay)
        let starTime = moment().subtract(this.state.lastDay, 'days').startOf('day')
        let endTime = moment().subtract(this.state.lastDay, "days").endOf('day')
        let _starTime = moment().subtract(this.state.nextDay, 'days').startOf('day')
        let _endTime = moment().subtract(this.state.nextDay, "days").endOf('day')
        // let timediff = moment(range[1]).diff(moment(range[0]), 'days')
        // console.info( typeof timediff )
        switch (period) {
            case 'nextday':
                this.props.form.setFieldsValue({
                    range: [_starTime, _endTime],
                    timeFormat: 'm5'
                });
                break;
            case 'lastday':
                this.props.form.setFieldsValue({
                    range: [starTime, endTime],
                    timeFormat: 'm5'
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
    cancel() {
        this.props.handleCancel();
        this.setState({
            chartOption: null
        })
    }
    render() {
        const { tendencyData, tendencyVisible, handleCancel, form } = this.props;
        const { visible } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                {
                    visible ?
                        <Modal
                            visible={visible}
                            title=''
                            onCancel={this.cancel}
                            wrapClassName={str}
                            footer=''
                            width={1101}
                        >
                            <Form layout='inline' style={formStyle}>
                                <FormItem
                                    label="快速选择"
                                >
                                    <ButtonGroup size="small">
                                        <Button size="small" onClick={() => { this.setTimeRange('hour'); }}>小时</Button>
                                        <Button size="small" onClick={() => { this.setTimeRange('day'); }}>今天</Button>
                                        <Button size="small" onClick={() => { this.setTimeRange('lastday') }}>前一天</Button>
                                        <Button size="small" onClick={() => { this.setTimeRange('nextday') }}>后一天</Button>
                                        <Button size="small" onClick={() => { this.setTimeRange('week'); }}>本周</Button>
                                        <Button size="small" onClick={() => { this.setTimeRange('month'); }}>本月</Button>
                                    </ButtonGroup>
                                </FormItem>
                                <FormItem
                                    label="取样间隔"
                                    style={marginStyle}
                                >
                                    {getFieldDecorator('timeFormat', {
                                        initialValue: 'm1'
                                    })(
                                        <Select size="small" onSelect={this.handleSelect} >
                                            <Option value="m1">1分钟</Option>
                                            <Option value="m5">5分钟</Option>
                                            <Option value="h1">1小时</Option>
                                            <Option value="d1">1天</Option>
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    label="时间范围"
                                    style={marginStyle}
                                >
                                    {getFieldDecorator('range', {
                                        initialValue: [moment(moment().format('YYYY-MM-DD 00:00:00')), moment()]
                                    })(
                                        <RangePicker size="small" showTime format={'YYYY-MM-DD HH:mm'} />
                                    )}
                                </FormItem>
                                <FormItem>
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={this.onSearch}
                                        style={btnStyle}
                                    >
                                        查询
                                    </Button>
                                </FormItem>
                                <FormItem>
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={this.ExportData}
                                        style={btnStyle}
                                    >
                                        下载数据
                                    </Button>
                                </FormItem>
                            </Form>
                            {this.state.chartOption == null ? <div
                                style={{
                                    margin: '16px 0 8px',
                                    height: '480px',
                                    textAlign: 'center'
                                }}>
                                {/* <Spin tip="Loading…"/> */}
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
                        :
                        ''
                }
            </div>

        );
    }
}
const TrendView = Form.create()(TendencyModal);
export default TrendView
