import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import cx from 'classnames';
import s from './LoginForm.css';
import appConfig from '../../common/appConfig';

const language = appConfig.language;
const FormItem = Form.Item;

// 替换React.createClass为ES6 Class组件
class LoginForm extends React.Component {
  // 表单提交方法：用箭头函数自动绑定this，替代createClass的自动绑定
  handleSubmit = (e) => {
    localStorage.setItem('projectName_en', '');
    e.preventDefault();
    // 解构props中的form对象，保持原逻辑不变
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { accountManageConfig } = this.props;
        // 记住密码功能的逻辑判断，完全保留
        if (accountManageConfig != undefined && accountManageConfig.remember_pwd_enable != undefined && accountManageConfig.remember_pwd_enable === 0) {
          values.isRemember = false;
        }
        // 调用父组件的提交方法
        this.props.onSubmit(values);
      }
    });
  };

  render() {
    // 解构所有需要的props，和原逻辑完全一致
    const { loading, loginInfo, form, accountManageConfig, toggleIsRememeberBtn, loginBtnEne } = this.props;
    const { getFieldDecorator } = form;
    const { name, pwd, isRemember } = loginInfo;
    let btnStyle, remberStyle;

    // 记住密码复选框的样式控制逻辑
    if (accountManageConfig.remember_pwd_enable !== 1) {
      btnStyle = {
        marginTop: '13px'
      };
      remberStyle = {
        display: 'none'
      };
    }

    return (
      <Form
        onSubmit={this.handleSubmit}
        className={cx(s['content'], 'login-form-content')}
        id="site"
      >
        <FormItem>
          {getFieldDecorator('name', {
            initialValue: name,
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input 
              prefix={<Icon type="user" style={{ color: "#FFFFFF", marginLeft: "10px", fontSize: "17px" }} />} 
              onPressEnter={this.handleSubmit} 
              placeholder="Username" 
            />
          )}
        </FormItem>
        <FormItem className={s['username']}>
          {getFieldDecorator('pwd', {
            initialValue: pwd,
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input 
              prefix={<Icon type="lock" style={{ color: "#FFFFFF", marginLeft: "10px", fontSize: "18px" }} />} 
              type="password" 
              onPressEnter={this.handleSubmit} 
              placeholder="Password" 
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('isRemember', {
            valuePropName: 'checked',
            initialValue: isRemember,
            onChange: toggleIsRememeberBtn
          })(
            <Checkbox className={s['login-form-remberMiMa']} style={remberStyle}>
              <span id="rember">{language == 'en' ? 'Remember me' : '记住密码'}</span>
            </Checkbox>
          )}
          <Button 
            type="primary" 
            style={btnStyle} 
            htmlType="submit" 
            loading={loading} 
            className={s['login-form-btn']}
          >
            {language == 'en' ? 'Log in' : '登录'}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

// 保留antd Form.create()包装，确保表单功能正常
export default Form.create()(LoginForm);