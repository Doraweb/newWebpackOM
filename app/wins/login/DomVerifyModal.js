/**
 * dom云验证框
 */
import React from 'react';
import { Form, Modal, Input, Button, message, Icon } from 'antd';
import s from './ConfigModal.css';
import appConfig from '../../common/appConfig';
import httpTo from '../../common/httpTo';
import { closeLoginWindow } from '../../core/cmdRenderer';


const language = appConfig.language
const FormItem = Form.Item;

class DomVerifyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleVerify = this.handleVerify.bind(this);
    this.close = this.close.bind(this) 
    this.closeWindow = this.closeWindow.bind(this)
  }
  handleVerify(){
    let isRemember = false
    const {name, password}=this.props
    let pwd = password
    let _this = this
    let serverUrl = localStorage.getItem('serverUrl')
    let serverUrlProjId = serverUrl.slice(serverUrl.length-3,serverUrl.length)
    let domName='',domPwd=''
 
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.accountManageConfig != undefined && this.accountManageConfig.remember_pwd_enable != undefined && this.accountManageConfig.remember_pwd_enable === 0) {
          isRemember = false
        }
        domName = values.name
        domPwd = values.pwd
      }
    });
    let timer = setTimeout(()=>{
      _this.props.onSubmitLogin({name,pwd,isRemember})
      _this.props.hideDomVerify()
    },30000)
    let ip = "http://47.100.17.99"
    if(localStorage.getItem('serverOmd')=="best"){
      ip = "http://106.14.226.254"
    }
    httpTo.post(`${ip}/api/login/2`, {
      name: domName,
      pwd: domPwd,
      agent: {
        // TODO post truely user browser info
        'screen': '1920 x 1080',
        'browser': 'Chrome',
        'browserVersion': '55.0.2883.87',
        'mobile': false,
        'os': 'Windows',
        'osVersion': 'NT 4.0',
      }
    }).then(
      data => {
        clearTimeout(timer);
        if (data.status== true) {
          let projects = [] //保存所有项目的容器
          try{
            data.projects.forEach( (item,i)=>{
              //判断如果输入的ip后三位在云端账号返回的项目id一致，则进入OM登陆验证
              if (item.id === Number(serverUrlProjId)) {
                localStorage.setItem('projectName_en',item.name_en)
                localStorage.setItem('cloudUser', JSON.stringify({ cloudUserName: domName, cloudUserId: data.id }))
                _this.props.onSubmitLogin({name,pwd,isRemember})
                _this.props.hideDomVerify()
                throw new Error('验证成功，跳出')
              }else {
                if (i === data.projects.length-1){
                    Modal.error({
                      title: '验证失败',
                      content: '该云端账号无权限访问当前项目'
                    })
                }
              }
            })
          } catch(e) {
            console.log('dom验证成功')
          }
        }else {
          Modal.error({
            title: '验证失败',
            content: data.msg
          })
        }
        //this.toggleLoading();
      } 
    ).catch(
      err => {
        Modal.error({
          title: '验证失败',
          content: "验证请求返回错误"
        })
        if (this.state.loading) {
          //this.toggleLoading();
        }
      }
    );
  }

  close(){
    this.props.handleHide()
    this.props.form.resetFields()
  }
  closeWindow(){
    closeLoginWindow();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
        <Modal
          title={language == 'en'? 'Verification of DOM cloud account': 'DOM云端账号验证'}
          width={450}
          maskClosable={false}
          visible={this.props.visible}
          onOk={this.handleVerify}
          onCancel={this.props.hideDomVerify}
          okText={language == 'en'? 'OK': '确认'}
          cancelText={language == 'en'? 'Cancel': '取消'}
        >
          <Form>
            <FormItem style={{marginBottom:0,marginTop:'-5px'}}>
            <div style={{color:"#2EA1F7",fontSize:'13px'}}>
            <p style={{marginBottom:0}}>{language == 'en'? 'Since you are using the DOM cloud service feature, it is necessary to authenticate your DOM cloud account.': '由于您使用的是DOM云服务功能,因此需要对您的DOM云账号进行认证'}</p>
            <p>{language == 'en'? 'Please enter your DOM cloud account and password below.': '请在下面输入DOM云账号及密码'}</p>
            </div>
            </FormItem>
            <FormItem style={{marginBottom:'15px'}}>
              {getFieldDecorator('name', {
                initialValue: '',
                rules: [{ required: true, message: 'Please input your username!' }],
              })(
                <Input prefix={<Icon type="user" style={{ color: "#696E77" }} />} onPressEnter={this.handleVerify} placeholder="Username" />
              )}
            </FormItem>
            <FormItem 
              style={{marginBottom:'0px'}}
              className={s['username']}
            >
              {getFieldDecorator('pwd', {
                initialValue: '',
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: "#696E77" }}/>} type="password" onPressEnter={this.handleVerify} placeholder="Password" />
              )}
            </FormItem>
        </Form>
      </Modal>   
    );
  }
}
const DomVerifyModal  = Form.create()(DomVerifyForm);
export default DomVerifyModal
