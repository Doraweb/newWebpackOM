import React from 'react'
import { Modal, Button, Spin, Alert, Dropdown, Menu, Popover, Icon } from 'antd'
import http from '../../../common/http';
import s from './LayoutView.css';
import moment from 'moment';
import ModelText from '../../observer/components/core/entities/modelText';
import EditModeEnvModalView from './EditModeEnvModalView';
import appConfig from '../../../common/appConfig';
const language = appConfig.language

const MenuItem = Menu.Item;

class ModeButtonsListView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modeInfo: {},
            editModeEnvVisible: false
        }

        this.showModeList = this.showModeList.bind(this);
        this.getCurrentMode = this.getCurrentMode.bind(this);
        this.getMenuMode = this.getMenuMode.bind(this);
        this.getMenuItem = this.getMenuItem.bind(this);
        this.addModeToCalendar = this.addModeToCalendar.bind(this);
        this.modeControlOperation = this.modeControlOperation.bind(this);
        this.manualMode = this.manualMode.bind(this);
        this.getManalMenuItem = this.getManalMenuItem.bind(this);
        this.showEditModeEnvModal = this.showEditModeEnvModal.bind(this);
    }

    manualMode(list) {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            let flag = 0
            if (localStorage.getItem('projectRightsDefine') != undefined) {
                let modeRights = JSON.parse(localStorage.getItem('projectRightsDefine')).modeRights
                for (let item in modeRights) {
                    if (item == list.type) {
                        if (modeRights[item].blockControlUsers && modeRights[item].blockControlUsers[0] != undefined) {
                            modeRights[item].blockControlUsers.map(item2 => {
                                if (JSON.parse(window.localStorage.getItem('userData')).name == item2) {
                                    flag = 1
                                    Modal.info({
                                        title: language == 'en' ? 'Reminder' : '提示',
                                        content: language == 'en' ? 'Insufficient User Permissions' : '用户权限不足'
                                    })
                                }
                            })
                        }
                    }
                }
            }
            if (flag == 0) {
                Modal.confirm({
                    title: language == 'en' ? 'No mode bound' : '无模式',
                    content: language == 'en' ?
                        `Are you sure you want to switch the ${list.name} operation mode to no mode? Note that the current ${list.name} operation mode will be cleared after the switch.`
                        : `是否确认将${list.name}运行模式切换为无模式，注意切换后会清除当前${list.name}运行模式。`,
                    onOk: () => {
                        for (let i = 0; i < list.modeList.length; i++) {
                            if (list.modeList[i].active === 1)
                                var modeId = list.modeList[i].modeId
                        }
                        http.post('/calendar/removeModeFromCalendar', {
                            modeId: modeId,
                            date: moment().locale('zh-cn').format('YYYY-MM-DD'),
                            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
                            onduty: appConfig.onduty,
                            cloudUserId: appConfig.cloudUser.cloudUserId,
                            projectId: appConfig.projectId
                        }).then(
                            data => {
                                if (!data.err) {
                                    //主动更新一次模式列表内容
                                    this.props.getModeButtonsList()
                                    //写入操作记录
                                    this.modeControlOperation(list.name)
                                    //修改模式后，主动更新日历界面
                                    this.props.loadingCalendar(true)
                                    this.props.getAllCalendarWithMode(moment())
                                } else {
                                    Modal.error({
                                        title: language == 'en' ? 'Alert' : '警告',
                                        content: language == 'en' ? 'Switch Failed' : '切换失败'
                                    })
                                }
                            }
                        ).catch(
                            () => {

                            }
                        )
                    }
                })
            }
        } else {
            Modal.info({
                title: language == 'en' ? 'Reminder' : '提示',
                content: language == 'en' ? 'Insufficient User Permissions' : '用户权限不足'
            })
        }
    }


    modeControlOperation(typeModeName, modeName = language == 'en' ? 'No mode bound' : "无模式") {
        //增加操作记录
        http.post('/operationRecord/add', {
            "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                JSON.parse(localStorage.getItem('userInfo')).name : '',
            "content": `${typeModeName}运行模式切换为：${modeName}`,
            "address": ''
        }).then(
            data => {

            }
        )
    }

    addModeToCalendar(list, modeInfo) {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            let flag = 0
            if (localStorage.getItem('projectRightsDefine') != undefined) {
                let modeRights = JSON.parse(localStorage.getItem('projectRightsDefine')).modeRights
                for (let item in modeRights) {
                    if (item == list.type) {
                        if (modeRights[item].blockControlUsers && modeRights[item].blockControlUsers[0] != undefined) {
                            modeRights[item].blockControlUsers.map(item2 => {
                                if (JSON.parse(window.localStorage.getItem('userData')).name == item2) {
                                    flag = 1
                                    Modal.info({
                                        title: language == 'en' ? 'Reminder' : '提示',
                                        content: language == 'en' ? 'Insufficient User Permissions' : '用户权限不足'
                                    })
                                }
                            })
                        }
                    }
                }
            }
            if (flag == 0) {
                Modal.confirm({
                    title: language == 'en' ? 'Mode Switch' : '模式切换',
                    content: language == 'en' ?
                        `Are you sure you want to switch the ${list.name} operation mode to ${modeInfo.name}? Please note that switching may trigger device actions.` :
                        `是否确认将${list.name}运行模式切换为${modeInfo.name}，注意切换后可能会产生设备动作。`,
                    onOk: () => {
                        http.post('/calendar/addModeToCalendar', {
                            modeId: modeInfo.modeId,
                            date: moment().locale('zh-cn').format('YYYY-MM-DD'),
                            type: modeInfo.type,
                            creator: modeInfo.creator,
                            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
                            onduty: appConfig.onduty,
                            cloudUserId: appConfig.cloudUser.cloudUserId,
                            projectId: appConfig.projectId
                        }).then(
                            data => {
                                if (!data.err) {
                                    //主动更新一次模式列表内容
                                    this.props.getModeButtonsList()
                                    //写入操作记录
                                    this.modeControlOperation(list.name, modeInfo.name)
                                    //修改模式后，主动更新日历界面
                                    this.props.loadingCalendar(true)
                                    this.props.getAllCalendarWithMode(moment())
                                } else {
                                    Modal.error({
                                        title: language == 'en' ? 'Alert' : '警告',
                                        content: language == 'en' ? 'Switch Failed' : '切换失败'
                                    })
                                }
                            }
                        ).catch(
                            () => {

                            }
                        )
                    }
                })
            }
        } else {
            Modal.info({
                title: language == 'en' ? 'Reminder' : '提示',
                content: language == 'en' ? 'Insufficient User Permissions' : '用户权限不足'
            })
        }
    }

    onContextMenu = (e, id) => {
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
        e.offsetX = e.clientX - 5
        e.offsetY = e.clientY - 80

        let name = 'dom_system_mode_of_sys' + id
        http.post('/analysis/get_point_info_from_s3db', {
            "pointList": [name],
            "lan":language
        }).then(
            data => {
                if (data.err == 0) {
                    model.description = data.data[name].description
                    model.idCom = data.data[name].name
                    model.value = data.data[name].value
                    model.sourceType = data.data[name].sourceType
                    model.showModal(e, isInfo, widthScale, heightScale)
                } else {
                    message.error(language == 'en' ? 'Data Request Failed' : '数据请求失败')
                }
            })
    }

    getMenuItem(menuList, modeGroup) {
        return menuList.map((item, i) => {
            if (item.active === 1) {
                if (item.description != '') {
                    return (
                        <MenuItem key={i}>
                            <Popover placement="right" content={(<pre style={{ backgroundColor: "#29304A" }}>{item.description}</pre>)} >
                                <span style={{ display: 'inline-block', width: '20px' }} >
                                    {item.modeId}
                                </span>
                                <Button type="primary" style={{ height: '100%', width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '80%' : '90%' }} onClick={() => { this.addModeToCalendar(modeGroup, item) }}>{item.name}</Button>
                                {
                                    JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                        <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: '3%'
                                            }}
                                            onClick={() => { this.showEditModeEnvModal(item) }}
                                        ></Icon>
                                        :
                                        ''
                                }
                            </Popover>

                        </MenuItem>
                    )
                } else {
                    return (<MenuItem key={i}>
                        <span style={{ display: 'inline-block', width: '20px' }} >
                            {item.modeId}
                        </span>
                        <Button type="primary" style={{ height: '100%', width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '81%' : '90%' }} onClick={() => { this.addModeToCalendar(modeGroup, item) }} >{item.name}</Button>
                        {
                            JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                <Icon
                                    type="edit"
                                    style={{
                                        cursor: 'pointer',
                                        marginLeft: '3%'
                                    }}
                                    onClick={() => { this.showEditModeEnvModal(item) }}
                                ></Icon>
                                :
                                ''
                        }
                    </MenuItem>)
                }
            } else {
                if (item.description != '') {
                    return (
                        <MenuItem key={i}>
                            <span style={{ display: 'inline-block', width: '20px' }} >
                                {item.modeId}
                            </span>
                            <Popover placement="right" content={(<pre style={{ backgroundColor: "#29304A" }}>{item.description}</pre>)} >
                                <Button style={{ height: '100%', width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '81%' : '90%' }} onClick={() => { this.addModeToCalendar(modeGroup, item) }} >{item.name}</Button>

                                {
                                    JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                        <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: '3%'
                                            }}
                                            onClick={() => { this.showEditModeEnvModal(item) }}
                                        ></Icon>
                                        :
                                        ''
                                }
                            </Popover>
                        </MenuItem>
                    )
                } else {
                    return (
                        <MenuItem key={i}>
                            <span style={{ display: 'inline-block', width: '20px' }} >
                                {item.modeId}
                            </span>
                            <Button
                                style={{
                                    height: '100%',
                                    width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '81%' : '90%'
                                }}
                                onClick={() => { this.addModeToCalendar(modeGroup, item) }}
                            >{item.name}</Button>
                            {
                                JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                    <Icon
                                        type="edit"
                                        style={{
                                            cursor: 'pointer',
                                            marginLeft: '3%'
                                        }}
                                        onClick={() => { this.showEditModeEnvModal(item) }}
                                    ></Icon>
                                    :
                                    ''
                            }
                        </MenuItem>
                    )
                }
            }
        })
    }

    getManalMenuItem(menuList, modeGroup) {
        return menuList.map((item, i) => {
            if (item.active === 1) {
                return (<MenuItem key={menuList.length}>
                    <Button style={{ height: '100%', width: '100%', color: 'rgb(201,201,201)' }} onClick={() => { this.manualMode(modeGroup) }}>{
                        language == 'en' ? 'No mode bound' : '无模式'
                    }</Button>
                </MenuItem>
                )
            } else {
                if (i == menuList.length - 1) {
                    return (
                        <MenuItem key={menuList.length}>
                            <Button type="primary" style={{ height: '100%', width: '100%', color: 'rgb(201,201,201)' }} onClick={() => { this.manualMode(modeGroup) }}>{
                                language == 'en' ? 'No mode bound' : '无模式'
                            }</Button>
                        </MenuItem>
                    )
                }


            }
        })
    }

    getMenuMode(modeGroup) {
        if (modeGroup.modeList.length != 0) {
            return (
                <Menu>
                    {this.getMenuItem(modeGroup.modeList, modeGroup)}
                    {this.getManalMenuItem(modeGroup.modeList, modeGroup)}
                </Menu>
            )
        }
    }

    getCurrentMode(modeGroup) {
        let button = (

            <Button
                style={{ borderRadius: '5px', marginRight: '15px', color: 'rgb(201,201,201)', verticalAlign: 'super' }}
                onContextMenu={(e) => this.onContextMenu(e, modeGroup.type)}>
                <span className={s['footer-button-span']}>
                    {modeGroup.name}
                </span>
                {
                    language == 'en' ? 'No mode bound' : '无模式'
                }
            </Button>
        )
        if (modeGroup.modeList.length != 0) {
            modeGroup.modeList.forEach((item, i) => {
                if (item.active === 1) {
                    button = (<Button
                        style={{ borderRadius: '5px', marginRight: '15px', verticalAlign: 'super' }}
                        onContextMenu={(e) => this.onContextMenu(e, modeGroup.type)}>
                        <span className={s['footer-button-span']}>
                            {modeGroup.name}
                        </span>
                        {item.name}
                    </Button>)
                }
            })
        }
        return button
    }

    showModeList() {
        if (this.props.modeButtonsList.length != 0) {
            return this.props.modeButtonsList.map(group => {
                let flag = 0
                if (localStorage.getItem('projectRightsDefine') != undefined) {
                    let modeRights = JSON.parse(localStorage.getItem('projectRightsDefine')).modeRights
                    for (let item in modeRights) {
                        if (item == group.type) {
                            if (modeRights[item].blockVisitUsers && modeRights[item].blockVisitUsers[0] != undefined) {
                                modeRights[item].blockVisitUsers.map(item2 => {
                                    if (JSON.parse(window.localStorage.getItem('userData')).name == item2) {
                                        flag = 1
                                    }
                                })
                            }
                        }
                    }
                }
                if (flag == 0) {
                    return (<Dropdown overlay={this.getMenuMode(group)} trigger={['click']}>
                        {this.getCurrentMode(group)}
                    </Dropdown>)
                }
            })
        }
    }

    //跳转模式管理弹框
    showEditModeEnvModal(modeInfo) {
        this.setState({
            modeInfo: modeInfo,
            editModeEnvVisible: true
        })
    }

    handleCancelModeEnvModal = () => {
        this.setState({
            modeInfo: {},
            editModeEnvVisible: false
        })
    }

    render() {
        return (
            <div>
                {this.showModeList()}
                <EditModeEnvModalView
                    visible={this.state.editModeEnvVisible}
                    handleCancel={this.handleCancelModeEnvModal}
                    modeInfo={this.state.modeInfo}
                />
            </div>
        )
    }

}

export default ModeButtonsListView