import React from 'react';
import { Form, Icon, Input, Button, Checkbox, Modal } from 'antd';
import cx from 'classnames';

import s from './SwitchUserFormView.css';
import appConfig from '../../../common/appConfig';
const language = appConfig.language
const FormItem = Form.Item;

const LoginForm = Form.create()(
  class extends React.PureComponent {
    constructor(props) {
      super(props)

      this.handleSubmit = this.handleSubmit.bind(this)
    }
    componentDidMount() {
      const { setFieldsValue } = this.props.form

      setFieldsValue({
        name: '',
        pwd: '',
        isRemember: false,
        isOnline: localStorage.getItem('isOnline') == 1 ? true : false
      })

    }

    handleSubmit(e) {
      e.preventDefault();
      const { setFieldsValue } = this.props.form


      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.props.onSubmit(values);//将填写表单的值传给onSubmit
        }
      });
      setFieldsValue({
        name: '',
        pwd: '',
        isRemember: false
      })
    }
    render() {
      const { loading, loginInfo, form } = this.props;
      const { getFieldDecorator } = form;
      const name = JSON.parse(localStorage.getItem('accountManageConfig')) && JSON.parse(localStorage.getItem('accountManageConfig')).remember_pwd_enable === 0 ? '' : loginInfo.name;
      const pwd = JSON.parse(localStorage.getItem('accountManageConfig')) && JSON.parse(localStorage.getItem('accountManageConfig')).remember_pwd_enable === 0 ? '' : loginInfo.pwd;
      const isRemember = JSON.parse(localStorage.getItem('accountManageConfig')) && JSON.parse(localStorage.getItem('accountManageConfig')).remember_pwd_enable === 0 ? false : loginInfo.isRemember;

      return (
        <Form
          onSubmit={this.handleSubmit}
          className={cx(s['content'], 'login-form-content')}
        >
          <FormItem
          >
            {getFieldDecorator('name', {
              initialValue: '',
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input prefix={<Icon type="user" style={{ color: "#696E77" }} />} autoFocus onPressEnter={this.handleSubmit} placeholder="Username" />
            )}
          </FormItem>
          <FormItem
            className={s['username']}
          >
            {getFieldDecorator('pwd', {
              initialValue: '',
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: "#696E77" }} />} type="password" onPressEnter={this.handleSubmit} placeholder="Password" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('isRemember', {
              valuePropName: 'checked',
              initialValue: '',
              onChange: this.props.toggleIsRememeber
            })(
              JSON.parse(localStorage.getItem('accountManageConfig')) && JSON.parse(localStorage.getItem('accountManageConfig')).auto_log_out && JSON.parse(localStorage.getItem('accountManageConfig')).remember_pwd_enable === 0 ?
                <Checkbox style={{ display: "none" }} >{language == 'en' ? ' Remember Password ' : '记住密码'}</Checkbox>
                :
                <Checkbox>{language == 'en' ? 'Remember Password ' : '记住密码'}</Checkbox>
            )}
            
            {getFieldDecorator('isOnline', {
              valuePropName: 'checked',
              initialValue: '',
            })(
              <Checkbox>{language == 'en' ? 'Keep Logged In ' : '保持登录'}</Checkbox>
            )}
            <Button type="primary" htmlType="submit" loading={loading} className={s['login-form-btn']}>
              {language == 'en' ? 'Login' : '登录'}
            </Button>
          </FormItem>
        </Form>
      );
    }
  }
);

export default LoginForm