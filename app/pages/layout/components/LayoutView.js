/**
 * 框架页
 */
import React from 'react';
import Dexie from 'dexie';
import { Menu, Button, Modal, Badge, Spin, Alert, Icon, message, Popover, Dropdown, Form, Input } from 'antd';
import { Link, } from 'react-router';
import cx from 'classnames';
import { history, store } from '../../../index';
import appConfig from '../../../common/appConfig'

import './Layout.global.css';
import s from './LayoutView.css';
import Timer from '../../../components/Timer';
import TimerStyle from '../../../components/TimerStyle';
import http from '../../../common/http';
import { hideModal as autoOutHideModal, showUpdateTokenModal } from '../../modal/modules/ModalModule'
import { downloadUrl, addOperation } from '../../../common/utils';
import { modalTypes, Layout_modalTypes } from '../../../common/enum';

import { closeAppWindow, minimizeAppWindow, maximizeAppWindow, splitAppWindow } from '../../../core/cmdRenderer';
import OperationRecordModal from './OperationRecordModalView';
import UserPanel from './UserPanelView';
import HistoryLayer from '../../history';
import WarningManageLayer from '../../warningManage';
import NetworkManageLayer from '../../networkManage';
import RealtimeWarningModal from './RealtimeWarningModalView';
import ScheduleView from './ScheduleModalView';
import SceneView from './SceneModalView'
import ModelManageModalView from './ModelManageModalView'
import SceneControlModalView from './SceneControlModalView'
import TimeShaft from '../containers/TimeShaftContainer'
import DateConfigModal from './DateConfigModalView'
import DebugLayer from '../../debug';
import ReconnectionView from './ReconnectionModalView'
import Trend from '../../Trend/containers/TrendContainer'
import CommandLog from '../../commandLog/containers/commandLogContainer';
import ModeButtonsListView from './ModeButtonsListView';
import DeviceInfo from './DeviceInfo'
import MainModal from '../../modal';
import SecModal from '../../secModal';
import GuaranteeAddView from './GuaranteeAddView'
import GuaranteeView from './GuaranteeView'
import GuaranteeSearchView from './GuaranteeSearchView'
import WeatherHistoryModal from './WeatherHistoryModalView'
import moment, { lang } from 'moment';
import ElecPriceModal from './ElecPriceModalView';
import WatchOver from './WatchOver';
import EnergyPriceModal from './EnergyPriceModalView';
import CommandSurveillanceModal from './CommandSurveillanceModalView';
import eventBus from '../../../common/eventBus.js'
import CustomerServiceView from './CustomerServiceModalView.js';
import AIModalView from './AIModalView.js';
import ChatComponent from './ChatComponent.js';
import { call } from 'file-loader';
import AIRuleModalView from '../../aiRule/components/AIRuleModalView.js';
import FaultHandleView from '../../Warning/components/FaultHandle/FaultHandleView.js'
import ScriptRuleModalView from '../../scriptRule/components/ScriptRuleModalView.js';
import ModelText from '../../observer/components/core/entities/modelText.js';
import SystemSettingsModal from './SystemSettingsModalView.js'

const toolbar_display = localStorage.getItem('toolbarDisplay') ? JSON.parse(localStorage.getItem('toolbarDisplay')) : {}
const user_menu_display = localStorage.getItem('userMenuDisplay') ? JSON.parse(localStorage.getItem('userMenuDisplay')) : {}
const menuFontSize = localStorage.getItem('menuFontSize') ? localStorage.getItem('menuFontSize') : 14
let forceHomePage = localStorage.getItem('forceHomePageAfterRestart');

const remote = require('@electron/remote');
const MenuItem = Menu.Item;
const MenuItemGroup = Menu.ItemGroup;
const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;
const language = appConfig.language
const pysiteVersion = JSON.parse(localStorage.getItem('pysiteVersion'))

let argv = remote.process.argv;

let key   //存储当前点击页面的key
let oldKey  //存储上一次变化后的动态key
var timer, tokenTimer
let str, toggleClass, toggleTitleClass;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'warning-config-best';
    toggleClass = 'best-menuList  best-ant-menu-item best-ant-menu-title';
    toggleTitleClass = 'best-content-header-menu';
} else {
    str = '';
    toggleClass = '';
    toggleTitleClass = 'content-header-menu';
}

var modeButtonsTimer, weatherTimer, omSiteVersionTimer;

//页面CSS样式定义
let selectedStyle, defaultStyle, ContentHeaderStyle, LTbtnStyle;    //内容区顶部样式     
let headerStyle, headerStyleSpan, headerStyleLogo, RTbtnStyle, userInfoName, weatherStyle, bestMenuStyle;  //顶部区域样式
let footerStyle;   //底部区域样式
let containerClass, contentClass, contentTimeClass

if (localStorage.getItem('serverOmd') == "best") {
    selectedStyle = {       //选中样式
        position: 'relative',
        left: '-12px',
        color: "#2ea2f8",
        height: 32,
        boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        padding: '0 5px',
        background: "linear-gradient(RGB(130,130,130),RGB(230,230,230), RGB(80,80,80))",
        borderRadius: '3px',
    }
    //菜单栏默认
    defaultStyle = {       //默认样式
        position: 'relative',
        left: '-12px',
        height: 32,
        boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        padding: '0 5px',
        background: "linear-gradient(RGB(196,196,196),RGB(230,230,230), RGB(120,120,120))",
        color: '#333',
        borderRadius: '3px',
    }
    bestMenuStyle = {
        marginBottom: '-3px',
        marginLeft: '-3px',
    }
    //顶部样式
    headerStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "48px",
        lineHeight: "48px",
        backgroundColor: "#fff",
    }
    weatherStyle = {
        display: 'inline-block',
        position: 'relative',
        color: "#333"
    }
    headerStyleSpan = {
        color: "#333",
        display: 'inline-block',
        margin: '0 10px'
    }
    //头部左上角logo样式
    headerStyleLogo = {
        float: "left",
        marginLeft: "10px",
        fontWeight: "bold",
        color: "#333"
    }
    //头部内容区样式
    ContentHeaderStyle = {
        height: "48px",
        lineHeight: "48px",
        background: "linear-gradient(RGB(250,250,250), RGB(134,134,134))",
        position: "absolute",
        borderTop: "1px solid RGB(200,200,200)",
        top: 0,
        left: 0,
        right: 0
    }
    //底部样式
    footerStyle = {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40px",
        lineHeight: "40px",
        borderTop: "1px solid RGB(215,215,215)",
        background: "linear-gradient(RGB(250,250,250), RGB(180,180,180))",
        zIndex: 1000
    }
    //右上角图标样式
    RTbtnStyle = {
        background: "RGB(133,133,133)",
        textShadow: "1px 1px 2px black,-1px -1px 2px white",
        border: 0,
        marginLeft: '6px'
    }
    //左上角图标样式
    LTbtnStyle = {
        background: "RGB(133,133,133)",
        textShadow: "1px 1px 2px black,-1px -1px 2px white",
        boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        border: 0
    }
    userInfoName = {
        margin: '0 5px',
        color: "#333"
    }
    containerClass = 'best-container'
    contentClass = 'content'
    contentTimeClass = 'content-Time'
} else {
    containerClass = 'container'
    contentClass = 'content'
    contentTimeClass = 'content-Time'
    bestMenuStyle = {}
    selectedStyle = {       //选中样式
        borderBottom: '2px solid #3485FF',
        height: 32
    }
    defaultStyle = {       //默认样式
        borderBottom: '2px solid transparent',
        height: 32
    }
    headerStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "48px",
        lineHeight: "48px",
        color: '#aaa'
    }
    headerStyleSpan = {
        display: 'inline-block',
        margin: '0 10px'
    }
    weatherStyle = {
        display: 'inline-block',
        position: 'relative'
    }
    headerStyleLogo = {
        float: "left",
        marginLeft: "10px",
        fontWeight: "bold"
    }
    ContentHeaderStyle = {
        height: "48px",
        lineHeight: "48px",
        background: "#273142",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    }
    footerStyle = {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40px",
        lineHeight: "52px",
        borderTop: "1px solid #313d4f",
        background: "#1b2431",
        zIndex: 1000
    }

    RTbtnStyle = {
        marginLeft: '10px'
    }
    userInfoName = {
        margin: '0 10px'
    }

}


const closeWindow = (dashboardPages) => {
    Modal.confirm({
        title: language == 'en' ? 'Confirm Exit Application?' : '是否确认退出应用？',
        content: language == 'en' ? 'Click "OK" button to exit the application.' : '点击"确定"按钮退出应用程序。',
        okText: language == 'en' ? 'OK' : '确定',
        cancelText: language == 'en' ? 'Cancel' : '取消',
        onOk: () => {
            clearLine(dashboardPages)
        }
    });
}

//当关闭软件时，清空有关仪表盘的所有localStorage
const clearLine = (dashboardPages) => {
    if (localStorage.getItem('lowLevelExitDisabled') &&
        localStorage.getItem('lowLevelExitDisabled') == 1 &&
        localStorage.getItem('userData') &&
        JSON.parse(localStorage.getItem('userData')).role < 3
    ) {
        Modal.info({
            title: language == 'en' ? 'Notice' : '提示',
            content: language == 'en' ? 'Non-administrators are prohibited from closing the software' : '非管理员禁止关闭软件'
        })
        return
    }
    // console.log(dashboardPages)
    if (dashboardPages.length != 0) {
        dashboardPages.map(row => {
            if (localStorage[row]) {
                window.localStorage.removeItem(row)
            }
        })
    }
    if (localStorage['linePointDict']) {
        window.localStorage.removeItem('linePointDict')
    }
    if (localStorage['dateDict']) {
        window.localStorage.removeItem('dateDict')
    }
    if (localStorage['requestPoints']) {
        window.localStorage.removeItem('requestPoints')
    }
    //删除历史曲线的缓存时间段
    if (localStorage['historyTimeStart']) {
        window.localStorage.removeItem('historyTimeStart')
    }
    if (localStorage['knowledgeObj']) {
        window.localStorage.removeItem('knowledgeObj')
    }
    if (localStorage['historyTimeEnd']) {
        window.localStorage.removeItem('historyTimeEnd')
    }
    //删除缓存天数
    if (localStorage['leftday']) {
        window.localStorage.removeItem('leftday')
    }

    //删除项目所以点名清单
    if (localStorage['allPointList']) {
        window.localStorage.removeItem('allPointList')
    }

    //删除否是显示天气的配置
    if (localStorage['weatherDis']) {
        window.localStorage.removeItem('weatherDis')
    }

    //删除缓存的项目代号
    if (localStorage['projectName_en']) {
        window.localStorage.removeItem('projectName_en')
    }

    //删除缓存的公司名
    if (localStorage['serverOmd']) {
        window.localStorage.removeItem('serverOmd')
    }

    //删除缓存的简易动画
    if (localStorage['animation']) {
        window.localStorage.removeItem('animation')
    }

    //删除缓存的设备点名
    if (localStorage['selectEquipment']) {
        window.localStorage.removeItem('selectEquipment')
    }
    //删除缓存的设备铭牌信息
    if (localStorage['deviceDetails']) {
        window.localStorage.removeItem('deviceDetails')
    }

    //删除缓存设备顶部文字大小配置
    if (localStorage['equipment_top_text_fontSize']) {
        window.localStorage.removeItem('equipment_top_text_fontSize')
    }

    //删除缓存的图标偏移字段
    if (localStorage['animation_icon_move']) {
        window.localStorage.removeItem('animation_icon_move')
    }

    //删除缓存的图标偏移字段
    if (localStorage['projectRightsDefine']) {
        window.localStorage.removeItem('projectRightsDefine')
    }

    //删除缓存的操作记录筛选按钮信息
    if (localStorage['operationBtnInfo']) {
        window.localStorage.removeItem('operationBtnInfo')
    }

    //删除缓存的om标题信息
    if (localStorage['omTitle']) {
        window.localStorage.removeItem('omTitle')
    }
    //删除缓存的多边形颜色动画
    if (localStorage['animation_status_on_color']) {
        window.localStorage.removeItem('animation_status_on_color')
    }
    if (localStorage['animation_status_err_color']) {
        window.localStorage.removeItem('animation_status_err_color')
    }
    if (localStorage['animation_status_disable_color']) {
        window.localStorage.removeItem('animation_status_disable_color')
    }
    //删除缓存的om标题信息
    if (localStorage['omTitleSize']) {
        window.localStorage.removeItem('omTitleSize')
    }

    //删除缓存的分屏页面id
    if (localStorage['splitPageId']) {
        window.localStorage.removeItem('splitPageId')
    }
    //删除初始化窗口需要跳转到首页的标记
    if (localStorage['creatAppWindow']) {
        localStorage.removeItem('creatAppWindow');
    }
    //删除屏幕宽度标记（用于判断显示最大化/向下恢复按钮样式）
    if (localStorage['maxBtn']) {
        localStorage.removeItem('maxBtn');
    }

    //删除页面红色闪烁报警的缓存字段信息
    if (localStorage['pagesRedWarning']) {
        window.localStorage.removeItem('pagesRedWarning')
    }

    //删除token记录
    if (localStorage['token']) {
        window.localStorage.removeItem('token')
    }

    if (localStorage['WarningPages']) {
        window.localStorage.removeItem('WarningPages')
    }

    //删除网络架构里的 无法判断状态的列表
    if (localStorage['netDeviceUnclearList']) {
        window.localStorage.removeItem('netDeviceUnclearList')
    }

    //删除数据趋势的点位锁信息
    if (localStorage['lockPointList']) {
        localStorage.removeItem('lockPointList')
    }

    //删除初始化页面id
    if (String(localStorage['initPageId'])) {
        localStorage.removeItem('initPageId');
    }

    //删除初始化回放数据开始时间
    if (localStorage['historyStartTime']) {
        localStorage.removeItem('historyStartTime');
    }

    //删除缓存的当前页面信息
    if (localStorage['selectedPageName']) {
        localStorage.removeItem('selectedPageName');
    }
    if (localStorage['selectedPageId']) {
        localStorage.removeItem('selectedPageId');
    }



    //删除通用组件报表页面的数据
    if (localStorage['reportRange'] || localStorage['reportSpan'] || localStorage['energyFee'] || localStorage['energyFeeData'] || localStorage['energyFeePrice'] || localStorage['energyFeeHeader']) {
        window.localStorage.removeItem('reportRange');
        window.localStorage.removeItem('reportSpan');
        window.localStorage.removeItem('energyFee');
        window.localStorage.removeItem('energyFeeData');
        window.localStorage.removeItem('energyFeePrice');
        window.localStorage.removeItem('energyFeeHeader');
    }
    //删除热备配置
    if (localStorage['standby']) {
        window.localStorage.removeItem('standby')
    }

    //退出软件

    if (argv.length > 14 && argv[argv.length - 6] == "-count") {
        var start1 = require('child_process').exec("taskkill /im OM.exe /f")

    } else {
        addOperation('/operationRecord/addLogin', {
            "userName": JSON.parse(localStorage.getItem('userData')).name,
            "type": 0,
            "address": '',
            "lang": "zh-cn"
        }, '用户登出记录')
        setTimeout(function () {
            closeAppWindow()
        }, 500)
    }


}

export const closeApp = () => {
    clearLine([])
}

const handleWarningBtn = (toggleWarningManageModal, renderList) => {
    if (JSON.parse(localStorage.getItem('userData')).role >= 2) {
        renderList()
        toggleWarningManageModal()
    } else {
        Modal.info({
            title: language == 'en' ? 'Notice' : '提示',
            content: language == 'en' ? 'Insufficient user permissions' : '用户权限不足'
        })
    }
}

const handleNetworkBtn = (toggleNetworkManageModal) => {
    if (JSON.parse(localStorage.getItem('userData')).role >= 2) {
        toggleNetworkManageModal()
    } else {
        Modal.info({
            title: language == 'en' ? 'Notice' : '提示',
            content: language == 'en' ? 'Insufficient user permissions' : '用户权限不足'
        })
    }
}

//顶部导航菜单组件
class MenuComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            //选中的key
            selectedKeys: '',
            currentGroupIndex: 0,
            selectGroupIndex: 0
        }
        this.goFullPage = this.goFullPage.bind(this);
        this.reload = this.reload.bind(this);
        this.getHomeId = this.getHomeId.bind(this);
        this.handleClickdbClearMenu = this.handleClickdbClearMenu.bind(this);
    }

    componentDidMount() {
        const recentVisitPageId = localStorage.getItem('recentVisitPageId')
        this.props.initialize(true);
        //将组件内的方法封装
        this.props.updateFullPage({
            goFullPage: this.goFullPage
        });
        let diffMenus = true

        // 如果有强制跳转标识，执行跳转并跳过原有逻辑
        if (forceHomePage === 'true') {
        } else {
            //跳转至初始化页面、或者上次关闭的页面
            if (String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {
                if (localStorage.getItem('initPageId') == '策略管理' ||
                    localStorage.getItem('initPageId') == '数据管理' ||
                    localStorage.getItem('initPageId') == '数据导入管理' ||
                    localStorage.getItem('initPageId') == '报表进度管理' ||
                    localStorage.getItem('initPageId') == '点位监控' ||
                    localStorage.getItem('initPageId') == '日志信息' ||
                    localStorage.getItem('initPageId') == '全局配置' ||
                    localStorage.getItem('initPageId') == '策略指令查询') {
                    this.setState({
                        selectedKeys: 'cxMenu'
                    });
                    history.push('systemToolCx')
                } else {
                    this.setState({
                        selectedKeys: String(localStorage.getItem('initPageId'))
                    });
                    this.reload(String(localStorage.getItem('initPageId')), diffMenus);
                }
            } else {
                if (recentVisitPageId) {
                    this.setState({
                        selectedKeys: recentVisitPageId
                    });
                } else {
                    if (this.props.menus && this.props.gMenusFlag && this.props.menus.length != 0) { //有二级菜单，菜单数据结构不同
                        this.setState({
                            selectedKeys: this.props.menus[0].pageList[0]['id']
                        });
                    } else {
                        if (this.props.menus.length != 0) {
                            this.setState({
                                selectedKeys: this.props.menus[0]['id']
                            });
                        }
                    }
                }
            }
        }

        if (localStorage.getItem('historyStartTime') && localStorage.getItem('historyStartTime') != '' && localStorage.getItem('historyStartTime') != null) {
            setTimeout(() => {
                this.props.historyStart()
            }, 1000)
        }
        timer = setInterval(function () {
            http.get('/static/files/om/omsite.txt').then(
                res => {
                    if (res.version) {
                        if (res.version != appConfig.project.version) {
                            Modal.destroyAll();
                            Modal.confirm({
                                title: '发现OM软件有新版本',
                                content: '点击"确定"按钮开始下载新版本OM(安装时需关闭所有已运行的OM软件)',
                                onOk() {
                                    downloadUrl(`${appConfig.serverUrl}/static/files/om/omsite-setup.exe`)
                                },
                                onCancel() {

                                }
                            })
                        }
                    }
                }
            )
        }, 4 * 60 * 60 * 1000)
        if (appConfig.token) {
            tokenTimer = setInterval(function () {
                if (appConfig.userData.name != "guest") {
                    http.post('/renewToken', {
                        token: appConfig.token
                    }).then(res => {
                        if (res.err == 0) {
                            localStorage.setItem('token', res.data)
                            appConfig.token = res.data
                        } else {
                            Modal.destroyAll()
                            Modal.info({
                                title: language === 'en' ? 'Prompt' : '提示',
                                content: language === 'en' ? 'User token renewal failed, please log in to the account again' : '用户token延续失败，请重新登录账号',
                                onOk: () => {
                                    showUpdateTokenModal()
                                }
                            })
                        }
                    })
                }
            }, 60 * 60 * 1000)
        }
    }

    componentDidUpdate(prevProps) {
        let diffMenus = true
        //gMenusFlag为true即有二级菜单
        if (this.props.bShowTimeShaft) { }
        else {
            if (this.props.gMenusFlag) {
                if (this.props.menus.length !== prevProps.menus.length) {
                    const { menus } = this.props

                    if (localStorage.getItem('splitPageId') != undefined && localStorage.getItem('splitPageId') != "") {
                        this.setState({
                            selectedKeys: String(localStorage.getItem('splitPageId'))
                        });
                        this.reload(String(localStorage.getItem('splitPageId')), diffMenus);
                    } else {
                        if (String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {

                        } else {
                            for (var m = 0; m < menus.length; m++) {
                                for (var n = 0; n < menus[m].pageList.length; n++) {
                                    if (menus[m].pageList[n]['id'] == this.state.selectedKeys) {
                                        return
                                    }
                                }
                            }
                            this.setState({
                                selectedKeys: menus[0].pageList[0] && menus[0].pageList[0]['id']
                            });
                            this.reload(menus[0].pageList[0]['id'], diffMenus, this.state.selectedKeys);
                        }
                    }
                    return
                } else {
                    for (let i = 0; i < this.props.menus.length; i++) {
                        if (this.props.menus[i].pageList.length != prevProps.menus[i].pageList.length) {
                            const { menus } = this.props
                            for (var m = 0; m < menus.length; m++) {
                                for (var n = 0; n < menus[m].pageList.length; n++) {
                                    if (menus[m].pageList[n]['id'] == this.state.selectedKeys) {
                                        return
                                    }
                                }
                            }
                            this.setState({
                                selectedKeys: menus[0].pageList[0] && menus[0].pageList[0]['id']
                            });
                            this.reload(menus[0].pageList[0]['id'], diffMenus, this.state.selectedKeys);
                            return
                        } else {
                            for (let j = 0; j < this.props.menus[i].pageList.length; j++) {
                                if (this.props.menus[i].pageList[j].id != prevProps.menus[i].pageList[j].id) {
                                    const { menus } = this.props
                                    for (var m = 0; m < menus.length; m++) {
                                        for (var n = 0; n < menus[m].pageList.length; n++) {
                                            if (menus[m].pageList[n]['id'] == this.state.selectedKeys) {
                                                return
                                            }
                                        }
                                    }
                                    this.setState({
                                        selectedKeys: menus[0].pageList[0] && menus[0].pageList[0]['id']
                                    });
                                    this.reload(menus[0].pageList[0]['id'], diffMenus, this.state.selectedKeys);
                                    return
                                }
                            }
                        }
                    }
                }

            } else {
                //一级菜单
                if (this.props.menus.length !== prevProps.menus.length) {
                    const { menus } = this.props
                    if (localStorage.getItem('initPageId') && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {
                        this.setState({
                            selectedKeys: String(localStorage.getItem('initPageId'))
                        });
                        this.reload(String(localStorage.getItem('initPageId')), diffMenus, this.state.selectedKeys);
                    } else {
                        this.setState({
                            selectedKeys: menus[0] && menus[0]['id']
                        });
                        this.reload(menus[0]['id'], diffMenus, this.state.selectedKeys);
                    }

                }
            }
        }
        if (forceHomePage == "true") {
            if (this.props.menus && this.props.menus.length !== 0) {
                //跳转至首页
                let homeKey;
                if (this.props.gMenusFlag) { // 二级菜单
                    if (this.props.menus[0].pageList && this.props.menus[0].pageList.length > 0) {
                        homeKey = this.props.menus[0].pageList[0]['id'];
                    }
                } else { // 一级菜单
                    homeKey = this.props.menus[0]['id'];
                }
                if (homeKey) {
                    this.setState({ selectedKeys: homeKey });
                    this.reload(homeKey, diffMenus);
                }
                localStorage.removeItem('forceHomePageAfterRestart'); // 清除标识
                forceHomePage = false
            }
        }
    }

    componentWillUnmount() {
        clearInterval(timer)
        clearInterval(tokenTimer)
    }

    //用户切换菜单的时候保存并修改选中的key
    handleSelectMenuItem(item) {
        const { bShowTimeShaft, updateTimeshaftState } = this.props
        this.props.hideLayer()

        //更新超时退回时间

        if (bShowTimeShaft && typeof updateTimeshaftState.stopPlayer === 'function') {
            updateTimeshaftState.stopPlayer()
        }
        this.updateRecentVisitPage(item.key)
        this.setState({
            selectedKeys: item.key
        })
    }

    //记录最近的页面
    updateRecentVisitPage = (id) => {
        http.post('/updateRecentVisitPage', {
            userName: JSON.parse(window.localStorage.getItem('userData')).name,
            pageId: id
        }).then(res => {
            console.log(res.msg)
        }).catch(err => {
            console.log(err.message)
        })
    }

    getMenuGroup(pageList, selectedKeys) {
        if (pageList.map) {
            let warningPageColor = ""
            return pageList.map(menu => {
                warningPageColor = ""
                if (localStorage.getItem('pagesRedWarning') && localStorage.getItem('pagesRedWarning') == 1) {
                    if (localStorage.getItem('WarningPages')) {
                        let List = localStorage.getItem('WarningPages')
                        List = List.split(",")
                        for (let i = 0; i < List.length; i++) {
                            if (menu.id == List[i]) {
                                warningPageColor = "warningPageColor"
                            }
                        }
                    }
                }
                if (menu['id'] == this.state.selectedKeys) {
                    localStorage.setItem('selectedPageName', menu['name'])
                    localStorage.setItem('selectedPageId', menu['id'])
                }
                return (<MenuItem
                    key={menu['id']}
                    disabled={this.props.loading}
                    style={bestMenuStyle}
                >
                    <Link to={"/observer/" + menu['id']}>
                        <div style={menu.id == selectedKeys ? selectedStyle : defaultStyle}>
                            <span className={warningPageColor}>{menu['name']}</span>
                        </div>
                    </Link>
                </MenuItem>)
            }
            );
        }
    }

    //平铺二级菜单
    getNewMenuList = (menus) => {
        const { selectedKeys, currentGroupIndex, selectGroupIndex } = this.state
        if (!menus || menus.length == 0) return
        let str = ''
        let len = 0
        menus[currentGroupIndex].pageList.forEach(item => {
            str += item.name
        })
        menus.map((item, index) => {
            str += item.groupName
        })
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len += 2
            } else {
                len++
            }
        }

        return (
            <div style={{ display: 'flex' }}>
                <div style={{ display: 'inline-block', verticalAlign: 'top', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: (window.innerWidth - 100) / 2, overflowY: 'hidden', height: 48, marginLeft: 20, borderRight: '1px solid gray' }}>
                    {
                        menus.map((item, index) => {
                            return <span onClick={() => {
                                this.setState({
                                    currentGroupIndex: index
                                })
                            }} style={{ color: index == selectGroupIndex ? '' : index == currentGroupIndex ? '#2ea2f8' : '', cursor: 'pointer', marginRight: 15, padding: 8, backgroundColor: index == selectGroupIndex ? 'rgb(46,162,248)' : '' }}>{item.groupName}</span>
                        })
                    }
                </div>
                <div style={{ display: 'inline-block', overflow: 'hidden', flex: 1 }}>
                    {
                        len > (language == 'en' ? 210 : 170) ?
                            this.getNewChild(menus[currentGroupIndex].pageList, false)
                            :
                            this.getNewChild(menus[currentGroupIndex].pageList, true)
                    }
                </div>
            </div>
        )
    }

    getNewChild = (pageList, flag) => {
        const { selectedKeys, currentGroupIndex } = this.state
        let divKey = ''
        if (key != currentGroupIndex) {
            divKey = Math.random(0, 1)
            key = currentGroupIndex
            oldKey = divKey
        } else {
            divKey = oldKey
        }
        if (flag) {
            return <div key={divKey} className={s['textAnimation']} style={{ cursor: this.props.loading ? 'not-allowed' : 'pointer', display: 'inline-block', whiteSpace: 'nowrap', overflowX: 'auto', overflowY: 'hidden', height: 48, paddingLeft: 10, paddingRight: 10 }}>
                {
                    pageList.map((item, index) => {
                        return <Link to={"/observer/" + item['id']} disabled={this.props.loading}>
                            <span onClick={() => {
                                this.setState({
                                    selectGroupIndex: currentGroupIndex
                                })
                                this.handleSelectMenuItem({ key: item.id })
                            }} style={{ fontSize: menuFontSize + 'px', cursor: this.props.loading ? 'not-allowed' : 'pointer', paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: flag ? 10 : '', marginRight: (pageList.length - 1) == index ? '' : 10, color: item.id == selectedKeys ? '#2ea2f8' : 'ghostwhite', borderBottom: item.id == selectedKeys ? '1px solid #2ea2f8' : '' }}>{item.name}</span>
                        </Link>
                    })
                }
            </div>
        } else {
            return <div key={divKey} id='secondaryChildMenu' className={s['textAnimation']} style={{ cursor: this.props.loading ? 'not-allowed' : 'pointer', display: 'inline-block', height: 48, overflowY: 'auto', verticalAlign: 'top', backgroundColor: 'rgb(40,48,66)', position: 'relative', paddingLeft: 10, paddingRight: 10, lineHeight: '24px', fontSize: '14px' }}>
                {
                    pageList.map((item, index) => {
                        return <Link to={"/observer/" + item['id']} disabled={this.props.loading}>
                            <span onClick={() => {
                                this.setState({
                                    selectGroupIndex: currentGroupIndex
                                })
                                this.handleSelectMenuItem({ key: item.id })
                            }} style={{ fontSize: menuFontSize + 'px', cursor: this.props.loading ? 'not-allowed' : 'pointer', paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: flag ? 10 : '', marginRight: (pageList.length - 1) == index ? '' : 10, color: item.id == selectedKeys ? '#2ea2f8' : 'ghostwhite', borderBottom: item.id == selectedKeys ? '1px solid #2ea2f8' : '' }}>{item.name}</span>
                        </Link>
                    })
                }
                <div style={{ display: 'inline-block' }} title="展开/折叠">
                    <Icon type="column-height" style={{ marginLeft: 10 }} onClick={() => {
                        if (document.getElementById('secondaryChildMenu').style.height == '') {
                            document.getElementById('secondaryChildMenu').style.overflowY = 'auto'
                            document.getElementById('secondaryChildMenu').style.height = '48px'
                        } else {
                            document.getElementById('secondaryChildMenu').style.overflowY = 'none'
                            document.getElementById('secondaryChildMenu').style.height = ''
                        }
                    }} />
                </div>
            </div>
        }
    }

    getMenuList(menus) {
        const { selectedKeys } = this.state
        let menuListNum = 6; //菜单名字最长字符数
        let pageListArr = [];
        //判断pageList存在兼容一级菜单
        if (this.props.menus.pageList) {
            for (let i = 0; i < this.props.menus.length; i++) {
                pageListArr.push(this.props.menus[i].groupName)
                for (let j = 0; j < this.props.menus[i].pageList.length; j++) {
                    pageListArr.push(this.props.menus[i].pageList[j].name)
                }
            }
            for (let i = 0; i < pageListArr.length; i++) {
                if (pageListArr[i].length >= menuListNum) {
                    menuListNum = pageListArr[i].length;
                }
            }
        }

        if (localStorage.getItem('serverOmd') == "best") {
            //菜单栏选中
            selectedStyle = {       //选中样式
                position: 'relative',
                left: '-12px',
                color: "#2ea2f8",
                height: 40,
                boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
                padding: '0 5px',
                background: "linear-gradient(RGB(130,130,130),RGB(230,230,230), RGB(80,80,80))",
                borderRadius: '3px',
            }
            //菜单栏默认
            defaultStyle = {       //默认样式
                position: 'relative',
                left: '-12px',
                height: 40,
                boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
                padding: '0 5px',
                background: "linear-gradient(RGB(196,196,196),RGB(230,230,230), RGB(120,120,120))",
                color: '#333',
                borderRadius: '3px',
            }
        }
        let warningColor = ""
        if (this.props.menus && this.props.gMenusFlag) {
            return this.props.menus.map(group => {
                warningColor = ""
                if (localStorage.getItem('pagesRedWarning') && localStorage.getItem('pagesRedWarning') == 1) {
                    let List = []
                    if (localStorage.getItem('WarningPages')) {
                        List = localStorage.getItem('WarningPages').split(",")
                    } else {
                        List = []
                    }
                    for (let i = 0; i < group.pageList.length; i++) {
                        for (let j = 0; j < List.length; j++) {
                            if (group.pageList[i].id == List[j]) {
                                warningColor = 'warningColor'
                                break;
                            }
                        }
                    }
                }
                if (localStorage.getItem('serverOmd') == "best") {
                    return (
                        <SubMenu title={group.groupName} disabled={this.props.loading} popupClassName="best-menu" className={toggleClass}>
                            {this.getMenuGroup(group.pageList, selectedKeys)}
                        </SubMenu>
                    )
                } else {
                    return (
                        <SubMenu title={<span style={{ fontSize: menuFontSize + 'px' }}>{group.groupName}</span>} disabled={this.props.loading} className={warningColor}>
                            {this.getMenuGroup(group.pageList, selectedKeys)}
                        </SubMenu>
                    )
                }
            });
        } else {
            return menus.map(menu => (
                <MenuItem
                    key={menu['id']}
                    disabled={this.props.loading}
                    className={toggleClass}
                >
                    <Link to={"/observer/" + menu['id']}>
                        <div style={menu.id == selectedKeys ? selectedStyle : defaultStyle} disabled={this.props.loading}>
                            {menu['name']}
                        </div>
                    </Link>
                </MenuItem>
            ));
        }
    }

    goFullPage(pageId) {
        this.setState({
            selectedKeys: parseInt(pageId)
        });
        history.push("/observer/" + pageId);
    }

    gobackHome(menus, gMenusFlag) {
        if (gMenusFlag && menus[0].pageList[0]) {
            let key = menus[0].pageList[0]['id']
            this.setState({
                selectedKeys: key
            })
        } else {
            if (menus[0] != undefined) {
                this.setState({
                    selectedKeys: menus[0]['id']
                })
            }
        }
        this.setState({
            currentGroupIndex: 0,
            selectGroupIndex: 0
        })
    }

    handleClickTopMenu = (key) => {
        this.setState({
            selectedKeys: key
        })
    }

    handleClickdbClearMenu() {
        let that = this;
        //清理所有页面的redis缓存（2023-7-27新接口）
        http.get('/page/removeAllPageBuffer')
            .then(
                data => {
                    if (!data.err) {
                        message.success(language == 'en' ? "The Redis cache for all pages has been cleared successfully." : "清理所有页面的redis缓存成功", 3)
                    } else {
                        message.error(language == 'en' ? "Clearing the Redis cache for all pages failed - Background return message" : "清理所有页面的redis缓存失败-后台返回信息" + data.msg, 3)
                    }
                }
            ).catch(
                error => {
                    message.error(language == 'en' ? "Clearing the Redis cache for all pages failed - Background return message" : "清理所有页面的redis缓存失败-需检查dompysite版本", 3)
                }
            )


        //删除数据库
        let myDatabase = "myDatabase"
        let currentDB = window.indexedDB.open(myDatabase)
        currentDB.onerror = function (event) {
            Modal.error({
                title: language == 'en' ? 'Cache clearing failed.' : '清理缓存失败',
                content: (language == 'en' ? "Detailed error information: " : "报错详细信息：") + event.currentTarget.error.message,
            })
        }
        currentDB.onsuccess = function (event) {
            console.log("数据库打开成功");
            let idb = currentDB.result;
            // idb.close();
            window.indexedDB.deleteDatabase("myDatabase");

            //创建IndexedDB数据库
            const newiDB = new Dexie('myDatabase') //数据库名称：myDatabase

            newiDB.version(2).stores({
                systemEquipmentPageList: '&tempNameId',
                pagesList: '&urlPageId',
                pointLimit: '&pointNameId'
            })
            appConfig.iDB = newiDB;
            window.setTimeout(() => {
                Modal.success({
                    title: language == 'en' ? 'Cache clearing succeeded' : '清理缓存成功',
                    content: language == 'en' ? 'Please wait patiently for the current page to refresh automatically.' : "请耐心等待当前页面自动刷新"
                });
                that.reload(that.state.selectedKeys);
            }, 1 * 1000);
        };
    }

    //重新刷新页面
    reload(pageId, diffMenus, selectKey) {
        localStorage.removeItem('splitPageId')
        let key = pageId;
        let showFlag = false;
        if (key == "AlarmSystem" || key == "RepairManage" || key == "CalendarMenu" || key == "cxMenu" || key == "historyMenu" || key == "AIRuleMenu" || key == "assetMenu") {
            return
        }
        //强制刷新-重新获取项目所有点的释义信息
        if (this.props.parmsDict.showLoading) {
            this.props.parmsDict.showLoading(); //svg页面loading
        } else {
            showFlag = true;
            history.push("/observer/" + pageId);
        }
        http.get(`/analysis/get_pointList_from_s3db/1/50000${language == 'en' ? '?lan=en' : ''}`)
            .then(
                data => {
                    if (data.status === 'OK') {
                        var pointList = [].concat(data['data']['pointList']);
                        localStorage.setItem('allPointList', JSON.stringify(pointList));
                        appConfig.allPointList = pointList
                    }
                    //如果是二级菜单的话，需要重构id结构
                    for (pageId in this.props.menus) {
                        if (diffMenus) {
                            if (selectKey == "AlarmSystem") {
                                history.push("/observer/" + key);
                            } else {
                                if (localStorage.getItem("FaultPage") && localStorage.getItem("FaultPage") == 1) {
                                    console.log('切换用户时,不自动登出到首页')
                                } else {
                                    if (key == 'cxMenu') {

                                    } else {
                                        if (localStorage.getItem("ModalOnOff") && localStorage.getItem("ModalOnOff") == 1) {
                                            store.dispatch(autoOutHideModal())
                                            history.push("/observer/" + key);
                                        } else {
                                            if (showFlag == false) {
                                                history.push("/observer/" + key);
                                            }
                                        }
                                    }
                                }
                            }
                            if (this.props.parmsDict.hideLoading) {
                                this.props.parmsDict.hideLoading(); //隐藏svg页面loading
                            }
                        } else {
                            http.get(`/updatePageContentIntoRedis/${key}${language == 'en' ? '?lan=en' : ''}`)
                                .then(
                                    dataPage => {
                                        if (dataPage.err) {
                                            console.error(dataPage.msg);
                                        } else {
                                            if (this.props.parmsDict.renderScreen) {
                                                this.props.parmsDict.renderScreen(key, undefined, true);
                                            }

                                        }
                                    }
                                ).catch(
                                    error => {
                                        console.error('更新页面失败!');
                                        if (this.props.parmsDict.renderScreen) {
                                            this.props.parmsDict.renderScreen(key);
                                        }
                                    }
                                )
                        }
                        return;
                    }

                    if (key != 'undefined') {
                        if (this.props.parmsDict.renderScreen != undefined) {
                            http.get(`/updatePageContentIntoRedis/${key}${language == 'en' ? '?lan=en' : ''}`)
                                .then(
                                    dataPage => {
                                        if (dataPage.err) {
                                            console.error(dataPage.msg);
                                        } else {
                                            this.props.parmsDict.renderScreen(key, undefined, true);
                                        }
                                    }
                                ).catch(
                                    error => {
                                        console.error('更新页面失败!');
                                        this.props.parmsDict.renderScreen(key);
                                    }
                                )
                            return;
                        }
                    }
                }
            ).catch(
                error => {
                    console.error('获取点名清单失败!');

                    //如果是二级菜单的话，需要重构id结构
                    for (pageId in this.props.menus) {
                        if (diffMenus) {
                            if (localStorage.getItem("ModalOnOff") && localStorage.getItem("ModalOnOff") == 1) {
                                store.dispatch(autoOutHideModal())
                                history.push("/observer/" + key);
                            } else {
                                history.push("/observer/" + key);
                            }
                        } else {
                            this.props.parmsDict.renderScreen(key);
                        }
                        return;
                    }
                    if (key != 'undefined') {
                        if (this.props.parmsDict.renderScreen != undefined) {
                            this.props.parmsDict.renderScreen(key);
                            return;
                        }
                    }
                }
            );

        http.post('/project/getConfigMul', {
            keyList: [
                "energy_management_define",
                "expert_optimize_config"
            ]
        }).then(data => {
            //标准能管管理配置
            if (data.data && data.data.energy_management_define != undefined) {
                localStorage.setItem('energyManagementDefine', JSON.stringify(data.data.energy_management_define));
            } else {
                localStorage.setItem('energyManagementDefine', null);
            }
            //获取专家优化调试学习表配置
            if (data.data && data.data.expert_optimize_config != undefined) {
                localStorage.setItem('expertOptimizeConfig', JSON.stringify(data.data.expert_optimize_config));
            } else {
                localStorage.setItem('expertOptimizeConfig', null);
            }
        })
    }

    getHomeId(menus, gMenusFlag) {
        if (menus[0] && gMenusFlag) {
            return "/observer/" + menus[0].pageList[0]['id']
        } else {
            if (menus[0]) {
                return "/observer/" + menus[0]['id']
            } else return ''
        }
    }


    render() {
        const { menus, parmsDict, gMenusFlag, newMenusFlag } = this.props
        return (
            <div>
                <div className={s['content-header-btns']}>
                    {
                        localStorage.getItem('cleanMode') != 1 ?
                            <img style={{ height: "48px", float: "left", display: `${window.localStorage.getItem('logoURL') != null && window.localStorage.getItem('logoURL') != "" && window.localStorage.getItem('logoURL') != "undefined" ? "block" : "none"}` }} src={window.localStorage.getItem('logoURL') !== null && window.localStorage.getItem('logoURL') !== "" ? `http:\/\/${localStorage.getItem('serverUrl')}${localStorage.getItem('logoURL')}` : ""} />
                            :
                            ''
                    }
                    <Link to={this.getHomeId(menus, gMenusFlag)} >
                        <Button
                            style={LTbtnStyle}
                            icon="home"
                            onClick={() => { this.gobackHome(menus, gMenusFlag) }}
                        />
                    </Link>
                    <Button disabled={this.props.loading} id='reloadBtn' style={LTbtnStyle}
                        icon="reload"
                        onClick={() => {

                            parmsDict.closeObserver && parmsDict.closeObserver();

                            this.props.initialize(false);
                            this.props.updateFullPage({
                                goFullPage: this.goFullPage
                            });
                            this.reload(this.state.selectedKeys);
                        }} />
                </div>
                {
                    newMenusFlag ?
                        <div>
                            {this.getNewMenuList(menus)}
                        </div>
                        :
                        <Menu
                            className={s[`${toggleTitleClass}`]}
                            theme="dark"
                            mode="horizontal"
                            key={this.state.selectedKeys}
                            onSelect={(item) => { this.handleSelectMenuItem(item) }}
                            style={{ zIndex: '999', marginTop: gMenusFlag == false ? '-15px' : '' }}
                            selectedKeys={[String(this.state.selectedKeys && this.state.selectedKeys.toString())]}
                        >
                            {this.getMenuList(menus, gMenusFlag)}
                        </Menu>
                }
            </div>
        )
    }
}

//主界面设备开关统一模态框
class UnifyModal extends React.PureComponent {

    btnControl() {
        const {
            operateSwitch,
            switchHide,
            operateData,
        } = this.props

        if (operateData.description.trim() == '') {
            operateData.description = '将点位 ' + operateData.idCom + ' 的值修改为 ' + operateData.setValue
        }

        if (operateData.preCheckScript == undefined || operateData.preCheckScript == '') {
            operateSwitch(
                operateData.idCom,
                operateData.setValue,
                operateData.description,
                operateData.downloadEnableCondition,
                operateData.downloadURL,
                operateData.checkDownLoadEnable,
                operateData.unsetValue,
            )
        } else {
            http.post('/tool/evalStringExpression', {
                "str": operateData.preCheckScript,  // 脚本
                "mode": "1"  //  0:表示计算历史某个时刻, 1表示计算实时
            }).then(
                res => {
                    if (res.err == 0 && res.data == 0) {
                        Modal.confirm({
                            title: operateData.preCheckScriptDescription,
                            content: '点击确认可继续执行指令',
                            onOk() {
                                operateSwitch(
                                    operateData.idCom,
                                    operateData.setValue,
                                    operateData.description,
                                    operateData.downloadEnableCondition,
                                    operateData.downloadURL,
                                    operateData.checkDownLoadEnable,
                                    operateData.unsetValue,
                                )
                            },
                            onCancel() {
                                switchHide()
                            },
                        });
                    } else {
                        operateSwitch(
                            operateData.idCom,
                            operateData.setValue,
                            operateData.description,
                            operateData.downloadEnableCondition,
                            operateData.downloadURL,
                            operateData.checkDownLoadEnable,
                            operateData.unsetValue,
                        )
                    }
                }
            ).catch(
                err => {
                    operateSwitch(
                        operateData.idCom,
                        operateData.setValue,
                        operateData.description,
                        operateData.downloadEnableCondition,
                        operateData.downloadURL,
                        operateData.checkDownLoadEnable,
                        operateData.unsetValue,
                    )
                }
            )
        }
        // Modal.confirm({
        //     title: 'Do you Want to delete these items?',
        //     content: 'Some descriptions',
        //     onOk() {

        //     },
        //     onCancel() {
        //       console.log('Cancel');
        //     },
        // });

    }

    render() {
        const {
            operateModalVisible,
            switchHide,
            operateSwitch,
            conditionDict,
            operateIsLoading,
            operateData,
            checkboxSetting,
            checkboxHide
        } = this.props

        //conditionDict dict
        // operateData dict

        if (Layout_modalTypes.ONE_KEY_OPERATE_MODAL === operateModalVisible) {
            return (
                <Modal
                    title={operateIsLoading ? '指令设置进度提示' : '确认指令'}
                    visible={true}
                    onCancel={switchHide}
                    maskClosable={false}
                    wrapClassName={str}
                    footer={
                        operateIsLoading ?
                            [<Button onClick={() => {
                                if (operateData.description.trim() == '') {
                                    operateData.description = '将点位 ' + operateData.idCom + ' 的值修改为 ' + operateData.setValue
                                }
                                operateSwitch(
                                    operateData.idCom,
                                    operateData.setValue,
                                    operateData.description,
                                    operateData.downloadEnableCondition,
                                    operateData.downloadURL,
                                    operateData.checkDownLoadEnable
                                )
                            }
                            }>确认</Button>]
                            :
                            [
                                <Button onClick={switchHide} >取消</Button>,
                                <Button onClick={() => this.btnControl()}>确认</Button>
                            ]
                    }
                >
                    {
                        operateIsLoading ?
                            <Spin tip={conditionDict.status ? (operateData.description.trim() != '' ? `正在${operateData.description}` : `正在将点位 ${operateData.idCom} 的值设置为 ${operateData.setValue}`) : conditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <div>
                                {
                                    operateData.description.trim() != '' ?
                                        <span>确定要 {operateData.description} 吗?</span>
                                        :
                                        <span>确定要将点位 {operateData.idCom} 的值设置为 {operateData.setValue} 吗?</span>
                                }
                            </div>
                    }
                </Modal>
            )
        } else if (Layout_modalTypes.CHECKBOX_MODAL === operateModalVisible) {
            return (
                <Modal
                    title={operateIsLoading ? '指令设置进度提示' : '确认指令'}
                    visible={true}
                    onCancel={checkboxHide}
                    maskClosable={false}
                    wrapClassName={str}
                    footer={
                        operateIsLoading ?
                            [<Button onClick={() => checkboxSetting(operateData.idCom, operateData.setValue, operateData.text)} >确认</Button>]
                            :
                            [
                                <Button onClick={checkboxHide} >取消</Button>,
                                <Button onClick={() => checkboxSetting(operateData.idCom, operateData.setValue, operateData.text, operateData.unsetValue, operateData.desc)} >确认</Button>
                            ]
                    }
                >
                    {
                        operateIsLoading ?
                            <Spin tip={conditionDict.status ? `正在 ${operateData.checkboxState == true ? '取消勾选' : '勾选'} ${operateData.desc} ` : conditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <div>
                                {`是否确定${operateData.checkboxState == true ? '取消勾选' : '勾选'}  ${operateData.desc} ?`}
                            </div>
                    }
                </Modal>
            )
        }
        else {
            return null
        }
    }
}


class ChangePwdModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            confirmDirty: false
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                })
                http.post("/fdd/editUserPassword", {
                    userName: values.username,
                    password: values.newPassword
                }).then(
                    res => {
                        this.props.handleHide()
                        this.setState({
                            loading: false
                        })
                        if (res.err == 0) {
                            message.success(language == 'en' ? 'User password changed successfully!' : '修改用户密码成功！')
                        } else {
                            message.error(language == 'en' ? 'Failed to change user password!' : '修改用户密码失败！')
                        }
                    }
                ).catch(
                    err => {
                        this.props.handleHide()
                        this.setState({
                            loading: false
                        })
                        message.error(language == 'en' ? 'Failed to request change user password interface!' : '修改用户密码接口请求失败！')
                    }
                )
            }
        });
    }

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('newPassword')) {
            callback(language == 'en' ? 'The two passwords entered are inconsistent!' : '两次输入的密码不一致！');
        } else {
            callback();
        }
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                span: 6
            },
            wrapperCol: {
                span: 14
            },
        };
        return (
            <Modal
                // wrapClassName={toggleModalClass}
                title={language == 'en' ? 'Change User Password' : '修改用户密码'}
                width={400}
                visible={true}
                onCancel={this.props.handleHide}
                onOk={this.handleSubmit}
                confirmLoading={this.state.loading}
                maskClosable={false}
                okText={language == 'en' ? 'Confirm' : '确认'}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Account' : '账号'}
                        hasFeedback
                    >
                        {getFieldDecorator('username', {
                            initialValue: this.props.data
                        })(
                            <Input disabled />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'New Password' : '新密码'}
                        hasFeedback
                    >
                        {getFieldDecorator('newPassword', {
                            initialValue: '',
                            rules: [{
                                required: true, message: language == 'en' ? 'Please enter new password!' : '请填写新密码!',
                            }],
                        })(
                            <Input type="password"
                            />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Confirm Password' : '再次输入'}
                        hasFeedback
                    >
                        {getFieldDecorator('newPasswordRepeat', {
                            initialValue: '',
                            rules: [{
                                required: true, message: language == 'en' ? 'Please enter new password again!' : '请再次填写新密码!',
                            },
                            {
                                validator: this.compareToFirstPassword,
                            }],
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const WrappedChangePwdModal = Form.create()(ChangePwdModal);



//改变LayoutView组件为有状态组件
class LayoutView extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            num: 0,
            offLineNum: 0,
            tempMax: "",
            tempMin: "",
            temp: "",
            weatherDesc: "",
            weatherCode: "",
            hum: "",
            windDir: "",
            windSc: "",
            d: "",
            wetTemp: "",
            h: "",
            location: "",
            pointNameMap: {},
            showWeatherModal: false,
            weekWeather: [],
            weatherList: [],
            maxBtnIcon: "block",
            maxBtnTitle: "向下还原",
            visible: false,
            omCloudVersion: "",
            newVersionFlag: false,
            elecPriceVisible: false,
            energyPriceVisible: false,
            isLowPower: false,
            changePwdModalVisible: false,
            userName: "",
            AIRuleVisible: false,
            scriptRuleVisible: false,
            WorkerOrderVisible: false,
            systemSettingsVisible: false
        }
        this.refreshNum = this.refreshNum.bind(this);
        this.refreshOffLineNum = this.refreshOffLineNum.bind(this);
        this.refreshFaultNum = this.refreshFaultNum.bind(this);
        this.getHealthBulb = this.getHealthBulb.bind(this);
        this.getWeather = this.getWeather.bind(this);
        this.handleSchedule = this.handleSchedule.bind(this);
        this.handleScene = this.handleScene.bind(this);
        this.handleModelManage = this.handleModelManage.bind(this);
        this.refreshWeather = this.refreshWeather.bind(this);
        this.getWeatherData = this.getWeatherData.bind(this);
        this._renderWeatherModal = this._renderWeatherModal.bind(this);
        this.showWeatherInfoModal = this.showWeatherInfoModal.bind(this);
        this.hideWeatherModal = this.hideWeatherModal.bind(this);
        this.getWeatherWeekData = this.getWeatherWeekData.bind(this);
        this.handleSceneControl = this.handleSceneControl.bind(this);
        this.handleDevice = this.handleDevice.bind(this);
        this.WeatherHistoryShowModal = this.WeatherHistoryShowModal.bind(this);
        this.handleSelectSplit = this.handleSelectSplit.bind(this);
        this.handleMax = this.handleMax.bind(this);
        this.callBackMainWindow = this.callBackMainWindow.bind(this);
        this.getOmsiteVersion = this.getOmsiteVersion.bind(this);
        this.updateOM = this.updateOM.bind(this);
        this.handleHotstart = this.handleHotstart.bind(this);
        this.handleCustomService = this.handleCustomService.bind(this);
        this.weatherAbortController = null
        this.handleSettings = this.handleSettings.bind(this)
        this.closeSettingModal = this.closeSettingModal.bind(this)
    }


    //返回OMCloud窗口
    callBackMainWindow() {
        const { shell } = require('electron');
        // Open a local file in the default app
        shell.openPath('run.vbs');
        var start1 = require('child_process').exec("taskkill /im OM.exe /f")
    }

    componentDidMount() {
        const isWeakPassword = JSON.parse(localStorage.getItem('isWeakPassword'))
        if (isWeakPassword && isWeakPassword.isWeakPassword == true) {
            Modal.confirm({
                title: language == 'en' ? 'Notice' : '提示',
                content: language == 'en' ? 'Current password strength is weak, please change password!' : '当前密码强度较弱，请修改密码！',
                okText: language == 'en' ? 'Change Password' : '修改密码',
                cancelText: language == 'en' ? 'Not Now' : '暂不处理',
                onOk: () => {
                    this.setState({
                        changePwdModalVisible: true,
                        userName: isWeakPassword.name
                    })
                },
                onCancel: () => {
                }
            })
            localStorage.removeItem('isWeakPassword')
        }
        eventBus.on('close-playback', this.closePlayback)

        if (window.localStorage.getItem('leftday') === null) {
            this.props.onTrial()
        }
        //刚登录时，触发检查最新OM版本号，每12个小时检查一次
        this.getOmsiteVersion();
        omSiteVersionTimer = setInterval(this.getOmsiteVersion, 12 * 3600 * 1000);

        //第一次获取天气信息
        this.getWeatherData();
        this.refreshWeather();
        this.getWeatherWeekData()
        //获取底部模式内容
        this.props.getModeButtonsList();
        modeButtonsTimer = setInterval(this.props.getModeButtonsList, 20 * 1000);
    }

    componentWillUnmount() {
        clearInterval(modeButtonsTimer);
        clearInterval(weatherTimer);
        clearInterval(omSiteVersionTimer);

        eventBus.off('close-playback', this.closePlayback)
    }

    getOmsiteVersion() {
        http.get('/processVersion').then(
            res => {
                if (res.err == 0) {
                    res.data.process.forEach((item, i) => {
                        if (item.name == "omsite") {
                            localStorage.setItem('omCloudVersion', item.cloudVersion);
                            this.setState({
                                omCloudVersion: item.cloudVersion
                            })
                            let curVersion = appConfig.project.version.split('.');
                            let cloudVersion = item.cloudVersion.split('.');
                            // let cloudVersion = "2.5.54".split('.');
                            for (var i = 0; i < curVersion.length; ++i) {
                                if (Number(curVersion[i]) == Number(cloudVersion[i])) {
                                    continue;
                                } else if (Number(curVersion[i]) < Number(cloudVersion[i])) {
                                    this.setState({
                                        newVersionFlag: true
                                    })
                                    break;
                                } else {
                                    this.setState({
                                        newVersionFlag: false
                                    })
                                    break;
                                }
                            }
                        }
                    })
                } else {
                    localStorage.setItem('omCloudVersion', "");
                    this.setState({
                        omCloudVersion: "",
                        newVersionFlag: false
                    })
                }
            }
        ).catch(
            err => {
                localStorage.setItem('omCloudVersion', "");
                this.setState({
                    omCloudVersion: "",
                    newVersionFlag: false
                })
            }
        )
    }

    handleHotstart() {
        let startOM = null;
        startOM = require('child_process').exec("OM.exe -u admin -p 111 -h 10.0.0.127:5000");
        setTimeout(function () {
            closeAppWindow()
        }, 5000)
        // startOM = require('child_process').exec("OM.exe -u " + omUserName + " -p " + omPwd + " -cu " + userName + " -cp " + userPwd + " -h " + projectCoreAddress);
    }

    updateOM() {
        let serverUrl = localStorage.getItem('serverUrl')
        let port = serverUrl.slice(-4)
        let host = serverUrl.substring(0, serverUrl.indexOf(":"))

        const spawn = require('child_process').spawn
        let process = require('process')

        // 任何你期望执行的cmd命令，ls都可以
        let cmdStr = `${process.argv[0].replace('OM.exe', '')}domUpdateOM.exe -host ${host} -port ${port} -cwd ${process.argv[0]} -name omsite`
        // 子进程名称
        let workerProcess

        function runExec() {
            workerProcess = spawn(
                cmdStr, [],
                {
                    shell: true,
                    detached: true
                })
            workerProcess.stdout.on('data', d => console.log(d.toString('utf8')))

            process.stdin.on('data', d => workerProcess.stdin.write(d))

        }

        Modal.confirm({
            title: language == 'en' ? 'Notice' : '提示',
            content: language == 'en' ? "Are you sure to start the auto-update process? Please note: The update process takes some time." : "是否确定启动自动更新进程？请注意：更新进程需要一定耗时。",
            onOk() {
                runExec()
            },
            onCancel() {
            }
        })
    }


    //刷新num
    refreshNum(num) {
        this.setState({
            num: num
        })
    }


    refreshOffLineNum(offLineNum) {
        this.setState({
            offLineNum: offLineNum
        })
    }

    refreshFaultNum(num, faultInfo) {
        this.props.updateFaultNum(num, faultInfo)
    }

    //右击文本事件
    onContextMenu = (name, value, e) => {
        e.preventDefault()
        // 设置属性是否在弹窗里面
        let isInfo = {
            "isInModal": false
        }
        //重新定义函数，继承原函数所有的属性和函数        
        let model = new ModelText()
        model.options = {
            getTendencyModal: this.props.getTendencyModal,
            showCommonAlarm: this.props.showCommonAlarm,
            showMainInterfaceModal: this.props.showMainInterfaceModal,
            getToolPoint: this.props.getToolPoint
        }

        let clientWidth = document.documentElement.clientWidth,
            clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
        let widthScale = 0, heightScale = 0;
        widthScale = clientWidth / 1920
        heightScale = clientHeight / 955
        e.offsetX = e.clientX - 5,
            e.offsetY = e.clientY - 80

        model.idCom = name
        model.value = value
        model.showModal(e, isInfo, widthScale, heightScale)
    }

    // 获取天气信息（仅优化Modal.info相关逻辑，去掉可选链）
    getWeatherData(flag) {
        this.weatherAbortController = new AbortController()
        const signal = this.weatherAbortController.signal;

        http.get(language == 'en' ? '/weather/getTodayWeatherInfo?lan=en' : '/weather/getTodayWeatherInfo', undefined, { signal: signal })
            .then(res => {
                this.weatherAbortController = null
                if (res.err == 0) {
                    this.setState({
                        tempMax: res.data.tempMax,
                        tempMin: res.data.tempMin,
                        weatherCode: res.data.code,
                        weatherDesc: res.data.desc,
                        hum: res.data.hum,
                        temp: res.data.temp,
                        windSc: res.data.windSc,
                        windDir: res.data.windDir,
                        d: res.data.d,
                        wetTemp: res.data.wetTemp,
                        h: res.data.h,
                        location: res.data.location,
                        pointNameMap: res.data.pointNameMap ? res.data.pointNameMap : {}
                    })
                    if (flag) this._renderWeatherModal(res.data);
                } else {
                    if (flag) this._renderWeatherModal(this.state);
                }
            })
            .catch(err => {
                if (err.message != 'The user aborted a request.' && flag) {
                    this._renderWeatherModal(this.state);
                }
            });
    }

    /**
     * 统一渲染天气模态框（去掉可选链，用传统判断兼容空值）
     * @param {Object} renderData - 渲染数据源（成功时为res.data，失败时为this.state）
     */
    _renderWeatherModal(renderData) {
        // 1. 提取重复使用的变量，用传统判断处理空值
        // 使用JSON序列化与反序列化实现深拷贝
        const pointNameMap = renderData.pointNameMap ? JSON.parse(JSON.stringify(renderData.pointNameMap)) : {};
        const code = renderData.code ? renderData.code : '';
        const location = renderData.location ? renderData.location : '';
        const temp = renderData.temp ? renderData.temp : '--';
        const wetTemp = renderData.wetTemp ? renderData.wetTemp : '--';
        const d = renderData.d ? renderData.d : '--';
        const h = renderData.h ? renderData.h : '--';
        const desc = renderData.desc ? renderData.desc : '';
        const tempMax = renderData.tempMax ? renderData.tempMax : '--';
        const tempMin = renderData.tempMin ? renderData.tempMin : '--';
        const hum = renderData.hum ? renderData.hum : '--';
        const windDir = renderData.windDir ? renderData.windDir : null;
        const windSc = renderData.windSc ? renderData.windSc : '--';
        let updateTime = this.state.weekWeather[0].forcast.update.loc


        // 3. 统一右键菜单事件
        const handleContextMenu = (labelKey, value) => (e) => {
            const label = pointNameMap[labelKey] ? pointNameMap[labelKey] : '未发现点名';
            this.onContextMenu(label, value, e);
        };



        // 4. 模态框统一配置
        Modal.info({
            title: language == 'en' ? location : '天气预报',
            width: 480,
            content: (
                <div style={{ marginTop: 30, marginLeft: -22 }}>
                    {/* 头部温度/焓值等信息 */}
                    {
                        language == 'en' ?
                            <div style={{ position: 'relative', height: '84px', marginTop: 60 }}>
                                <div style={{ position: 'absolute', marginTop: 8 }}>
                                    <span style={{ fontSize: '20px', position: 'absolute', marginTop: '36px', marginLeft: '66px' }}>
                                        {desc}
                                    </span>
                                    <img
                                        src={`${appConfig.serverUrl}/static/images/cond-icon-heweather/${code}.png`}
                                        alt=""
                                        style={{ marginTop: '-5px', marginLeft: '-15px', height: '80px' }}
                                    />
                                    <div
                                        style={{ marginLeft: '65px', marginTop: '-70px', fontSize: '20px' }}
                                    >
                                        {tempMin}-{tempMax}°C
                                    </div>
                                </div>

                                <div
                                    style={{ marginLeft: '160px', marginTop: '-50px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('temp', temp)}
                                >
                                    Current Temp  {temp} °C
                                </div>
                                <div
                                    style={{ marginLeft: '160px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('wetTemp', wetTemp)}
                                >
                                    Wet-bulb Temp {wetTemp} °C
                                </div>
                                <div
                                    style={{ marginLeft: '160px', width: '110px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('d', d)}
                                >
                                    d  {d} g/kg
                                </div>
                                <div
                                    style={{ marginLeft: '160px', width: '110px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('h', h)}
                                >
                                    H  {h} kJ/kg
                                </div>
                                <div
                                    style={{ marginLeft: '290px', marginTop: '-40px', width: '110px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('hum', hum)}
                                >
                                    RH{hum} %
                                </div>
                                <div
                                    style={{ marginLeft: '290px', width: '110px', cursor: 'pointer' }}
                                >{windDir} </div>
                                <div
                                    style={{ marginLeft: '290px', width: '110px', cursor: 'pointer' }}
                                >{windSc}Level</div>
                            </div>
                            :
                            <p style={{ position: 'absolute', fontSize: '14px' }}>
                                <span style={{ fontSize: '36px', position: 'absolute', marginTop: '-16px', marginLeft: '-5px' }}>
                                    {location}
                                </span>
                                <span
                                    style={{ position: 'absolute', marginLeft: '160px', top: '-44px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('temp', temp)}
                                >
                                    当前温度{temp} °C
                                </span>
                                <span
                                    style={{ position: 'absolute', marginLeft: '160px', top: '-20px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('wetTemp', wetTemp)}
                                >
                                    湿球温度 {wetTemp} °C
                                </span>
                                <span
                                    style={{ position: 'absolute', marginLeft: '290px', top: '-20px', width: '110px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('d', d)}
                                >
                                    含湿量{d} g/kg
                                </span>
                                <span
                                    style={{ position: 'absolute', marginLeft: '290px', top: '-44px', width: '110px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('h', h)}
                                >
                                    焓值{h} kJ/kg
                                </span>
                                <span style={{ position: 'relative', fontSize: '11px', marginLeft: '360px', top: '1px' }}>
                                    (高/低)
                                </span>
                            </p>
                    }

                    {/* 今日天气详情 */}
                    {
                        language == 'en' ?
                            <div>

                            </div>
                            :
                            <p style={{ marginTop: '20px', marginBottom: '5px', marginLeft: '80px', fontSize: '14px' }}>
                                <span style={{ marginRight: '18px', marginTop: '3px', marginLeft: '80px', width: '75px', display: 'inline-block' }}>
                                    {language == 'en' ? 'Today' : '今日 '}{desc}
                                </span>
                                <img
                                    src={`${appConfig.serverUrl}/static/images/cond-icon-heweather/${code}.png`}
                                    alt=""
                                    style={{ marginRight: '12px', height: '25px', position: 'relative' }}
                                />
                                <span style={{ marginTop: '2px' }}>
                                    {tempMax}°C/{tempMin}°C
                                </span>
                                <br />
                                <span
                                    style={{ marginRight: '45px', marginLeft: '80px', cursor: 'pointer' }}
                                    onContextMenu={handleContextMenu('hum', hum)}
                                >
                                    {language == 'en' ? 'RH' : '相对湿度'} {hum} %
                                </span>
                                <span style={{ marginRight: '28px' }}>{windDir} </span>
                                <span>{windSc}{language == 'en' ? 'Level' : '级'} </span>
                            </p>
                    }


                    {/* 分隔线与未来预报 */}
                    <hr style={{ marginBottom: '15px', width: '380px', marginLeft: '-7px' }} />
                    <p>
                        <span style={{ fontSize: '16px' }}> {language == 'en' ? '7-Day Weather Forecast' : '未来一周天气预报'}</span>
                        <Button style={{ marginLeft: '140px' }} onClick={this.WeatherHistoryShowModal} size='small'>
                            {language == 'en' ? 'History' : '历史天气'}
                        </Button>
                    </p>
                    <ul style={{ marginTop: '5px', marginBottom: '10px', marginLeft: '-42px', listStyleType: 'none' }}>
                        {this.state.weatherList}
                    </ul>

                    <span style={{ fontSize: '11px', position: 'absolute', bottom: '37px' }}>
                        {language == 'en' ? 'Update Time:' : '数据更新时间：'}{updateTime}
                    </span>
                </div>
            ),
            onOk: () => { this.hideWeatherModal() },
        });
    }
    //分屏按钮
    handleSelectSplit(value) {
        if (value === "100") {
            //返回主窗口OMCloud
            this.callBackMainWindow()
        } else {
            splitAppWindow({ numId: value, pageId: this.child.state.selectedKeys })
            localStorage.setItem('splitPageId', this.child.state.selectedKeys);
            if (value == 0) {
                localStorage.setItem('maxBtn', 0);
            } else {
                //1展示最大化按钮样式
                localStorage.setItem('maxBtn', 1);
            }
        }
    }
    //最大化按钮
    handleMax() {
        maximizeAppWindow();
        localStorage.setItem('splitPageId', this.child.state.selectedKeys);
        // if (localStorage.getItem('maxBtn') == 1) {
        //     localStorage.setItem('maxBtn', 0);
        // } else {
        //     localStorage.setItem('maxBtn', 1);
        // }
    }



    //半小时刷新天气
    refreshWeather() {
        weatherTimer = setInterval(this.getWeatherData, 30 * 60 * 1000);

    }

    getWarningData() {
        let startTime = moment().subtract(5, "minute").format("YYYY-MM-DD HH:mm:ss");
        let endTime = moment().format("YYYY-MM-DD HH:mm:ss");
        this.props.searchPoint("", startTime, endTime);
        this.props.showModal(2019, {});

    }

    handleSchedule() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            this.props.ModifySchedule(-1, [])
            this.props.AddIdSchedule([])
            this.props.showModal(modalTypes.SCHEDULE_MODAL)
        } else {
            Modal.info({
                title: language == 'en' ? 'Notice' : '提示',
                content: language == 'en' ? 'Insufficient user permissions' : '用户权限不足'
            })
        }
    }

    //点击系统设置按钮
    handleSettings() {
        //打开弹窗
        this.setState({
            systemSettingsVisible: true
        })
    }
    closeSettingModal() {
        //关闭弹窗
        this.setState({
            systemSettingsVisible: false
        })
    }

    handleCustomService() {
        this.props.showModal(modalTypes.CUSTOM_SERVICE_MODAL)
    }


    handleAIService() {
        this.props.showModal(modalTypes.CUSTOM_CHAT_MODAL)
    }

    handleAIChatModalVisible(visible) {
        visible ? this.props.showModal(modalTypes.AI_CHAT_MODAL) : this.props.hideModal()
    }

    handleScene() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            //this.props.ModifySchedule(-1,[])
            //this.props.AddIdSchedule([])
            this.props.showModal(modalTypes.SCENE_MODAL)
        } else {
            Modal.info({
                title: language == 'en' ? 'Notice' : '提示',
                content: language == 'en' ? 'Insufficient user permissions' : '用户权限不足'
            })
        }
    }

    handleDevice() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            //this.props.ModifySchedule(-1,[])
            //this.props.AddIdSchedule([])
            this.props.showModal(modalTypes.DEVICE_MODAL)
        } else {
            Modal.info({
                title: language == 'en' ? 'Notice' : '提示',
                content: language == 'en' ? 'Insufficient user permissions' : '用户权限不足'
            })
        }
    }

    handleModelManage() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            this.props.showModal(modalTypes.MODEL_MANAGE_MODAL)
        } else {
            Modal.info({
                title: language == 'en' ? 'Notice' : '提示',
                content: language == 'en' ? 'Insufficient user permissions' : '用户权限不足'
            })
        }
    }

    handleSceneControl() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            this.setState({
                isLowPower: false
            })
        } else {
            this.setState({
                isLowPower: true
            })
        }
        this.props.showModal(modalTypes.SCENE_CONTROL_MODAL)
    }

    getHealthBulb() {
        let healthData = this.props.healthData
        let healthDataStatus = this.props.healthDataStatus
        if (!healthDataStatus) {
            return null
        } else {
            return healthData.map(item => {
                if (item.err == 1) {
                    return (
                        <Popover content={item.name + item.msg} >
                            <i className={cx(s['round_red'])} style={{ width: '8px', height: '8px' }} />
                        </Popover>
                    )
                } else if (item.err == -1) {
                    return (
                        <Popover content={item.name + '运行状态未知'} >
                            <i className={cx(s['round'])} style={{ width: '8px', height: '8px' }} />
                        </Popover>
                    )
                } else {
                    return (
                        <Popover content={item.name + item.msg} >
                            <i className={cx(s['round'])} style={{ width: '8px', height: '8px' }} />
                        </Popover>
                    )
                }
            })
        }
    }

    WeatherHistoryShowModal() {
        this.props.showModal(modalTypes.WEATHERHISTORY_MODAL)
    }

    hideWeatherModal() {
        this.setState({
            showWeatherModal: false
        })
    }

    // 请求7天的天气数据
    getWeatherWeekData() {
        let today = moment().format("YYYY-MM-DD")
        http.get(`/weather/getForcastWeatherInfoV2/${today}/7`)
            .then(
                res => {
                    if (res.err == 0) {
                        let weatherList = []
                        if (res.data.length != 0) {
                            res.data.forEach((item, i) => {
                                if (item.forcast === null) {
                                    return
                                }
                                let arr = [];
                                for (let i = 0; i < item.forcast.date.length; i++) {
                                    if (item.forcast.date[i] == '月') {
                                        arr[0] = item.forcast.date.slice(0, i);
                                        arr[1] = item.forcast.date.slice(i + 1, -1);
                                    }
                                }
                                if (arr[0] < 10 && arr[1] < 10) {
                                    item.forcast.date = '\xa0' + arr[0] + '\xa0' + '.' + '\xa0' + arr[1] + '\xa0'
                                } else if (arr[0] < 10 && arr[1] >= 10) {
                                    item.forcast.date = '\xa0' + arr[0] + '\xa0' + '.' + arr[1]
                                } else if (arr[0] >= 10 && arr[1] < 10) {
                                    item.forcast.date = arr[0] + '.' + '\xa0' + arr[1] + '\xa0'
                                } else {
                                    item.forcast.date = arr[0] + '.' + arr[1]
                                }
                                let weekday = ''

                                if (language == 'en') {
                                    weekday = moment(item.date).format('ddd');
                                } else {
                                    weekday = moment(item.date).format('dddd')
                                }

                                if (i > 0) {
                                    weatherList.push(
                                        <li style={{ marginBottom: 5 }}>
                                            <span style={{ marginRight: '40px' }}>{item.forcast.date}</span>
                                            <span>{weekday}</span>
                                            <span style={{ float: 'right', marginRight: '10px' }}>{item.forcast.hum} %</span>
                                            <span style={{ float: 'right', marginRight: '40px', display: 'inline-block', width: 80 }}>{item.forcast.tmp_max}°C / {item.forcast.tmp_min}°C </span>
                                            <img style={{ float: 'right', marginRight: '50px', height: '25px' }} src={appConfig.serverUrl + `/static/images/cond-icon-heweather` + `/${item.forcast.cond_code_d}.png`} alt="" />
                                        </li>
                                    )
                                }
                            })
                            this.setState({
                                weatherList: weatherList
                            })
                        }
                        this.setState({
                            weekWeather: res.data,
                        })
                    }
                })
            .catch(err => {

            });
    }

    showWeatherInfoModal() {
        if (this.weatherAbortController) {
            this.weatherAbortController.abort()
            this.weatherAbortController = null
        }
        this.getWeatherData(true)
    }


    //天气样式
    getWeather() {
        //let url = WeatherImgs+"/"+this.state.weatherCode+".png"
        let sr = '../../../'
        //let url = require(sr+"themes/dark/images/cond-icon-heweather/"+this.state.weatherCode+".png")
        let url = appConfig.serverUrl + `/static/images/cond-icon-heweather` + `/${this.state.weatherCode}.png`
        return (
            <div style={weatherStyle}>
                <div style={{ display: 'inline-block', position: 'relative', top: '4px', width: "50px", cursor: "pointer" }} onClick={this.showWeatherInfoModal}>
                    <span style={{ display: 'inline-block', position: 'absolute', top: '-27px', height: "20px", lineHeight: "20px", width: "40px", textAlign: "center" }}>
                        {
                            this.state.weatherCode && this.state.weatherCode != undefined && this.state.weatherCode != '' ?
                                <img src={url} alt="" style={{ width: '26px', height: '26px' }} />
                                :
                                ''
                        }
                    </span>
                    {
                        this.state.weatherDesc.length > 2 ?
                            <span style={{ display: 'inline-block', fontSize: '10px', position: 'absolute', top: '-9px', left: '-3px', height: "12px", lineHeight: "23px", width: "45px", textAlign: "center" }}>
                                {this.state.weatherDesc}
                            </span>
                            :
                            <span style={{ display: 'inline-block', position: 'absolute', top: '-9px', height: "12px", lineHeight: "23px", width: "40px", textAlign: "center" }}>
                                {this.state.weatherDesc}
                            </span>
                    }
                </div>
                <div style={{ display: 'inline-block', position: 'relative', top: '4px', width: "75px", cursor: "pointer" }} onClick={this.showWeatherInfoModal}>
                    <p style={{ display: 'inline-block', position: 'absolute', top: '-27px', height: "20px", lineHeight: "20px", width: "70px", fontSize: "10px" }}>
                        {language == 'en' ? 'high' : '最高'}
                        <span style={{ display: 'inline-block', height: "20px", lineHeight: "20px", width: "25px", textAlign: "center", fontSize: "14px" }}>
                            {this.state.tempMax}
                        </span>
                        <span style={{ display: 'inline-block', position: 'absolute', height: "20px", lineHeight: "22px", width: "15px", fontSize: "10px" }}>
                            {language == 'en' ? '℃' : '度'}
                        </span>
                    </p>
                    <p style={{ display: 'inline-block', position: 'absolute', top: '-9px', height: "20px", lineHeight: "20px", width: "70px", fontSize: "10px" }}>
                        {language == 'en' ? 'low' : '最低'}
                        <span style={{ display: 'inline-block', height: "20px", lineHeight: "20px", width: "25px", textAlign: "center", fontSize: "14px" }}>
                            {this.state.tempMin}
                        </span>
                        <span style={{ display: 'inline-block', position: 'absolute', height: "20px", lineHeight: "22px", width: "15px", fontSize: "10px" }}>
                            {language == 'en' ? '℃' : '度'}
                        </span>
                    </p>
                </div>
            </div>
        )
    }

    historyStart = () => {
        const {
            toggleTimeShaft,
            toggleDateConfigModal,
            parmsDict,
        } = this.props
        toggleDateConfigModal(true)
        toggleTimeShaft(true)
        parmsDict.closeRealTimeFresh()
    }

    handleVisibleChange = visible => {
        this.setState({ visible })
    }

    switchElecPriceModal = (flag) => {
        this.setState({
            elecPriceVisible: flag
        })
    }

    realtimeElecPrice = () => {
        const elecPrice = appConfig.elecPrice
        const now = new Date()
        const hour = now.getHours()
        const minute = now.getMinutes()
        const halfHour = Math.floor(hour * 2 + minute / 30)
        const month = now.getMonth() + 1
        let nowElecPrice = ''
        if (elecPrice['priceListM30_Month' + month]) {
            nowElecPrice = elecPrice['priceListM30_Month' + month][halfHour]
        } else {
            nowElecPrice = elecPrice.priceListM30 ? elecPrice.priceListM30[halfHour] : ''
        }
        if (nowElecPrice == 0) {
            return '谷'
        } else if (nowElecPrice == 1) {
            return '平'
        } else if (nowElecPrice == 2) {
            return '峰'
        } else {
            return '尖'
        }
    }

    // 退出历史回放模式（参数：保留时间轴、跳过实时刷新）
    closePlayback = (keepTimeShaft = false, skipRealTimeRefresh = true) => {
        //删除历史数据，节省内存
        if (localStorage.getItem('historicalData') !== null) {
            localStorage.removeItem('historicalData')
        }
        if (localStorage.getItem('historicalDeviceData') !== null) {
            localStorage.removeItem('historicalDeviceData')
        }
        if (localStorage.removeItem('ruleHistoryData') !== null) {
            localStorage.removeItem('ruleHistoryData')
        }

        const { updateTimeshaftState, toggleTimeShaft, parmsDict } = this.props
        if (typeof updateTimeshaftState.stopPlayer === 'function') {
            updateTimeshaftState.stopPlayer()
        }


        var thenStart = new Promise(function (resolve, reject) {
            resolve(function () {
                if (!keepTimeShaft) {
                    toggleTimeShaft(false)
                }
                return true
            })
        })
        thenStart.then(function (first) {
            return first()
        }).then(function (second) {
            if (skipRealTimeRefresh) {
                if (localStorage.getItem('ruleReplay') !== null) {
                    if (!keepTimeShaft) {
                        localStorage.removeItem('ruleReplay')
                    }
                } else {
                    parmsDict.renderScreen()    //重新使用实时刷新                                           
                }
            } else {
                if (localStorage.getItem('ruleReplay') !== null) {
                    if (!keepTimeShaft) {
                        localStorage.removeItem('ruleReplay')
                    }
                }
            }
        })


    }
    closeEnergyPriceModal = () => {
        this.setState({
            energyPriceVisible: false
        })
    }

    openAIRuleModal = () => {
        this.setState({
            AIRuleVisible: true
        })
    }
    closeAIRuleModal = () => {
        this.setState({
            AIRuleVisible: false
        })
    }
    // 开始规则历史回放
    startRulePlayback = () => {
        // 回调函数：更新选中状态后执行
        // 从localStorage获取日期字典（包含时间范围等信息）
        let dateDict = JSON.parse(localStorage.getItem('dateDict'));
        this.props.upDateCurValue(dateDict.curValue); // 更新当前时间值
        // 组装时间参数
        let values = {
            startTime: moment(dateDict.startTime),
            endTime: moment(dateDict.endTime),
            timeFormat: dateDict.timeFormat,
        };
        this.props.getTimeArr(values); // 获取时间数组（可能用于时间轴数据加载）
        // 标记规则回放状态，并通过事件总线通知时间变化
        localStorage.setItem('ruleReplay', true);
        eventBus.emit('timeChanged', dateDict.curValue);
    };

    // 停止规则历史回放
    stopRulePlayback = () => {
        // 移除规则回放标记
        localStorage.removeItem('ruleReplay');
    };

    openScriptRuleModal = () => {
        this.setState({
            scriptRuleVisible: true
        })
    }
    closeScriptRuleModal = () => {
        this.setState({
            scriptRuleVisible: false
        })
        this.stopRulePlayback();
    }

    openWorkerOrderModal = () => {
        this.setState({
            WorkerOrderVisible: true
        })
    }
    closeWorkerOrderModal = () => {
        this.setState({
            WorkerOrderVisible: false
        })
    }

    render() {
        const {
            showModal,
            hideLayer,
            showAlarmModal,
            hideModal,
            hideAlarmModal,
            toggleHistoryLayer,
            modal,
            alarmModal,
            menus,
            gMenusFlag, //是否有二级菜单
            newMenusFlag, //是否是新版二级菜单
            children,
            isHistoryLayerVisible,
            toggleAlarmModal,
            toggleWarningManageModal,
            toggleNetworkManageModal,
            isAlarmManageVisible,
            isWarningManageVisible,
            isNetworkManageVisible,
            renderList,
            initialize,
            toggleTimeShaft,
            bShowTimeShaft,
            dateModal,
            toggleDateConfigModal,
            getTimeArr,
            parmsDict,
            showCommonAlarm,  //增加
            getTendencyModal, //趋势模态框
            showMainInterfaceModal,
            getToolPoint,
            showMainCheckboxModal,
            showObserverModal,
            showOptimizeModal,
            showTimeModal,
            addPoint,
            upDateCurValue,
            timeArr,
            hide,
            optimizeSetting,
            timeSetting,
            operateModalVisible, //observer主页面
            operateData,
            operateSwitch,
            switchHide,
            checkboxSetting,
            checkboxHide,
            operateIsLoading,
            conditionDict,
            refreshRealWarning, //func
            refreshChoseKey,
            getWorkerDict,
            recordFailedTime,
            resetFailedTime,
            changeReconnectModalVisible,
            updateTimeshaftState,
            chosedKey, //props
            updateFullPage,
            realtimeWarningData,
            toggleDebugLayer,
            reconnectModal,
            dashboardPages, //仪表盘页面名称数组
            isDebugLayerVisible,
            refreshCustomData,
            refreshCustomDataInModal,
            settingTableDataFlagFun,
            showPointModal,
            selectedData,
            saveHealthData,
            switchUser,
            changeHealthDataStatus,
            tendencyVisible,
            tendencyData,
            hideTendencyModal,
            addSchedule,        //添加日程
            editSchedule,       //修改日程
            scheduleData,       //日程数据
            scheduleLoading,    //数据加载
            delSchedule,        //删除日程
            searchSchedule,     //初始化日程
            useSchedule,        //启用,禁用
            obtainSchedule,     //获取数据 
            loadDate,           //日期加载中
            nodeData,           //日期数据
            fetchID,            //获取ID
            scheduleId,         //id
            ModifySchedule,      //修改
            onTrial,
            warningData,
            AddIdSchedule,       //获取日程Id选项
            CheckId,              //选择的ID
            addScene,             //添加场景
            getSceneList,
            delScene,             //删除场景
            sceneList,           //场景列表数据
            sceneListSelectedId,
            sceneListSelectedName,
            saveSceneListId,
            editScene,
            savePoint,
            preSavePoint,
            changeSceneSavePoint,
            handleSimulation,
            searchList,
            loading,  //svg页面loading
            sceneLoading,         //场景列表loading
            addModel,
            modelList,           //模式列表数据
            modeButtonsList,
            modelLoading,         //模式列表loading
            modelContentLoading,   //模式内容loading
            getModelList,
            modelListSelectedId,
            saveModelListId,
            editModel,
            copyModel,
            delModel,
            addModelContent,  //给模式添加内容
            editModelContent, //修改模式内容
            modelContent,  //模式内容数据
            getModelContent,
            delModelContent,
            getSceneData,
            SceneDataSource,
            SceneSelectId,
            SceneId,
            SceneLoad,
            SceneDataLoaing,
            createGuarantee,  //创建保修管理
            Guarantee,
            RepairData,
            SeachGuarantee,
            SeachGuaranteeVisiable,  //获取保修页面和数据
            SeachGuaranteeSourceData,
            GuaranteeFixid,
            ViewMessage,
            ViewDisplay,
            RepairDataAction,   //报修管理
            RepairManageData,
            viewExperience,
            getRepairData,
            RepairVisiable,
            visiable,
            getAllCalendarWithMode,
            loadingCalendar,
            hideCommandLogModal,
            commandLogVisible,
            commandLogPoint,
            isDeleted,
            isDeletedUpdate,
            addPage,
            removePage,
            updatePage,
            showPointModalAI,
            hidePointModalAI,
            showPointModalRule,
            hidePointModalRule,
            onSelectChangeInput,
            onSelectChangeOutput,
            onSelectChange
        } = this.props
        const { isLowPower, AIRuleVisible, WorkerOrderVisible, scriptRuleVisible, systemSettingsVisible } = this.state
        let user_info =
            window.localStorage.getItem('userInfo') ?
                JSON.parse(window.localStorage.getItem('userInfo')) : window.localStorage.getItem('userData') ?
                    JSON.parse(window.localStorage.getItem('userData'))
                    :
                    {}
        const menu = (
            <Menu
                selectedKeys={[this.child ? String(this.child.state.selectedKeys) : '']}
                style={{ display: 'flex', marginTop: 4 }}
            >
                <MenuItemGroup key="g1" title={<div className={s['menu-group-title']}>{language == 'en' ? 'System Management' : '系统管理'}</div>}>
                    {/* 等级分为0/1/2/3/4。
                    有配置：0级不可见，1234，当前账号等于高于配置等级则可见
                    (有配置的情况下，默认是0/1/2？，由调试工具决定)。
                    没配置：默认可见
                    （没配置的情况下，默认是不可见的选项，om和debugtool有没有统一？，比如‘客户服务’）。
                    
                    当前不应该有用户权限不足的提示出现了？，因为权限不足就不会看见这一菜单项。
                    */}
                    {
                        user_menu_display.user_manage_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.user_manage_display ?
                            ''
                            :
                            <MenuItem key="userPanel">
                                <UserPanel
                                    initialize={initialize}
                                    switchUser={switchUser}
                                />
                            </MenuItem>
                    }
                    {
                        user_menu_display.operation_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.operation_display ?
                            ''
                            :
                            <MenuItem key="operationRecord">
                                <div
                                    onClick={() => showModal(modalTypes.OPERATION_RECORD_MODAL)}
                                >
                                    <Icon type="file-text" style={{ marginRight: '5px' }} />{language == 'en' ? 'Operation record' : '操作记录'}
                                </div>
                            </MenuItem>
                    }
                    {
                        user_menu_display.cache_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.cache_display ?
                            ''
                            :
                            <MenuItem key="dbClearMenu">
                                <div
                                    onClick={(e) => {
                                        e.preventDefault();
                                        Modal.confirm({
                                            title: language == 'en' ? 'Are you sure you want to clear the cache?' : '确定要清理缓存吗？',
                                            content: language == 'en' ? 'Click the "OK" button to start clearing the cache.' : '点击“确认”按钮开始清理缓存。',
                                            onOk: () => {
                                                this.child.handleClickdbClearMenu()
                                            }
                                        });
                                    }}
                                >
                                    <Icon type="delete" style={{ marginRight: '5px' }} />{language == 'en' ? 'Clear the cache' : '缓存清理'}
                                </div>
                            </MenuItem>
                    }
                    {
                        user_menu_display.scene_manage_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.scene_manage_display ?
                            ''
                            :
                            <MenuItem key="SceneManage">
                                <div
                                    onClick={this.handleScene}
                                >
                                    <Icon type="book" style={{ marginRight: '5px' }} />{language == 'en' ? 'Scene Management' : '场景管理'}
                                </div>
                            </MenuItem>
                    }
                    {
                        user_menu_display.property_manage_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.property_manage_display ?
                            ''
                            :
                            <MenuItem key="assetMenu"
                            // visible={JSON.parse(window.localStorage.getItem('userData')).role >= 3 ? true : false}
                            >
                                <Link to={"AssetToolCx/"}
                                    onClick={(e) => {
                                        this.child.handleClickTopMenu("assetMenu");
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: language == 'en' ? 'Prompt' : '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>{language == 'en' ? 'If you want to access asset management, please click the data playback button first to exit the playback function.' : '如果想要进入资产管理，请先点击数据回放按钮，退出回放功能。'}</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}>
                                    <Icon type="account-book" style={{ marginRight: '5px' }} />{language == 'en' ? 'Asset management' : '资产管理'}
                                </Link>
                            </MenuItem>
                    }
                    {
                        user_menu_display.energy_price_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.energy_price_display ?
                            ''
                            :
                            <MenuItem key="energyPrice">
                                <div
                                    onClick={() => {
                                        this.setState({
                                            energyPriceVisible: true
                                        })
                                    }}
                                >
                                    <Icon type="dollar" style={{ marginRight: '5px' }} />{language == 'en' ? 'Energy Prices' : '能源价格'}
                                </div>
                            </MenuItem>
                    }
                    {
                        toolbar_display.toolbar_display_weekly_calendar == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_weekly_calendar ?
                            ''
                            :
                            <MenuItem key="weeklySchedule">
                                <div
                                    onClick={this.handleSchedule}
                                >
                                    <Icon type="profile" style={{ marginRight: '5px' }} />{language == 'en' ? 'Weekly Schedule Management' : '周日程管理'}
                                </div>
                            </MenuItem>
                    }
                    {
                        toolbar_display.toolbar_display_system_settings == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_system_settings ?
                            ''
                            :
                            <MenuItem key="systemSettings">
                                <div
                                    onClick={this.handleSettings}
                                >
                                    <Icon type="setting" style={{ marginRight: '5px' }} />{language == 'en' ? 'Settings' : '系统设置'}
                                </div>
                            </MenuItem>
                    }
                </MenuItemGroup>
                <MenuItemGroup key="g2"
                    style={{ borderLeft: '1px solid rgb(49,59,69)', borderRight: '1px solid rgb(49,59,69)' }}
                    title={<div className={s['menu-group-title']}>{language == 'en' ? 'Data Analysis' : '数据分析'}</div>}>
                    {
                        user_menu_display.data_manage_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.data_manage_display ?
                            ''
                            :
                            <MenuItem key="cxMenu"
                            >
                                <Link to={"systemToolCx/"}
                                    onClick={(e) => {
                                        this.child.handleClickTopMenu("cxMenu");
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: language == 'en' ? 'Prompt' : '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>{language == 'en' ? 'If you want to access data management, please first click the data playback button to exit the playback function.' : '如果想要进入数据管理，请先点击数据回放按钮，退出回放功能。'}</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}>
                                    <Icon type="appstore-o" style={{ marginRight: '5px' }} />{language == 'en' ? 'Data management' : '数据管理'}
                                </Link>
                            </MenuItem>
                    }
                    {
                        user_menu_display.history_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.history_display ?
                            ''
                            :
                            <MenuItem key="historyMenu">
                                <Link to={"systemToolHistoryCurve/"}
                                    onClick={(e) => {
                                        this.child.handleClickTopMenu("historyMenu");
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: language == 'en' ? 'Prompt' : '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>{language == 'en' ? 'If you want to access the historical curve, please first click the data playback button to exit the playback function.' : '如果想要进入历史曲线，请先点击数据回放按钮，退出回放功能。'}</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}>
                                    <Icon type="line-chart" style={{ marginRight: '5px' }} />{language == 'en' ? 'Historical curve' : '历史曲线'}
                                </Link>
                            </MenuItem>
                    }
                    {
                        toolbar_display.toolbar_display_report == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_report ?
                            ''
                            :
                            <MenuItem key="reportManage">
                                <Link to={"reportManage/"}
                                    onClick={(e) => {
                                        this.child.handleClickTopMenu("RepairManage");
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: language == 'en' ? 'Prompt' : '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>{language == 'en' ? 'If you want to access the report download feature, first click the data playback button to exit the playback function.' : '如果想要进入报表下载，请先点击数据回放按钮，退出回放功能。'}</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}
                                >
                                    <Icon type="file-text" className={s['icon-select-before']} />{language == 'en' ? 'Download Reports' : '报表下载'}
                                </Link>
                            </MenuItem>
                    }
                    {/* <MenuItem key="dataAnalysis">
                        <Link to={"systemToolDataAnalysis/"}
                            onClick={(e) => {
                                this.child.handleClickTopMenu("dataAnalysis");
                                if (bShowTimeShaft) {
                                    e.preventDefault();
                                    Modal.info({
                                        title: language == 'en' ? 'Prompt' : '温馨提示',
                                        content: (
                                            <div>
                                                <p>{language == 'en' ? 'If you want to access the historical curve, please first click the data playback button to exit the playback function.' : '如果想要进入数据分析，请先点击数据回放按钮，退出回放功能。'}</p>
                                            </div>
                                        ),
                                    });
                                }
                            }}> 
                            <Icon type="fund" style={{ marginRight: '5px' }} />数据分析
                        </Link>
                    </MenuItem> */}
                </MenuItemGroup>
                <MenuItemGroup key="g3" title={<div className={s['menu-group-title']}>{language == 'en' ? 'Control Decision' : '控制决策'}</div>}>
                    {
                        user_menu_display.optimize_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.optimize_display ?
                            ''
                            :
                            <MenuItem key="DashboardMenu"
                            // visible={JSON.parse(window.localStorage.getItem('userData')).role >= 3 ? true : false}
                            >
                                <Link to={"systemToolExpertOptimize/"}
                                    onClick={(e) => {
                                        this.child.handleClickTopMenu("DashboardMenu");
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: language == 'en' ? 'Prompt' : '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>{language == 'en' ? 'If you want to access the expert optimization and debugging learning form, please first click the data playback button to exit the playback function.' : '如果想要进入专家优化调试学习表，请先点击数据回放按钮，退出回放功能。'}</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}>
                                    <Icon type="compass" style={{ marginRight: '5px' }} />{language == 'en' ? 'Optimize & Debug' : '优化调试'}
                                </Link>
                            </MenuItem>
                    }

                    {
                        pysiteVersion >= 2205 ? (
                            user_menu_display.command_surveillance_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.command_surveillance_display ?
                                ''
                                :
                                <MenuItem key="commandSurveillance">
                                    <div
                                        onClick={() => showModal(modalTypes.COMMAND_SURVEILLANCE_MODAL)}
                                    >
                                        <Icon type="cluster" style={{ marginRight: '5px' }} />{language == 'en' ? 'Command Surveillance' : '指令监测'}
                                    </div>
                                </MenuItem>)
                            :
                            ''
                    }
                </MenuItemGroup>
            </Menu>
        )
        let tempMarginLeft
        if (this.state.num === 0) {
            tempMarginLeft = '10px'
        }

        const omTitle = JSON.parse(localStorage.getItem('omTitle'))
        return (
            <div className={s[`${containerClass}`]}>
                <Trend
                    tendencyData={tendencyData}
                    tendencyVisible={tendencyVisible}
                    handleCancel={hideTendencyModal}
                />
                <CommandLog
                    commandLogPoint={commandLogPoint}
                    commandLogVisible={commandLogVisible}
                    handleCancel={hideCommandLogModal}
                />
                {/* <repair
              RepairDataAction={RepairDataAction}  
              RepairManageData={RepairManageData}
              viewExperience = {viewExperience}
              getRepairData = {getRepairData}
              RepairDataAction = {RepairDataAction}
              RepairVisiable={RepairVisiable}
              visible = {visiable}
           /> */}
                <div style={headerStyle}>
                    <div style={headerStyleLogo}>
                        <span>
                            <span
                                style={{
                                    cursor: 'pointer',
                                    fontSize: localStorage.getItem('cleanMode') != 1 && omTitle && omTitle != '' && localStorage.getItem('omTitleSize') && localStorage.getItem('omTitleSize') != ''
                                        ? parseInt(localStorage.getItem('omTitleSize'))
                                        : 14
                                }}
                                onClick={this.getOmsiteVersion}
                            >
                                {
                                    localStorage.getItem('cleanMode') != 1 && omTitle && omTitle != '' ?
                                        language == "en" ?
                                            omTitle.windowTitle_en && omTitle.windowTitle_en != "" ? omTitle.windowTitle_en : "OM site"
                                            : omTitle.windowTitle_zh && omTitle.windowTitle_zh != "" ? omTitle.windowTitle_zh : "节能优化控制软件"
                                        :
                                        'OM site'
                                }{
                                    toolbar_display.toolbar_display_window_title == 0 ?
                                        ''
                                        :
                                        appConfig.project.version
                                }
                            </span>
                            {
                                this.state.newVersionFlag ?
                                    <span className={s['cloudVersion']} onClick={this.updateOM}>
                                        {language == 'en' ? 'Find a new version' : '发现新版本'}
                                    </span>
                                    : ""
                            }
                        </span>
                    </div>
                    <div className={s['header-right']}>
                        <div style={{ display: 'inline-block', marginRight: '10px' }}>
                            <RealtimeWarningModal
                                onCancel={hideAlarmModal}
                                showModal={showAlarmModal}
                                realtimeWarningData={realtimeWarningData}
                                refreshRealWarning={refreshRealWarning}
                                refreshChoseKey={refreshChoseKey}
                                chosedKey={chosedKey}
                                modal={alarmModal}
                                refreshNum={this.refreshNum}
                                refreshOffLineNum={this.refreshOffLineNum}
                                refreshFaultNum={this.refreshFaultNum}
                                saveHealthData={saveHealthData}
                                changeHealthDataStatus={changeHealthDataStatus}
                                getWorkerDict={getWorkerDict}
                                recordFailedTime={recordFailedTime}
                                resetFailedTime={resetFailedTime}
                                changeReconnectModalVisible={changeReconnectModalVisible}
                                reconnectModal={reconnectModal}
                            />
                            <div style={{ display: 'inline-block' }}>
                                {
                                    localStorage.getItem('soundFileName') != undefined && localStorage.getItem('soundFileName') !== "" ?
                                        <audio id="music1" preload="true" loop controls="controls" crossOrigin="anonymous" src={appConfig.serverUrl + `/static/files/alarm_sound/` + localStorage.getItem('soundFileName')} hidden />
                                        :
                                        <audio id="music1" preload="true" loop controls="controls" crossOrigin="anonymous" hidden />
                                }
                            </div>
                        </div>
                        {
                            toolbar_display.toolbar_display_display_datetime == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_display_datetime ?
                                ''
                                :
                                <TimerStyle className={s['icon-label-inner-label']} />
                        }
                        {
                            localStorage.getItem('weatherDis') === null || localStorage.getItem('weatherDis') === '1'
                                ? this.getWeather()
                                : ''
                        }
                        {
                            this.getHealthBulb()
                        }
                        <div className={s['min-display']} style={{ position: 'relative', top: '4px' }}>
                            {
                                toolbar_display.toolbar_display_elec_price == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_elec_price ?
                                    ''
                                    :
                                    appConfig.elecPrice && appConfig.elecPrice.priceListM30 ?
                                        <div
                                            title={language == 'en' ? 'Electricity price' : '电价'}
                                            className={s['top-right-btnIcon']}
                                        >
                                            <Button type="link" onClick={() => this.switchElecPriceModal(true)} style={{ border: "2px solid", padding: 0, minWidth: "18px", height: "19px", lineHeight: "16px", color: "#aaa" }}>{this.realtimeElecPrice()}</Button>
                                        </div>
                                        :
                                        ''
                            }
                            {
                                toolbar_display.toolbar_display_history_screen == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_history_screen ?

                                    ''
                                    :
                                    <div
                                        title={language == 'en' ? 'Data playback' : '数据回放'}
                                        className={s['top-right-btnIcon']}
                                        disabled={this.props.loading}
                                        onClick={() => {
                                            if (bShowTimeShaft) {
                                                this.closePlayback(false, true)
                                            } else {
                                                toggleDateConfigModal(true);
                                                toggleTimeShaft(true);
                                            }
                                        }
                                        }
                                    >
                                        {
                                            bShowTimeShaft == false ?
                                                <Icon type="clock-circle-o" className={s['icon-select-before']} />
                                                :
                                                <Icon type="clock-circle" className={s['icon-select-after']} />
                                        }
                                    </div>
                            }
                            {
                                toolbar_display.toolbar_display_control_setting == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_control_setting ?
                                    ''
                                    :
                                    <div
                                        title={language == 'en' ? 'Scene control' : '场景控制'}
                                        className={s['top-right-btnIcon']}
                                        onClick={this.handleSceneControl}
                                    >
                                        <Icon type="code-o" className={s['icon-select-before']} />
                                    </div>
                            }
                            {
                                toolbar_display.toolbar_display_mode_manage == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_mode_manage ?
                                    ''
                                    :
                                    <div
                                        title={language == 'en' ? 'Mode management' : '模式管理'}
                                        className={s['top-right-btnIcon']}
                                        onClick={this.handleModelManage}
                                    >
                                        <Icon type="layout" className={s['icon-select-before']} />
                                    </div>
                            }
                            {
                                toolbar_display.toolbar_display_mode_calendar == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_mode_calendar ?
                                    ''
                                    :
                                    <div
                                        title={language == 'en' ? 'Calendar Schedule Management' : '日历日程管理'}
                                        className={s['top-right-btnIcon']}
                                    >
                                        <Link to={"systemToolCalender/"}
                                            onClick={(e) => {
                                                this.child.handleClickTopMenu("CalendarMenu");
                                                if (bShowTimeShaft) {
                                                    e.preventDefault();
                                                    Modal.info({
                                                        title: language == 'en' ? 'Prompt' : '温馨提示',
                                                        content: (
                                                            <div>
                                                                <p>{language == 'en' ? 'If you want to access the calendar, please first click the data playback button to exit the playback function.' : '如果想要进入日历，请先点击数据回放按钮，退出回放功能。'}</p>
                                                            </div>
                                                        ),
                                                    });
                                                }
                                            }}>
                                            <Icon className={s['icon-select-before']} type="calendar" />
                                        </Link>
                                    </div>
                            }
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer', margin: '0 0 0 10px' }}
                                onClick={() => { handleWarningBtn(toggleWarningManageModal, this.props.renderList) }}
                            >
                                <div
                                    title={language == 'en' ? 'Alarm Management' : '报警管理'}
                                    style={{ display: 'inline-block', boxSizing: 'border-box', cursor: 'pointer' }}
                                >
                                    <Icon type="bell" className={s['icon-select-before']} />
                                </div>
                            </div>
                            {
                                toolbar_display.toolbar_display_network == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_network ?
                                    ''
                                    :
                                    <div
                                        style={{ display: 'inline-block', cursor: 'pointer', margin: '0 0 0 10px' }}
                                        onClick={() => { handleNetworkBtn(toggleNetworkManageModal) }}
                                    >
                                        <div
                                            title={language == 'en' ? 'Network Topology Diagram' : '网络拓扑图'}
                                            style={{ display: 'inline-block', boxSizing: 'border-box', cursor: 'pointer' }}
                                        >
                                            <Icon type="cluster" className={s['icon-select-before']} />
                                        </div>
                                        <Badge count={this.state.offLineNum} overflowCount={999} showZero={false} style={{ fontSize: '12px', color: 'white', margin: '-25px 0px 0px -5px', cursor: 'pointer' }}></Badge>
                                    </div>
                            }
                            {
                                user_menu_display.rule_control_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.rule_control_display ? ''
                                    :
                                    <div
                                        title={language == 'en' ? 'Rule control' : '规则控制'}
                                        className={s['top-right-btnIcon']}
                                        onClick={this.openScriptRuleModal}
                                    >
                                        <Icon type="fork" className={s['icon-select-before']} />
                                    </div>
                            }
                            {
                                user_menu_display.ai_rule_display == 0 || JSON.parse(window.localStorage.getItem('userData')).role < user_menu_display.ai_rule_display ? ''
                                    :
                                    <div
                                        title={language == 'en' ? 'AI decision-making' : 'AI决策'}
                                        className={s['top-right-btnIcon']}
                                        onClick={this.openAIRuleModal}
                                    >
                                        <Icon type="radar-chart" className={s['icon-select-before']} />
                                    </div>
                            }
                            {
                                toolbar_display.toolbar_display_workorder == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_workorder ?
                                    ''
                                    :
                                    <div
                                        style={{ display: 'inline-block', cursor: 'pointer' }}
                                        onClick={this.openWorkerOrderModal}
                                    >
                                        <div
                                            title={language == 'en' ? 'Work Order Management' : '工单管理'}
                                            className={s['top-right-btnIcon']}
                                        >
                                            <Icon type="medicine-box" className={s['icon-select-before']} />
                                            <Badge count={this.props.faultNum} overflowCount={99} showZero={false} style={{ fontSize: '12px', color: 'white', margin: '-25px 0px 0px -5px', cursor: 'pointer' }}></Badge>
                                        </div>
                                    </div>
                            }

                            {
                                toolbar_display.toolbar_display_knowledge == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_knowledge ?
                                    ''
                                    : <div
                                        title={language == 'en' ? 'Knowledge base' : '知识库'}
                                        className={s['top-right-btnIcon']}
                                    >
                                        <Link to={"KnowledgeManage/"}
                                            onClick={(e) => {
                                                this.child.handleClickTopMenu("Knowledge");
                                                if (bShowTimeShaft) {
                                                    e.preventDefault();
                                                    Modal.info({
                                                        title: language == 'en' ? 'Prompt' : '温馨提示',
                                                        content: (
                                                            <div>
                                                                <p>{language == 'en' ? 'If you want to access the knowledge base, please click the data playback button first to exit the playback function.' : '如果想要进入知识库，请先点击数据回放按钮，退出回放功能。'}</p>
                                                            </div>
                                                        ),
                                                    });
                                                }
                                            }}>
                                            <Icon type="read" className={s['icon-select-before']} />
                                        </Link>
                                    </div>
                            }
                            {

                                toolbar_display.toolbar_display_custom_chat == 0 || JSON.parse(window.localStorage.getItem('userData')).role < toolbar_display.toolbar_display_custom_chat ?
                                    ''
                                    :
                                    <div
                                        title={language == 'en' ? 'Online Customer Service' : '在线客服'}
                                        className={s['top-right-btnIcon']}
                                        onClick={this.handleCustomService}
                                    >
                                        <Icon type="message" theme="filled" className={s['icon-select-before']} />
                                    </div>

                            }

                        </div>
                        <span style={{ color: '#aaa', marginLeft: `${tempMarginLeft}` }}>|</span>
                        {
                            toolbar_display.toolbar_display_mantainence == 0 ?
                                ''
                                :
                                <WatchOver
                                    userInfo={user_info}
                                />
                        }
                        {
                            toolbar_display.toolbar_display_user_menu == 0 ?
                                <span className="ant-dropdown-link" style={userInfoName}>
                                    <span style={{ display: 'inline-block', minWidth: '70px', textAlign: 'center' }}>{user_info.name || ''}</span>
                                </span>
                                :
                                <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
                                    <span className="ant-dropdown-link" style={userInfoName}>
                                        <span style={{ display: 'inline-block', minWidth: '70px', textAlign: 'center' }}>{user_info.name || ''}</span> <Icon type="down" className={s['icon-select-before']} style={{ cursor: 'pointer' }} />
                                    </span>
                                </Dropdown>
                        }
                        <span style={{ color: '#aaa' }}>|</span>
                        <div style={headerStyleSpan}>
                            {localStorage.getItem('serverName') === '' ?
                                localStorage.getItem('projectName_en') != '' && localStorage.getItem('projectName_en') != undefined ? localStorage.getItem('projectName_en') : localStorage.getItem('serverUrl')
                                :
                                <span className={s['header-url-left-span']} style={headerStyleSpan}>
                                    {localStorage.getItem('serverName')}&nbsp;&nbsp;
                                    {localStorage.getItem('projectName_en') != '' && localStorage.getItem('projectName_en') != undefined ? localStorage.getItem('projectName_en') : localStorage.getItem('serverUrl')}
                                </span>
                            }
                        </div>
                        <span style={{ color: '#aaa' }}>|</span>

                        {
                            argv.length > 14 && argv[argv.length - 6] == "-count" ?

                                <div
                                    title={language == 'en' ? 'Return to Main Window' : '返回主窗'}
                                    className={s['top-right-btnIcon']}
                                    onClick={this.callBackMainWindow}
                                >
                                    <Icon type="cloud" className={s['icon-select-before']} />
                                </div>

                                :

                                ""
                        }

                        {
                            toolbar_display.toolbar_display_window_position == 0 ?
                                ''
                                :
                                <Popover
                                    content={<div><Button style={{ width: "200px" }} onClick={() => this.handleSelectSplit(0)}>{language == 'en' ? 'Full Screen' : '全屏显示'}</Button><br />
                                        <Button style={{ width: "200px" }} onClick={() => this.handleSelectSplit(1)}>{language == 'en' ? 'Top Left' : '置于左上'}</Button><br />
                                        <Button style={{ width: "200px" }} onClick={() => this.handleSelectSplit(2)}>{language == 'en' ? 'Top Right' : '置于右上'}</Button><br />
                                        <Button style={{ width: "200px" }} onClick={() => this.handleSelectSplit(3)}>{language == 'en' ? 'Bottom Left' : '置于左下'}</Button><br />
                                        <Button style={{ width: "200px" }} onClick={() => this.handleSelectSplit(4)}>{language == 'en' ? 'Bottom Right' : '置于右下'}</Button>
                                    </div>
                                    }
                                    trigger="hover"
                                    visible={this.state.visible}
                                    onVisibleChange={this.handleVisibleChange}
                                >
                                    <Button shape="circle" title={language == 'en' ? 'Display Position' : '显示位置'} style={RTbtnStyle} icon='environment' size="small"></Button>
                                </Popover>
                        }

                        <Button shape="circle" style={RTbtnStyle} icon="minus" size="small" onClick={minimizeAppWindow} />
                        <div
                            title={language == 'en' ? 'Maximize' : '最大化'}
                            style={{ display: 'inline-block' }}
                        >
                            <Button shape="circle" style={RTbtnStyle} icon="border" size="small" onClick={this.handleMax} />

                        </div>
                        {/* {
                            localStorage.getItem('maxBtn') == 1 ?
                                <div
                                    title="最大化"
                                    style={{ display: 'inline-block' }}
                                >
                                    <Button shape="circle" style={RTbtnStyle} icon="border" size="small" onClick={this.handleMax} />

                                </div>
                                :
                                <div
                                    title="向下还原"
                                    style={{ display: 'inline-block' }}
                                >
                                    <Button shape="circle" style={RTbtnStyle} icon="switcher" size="small" onClick={this.handleMax} />

                                </div>
                        } */}
                        <Button type="danger" style={RTbtnStyle} shape="circle" icon="close" size="small" onClick={() => closeWindow(dashboardPages)} />
                    </div>
                </div>

                {
                    bShowTimeShaft ?
                        <div className={s[`${contentTimeClass}`]}>
                            <div style={ContentHeaderStyle}>
                                <MenuComponent
                                    menus={menus}
                                    initialize={initialize}
                                    hideLayer={hideLayer}
                                    updateTimeshaftState={updateTimeshaftState}
                                    bShowTimeShaft={bShowTimeShaft}
                                    updateFullPage={updateFullPage}
                                    parmsDict={parmsDict}
                                    closeWindow={closeWindow}
                                    dashboardPages={dashboardPages}
                                    refreshCustomData={refreshCustomData}
                                    refreshCustomDataInModal={refreshCustomDataInModal}
                                    settingTableDataFlagFun={settingTableDataFlagFun}
                                    gMenusFlag={gMenusFlag}
                                    newMenusFlag={newMenusFlag}
                                    loading={this.props.loading}
                                    historyStart={this.historyStart}
                                    ref={ref => this.child = ref}
                                    scriptRefreshAll={this.props.scriptRefreshAll}
                                    closePlayback={this.closePlayback}
                                    getTimeArr={getTimeArr}
                                    upDateCurValue={upDateCurValue}
                                />
                            </div>
                            <div className={s['content-inner']}>
                                {children}
                                <div className={s['float-layers']}>
                                    {isHistoryLayerVisible ? <HistoryLayer /> : null}
                                </div>
                                <div className={s['float-layers']}>
                                    {isDebugLayerVisible ? <DebugLayer /> : null}
                                </div>
                            </div>
                        </div>
                        :
                        <div className={s[`${contentClass}`]}>
                            <div style={ContentHeaderStyle}>

                                <MenuComponent
                                    menus={menus}
                                    initialize={initialize}
                                    hideLayer={hideLayer}
                                    updateTimeshaftState={updateTimeshaftState}
                                    bShowTimeShaft={bShowTimeShaft}
                                    updateFullPage={updateFullPage}
                                    parmsDict={parmsDict}
                                    closeWindow={closeWindow}
                                    dashboardPages={dashboardPages}
                                    refreshCustomData={refreshCustomData}
                                    refreshCustomDataInModal={refreshCustomDataInModal}
                                    settingTableDataFlagFun={settingTableDataFlagFun}
                                    gMenusFlag={gMenusFlag}
                                    newMenusFlag={newMenusFlag}
                                    loading={this.props.loading}
                                    historyStart={this.historyStart}
                                    ref={ref => this.child = ref}
                                    scriptRefreshAll={this.props.scriptRefreshAll}
                                    closePlayback={this.closePlayback}
                                    getTimeArr={getTimeArr}
                                    upDateCurValue={upDateCurValue}
                                />
                            </div>
                            <div className={s['content-inner']}>
                                {children}
                                <div className={s['float-layers']}>
                                    {isHistoryLayerVisible ? <HistoryLayer /> : null}
                                </div>
                                <div className={s['float-layers']}>
                                    {isDebugLayerVisible ? <DebugLayer /> : null}
                                </div>
                            </div>
                        </div>
                }
                <div style={footerStyle}>
                    <div className={s['footer-content']}>
                        {
                            modeButtonsList.length != 0 ?
                                <ModeButtonsListView
                                    modeButtonsList={modeButtonsList}
                                    getModeButtonsList={this.props.getModeButtonsList}
                                    getModelContent={getModelContent}
                                    saveModelListId={saveModelListId}
                                    showManageModal={showModal}
                                    getAllCalendarWithMode={getAllCalendarWithMode}
                                    loadingCalendar={loadingCalendar}
                                    getTendencyModal={getTendencyModal}
                                    showCommonAlarm={showCommonAlarm}
                                    showMainInterfaceModal={showMainInterfaceModal}
                                    getToolPoint={getToolPoint}
                                />
                                :
                                ''
                        }
                    </div>
                </div>

                <OperationRecordModal
                    visible={modal.type === modalTypes.OPERATION_RECORD_MODAL}
                    onCancel={hideModal}
                />
                <WarningManageLayer
                    visible={isWarningManageVisible}
                    onCancel={toggleWarningManageModal}
                />
                <NetworkManageLayer
                    visible={isNetworkManageVisible}
                    onCancel={toggleNetworkManageModal}
                />

                <MainModal />
                <SecModal />
                <ElecPriceModal
                    visible={this.state.elecPriceVisible}
                    onCancel={this.switchElecPriceModal}
                />
                <TimeShaft
                    show={dateModal.visible}
                    // dateOptions={this.state.dateOptions}
                    onOk={toggleDateConfigModal}
                    onCancel={toggleDateConfigModal}
                    toggleTimeShaft={toggleTimeShaft}
                    closePlayback={this.closePlayback}
                />
                <DateConfigModal
                    show={dateModal.visible}
                    onlyCloseModel={dateModal.onlyCloseModel}
                    // dateOptions={this.state.dateOptions}
                    onOk={toggleDateConfigModal}
                    onCancel={toggleDateConfigModal}
                    toggleTimeShaft={toggleTimeShaft}
                    getTimeArr={getTimeArr}
                    addPoint={addPoint}
                    parmsDict={parmsDict}
                    bShowTimeShaft={bShowTimeShaft}
                    dateProps={dateModal.props}
                    upDateCurValue={upDateCurValue}
                    timeArr={timeArr}
                />
                {/*设备台账模态框*/}
                <DeviceInfo
                    visible={modal.type === modalTypes.DEVICE_MODAL}
                    onCancel={hideModal}
                />
                {/*场景管理模态框*/}
                <SceneView
                    visible={modal.type === modalTypes.SCENE_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addScene={addScene}
                    editScene={editScene}
                    sceneList={sceneList}
                    delScene={delScene}
                    sceneLoading={sceneLoading}
                    getSceneList={getSceneList}
                    handleSimulation={handleSimulation}
                    loadDate={loadDate}
                    savePoint={savePoint}
                    preSavePoint={preSavePoint}
                    changeSceneSavePoint={changeSceneSavePoint}
                    hideModal={hideModal}
                    saveSceneListId={saveSceneListId}
                    selectedId={sceneListSelectedId}
                    selectedName={sceneListSelectedName}
                    searchList={searchList}
                    isDeleted={isDeleted}
                    isDeletedUpdate={isDeletedUpdate}
                />
                {/* 场景控制面板*/}
                <SceneControlModalView
                    visible={modal.type === modalTypes.SCENE_CONTROL_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addModel={addModel}
                    editModel={editModel}
                    copyModel={copyModel}
                    modelList={modelList}
                    delModel={delModel}
                    modelLoading={modelLoading}
                    isLowPower={isLowPower}
                    modelContentLoading={modelContentLoading}
                    getModelList={getModelList}
                    handleSimulation={handleSimulation}
                    loadDate={loadDate}
                    savePoint={savePoint}
                    hideModal={hideModal}
                    saveModelListId={saveModelListId}
                    selectedId={modelListSelectedId}
                    addModelContent={addModelContent}
                    editModelContent={editModelContent}
                    modelContent={modelContent}
                    getModelContent={getModelContent}
                    delModelContent={delModelContent}
                    getSceneData={getSceneData}
                    SceneDataSource={SceneDataSource}
                    SceneSelectId={SceneSelectId}
                    SceneId={SceneId}
                    SceneLoad={SceneLoad}
                    SceneLoading={SceneDataLoaing}
                    getTendencyModal={getTendencyModal}
                    showCommonAlarm={showCommonAlarm}
                    showMainInterfaceModal={showMainInterfaceModal}
                    getToolPoint={getToolPoint}
                />
                {/* 模式管理模态框*/}
                <ModelManageModalView
                    modeButtonsList={modeButtonsList}
                    visible={modal.type === modalTypes.MODEL_MANAGE_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addModel={addModel}
                    editModel={editModel}
                    copyModel={copyModel}
                    modelList={modelList}
                    delModel={delModel}
                    modelLoading={modelLoading}
                    modelContentLoading={modelContentLoading}
                    getModelList={getModelList}
                    handleSimulation={handleSimulation}
                    loadDate={loadDate}
                    savePoint={savePoint}
                    hideModal={hideModal}
                    saveModelListId={saveModelListId}
                    selectedId={modelListSelectedId}
                    addModelContent={addModelContent}
                    editModelContent={editModelContent}
                    modelContent={modelContent}
                    getModelContent={getModelContent}
                    delModelContent={delModelContent}
                    getSceneData={getSceneData}
                    SceneDataSource={SceneDataSource}
                    SceneSelectId={SceneSelectId}
                    SceneId={SceneId}
                    SceneLoad={SceneLoad}
                    SceneLoading={SceneDataLoaing}
                    showModal={showModal}
                    addScene={addScene}
                    editScene={editScene}
                    sceneList={sceneList}
                    delScene={delScene}
                    sceneLoading={sceneLoading}
                    getSceneList={getSceneList}
                    preSavePoint={preSavePoint}
                    changeSceneSavePoint={changeSceneSavePoint}
                    saveSceneListId={saveSceneListId}
                    sceneListSelectedId={sceneListSelectedId}
                    sceneListSelectedName={sceneListSelectedName}
                    searchList={searchList}
                />
                {/*日程模态框*/}
                <ScheduleView
                    visible={modal.type === modalTypes.SCHEDULE_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addSchedule={addSchedule}
                    editSchedule={editSchedule}
                    scheduleData={scheduleData}
                    delSchedule={delSchedule}
                    scheduleLoading={scheduleLoading}
                    searchSchedule={searchSchedule}
                    useSchedule={useSchedule}
                    obtainSchedule={obtainSchedule}
                    nodeData={nodeData}
                    loadDate={loadDate}
                    fetchID={fetchID}
                    scheduleId={scheduleId}
                    ModifySchedule={ModifySchedule}
                    hideModal={hideModal}
                    AddIdSchedule={AddIdSchedule}
                    CheckId={CheckId}
                />
                {/* 系统设置模态框 */}
                <SystemSettingsModal
                    visible={systemSettingsVisible}
                    hideModal={this.closeSettingModal}
                />

                {/* 客服模态框 */}
                <CustomerServiceView
                    // visible = {modal.type === modalTypes.CUSTOM_SERVICE_MODAL}
                    visible={modal.type === modalTypes.CUSTOM_SERVICE_MODAL}
                    onCancel={hideModal}
                    showModal={this.props.showModal}
                    showAiModal={() => this.handleAIService()}
                    showAiChatModal={(show) => this.handleAIChatModalVisible(show)}
                // onCancel = {hideModal}
                />

                <AIModalView
                    visible={modal.type === modalTypes.CUSTOM_CHAT_MODAL}
                    hideModal={hideModal}
                // showModal={this.handleAIService}
                />

                <AIRuleModalView
                    AIRuleVisible={AIRuleVisible}
                    closeAIRuleModal={this.closeAIRuleModal}
                    addPage={addPage}
                    removePage={removePage}
                    updatePage={updatePage}
                    showPointModal={showPointModalAI}
                    hidePointModal={hidePointModalAI}
                    onSelectChangeInput={onSelectChangeInput}
                    onSelectChangeOutput={onSelectChangeOutput}
                    selectedIdsInput={this.props.selectedIdsInput}
                    pointDataInput={this.props.pointDataInput}
                    selectedIdsOutput={this.props.selectedIdsOutput}
                    pointDataOutput={this.props.pointDataOutput}
                />
                <ScriptRuleModalView
                    visible={scriptRuleVisible}
                    closeScriptRuleModal={this.closeScriptRuleModal}
                    startRulePlayback={this.startRulePlayback}
                    stopRulePlayback={this.stopRulePlayback}
                    showPointModal={showPointModalRule}
                    hidePointModal={hidePointModalRule}
                    onSelectChange={onSelectChange}
                    selectedIds={this.props.selectedIds}
                    pointData={this.props.pointData}
                    bShowTimeShaft={this.props.bShowTimeShaft}
                />
                <FaultHandleView
                    visible={WorkerOrderVisible}
                    onCancel={this.closeWorkerOrderModal}
                />

                {modal.type === modalTypes.AI_CHAT_MODAL && (
                    <div style={{
                        position: 'absolute',
                        top: `300px`,
                        left: `900px`,
                        zIndex: '9099',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'white', // 垂直居中对齐
                        borderBottomLeftRadius: '10px',
                        borderBottomRightRadius: '10px',
                        boxShadow: '100px 100px 100px 100px rgba(0, 0, 0, 0.9);',
                    }}>
                        <div>
                            <ChatComponent
                                {...this.props}
                                showRelationModal={() => { }}
                                showInput={modal.type === modalTypes.AI_CHAT_MODAL}

                                setShowInput={(show) => this.handleAIChatModalVisible(show)}
                            />

                        </div>
                    </div>)
                }

                {/*layout中的模态框*/}
                <UnifyModal
                    conditionDict={conditionDict}
                    operateData={operateData}
                    operateIsLoading={operateIsLoading}
                    operateModalVisible={operateModalVisible}
                    switchHide={switchHide}
                    operateSwitch={operateSwitch}
                    checkboxSetting={checkboxSetting}
                    checkboxHide={checkboxHide}
                />
                {/* 重新连接模态框  */}
                <ReconnectionView
                    resetFailedTime={resetFailedTime}
                    reconnectModal={reconnectModal}
                    parmsDict={parmsDict}
                    hide={hide}
                />
                {/*点趋势模态框 */}
                {/* <TrendView
                    tendencyVisible ={tendencyVisible}
                    tendencyData = {tendencyData}
                    handleCancel = {hideTendencyModal}
           /> */}
                <GuaranteeAddView
                    createGuarantee={createGuarantee}
                    Guarantee={Guarantee}
                    RepairData={RepairData}
                    parmsDict={parmsDict}
                />
                <GuaranteeView
                    SeachGuarantee={SeachGuarantee}
                    SeachGuaranteeVisiable={SeachGuaranteeVisiable}
                    SeachGuaranteeSourceData={SeachGuaranteeSourceData}
                    GuaranteeFixid={GuaranteeFixid}
                />
                <GuaranteeSearchView
                    ViewMessage={ViewMessage}
                    ViewDisplay={ViewDisplay}
                    GuaranteeFixid={GuaranteeFixid}
                    SeachGuaranteeSourceData={SeachGuaranteeSourceData}
                />
                <WeatherHistoryModal
                    visible={modal.type === modalTypes.WEATHERHISTORY_MODAL}
                    onCancel={hideModal}
                />
                {/*报修管理模态框*/}
                {/* <RepairManageModelView
                    visible={modal.type === modalTypes.REPAIR_MANAGEMENT_MODAL}
                    onCancel={ hideModal }
                    RepairDataAction = {RepairDataAction}
                    RepairManageData = {RepairManageData}
                    viewExperience = {viewExperience}
                    ViewMessage = {ViewMessage}
                    getRepairData={getRepairData}
                /> */}
                <EnergyPriceModal
                    visible={this.state.energyPriceVisible}
                    handleCancel={this.closeEnergyPriceModal}
                />
                <CommandSurveillanceModal
                    visible={modal.type === modalTypes.COMMAND_SURVEILLANCE_MODAL}
                    onCancel={hideModal}
                />

                {
                    this.state.changePwdModalVisible ?
                        <WrappedChangePwdModal
                            handleHide={() => this.setState({ changePwdModalVisible: false })}
                            data={this.state.userName}
                        /> : null
                }
            </div>

        );
    }
}
LayoutView.propTypes = {};

export default LayoutView;


