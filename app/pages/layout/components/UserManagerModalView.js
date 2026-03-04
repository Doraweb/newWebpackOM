/**
 * 用户管理模态框
 */
import React from 'react';
import { Button, Modal, Layout, Table, Icon, Tooltip, message, Select, Form, Input } from 'antd';
import s from './UserManagerModalView.css';

import { userRoles, userRoleNames } from '../../../common/enum';
import http from '../../../common/http';
import appConfig from '../../../common/appConfig';
const { Sider, Content, Header } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;
const language = appConfig.language

let str, toggleModalClass, toggleTableClass, btnStyle;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'user-manager-modal-wrap-best'
} else {
    str = 'user-manager-modal-wrap'
}
if (localStorage.getItem('serverOmd') == "persagy") {
    toggleModalClass = 'persagy-userManage-Modal';
    toggleTableClass = 'persagy-userManage-table';
    btnStyle = {
        background: "rgba(255,255,255,1)",
        border: '1px solid rgba(195,198,203,1)',
        color: "rgba(38,38,38,1)",
        borderRadius: '4px',
        fontSize: "12px",
        fontFamily: 'MicrosoftYaHei'
    }
} else {
    toggleModalClass = 'user-modify-modal-wrap';
}

class UserAddModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmDirty: false,
            loading: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkConfirm = this.checkConfirm.bind(this);
        this.checkPwd = this.checkPwd.bind(this);
        this.handleConfirmBlur = this.handleConfirmBlur.bind(this);
    }
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                http.post('/user/add', values).then(
                    result => {
                        this.setState({ loading: false });
                        if (result.status === 'OK') {
                            message.success(language == 'en' ? 'Successfully added!' : '新增成功！', 2.5);
                            let userid = result.data.userid;
                            this.props.handleAddUser({ userid, ...values, username_zh: values['userfullname'] });
                        } else {
                            message.error(result.msg || 'Failed to add!', 2.5);
                        }
                    }
                ).catch(
                    err => {
                        this.setState({ loading: false });
                    }
                )
            }
        });
    }
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }
    checkConfirm(rule, value, callback) {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    }
    checkPwd(rule, value, callback) {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('userpwd')) {
            callback(language == 'en' ? 'The passwords entered do not match!' : '两次输入的密码不一致!');
        } else {
            callback();
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                span: 9
            },
            wrapperCol: {
                span: 14
            },
        };

        let role = JSON.parse(window.localStorage.getItem('userData')).role

        return (
            <Modal
                className={toggleModalClass}
                wrapClassName="user-add-modal-wrap"
                title={language == 'en' ? 'Add User' : "新增用户"}
                width={400}
                visible={true}
                confirmLoading={this.state.loading}
                onCancel={this.props.handleHide}
                onOk={this.handleSubmit}
                maskClosable={false}
                okText={language == 'en' ? 'Add' : "新增"}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'UserName' : '用户名'}
                        hasFeedback
                        style={{ marginBottom: 10 }}
                    >
                        {getFieldDecorator('username', {
                            rules: [{
                                required: true, message: language == 'en' ? 'Username cannot be empty!' : '用户名不能为空！',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Password' : '密码'}
                        hasFeedback
                        style={{ marginBottom: 10 }}
                    >
                        {getFieldDecorator('userpwd', {
                            rules: [{
                                required: true, message: language == 'en' ? 'Password cannot be empty!' : '密码不能为空!',
                            }, {
                                validator: this.checkConfirm
                            }],
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Confirm Password' : '确认密码'}
                        hasFeedback
                        style={{ marginBottom: 10 }}
                    >
                        {getFieldDecorator('confirm', {
                            rules: [{
                                required: true, message: language == 'en' ? '' : '请再输入一次密码!',
                            }, {
                                validator: this.checkPwd
                            }],
                        })(
                            <Input type="password" onBlur={this.handleConfirmBlur} />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Level' : '角色'}
                        hasFeedback
                        style={{ marginBottom: 10 }}
                    >
                        {getFieldDecorator('userofrole', {
                            initialValue: userRoles.VISITOR,
                            rules: [{
                                required: true, message: language == 'en' ? '' : '请选择用户角色!',
                            }],
                        })(
                            <Select>
                                <Option value={userRoles.VISITOR}>{userRoleNames[userRoles.VISITOR]}</Option>
                                <Option value={userRoles.OPERATOR} disabled={role >= 2 ? false : true}>{userRoleNames[userRoles.OPERATOR]}</Option>
                                <Option value={userRoles.ADMIN} disabled={role >= 3 ? false : true}>{userRoleNames[userRoles.ADMIN]}</Option>
                                <Option value={userRoles.DEBUG} disabled={role >= 4 ? false : true}>{userRoleNames[userRoles.DEBUG]}</Option>
                                <Option value={userRoles.HIGHDEBUG} disabled={role >= 5 ? false : true}>{userRoleNames[userRoles.HIGHDEBUG]}</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'name' : '中文名'}
                        style={{ marginBottom: 10 }}
                    >
                        {getFieldDecorator('userfullname', {
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Tel' : '手机号'}
                        style={{ marginBottom: 10 }}
                    >
                        {getFieldDecorator('usermobile', {
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Email' : "邮箱"}
                        style={{ marginBottom: 10 }}
                    >
                        {getFieldDecorator('useremail', {
                        })(
                            <Input />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}
const WrappedUserAddModal = Form.create()(UserAddModal);

class UserModifyModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                http.post('/user/modify/' + this.props.data.userid, values).then(
                    data => {
                        this.setState({ loading: false });
                        if (data.status === 'OK') {
                            message.success(language == 'en' ? 'Update Successful' : '修改成功', 2.5);
                            this.props.handleHide()
                            this.props.getUserData()
                            this.props.handleModifyUser(this.props.data.userid, values);
                        } else {
                            message.error(data.msg || language == 'en' ? 'Update Failed' : '修改失败', 2.5);
                        }
                    }
                ).catch(
                    err => {
                        this.setState({ loading: false });
                    }
                )
            }
        });
    }
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
        let role = JSON.parse(window.localStorage.getItem('userData')).role
        return (
            <Modal
                wrapClassName={toggleModalClass}
                title={language == 'en' ? 'Modify User Permissions' : "修改用户权限"}
                width={360}
                visible={true}
                onCancel={this.props.handleHide}
                onOk={this.handleSubmit}
                confirmLoading={this.state.loading}
                maskClosable={false}
                okText={language == 'en' ? 'Modify' : "修改"}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Level' : "角色"}
                        hasFeedback
                    >
                        {getFieldDecorator('userofrole', {
                            initialValue: userRoles.VISITOR,
                            rules: [{
                                required: true, message: language == 'en' ? 'Please select user level' : '请选择用户角色!',
                            }],
                        })(
                            <Select style={{ width: 205 }}>
                                <Option value={userRoles.VISITOR}>{userRoleNames[userRoles.VISITOR]}</Option>
                                <Option value={userRoles.OPERATOR} disabled={role >= 2 ? false : true}>{userRoleNames[userRoles.OPERATOR]}</Option>
                                <Option value={userRoles.ADMIN} disabled={role >= 3 ? false : true}>{userRoleNames[userRoles.ADMIN]}</Option>
                                <Option value={userRoles.DEBUG} disabled={role >= 4 ? false : true}>{userRoleNames[userRoles.DEBUG]}</Option>
                                <Option value={userRoles.HIGHDEBUG} disabled={role >= 5 ? false : true}>{userRoleNames[userRoles.HIGHDEBUG]}</Option>
                            </Select>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const WrappedUserModifyModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            userofrole: Form.createFormField({
                value: props.data.userofrole
            })
        }
    }
})(UserModifyModal);

class UserInfoModalView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
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
                http.post('/user/modify/' + this.props.data.id, {
                    usermobile: values['mobile'],
                    useremail: values['emall']
                }).then(res => {
                    if (res.status == "OK") {
                        this.setState({
                            loading: false
                        })
                        this.props.handleHide()
                        this.props.getUserData()
                        message.success(language == 'en' ? 'Saved successfully' : '保存用户联系信息成功')
                    } else {
                        this.setState({
                            loading: false
                        })
                        message.error(res.msg)
                    }
                }).catch(err => {
                    this.setState({
                        loading: false
                    })
                    message.error(language == 'en' ? 'Failed to request the user information update API' : '修改用户信息接口请求失败')
                })
            }
        });
    }
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
                wrapClassName={toggleModalClass}
                title={language == 'en' ? 'Edit User Contact Information' : "修改用户联系信息"}
                width={400}
                visible={true}
                onCancel={this.props.handleHide}
                onOk={this.handleSubmit}
                confirmLoading={this.state.loading}
                maskClosable={false}
                okText={language == 'en' ? 'Save' : "保存"}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Tel' : "手机号"}
                    >
                        {getFieldDecorator('mobile', {
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Email' : "邮箱"}
                    >
                        {getFieldDecorator('emall', {
                        })(
                            <Input />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const UserInfoModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            mobile: Form.createFormField({
                value: props.data.mobile
            }),
            emall: Form.createFormField({
                value: props.data.emall
            }),
        }
    }
})(UserInfoModalView);

class ChineseNameModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
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
                http.post('/user/modify/' + this.props.data.id, {
                    userfullname: values.userChineseName
                }).then(
                    res => {
                        this.props.handleHide()
                        this.setState({
                            loading: false
                        })
                        if (res.status == "OK") {
                            this.props.getUserData();
                            message.success(language == 'en' ? 'Saved successfully!' : '保存用户中文名成功！');
                        } else {
                            message.error(language == 'en' ? 'Save Failed!' : '保存用户中文名失败！')
                        }
                    }
                ).catch(
                    err => {
                        this.props.handleHide()
                        this.setState({
                            loading: false
                        })
                        message.error(language == 'en' ? 'Failed to request the API to save user Chinese name!' : '保存用户中文名接口请求失败！')
                    }
                )
            }
        });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                span: 9
            },
            wrapperCol: {
                span: 14
            },
        };
        return (
            <Modal
                wrapClassName={toggleModalClass}
                title={language == 'en' ? 'Edit User Chinese Name' : "修改用户中文名"}
                width={400}
                visible={true}
                onCancel={this.props.handleHide}
                onOk={this.handleSubmit}
                confirmLoading={this.state.loading}
                maskClosable={false}
                okText={language == 'en' ? 'Save' : "保存"}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Username' : "账号"}
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
                        label={language == 'en' ? 'Former Name' : "当前中文名"}
                        hasFeedback
                    >
                        {getFieldDecorator('userNowChineseName', {
                            initialValue: '',
                        })(
                            <Input disabled />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'New Name' : "新中文名"}
                        hasFeedback
                    >
                        {getFieldDecorator('userChineseName', {
                            initialValue: '',
                            rules: [{
                                required: true, message: language == 'en' ? 'Please enter the new name!' : '请填写用户新的中文名!',
                            }],
                        })(
                            <Input placeholder={language == 'en' ? 'Please enter the name' : "请填写用户中文名"} />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const WrappedChineseNameModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            username: Form.createFormField({
                value: props.data.username
            }),
            userNowChineseName: Form.createFormField({
                value: props.data.username_zh
            }),
        }
    }
})(ChineseNameModal);

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
                            message.success(language == 'en' ? 'Successfully Updated' : '修改用户密码成功！')
                        } else {
                            message.error(language == 'en' ? 'Update Failed' : '修改用户密码失败！')
                        }
                    }
                ).catch(
                    err => {
                        this.props.handleHide()
                        this.setState({
                            loading: false
                        })
                        message.error(language == 'en' ? 'Failed to request the API to update user password!' : '修改用户密码接口请求失败！')
                    }
                )
            }
        });
    }

    handleConfirmBlur = e => {
        const { value } = e.target;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('newPassword')) {
            callback(language == 'en' ? 'The passwords entered do not match!' : '两次输入的密码不一致！');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                span: 9
            },
            wrapperCol: {
                span: 14
            },
        };
        return (
            <Modal
                wrapClassName={toggleModalClass}
                title={language == 'en' ? 'Change User Password' : "修改用户密码"}
                width={400}
                visible={true}
                onCancel={this.props.handleHide}
                onOk={this.handleSubmit}
                confirmLoading={this.state.loading}
                maskClosable={false}
                okText={language == 'en' ? 'Confirm' : "确认"}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Username' : "账号"}
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
                        label={language == 'en' ? 'New Password' : "新密码"}
                        hasFeedback
                    >
                        {getFieldDecorator('newPassword', {
                            initialValue: '',
                            rules: [{
                                required: true, message: language == 'en' ? 'Please enter a new password!' : '请填写新密码!',
                            }, {
                                validator: this.validateToNextPassword,
                            }],
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={language == 'en' ? 'Re-enter Password' : "再次输入"}
                        hasFeedback
                    >
                        {getFieldDecorator('newPasswordRepeat', {
                            initialValue: '',
                            rules: [{
                                required: true, message: language == 'en' ? 'Re-enter Password' : '请再次填写新密码!',
                            },
                            {
                                validator: this.compareToFirstPassword,
                            }],
                        })(
                            <Input type="password" onBlur={this.handleConfirmBlur} />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const WrappedChangePwdModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            username: Form.createFormField({
                value: props.data
            })
        }
    }
})(ChangePwdModal);

class ValueList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedIds: [],
            value: this.props.value || [],
            modal: this.props.modal
        };

        this.valueTableColumns = [{
            key: 'username',
            dataIndex: 'username'
        }, {
            key: 'username_zh',
            dataIndex: 'username_zh'
        }, {
            key: 'userofrole',
            render: (text, record, index) => userRoleNames[record['userofrole']],
        }, {
            key: 'usermobile',
            dataIndex: 'usermobile'
        }, {
            key: 'useremail',
            dataIndex: 'useremail'
        }, {
            key: 'tools',
            width: 130,
            render: (text, record, index) => (
                <span style={{ fontSize: '16px' }}>
                    <Tooltip title={language == 'en' ? 'Modify Permissions' : "修改权限"}>
                        <Icon
                            type="edit"
                            style={{
                                cursor: 'pointer',
                                marginRight: '8px'
                            }}
                            onClick={() => {
                                if (JSON.parse(window.localStorage.getItem('userData')).role >= record['userofrole']) {
                                    this.showUserModifyModal(record['userid'])
                                } else {
                                    Modal.info({
                                        title: language == 'en' ? 'Insufficient Permissions' : '权限不足',
                                        content: language == 'en' ? 'You cannot perform actions on accounts with higher privileges than your own!' : '不可以对高于自身权限的账号进行操作！'
                                    })
                                }
                            }}
                        ></Icon>
                    </Tooltip>
                    <Tooltip title={language == 'en' ? 'Change Password' : "修改密码"}>
                        <Icon
                            type="unlock"
                            style={{
                                cursor: 'pointer',
                                marginRight: '8px'
                            }}
                            onClick={() => {
                                if (JSON.parse(window.localStorage.getItem('userData')).role >= record['userofrole']) {
                                    this.showChangePwdModal(record['username'])
                                } else {
                                    Modal.info({
                                        title: language == 'en' ? 'Insufficient Permissions' : '权限不足',
                                        content: language == 'en' ? 'You cannot perform actions on accounts with higher privileges than your own!' : '不可以对高于自身权限的账号进行操作！'
                                    })
                                }
                            }}
                        ></Icon>
                    </Tooltip>
                    <Tooltip title={language == 'en' ? 'Change Name' : "修改中文名"}>
                        <Icon
                            type="user-add"
                            style={{
                                cursor: 'pointer',
                                marginRight: '8px'
                            }}
                            onClick={() => {
                                if (JSON.parse(window.localStorage.getItem('userData')).role >= record['userofrole']) {
                                    this.showChineseNameModal(record['userid'], record['username'], record['username_zh'])
                                } else {
                                    Modal.info({
                                        title: language == 'en' ? 'Insufficient Permissions' : '权限不足',
                                        content: language == 'en' ? 'You cannot perform actions on accounts with higher privileges than your own!' : '不可以对高于自身权限的账号进行操作！'
                                    })
                                }
                            }}
                        ></Icon>
                    </Tooltip>
                    <Tooltip title={language == 'en' ? 'Edit Contact Info' : "修改用户联系信息"}>
                        <Icon
                            type="phone"
                            style={{
                                cursor: 'pointer',
                                marginRight: '8px'
                            }}
                            onClick={() => {
                                if (JSON.parse(window.localStorage.getItem('userData')).role >= record['userofrole']) {
                                    this.showUserInfoModal(record['userid'], record['usermobile'], record['useremail'])
                                } else {
                                    Modal.info({
                                        title: language == 'en' ? 'Insufficient Permissions' : '权限不足',
                                        content: language == 'en' ? 'You cannot perform actions on accounts with higher privileges than your own!' : '不可以对高于自身权限的账号进行操作！'
                                    })
                                }
                            }}
                        ></Icon>
                    </Tooltip>
                    <Tooltip title={language == 'en' ? 'Delete' : "删除"}>
                        <Icon
                            type="close"
                            style={{
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                this.handleDeleteUsers(record['userid'])
                            }}
                        ></Icon>
                    </Tooltip>
                </span>
            )
        }];

        this.handleSelectRow = this.handleSelectRow.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.handleAddUser = this.handleAddUser.bind(this);
        this.showUserAddModal = this.showUserAddModal.bind(this);
        this.showChangePwdModal = this.showChangePwdModal.bind(this);
    }
    static get defaultProps() {
        return {
            modal: {
                type: null,
                props: {}
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            selectedIds: [],
            value: nextProps.value || [],
        });
    }
    handleSelectRow(selectedRowKeys, selectedRows) {
        this.setState({
            selectedIds: selectedRowKeys
        });
    }
    showUserAddModal() {
        this.showModal('UserAddModal');
    }
    showUserModifyModal(userid) {
        let user = this.state.value.find(row => row.userid === userid)
        this.showModal('UserModifyModal', user)
    }
    showChineseNameModal(id, username, username_zh) {
        this.showModal('ChineseNameModal', { id: id, username: username, username_zh: username_zh })
    }
    showUserInfoModal(id, mobile, emall) {
        this.showModal('UserInfoModal', { id: id, mobile: mobile, emall: emall })
    }
    showChangePwdModal(username) {
        this.showModal('ChangePwdModal', username)
    }
    showModal(type, props) {
        this.setState({
            modal: {
                type,
                props
            }
        });
    }
    hideModal() {
        this.setState({
            modal: ValueList.defaultProps.modal
        });
    }
    handleAddUser(values) {
        this.setState({
            value: [...this.state.value, values]
        });
        this.hideModal();
    }
    handleModifyUser(userid, values) {
        let value = this.state.value.slice();
        value.some(row => {
            if (row['userid'] === userid) {
                Object.assign(row, values);
                return true;
            }
        });
        this.setState({
            value
        });
        this.hideModal();
    }
    handleDeleteUsers(ids) {
        if (typeof ids !== 'object') {
            ids = [ids];
        }
        if (ids.length == 0) {
            return
        }
        let role = JSON.parse(window.localStorage.getItem('userData')).role
        let roles = []
        ids.map(item => {
            this.state.value.map(item2 => {
                if (item == item2.userid) {
                    roles.push(item2.userofrole)
                }
            })
        })
        let maxRole = Math.max(...roles)
        if (maxRole > role) {
            Modal.info({
                title: language == 'en' ? 'Insufficient Permissions' : '权限不足',
                content: language == 'en' ? 'You cannot perform actions on accounts with higher privileges than your own!' : '不可以对高于自身权限的账号进行操作！'
            })
            return
        }
        Modal.confirm({
            title: language == 'en' ? 'Are you sure you want to delete?' : '确认删除',
            content: language == 'en' ? 'Are you sure you want to delete the user?' : '确认删除用户？',
            okText: language == 'en' ? 'Delete' : '删除',
            cancelText: language == 'en' ? 'Cancel' : '取消',
            onOk: () => {
                http.post('/user/del', {
                    ids: ids
                }).then(
                    data => {
                        if (data.status === 'OK') {
                            message.success(language == 'en' ? 'Deleted successfully!' : '删除成功！', 2.5);
                            this.setState({
                                value: this.state.value.filter(row => ids.indexOf(row['userid']) === -1)
                            });
                        } else {
                            message.error(data.msg || language == 'en' ? 'Deletion failed, please try again later!' : '删除失败，请稍后重试！', 2.5);
                        }
                    }
                ).catch(
                    err => {
                        this.setState({ loading: false });
                    }
                )
            }
        });
    }

    render() {
        return (
            <Layout className={s['value-list-layout']}>
                <Header className={s['value-list-header']}>
                    <Button
                        style={btnStyle}
                        className={s['dropdown-add-btn']}
                        size="small"
                        onClick={this.showUserAddModal}
                    >{language == 'en' ? 'Add' : '新增'}
                    </Button>
                    <Button
                        style={btnStyle}
                        className={s['dropdown-delete-btn']}
                        size="small"
                        onClick={() => { this.handleDeleteUsers(this.state.selectedIds) }}
                    >{language == 'en' ? 'Delete' : '删除'}</Button>
                </Header>
                <Content className={s['table-wrap']}>
                    <Table
                        className={toggleTableClass}
                        loading={this.props.loading}
                        bordered={false}
                        showHeader={false}
                        pagination={false}
                        rowKey="userid"
                        rowSelection={{
                            selectedRowKeys: this.state.selectedIds,
                            onChange: this.handleSelectRow
                        }}
                        columns={this.valueTableColumns}
                        dataSource={this.state.value}
                    />
                </Content>
                {
                    this.state.modal.type === 'UserAddModal' ? (
                        <WrappedUserAddModal
                            handleHide={this.hideModal}
                            handleAddUser={this.handleAddUser}
                            data={this.state.modal.props}
                        />
                    ) : null
                }
                {
                    this.state.modal.type === 'UserModifyModal' ? (
                        <WrappedUserModifyModal
                            handleHide={this.hideModal}
                            handleModifyUser={this.handleModifyUser}
                            data={this.state.modal.props}
                            getUserData={this.props.getUserData}
                        />
                    ) : null
                }
                {
                    this.state.modal.type === 'ChineseNameModal' ? (
                        <WrappedChineseNameModal
                            handleHide={this.hideModal}
                            data={this.state.modal.props}
                            getUserData={this.props.getUserData}
                        />
                    ) : null
                }
                {
                    this.state.modal.type === 'UserInfoModal' ? (
                        <UserInfoModal
                            handleHide={this.hideModal}
                            data={this.state.modal.props}
                            getUserData={this.props.getUserData}
                        />
                    ) : null
                }
                {
                    this.state.modal.type === 'ChangePwdModal' ? (
                        <WrappedChangePwdModal
                            handleHide={this.hideModal}
                            data={this.state.modal.props}
                        />
                    ) : null
                }
            </Layout>
        );
    }
}

class UserManagerModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableLoading: false,
            userList: [],
            loading: false
        };

    }
    static get defaultProps() {
        return {}
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            this.setState({
                tableLoading: true
            });
            this.getUserData().then(
                data => {
                    this.setState({
                        userList: data,
                        tableLoading: false
                    });
                }
            );
        }
    }

    getNewData = () => {
        this.getUserData().then(
            data => {
                this.setState({
                    userList: data,
                })
            }
        );
    }

    getUserData() {
        return http.get('/allusers').then(
            result => {
                if (result.status === 'OK') {
                    // console.log(result.data);
                    return result.data;
                } else {
                    message.error(result.msg || language == 'en' ? 'Failed to retrieve the user list' : '获取用户列表失败', 3);
                    return [];
                }
            }
        ).catch(
            err => {
                this.setState({ loading: false });
            }
        )
    }

    render() {
        return (
            <div>
                {
                    this.props.visible ?
                        <Modal
                            className={toggleModalClass}
                            wrapClassName={str}
                            title={language == 'en' ? 'User Management' : "用户管理"}
                            width={730}
                            visible={this.props.visible}
                            onCancel={this.props.handleHide}
                            maskClosable={false}
                            footer={null}
                        >
                            <ValueList
                                value={this.state.userList}
                                loading={this.state.tableLoading}
                                getUserData={this.getNewData}
                            />
                        </Modal>
                        :
                        ''
                }
            </div>

        );
    }
}

export default UserManagerModal
