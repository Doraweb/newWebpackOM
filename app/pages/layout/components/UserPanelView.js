/**
 * 用户管理面板
 */
import React from 'react';
import { Button, Popover, Row, Col, Tag, message, Modal, Icon, Form, Input } from 'antd';
import s from './UserPanelView.css';
import http from '../../../common/http'

import UserManagerModal from './UserManagerModalView';
import SwitchUserModal from './SwitchUserModalView';
import appConfig from '../../../common/appConfig';
const FormItem = Form.Item;
const language = appConfig.language
let btnStyle, tagStyle, togglePopoverClass;
if (localStorage.getItem('serverOmd') == "best") {
  btnStyle = {
    background: "#E1E1E1",
    color: "#000",
    boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
    border: 0
  }
}
if (localStorage.getItem('serverOmd') == "persagy") {
  togglePopoverClass = 'persagy-userPanel-popover';
  tagStyle = {
    borderRadius: '4px',
    fontFamily: 'MicrosoftYaHei',
    fontSize: '12px'
  }
}

// 切换用户
// const handleSwitchUser = () => {
//   Modal.confirm({
//     title: '是否确定切换用户？',
//     content: '点击“确定”按钮进行用户切换',
//     okText: '确定',
//     cancelText: '取消',
//     onOk: () => { ()=>showModal(modalTypes.SWITCH_USER_MODAL)}
//   });
// };



class UserPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowUserManagerModal: false,
      isShowSwitchUserModal: false,
      isShowUserManagerLoginModal: false,
      loading: false
    };

    this.showUserManagerModal = this.showUserManagerModal.bind(this);
    this.hideUserManagerModal = this.hideUserManagerModal.bind(this);
    this.hideUserManagerLoginModal = this.hideUserManagerLoginModal.bind(this);
    this.showSwitchUserModal = this.showSwitchUserModal.bind(this);
    this.hideSwitchUserModal = this.hideSwitchUserModal.bind(this);
    this.handleSwitch = this.handleSwitch.bind(this);
  }

  showUserManagerModal() {
    this.props.hideWrap(); //隐藏右下角的用户管理卡片      

    let userRole = JSON.parse(window.localStorage.getItem('userData')).role;
    http.post('/project/getConfig', {
      key: "account_manage_config"
    }).then(
      res => {
        if (userRole == 3 && res.data.admin_user_cud_disabled && res.data.admin_user_cud_disabled == 1) {
          Modal.warning({
            title: language === 'en' ? 'Information Prompt' : '信息提示',
            content: language === 'en' ? 'This account cannot perform operations on users!' : '此账号，无法对用户进行操作！',
          });
        } else {
          if (userRole != 1 && userRole != 2) {  //访客和操作人员不可以看到管理用户模态框
            this.setState({
              isShowUserManagerLoginModal: true
            });
          } else {
            Modal.warning({
              title: language === 'en' ? 'Information Prompt' : '信息提示',
              content: language === 'en' ? 'Non-administrator account cannot perform operations on users!' : '非管理员账号，无法对用户进行操作！',
            });
          }
        }
      }
    )

  }

  //注销用户
  handleSwitch() {
    this.props.hideWrap(); //隐藏右下角的用户管理卡片      
    Modal.confirm({
      title: language == 'en' ? 'Are you sure you want to log out?' : '是否确定登出？',
      content: '',
      onOk: () => { this.props.switchUser("guest", "guest", false) }
    });
  };

  hideUserManagerModal() {
    this.setState({
      isShowUserManagerModal: false
    });
  }

  hideUserManagerLoginModal() {
    this.setState({
      isShowUserManagerLoginModal: false
    })
  }

  showSwitchUserModal() {
    this.setState({
      isShowSwitchUserModal: true
    });
    this.props.hideWrap(); //隐藏右下角的用户管理卡片
  }

  hideSwitchUserModal() {
    this.setState({
      isShowSwitchUserModal: false
    });
  }

  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        http.post('/login', {
          name: values.User,
          pwd: values.Pwd
        }).then(
          res => {
            this.setState({ loading: false });
            if (res.err == 0) {
              this.setState({
                isShowUserManagerLoginModal: false,
                isShowUserManagerModal: true
              })
            } else {
              message.error(language === 'en' ? 'User password verification failed!' : '用户密码验证失败！');
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
        span: 16
      },
    };
    let userInfo = window.localStorage.getItem('userInfo') ?
      JSON.parse(window.localStorage.getItem('userInfo')) : {}
    let userName = userInfo ? userInfo.name : '';

    let userData = window.localStorage.getItem('userData') ?
      JSON.parse(window.localStorage.getItem('userData')) : {};
    let role = userData.role;
    let roleName = '';
    if (language == 'en') {
      if (role === 1) {
        roleName = 'Level 1 - Visitor'
      } else if (role === 2) {
        roleName = 'Level 2 - Operator'
      } else if (role === 3) {
        roleName = 'Level 3 - Manager'
      } else if (role === 4) {
        roleName = 'Level 4 - Debugger'
      } else {
        roleName = 'Level 5 - Senior Debugger'
      }

    } else {
      if (role === 1) {
        roleName = '等级1-浏览访客'
      } else if (role === 2) {
        roleName = '等级2-操作人员'
      } else if (role === 3) {
        roleName = '等级3-管理人员'
      } else if (role === 4) {
        roleName = '等级4-调试人员'
      } else {
        roleName = '等级5-高级调试人员'
      }
    }
    // console.log(this.props)
    return (
      <div
        className={s['panel-content']}
      >
        <Row>
          <Col span={9}>{language == 'en' ? 'userName' : '当前用户'}：</Col>
          <Col span={8}>{userName}</Col>
          <Col span={7}>
            <Button className={s['opt-btn']} size="small" onClick={this.handleSwitch}>{language == 'en' ? 'logout' : '注销'}</Button>
          </Col>
        </Row>
        <Row>
          <Col span={9}>{language == 'en' ? 'rights' : '用户权限'}：</Col>
          <Col span={15}><Tag color="#87d068" style={tagStyle}>{roleName}</Tag></Col>
        </Row>
        <Row>
          <Col span={11}>
            <Button className={s['opt-btn']} size="small" onClick={this.showUserManagerModal}>{language == 'en' ? 'Manage' : '管理用户'}</Button>
          </Col>
          <Col offset={2} span={11}>
            <Button
              type="danger"
              size="small"
              style={{ width: '100%' }}
              onClick={this.showSwitchUserModal}
            >{language == 'en' ? 'Switch' : '切换用户'}</Button>
          </Col>
        </Row>
        <SwitchUserModal
          visible={this.state.isShowSwitchUserModal}
          handleHide={this.hideSwitchUserModal}
          initialize={this.props.initialize}
        />
        <UserManagerModal
          visible={this.state.isShowUserManagerModal}
          handleHide={this.hideUserManagerModal}
        />
        <Modal
          title={language == 'en' ? 'User verification' : "用户验证"}
          visible={this.state.isShowUserManagerLoginModal}
          onOk={this.handleOk}
          onCancel={this.hideUserManagerLoginModal}
          confirmLoading={this.state.loading}
          width={350}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label={language == 'en' ? 'Username' : "用户名"}
              hasFeedback
            >
              {getFieldDecorator('User', {
                initialValue: ''
              })(
                <Input disabled />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={language == 'en' ? 'Password' : "密码"}
              hasFeedback
            >
              {getFieldDecorator('Pwd', {
                initialValue: '',
                rules: [{
                  required: true, message: language == 'en' ? 'Please enter your password.' : '请填写用户密码!',
                }],
              })(
                <Input type="password" placeholder={language == 'en' ? 'Please enter your password' : "请输入密码"} />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const UserPanelView = Form.create({
  mapPropsToFields: (props) => {
    return {
      User: Form.createFormField({
        value: JSON.parse(localStorage.getItem('userInfo')).name
      })
    }
  }
})(UserPanel);

class UserPanelWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };

    this.handleVisibleChange = this.handleVisibleChange.bind(this);
    this.hide = this.hide.bind(this);

  }
  static get defaultProps() {
    return {
      userInfo: {}
    }
  }

  hide() {
    this.setState({
      visible: false
    });
  }

  handleVisibleChange(visible) {
    this.setState({
      visible
    })
  }

  render() {
    return (
      <Popover
        overlayClassName={togglePopoverClass}
        content={<UserPanelView
          initialize={this.props.initialize}
          switchUser={this.props.switchUser}
          hideWrap={this.hide}
        />}
        title={language == 'en' ? 'User Management' : '用户管理'}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        placement="rightTop"
      >
        <div style={{ display: localStorage.getItem('fireMode') && localStorage.getItem('fireMode') == 1 ? 'none' : '' }}><Icon type="user" style={{ marginRight: '5px' }} />{language == 'en' ? 'User Management' : '用户管理'}</div>
      </Popover>
    );
  }
}

export default UserPanelWrap
