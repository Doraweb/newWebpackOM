import React from 'react';
import moment from 'moment';
import s from './ChatComponent.css';
import { toggleTimeShaft } from '../../layout/modules/LayoutModule';
import closeIcon from '../components/images/close-icon.png';
import chatIconUrl from '../components/images/chat-icon.png';
import http from '../../../common/http';
import { Spin } from 'antd';
import appConfig from '../../../common/appConfig';

const language = appConfig.language;


const pointObj = {
    'PriChWTempSupply01': ["冷冻水温度", "冷冻水供水温度", "冷冻供水温度", "冷冻总管供水温度", "冷冻侧供水温度"],
    'PriChWFlow01': ["冷冻水流量", "冷冻水供水流量"],
    'PriChWPressureSupply01': ["冷冻总管供水压力", "冷冻水供水压力", "冷冻总管压力", "冷冻水总管压力", "冷冻水管压力"],
    'PriChWTempReturn01': ["冷冻水回水温度", "冷冻回水温度", "冷冻总管回水温度"],
    'PriChWDP01': ["冷冻供回水压差", "冷冻总管压差", "冷冻侧供回压差", "冷冻总管供回压差"],
    'PriChWPressureReturn01': ["冷冻水回水压力", "冷冻总管回水压力", "冷冻侧回水压力"],
    'CWTempSupply01': ["冷却水温度", "冷却供水温度", "冷却总管供水温度", "冷却水供水温度", "冷却侧供水温度"],
    'CWTempReturn01': ["冷却回水温度", "冷却总管回水温度", "冷却水回水温度", "冷却侧回水温度"],
    'CWPressureReturn01': ["冷却水回水压力", "冷却总管回水压力", "冷却侧回水压力"],
    'CWPressureSupply01': ["冷却水供水压力", "冷却总管供水压力", "冷却侧供水压力"],
    'PriChWDT': ["冷冻温差", "冷冻水温差", "冷冻侧温差"],
    'CWDT': ["冷却温差", "冷却水温差", "冷却侧温差"],
    "ThisDayChillerRoomGroupPowerTotal": ["机房能耗", "机房总用电量", "机房总能耗", "总用电量"],
}



class MessageList extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.scrollList.scrollTop = this.scrollList.scrollHeight;
    }

    componentDidUpdate(_prevProps, _prevState) {
        if (_prevProps.chatMessages.length !== this.props.chatMessages.length) {
            this.scrollList.scrollTop = this.scrollList.scrollHeight;
        }
    }

    render() {
        return (
            <div className={s["chat-message-list"]} id="chat-message-list" ref={el => this.scrollList = el}>
                {this.props.chatMessages.map((message, index) => (
                    <div className={s['chat-message']} key={index}>
                        <div className={s['chat-message--content']}>
                            <div
                                key={index}
                                className={`${s['chat-message--content']} 
                                ${message.startsWith('user:') ? s['sent'] : s['received']}`}
                            >
                                <div className={s['chat-message--avatar']}>
                                    <img src={chatIconUrl} alt="avatar" />
                                </div>
                                <div className={s['chat-message--text']}
                                >
                                    {
                                        message.replace('user: ', '').replace('domAI: ', '')
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {this.props.isSpinning ?
                    <div className={s['chat-message']} >
                        <div className={s['chat-message--content']}>
                            {/* spin */}
                            <div
                                className={`${s['chat-message--content']} 
                        ${s['received']}`}
                            >
                                <div className={s['chat-message--avatar']}>
                                    <img src={chatIconUrl} alt="avatar" />
                                </div>
                                <div className={s['chat-message--text']}
                                >
                                    <Spin size="small" />
                                </div>
                            </div>

                        </div>
                    </div>

                    : null}
            </div>
        )
    }
}


class ChatComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: '',
            chatMessages: localStorage.getItem('AIChatMsg') ? JSON.parse(localStorage.getItem('AIChatMsg')) : [],
            isSpinning: false
        }
        this.inputRef = null;
    }


    componentDidMount() {
        this.inputRef.focus();
    }

    componentWillUnmount() {
        localStorage.setItem('AIChatMsg', JSON.stringify(this.state.chatMessages))
    }

    handleClose() {
        setTimeout(() => {
            this.props.setShowInput(false);
        }, 1000)
    }

    handleInputChange = (e) => {
        this.setState({
            inputText: e.target.value
        })
    }

    handlePressEnter = (e) => {
        if (e.keyCode === 13) {
            this.sendMessage();
        }
    }

    handleButtonClick = () => {
        this.sendMessage();
    }

    async sendMessage() {
        const inputText = this.state.inputText.toLowerCase().replace('：', ':');
        if (!inputText) return;

        // 添加用户消息
        const newChatMessages = [...this.state.chatMessages,
        'user: ' + this.state.inputText]
        this.setState({
            chatMessages: newChatMessages,
            inputText: '',
        })


        // 获取 ai 回复
        const responseType = this.determineResponseType(inputText);
        let botReply = '';
        switch (responseType) {
            case 1:
                const downloadData = this.getDownloadData(inputText);
                if (downloadData.errMsg) {
                    botReply = downloadData.errMsg
                } else {
                    const whichbotReply = await this.handleDownloadRequest(downloadData);
                    botReply = language === 'en'
                        ? (whichbotReply ? 'Download successful' : 'Download failed')
                        : (whichbotReply ? '下载成功' : '下载失败');
                }
                break;
            case 2:
                const trendData = this.getTrendData(inputText);
                if (!trendData.initDate) {
                    botReply = language === 'en'
                        ? 'domAI: Invalid time format'
                        : 'domAI: 时间格式有误';
                } else if (!trendData.pointName) {
                    botReply = language === 'en'
                        ? 'domAI: No relevant data found'
                        : 'domAI: 没有找到相关数据';
                } else {
                    botReply = language === 'en'
                        ? 'domAI: This is information about temperature'
                        : 'domAI: 这是关于温度的信息';
                    this.props.getTendencyModal(
                        trendData.pointName,
                        trendData.description,
                        undefined,
                        trendData.initDate
                    );
                    this.handleClose();
                }
                break;
            case 3:
                const relationData = this.getRelationData(inputText);
                if (relationData.errMsg) {
                    botReply = 'domAI: ' + relationData.errMsg
                } else {
                    botReply = language === 'en'
                        ? 'domAI: This is the correlation analysis chart you requested'
                        : 'domAI: 这是您要的相关性分析图';
                    this.props.showRelationModal(relationData)
                    this.handleClose();
                }
                break;
            case 4:
                let playbackTime = this.parseDateTime(inputText);
                playbackTime = playbackTime ? playbackTime : this.parseAbsoluteDate(inputText)
                if (playbackTime !== null) {
                    const oneHourAgo = moment().subtract(1, 'hours');
                    if (playbackTime.isSameOrBefore(oneHourAgo, 'minute')) {
                        this.playback(playbackTime);
                        botReply = language === 'en'
                            ? `domAI: Starting playback ${playbackTime.format('YYYY-MM-DD HH:mm')}`
                            : `domAI: 开始回放 ${playbackTime.format('YYYY-MM-DD HH:mm')}`;
                        this.handleClose();
                    } else if (playbackTime.isSameOrBefore(moment(), 'minute')) {
                        this.playback(oneHourAgo);
                        botReply = language === 'en'
                            ? `domAI: Starting playback ${oneHourAgo.format('YYYY-MM-DD HH:mm')}`
                            : `domAI: 开始回放 ${oneHourAgo.format('YYYY-MM-DD HH:mm')}`;
                        this.handleClose();
                    } else {
                        botReply = language === 'en'
                            ? 'domAI: Please enter a time one hour ago or earlier from the current time'
                            : 'domAI: 请输入当前时间一小时前或更早的时间';
                    }
                } else {
                    this.setState({ isSpinning: true })
                    http.post('/domAI/query', {
                        content: inputText
                    }).then(
                        res => {
                            if (!res.err) {
                                botReply = 'domAI: ' + res.data.result;
                            } else {
                                botReply = language == 'en' ? "domAI: Sorry, I cannot understand your question. Please rephrase it. For example, you can say 'Play back the recording from 8 o'clock yesterday.'" : 'domAI: 对不起，我无法理解您的问题，请换一种问法，比如回放昨天8点'
                            }
                            this.setState(prevState => ({
                                chatMessages: [...prevState.chatMessages, botReply],
                                isSpinning: false
                            }))
                        }
                    ).catch(err => {
                        botReply = language == 'en' ? "domAI: Sorry, I cannot understand your question. Please rephrase it. For example, you can say 'Play back the recording from 8 o'clock yesterday.'" : 'domAI: 对不起，我无法理解您的问题，请换一种问法，比如回放昨天8点';
                        this.setState(prevState => ({
                            chatMessages: [...prevState.chatMessages, botReply],
                            isSpinning: false
                        }))
                    })
                }
                break;
            case 5:
                botReply = language === 'en'
                    ? 'domAI: Hello, I\'m domAI, glad to serve you'
                    : 'domAI: 你好，我是domAI，很高兴为您服务';
                break;
            default:
                botReply = language === 'en'
                    ? 'domAI: The field you entered is incorrect, please re-enter'
                    : 'domAI: 您输入的字段有误，请重新输入';
                break;
        }

        if (botReply !== '') {
            // 添加 ai 回复
            this.setState(prevState => ({
                chatMessages: [...prevState.chatMessages, botReply],
            }));

        }
    }

    determineResponseType = (inputText) => {
        if (inputText.includes('你好') || inputText.includes('hi') || inputText.includes('hello') || inputText.includes('你是谁')) {
            return 5;
        } else if (this.isDownloadRequest(inputText)) {
            return 1;
        } else if (this.isTrendRequest(inputText)) {
            return 2;
        } else if (this.isRelation(inputText)) {
            return 3;
        } else if (this.isPlaybackRequest(inputText)) {
            return 4;
        } else
            return 0;
    }

    // 判断是不是下载指令 
    isDownloadRequest = (inputText) => {
        return inputText.includes('下载')
    }

    isRelation = (inputText) => {
        return inputText.includes('vs') || inputText.includes('VS') || ((inputText.includes('与') || inputText.includes('和')) && (inputText.includes('相关性分析')
            || inputText.includes('关联分析')))
    }

    isPlaybackRequest = (inputText) => {
        // return inputText.includes('回放') || inputText.includes('播放') || inputText.includes('查看')
        //     || inputText.includes('历史') || inputText.includes('系统情况') || inputText.includes('查询');
        return true;
    }

    parseDateTime = (text) => {

        if (text.includes('月') && text.includes('日')) {
            return null;
        }

        const now = moment();
        const today = moment(now).startOf('day');
        const yesterday = moment(today).subtract(1, 'days');
        const yeyesterday = moment(yesterday).subtract(2, 'days');
        const yeyeyesterday = moment(yeyesterday).subtract(3, 'days');

        const timeInfo = this.parseTime(text);

        if (timeInfo === null) {
            return null;
        }

        let dateMoment;

        if (text.includes('今天') || text.includes('今日')) {
            dateMoment = today;
        } else if (text.includes('昨天') || text.includes('昨日')) {
            dateMoment = yesterday;
        } else if (text.includes('前天') || text.includes('前日')) {
            dateMoment = yeyesterday
        } else if (text.includes('大前天') || text.includes('大前日')) {
            dateMoment = yeyeyesterday;
        } else {
            dateMoment = today;
        }

        dateMoment.hour(timeInfo.hours).minute(timeInfo.minutes);

        if (dateMoment.isValid()) {
            return dateMoment;
        } else {
            return null;
        }
    }


    parseTime = (timeStr) => {
        let [hours, minutes] = [null, null];

        if (timeStr.includes('上午') ||
            timeStr.includes('早上') ||
            timeStr.includes('早晨')
        ) {
            let match = timeStr.match(/(\d+)点(\d+)?/) ? timeStr.match(/(\d+)点(\d+)?/) : timeStr.match(/(\d+):(\d+)/);
            if (match) {
                hours = parseInt(match[1], 10);
                minutes = match[2] ? parseInt(match[2], 10) : 0;
            }
        } else if (
            timeStr.includes('下午') ||
            timeStr.includes('晚上') ||
            timeStr.includes('傍晚') ||
            timeStr.includes('晚间')
        ) {
            const match = timeStr.match(/(\d+)点(\d+)?/);
            if (match) {
                hours = parseInt(match[1], 10) + 12;
                minutes = match[2] ? parseInt(match[2], 10) : 0;
            }
        } else {
            const match = timeStr.match(/(\d+)点(\d+)?/);
            if (match) {
                hours = parseInt(match[1], 10);
                minutes = match[2] ? parseInt(match[2], 10) : 0;
            } else {
                const match2 = timeStr.match(/(\d+):(\d+)/);
                if (match2) {
                    hours = parseInt(match2[1], 10);
                    minutes = parseInt(match2[2], 10);
                }
            }
        }

        if (hours === null || minutes === null) {
            return null;
        } else {
            return { hours, minutes }
        }
    }


    parseAbsoluteDate(dateStr) {
        // 处理中文日期格式 
        // TODO: 优化中文日期解析
        let match = dateStr.match(/(\d+)年(\d+)月(\d+)日 (\d+):(\d+)/) ?
            dateStr.match(/(\d+)年(\d+)月(\d+)日 (\d+):(\d+)/) :
            dateStr.match(/(\d+)年(\d+)月(\d+)日 (\d+)点(\d+)/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // 月份从0开始
            const day = parseInt(match[3], 10);
            const hours = parseInt(match[4], 10);
            const minutes = parseInt(match[5], 10);
            return moment({ year, month, day, hours, minutes });
        } else if (dateStr.match(/(\d+)月(\d+)日 (\d+):(\d+)/)
            || dateStr.match(/(\d+)月(\d+)日 (\d+)点(\d+)/)
        ) {
            match = dateStr.match(/(\d+)月(\d+)日 (\d+):(\d+)/) ?
                dateStr.match(/(\d+)月(\d+)日 (\d+):(\d+)/) :
                dateStr.match(/(\d+)月(\d+)日 (\d+)点(\d+)/);
            const year = moment().year();
            const month = parseInt(match[1], 10) - 1; // 月份从0开始
            const day = parseInt(match[2], 10);
            const hours = parseInt(match[3], 10);
            const minutes = parseInt(match[4], 10);
            return moment({ year, month, day, hours, minutes });
        } else if (dateStr.match(/(\d+)月(\d+)日 (\d+)点/)) {
            match = dateStr.match(/(\d+)月(\d+)日 (\d+)点/);
            const year = moment().year();
            const month = parseInt(match[1], 10) - 1; // 月份从0开始
            const day = parseInt(match[2], 10);
            const hours = parseInt(match[3], 10);
            const minutes = 0;
            return moment({ year, month, day, hours, minutes });
        } else if (dateStr.match(/(\d+)年(\d+)月(\d+)日 (\d+)点/)) {
            match = dateStr.match(/(\d+)年(\d+)月(\d+)日 (\d+)点/);
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // 月份从0开始
            const day = parseInt(match[3], 10);
            const hours = parseInt(match[4], 10);
            const minutes = 0;
            return moment({ year, month, day, hours, minutes });
        } else {
            const parsed = moment(dateStr);
            return parsed.isValid() ? parsed : null; // 尝试直接解析，如果无效返回 null
        }
    }

    getRelationData = (inputText) => {
        let inputTextList
        if (inputText.includes(' vs ')) {
            inputTextList = inputText.split(' vs ')
            return {
                x: inputTextList[0].trim(),
                y: inputTextList[1].trim()
            }
        } else if (inputText.includes(' VS ')) {
            inputTextList = inputText.split(' VS ')
            return {
                x: inputTextList[0].trim(),
                y: inputTextList[1].trim()
            }
        } else if (inputText.includes('vs')) {
            inputTextList = inputText.split('vs')
        } else if (inputText.includes('VS')) {
            inputTextList = inputText.split('VS')
        } else if (inputText.includes('和')) {
            inputTextList = inputText.split('和')
        } else if (inputText.includes('与')) {
            inputTextList = inputText.split('与')
        } else {
            return {
                errMsg: '请确保键入一个关联关键字：vs、VS、和、与'
            }
        }
        let pointNameA = this.findKeyIfContainsKeyword(inputTextList[0])
        let pointNameB = this.findKeyIfContainsKeyword(inputTextList[1])
        if (pointNameA && pointNameB) {
            let allPointList = localStorage.getItem('allPointList')
            if (allPointList != undefined) {
                allPointList = JSON.parse(allPointList)
                const pointInfoA = allPointList.find(item => item.name.includes(pointNameA))
                const pointInfoB = allPointList.find(item => item.name.includes(pointNameB))
                if (pointInfoA && pointInfoB) {
                    pointNameA = pointInfoA.name
                    pointNameB = pointInfoB.name
                    return {
                        x: pointNameA,
                        y: pointNameB
                    }
                } else if (!pointInfoA) {
                    return {
                        errMsg: '当前项目中未查询到' + pointNameA + '的标准点名'
                    }
                } else if (!pointInfoB) {
                    return {
                        errMsg: '当前项目中未查询到' + pointNameB + '的标准点名'

                    }
                }
            }
        } else {
            return {
                errMsg: '请确保填入两个有效的点位名称'
            }
        }
    }

    //解析查趋势点位和时间
    getTrendData = (inputText) => {
        const initDate = this.getTrendDate(inputText)
        let pointName = this.findKeyIfContainsKeyword(inputText), description
        if (pointName) {
            let allPointList = localStorage.getItem('allPointList')
            if (allPointList != undefined) {
                allPointList = JSON.parse(allPointList)
                const pointInfo = allPointList.find(item => item.name.includes(pointName))
                if (pointInfo) {
                    description = pointInfo.description
                    pointName = pointInfo.name
                }
            }
        }
        return { initDate, pointName, description }
    }

    //获取趋势用的日期
    getTrendDate = (str) => {
        let time
        const TIME_FORMAT = 'YYYY-MM-DD'
        if (str.includes('今天') || str.includes('今日')) {
            time = moment().format(TIME_FORMAT)
        } else if (str.includes('昨天') || str.includes('昨日')) {
            time = moment().subtract(1, 'day').format(TIME_FORMAT)
        } else if (str.includes('前天') || str.includes('前日')) {
            time = moment().subtract(2, 'day').format(TIME_FORMAT)
        } else if (str.includes('大前天') || str.includes('大前日')) {
            time = moment().subtract(3, 'day').format(TIME_FORMAT)
        } else {
            const match = str.match(/(\d+)年(\d+)月(\d+)日/)
            if (match) {
                const year = parseInt(match[1], 10)
                const month = parseInt(match[2], 10) - 1
                const day = parseInt(match[3], 10)
                time = moment({ year, month, day }).format(TIME_FORMAT);
            } else if (str.match(/(\d+)月(\d+)日/)) {
                const match2 = str.match(/(\d+)月(\d+)日/);
                const year = moment().year()
                const month = parseInt(match2[1], 10) - 1
                const day = parseInt(match2[2], 10)
                time = moment({ year, month, day }).format(TIME_FORMAT);
            } else {
                time = null
            }
        }
        return time
    }

    // 解析下载请求中的点位名称和时间范围
    getDownloadData = (inputText) => {
        let points = [];
        let email = '';
        let dates = [];

        // 提取点位
        for (let [key, values] of Object.entries(pointObj)) {
            for (let value of values) {
                if (inputText.includes(value)) {
                    points.push(key)
                }
            }
        }
        for (let i = 0; i < points.length; i++) {
            if (points[i]) {
                let allPointList = localStorage.getItem('allPointList')
                if (allPointList != undefined) {
                    allPointList = JSON.parse(allPointList)
                    const pointInfo = allPointList.find(item => item.name.includes(points[i]))
                    if (pointInfo) {
                        points[i] = pointInfo.name; // 通过索引修改数组中的元素
                    }
                }
            }
        }


        // 提取邮箱
        const emailMatch = inputText.match(/[\w\.-]+@[\w\.-]+(\.[a-zA-Z]{2,6})+/)
        if (emailMatch) {
            email = emailMatch[0]
        }

        // 提取日期
        const dateMatches = inputText.match(/(\d+)年(\d+)月(\d+)日/g)
        if (dateMatches) {
            dates = dateMatches.map(dateStr => moment(dateStr, 'YYYY年M月D日'))
        }

        // 如果少于两个日期，则默认为一天0点到23点
        // if (dates.length === 1) {
        //     dates.push(moment(dates[0]).endOf('day'));
        // } else if (dates.length === 0) {
        //     dates.push(moment().startOf('day'));
        //     dates.push(moment().endOf('day'));
        // }

        if (points.length === 0 || !email || dates.length === 0 || dates.length < 2) {
            return { errMsg: '如需要下载数据，请输入"下载 若干点位名称(如：冷冻水温度) 起始日期 终止日期 邮箱地址" ' }
        } else {
            return { points, email, startDate: dates[0], endDate: dates[1] }
        }
    }

    // /sendHistoryDataByEmail POST
    // 传入：
    // {
    // "pointNameList": ["point01", "point02", "point03", "point04"],
    // "beginTime": "2025-02-11 00:00:00",
    // "endTime": "2025-02-11 07:00:00",
    // "timeFormat":"h1",
    // "email": "1169718155@qq.com"
    // }
    handleDownloadRequest = (downloadData) => {
        let botReply = true;
        const { points, email, startDate, endDate } = downloadData
        // this.setState(prevState => ({
        //     chatMessages: [...prevState.chatMessages, '正在下载数据，请稍候...'],
        //     isSpinning: true,
        // }))
        http.post('/sendHistoryDataByEmail', {
            pointNameList: points,
            beginTime: startDate.format('YYYY-MM-DD HH:mm:ss'),
            endTime: endDate.format('YYYY-MM-DD HH:mm:ss'),
            timeFormat: 'h1',
            email: email
        }).then(
            res => {
                if (res.err) {
                    botReply = false
                }
            }
        ).catch(err => {
            botReply = false
        })

        return botReply;
    }

    //根据输入的内容检索趋势用的标准点名
    findKeyIfContainsKeyword = (str) => {
        for (let keyValue of Object.entries(pointObj)) {
            const key = keyValue[0]
            const values = keyValue[1]
            for (let value of values) {
                if (str.includes(value)) {
                    return key
                }
            }
        }
        return null
    }

    //判断是不是查趋势
    isTrendRequest = (inputText) => {
        // 定义需要检查的关键字数组
        const keywords = ["温度", "流量", "用电量", "功率", "压力", "压差", "趋势"];
        const regexPattern = new RegExp(`查.*(${keywords.map(keyword => keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'i');
        return regexPattern.test(inputText);
    }

    playback = (time) => {
        // TODO: 回放历史数据
        let _this = this
        const {
            parmsDict,
            upDateCurValue,
            toggleDateConfigModal,
            toggleTimeShaft,
            getTimeArr,
        } = this.props
        parmsDict.closeRealTimeFresh()
        let curValue = 0
        let middleTime

        if (!time || !moment(time).isValid()) {
            console.error('时间格式不正确')
            return null;
        }

        let startTime = moment(time).subtract(1, 'hour')
        let endTime = moment(time).add(1, 'hour')
        curValue = (endTime - startTime) / 2 / 60000
        middleTime = moment(startTime + (endTime - startTime) / 2).format('YYYY-MM-DD HH:mm:00')
        let timeFormat = 'm1'
        let dateDict = {
            startTime: startTime.format(`YYYY-MM-DD HH:mm:ss`),
            endTime: endTime.format(`YYYY-MM-DD HH:mm:ss`),
            timeFormat: 'm1',
            pattern: '2',
            curValue: curValue,
            middleTime: middleTime
        }

        localStorage.dateDict = JSON.stringify(dateDict)
        parmsDict.closeRealTimeFresh()
        upDateCurValue(curValue)
        toggleTimeShaft(true) //显示时间轴组件
        getTimeArr({ startTime, endTime, timeFormat })
        //同步执行代码
        var syncFun = new Promise(function (resolve, reject) {
            resolve(function () {
                return toggleDateConfigModal(false, dateDict)
            })
        })
        syncFun.then(function (first) {
            return first()
        })
            .then(function (second) {
                parmsDict.renderScreen(parmsDict.pageId, true)
            })
    }


    render() {
        return (
            <div className={s['chat-container']}>
                <div className={s['chat-header']}>
                    <div className={s["chat-header--team-name"]}> {language == 'en' ? 'DOM AI Assistant' : 'DOM AI助手'} </div>
                    <div className={s["chat-header--close-button"]} onClick={() => this.props.setShowInput(false)}>
                        <img src={closeIcon} alt="" />
                    </div>
                </div>
                <MessageList chatMessages={this.state.chatMessages} isSpinning={this.state.isSpinning} />
                <div className={s["chat-input"]}>
                    <input
                        type='text'
                        ref={input => this.inputRef = input}
                        value={this.state.inputText}
                        onChange={this.handleInputChange}
                        onKeyDown={this.handlePressEnter}
                        placeholder={language === 'en' ? 'Enter your message...' : '输入你的消息...'}
                        className={s['chat-input--text']}
                    />
                    <button className={s['chat-user-input--buttons']} onClick={this.handleButtonClick}>
                        {language === 'en' ? 'Send' : '发送'}
                    </button>
                </div>
            </div>
        )
    }
}

export default ChatComponent;