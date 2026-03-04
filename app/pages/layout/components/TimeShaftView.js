/**
 * 时间轴控件
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Spin, Modal, Form, Select, DatePicker, Slider } from 'antd';
import s from './TimeShaftView.css';
import { withRouter } from 'react-router';
const FormItem = Form.Item;
const Option = Select.Option;
import moment from 'moment'
import { on } from 'ws';
import eventBus from '../../../common/eventBus.js'
import _ from 'lodash'

import appConfig from '../../../common/appConfig';
const language = appConfig.language;
const isEnglish = language === 'en';

let btnRightStyle, btnLeftStyle, btnSettingStyle, btnQuitStyle;

btnLeftStyle = {
  background: 'RGB(160,160,160)',
  border: 0,
  marginLeft: '22px',
  marginRight: '10px',
  color: '#ffffff'
}
btnRightStyle = {
  background: 'RGB(160,160,160)',
  border: 0,
  marginRight: '20px',
  color: '#ffffff'
}
btnSettingStyle = {
  background: 'RGB(160,160,160)',
  border: 0,
  fontSize: '17px',
  marginTop: '2px',
  color: '#ffffff'
}
btnQuitStyle = {
  lineHeight: 1.3,
  border: "0px",
  padding: "0px 5px 0px 5px",
  height: "auto",
  marginLeft: "1px",
  marginRight: "1px",
  bottom: "1px",
}

//服务器时区
const timezone = localStorage.getItem('timezone') ?
  localStorage.getItem('timezone') :
  '8';

//客户端时区
// 创建一个 Date 对象来表示当前时间
const currentDate = new Date();
// 使用 getTimezoneOffset() 方法获取当前时区与 GMT 时区的偏移量（以分钟为单位）
const offsetInMinutes = currentDate.getTimezoneOffset();
// 将偏移量从分钟转换为小时，取负号是因为 getTimezoneOffset() 返回的偏移方向与通常表示的时区偏移方向相反
const offsetInHours = -Math.round(offsetInMinutes / 60);

const DValue = timezone - offsetInHours



class TimeShaft extends React.PureComponent {
  constructor(props) {
    super(props);

    // 防抖函数
    this.debouncedRawOnChange = _.debounce(this.rawOnChange, 10)

    this.lastValue = null;

    this.state = {
      isPlay: false,
      curValue: 0,
      interval: 3000
    };
    this.TimeShaft_timer = null
    this.showDateConfigModal = this.showDateConfigModal.bind(this)
    this.formatter = this.formatter.bind(this);
    this.onAfterChange = this.onAfterChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.subtractValue = this.subtractValue.bind(this);
    this.plusValue = this.plusValue.bind(this);
    this.playHistoricalPic = this.playHistoricalPic.bind(this)
    this.getMarks = this.getMarks.bind(this);
    this.addHoursToTime = this.addHoursToTime.bind(this);
    this.loopTime = this.loopTime.bind(this);
    this.stopPlayer = this.stopPlayer.bind(this);
    this.rawOnChange = this.rawOnChange.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    if (this.props.curValue != nextProps.curValue) {
      this.setState({
        curValue: nextProps.curValue
      })
    }
  }

  componentDidMount() {
    //组件加载完毕后保存停止播放函数
    this.props.updateTimeShaftState({
      stopPlayer: this.stopPlayer
    })
  }

  componentWillUnmount() {
    this.debouncedRawOnChange.cancel()
  }




  stopPlayer() {
    this.setState({
      isPlay: false
    })
  }

  showDateConfigModal() {
    this.props.onOk(true, null, true)
  }
  // 更新value
  rawOnChange(value) {
    const finalValue = this.lastValue;

    const dateDict = JSON.parse(localStorage.getItem('dateDict'))

    if (JSON.parse(localStorage.getItem('ruleReplay'))) {
      this.props.upDateCurValue(value)
      //发送事件
      if (JSON.parse(localStorage.getItem('dateDict')).pattern == 2) {
        eventBus.emit('timeChanged', value);
      }
    }

    if (dateDict.pattern === 1) {
      this.props.upDateCurValue(value)
    } else {
      this.props.upDateCurValue(value)
      const { props, modalDict, observerDict } = this.props
      let specificTime = this.props.timeArr[value]
      //清除定时器，修改isPlay状态
      clearTimeout(this.TimeShaft_timer)
      //页面历史数据
      this.props.initHistroyData({ specificTime: specificTime, timeFormat: props.timeFormat })
      //模态框历史数据
      if (typeof modalDict.initHistroyModal === 'function') {
        modalDict.initHistroyModal({ specificTime: specificTime, timeFormat: props.timeFormat })
        modalDict.initCheckboxs({ specificTime: specificTime, timeFormat: props.timeFormat })
      }
      //observer页面的checkbox历史数据
      if (typeof observerDict.initObserverCheckboxs === 'function') {
        observerDict.initObserverCheckboxs({ specificTime: specificTime, timeFormat: props.timeFormat })
      }

      this.props.updateConfigModalProps(specificTime)
      return this.setState({
        isPlay: false
      })
    }
  }



  onChange = (value) => {
    this.lastValue = value;
    this.props.upDateCurValue(value)
    this.debouncedRawOnChange(value);
  }


  //鼠标拖拽放下后触发
  onAfterChange(value) {

    const dateDict = JSON.parse(localStorage.getItem('dateDict'))

    if (JSON.parse(localStorage.getItem('ruleReplay'))) {
      this.props.upDateCurValue(value)
      eventBus.emit('timeChanged', value);
      return;
    } else
      if (dateDict.pattern === 1) {
        const { props, modalDict, observerDict } = this.props
        let specificTime = this.props.timeArr[value]
        //清除定时器，修改isPlay状态
        clearTimeout(this.TimeShaft_timer)
        //页面历史数据
        this.props.initHistroyData({ specificTime: specificTime, timeFormat: props.timeFormat })
        //模态框历史数据
        if (typeof modalDict.initHistroyModal === 'function') {
          modalDict.initHistroyModal({ specificTime: specificTime, timeFormat: props.timeFormat })
          modalDict.initCheckboxs({ specificTime: specificTime, timeFormat: props.timeFormat })
        }
        //observer页面的checkbox历史数据
        if (typeof observerDict.initObserverCheckboxs === 'function') {
          observerDict.initObserverCheckboxs({ specificTime: specificTime, timeFormat: props.timeFormat })
        }

        this.props.updateConfigModalProps(specificTime)
        return this.setState({
          isPlay: false
        })
      }
  }


  //减少
  subtractValue() {
    const { props, upDateCurValue, updateConfigModalProps, timeArr, modalDict } = this.props
    let curValue = this.state.curValue
    let newValue = curValue - 1
    clearTimeout(this.TimeShaft_timer)
    if (curValue) { //curValue表示时间时间轴数组大年所在时间的索引
      let specificTime = timeArr[newValue]
      if (this.props.location.pathname !== '/systemToolScriptRule/') {//当不为规则回放时调用以下函数
        this.props.initHistroyData({ specificTime: specificTime, timeFormat: props.timeFormat })
        if (typeof modalDict.initHistroyModal === 'function') {
          modalDict.initHistroyModal({ specificTime: specificTime, timeFormat: props.timeFormat })
          modalDict.initCheckboxs({ specificTime: specificTime, timeFormat: props.timeFormat })
        }
      } else {
        eventBus.emit('timeChanged', newValue);
      }
      //更新保存的value
      upDateCurValue(newValue)
      updateConfigModalProps(specificTime)
      return this.setState({
        isPlay: false
      })
    }
  }
  //增加
  plusValue() {
    const { props, upDateCurValue, timeArr, updateConfigModalProps, modalDict } = this.props
    let curValue = this.state.curValue
    let newValue = curValue + 1
    clearTimeout(this.TimeShaft_timer)
    if (newValue < timeArr.length) {
      let specificTime = timeArr[newValue]
      if (this.props.location.pathname !== '/systemToolScriptRule/') {//当不为规则回放时调用以下函数
        this.props.initHistroyData({ specificTime: specificTime, timeFormat: props.timeFormat })
        if (typeof modalDict.initHistroyModal === 'function') {
          modalDict.initHistroyModal({ specificTime: specificTime, timeFormat: props.timeFormat })
          modalDict.initCheckboxs({ specificTime: specificTime, timeFormat: props.timeFormat })
        }
      } else {
        eventBus.emit('timeChanged', newValue);
      }
      updateConfigModalProps(specificTime)
      upDateCurValue(newValue)
      return this.setState({
        isPlay: false
      })
    }
  }


  // shouldComponentUpdate(nextProps,nextState){
  //   if(this.state.isPlay && this.props.loading && !nextProps.loading){
  //     this.TimeShaft_timer = setTimeout(this.loopTime,this.state.interval)
  //     return true
  //   }
  //   if(this.state.curValue !== nextState.curValue){
  //     return true
  //   }
  //   if(this.state.isPlay !== nextState.isPlay){
  //     return true
  //   }
  //   if(nextProps.dateModal.visible){
  //     return true
  //   }

  //   return false
  // }

  loopTime() {
    const { props, upDateCurValue, timeArr, updateConfigModalProps, modalDict, loading } = this.props
    let { curValue, interval, isPlay } = this.state
    let newValue = curValue + 1
    if (isPlay) {
      //限制时间在时间轴范围内
      if (newValue < timeArr.length) {
        clearTimeout(this.TimeShaft_timer)
        let specificTime = timeArr[newValue]

        if (typeof modalDict.initHistroyModal === 'function' && this.props.location.pathname !== '/systemToolScriptRule/') {
          modalDict.initHistroyModal({ specificTime: specificTime, timeFormat: props.timeFormat })
          modalDict.initCheckboxs({ specificTime: specificTime, timeFormat: props.timeFormat })
        }
        updateConfigModalProps(specificTime)
        // if(!loading) {
        //   this.TimeShaft_timer = setTimeout(this.loopTime,interval)
        // }
        upDateCurValue(newValue)

        if (this.props.location.pathname !== '/systemToolScriptRule/') {//当不为规则回放时调用以下函数
          //获取历史数据
          return this.props.initHistroyData({
            specificTime: specificTime,
            timeFormat: props.timeFormat
          }).then(
            () => {
              this.TimeShaft_timer = setTimeout(this.loopTime, interval)
            }
          )
        } else {
          return (
            eventBus.emit('timeChanged', newValue).then(
              this.TimeShaft_timer = setTimeout(this.loopTime, interval * 2)
            )
          )
        }
      }
      this.setState({
        isPlay: false
      })
    } else {
      console.info('关闭')
      clearTimeout(this.TimeShaft_timer)
      //关闭的动作
    }
  }

  //播放
  playHistoricalPic() {
    const { props, upDateCurValue, timeArr, updateConfigModalProps, modalDict, loading } = this.props
    let { curValue, interval } = this.state
    //点击切换播放状态
    this.setState({
      isPlay: !this.state.isPlay
    }, this.loopTime)
  }

  //toolTip
  formatter(value) {
    return this.addHoursToTime(this.props.timeArr[value], DValue) || ''
  }

  // 定义一个函数，用于将时间字符串加上指定小时数
  addHoursToTime(timeStr, hours) {
    // const date = new Date(timeStr); // 将字符串转换为 Date 对象
    // date.setHours(date.getHours() + hours); // 加上指定小时数

    // // 格式化输出为 "YYYY-MM-DD HH:MM:SS"
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以需要加 1
    // const day = String(date.getDate()).padStart(2, '0');
    // const hoursStr = String(date.getHours()).padStart(2, '0');
    // const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');

    // return `${year}-${month}-${day} ${hoursStr}:${minutes}:${seconds}`;
    return timeStr
  }

  //每12小时就显示一下时间
  getMarks() {
    const { timeArr, props } = this.props;
    let max = timeArr.length - 1 || 0
    let min = 0
    let marks = {} //标记
    let timeSpace //时间间隔对应的分钟
    var dateDict = {}
    if (localStorage.dateDict) {
      dateDict = JSON.parse(localStorage.dateDict)

      // 更新 dateDict 中的时间字段
      dateDict.endTime = this.addHoursToTime(dateDict.endTime, DValue);
      dateDict.startTime = this.addHoursToTime(dateDict.startTime, DValue);
      dateDict.middleTime = this.addHoursToTime(dateDict.middleTime, DValue);
    }
    // switch(props.timeFormat){
    //   case "m1":
    //     timeSpace=1;
    //     break;
    //   case 'm5':
    //     timeSpace=5;
    //     break;
    //   case 'h1':
    //     timeSpace=60
    //     break;
    // }
    //获取一共几个间隔
    // let space = Math.ceil( (max-min)/(60/timeSpace)/12 )
    // for(let i = 0;i<space;i++){
    //   if(i ==  0){
    //     marks[0] = dateDict.startTime || props.startTime || ''
    //   }else if(i == space.length-1){
    //     marks[space.length] = dateDict.endTime || props.endTime || ''
    //   }else{
    //     marks[i*(60/timeSpace)*12] = timeArr[i*(60/timeSpace)*12]
    //   }
    // }
    let val = Math.ceil((max - min) / 5)
    for (let i = 0; i <= 5; i++) {
      if (i == 0) {
        marks[0] = dateDict.startTime || props.startTime || ''
      } else if (i == 5) {
        marks[max] = dateDict.endTime || props.endTime || ''
      } else {
        marks[val * i] = ''
      }
    }
    return marks
  }

  render() {
    const { show, props, timeArr, dateModal, loading } = this.props;
    let { curValue } = this.state
    var maxKey = timeArr.length - 1 || 0
    if (!Number.isInteger(curValue)) {
      curValue = Math.round(curValue)
    }
    let curTime = timeArr[curValue] ? this.addHoursToTime(timeArr[curValue], DValue) : props.startTime;
    let maxValue = timeArr.length ? timeArr.length - 1 : 0

    let wrapClassName = dateModal.visible ? 'container-true' : 'container-false'
    if (!show) {
      return null;
    }
    let playBtnIcon = this.state.isPlay ? "pause" : "caret-right"
    return (
      <div className={s[wrapClassName]}>
        <div className={s['config-btns-left']}>
          <Button
            size="large"
            icon={playBtnIcon}
            onMouseUp={this.playHistoricalPic}
            disabled={loading}
            style={btnLeftStyle}
          />
          <Button
            size="large"
            icon="fast-backward"
            onClick={this.subtractValue}
            disabled={loading}
            style={btnLeftStyle}
          />
        </div>
        <div id="timeShaftSlider" className={s['prograss-bar']}>
          <Slider
            marks={this.getMarks()}
            max={maxValue}
            tipFormatter={this.formatter}
            onAfterChange={this.onAfterChange}
            value={curValue}
            onChange={this.onChange}
            disabled={loading}
          />
        </div>
        <div className={s['config-btns-right']}>
          <Button
            size="large"
            icon="fast-forward"
            onClick={this.plusValue}
            disabled={loading}
            style={btnRightStyle}
          />
          <Button
            size="large"
            icon="setting"
            onClick={this.showDateConfigModal}
            disabled={loading}
            style={btnSettingStyle}
          />
        </div>
        <div
          className={s['show-current-time']}
        >
          {curTime}
        </div>
        <div className={s['blinkingText']}>
          {isEnglish ? 'Current screen is in historical playback mode, not real-time. Click ' : '当前画面处于历史回放模式下，并非实时画面，点击'}
          <Button
            size='small'
            type='danger'
            onClick={() => this.props.closePlayback()}
            style={btnQuitStyle}
          // ghost={true}
          >
            {isEnglish ? 'Exit' : '退出'}
          </Button>
          {isEnglish ? ' button to exit playback mode' : '按钮退出回放模式'}
        </div>
      </div>
    );
  }
}

TimeShaft.propTypes = {
  show: PropTypes.bool
};

export default withRouter(TimeShaft);

