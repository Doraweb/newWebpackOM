import React, { Component } from 'react';
import appConfig from '../../../common/appConfig'
import http from '../../../common/http'
import moment from 'moment'
import ReactEcharts from '../../../lib/echarts-for-react';
import '../../../lib/echarts-themes/dark';
import { Modal, DatePicker, Button, Spin, Select } from 'antd'


const language = appConfig.language

const Option = Select.Option;
const { RangePicker } = DatePicker;
const TIME_FORMAT = 'YYYY-MM-DD';
class WeatherHistoryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeFrom: moment().startOf('week').format(TIME_FORMAT),
            timeTo: moment().format(TIME_FORMAT),
            MaxData: [],
            MinData: [],
            HumData: [],
            timeArr: [],
            type: "tmp",
            loading: false,
            days: parseInt(moment().diff(moment().startOf('week'), 'days', true))
        };

        this.timeChange = this.timeChange.bind(this)
        this.search = this.search.bind(this)
        this.saveChartRef = this.saveChartRef.bind(this);
        this.disabledDate = this.disabledDate.bind(this)
        this.getWeek = this.getWeek.bind(this)
        this.getMonth = this.getMonth.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount() {
        http.get(`/weather/getForcastWeatherInfoV2/${this.state.timeFrom}/${this.state.days}`).then(
            data => {
                let timeArr = []
                let MaxTemp = []
                let MinTemp = []
                let Hum = []
                timeArr = data.data.map((item, index) => {
                    return item.date
                })
                MaxTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_max
                    } else {
                        return ''
                    }
                })
                MinTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_min
                    } else {
                        return ''
                    }
                })
                Hum = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.hum
                    } else {
                        return ''
                    }
                })
                this.setState({
                    timeArr: timeArr,
                    MaxData: MaxTemp,
                    MinData: MinTemp,
                    HumData: Hum
                })

            }
        ).catch(err => {

        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.visible !== this.props.visible) {
            return true
        } else {
            if (nextState == this.state) {
                return false
            } else {
                return true
            }
        }
    }

    //选择时间范围
    timeChange(timeArr) {
        let timeFrom = moment(timeArr[0]).format(TIME_FORMAT)
        let timeTo = moment(timeArr[1]).format(TIME_FORMAT)
        let days = moment(timeArr[1]).diff(moment(timeArr[0]), 'days', true);
        this.setState({
            timeFrom: timeFrom,
            timeTo: timeTo,
            days: days
        })
    }
    getWeek() {
        let timeFrom = moment().startOf('week').format(TIME_FORMAT)
        let timeTo = moment().format(TIME_FORMAT)
        let days = parseInt(moment().diff(moment().startOf('week'), 'days', true))
        this.setState({
            loading: true,
            timeFrom: timeFrom,
            timeTo: timeTo,
            days: days
        })
        http.get(`/weather/getForcastWeatherInfoV2/${timeFrom}/${days}`).then(
            data => {
                let timeArr = []
                let MaxTemp = []
                let MinTemp = []
                let Hum = []
                timeArr = data.data.map((item, index) => {
                    return item.date
                })
                MaxTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_max
                    } else {
                        return ''
                    }
                })
                MinTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_min
                    } else {
                        return ''
                    }
                })
                Hum = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.hum
                    } else {
                        return ''
                    }
                })
                this.setState({
                    timeArr: timeArr,
                    MaxData: MaxTemp,
                    MinData: MinTemp,
                    HumData: Hum,
                    loading: false
                })
            }
        ).catch(err => {

        })

    }
    getMonth() {
        let timeFrom = moment().startOf('month').format(TIME_FORMAT)
        let timeTo = moment().format(TIME_FORMAT)
        let days = parseInt(moment().diff(moment().startOf('month'), 'days', true))
        this.setState({
            loading: true,
            timeFrom: timeFrom,
            timeTo: timeTo,
            days: days
        })
        http.get(`/weather/getForcastWeatherInfoV2/${timeFrom}/${days}`).then(
            data => {
                let timeArr = []
                let MaxTemp = []
                let MinTemp = []
                let Hum = []
                timeArr = data.data.map((item, index) => {
                    return item.date
                })
                MaxTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_max
                    } else {
                        return ''
                    }
                })
                MinTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_min
                    } else {
                        return ''
                    }
                })
                Hum = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.hum
                    } else {
                        return ''
                    }
                })
                this.setState({
                    timeArr: timeArr,
                    MaxData: MaxTemp,
                    MinData: MinTemp,
                    HumData: Hum,
                    loading: false
                })

            }
        ).catch(err => {

        })
    }
    search() {
        this.setState({
            loading: true
        })
        http.get(`/weather/getForcastWeatherInfoV2/${this.state.timeFrom}/${this.state.days}`).then(
            data => {
                let timeArr = []
                let MaxTemp = []
                let MinTemp = []
                let Hum = []
                timeArr = data.data.map((item, index) => {
                    return item.date
                })
                MaxTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_max
                    } else {
                        return ''
                    }
                })
                MinTemp = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.tmp_min
                    } else {
                        return ''
                    }
                })
                Hum = data.data.map((item, index) => {
                    if (item.forcast != null) {
                        return item.forcast.hum
                    } else {
                        return ''
                    }
                })
                this.setState({
                    timeArr: timeArr,
                    MaxData: MaxTemp,
                    MinData: MinTemp,
                    HumData: Hum,
                    loading: false
                })

            }
        ).catch(err => {

        })
    }
    saveChartRef(chart) {
        if (chart) {
            this.chart = chart.getEchartsInstance();
        } else {
            this.chart = chart;
        }
    }
    getOption() {
        if (this.state.type == "tmp") {
            return {
                xAxis: {
                    name: language == 'en' ? 'Time' : '日期',
                    type: 'category',
                    data: this.state.timeArr
                },
                yAxis: {
                    name: language == 'en' ? 'Temp' : '温度',
                    type: 'value'
                },
                legend: {
                    top: 10,
                    data: language == 'en' ? ['Maximum Temp', 'Minimum Temp'] : ['最高温度', '最低温度'],
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '5%',
                    bottom: '3%',
                    containLabel: true
                },
                series: [{
                    name: language == 'en' ? 'Maximum Temp' : '最高温度',
                    data: this.state.MaxData,
                    symbolSize: 8,
                    type: 'line'
                }, {
                    name: language == 'en' ? 'Minimum Temp' : '最低温度',
                    data: this.state.MinData,
                    symbolSize: 8,
                    type: 'line'
                }],
            };
        } else {
            return {
                xAxis: {
                    name: language == 'en' ? 'Time' : '日期',
                    type: 'category',
                    data: this.state.timeArr
                },
                yAxis: {
                    name: language == 'en' ? 'Relative Humidity' : '相对湿度',
                    type: 'value'
                },
                legend: {
                    top: 10,
                    data: language == 'en' ? ['Relative Humidity'] : ['相对湿度'],
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '5%',
                    bottom: '3%',
                    containLabel: true
                },
                series: [{
                    name: language == 'en' ? 'Relative Humidity' : '相对湿度',
                    data: this.state.HumData,
                    symbolSize: 8,
                    type: 'line'
                }]
            };
        }
    }
    //将时间选择器今天之后的日期禁用
    disabledDate(current) {
        return current && current.valueOf() > Date.now();
    }
    handleChange(value) {
        this.setState({
            type: value
        })
    }
    render() {
        const { visible } = this.props
        return (
            <Modal
                title={language == 'en' ? 'Historical Weather' : '历史天气'}
                visible={visible}
                footer={null}
                maskClosable={false}
                width={1000}
                onCancel={this.props.onCancel}
                zIndex={1001}
            >
                <div>
                    <div>
                        <span>{language == 'en' ? 'Parameter：' : '类型：'}</span>
                        <Select value={this.state.type} style={{ width: 160, marginRight: 10 }} onChange={this.handleChange}>
                            <Option value="tmp">{language == 'en' ? 'Temp' : '温度'}</Option>
                            <Option value="hum">{language == 'en' ? 'Relative Humidity' : '相对湿度'}</Option>
                        </Select>
                        <span>{language == 'en' ? 'Time：' : '时间范围：'}</span>
                        <RangePicker
                            disabledDate={this.disabledDate}
                            allowClear={false}
                            value={[moment(this.state.timeFrom), moment(this.state.timeTo)]}
                            format="YYYY-MM-DD"
                            style={{
                                width: 240,
                                marginRight: 10
                            }}
                            onChange={this.timeChange}
                        />
                        <Button onClick={this.search} style={{ marginRight: 10 }} icon='search'>{language == 'en' ? 'Search' : '查询'}</Button>
                        <Button onClick={this.getWeek} style={{ marginRight: 10 }}>{language == 'en' ? 'This Week' : '本周'}</Button>
                        <Button onClick={this.getMonth} >{language == 'en' ? 'This Month' : '本月'}</Button>
                    </div>
                    <div>
                        {
                            this.state.loading ?
                                <div style={{ width: '100%', height: '473px', textAlign: 'center', marginTop: '30px' }}>
                                    <Spin tip={language == 'en' ? 'Loading…' : "Loading…"} />
                                </div>
                                :
                                <ReactEcharts
                                    style={{
                                        margin: '16px 0 8px',
                                        height: '480px'
                                    }}
                                    ref={this.saveChartRef}
                                    option={this.getOption()}
                                    theme="dark"
                                    notMerge={true}
                                />
                        }
                    </div>
                </div>
            </Modal>
        )

    }
}

export default WeatherHistoryModal;