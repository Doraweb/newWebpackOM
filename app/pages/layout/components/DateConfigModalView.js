/**
 * 日期设置模态框
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Form, Select, DatePicker, Slider, message, Radio } from 'antd';
import moment from 'moment'
import appConfig from '../../../common/appConfig';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
import { withRouter } from 'react-router';
import eventBus from '../../../common/eventBus.js'

const language = appConfig.language
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const TIME_FORMAT = "YYYY-MM-DD HH:mm"
// 服务器时区偏移（从localStorage获取，默认UTC+8）
const SERVER_TIMEZONE_OFFSET = Number(localStorage.getItem('timeZone') || 8);

// 修复1：获取服务器当前时间（替代本机时间）
const getServerCurrentTime = () => {
  return moment().utcOffset(SERVER_TIMEZONE_OFFSET);
};

// 初始化时使用服务器时区
let startTime = getServerCurrentTime().startOf('days')
let endTime = getServerCurrentTime()

let str;
if (localStorage.getItem('serverOmd') == "best") {
  str = 'time-setting-best'
} else if (localStorage.getItem('serverOmd') == "persagy") {
  str = 'warning-config-persagy'
} else {
  str = 'warning-config'
}

//配置组件
class DateConfigForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      endOpen: false,
      startTime: 0,
      endTime: 0,
      timeFormat: '',
      day: 1,
      week: 1,
      month: 1,
      patternSelect: 1,
      onePointTime: startTime,
      timeRange: 1,
    };

    this.onOk = this.onOk.bind(this);
    this.yesterday = this.yesterday.bind(this);
    this.today = this.today.bind(this);
    this.lastWeek = this.lastWeek.bind(this);
    this.preWeek = this.preWeek.bind(this);
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.disabledEndDate = this.disabledEndDate.bind(this);
    this.isAfterDate = this.isAfterDate.bind(this);
    this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
    this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
    this.closeModal = this.closeModal.bind(this)
    this.LastMounth = this.LastMounth.bind(this)
    this.preMonth = this.preMonth.bind(this)
    this.nextDay = this.nextDay.bind(this)
    this.nextWeek = this.nextWeek.bind(this)
    this.nextMonth = this.nextMonth.bind(this)
  }


  componentDidMount() {
    let dateDict = {}
    if (localStorage.dateDict) {
      dateDict = JSON.parse(localStorage.dateDict)
    }
    this.setState({
      timeFormat: dateDict.timeFormat || 'm1'
    })
    if (localStorage.getItem('historyStartTime') && localStorage.getItem('historyStartTime') != '' && localStorage.getItem('historyStartTime') != null) {
      setTimeout(() => {
        let _starTime = new Date(Number(localStorage.getItem('historyStartTime')))
        // 修复2：将历史时间转换为服务器时区
        _starTime = moment(_starTime).utcOffset(SERVER_TIMEZONE_OFFSET)
        if (_starTime.format("YYYY-MM-DD") != getServerCurrentTime().format("YYYY-MM-DD")) {
          let _endTime = _starTime.format("YYYY-MM-DD 23:59:00")
          _endTime = moment(_endTime).utcOffset(SERVER_TIMEZONE_OFFSET)
          this.props.form.setFieldsValue({
            endTime: _endTime
          })
        }
        this.props.form.setFieldsValue({
          startTime: _starTime
        })
        this.onOk()
      }, 1000)
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      const dateDict = JSON.parse(localStorage.dateDict || '{}')
      if (dateDict.middleTime && dateDict.pattern == 2) {
        this.setState({
          // 修复：添加 true 参数，避免重复偏移
          onePointTime: moment(dateDict.middleTime).utcOffset(SERVER_TIMEZONE_OFFSET, true)
        })
      } else {
        this.setState({
          onePointTime: getServerCurrentTime().subtract(1, 'hour'),
        })
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.show !== this.props.show) {
      return true
    } else {
      if (nextState == this.state) {
        return false
      } else {
        return true
      }
    }
  }

  //点击确认
  onOk(e) {
    const {
      addPoint,
      parmsDict,
      bShowTimeShaft,
      dateProps,
      upDateCurValue,
      timeArr
    } = this.props
    let _this = this
    if (e != undefined && e != '') {
      e.preventDefault()
    }
    this.setState({
      month: 1,
      day: 1,
      week: 1
    })
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.props.location.pathname !== '/systemToolScriptRule/') {
          _this.props.parmsDict.closeRealTimeFresh()
        }
        // 修复4：使用服务器当前时间进行比较
        const serverNow = getServerCurrentTime();
        // 将值转换为服务器时区的 Moment 对象
        const startTime = moment(values.startTime).utcOffset(SERVER_TIMEZONE_OFFSET);
        let endTime = moment(values.endTime).utcOffset(SERVER_TIMEZONE_OFFSET);

        // 比较 startTime 和服务器当前时间
        if (startTime.isAfter(serverNow)) {
          const newStartTime = serverNow.subtract(1, 'hour');
          values.startTime = newStartTime;
          _this.props.form.setFieldsValue({
            startTime: newStartTime,
          });
        }
        // 比较 endTime 和服务器当前时间
        if (endTime.isAfter(serverNow)) {
          const newEndTime = serverNow.clone()
          values.endTime = newEndTime;
          _this.props.form.setFieldsValue({
            endTime: newEndTime,
          });
        }
        let curValue = 0
        let middleTime
        if (this.state.patternSelect === 2) {
          curValue = Math.round((values.endTime - values.startTime) / 2 / 60000)
          middleTime = moment(values.startTime + (values.endTime - values.startTime) / 2)
            .utcOffset(SERVER_TIMEZONE_OFFSET)
            .format('YYYY-MM-DD HH:mm:00')
        }
        if (this.state.patternSelect === 2 && endTime.isSameOrAfter(serverNow, 'minute')) {
          const newEndTime = serverNow.subtract(1, 'minute');
          values.endTime = newEndTime;
          _this.props.form.setFieldsValue({
            endTime: newEndTime,
          });
        }

        //获取到选中时间的分钟
        let startMinute = moment(values.startTime).utcOffset(SERVER_TIMEZONE_OFFSET).minute()
        let endMinute = moment(values.endTime).utcOffset(SERVER_TIMEZONE_OFFSET).minute()
        //5分钟时，处理起始时间的分钟为0或5
        if (values.timeFormat === "m5") {
          //开始时间
          if (Number(startMinute.toString().substr(1, 1)) < 3) {
            startMinute = Number(startMinute.toString().substr(0, 1)) * 10
          } else if (Number(startMinute.toString().substr(1, 1)) >= 3 && Number(startMinute.toString().substr(1, 1)) <= 9) {
            startMinute = Number(startMinute.toString().substr(0, 1)) * 10 + 5
          }
          // 结束时间
          if (Number(endMinute.toString().substr(1, 1)) < 3) {
            endMinute = Number(endMinute.toString().substr(0, 1)) * 10
          } else if (Number(endMinute.toString().substr(1, 1)) >= 3 && Number(endMinute.toString().substr(1, 1)) <= 9) {
            endMinute = Number(endMinute.toString().substr(0, 1)) * 10 + 5
          }
        }

        let dateDict = {
          endTime: moment(values.endTime).utcOffset(SERVER_TIMEZONE_OFFSET).format(`YYYY-MM-DD HH:${endMinute.toString().padStart(2, '0')}:00`),
          startTime: moment(values.startTime).utcOffset(SERVER_TIMEZONE_OFFSET).format(`YYYY-MM-DD HH:${startMinute.toString().padStart(2, '0')}:00`),
          timeFormat: values.timeFormat,
          pattern: this.state.patternSelect,
          curValue: curValue,
          middleTime: middleTime,
        }
        localStorage.dateDict = JSON.stringify(dateDict)
        if (this.props.location.pathname !== '/systemToolScriptRule/') {
          parmsDict.closeRealTimeFresh()
        }
        upDateCurValue(curValue)
        this.props.toggleTimeShaft(true) //显示时间轴组件
        this.props.getTimeArr(values)
        //规则回放
        if (this.props.location.pathname == '/systemToolScriptRule/') {
          localStorage.setItem('ruleReplay', true)
          eventBus.emit('timeChanged', curValue)
          _this.props.onOk(false, dateDict)
          return;
        }
        //规则回放到此为止
        //同步执行代码
        localStorage.removeItem('ruleReplay')
        var syncFun = new Promise(function (resolve, reject) {
          resolve(function () {
            return _this.props.onOk(false, dateDict)
          })
        })
        syncFun.then(function (first) {
          return first()
        }).then(function (second) {
          parmsDict.renderScreen(parmsDict.pageId, true)
        })
      }
    });
  }

  //昨天的时间
  yesterday() {
    const { form } = this.props
    const { day } = this.state
    let startTime = moment(form.getFieldValue('startTime')).utcOffset(SERVER_TIMEZONE_OFFSET)
    let endTime = moment(form.getFieldValue('endTime')).utcOffset(SERVER_TIMEZONE_OFFSET)
    let _starTime = startTime.subtract(1, 'days').startOf('day')
    let _endTime = endTime.subtract(1, "days").endOf('day')
    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
    this.setState({
      day: day + 1,
      month: 1,
      week: 1
    })
  }

  //后一天的时间
  nextDay() {
    const { form } = this.props
    const { day } = this.state
    let startTime = moment(form.getFieldValue('startTime')).utcOffset(SERVER_TIMEZONE_OFFSET)
    let endTime = moment(form.getFieldValue('endTime')).utcOffset(SERVER_TIMEZONE_OFFSET)
    // 修复5：限制不能选择服务器当前时间之后的日期
    const serverToday = getServerCurrentTime().startOf('day')
    const nextDayStart = startTime.add(1, 'days').startOf('day')
    const nextDayEnd = endTime.add(1, "days").endOf('day')

    if (nextDayStart.isAfter(serverToday)) {
      message.warning(language === 'en' ? 'Cannot select date after server current date' : '不能选择服务器当前日期之后的日期');
      return;
    }

    this.props.form.setFieldsValue({
      startTime: nextDayStart,
      endTime: nextDayEnd
    })
    this.setState({
      day: day - 1,
      month: 1,
      week: 1
    })
  }

  //今天时间
  today() {
    this.setState({
      month: 1,
      day: 1,
      week: 1
    })
    const { form } = this.props
    let _starTime = getServerCurrentTime().startOf('day')
    let _endTime = getServerCurrentTime()
    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
  }

  //上周
  lastWeek() {
    let count = this.state.week
    const { form } = this.props
    const serverNow = getServerCurrentTime()
    // 计算目标周（当前周 - count）
    const targetWeek = serverNow.week() - count
    // 分别clone计算，避免污染原对象
    let _starTime = serverNow.clone().week(targetWeek).startOf('week') // 目标周第一天
    let _endTime = serverNow.clone().week(targetWeek).endOf('week')   // 目标周最后一天
    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
    this.setState({
      week: count + 1,
      month: 1,
      day: 1
    })
  }

  //下周
  nextWeek() {
    let count = this.state.week
    const { form } = this.props
    const serverNow = getServerCurrentTime()
    const currentWeekStart = serverNow.clone().startOf('week') // 当前周起始时间
    const targetWeek = serverNow.week() - count + 2 // 目标周数
    // 分别clone计算
    let _starTime = serverNow.clone().week(targetWeek).startOf('week')
    let _endTime = serverNow.clone().week(targetWeek).endOf('week')

    // 限制不能选择当前周之后的周
    if (_starTime.isAfter(currentWeekStart)) {
      message.warning(language === 'en' ? 'Cannot select week after server current week' : '不能选择服务器当前周之后的周');
      return;
    }

    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
    this.setState({
      week: count - 1,
      month: 1,
      day: 1
    })
  }

  //本周
  preWeek() {
    this.setState({
      month: 1,
      day: 1,
      week: 1
    })
    let serverNow = getServerCurrentTime()
    let _starTime = serverNow.clone().startOf('week') // 本周第一天
    let _endTime = serverNow.clone().endOf('week')   // 本周最后一天（如果当前在本周内，保持到当前时间）
    // 如果当前时间在本周内，结束时间用当前时间，否则用周末
    if (serverNow.isBetween(_starTime, _endTime)) {
      _endTime = serverNow.clone()
    }
    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
  }

  //本月
  preMonth() {
    this.setState({
      month: 1,
      day: 1,
      week: 1
    })
    let serverNow = getServerCurrentTime()
    let _starTime = serverNow.clone().startOf('month') // 本月1号
    let _endTime = serverNow.clone().endOf('month')   // 本月月底（如果当前在本月内，保持到当前时间）
    // 如果当前时间在本月内，结束时间用当前时间，否则用月底
    if (serverNow.isBetween(_starTime, _endTime)) {
      _endTime = serverNow.clone()
    }
    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
  }

  //上一月
  LastMounth() {
    let count = this.state.month
    const { form } = this.props
    let serverNow = getServerCurrentTime()
    // 计算目标月（当前月 - count）
    const targetMonth = serverNow.month() - count
    // 分别clone计算，避免污染原对象
    let _starTime = serverNow.clone().month(targetMonth).startOf('month') // 目标月1号
    let _endTime = serverNow.clone().month(targetMonth).endOf('month')   // 目标月月底
    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
    this.setState({
      month: count + 1,
      day: 1,
      week: 1
    })
  }

  //下一月
  nextMonth() {
    let count = this.state.month
    const { form } = this.props
    let serverNow = getServerCurrentTime()
    const currentMonthStart = serverNow.clone().startOf('month') // 当前月起始时间
    const targetMonth = serverNow.month() - count + 2 // 目标月数
    // 分别clone计算
    let _starTime = serverNow.clone().month(targetMonth).startOf('month')
    let _endTime = serverNow.clone().month(targetMonth).endOf('month')

    // 限制不能选择当前月之后的月
    if (_starTime.isAfter(currentMonthStart)) {
      message.warning(language === 'en' ? 'Cannot select month after server current month' : '不能选择服务器当前月之后的月份');
      return;
    }

    this.props.form.setFieldsValue({
      startTime: _starTime,
      endTime: _endTime
    })
    this.setState({
      month: count - 1,
      day: 1,
      week: 1
    })
  }

  // 修复8：禁用服务器当前时间之后的开始日期
  disabledStartDate(startValue) {
    const endValue = this.props.form.getFieldValue('endTime');
    const serverNow = getServerCurrentTime();

    if (!startValue) return false;
    // 两个条件：1. 不能晚于结束时间 2. 不能晚于服务器当前时间
    return startValue.valueOf() > (endValue ? endValue.valueOf() : Infinity) || startValue.isAfter(serverNow);
  }

  // 修复9：禁用服务器当前时间之后的结束日期
  disabledEndDate(endValue) {
    const startValue = this.props.form.getFieldValue('startTime');
    const serverNow = getServerCurrentTime();

    if (!endValue) return false;
    // 两个条件：1. 不能早于开始时间 2. 不能晚于服务器当前时间
    return endValue.valueOf() < (startValue ? startValue.valueOf() : -Infinity) || endValue.isAfter(serverNow);
  }

  // 修复10：单点模式禁用服务器当前时间之后的日期
  isAfterDate = (current) => {
    const serverNow = getServerCurrentTime();
    return current && current.isAfter(serverNow);
  }

  handleStartOpenChange(open) {
    if (!open) {
      this.setState({ endOpen: true })
    }
  }

  handleEndOpenChange(open) {
    this.setState({ endOpen: open })
  }

  //同步执行操作
  closeModal() {
    this.setState({
      month: 1,
      day: 1,
      week: 1
    })
    var _this = this

    if (_this.props.onlyCloseModel) {
      _this.props.onCancel(false);
    } else {
      var thenStart = new Promise(function (resolve, reject) {
        resolve(function () {
          _this.props.onCancel(false);
          _this.props.toggleTimeShaft(false)
          return true
        })
      })
      thenStart.then(function (first) {
        return first()
      }).then(function (second) {
        // if(second){
        //_this.props.parmsDict.startRealTimeFresh()
        // _this.props.parmsDict.renderScreen()    //重新使用实时刷新    
        // }
      })
    }
  }

  handleStartTimeChange = (value) => {
    this.props.form.setFieldsValue({
      startTime: moment(value).utcOffset(SERVER_TIMEZONE_OFFSET)
    })
    this.setState({
      startTime: value,
      month: 1,
      day: 1,
      week: 1
    })
  }

  handleEndTimeChange = (value) => {
    this.props.form.setFieldsValue({
      endTime: moment(value).utcOffset(SERVER_TIMEZONE_OFFSET)
    })
    this.setState({
      endTime: value,
      month: 1,
      day: 1,
      week: 1
    })
  }

  handleFormatChange = (value) => {
    this.setState({
      timeFormat: value
    })
  }

  patternChange = (e) => {
    const { timeRange } = this.state
    this.setState({
      patternSelect: e.target.value
    })
    if (e.target.value == 2) {
      this.setState({
        timeFormat: 'm1'
      })

      let pointStartTime = this.state.onePointTime.clone().subtract(timeRange, 'hours').utcOffset(SERVER_TIMEZONE_OFFSET)
      let pointEndTime = this.state.onePointTime.clone().add(timeRange, 'hours').utcOffset(SERVER_TIMEZONE_OFFSET)
      let serverNow = getServerCurrentTime()

      this.props.form.setFieldsValue({
        timeFormat: 'm1',
        startTime: pointStartTime,
        endTime: pointEndTime.isAfter(serverNow) ? serverNow.clone() : pointEndTime
      })
    } else {
      let serverNow = getServerCurrentTime()
      this.props.form.setFieldsValue({
        startTime: serverNow.startOf('day'),
        endTime: serverNow
      })
    }
  }

  handleTimeRangeChange = (value) => {
    this.setState({ timeRange: value });

    const { onePointTime } = this.state;
    const serverNow = getServerCurrentTime().clone(); // 克隆避免污染原对象
    const timezoneOffset = SERVER_TIMEZONE_OFFSET;

    // 1. 基于选择的时间点（onePointTime）计算原始时间范围
    const originalStartTime = onePointTime
      .clone()
      .subtract(value, 'hours')
      .utcOffset(timezoneOffset); // 开始时间：选择时间 - 偏移小时

    const originalEndTime = onePointTime
      .clone()
      .add(value, 'hours')
      .utcOffset(timezoneOffset); // 结束时间：选择时间 + 偏移小时

    // 2. 关键逻辑：结束时间取「原始结束时间」和「当前服务器时间」的较小值
    const finalEndTime = originalEndTime.isAfter(serverNow) ? serverNow : originalEndTime;

    // 3. 确保开始时间不晚于结束时间（极端情况防护，比如选择时间点远早于当前时间）
    const finalStartTime = originalStartTime.isBefore(finalEndTime)
      ? originalStartTime
      : finalEndTime.clone().subtract(value, 'hours'); // 兜底：避免时间范围异常

    // 4. 设置表单值
    this.props.form.setFieldsValue({
      startTime: finalStartTime,
      endTime: finalEndTime,
    });
  };
  render() {
    const {
      show,
      form,
      onOk,
      onCancel,
      parmsDict
    } = this.props;

    const { getFieldDecorator } = form;

    if (!show) {
      return null;
    }
    const dateDict = JSON.parse(localStorage.dateDict || '{}')

    // 修复11：初始化时使用服务器时区解析存储的时间
    if (dateDict.startTime) {
      startTime = moment(dateDict.startTime).utcOffset(SERVER_TIMEZONE_OFFSET, true)
    } else {
      startTime = getServerCurrentTime().startOf('days')
    }
    if (dateDict.endTime) {
      endTime = moment(dateDict.endTime).utcOffset(SERVER_TIMEZONE_OFFSET, true)
    } else {
      endTime = getServerCurrentTime()
    }

    return (
      <div>
        {
          show ?
            <Modal
              visible={true}
              title={language == 'en' ? "Time configuration" : "时间配置"}
              wrapClassName={str}
              maskClosable={false}
              onCancel={() => {
                this.closeModal()
              }}
              onOk={this.onOk}
              width={language == 'en' ? 740 : 550}
            >
              {
                language == 'en' ?
                  <RadioGroup onChange={this.patternChange} value={this.state.patternSelect}>
                    <Radio value={1} style={{ marginLeft: "28px" }}>Time range playback</Radio>
                    <Radio value={2} style={{ marginLeft: "60px" }}>Single-point moment playback</Radio>
                  </RadioGroup>
                  :
                  <RadioGroup onChange={this.patternChange} value={this.state.patternSelect}>
                    <Radio value={1} style={{ marginLeft: "28px" }}>时间范围回放</Radio>
                    <Radio value={2} style={{ marginLeft: "118px" }}>单点时刻附近回放</Radio>
                  </RadioGroup>
              }
              {
                language == 'en' ?
                  this.state.patternSelect == 1 ?
                    <div>
                      <Button style={{ marginLeft: "28px", marginTop: "12px", position: 'absolute' }} onClick={this.yesterday}>the day before</Button>
                      <Button style={{ marginLeft: "180px", marginTop: "12px", position: 'absolute' }} onClick={this.nextDay}>the day after</Button>
                      <Button style={{ marginLeft: "320px", marginTop: "12px", position: 'absolute' }} onClick={this.today}>today</Button>
                      <Button style={{ marginLeft: "28px", marginTop: "65px", position: 'absolute' }} onClick={this.lastWeek}>the week before</Button>
                      <Button style={{ marginLeft: "180px", marginTop: "65px", position: 'absolute' }} onClick={this.nextWeek}>the week after</Button>
                      <Button style={{ marginLeft: "320px", marginTop: "65px", position: 'absolute' }} onClick={this.preWeek}>this week</Button>
                      <Button style={{ marginLeft: "28px", marginTop: "117px", position: 'absolute' }} onClick={this.LastMounth}>the month before</Button>
                      <Button style={{ marginLeft: "180px", marginTop: "117px", position: 'absolute' }} onClick={this.nextMonth}>the month after</Button>
                      <Button style={{ marginLeft: "320px", marginTop: "117px", position: 'absolute' }} onClick={this.preMonth}>this month</Button>
                      <Form onSubmit={this.handleSubmit} style={{ marginLeft: '440px', marginTop: '10px' }}>
                        <FormItem
                          {...formItemLayout}
                          label="Start time"
                        >
                          {getFieldDecorator('startTime', {
                            initialValue: startTime,
                            rules: [{ type: 'object', required: true, message: 'Please select the start time' }],
                          })(
                            <DatePicker
                              showTime={{ format: "HH:mm" }}
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160 }}
                              disabledDate={this.disabledStartDate}
                              onChange={this.handleStartTimeChange}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="End time"
                        >
                          {getFieldDecorator('endTime', {
                            initialValue: endTime,
                            rules: [{ type: 'object', required: true, message: 'Please select the end time' }],
                          })(
                            <DatePicker
                              showTime={{ format: "HH:mm" }}
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160 }}
                              disabledDate={this.disabledEndDate}
                              onChange={this.handleEndTimeChange}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="Interval"
                        >
                          {getFieldDecorator('timeFormat', {
                            initialValue: this.state.timeFormat,
                            rules: [{ required: true, message: 'Please select the Interval' }],
                          })(
                            <Select
                              style={{ width: 160, minWidth: 160 }}
                              placeholder="Please select the Interval"
                              onSelect={this.handleFormatChange}
                            >
                              <Option value="m1">one minute</Option>
                              <Option value="m5">five minutes</Option>
                              <Option value="h1">one hour</Option>
                              <Option value="d1">one day</Option>
                            </Select>
                          )}
                        </FormItem>
                      </Form>
                    </div>
                    :
                    <div>
                      <label style={{ marginLeft: "20px", marginTop: "10px", position: 'absolute' }}>Select a single-point moment </label>
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        format={TIME_FORMAT}
                        disabledDate={this.isAfterDate}
                        style={{ marginLeft: "215px", marginTop: "5px", position: 'absolute', width: 150, minWidth: 150 }}
                        value={this.state.onePointTime}
                        onChange={(time) => {
                          const serverTime = moment(time).utcOffset(SERVER_TIMEZONE_OFFSET)
                          this.setState({ onePointTime: serverTime });
                          let pointStartTime = serverTime.clone().subtract(this.state.timeRange, 'hours')
                          let pointEndTime = serverTime.clone().add(this.state.timeRange, 'hours')
                          let serverNow = getServerCurrentTime()
                          this.props.form.setFieldsValue({
                            startTime: pointStartTime,
                            endTime: pointEndTime.isAfter(serverNow) ? serverNow.clone() : pointEndTime
                          })
                        }}
                      />
                      <label style={{ marginLeft: "20px", marginTop: "55px", position: 'absolute' }}>Select a time range </label>
                      <Select
                        style={{ marginLeft: "215px", marginTop: "50px", position: 'absolute', width: 150, minWidth: 150 }}
                        placeholder="Please select the time range of several hours before or after"
                        onSelect={this.handleTimeRangeChange}
                        defaultValue={this.state.timeRange}
                      >
                        <Option value={1}>one hour</Option>
                        <Option value={2}>two hours</Option>
                        <Option value={3}>three hours</Option>
                      </Select>

                      <Form onSubmit={this.handleSubmit} style={{ marginLeft: '420px', marginTop: '10px' }}>
                        <FormItem
                          {...formItemLayout}
                          label="Start time"
                        >
                          {getFieldDecorator('startTime', {
                            initialValue: this.state.onePointTime.clone().subtract(this.state.timeRange, 'hours'),
                            rules: [{ type: 'object', required: true, message: 'Please select the start time' }],
                          })(
                            <DatePicker
                              showTime
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160, color: 'white' }}
                              disabledDate={this.disabledStartDate}
                              onChange={this.handleStartTimeChange}
                              disabled={true}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="End time"
                        >
                          {getFieldDecorator('endTime', {
                            initialValue: this.state.onePointTime.clone().add(this.state.timeRange, 'hours'),
                            rules: [{ type: 'object', required: true, message: 'Please select the end time' }],
                          })(
                            <DatePicker
                              showTime
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160 }}
                              disabledDate={this.disabledEndDate}
                              onChange={this.handleEndTimeChange}
                              disabled={true}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="Interval"
                        >
                          {getFieldDecorator('timeFormat', {
                            initialValue: this.state.timeFormat,
                            rules: [{ required: true, message: 'Please select the Interval' }],
                          })(
                            <Select
                              placeholder="Please select the Interval"
                              onSelect={this.handleFormatChange}
                              disabled={true}
                              style={{ color: 'white' }}
                            >
                              <Option value="m1">one minute</Option>
                              <Option value="m5">five minutes</Option>
                              <Option value="h1">one hour</Option>
                              <Option value="d1">one day</Option>
                            </Select>
                          )}
                        </FormItem>
                      </Form>
                    </div>
                  :
                  this.state.patternSelect == 1 ?
                    <div>
                      <Button style={{ marginLeft: "28px", marginTop: "12px", position: 'absolute' }} onClick={this.yesterday}>前一天</Button>
                      <Button style={{ marginLeft: "108px", marginTop: "12px", position: 'absolute' }} onClick={this.nextDay}>后一天</Button>
                      <Button style={{ marginLeft: "188px", marginTop: "12px", position: 'absolute' }} onClick={this.today}>今天</Button>
                      <Button style={{ marginLeft: "28px", marginTop: "65px", position: 'absolute' }} onClick={this.lastWeek}>前一周</Button>
                      <Button style={{ marginLeft: "108px", marginTop: "65px", position: 'absolute' }} onClick={this.nextWeek}>后一周</Button>
                      <Button style={{ marginLeft: "188px", marginTop: "65px", position: 'absolute' }} onClick={this.preWeek}>本周</Button>
                      <Button style={{ marginLeft: "28px", marginTop: "117px", position: 'absolute' }} onClick={this.LastMounth}>前一月</Button>
                      <Button style={{ marginLeft: "108px", marginTop: "117px", position: 'absolute' }} onClick={this.nextMonth}>后一月</Button>
                      <Button style={{ marginLeft: "188px", marginTop: "117px", position: 'absolute' }} onClick={this.preMonth}>本月</Button>
                      <Form onSubmit={this.handleSubmit} style={{ marginLeft: '270px', marginTop: '10px' }}>
                        <FormItem
                          {...formItemLayout}
                          label="开始时间"
                        >
                          {getFieldDecorator('startTime', {
                            initialValue: startTime,
                            rules: [{ type: 'object', required: true, message: '请选择开始时间!' }],
                          })(
                            <DatePicker
                              showTime={{ format: "HH:mm" }}
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160 }}
                              disabledDate={this.disabledStartDate}
                              onChange={this.handleStartTimeChange}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="结束时间"
                        >
                          {getFieldDecorator('endTime', {
                            initialValue: endTime,
                            rules: [{ type: 'object', required: true, message: '请选择结束时间!' }],
                          })(
                            <DatePicker
                              showTime={{ format: "HH:mm" }}
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160 }}
                              disabledDate={this.disabledEndDate}
                              onChange={this.handleEndTimeChange}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="取样间隔"
                        >
                          {getFieldDecorator('timeFormat', {
                            initialValue: this.state.timeFormat,
                            rules: [{ required: true, message: '请选择取样间隔' }],
                          })(
                            <Select
                              style={{ width: 160, minWidth: 160 }}
                              placeholder="请选择取样间隔"
                              onSelect={this.handleFormatChange}
                            >
                              <Option value="m1">1分钟</Option>
                              <Option value="m5">5分钟</Option>
                              <Option value="h1">1小时</Option>
                              <Option value="d1">1天</Option>
                            </Select>
                          )}
                        </FormItem>
                      </Form>
                    </div>
                    :
                    <div>
                      <label style={{ marginLeft: "20px", marginTop: "10px", position: 'absolute' }}>选择单点时刻 </label>
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        format={TIME_FORMAT}
                        disabledDate={this.isAfterDate}
                        style={{ marginLeft: "115px", marginTop: "5px", position: 'absolute', width: 150, minWidth: 150 }}
                        value={this.state.onePointTime}
                        // 单点模式选择时间时
                        onChange={(time) => {
                          // 修复：用 true 参数，保持选择的时间不变，仅标记为服务器时区
                          const serverTime = moment(time).utcOffset(SERVER_TIMEZONE_OFFSET, true);
                          this.setState({ onePointTime: serverTime });
                          let pointStartTime = serverTime.clone().subtract(this.state.timeRange, 'hours');
                          let pointEndTime = serverTime.clone().add(this.state.timeRange, 'hours');
                          let serverNow = getServerCurrentTime();
                          this.props.form.setFieldsValue({
                            startTime: pointStartTime,
                            endTime: pointEndTime.isAfter(serverNow) ? serverNow.clone() : pointEndTime
                          });
                        }}
                      />
                      <label style={{ marginLeft: "20px", marginTop: "55px", position: 'absolute' }}>选择时刻范围 </label>
                      <Select
                        style={{ marginLeft: "115px", marginTop: "50px", position: 'absolute', width: 150, minWidth: 150 }}
                        placeholder="请选择前后几小时范围"
                        onSelect={this.handleTimeRangeChange}
                        defaultValue={this.state.timeRange}
                      >
                        <Option value={1}>1小时</Option>
                        <Option value={2}>2小时</Option>
                        <Option value={3}>3小时</Option>
                      </Select>

                      <Form onSubmit={this.handleSubmit} style={{ marginLeft: '270px', marginTop: '10px' }}>
                        <FormItem
                          {...formItemLayout}
                          label="开始时间"
                        >
                          {getFieldDecorator('startTime', {
                            initialValue: this.state.onePointTime.clone().subtract(this.state.timeRange, 'hours'),
                            rules: [{ type: 'object', required: true, message: '请选择开始时间!' }],
                          })(
                            <DatePicker
                              showTime
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160, color: 'white' }}
                              disabledDate={this.disabledStartDate}
                              onChange={this.handleStartTimeChange}
                              disabled={true}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="结束时间"
                        >
                          {getFieldDecorator('endTime', {
                            initialValue: this.state.onePointTime.clone().add(this.state.timeRange, 'hours'),
                            rules: [{ type: 'object', required: true, message: '请选择结束时间!' }],
                          })(
                            <DatePicker
                              showTime
                              format={TIME_FORMAT}
                              style={{ width: 160, minWidth: 160 }}
                              disabledDate={this.disabledEndDate}
                              onChange={this.handleEndTimeChange}
                              disabled={true}
                            />
                          )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label="取样间隔"
                        >
                          {getFieldDecorator('timeFormat', {
                            initialValue: this.state.timeFormat,
                            rules: [{ required: true, message: '请选择取样间隔' }],
                          })(
                            <Select
                              placeholder="请选择取样间隔"
                              onSelect={this.handleFormatChange}
                              disabled={true}
                              style={{ color: 'white' }}
                            >
                              <Option value="m1">1分钟</Option>
                              <Option value="m5">5分钟</Option>
                              <Option value="h1">1小时</Option>
                              <Option value="d1">1天</Option>
                            </Select>
                          )}
                        </FormItem>
                      </Form>
                    </div>
              }
            </Modal>
            :
            ""
        }
      </div>
    );
  }
}

export default withRouter(Form.create()(DateConfigForm))
