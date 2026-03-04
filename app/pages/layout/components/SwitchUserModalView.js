/**
 * 登录页
 */

import React from 'react';
import { Alert, Checkbox, Icon, Modal } from 'antd';

import http from '../../../common/http';
import cx from 'classnames';
import s from './/SwitchUserModalView.css';
import { addOperation } from '../../../common/utils'

import LoginForm from './SwitchUserFormView';
import appConfig from '../../../common/appConfig';
const language = appConfig.language

let str, toggleModalClass;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'warning-config-best'
} else {
    str = ''
}
if (localStorage.getItem('serverOmd') == "persagy") {
    toggleModalClass = 'persagy-switchUser-modal';
}

class SwitchUser extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginInfo: this.getInitLoginInfo(),
            error: {
                show: false,
                msg: ''
            },
            loading: false,
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.showError = this.showError.bind(this);
        this.hideError = this.hideError.bind(this);
        this.toggleIsRememeber = this.toggleIsRememeber.bind(this);
        this.doLogin = this.doLogin.bind(this);
        this.toggleLoading = this.toggleLoading.bind(this);
        this.handleCheckUser = this.handleCheckUser.bind(this)
    }

    componentDidMount() {
        if (JSON.parse(localStorage.getItem('accountManageConfig')) && JSON.parse(localStorage.getItem('accountManageConfig')).remember_pwd_enable === 0) {
            this.setState({
                loginInfo: {
                    name: '',
                    pwd: '',
                    isRemember: false
                }
            });
        }
    }

    getInitLoginInfo() {
        let userInfo = localStorage.getItem('userInfo')
        if (JSON.parse(localStorage.getItem('accountManageConfig')) && JSON.parse(localStorage.getItem('accountManageConfig')).remember_pwd_enable === 0) {
            userInfo = false
        }
        // 查看浏览器是否存有用户信息
        return userInfo ?
            JSON.parse(userInfo) : {
                name: '',
                pwd: '',
                isRemember: false
            }
    }

    doLogin(data) {
        return http.post('/login', data);

    }

    toggleLoading() {
        this.setState({
            loading: !this.state.loading
        });
    }

    showError(code) {
        if (code === 1) {
            this.setState({
                error: {
                    show: true,
                    msg: '用户名或密码错误！'
                }
            });
        }
    }

    hideError() {
        this.setState({
            error: {
                show: false,
                msg: ''
            }
        });
    }

    // 检测cx用户
    handleCheckUser(name, pwd, isRemember, isOnline, originalName) {
        if (name === 'cx' && pwd === 'DOM.cloud-2016') {
            if (isOnline == true) {
                localStorage.setItem("isOnline", 1)
            } else {
                localStorage.removeItem("isOnline")
            }
            window.localStorage.setItem('userData', JSON.stringify({
                id: -1,
                name: name,
                role: 4
            }));
            appConfig.userData = {
                id: -1,
                name: name,
                role: 4
            }
            if (isRemember) {
                // 将用户名和密码存储到 localStorage 中
                window.localStorage.setItem('userInfo', JSON.stringify({
                    name: name,
                    pwd: pwd,
                    isRemember: isRemember
                }));

            } else {
                window.localStorage.setItem('userInfo', JSON.stringify({
                    name: name,
                    pwd: "",
                    isRemember: false
                }))
            }
            // login success
            addOperation('/operationRecord/addLogin', {
                "userName": originalName,
                "type": 0,
                "address": '',
                "lang": "zh-cn"
            }, '用户登录记录失败')
            setTimeout(function () {
                addOperation('/operationRecord/addLogin', {
                    "userName": name,
                    "type": 1,
                    "address": '',
                    "lang": "zh-cn"
                }, '用户登录记录失败')
            }, 1000)
            // hide loading
            this.toggleLoading()
            this.props.handleHide();
            this.props.initialize();
            return false
        }
        return true
    }

    // 检测guest用户
    handleCheckGuestUser(name, pwd, isRemember, originalName) {
        if (name === 'guest' && pwd === 'guest') {
            // 将返回的用户信息（权限，ID，名称）放到 localStorage 里
            window.localStorage.setItem('userData', JSON.stringify({
                id: 9999,
                name: name,
                role: 1
            }));
            appConfig.userData = {
                id: 9999,
                name: name,
                role: 1
            }
            if (isRemember) {
                // 将用户名和密码存储到 localStorage 中
                window.localStorage.setItem('userInfo', JSON.stringify({
                    name: name,
                    pwd: pwd,
                    isRemember: isRemember
                }));
            } else {
                window.localStorage.setItem('userInfo', JSON.stringify({
                    name: name,
                    pwd: "",
                    isRemember: false
                }))
            }
            // login success
            addOperation('/operationRecord/addLogin', {
                "userName": originalName,
                "type": 0,
                "address": '',
                "lang": "zh-cn"
            }, 
            '用户登录记录失败')
            setTimeout(function () {
                addOperation('/operationRecord/addLogin', {
                    "userName": name,
                    "type": 1,
                    "address": '',
                    "lang": "zh-cn"
                }, '用户登录记录失败')
            }, 1000)
            // hide loading
            this.toggleLoading()
            this.props.handleHide();
            this.props.initialize();
            return false
        }
        return true
    }

    onSubmit({ name, pwd, isRemember, isOnline }) {

        let _this = this

        this.setState({
            loading: true
        }, () => {
            let originalName = JSON.parse(localStorage.getItem('userData')).name
            if (!this.handleCheckUser(name, pwd, isRemember, isOnline, originalName)) return false;
            if (!this.handleCheckGuestUser(name, pwd, isRemember, originalName)) return false;
            // login valid
            this.doLogin({
                name: name,
                pwd: pwd
            }).then(
                data => {
                    // hide loading
                    this.toggleLoading();
                    if (data.err) {
                        Modal.error({
                            title: '信息提示',
                            content: data.msg,
                        });
                        this.showError(data.msg);
                    } else if (!data.err) {
                        if (data.token) {
                            localStorage.setItem('token', data.token)
                            appConfig.token = data.token
                        } else {
                            localStorage.removeItem('token')
                            appConfig.token = ''
                        }
                        if (isOnline == true) {
                            localStorage.setItem("isOnline", 1)
                        } else {
                            localStorage.removeItem("isOnline")
                        }
                        addOperation('/operationRecord/addLogin', {
                            "userName": originalName,
                            "type": 0,   //1是登入，0是登出
                            "address": '',
                            "lang": "zh-cn"
                        }, '用户登录记录失败')
                        setTimeout(function () {
                            addOperation('/operationRecord/addLogin', {
                                "userName": name,
                                "type": 1,
                                "address": '',
                                "lang": "zh-cn"
                            }, '用户登录记录失败')
                        }, 1000)
                        this.hideError();
                        // 将返回的用户信息（权限，ID，名称）放到 localStorage 里
                        window.localStorage.setItem('userData', JSON.stringify({
                            id: data.data.id,
                            name: data.data.name,
                            role: data.data.role
                        }));
                        appConfig.userData = {
                            id: data.data.id,
                            name: data.data.name,
                            role: data.data.role
                        }
                        //保存热备信息
                        if (data.standby != undefined) {
                            window.localStorage.setItem('standby', JSON.stringify(data.standby));
                        }

                        if (isRemember || data.standby != undefined) {
                            // 将用户名和密码存储到 localStorage 中
                            window.localStorage.setItem('userInfo', JSON.stringify({
                                name: name,
                                pwd: pwd,
                                isRemember: isRemember
                            }));
                            this.props.handleHide();
                            this.props.initialize();
                            //window.sessionStorage.setItem('userData',JSON.stringify(data.data));
                        } else {
                            window.localStorage.setItem('userInfo', JSON.stringify({
                                name: name,
                                pwd: "",
                                isRemember: false
                            }))
                            this.props.handleHide();
                            this.props.initialize();
                        }
                    }
                }
            ).catch(
                err => {
                    if (this.state.loading) {
                        this.toggleLoading();
                    }
                }
            );
        })


    }

    toggleIsRememeber() {
        let loginInfo = this.state.loginInfo;
        if (JSON.parse(localStorage.getItem('accountManageConfig')) && JSON.parse(localStorage.getItem('accountManageConfig')).remember_pwd_enable === 0) {
            this.setState({
                loginInfo: {
                    name: '',
                    pwd: '',
                    isRemember: false
                }
            });
        } else {
            //切换记住密码选项
            this.setState({
                loginInfo: Object.assign({}, loginInfo, { isRemember: !loginInfo.isRemember })
            });
        }
    }


    render() {
        const { loading, loginInfo } = this.state;
        return (
            <div >
                {
                    this.props.visible ?
                        <Modal
                            className={toggleModalClass}
                            title={language == 'en' ? 'Switch User' : '切换用户'}
                            width={400}
                            visible={this.props.visible}
                            onCancel={this.props.handleHide}
                            maskClosable={false}
                            footer={null}
                            wrapClassName={str}
                        >
                            <LoginForm
                                loginInfo={loginInfo}
                                loading={loading}
                                onSubmit={this.onSubmit}
                                toggleIsRememeberBtn={this.toggleIsRememeber}
                            />
                        </Modal>
                        :
                        ''
                }

            </div>
        );
    }
}
export default SwitchUser;

